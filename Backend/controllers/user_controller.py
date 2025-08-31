

## /BACKEND/controllers/user_controller.py

from flask import request, jsonify, g
from flask_restx import Resource
from middleware.auth_middleware import require_auth
from models.user_model import UserModel
from services.matching_service import MatchingService
from utils.validators import validate_user_data

class UserController(Resource):
    def __init__(self):
        self.user_model = UserModel()
        self.matching_service = MatchingService()
    
    @require_auth
    def get_profile(self, user_id=None):
        try:
            if user_id:
                user = self.user_model.get_user_by_id(user_id)
            else:
                user = g.current_user
            
            if not user:
                return jsonify({'error': 'User not found'}), 404
            
            user_safe = user.copy()
            user_safe.pop('passwordHash', None)
            
            return jsonify({'user': user_safe}), 200
            
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
    @require_auth
    def update_profile(self):
        try:
            data = request.get_json()
            user_id = g.current_user['uid']
            
            updatable_fields = ['firstName', 'lastName', 'displayName', 'bio', 'interests', 'skills', 'profileImage']
            update_data = {}
            
            for field in updatable_fields:
                if field in data:
                    update_data[field] = data[field]
            
            if 'firstName' in update_data and 'lastName' in update_data:
                update_data['displayName'] = f"{update_data['firstName']} {update_data['lastName']}"
            
            validation_errors = validate_user_data(update_data)
            if validation_errors:
                return jsonify({'error': validation_errors}), 400
            
            self.user_model.update_user(user_id, update_data)
            
            updated_user = self.user_model.get_user_by_id(user_id)
            updated_user.pop('passwordHash', None)
            
            return jsonify({
                'message': 'Profile updated successfully',
                'user': updated_user
            }), 200
            
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
    @require_auth
    def get_recommendations(self):
        try:
            user_profile = g.current_user
            
            group_recommendations = self.matching_service.get_recommended_groups(user_profile)
            mentor_recommendations = self.matching_service.get_recommended_mentors(user_profile)
            resource_recommendations = self.matching_service.get_recommended_resources(user_profile)
            opportunity_recommendations = self.matching_service.get_recommended_opportunities(user_profile)
            
            return jsonify({
                'recommendations': {
                    'groups': group_recommendations[:5],
                    'mentors': mentor_recommendations[:5],
                    'resources': resource_recommendations[:10],
                    'opportunities': opportunity_recommendations[:5]
                }
            }), 200
            
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
    @require_auth
    def get_dashboard_stats(self):
        try:
            user_id = g.current_user['uid']
            
            from models.group_model import GroupModel
            from models.mentor_model import MentorModel
            from models.resource_model import ResourceModel
            
            user_groups = GroupModel.get_user_groups(user_id)
            user_connections = MentorModel.get_student_connections(user_id)
            user_resources = ResourceModel.get_user_resources(user_id)
            
            stats = {
                'studyGroups': len(user_groups),
                'mentorships': len([c for c in user_connections if c['status'] == 'accepted']),
                'resources': len(user_resources),
                'points': g.current_user.get('points', 0)
            }
            
            return jsonify({'stats': stats}), 200
            
        except Exception as e:
            return jsonify({'error': str(e)}), 500