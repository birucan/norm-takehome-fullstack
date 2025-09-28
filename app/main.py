from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from app.utils import Output, Input, QueryLawReq, DocumentService, CreateDocumentsRequest, QdrantService
from app.utils import key

app = FastAPI()

# Add CORS middleware to allow frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Frontend URLs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


#We can only query with a set of persisted or just added documents so using this and then 
#a query with a saved document is out of scope for now, unless we persist the documents either in front or back
@app.post("/create_documents", response_model=None)
def create_documents(request: CreateDocumentsRequest):
    doc_serivce = DocumentService()
    docs = doc_serivce.create_documents(request.file_path, request.ai_sectioning)
    index = QdrantService() # implemented
    index.connect() # implemented
    index.load(docs)
    return docs

@app.post("/query", response_model=Output)
def query(query: Input):
    doc_serivce = DocumentService()
    docs = doc_serivce.create_documents(query.file_path, query.ai_sectioning)
    index = QdrantService()
    index.connect()
    index.load(docs)
    output = index.query(query.query)
    return output


"""
Please create an endpoint that accepts a query string, e.g., "what happens if I steal 
from the Sept?" and returns a JSON response serialized from the Pydantic Output class.
"""