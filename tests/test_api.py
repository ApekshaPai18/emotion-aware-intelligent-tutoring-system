"""
Quick API tests to verify endpoints are working.
Run this after starting the server.
"""
import httpx
import asyncio
import json

async def test_api():
    """Test all API endpoints"""
    base_url = "http://localhost:8000"
    
    async with httpx.AsyncClient() as client:
        # Test root
        response = await client.get(f"{base_url}/")
        print(f"Root: {response.json()}")
        
        # Test health
        response = await client.get(f"{base_url}/health")
        print(f"Health: {response.json()}")
        
        # Create user
        user_data = {
            "username": "testuser",
            "email": "test@example.com"
        }
        response = await client.post(f"{base_url}/api/v1/users/", json=user_data)
        print(f"Create user: {response.json()}")
        user_id = response.json()["id"]
        
        # Create session
        response = await client.post(f"{base_url}/api/v1/sessions/?user_id={user_id}")
        print(f"Create session: {response.json()}")
        
        # Test RL action
        state_data = {
            "user_id": user_id,
            "session_id": 1,
            "current_lesson": "lesson_1",
            "last_question_correct": None,
            "streak": 0,
            "repetition_count": 0,
            "current_emotion": "neutral",
            "emotion_confidence": 0.9,
            "completed_lessons": []
        }
        response = await client.post(f"{base_url}/api/v1/get-next-action/", json=state_data)
        print(f"RL Action: {response.json()}")

if __name__ == "__main__":
    asyncio.run(test_api())