"""
Server runner script.
"""
import uvicorn
import sys
import os

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.utils.config import settings

if __name__ == "__main__":
    print("🚀 Starting Emotion-Aware Intelligent Tutoring System")
    print(f"📡 Server will run at http://localhost:8000")
    print(f"📚 API docs at http://localhost:8000/docs")
    print(f"🔧 Debug mode: {settings.debug}")
    print("-" * 50)
    port = int(os.environ.get("PORT", 8000))
    print(f"Starting server on 0.0.0.0:{port}")
    
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=port,
        reload=settings.debug,
        log_level="info" if not settings.debug else "debug"
    )