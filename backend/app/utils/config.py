"""
Configuration management for the application.
Loads settings from .env file with proper typing.
"""
from pydantic_settings import BaseSettings
from pydantic import ConfigDict
from typing import Optional
import os

class Settings(BaseSettings):
    # App Settings
    project_name: str = "Emotion-Aware Intelligent Tutoring System"
    version: str = "1.0.0"
    debug: bool = True
    secret_key: "RSpGSEbZdFkHOzIz6nzf-BUmAj_j3YZ65Qxbe_KNFL4"
    database_url: str
    
    # Emotion Detection
    emotion_confidence_threshold: float = 0.7
    emotion_capture_interval: int = 3
    
    # RL Agent Settings
    learning_rate: float = 0.1
    discount_factor: float = 0.95
    exploration_rate: float = 0.2
    exploration_decay: float = 0.995
    min_exploration_rate: float = 0.01
    q_table_path: str = "./data/rl_model/q_table.npy"
    
    # WebSocket
    ws_heartbeat_interval: int = 30
    
    model_config = ConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False
    )

# Create global settings object
settings = Settings()

# For debugging - print loaded settings (remove in production)
if settings.debug:
    print(f"✅ Configuration loaded: {settings.project_name} v{settings.version}")
    print(f"📁 Database: {settings.database_url}")
