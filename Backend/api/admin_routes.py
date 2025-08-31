
# /BACKEND/api/admin_routes.py
from flask_restx import Namespace, Resource
from middleware.auth_middleware import require_auth, require_admin
from models.user_model import UserModel

admin_ns = Namespace('admin', description='Admin operations')

@admin_ns.route('/users')
class AdminUsersResource(Resource):
    @require_auth
    @require_admin
    def get(self):
        """Get all users (admin only)"""
        try:
            user_model = UserModel()
            users = user_model.get_all_users()
            
            # Remove sensitive data
            for user in users:
                user.pop('passwordHash', None)
            
            return {'users': users}, 200
            
        except Exception as e:
            return {'error': str(e)}, 500

@admin_ns.route('/users/<string:user_id>')
class AdminUserResource(Resource):
    @require_auth
    @require_admin
    def delete(self, user_id):
        """Delete user (admin only)"""
        try:
            user_model = UserModel()
            user_model.delete_user(user_id)
            return {'message': 'User deleted successfully'}, 200
            
        except Exception as e:
            return {'error': str(e)}, 500