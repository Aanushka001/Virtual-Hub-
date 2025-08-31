
## /BACKEND/controllers/admin_controller.py

from flask import request, jsonify
from flask_restx import Resource
from middleware.auth_middleware import require_auth, require_admin
from models.user_model import UserModel
from models.group_model import GroupModel
from models.resource_model import ResourceModel
from models.opportunity_model import OpportunityModel

class AdminController(Resource):
    def __init__(self):
        self.user_model = UserModel()
        self.group_model = GroupModel()
        self.resource_model = ResourceModel()
        self.opportunity_model = OpportunityModel()
    
    @require_auth
    @require_admin
    def get_dashboard_stats(self):
        try:
            users = self.user_model.get_all_users()
            groups = self.group_model.get_all_groups()
            resources = self.resource_model.get_all_resources()
            pending_resources = self.resource_model.get_pending_resources()
            
            stats = {
                'totalUsers': len(users),
                'activeGroups': len([g for g in groups if g.get('isActive', True)]),
                'totalResources': len(resources),
                'pendingApprovals': len(pending_resources)
            }
            
            return jsonify({'stats': stats}), 200
            
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
    @require_auth
    @require_admin
    def get_all_users(self):
        try:
            users = self.user_model.get_all_users()
            
            safe_users = []
            for user in users:
                safe_user = user.copy()
                safe_user.pop('passwordHash', None)
                safe_users.append(safe_user)
            
            return jsonify({'users': safe_users}), 200
            
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
    @require_auth
    @require_admin
    def update_user_role(self, user_id):
        try:
            data = request.get_json()
            new_role = data.get('role')
            
            if new_role not in ['student', 'mentor', 'admin']:
                return jsonify({'error': 'Invalid role'}), 400
            
            self.user_model.update_user(user_id, {'role': new_role})
            
            return jsonify({'message': 'User role updated successfully'}), 200
            
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
    @require_auth
    @require_admin
    def delete_user(self, user_id):
        try:
            self.user_model.delete_user(user_id)
            
            return jsonify({'message': 'User deleted successfully'}), 200
            
        except Exception as e:
            return jsonify({'error': str(e)}), 500

