from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
import os
from dotenv import load_dotenv

from rag_engine import RAGEngine

# Load environment variables
load_dotenv()

app = FastAPI(
    title="AI Customer Support Service",
    version="1.0.0"
)

# Add CORS middleware to allow React frontend to connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize RAG engine
rag_engine = RAGEngine()

# ============ REQUEST/RESPONSE MODELS ============

class QueryRequest(BaseModel):
    query: str
    ticket_id: Optional[int] = None
    customer_id: Optional[int] = None

class AIResponse(BaseModel):
    response: str
    confidence_score: float
    sources: List[str]
    category: Optional[str] = None
    should_escalate: bool
    success: bool

class CategorizationRequest(BaseModel):
    description: str
    ticket_id: Optional[int] = None

class CategorizationResponse(BaseModel):
    category: str
    priority: str
    confidence: float

# ============ API ENDPOINTS ============

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "AI Customer Support Service",
        "version": "1.0.0"
    }

@app.post("/api/ai/query", response_model=AIResponse)
async def generate_ai_response(request: QueryRequest):
    """
    Generate AI response for customer query using RAG
    
    Args:
        request: QueryRequest containing customer query
    
    Returns:
        AIResponse with generated answer, confidence score, and sources
    """
    try:
        # Generate response using RAG engine
        result = rag_engine.get_response(request.query)
        
        # Determine if should escalate to human agent
        should_escalate = result["confidence_score"] < 0.75
        
        return AIResponse(
            response=result["response"],
            confidence_score=result["confidence_score"],
            sources=result["sources"],
            should_escalate=should_escalate,
            success=result["success"]
        )
    
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error generating AI response: {str(e)}"
        )

@app.post("/api/ai/categorize", response_model=CategorizationResponse)
async def categorize_ticket(request: CategorizationRequest):
    """
    Automatically categorize ticket based on description
    
    Args:
        request: CategorizationRequest with ticket description
    
    Returns:
        CategorizationResponse with category, priority, and confidence
    """
    try:
        result = rag_engine.categorize_ticket(request.description)
        
        return CategorizationResponse(
            category=result["category"],
            priority=result["priority"],
            confidence=result["confidence"]
        )
    
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error categorizing ticket: {str(e)}"
        )

@app.post("/api/ai/reload-kb")
async def reload_knowledge_base():
    """
    Reload the knowledge base from files
    
    Returns:
        Success message with KB size
    """
    try:
        result = rag_engine.reload_knowledge_base()
        return {
            "message": "Knowledge base reloaded successfully",
            "kb_size": result["kb_size"]
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error reloading knowledge base: {str(e)}"
        )

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
