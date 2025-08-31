import eventlet
eventlet.monkey_patch()

import os
from flask import Flask, jsonify, request, g
from flask_socketio import SocketIO, emit, join_room, leave_room
from flask_cors import CORS
import firebase_admin
from firebase_admin import credentials, firestore, auth as firebase_auth
from datetime import datetime, timedelta
import jwt
import hashlib
import secrets

app = Flask(__name__)
app.config['SECRET_KEY'] = 'virtual-hub-secret-key'

CORS(app, origins=['http://localhost:3000', 'http://127.0.0.1:3000'])
socketio = SocketIO(app, cors_allowed_origins=['http://localhost:3000', 'http://127.0.0.1:3000'], async_mode="eventlet")

try:
    firebase_admin.get_app()
except ValueError:
    cred = credentials.Certificate({
        "type": "service_account",
        "project_id": "virtual-hub-fd3c7",
        "private_key_id": "1aea176544b3f4e6e697cde8fc41f2007124dedb",
        "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCYSqbXPx7rkhc8\nCs0SgHvrj5FnFm7B8ZeaOLmxStOKJ0sxUnM7J122LiX3lkoQnwkwCnUt7vDBw7mk\nHjhSi9YJJAPOwzi9omUZG7XABjkdXppL7Onrv57MpwBE4d2d4RIOHfvMpRCJ3rNY\nyNln1PbxJWaUsVXrO0oodLW23TPHL4Lj1LrnrcpCZNsAhkJvsX6RcBWK552lLn97\nqIbO8RcAXVOMJHJJPUqQFgKsexacMiUum+XMx9NsCUol+zND+Bet9CO3fwV3gjDv\n/KEWMI4LraoL6INHQuWf40nXGXsBYvftGIIlx9exkztpn6ytHoQ0HnbfSolmHzt/\nmF7vRqzhAgMBAAECggEACTsPzSDUpUoFQddpwgMAVTEuNVsPuuOuNmPVJYuNMjow\nKDzWIodqpQiRC+ZpINly5h2MKAzr541kgC/GEYLLpgwvyuWHApTdnzL7G44vrLm3\njSiUA9JpNABfV3gqmvoxwkyg9DDWcB+L1rLTMqRJlNOZLyQR5XXXiIeNHW4KSGVf\nOtloGqkZefoD+5C0YfSRipMShF0zW8SpoW2K2QP92woeJPPHvNEeV7WyjeCL8P0z\nDzqmjcOHimb2tl0rqDM/9P4V2aOAWwElgIl08LqfQhiq3qtkdPs1ibRzHS6HeJz2\nElwx9WlFwAMaHW+ZNfw1jgx3zNZTt9Cs6utrdL2pvQKBgQDGzUkiOV1WfjM6Cdta\n6wOdvujHU/XQFzOKUfGdANLR/ebFu27q7Il7n35Brq8eCPy1nlBfw7ibCTIqFg1S\n/NcBzOIeQYBLN0BYu3fB30wSMs4lMxoXoG41xL5t3wDaP8aamn1q6rsKx+SGuFwd\nqwR+9ciWfFP5s9gtgKv52i6VxwKBgQDEG6jxlxnFm4oziko9Ncd+4InFIcKVBCal\nzYvChZALzSAOUMoFYSiNY1i6+33f25f94A34a97zxvpeo7B6uvy6WcDJb86bwc3E\nP1O7x114g52+VQ/0JSp+xoArSFqqDH2JbQLp7d8/liCYQjiKKJz1/wbashglDQ5n\nEH7QGE8IFwKBgD4WlyStLc15lJ4nve5jP7ngierW+gqHdH1aok8alr0mwxA2Pan5\nPebyJQh2ehKzU9mVHB0Mj3c8JAKo6Hhmpu/VATnZ0yuqkdokkn5mMufsHh3YG+oN\nHN6GF8NQxn9jM6/NWCYwMUJos6KvqXVKmBjewkrdgYyW8okjipJ55dq5AoGAOgoF\nohqaIgW6jS5sclksRbymiZVIRVoJJiEDL/rfet6mkhYO9DChE9dHN2+e/VW8UgKx\nn8gtH/DPwJqpbGlSysQtbnCMsURWZbJoUbbbTwOE+AOsyREG1qZg4G51hsZTkQyW\nRC2GWQdRdj6DBUCn05Y6rRbwVmba0F3taiEHotkCgYEArV0nJKteusabrThWKjl1\nglcdyYRXqlURaFdcQlF75JseFYOpN9ogBogylEStQVUT8NJ1riob3TKjqVJn0wb5\nT9bXuAAPaDtWmYNamhDhxbnE821aQO5Wj8szfHNJUQ6+WbjO4yd/7JNTJklXJ38Z\ni03l4e9stA7TB5o/yXZJ27o=\n-----END PRIVATE KEY-----\n",
        "client_email": "firebase-adminsdk-fbsvc@virtual-hub-fd3c7.iam.gserviceaccount.com",
        "client_id": "107424926202738121319",
        "auth_uri": "https://accounts.google.com/o/oauth2/auth",
        "token_uri": "https://oauth2.googleapis.com/token"
    })
    firebase_admin.initialize_app(cred, {
        'storageBucket': 'virtual-hub-fd3c7.firebasestorage.app'
    })

db = firestore.client()

def generate_token(user_data):
    payload = {
        'uid': user_data['uid'],
        'email': user_data['email'],
        'role': user_data.get('role', 'student'),
        'exp': datetime.utcnow() + timedelta(days=30)
    }
    return jwt.encode(payload, 'jwt-secret-key', algorithm='HS256')

def decode_token(token):
    try:
        payload = jwt.decode(token, 'jwt-secret-key', algorithms=['HS256'])
        return payload
    except:
        return None

def hash_password(password):
    return hashlib.sha256(password.encode()).hexdigest()

def verify_password(password, hashed):
    return hash_password(password) == hashed

def format_error_response(message, status_code=400):
    return jsonify({'error': message, 'status': status_code}), status_code

def require_auth(f):
    def wrapper(*args, **kwargs):
        auth_header = request.headers.get('Authorization', '')
        if not auth_header.startswith('Bearer '):
            return format_error_response("No authorization token", 401)
        
        token = auth_header[7:]
        try:
            decoded_token = firebase_auth.verify_id_token(token)
            g.current_user = decoded_token
        except:
            payload = decode_token(token)
            if not payload:
                return format_error_response("Invalid token", 401)
            g.current_user = payload
        
        return f(*args, **kwargs)
    wrapper.__name__ = f.__name__
    return wrapper

@app.route("/", methods=["GET"])
def root():
    return jsonify({
        "message": "Virtual Hub API",
        "status": "healthy",
        "version": "1.0.0"
    }), 200

@app.route("/api", methods=["GET"])
def api_root():
    return jsonify({
        "message": "Virtual Hub API v1.0",
        "status": "running"
    }), 200

@app.route("/api/announcements", methods=["GET"])
def get_announcements():
    try:
        announcements_ref = db.collection('announcements')
        docs = announcements_ref.stream()
        announcements = []
        
        for doc in docs:
            data = doc.to_dict()
            data['id'] = doc.id
            announcements.append(data)
        
        if not announcements:
            announcements = [
                {
                    "id": "ann_1",
                    "title": "Welcome to Virtual Campus!",
                    "message": "Start exploring study rooms and connect with mentors",
                    "type": "general",
                    "isActive": True,
                    "createdAt": datetime.now().isoformat()
                },
                {
                    "id": "ann_2", 
                    "title": "New Study Groups Available",
                    "message": "Join collaborative learning spaces for better outcomes",
                    "type": "groups",
                    "isActive": True,
                    "createdAt": datetime.now().isoformat()
                }
            ]
        
        return jsonify({"announcements": announcements}), 200
    except Exception as e:
        print(f"Error in get_announcements: {str(e)}")
        return format_error_response(str(e), 500)

@app.route("/api/users/dashboard", methods=["GET"])
def get_dashboard_stats():
    try:
        auth_header = request.headers.get('Authorization', '')
        if not auth_header.startswith('Bearer '):
            return format_error_response("No authorization token", 401)
        
        token = auth_header[7:]
        
        try:
            decoded_token = firebase_auth.verify_id_token(token)
            user_id = decoded_token['uid']
        except:
            payload = decode_token(token)
            if not payload:
                return format_error_response("Invalid token", 401)
            user_id = payload['uid']

        try:
            user_groups = db.collection("study_groups").where(
                filter=firestore.FieldFilter("members", "array_contains", user_id)
            ).get()
            user_resources = db.collection("resources").where(
                filter=firestore.FieldFilter("uploadedBy", "==", user_id)
            ).get()
            user_connections = db.collection("mentorships").where(
                filter=firestore.FieldFilter("studentId", "==", user_id)
            ).get()

            stats = {
                "studyGroups": len(user_groups),
                "mentorships": len(user_connections),
                "resources": len(user_resources),
                "points": 150,
                "level": 3,
                "badges": 5
            }
        except:
            stats = {
                "studyGroups": 2,
                "mentorships": 1, 
                "resources": 3,
                "points": 150,
                "level": 3,
                "badges": 5
            }

        return jsonify({"stats": stats}), 200

    except Exception as e:
        print(f"Error in get_dashboard_stats: {str(e)}")
        return format_error_response(str(e), 500)

@app.route("/api/groups", methods=["GET"])
def get_all_groups():
    try:
        groups_ref = db.collection('study_groups')
        docs = groups_ref.stream()
        groups = []
        
        for doc in docs:
            data = doc.to_dict()
            data['id'] = doc.id
            groups.append(data)
        
        if not groups:
            sample_groups = [
                {
                    "id": "group_1",
                    "name": "React Development Study Circle",
                    "subject": "Web Development",
                    "level": "Intermediate",
                    "description": "Building modern web applications with React and TypeScript",
                    "maxMembers": 8,
                    "members": ["user1", "user2", "user3"],
                    "memberCount": 3,
                    "createdBy": "user1",
                    "createdAt": datetime.now().isoformat(),
                    "isActive": True
                },
                {
                    "id": "group_2", 
                    "name": "Data Science Fundamentals",
                    "subject": "Data Science",
                    "level": "Beginner",
                    "description": "Learning Python, pandas, and machine learning basics",
                    "maxMembers": 6,
                    "members": ["user4", "user5"],
                    "memberCount": 2,
                    "createdBy": "user4",
                    "createdAt": datetime.now().isoformat(),
                    "isActive": True
                },
                {
                    "id": "group_3",
                    "name": "Mobile App Development",
                    "subject": "Mobile Development", 
                    "level": "Advanced",
                    "description": "Creating cross-platform apps with React Native",
                    "maxMembers": 5,
                    "members": ["user6", "user7", "user8", "user9"],
                    "memberCount": 4,
                    "createdBy": "user6",
                    "createdAt": datetime.now().isoformat(),
                    "isActive": True
                },
                {
                    "id": "group_4",
                    "name": "UI/UX Design Workshop",
                    "subject": "Design",
                    "level": "Intermediate",
                    "description": "Designing beautiful and functional user interfaces",
                    "maxMembers": 10,
                    "members": ["user10", "user11"],
                    "memberCount": 2,
                    "createdBy": "user10",
                    "createdAt": datetime.now().isoformat(),
                    "isActive": True
                }
            ]
            groups = sample_groups
        
        return jsonify({"groups": groups}), 200
    except Exception as e:
        print(f"Error in get_all_groups: {str(e)}")
        return format_error_response(str(e), 500)

@app.route("/api/mentors", methods=["GET"])
def get_all_mentors():
    try:
        mentors_ref = db.collection('mentors')
        docs = mentors_ref.stream()
        mentors = []
        
        for doc in docs:
            data = doc.to_dict()
            data['id'] = doc.id
            mentors.append(data)
        
        if not mentors:
            sample_mentors = [
                {
                    "id": "mentor_1",
                    "name": "Dr. Sarah Johnson",
                    "title": "Senior Software Engineer at Google",
                    "expertise": ["React", "Node.js", "System Design"],
                    "experience": "8 years",
                    "rating": 4.9,
                    "totalMentees": 45,
                    "availability": "Weekends",
                    "bio": "Passionate about helping students transition from academic learning to industry practices",
                    "profileImage": "",
                    "isAvailable": True
                },
                {
                    "id": "mentor_2",
                    "name": "Alex Chen",
                    "title": "Data Scientist at Microsoft",
                    "expertise": ["Python", "Machine Learning", "Data Analysis"],
                    "experience": "6 years",
                    "rating": 4.8,
                    "totalMentees": 32,
                    "availability": "Evenings",
                    "bio": "Specializing in AI/ML applications and data-driven decision making",
                    "profileImage": "",
                    "isAvailable": True
                },
                {
                    "id": "mentor_3",
                    "name": "Maria Rodriguez",
                    "title": "UX Design Lead at Apple",
                    "expertise": ["UI/UX Design", "Product Strategy", "User Research"],
                    "experience": "10 years",
                    "rating": 4.9,
                    "totalMentees": 28,
                    "availability": "Flexible",
                    "bio": "Helping designers create user-centered products that make a difference",
                    "profileImage": "",
                    "isAvailable": True
                }
            ]
            mentors = sample_mentors
        
        return jsonify({"mentors": mentors}), 200
    except Exception as e:
        print(f"Error in get_all_mentors: {str(e)}")
        return format_error_response(str(e), 500)

@app.route("/api/resources", methods=["GET"])
def get_all_resources():
    try:
        resources_ref = db.collection('resources')
        docs = resources_ref.stream()
        resources = []
        
        for doc in docs:
            data = doc.to_dict()
            data['id'] = doc.id
            resources.append(data)
        
        if not resources:
            sample_resources = [
                {
                    "id": "resource_1",
                    "title": "Complete React Handbook",
                    "type": "PDF",
                    "subject": "Web Development",
                    "uploadedBy": "Dr. Smith",
                    "uploadedAt": datetime.now().isoformat(),
                    "downloads": 245,
                    "rating": 4.7,
                    "size": "2.3 MB",
                    "description": "Comprehensive guide to React development with practical examples"
                },
                {
                    "id": "resource_2",
                    "title": "Data Structures & Algorithms",
                    "type": "Video Series",
                    "subject": "Computer Science",
                    "uploadedBy": "Prof. Johnson",
                    "uploadedAt": datetime.now().isoformat(),
                    "downloads": 189,
                    "rating": 4.8,
                    "size": "1.2 GB",
                    "description": "Visual explanations of essential data structures and algorithms"
                },
                {
                    "id": "resource_3",
                    "title": "Python for Data Science",
                    "type": "GitHub Repository",
                    "subject": "Data Science",
                    "uploadedBy": "Alex Martin",
                    "uploadedAt": datetime.now().isoformat(),
                    "downloads": 156,
                    "rating": 4.6,
                    "size": "45 MB",
                    "description": "Hands-on Python projects for data science beginners"
                }
            ]
            resources = sample_resources
        
        return jsonify({"resources": resources}), 200
    except Exception as e:
        print(f"Error in get_all_resources: {str(e)}")
        return format_error_response(str(e), 500)

@app.route("/api/opportunities", methods=["GET"])
def get_all_opportunities():
    try:
        opportunities_ref = db.collection('opportunities')
        docs = opportunities_ref.stream()
        opportunities = []
        
        for doc in docs:
            data = doc.to_dict()
            data['id'] = doc.id
            opportunities.append(data)
        
        if not opportunities:
            sample_opportunities = [
                {
                    "id": "opp_1",
                    "title": "Global Hackathon 2025",
                    "type": "Competition",
                    "difficulty": "Intermediate",
                    "deadline": "March 15, 2025",
                    "prizes": "$10,000 in prizes",
                    "description": "Build innovative solutions for social good",
                    "organizer": "TechForGood",
                    "registrationUrl": "https://globalhackathon.com",
                    "tags": ["Innovation", "Social Impact", "Team Building"],
                    "isActive": True
                },
                {
                    "id": "opp_2",
                    "title": "Microsoft Imagine Cup",
                    "type": "Competition",
                    "difficulty": "Advanced",
                    "deadline": "January 30, 2025",
                    "prizes": "$100,000 + Azure Credits",
                    "description": "Global student technology competition for innovative solutions",
                    "organizer": "Microsoft",
                    "registrationUrl": "https://imaginecup.microsoft.com",
                    "tags": ["Innovation", "Technology", "Entrepreneurship"],
                    "isActive": True
                },
                {
                    "id": "opp_3",
                    "title": "AI/ML Workshop Series",
                    "type": "Workshop",
                    "difficulty": "Beginner",
                    "deadline": "December 20, 2024",
                    "prizes": "Certificate + Portfolio Review",
                    "description": "Learn fundamentals of artificial intelligence and machine learning",
                    "organizer": "AI Academy",
                    "registrationUrl": "https://aiacademy.com/workshop",
                    "tags": ["AI", "Machine Learning", "Education"],
                    "isActive": True
                }
            ]
            opportunities = sample_opportunities
        
        return jsonify({"opportunities": opportunities}), 200
    except Exception as e:
        print(f"Error in get_all_opportunities: {str(e)}")
        return format_error_response(str(e), 500)

@app.route("/api/leaderboard", methods=["GET"])
def get_leaderboard():
    try:
        users_ref = db.collection('users')
        docs = users_ref.order_by('points', direction=firestore.Query.DESCENDING).limit(50).stream()
        leaderboard = []
        
        for i, doc in enumerate(docs):
            data = doc.to_dict()
            data['rank'] = i + 1
            data['id'] = doc.id
            leaderboard.append(data)
        
        if not leaderboard:
            sample_leaderboard = [
                {
                    "rank": 1,
                    "uid": "user1",
                    "displayName": "Alex Thompson",
                    "points": 2450,
                    "level": 8,
                    "badges": 12,
                    "role": "student",
                    "interests": ["AI", "Web Development"],
                    "profileImage": ""
                },
                {
                    "rank": 2,
                    "uid": "user2", 
                    "displayName": "Priya Sharma",
                    "points": 2200,
                    "level": 7,
                    "badges": 10,
                    "role": "student",
                    "interests": ["Data Science", "Machine Learning"],
                    "profileImage": ""
                },
                {
                    "rank": 3,
                    "uid": "user3",
                    "displayName": "James Wilson",
                    "points": 1980,
                    "level": 7,
                    "badges": 9,
                    "role": "mentor",
                    "interests": ["Mobile Development", "UI/UX"],
                    "profileImage": ""
                }
            ]
            leaderboard = sample_leaderboard
        
        return jsonify({"leaderboard": leaderboard}), 200
    except Exception as e:
        print(f"Error in get_leaderboard: {str(e)}")
        return format_error_response(str(e), 500)

@app.route("/api/users/profile", methods=["GET"])
@app.route("/api/users/profile/<user_id>", methods=["GET"])
def get_profile(user_id=None):
    try:
        if user_id:
            doc = db.collection("users").document(user_id).get()
            if doc.exists:
                user = doc.to_dict()
            else:
                return format_error_response("User not found", 404)
        else:
            auth_header = request.headers.get('Authorization', '')
            if not auth_header.startswith('Bearer '):
                return format_error_response("Invalid authorization header", 401)
            
            token = auth_header[7:]
            try:
                decoded_token = firebase_auth.verify_id_token(token)
                user_id = decoded_token['uid']
                doc = db.collection("users").document(user_id).get()
                if doc.exists:
                    user = doc.to_dict()
                else:
                    user = {
                        'uid': user_id,
                        'email': decoded_token.get('email', ''),
                        'displayName': decoded_token.get('name', ''),
                        'role': 'student',
                        'points': 0,
                        'level': 1,
                        'badges': [],
                        'profileComplete': True
                    }
                    db.collection("users").document(user_id).set(user)
            except:
                payload = decode_token(token)
                if not payload:
                    return format_error_response("Invalid token", 401)
                user_id = payload['uid']
                doc = db.collection("users").document(user_id).get()
                if doc.exists:
                    user = doc.to_dict()
                else:
                    return format_error_response("User not found", 404)

        user_safe = user.copy()
        user_safe.pop("passwordHash", None)
        return jsonify({"user": user_safe}), 200

    except Exception as e:
        print(f"Error in get_profile: {str(e)}")
        return format_error_response(str(e), 500)

@app.route("/api/auth/signup", methods=["POST"])
def signup():
    try:
        data = request.get_json() or {}
        
        required_fields = ["firstName", "lastName", "email", "password"]
        missing = [field for field in required_fields if not data.get(field)]
        if missing:
            return format_error_response(f'Missing fields: {", ".join(missing)}', 400)

        user_data = {
            "uid": f"user_{secrets.token_urlsafe(8)}",
            "firstName": data["firstName"],
            "lastName": data["lastName"],
            "displayName": f"{data['firstName']} {data['lastName']}",
            "email": data["email"],
            "passwordHash": hash_password(data["password"]),
            "role": data.get("role", "student"),
            "interests": data.get("interests", []),
            "skills": data.get("skills", []),
            "points": 0,
            "level": 1,
            "badges": [],
            "profileComplete": True,
            "isOnline": True,
            "createdAt": datetime.now().isoformat()
        }

        db.collection("users").document(user_data["uid"]).set(user_data)
        token = generate_token(user_data)

        return jsonify({
            "message": "User created successfully",
            "token": token,
            "user": {
                "uid": user_data["uid"],
                "email": user_data["email"],
                "displayName": user_data["displayName"],
                "role": user_data["role"],
            },
        }), 201

    except Exception as e:
        print(f"Error in signup: {str(e)}")
        return format_error_response(str(e), 500)

@app.route("/api/auth/signin", methods=["POST"])
def signin():
    try:
        data = request.get_json() or {}
        
        required_fields = ["email", "password"]
        missing = [field for field in required_fields if not data.get(field)]
        if missing:
            return format_error_response(f'Missing fields: {", ".join(missing)}', 400)

        users = db.collection("users").where(
            filter=firestore.FieldFilter("email", "==", data["email"])
        ).get()
        
        if not users:
            return format_error_response("Invalid credentials", 401)
        
        user = users[0].to_dict()
        
        if not verify_password(data["password"], user["passwordHash"]):
            return format_error_response("Invalid credentials", 401)

        token = generate_token(user)

        return jsonify({
            "message": "Login successful",
            "token": token,
            "user": {
                "uid": user["uid"],
                "email": user["email"],
                "displayName": user["displayName"],
                "role": user["role"],
            },
        }), 200

    except Exception as e:
        print(f"Error in signin: {str(e)}")
        return format_error_response(str(e), 500)

@app.errorhandler(404)
def not_found(error):
    return jsonify({"error": "Endpoint not found"}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({"error": "Internal server error"}), 500

@app.route("/health", methods=["GET"])
def health_check():
    return jsonify({"status": "healthy", "message": "Virtual Hub API is running"}), 200

if __name__ == "__main__":
    socketio.run(app, debug=True, host="0.0.0.0", port=int(os.environ.get("PORT", 5000)))