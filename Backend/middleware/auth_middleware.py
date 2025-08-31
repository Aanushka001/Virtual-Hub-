from functools import wraps
from flask import request, jsonify, g
from utils.helpers import decode_token
from utils.database import db
import firebase_admin
from firebase_admin import auth

def require_auth(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'error': 'No token provided'}), 401
        
        if token.startswith('Bearer '):
            token = token[7:]
        
        try:
            decoded_token = auth.verify_id_token(token)
            uid = decoded_token.get('uid')
            
            user_data = db.get_document('users', uid)
            if not user_data:
                user_data = {
                    'uid': uid,
                    'email': decoded_token.get('email'),
                    'displayName': decoded_token.get('name', ''),
                    'role': 'student',
                    'points': 0,
                    'level': 1,
                    'badges': []
                }
                db.create_document('users', user_data)
            
            g.current_user = user_data
            return f(*args, **kwargs)
            
        except Exception as firebase_error:
            payload = decode_token(token)
            if not payload:
                return jsonify({'error': 'Invalid token'}), 401
            
            user_data = db.get_document('users', payload['uid'])
            if not user_data:
                return jsonify({'error': 'User not found'}), 404
            
            g.current_user = user_data
            return f(*args, **kwargs)
    
    return decorated

def require_admin(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        if not hasattr(g, 'current_user'):
            return jsonify({'error': 'Authentication required'}), 401
        
        if g.current_user.get('role') != 'admin':
            return jsonify({'error': 'Admin access required'}), 403
        
        return f(*args, **kwargs)
    
    return decorated

def require_mentor(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        if not hasattr(g, 'current_user'):
            return jsonify({'error': 'Authentication required'}), 401
        
        if g.current_user.get('role') not in ['mentor', 'admin']:
            return jsonify({'error': 'Mentor access required'}), 403
        
        return f(*args, **kwargs)
    
    return decorated