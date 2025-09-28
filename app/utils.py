from pydantic import BaseModel
import qdrant_client
from llama_index.vector_stores.qdrant import QdrantVectorStore
from llama_index.embeddings.openai import OpenAIEmbedding
from llama_index.llms.openai import OpenAI
from llama_index.core.schema import Document
from llama_index.core import SimpleDirectoryReader
from llama_index.core import (
    VectorStoreIndex,
    Settings,
)
from dataclasses import dataclass
import os

import pymupdf4llm
import re

key = os.environ['OPENAI_API_KEY']

class Input(BaseModel):
    query: str
    file_path: str
    ai_sectioning: bool = True

@dataclass
class Citation:
    source: str
    text: str

class QueryLawReq(BaseModel):
    query: str

class Output(BaseModel):
    query: str
    response: str
    citations: list[Citation]

class CreateDocumentsRequest(BaseModel):
    file_path: str
    ai_sectioning: bool = False

class DocumentService:

    """
    Update this service to load the pdf and extract its contents.
    The example code below will help with the data structured required
    when using the QdrantService.load() method below. Note: for this
    exercise, ignore the subtle difference between llama-index's 
    Document and Node classes (i.e, treat them as interchangeable).

    # example code
    def create_documents() -> list[Document]:

        docs = [
            Document(
                metadata={"Section": "Law 1"},
                text="Theft is punishable by hanging",
            ),
            Document(
                metadata={"Section": "Law 2"},
                text="Tax evasion is punishable by banishment.",
            ),
        ]

        return docs

     """
    def create_documents(self, file_path: str, ai_sectioning: bool = False) -> list[Document]:
        
        # Text extaction from pdf -> to markdown + clean up
        md_text = pymupdf4llm.to_markdown(file_path)
        clean_text = md_text.replace("\n", "")
        clean_text = clean_text.split("Citations:")[0]

        
        # AI-based sectioning if requested
        if ai_sectioning:
            return self._create_documents_with_ai(clean_text)
        
        # Use regex-based sectioning (original logic)
        return self._create_documents_with_regex(clean_text)

    def _create_documents_with_ai(self, text: str) -> list[Document]:
        import json
        llm = OpenAI(api_key=key, model="gpt-3.5-turbo")
        

        prompt = f"""
            You are a legal document parser. Analyze the following legal text and divide it into logical sections.

            For each section identified:
            1. Give it a descriptive title
            2. Assign it a section number (starting from 1)
            3. Include all relevant content for that section

            Return your response as a JSON array where each object has:
            - "section_number": string (e.g., "1", "2", "3")
            - "title": string (descriptive title for the section)
            - "content": string (the full text content for this section)

            Make sure each section is complete and self-contained. If there are subsections or numbered items, keep them together with their parent section.

            Legal text to analyze:
            {text}

            Respond with only the JSON array, no other text.
            """
        
        try:
            # Create the full prompt with system message
            full_prompt = f"""You are a legal document parser that returns only valid JSON.

            {prompt}"""
            
            # Use LlamaIndex OpenAI LLM
            response = llm.complete(
                full_prompt,
                temperature=0.1,  
                max_tokens=4000
            )
            
            ai_response = response.text.strip()

            sections_data = json.loads(ai_response)
            
            # Convert AI response to Document objects
            documents = []
            for section in sections_data:
                doc = Document(
                    metadata={
                        "Section": f"Law {section['section_number']}",
                        "Title": section['title'],
                        "Section_Number": section['section_number'],
                        "AI_Generated": True
                    },
                    text=f"{section['section_number']}. {section['title']}: {section['content']}"
                )
                documents.append(doc)
            
            return documents
            
        except Exception as e:
            print(f"AI sectioning failed: {e}")
            print("Falling back to regex-based sectioning...")
            
            # Fallback to regex-based sectioning if AI fails
            return self._create_documents_with_regex(text)

    def _create_documents_with_regex(self, clean_text: str) -> list[Document]:

        # Regex for section titles (bold (**) number and title)
        section_pattern = r'\*\*(\d+)\.\*\* \*\*([^*]+)\*\*'
        
        #split into [n, nTitle, nContent, ...]
        sections = re.split(section_pattern, clean_text)
        
        documents = []
        
        # The split creates: [before_first_match, num1, title1, content1, num2, title2, content2, ...]
        # We skip the first element (content before any section) and process in groups of 3
        for i in range(1, len(sections), 3):
            if i + 2 < len(sections):
                section_num = sections[i]
                section_title = sections[i + 1].strip()
                section_content = sections[i + 2].strip()
                
                # Create a document for each main section
                # Include the section header in the text for context
                full_text = f"{section_num}. {section_title}: {section_content}"
                
                doc = Document(
                    metadata={
                        "Section": f"Law {section_num}",
                        "Title": section_title,
                        "Section_Number": section_num
                    },
                    text=full_text
                )
                documents.append(doc)
        
        # If no sections were found using the main pattern, try to split by numbered subsections
        if not documents:
            # Fallback: split by numbered subsections (1.1., 2.1., etc.)
            subsection_pattern = r'(\d+\.\d+\.)'
            parts = re.split(subsection_pattern, clean_text)
            
            current_section = ""
            for i in range(1, len(parts), 2):
                if i + 1 < len(parts):
                    subsection_num = parts[i]
                    subsection_content = parts[i + 1].strip()
                    
                    doc = Document(
                        metadata={
                            "Section": f"Section {subsection_num}",
                            "Subsection_Number": subsection_num
                        },
                        text=f"{subsection_num} {subsection_content}"
                    )
                    documents.append(doc)
        
        return documents

class QdrantService:
    def __init__(self, k: int = 2):
        self.index = None
        self.k = k
    
    def connect(self) -> None:
        client = qdrant_client.QdrantClient(location=":memory:")
                
        vstore = QdrantVectorStore(client=client, collection_name='temp')

        # Configure global settings (replaces ServiceContext)
        Settings.embed_model = OpenAIEmbedding()
        Settings.llm = OpenAI(api_key=key, model="gpt-4")

        self.index = VectorStoreIndex.from_vector_store(
            vector_store=vstore
            )

    def load(self, docs = list[Document]):
        self.index.insert_nodes(docs)
    
    def query(self, query_str: str) -> Output:
        """
        Query the index using CitationQueryEngine to get responses with citations.
        Returns a pydantic Output object with the response and source citations.
        """
        from llama_index.core.query_engine import CitationQueryEngine
        
        # Create citation query engine with configurable parameters
        query_engine = CitationQueryEngine.from_args(
            self.index,
            similarity_top_k=self.k,
            citation_chunk_size=512,
        )
        
        # Execute the query
        response = query_engine.query(query_str)
        
        # Extract citations from source nodes
        citations = []
        for i, source_node in enumerate(response.source_nodes):
            # Get metadata for source identification
            metadata = source_node.node.metadata
            source_name = metadata.get("Section", f"Source {i+1}")
            
            # Get the actual text content
            citation_text = source_node.node.get_text()
            
            # Create citation object
            citation = Citation(
                source=source_name,
                text=citation_text
            )
            citations.append(citation)
        
        # Create output object
        output = Output(
            query=query_str,
            response=str(response),  # This contains the answer with [1], [2] citations
            citations=citations
        )
        
        return output
       

if __name__ == "__main__":
    # Example workflow
    doc_serivce = DocumentService() # implemented
    docs = doc_serivce.create_documents("docs/laws.pdf", ai_sectioning=False) #implemented

    index = QdrantService() # implemented
    index.connect() # implemented
    #index.load(docs) handled inside create_documents# implemented

    query = index.query("what do the laws say about women?") # NOT implemented
    print(query)





