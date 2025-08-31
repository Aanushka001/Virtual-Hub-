# app.py
from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_socketio import SocketIO
import eventlet
import datetime

eventlet.monkey_patch()

app = Flask(__name__)
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*", ping_interval=25)

# In-memory sample data
users = {
    "user_1": {
        "uid": "user_1",
        "displayName": "Aanushka Singh",
        "email": "aanushka@example.com",
        "savedOpportunities": ["opp_1"],
        "recentActivity": [],
        "points": 120,
        "isOnline": True
    }
}

opportunities = [
    {
        "id": "opp_1",
        "title": "AI Hackathon",
        "type": "Competition",
        "difficulty": "Intermediate",
        "deadline": "2025-09-10",
        "prizes": "$5000",
        "organizer": "Tech University",
        "description": "Participate in an AI hackathon to solve real-world problems.",
        "tags": ["AI", "Hackathon", "ML"],
        "registrationUrl": "https://example.com/register"
    }
]

mentors = [
    {"id": "mentor_1", "name": "John Doe", "expertise": "Machine Learning"}
]

announcements = [
    {"id": "ann_1", "title": "Welcome!", "message": "Start exploring study rooms and connect with mentors", "isActive": True}
]

study_groups = [
    {"id": "group_1", "name": "Python Beginners", "members": ["user_1"]}
]

applications = []


# API Routes
@app.route('/api/opportunities', methods=['GET'])
def get_opportunities():
    return jsonify({"opportunities": opportunities})


@app.route('/api/users/dashboard', methods=['GET'])
def get_dashboard():
    uid = request.args.get('uid', 'user_1')
    user = users.get(uid)
    if not user:
        return jsonify({"error": "User not found"}), 404
    user_apps = [app for app in applications if app['userId'] == uid]
    stats = {
        "applicationsCount": len(user_apps),
        "points": user.get("points", 0)
    }
    return jsonify({"user": user, "applications": user_apps, "stats": stats})


@app.route('/api/apply', methods=['POST'])
def apply_opportunity():
    data = request.json
    application_id = f"app_{int(datetime.datetime.now().timestamp())}"
    application = {
        "id": application_id,
        "userId": data.get("userId"),
        "opportunityId": data.get("opportunityId"),
        "opportunityTitle": data.get("opportunityTitle"),
        "status": "submitted",
        "appliedAt": datetime.datetime.utcnow().isoformat()
    }
    applications.append(application)
    return jsonify(application), 201


@app.route('/api/mentors', methods=['GET'])
def get_mentors():
    return jsonify({"mentors": mentors})


@app.route('/api/announcements', methods=['GET'])
def get_announcements():
    return jsonify({"announcements": announcements})


@app.route('/api/groups', methods=['GET'])
def get_groups():
    return jsonify({"groups": study_groups})


@app.route('/api/resources', methods=['GET'])
def get_resources():
    return jsonify({"resources": []})


@app.route('/api/leaderboard', methods=['GET'])
def get_leaderboard():
    sorted_users = sorted(users.values(), key=lambda u: u.get("points", 0), reverse=True)
    leaderboard = [{"rank": i + 1, "uid": u["uid"], "name": u["displayName"], "points": u.get("points", 0)} 
                   for i, u in enumerate(sorted_users)]
    return jsonify({"leaderboard": leaderboard})


# SocketIO events
@socketio.on('connect')
def handle_connect():
    print("Client connected")


@socketio.on('disconnect')
def handle_disconnect():
    print("Client disconnected")


if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=5000, debug=True)
