import requests
import json

# Test backend connection
base_url = "http://localhost:8000"

# Test health endpoint
try:
    response = requests.get(f"{base_url}/health")
    print(f"Health check: {response.status_code}")
    print(response.json())
except Exception as e:
    print(f"Backend not reachable: {e}")
    exit()

# Test user creation
user_data = {
    "username": "testuser",
    "email": "test@example.com"
}

try:
    response = requests.post(f"{base_url}/api/v1/users/", json=user_data)
    print(f"\nCreate user: {response.status_code}")
    if response.status_code == 200:
        user = response.json()
        print(f"User created: {user}")
        user_id = user['id']
        
        # Test session creation
        response = requests.post(f"{base_url}/api/v1/sessions/?user_id={user_id}")
        print(f"\nCreate session: {response.status_code}")
        print(response.json())
    else:
        print(response.json())
except Exception as e:
    print(f"Error: {e}")