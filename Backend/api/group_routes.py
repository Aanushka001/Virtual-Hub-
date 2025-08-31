
# /BACKEND/api/group_routes.py
from flask import request, g
from flask_restx import Namespace, Resource, fields
from middleware.auth_middleware import require_auth
from models.group_model import GroupModel
from services.gamification_service import GamificationService
from services.notification_service import NotificationService
from utils.validators import validate_group_data, validate_required_fields

group_ns = Namespace('groups', description='Study group operations')

group_model = group_ns.model('Group', {
    'name': fields.String(required=True),
    'subject': fields.String(required=True),
    'level': fields.String(required=True, enum=['Beginner', 'Intermediate', 'Advanced']),
    'description': fields.String(),
    'maxMembers': fields.Integer(default=5),
    'tags': fields.List(fields.String()),
    'meetingSchedule': fields.String()
})

@group_ns.route('')
class GroupListResource(Resource):
    def get(self):
        """Get all study groups"""
        try:
            subject = request.args.get('subject')
            level = request.args.get('level')
            
            group_model_instance = GroupModel()
            if subject:
                groups = group_model_instance.get_groups_by_subject(subject)
            else:
                groups = group_model_instance.get_all_groups()
            
            if level:
                groups = [g for g in groups if g.get('level') == level]
            
            return {'groups': groups}, 200
            
        except Exception as e:
            return {'error': str(e)}, 500
    
    @group_ns.expect(group_model)
    @require_auth
    def post(self):
        """Create a new study group"""
        try:
            data = request.get_json()
            
            required_fields = ['name', 'subject', 'level']
            missing = validate_required_fields(data, required_fields)
            if missing:
                return {'error': f'Missing fields: {", ".join(missing)}'}, 400
            
            validation_errors = validate_group_data(data)
            if validation_errors:
                return {'error': validation_errors}, 400
            
            group_data = {
                'name': data['name'],
                'subject': data['subject'],
                'level': data['level'],
                'description': data.get('description', ''),
                'maxMembers': data.get('maxMembers', 5),
                'members': [g.current_user['uid']],
                'createdBy': g.current_user['uid'],
                'tags': data.get('tags', []),
                'meetingSchedule': data.get('meetingSchedule', '')
            }
            
            group_model_instance = GroupModel()
            group_id = group_model_instance.create_group(group_data)
            
            gamification_service = GamificationService()
            gamification_service.award_points(g.current_user['uid'], 'create_group')
            
            return {
                'message': 'Group created successfully',
                'groupId': group_id
            }, 201
            
        except Exception as e:
            return {'error': str(e)}, 500

@group_ns.route('/<string:group_id>')
class GroupResource(Resource):
    def get(self, group_id):
        """Get specific group details"""
        try:
            group_model_instance = GroupModel()
            group = group_model_instance.get_group_by_id(group_id)
            if not group:
                return {'error': 'Group not found'}, 404
            
            return {'group': group}, 200
            
        except Exception as e:
            return {'error': str(e)}, 500

@group_ns.route('/<string:group_id>/join')
class GroupJoinResource(Resource):
    @require_auth
    def post(self, group_id):
        """Join a study group"""
        try:
            user_id = g.current_user['uid']
            
            group_model_instance = GroupModel()
            group = group_model_instance.get_group_by_id(group_id)
            if not group:
                return {'error': 'Group not found'}, 404
            
            if user_id in group.get('members', []):
                return {'error': 'Already a member of this group'}, 400
            
            success = group_model_instance.join_group(group_id, user_id)
            if not success:
                return {'error': 'Cannot join group - may be full'}, 400
            
            gamification_service = GamificationService()
            gamification_service.award_points(user_id, 'join_group')
            
            notification_service = NotificationService()
            notification_service.send_group_join_notification(
                group['members'],
                g.current_user['displayName'],
                group['name']
            )
            
            return {'message': 'Successfully joined group'}, 200
            
        except Exception as e:
            return {'error': str(e)}, 500

@group_ns.route('/<string:group_id>/leave')
class GroupLeaveResource(Resource):
    @require_auth
    def post(self, group_id):
        """Leave a study group"""
        try:
            user_id = g.current_user['uid']
            
            group_model_instance = GroupModel()
            success = group_model_instance.leave_group(group_id, user_id)
            if not success:
                return {'error': 'Not a member of this group'}, 400
            
            return {'message': 'Successfully left group'}, 200
            
        except Exception as e:
            return {'error': str(e)}, 500

@group_ns.route('/my')
class UserGroupsResource(Resource):
    @require_auth
    def get(self):
        """Get user's study groups"""
        try:
            user_id = g.current_user['uid']
            group_model_instance = GroupModel()
            groups = group_model_instance.get_user_groups(user_id)
            
            return {'groups': groups}, 200
            
        except Exception as e:
            return {'error': str(e)}, 500