
# /BACKEND/api/auth_routes.py
from flask import request, g
from flask_restx import Namespace, Resource, fields
from middleware.auth_middleware import require_auth
from models.user_model import UserModel
from services.gamification_service import GamificationService
from utils.helpers import generate_token, hash_password, verify_password
from utils.validators import validate_user_data, validate_required_fields

auth_ns = Namespace('auth', description='Authentication operations')

# API Models for documentation
signup_model = auth_ns.model('Signup', {
    'firstName': fields.String(required=True),
    'lastName': fields.String(required=True),
    'email': fields.String(required=True),
    'password': fields.String(required=True),
    'role': fields.String(required=True, enum=['student', 'mentor', 'admin']),
    'interests': fields.List(fields.String()),
    'skills': fields.List(fields.String())
})

signin_model = auth_ns.model('Signin', {
    'email': fields.String(required=True),
    'password': fields.String(required=True)
})

@auth_ns.route('/signup')
class SignupResource(Resource):
    @auth_ns.expect(signup_model)
    def post(self):
        """Register a new user"""
        try:
            data = request.get_json()
            
            required_fields = ['firstName', 'lastName', 'email', 'password', 'role']
            missing = validate_required_fields(data, required_fields)
            if missing:
                return {'error': f'Missing fields: {", ".join(missing)}'}, 400
            
            validation_errors = validate_user_data(data)
            if validation_errors:
                return {'error': validation_errors}, 400
            
            user_model = UserModel()
            existing_user = user_model.get_user_by_email(data['email'])
            if existing_user:
                return {'error': 'Email already registered'}, 409
            
            # Support multi-role users
            roles = [data['role']]
            if data['role'] == 'mentor':
                roles.append('student')  # Mentors can also be students
            
            user_data = {
                'firstName': data['firstName'],
                'lastName': data['lastName'],
                'displayName': f"{data['firstName']} {data['lastName']}",
                'email': data['email'],
                'passwordHash': hash_password(data['password']),
                'role': data['role'],  # Primary role
                'roles': roles,  # All roles
                'interests': data.get('interests', []),
                'skills': data.get('skills', []),
                'points': 0,
                'level': 1,
                'badges': [],
                'profileImage': '',
                'bio': ''
            }
            
            user_id = user_model.create_user(user_data)
            user_data['uid'] = user_id
            
            gamification_service = GamificationService()
            gamification_service.award_points(user_id, 'join_platform')
            
            token = generate_token(user_data)
            
            return {
                'message': 'User created successfully',
                'token': token,
                'user': {
                    'uid': user_id,
                    'email': user_data['email'],
                    'displayName': user_data['displayName'],
                    'role': user_data['role'],
                    'roles': user_data['roles']
                }
            }, 201
            
        except Exception as e:
            return {'error': str(e)}, 500

@auth_ns.route('/signin')
class SigninResource(Resource):
    @auth_ns.expect(signin_model)
    def post(self):
        """User login"""
        try:
            data = request.get_json()
            
            required_fields = ['email', 'password']
            missing = validate_required_fields(data, required_fields)
            if missing:
                return {'error': f'Missing fields: {", ".join(missing)}'}, 400
            
            user_model = UserModel()
            user = user_model.get_user_by_email(data['email'])
            if not user:
                return {'error': 'Invalid credentials'}, 401
            
            if not verify_password(data['password'], user['passwordHash']):
                return {'error': 'Invalid credentials'}, 401
            
            token = generate_token(user)
            
            return {
                'message': 'Login successful',
                'token': token,
                'user': {
                    'uid': user['uid'],
                    'email': user['email'],
                    'displayName': user['displayName'],
                    'role': user['role'],
                    'roles': user.get('roles', [user['role']])
                }
            }, 200
            
        except Exception as e:
            return {'error': str(e)}, 500

@auth_ns.route('/verify')
class VerifyResource(Resource):
    @require_auth
    def get(self):
        """Verify JWT token"""
        return {
            'message': 'Token valid',
            'user': {
                'uid': g.current_user['uid'],
                'email': g.current_user['email'],
                'displayName': g.current_user['displayName'],
                'role': g.current_user['role'],
                'roles': g.current_user.get('roles', [g.current_user['role']])
            }
        }, 200