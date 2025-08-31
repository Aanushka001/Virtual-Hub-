
# /BACKEND/api/leaderboard_routes.py
from flask_restx import Namespace, Resource
from models.user_model import UserModel

leaderboard_ns = Namespace('leaderboard', description='Leaderboard operations')

@leaderboard_ns.route('')
class LeaderboardResource(Resource):
    def get(self):
        """Get leaderboard"""
        try:
            users = UserModel.get_leaderboard(50)
            
            leaderboard = []
            for i, user in enumerate(users):
                user_safe = user.copy()
                user_safe.pop('passwordHash', None)
                user_safe.pop('email', None)  # Privacy
                user_safe['rank'] = i + 1
                leaderboard.append(user_safe)
            
            return {'leaderboard': leaderboard}, 200
            
        except Exception as e:
            return {'error': str(e)}, 500