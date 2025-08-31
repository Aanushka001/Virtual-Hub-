

## /BACKEND/controllers/chat_controller.py

from flask import request, jsonify, g
from flask_restx import Resource
from flask_socketio import emit, join_room, leave_room
from middleware.auth_middleware import require_auth
from models.chat_model import ChatModel
from services.gamification_service import GamificationService

class ChatController(Resource):
    def __init__(self):
        self.chat_model = ChatModel()
        self.gamification_service = GamificationService()
    
    @require_auth
    def send_message(self):
        try:
            data = request.get_json()
            recipient_id = data.get('recipientId')
            content = data.get('content')
            message_type = data.get('type', 'text')
            
            if not recipient_id or not content:
                return jsonify({'error': 'Missing recipient or content'}), 400
            
            sender_id = g.current_user['uid']
            
            message_id = self.chat_model.send_message(sender_id, recipient_id, content, message_type)
            
            self.gamification_service.award_points(sender_id, 'send_message')
            
            return jsonify({
                'message': 'Message sent successfully',
                'messageId': message_id
            }), 201
            
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
    @require_auth
    def get_conversation(self, user_id):
        try:
            current_user_id = g.current_user['uid']
            
            messages = self.chat_model.get_conversation_messages(current_user_id, user_id)
            
            self.chat_model.mark_messages_read(current_user_id, user_id)
            
            return jsonify({'messages': messages}), 200
            
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
    @require_auth
    def get_conversations(self):
        try:
            user_id = g.current_user['uid']
            
            conversations = self.chat_model.get_user_conversations(user_id)
            
            return jsonify({'conversations': conversations}), 200
            
        except Exception as e:
            return jsonify({'error': str(e)}), 500

def handle_socket_connection(socketio, auth_required=True):
    @socketio.on('connect')
    def on_connect():
        if auth_required:
            token = request.args.get('token')
            if not token:
                return False
            
            from utils.helpers import decode_token
            from utils.database import db
            
            payload = decode_token(token)
            if not payload:
                return False
            
            user_data = db.get_document('users', payload['uid'])
            if not user_data:
                return False
            
            join_room(user_data['uid'])
            emit('connected', {'message': 'Connected to chat'})
    
    @socketio.on('join_conversation')
    def on_join_conversation(data):
        conversation_id = data.get('conversationId')
        if conversation_id:
            join_room(conversation_id)
    
    @socketio.on('leave_conversation')
    def on_leave_conversation(data):
        conversation_id = data.get('conversationId')
        if conversation_id:
            leave_room(conversation_id)
    
    @socketio.on('send_message')
    def on_send_message(data):
        try:
            recipient_id = data.get('recipientId')
            content = data.get('content')
            sender_id = data.get('senderId')
            
            if all([recipient_id, content, sender_id]):
                chat_model = ChatModel()
                message_id = chat_model.send_message(sender_id, recipient_id, content)
                
                emit('new_message', {
                    'messageId': message_id,
                    'senderId': sender_id,
                    'content': content,
                    'timestamp': 'now'
                }, room=recipient_id)
                
        except Exception as e:
            emit('error', {'message': str(e)})
