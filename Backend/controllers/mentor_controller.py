from flask import request, jsonify, g
from flask_restx import Resource
from middleware.auth_middleware import require_auth
from models.mentor_model import MentorModel
from services.gamification_service import GamificationService
from services.notification_service import NotificationService
from utils.validators import validate_required_fields, validate_mentor_profile_data

class MentorController(Resource):
    def __init__(self):
        self.mentor_model = MentorModel()
        self.gamification_service = GamificationService()
        self.notification_service = NotificationService()

    @require_auth
    def register_as_mentor(self):
        try:
            data = request.get_json()
            required_fields = ['expertise', 'bio', 'availability']
            missing = validate_required_fields(data, required_fields)
            if missing:
                return jsonify({'error': f'Missing fields: {", ".join(missing)}'}), 400

            validation_errors = validate_mentor_profile_data(data)
            if validation_errors:
                return jsonify({'error': validation_errors}), 400

            mentor_profile = {
                'userId': g.current_user['uid'],
                'expertise': data['expertise'],
                'bio': data['bio'],
                'availability': data['availability'],
                'yearsOfExperience': data.get('yearsOfExperience', 0),
                'rating': 0,
                'reviews': []
            }

            success = self.mentor_model.register_mentor(mentor_profile)
            if not success:
                return jsonify({'error': 'Already registered as mentor'}), 400

            self.gamification_service.award_points(g.current_user['uid'], 'register_mentor')

            return jsonify({'message': 'Successfully registered as mentor'}), 201

        except Exception as e:
            return jsonify({'error': str(e)}), 500

    def get_all_mentors(self):
        try:
            subject = request.args.get('subject')
            expertise = request.args.get('expertise')

            if subject:
                mentors = self.mentor_model.get_mentors_by_subject(subject)
            elif expertise:
                mentors = self.mentor_model.get_mentors_by_expertise(expertise)
            else:
                mentors = self.mentor_model.get_all_mentors()

            return jsonify({'mentors': mentors}), 200

        except Exception as e:
            return jsonify({'error': str(e)}), 500

    def get_mentor(self, mentor_id):
        try:
            mentor = self.mentor_model.get_mentor_by_id(mentor_id)
            if not mentor:
                return jsonify({'error': 'Mentor not found'}), 404
            return jsonify({'mentor': mentor}), 200

        except Exception as e:
            return jsonify({'error': str(e)}), 500

    @require_auth
    def request_mentorship(self, mentor_id):
        try:
            user_id = g.current_user['uid']
            mentor = self.mentor_model.get_mentor_by_id(mentor_id)
            if not mentor:
                return jsonify({'error': 'Mentor not found'}), 404

            success = self.mentor_model.request_mentorship(mentor_id, user_id)
            if not success:
                return jsonify({'error': 'Unable to request mentorship'}), 400

            self.notification_service.send_mentorship_request_notification(
                mentor_id, g.current_user['displayName']
            )

            return jsonify({'message': 'Mentorship request sent'}), 200

        except Exception as e:
            return jsonify({'error': str(e)}), 500
