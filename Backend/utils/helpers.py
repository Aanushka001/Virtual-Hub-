import jwt
from datetime import datetime, timedelta
import hashlib
import secrets
import re
from flask import jsonify

# Configuration constants
JWT_SECRET = 'jwt-secret-key'
JWT_ALGORITHM = 'HS256'
JWT_EXPIRATION_DAYS = 30

def generate_token(user_data):
    """Generate JWT token for authenticated user"""
    try:
        payload = {
            'uid': user_data['uid'],
            'email': user_data['email'],
            'role': user_data.get('role', 'student'),
            'exp': datetime.utcnow() + timedelta(days=JWT_EXPIRATION_DAYS),
            'iat': datetime.utcnow()
        }
        return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)
    except Exception as e:
        print(f"Error generating token: {str(e)}")
        return None

def decode_token(token):
    """Decode and validate JWT token"""
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        print("Token has expired")
        return None
    except jwt.InvalidTokenError:
        print("Invalid token")
        return None
    except Exception as e:
        print(f"Error decoding token: {str(e)}")
        return None

def hash_password(password):
    """Hash password using SHA256"""
    try:
        return hashlib.sha256(password.encode()).hexdigest()
    except Exception as e:
        print(f"Error hashing password: {str(e)}")
        return None

def verify_password(password, hashed):
    """Verify password against hash"""
    try:
        return hash_password(password) == hashed
    except Exception as e:
        print(f"Error verifying password: {str(e)}")
        return False

def generate_random_id(length=16):
    """Generate secure random ID"""
    try:
        return secrets.token_urlsafe(length)
    except Exception as e:
        print(f"Error generating random ID: {str(e)}")
        return f"id_{int(datetime.now().timestamp())}"

def format_timestamp(timestamp):
    """Format timestamp to readable string"""
    try:
        if timestamp:
            if hasattr(timestamp, 'strftime'):
                return timestamp.strftime('%Y-%m-%d %H:%M:%S')
            elif isinstance(timestamp, str):
                dt = datetime.fromisoformat(timestamp.replace('Z', '+00:00'))
                return dt.strftime('%Y-%m-%d %H:%M:%S')
        return None
    except Exception as e:
        print(f"Error formatting timestamp: {str(e)}")
        return None

def calculate_points(action_type):
    """Calculate points based on user action"""
    point_values = {
        'join_group': 10,
        'complete_assignment': 15,
        'share_resource': 12,
        'help_peer': 6,
        'send_message': 2,
        'react_to_post': 1,
        'comment_helpful': 5,
        'make_friend': 10,
        'attend_workshop': 30,
        'join_competition': 40,
        'win_hackathon': 100,
        'organize_event': 75,
        'become_mentor': 50,
        'give_feedback': 15,
        'answer_question': 10,
        'create_tutorial': 75,
        'get_upvoted': 3,
        'create_group': 10,
        'mentor_session': 20,
        'upload_resource': 8,
        'daily_login': 5
    }
    return point_values.get(action_type, 0)

def get_level_from_points(points):
    """Calculate user level based on points"""
    try:
        points = int(points) if points else 0
        
        if points < 100:
            return 1
        elif points < 300:
            return 2
        elif points < 600:
            return 3
        elif points < 1000:
            return 4
        elif points < 1500:
            return 5
        elif points < 2100:
            return 6
        elif points < 2800:
            return 7
        else:
            return 8
    except Exception as e:
        print(f"Error calculating level: {str(e)}")
        return 1

def sanitize_filename(filename):
    """Sanitize filename for safe storage"""
    try:
        # Remove dangerous characters
        filename = re.sub(r'[^a-zA-Z0-9._-]', '', filename)
        # Limit length
        if len(filename) > 255:
            name, ext = filename.rsplit('.', 1) if '.' in filename else (filename, '')
            filename = name[:250] + ('.' + ext if ext else '')
        return filename or 'unnamed_file'
    except Exception as e:
        print(f"Error sanitizing filename: {str(e)}")
        return 'unnamed_file'

def format_error_response(message, status_code=400):
    """Format error response for API"""
    return jsonify({
        'error': message, 
        'status': status_code,
        'timestamp': datetime.utcnow().isoformat()
    }), status_code

def format_success_response(data=None, message='Success'):
    """Format success response for API"""
    response = {
        'message': message, 
        'status': 200,
        'timestamp': datetime.utcnow().isoformat()
    }
    if data:
        response['data'] = data
    return jsonify(response), 200

def validate_email(email):
    """Validate email format"""
    try:
        pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        return bool(re.match(pattern, email))
    except Exception as e:
        print(f"Error validating email: {str(e)}")
        return False

def validate_password(password):
    """Validate password strength"""
    try:
        if len(password) < 6:
            return False, "Password must be at least 6 characters long"
        if not re.search(r'[A-Za-z]', password):
            return False, "Password must contain at least one letter"
        return True, "Password is valid"
    except Exception as e:
        print(f"Error validating password: {str(e)}")
        return False, "Password validation failed"

def clean_user_data(user_data):
    """Clean user data for safe storage/response"""
    try:
        safe_data = user_data.copy()
        # Remove sensitive fields
        safe_data.pop('passwordHash', None)
        safe_data.pop('password', None)
        return safe_data
    except Exception as e:
        print(f"Error cleaning user data: {str(e)}")
        return {}

def calculate_compatibility_score(user1_interests, user2_interests, user1_skills, user2_skills):
    """Calculate compatibility score between two users"""
    try:
        interest_overlap = len(set(user1_interests).intersection(set(user2_interests)))
        skill_complement = len(set(user1_skills).symmetric_difference(set(user2_skills)))
        
        # Normalize scores (0-100)
        max_interests = max(len(user1_interests), len(user2_interests), 1)
        max_skills = max(len(user1_skills), len(user2_skills), 1)
        
        interest_score = (interest_overlap / max_interests) * 60
        skill_score = (skill_complement / max_skills) * 40
        
        return min(100, interest_score + skill_score)
    except Exception as e:
        print(f"Error calculating compatibility: {str(e)}")
        return 0

def generate_notification_id():
    """Generate unique notification ID"""
    try:
        timestamp = int(datetime.now().timestamp() * 1000)
        random_part = secrets.token_hex(4)
        return f"notif_{timestamp}_{random_part}"
    except Exception as e:
        print(f"Error generating notification ID: {str(e)}")
        return f"notif_{int(datetime.now().timestamp())}"

def paginate_results(results, page=1, per_page=20):
    """Paginate results for API responses"""
    try:
        page = max(1, int(page))
        per_page = min(100, max(1, int(per_page)))
        
        start = (page - 1) * per_page
        end = start + per_page
        
        paginated = results[start:end]
        total = len(results)
        total_pages = (total + per_page - 1) // per_page
        
        return {
            'data': paginated,
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': total,
                'total_pages': total_pages,
                'has_next': page < total_pages,
                'has_prev': page > 1
            }
        }
    except Exception as e:
        print(f"Error paginating results: {str(e)}")
        return {'data': results, 'pagination': None}