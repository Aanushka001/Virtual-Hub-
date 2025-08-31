import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'virtual-hub-secret-key'
    FIREBASE_CREDENTIALS = os.environ.get('FIREBASE_CREDENTIALS') or 'firebase-credentials.json'
    ENVIRONMENT = os.environ.get('ENVIRONMENT') or 'development'
    JWT_SECRET = os.environ.get('JWT_SECRET') or 'jwt-secret-key'
    AI_API_KEY = os.environ.get('AI_API_KEY') or 'demo-ai-key'
    AI_API_URL = os.environ.get('AI_API_URL') or 'https://api.anthropic.com/v1'
    STORAGE_BUCKET = os.environ.get('STORAGE_BUCKET') or 'virtual-hub-storage'
    MAX_FILE_SIZE = 50 * 1024 * 1024
    ALLOWED_EXTENSIONS = {'pdf', 'doc', 'docx', 'ppt', 'pptx', 'jpg', 'jpeg', 'png', 'mp4', 'mp3'}
    RATE_LIMIT = 100
    CORS_ORIGINS = ['http://localhost:3000', 'http://127.0.0.1:3000']
# # /BACKEND/config.py
# import os
# from dotenv import load_dotenv

# load_dotenv()

# class Config:
#     SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-secret-key-change-in-production'
#     FIREBASE_CREDENTIALS = os.environ.get('FIREBASE_CREDENTIALS') or 'firebase-credentials.json'
#     ENVIRONMENT = os.environ.get('ENVIRONMENT') or 'development'
#     JWT_SECRET = os.environ.get('JWT_SECRET') or 'jwt-secret-key-change-in-production'
#     AI_API_KEY = os.environ.get('AI_API_KEY') or 'demo-ai-key'
#     AI_API_URL = os.environ.get('AI_API_URL') or 'https://api.anthropic.com/v1'
#     STORAGE_BUCKET = os.environ.get('STORAGE_BUCKET') or 'virtual-hub-fd3c7.firebasestorage.app'
#     MAX_FILE_SIZE = 50 * 1024 * 1024  # 50MB
#     ALLOWED_EXTENSIONS = {'pdf', 'doc', 'docx', 'ppt', 'pptx', 'jpg', 'jpeg', 'png', 'mp4', 'mp3'}
#     RATE_LIMIT = 100
#     CORS_ORIGINS = ['http://localhost:3000', 'http://127.0.0.1:3000']



