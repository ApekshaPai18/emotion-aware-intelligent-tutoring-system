import requests

API_BASE = "http://localhost:8000/api/v1"

# Create test user
user_res = requests.post(f"{API_BASE}/users/", json={
    "username": "final_test",
    "email": "final@test.com"
})
user_id = user_res.json()["id"]
print(f"User ID: {user_id}")

# Create session
session_res = requests.post(f"{API_BASE}/sessions/", json={"user_id": user_id})
session_id = session_res.json()["session_id"]
print(f"Session ID: {session_id}")

# Record interaction with algorithm field
interaction_res = requests.post(f"{API_BASE}/interactions/", json={
    "user_id": user_id,
    "session_id": session_id,
    "lesson_id": "1",
    "question_id": "q1",
    "is_correct": True,
    "detected_emotion": "happy",
    "emotion_confidence": 0.85,
    "rl_action": "normal",
    "streak": 1,
    "repetition_count": 0,
    "algorithm": "q_learning"
})

print(f"Status: {interaction_res.status_code}")
if interaction_res.status_code == 200:
    print("✅ Interaction saved successfully!")
    
    # Check dashboard
    dash_res = requests.get(f"{API_BASE}/dashboard/{user_id}")
    if dash_res.status_code == 200:
        data = dash_res.json()
        print(f"Score: {data['user']['total_score']}")
else:
    print(f"Error: {interaction_res.text}")