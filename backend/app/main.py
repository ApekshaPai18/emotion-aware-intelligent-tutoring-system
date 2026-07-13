"""
Main FastAPI application entry point.
Sets up the application, middleware, and routes.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import logging

from .api.routes import router
from .models.database import init_db, engine
from .utils.config import settings

# Configure logging
logging.basicConfig(
    level=logging.INFO if not settings.debug else logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Create FastAPI app FIRST
app = FastAPI(
    title=settings.project_name,
    version=settings.version,
    debug=settings.debug
)

# ✅ CORS MIDDLEWARE - MUST BE ADDED BEFORE ROUTERS
# https://fastapi.tiangolo.com/tutorial/cors/
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://emotion-aware-intelligent-tutoring.vercel.app",
        "https://emotion-aware-intelligent-tutoring-g01t4g686.vercel.app",
        "https://emotion-aware-intelligent-tutoring.onrender.com",
        "*",  # ✅ TEMPORARY: Allows all origins for testing
    ],
    allow_credentials=True,
    allow_methods=["*"],  # ✅ Allows all HTTP methods (GET, POST, PUT, DELETE, OPTIONS)
    allow_headers=["*"],  # ✅ Allows all headers
)

# ✅ Initialize database AFTER app is created
init_db()

# ✅ Add routers AFTER CORS middleware
app.include_router(router, prefix="/api/v1")

@app.get("/")
async def root():
    """Root endpoint - API health check"""
    return {
        "message": f"Welcome to {settings.project_name}",
        "version": settings.version,
        "status": "operational"
    }

@app.get("/health")
async def health_check():
    """Health check endpoint for monitoring"""
    return {
        "status": "healthy",
        "database": "connected"
    }

# Startup event
@app.on_event("startup")
async def startup_event():
    logger.info(f"Starting {settings.project_name} v{settings.version}")
    logger.info(f"Debug mode: {settings.debug}")

# Shutdown event
@app.on_event("shutdown")
async def shutdown_event():
    logger.info("Shutting down application")
    engine.dispose()

# Error handler
@app.exception_handler(Exception)
async def generic_exception_handler(request, exc):
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"message": "An internal server error occurred"}
    )
