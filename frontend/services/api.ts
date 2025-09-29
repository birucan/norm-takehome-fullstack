// API service functions for the legal document application

const API_BASE_URL = 'http://localhost:8000';

export interface CreateDocumentsRequest {
  file_path: string;
  ai_sectioning: boolean;
}

export interface QueryRequest {
  query: string;
  file_path: string;
}

export interface Citation {
  source: string;
  text: string;
}

export interface QueryResponse {
  query: string;
  response: string;
  citations: Citation[];
}

/**
 * Creates documents from a PDF file with optional AI sectioning
 */
export async function createDocuments(filePath: string, aiSectioning: boolean): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/create_documents`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        file_path: filePath, 
        ai_sectioning: aiSectioning 
      }),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Documents created:', data);
    return true;
  } catch (error) {
    console.error('Error in createDocuments:', error);
    throw error;
  }
}

export async function queryLaw(query: string, filePath: string, aiSectioning: boolean): Promise<QueryResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        query: query,
        file_path: filePath,
        ai_sectioning: aiSectioning
      }),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Query response:', data);
    return data;
  } catch (error) {
    console.error('Error in queryLaw:', error);
    throw error;
  }
}
