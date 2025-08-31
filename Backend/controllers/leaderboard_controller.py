from flask import request, jsonify, g
from flask_restx import Resource
from middleware.auth_middleware import require_auth
from models.opportunity_model import OpportunityModel
from services.notification_service import NotificationService
from utils.validators import validate_required_fields

class OpportunityController(Resource):
    def __init__(self):
        self.opportunity_model = OpportunityModel()
        self.notification_service = NotificationService()

    @require_auth
    def add_opportunity(self):
        try:
            data = request.get_json()
            required_fields = ['title', 'type', 'deadline']
            missing = validate_required_fields(data, required_fields)
            if missing:
                return jsonify({'error': f'Missing fields: {", ".join(missing)}'}), 400

            opportunity_data = {
                'title': data['title'],
                'type': data['type'],   # e.g., Internship, Scholarship, Hackathon
                'deadline': data['deadline'],
                'description': data.get('description', ''),
                'link': data.get('link', ''),
                'postedBy': g.current_user['uid']
            }

            opportunity_id = self.opportunity_model.add_opportunity(opportunity_data)

            # Notify learners
            self.notification_service.send_new_opportunity_notification(opportunity_data)

            return jsonify({'message': 'Opportunity added successfully', 'opportunityId': opportunity_id}), 201

        except Exception as e:
            return jsonify({'error': str(e)}), 500

    def get_opportunities(self):
        try:
            opp_type = request.args.get('type')

            if opp_type:
                opportunities = self.opportunity_model.get_opportunities_by_type(opp_type)
            else:
                opportunities = self.opportunity_model.get_all_opportunities()

            return jsonify({'opportunities': opportunities}), 200

        except Exception as e:
            return jsonify({'error': str(e)}), 500

    @require_auth
    def apply_opportunity(self, opportunity_id):
        try:
            user_id = g.current_user['uid']
            success = self.opportunity_model.apply_opportunity(opportunity_id, user_id)
            if not success:
                return jsonify({'error': 'Opportunity not found or already applied'}), 400

            # Notify mentor/admin that someone applied
            self.notification_service.send_opportunity_application_notification(opportunity_id, user_id)

            return jsonify({'message': 'Applied to opportunity successfully'}), 200

        except Exception as e:
            return jsonify({'error': str(e)}), 500
