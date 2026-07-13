"""
Database models using SQLAlchemy ORM.
"""
from sqlalchemy import create_engine, Column, Integer, String, Float, Boolean, DateTime, JSON, ForeignKey, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from datetime import datetime

from ..utils.config import settings

# ✅ FIX: Auto-detect SQLite vs PostgreSQL
connect_args = {}
if settings.database_url and settings.database_url.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

engine = create_engine(
    settings.database_url,
    connect_args=connect_args
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    role = Column(String, default="user")  # "user" or "admin"
    created_at = Column(DateTime, default=datetime.utcnow)
    last_active = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    sessions = relationship("LearningSession", back_populates="user", cascade="all, delete-orphan")
    achievements = relationship("UserAchievement", back_populates="user", cascade="all, delete-orphan")

class LearningSession(Base):
    __tablename__ = "learning_sessions"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    topic = Column(String, default="python_basics")
    start_time = Column(DateTime, default=datetime.utcnow)
    end_time = Column(DateTime, nullable=True)
    total_questions = Column(Integer, default=0)
    correct_answers = Column(Integer, default=0)
    total_attempts = Column(Integer, default=0)  # Track total attempts
    
    # Relationships
    user = relationship("User", back_populates="sessions")
    interactions = relationship("UserInteraction", back_populates="session", cascade="all, delete-orphan")

class UserInteraction(Base):
    __tablename__ = "user_interactions"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    session_id = Column(Integer, ForeignKey("learning_sessions.id"))
    timestamp = Column(DateTime, default=datetime.utcnow)
    
    current_lesson_id = Column(String)
    question_id = Column(String, nullable=True)
    
    is_correct = Column(Boolean, nullable=True)
    attempts = Column(Integer, default=1)  # Track attempts per question
    streak = Column(Integer, default=0)
    repetition_count = Column(Integer, default=0)
    
    detected_emotion = Column(String)
    emotion_confidence = Column(Float)
    
    rl_action = Column(String)
    rl_state = Column(JSON, default={})
    
    # ✅ NEW: Track which algorithm was used
    algorithm = Column(String, default="q_learning")  # "q_learning" or "dqn"
    
    # Relationships
    user = relationship("User", backref="interactions")
    session = relationship("LearningSession", back_populates="interactions")

class UserAchievement(Base):
    __tablename__ = "user_achievements"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    achievement_type = Column(String)
    achieved_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="achievements")

class LeaderboardEntry(Base):
    __tablename__ = "leaderboard_entries"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    total_score = Column(Integer, default=0)
    total_questions = Column(Integer, default=0)
    correct_answers = Column(Integer, default=0)
    best_streak = Column(Integer, default=0)
    total_sessions = Column(Integer, default=0)
    last_updated = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user = relationship("User", backref="leaderboard_entry")

class Lesson(Base):
    __tablename__ = "lessons"
    
    id = Column(String, primary_key=True)
    title = Column(String)
    content = Column(Text)
    topic = Column(String)
    difficulty = Column(Integer)
    order_index = Column(Integer)

class Question(Base):
    __tablename__ = "questions"
    
    id = Column(String, primary_key=True)
    lesson_id = Column(String, ForeignKey("lessons.id"))
    question_text = Column(String)
    options = Column(JSON)
    correct_answer = Column(String)
    hint = Column(String)
    difficulty = Column(Integer)
    topic = Column(String)
    
    # Relationship
    lesson = relationship("Lesson")

class ValidationRecord(Base):
    __tablename__ = "validation_records"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    detected_emotion = Column(String)
    ground_truth_emotion = Column(String)
    is_correct = Column(Boolean)
    image_context = Column(String, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    
    # Relationship
    user = relationship("User", backref="validation_records")    
    

def init_db():
    Base.metadata.create_all(bind=engine)
    print("✅ Database tables created/verified")
    
    # Create default admin user if not exists
    from sqlalchemy.orm import Session
    db = SessionLocal()
    
    # Create admin user
    admin = db.query(User).filter(User.username == "admin").first()
    if not admin:
        admin = User(
            username="admin",
            email="admin@example.com",
            role="admin"
        )
        db.add(admin)
        db.commit()
        print("✅ Default admin user created (username: admin, email: admin@example.com)")
    
    # Create leaderboard entries for all existing users
    users = db.query(User).all()
    for user in users:
        entry = db.query(LeaderboardEntry).filter(LeaderboardEntry.user_id == user.id).first()
        if not entry:
            entry = LeaderboardEntry(user_id=user.id)
            db.add(entry)
    
    db.commit()
    db.close()
    print("✅ Leaderboard entries created for all users")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
