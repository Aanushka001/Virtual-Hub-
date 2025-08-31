
## /BACKEND/controllers/auth_controller.py

from flask import request, jsonify
from flask_restx import Resource
from middleware.auth_middleware import require_auth
from models.user_model import UserModel
from services.gamification_service import GamificationService
from utils.helpers import generate_token, hash_password, verify_password
from utils.validators import validate_user_data, validate_required_fields
from utils.database import db

class AuthController(Resource):
    def __init__(self):
        self.user_model = UserModel()
        self.gamification_service = GamificationService()
    
    def signup(self):
        try:
            data = request.get_json()
            
            required_fields = ['firstName', 'lastName', 'email', 'password', 'role']
            missing = validate_required_fields(data, required_fields)
            if missing:
                return jsonify({'error': f'Missing fields: {", ".join(missing)}'}), 400
            
            validation_errors = validate_user_data(data)
            if validation_errors:
                return jsonify({'error': validation_errors}), 400
            
            existing_user = self.user_model.get_user_by_email(data['email'])
            if existing_user:
                return jsonify({'error': 'Email already registered'}), 409
            
            user_data = {
                'firstName': data['firstName'],
                'lastName': data['lastName'],
                'displayName': f"{data['firstName']} {data['lastName']}",
                'email': data['email'],
                'passwordHash': hash_password(data['password']),
                'role': data.get('role', 'student'),
                'interests': data.get('interests', []),
                'skills': data.get('skills', []),
                'points': 0,
                'level': 1,
                'badges': [],
                'profileImage': '',
                'bio': ''
            }
            
            user_id = self.user_model.create_user(user_data)
            user_data['uid'] = user_id
            
            self.gamification_service.award_points(user_id, 'join_platform')
            
            token = generate_token(user_data)
            
            return jsonify({
                'message': 'User created successfully',
                'token': token,
                'user': {
                    'uid': user_id,
                    'email': user_data['email'],
                    'displayName': user_data['displayName'],
                    'role': user_data['role']
                }
            }), 201
            
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
    def signin(self):
        try:
            data = request.get_json()
            
            required_fields = ['email', 'password']
            missing = validate_required_fields(data, required_fields)
            if missing:
                return jsonify({'error': f'Missing fields: {", ".join(missing)}'}), 400
            
            user = self.user_model.get_user_by_email(data['email'])
            if not user:
                return jsonify({'error': 'Invalid credentials'}), 401
            
            if not verify_password(data['password'], user['passwordHash']):
                return jsonify({'error': 'Invalid credentials'}), 401
            
            token = generate_token(user)
            
            return jsonify({
                'message': 'Login successful',
                'token': token,
                'user': {
                    'uid': user['uid'],
                    'email': user['email'],
                    'displayName': user['displayName'],
                    'role': user['role']
                }
            }), 200
            
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
    @require_auth
    def verify_token(self):
        from flask import g
        return jsonify({
            'message': 'Token valid',
            'user': {
                'uid': g.current_user['uid'],
                'email': g.current_user['email'],
                'displayName': g.current_user['displayName'],
                'role': g.current_user['role']
            }
        }), 200
