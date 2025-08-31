
# /BACKEND/api/mentor_routes.py
from flask import request, g
from flask_restx import Namespace, Resource, fields
from middleware.auth_middleware import require_auth, require_mentor
from models.mentor_model import MentorModel
from models.user_model import UserModel
from services.notification_service import NotificationService
from utils.validators import validate_required_fields

mentor_ns = Namespace('mentors', description='Mentor operations')

mentor_profile_model = mentor_ns.model('MentorProfile', {
    'expertise': fields.String(required=True),
    'experience': fields.String(required=True),
    'bio': fields.String(required=True),
    'company': fields.String(),
    'linkedIn': fields.String(),
    'specializations': fields.List(fields.String()),
    'availability': fields.Raw()
})

@mentor_ns.route('')
class MentorListResource(Resource):
    def get(self):
        """Get all mentors"""
        try:
            expertise = request.args.get('expertise')
            experience = request.args.get('experience')
            
            mentor_model_instance = MentorModel()
            if expertise:
                mentors = mentor_model_instance.get_mentors_by_expertise(expertise)
            else:
                mentors = mentor_model_instance.get_all_mentors()
            
            if experience:
                mentors = [m for m in mentors if m.get('experience') == experience]
            
            return {'mentors': mentors}, 200
            
        except Exception as e:
            return {'error': str(e)}, 500
    
    @mentor_ns.expect(mentor_profile_model)
    @require_auth
    @require_mentor
    def post(self):
        """Create mentor profile"""
        try:
            data = request.get_json()
            user_id = g.current_user['uid']
            
            mentor_model_instance = MentorModel()
            existing_mentor = mentor_model_instance.get_mentor_by_user_id(user_id)
            if existing_mentor:
                return {'error': 'Mentor profile already exists'}, 409
            
            required_fields = ['expertise', 'experience', 'bio']
            missing = validate_required_fields(data, required_fields)
            if missing:
                return {'error': f'Missing fields: {", ".join(missing)}'}, 400
            
            mentor_data = {
                'userId': user_id,
                'name': g.current_user['displayName'],
                'expertise': data['expertise'],
                'experience': data['experience'],
                'bio': data['bio'],
                'company': data.get('company', ''),
                'linkedIn': data.get('linkedIn', ''),
                'specializations': data.get('specializations', []),
                'availability': data.get('availability', {})
            }
            
            mentor_id = mentor_model_instance.create_mentor(mentor_data)
            
            return {
                'message': 'Mentor profile created successfully',
                'mentorId': mentor_id
            }, 201
            
        except Exception as e:
            return {'error': str(e)}, 500

@mentor_ns.route('/<string:mentor_id>')
class MentorResource(Resource):
    def get(self, mentor_id):
        """Get mentor details"""
        try:
            mentor_model_instance = MentorModel()
            mentor = mentor_model_instance.get_mentor_by_id(mentor_id)
            if not mentor:
                return {'error': 'Mentor not found'}, 404
            
            return {'mentor': mentor}, 200
            
        except Exception as e:
            return {'error': str(e)}, 500

@mentor_ns.route('/<string:mentor_id>/request')
class MentorRequestResource(Resource):
    @require_auth
    def post(self, mentor_id):
        """Request mentorship"""
        try:
            data = request.get_json()
            student_id = g.current_user['uid']
            
            mentor_model_instance = MentorModel()
            mentor = mentor_model_instance.get_mentor_by_id(mentor_id)
            if not mentor:
                return {'error': 'Mentor not found'}, 404
            
            message = data.get('message', '')
            
            connection_id = mentor_model_instance.create_connection(student_id, mentor_id, message)
            
            notification_service = NotificationService()
            notification_service.send_mentor_request_notification(
                mentor['userId'],
                g.current_user['displayName']
            )
            
            return {
                'message': 'Mentorship request sent successfully',
                'connectionId': connection_id
            }, 201
            
        except Exception as e:
            return {'error': str(e)}, 500
