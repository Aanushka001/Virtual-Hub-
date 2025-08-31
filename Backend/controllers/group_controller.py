from flask import request, jsonify, g
from flask_restx import Resource
from middleware.auth_middleware import require_auth
from models.group_model import GroupModel
from services.gamification_service import GamificationService
from services.notification_service import NotificationService
from utils.validators import validate_group_data, validate_required_fields

class GroupController(Resource):
    def __init__(self):
        self.group_model = GroupModel()
        self.gamification_service = GamificationService()
        self.notification_service = NotificationService()
    
    def get_all_groups(self):
        try:
            subject = request.args.get('subject')
            level = request.args.get('level')
            
            if subject:
                groups = self.group_model.get_groups_by_subject(subject)
            else:
                groups = self.group_model.get_all_groups()
            
            if level:
                groups = [g for g in groups if g.get('level') == level]
            
            return jsonify({'groups': groups}), 200
            
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
    def get_group(self, group_id):
        try:
            group = self.group_model.get_group_by_id(group_id)
            if not group:
                return jsonify({'error': 'Group not found'}), 404
            
            return jsonify({'group': group}), 200
            
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
    @require_auth
    def create_group(self):
        try:
            data = request.get_json()
            
            required_fields = ['name', 'subject', 'level']
            missing = validate_required_fields(data, required_fields)
            if missing:
                return jsonify({'error': f'Missing fields: {", ".join(missing)}'}), 400
            
            validation_errors = validate_group_data(data)
            if validation_errors:
                return jsonify({'error': validation_errors}), 400
            
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
            
            group_id = self.group_model.create_group(group_data)
            
            self.gamification_service.award_points(g.current_user['uid'], 'create_group')
            
            return jsonify({
                'message': 'Group created successfully',
                'groupId': group_id
            }), 201
            
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
    @require_auth
    def join_group(self, group_id):
        try:
            user_id = g.current_user['uid']
            
            group = self.group_model.get_group_by_id(group_id)
            if not group:
                return jsonify({'error': 'Group not found'}), 404
            
            if user_id in group.get('members', []):
                return jsonify({'error': 'Already a member of this group'}), 400
            
            success = self.group_model.join_group(group_id, user_id)
            if not success:
                return jsonify({'error': 'Cannot join group - may be full'}), 400
            
            self.gamification_service.award_points(user_id, 'join_group')
            
            self.notification_service.send_group_join_notification(
                group['members'],
                g.current_user['displayName'],
                group['name']
            )
            
            return jsonify({'message': 'Successfully joined group'}), 200
            
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
    @require_auth
    def leave_group(self, group_id):
        try:
            user_id = g.current_user['uid']
            
            success = self.group_model.leave_group(group_id, user_id)
            if not success:
                return jsonify({'error': 'Not a member of this group'}), 400
            
            return jsonify({'message': 'Successfully left group'}), 200
            
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
    @require_auth
    def get_user_groups(self):
        try:
            user_id = g.current_user['uid']
            groups = self.group_model.get_user_groups(user_id)
            
            return jsonify({'groups': groups}), 200
            
        except Exception as e:
            return jsonify({'error': str(e)}), 500
