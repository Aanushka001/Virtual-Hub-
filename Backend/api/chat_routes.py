
# /BACKEND/api/chat_routes.py
from flask import request, g
from flask_restx import Namespace, Resource
from middleware.auth_middleware import require_auth
from services.notification_service import NotificationService
from utils.database import db

chat_ns = Namespace('chat', description='Chat operations')