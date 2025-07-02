"""FastAPI application for HandyWriterz backend."""

import asyncio
import json
import logging
import os
import time
import uuid
from contextlib import asynccontextmanager
from typing import Dict, Any, Optional, List

import redis
import uvicorn
from fastapi import FastAPI, HTTPException, UploadFile, File, Form, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from langchain_core.messages import HumanMessage
from pydantic import BaseModel

from agent.handywriterz_graph import handywriterz_graph
from agent.handywriterz_state import HandyWriterzState
from agent.base import UserParams

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Redis client for SSE
redis_client = redis.Redis.from_url(os.getenv("REDIS_URL", "redis://localhost:6379"), decode_responses=True)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manage application lifespan."""
    logger.info("Starting HandyWriterz backend...")
    
    # Test Redis connection
    try:
        redis_client.ping()
        logger.info("Redis connection successful")
    except Exception as e:
        logger.error(f"Redis connection failed: {e}")
    
    yield
    
    logger.info("Shutting down HandyWriterz backend...")


# Create FastAPI app
app = FastAPI(
    title="HandyWriterz API",
    description="AI-Powered Academic Writing Assistant",
    version="1.0.0",
    lifespan=lifespan
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],  # Add your frontend URLs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Pydantic models
class WritingRequest(BaseModel):
    """Request model for academic writing."""
    prompt: str
    user_params: Dict[str, Any]
    auth_token: Optional[str] = None
    payment_transaction_id: Optional[str] = None
    uploaded_file_urls: List[str] = []


class WritingResponse(BaseModel):
    """Response model for writing request."""
    conversation_id: str
    status: str
    message: str


class HealthResponse(BaseModel):
    """Health check response."""
    status: str
    timestamp: float
    version: str


# Health check endpoint
@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint."""
    return HealthResponse(
        status="healthy",
        timestamp=time.time(),
        version="1.0.0"
    )


# Main writing endpoint
@app.post("/api/write", response_model=WritingResponse)
async def start_writing(request: WritingRequest):
    """Start the academic writing process."""
    try:
        # Generate conversation ID
        conversation_id = str(uuid.uuid4())
        
        # Validate user parameters
        try:
            user_params = UserParams(**request.user_params)
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Invalid user parameters: {e}")
        
        # Create initial state
        initial_state = HandyWriterzState(
            conversation_id=conversation_id,
            user_id="",  # Will be set by user_intent node
            wallet_address=None,
            messages=[HumanMessage(content=request.prompt)],
            user_params=user_params.dict(),
            uploaded_docs=[],
            outline=None,
            research_agenda=[],
            search_queries=[],
            raw_search_results=[],
            filtered_sources=[],
            verified_sources=[],
            draft_content=None,
            current_draft=None,
            revision_count=0,
            evaluation_results=[],
            evaluation_score=None,
            turnitin_reports=[],
            turnitin_passed=False,
            formatted_document=None,
            learning_outcomes_report=None,
            download_urls={},
            current_node=None,
            workflow_status="pending",
            error_message=None,
            retry_count=0,
            max_iterations=5,
            enable_tutor_review=False,
            start_time=time.time(),
            end_time=None,
            processing_metrics={},
            auth_token=request.auth_token,
            payment_transaction_id=request.payment_transaction_id,
            uploaded_files=[{"url": url} for url in request.uploaded_file_urls]
        )
        
        # Start the workflow asynchronously
        asyncio.create_task(execute_writing_workflow(conversation_id, initial_state))
        
        return WritingResponse(
            conversation_id=conversation_id,
            status="started",
            message="Academic writing process initiated. Connect to the stream endpoint for real-time updates."
        )
        
    except Exception as e:
        logger.error(f"Failed to start writing process: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# SSE streaming endpoint
@app.get("/api/stream/{conversation_id}")
async def stream_updates(conversation_id: str):
    """Stream real-time updates for a conversation."""
    
    async def generate_events():
        """Generate SSE events from Redis pub/sub."""
        pubsub = redis_client.pubsub()
        channel = f"sse:{conversation_id}"
        
        try:
            await pubsub.subscribe(channel)
            logger.info(f"Subscribed to SSE channel: {channel}")
            
            # Send initial connection event
            yield f"data: {json.dumps({'type': 'connected', 'conversation_id': conversation_id})}\n\n"
            
            # Listen for messages
            async for message in pubsub.listen():
                if message["type"] == "message":
                    try:
                        # Parse the message data safely
                        event_data = json.loads(message["data"])  # Fixed security vulnerability
                        yield f"data: {json.dumps(event_data)}\n\n"
                        
                        # Break if workflow is complete or failed
                        if event_data.get("type") in ["workflow_complete", "workflow_failed"]:
                            break
                            
                    except Exception as e:
                        logger.error(f"Error processing SSE message: {e}")
                        continue
                        
        except Exception as e:
            logger.error(f"SSE stream error: {e}")
            yield f"data: {json.dumps({'type': 'error', 'message': str(e)})}\n\n"
        
        finally:
            await pubsub.unsubscribe(channel)
            logger.info(f"Unsubscribed from SSE channel: {channel}")
    
    return StreamingResponse(
        generate_events(),
        media_type="text/plain",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "Content-Type": "text/event-stream",
        }
    )


# File upload endpoint
@app.post("/api/upload")
async def upload_file(file: UploadFile = File(...)):
    """Upload a file for processing."""
    try:
        # Validate file type
        allowed_types = [".pdf", ".docx", ".txt", ".md"]
        file_extension = os.path.splitext(file.filename)[1].lower()
        
        if file_extension not in allowed_types:
            raise HTTPException(
                status_code=400,
                detail=f"Unsupported file type: {file_extension}. Allowed types: {allowed_types}"
            )
        
        # Read file content
        content = await file.read()
        
        # In production, you would upload to R2/S3 and return the URL
        # For now, return a mock URL
        file_url = f"https://temp-storage.com/{uuid.uuid4()}-{file.filename}"
        
        return {
            "filename": file.filename,
            "size": len(content),
            "type": file.content_type,
            "url": file_url,
            "status": "uploaded"
        }
        
    except Exception as e:
        logger.error(f"File upload failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# Get conversation status
@app.get("/api/conversation/{conversation_id}")
async def get_conversation_status(conversation_id: str):
    """Get the current status of a conversation."""
    try:
        # In production, you would query the database for conversation status
        # For now, return a mock status
        return {
            "conversation_id": conversation_id,
            "status": "in_progress",
            "current_node": "writer",
            "progress": 65.0,
            "estimated_completion": "2 minutes"
        }
        
    except Exception as e:
        logger.error(f"Failed to get conversation status: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# Download document endpoint
@app.get("/api/download/{conversation_id}/{document_type}")
async def download_document(conversation_id: str, document_type: str):
    """Download a generated document."""
    try:
        # Validate document type
        allowed_types = ["docx", "txt", "lo_report"]
        if document_type not in allowed_types:
            raise HTTPException(status_code=400, detail=f"Invalid document type: {document_type}")
        
        # In production, you would retrieve the document from storage
        # For now, return a mock response
        raise HTTPException(status_code=404, detail="Document not found")
        
    except Exception as e:
        logger.error(f"Document download failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# Webhook endpoints
@app.post("/api/webhook/dynamic")
async def dynamic_webhook(payload: Dict[str, Any]):
    """Handle Dynamic.xyz webhooks for payment verification."""
    try:
        # Process Dynamic.xyz webhook
        event_type = payload.get("type")
        
        if event_type == "payment.completed":
            # Handle successful payment
            logger.info(f"Payment completed: {payload}")
            
        elif event_type == "user.authenticated":
            # Handle user authentication
            logger.info(f"User authenticated: {payload}")
        
        return {"status": "received"}
        
    except Exception as e:
        logger.error(f"Dynamic webhook processing failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/webhook/turnitin")
async def turnitin_webhook(payload: Dict[str, Any]):
    """Handle Turnitin webhooks for plagiarism reports."""
    try:
        # Process Turnitin webhook
        submission_id = payload.get("submission_id")
        status = payload.get("status")
        
        if status == "completed":
            # Handle completed plagiarism check
            logger.info(f"Turnitin check completed for submission: {submission_id}")
        
        return {"status": "received"}
        
    except Exception as e:
        logger.error(f"Turnitin webhook processing failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# Background workflow execution
async def execute_writing_workflow(conversation_id: str, initial_state: HandyWriterzState):
    """Execute the writing workflow in the background."""
    try:
        logger.info(f"Starting workflow for conversation: {conversation_id}")
        
        # Broadcast workflow start
        redis_client.publish(
            f"sse:{conversation_id}",
            str({
                "type": "workflow_start",
                "timestamp": time.time(),
                "data": {"conversation_id": conversation_id}
            })
        )
        
        # Execute the LangGraph workflow
        config = {"configurable": {"thread_id": conversation_id}}
        
        async for chunk in handywriterz_graph.astream(initial_state, config):
            # Broadcast workflow progress
            redis_client.publish(
                f"sse:{conversation_id}",
                str({
                    "type": "workflow_progress", 
                    "timestamp": time.time(),
                    "data": chunk
                })
            )
        
        # Broadcast workflow completion
        redis_client.publish(
            f"sse:{conversation_id}",
            str({
                "type": "workflow_complete",
                "timestamp": time.time(),
                "data": {"conversation_id": conversation_id, "status": "completed"}
            })
        )
        
        logger.info(f"Workflow completed for conversation: {conversation_id}")
        
    except Exception as e:
        logger.error(f"Workflow execution failed for {conversation_id}: {e}")
        
        # Broadcast workflow failure
        redis_client.publish(
            f"sse:{conversation_id}",
            str({
                "type": "workflow_failed",
                "timestamp": time.time(),
                "data": {"conversation_id": conversation_id, "error": str(e)}
            })
        )


if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )