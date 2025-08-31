from flask import request, jsonify, g
from flask_restx import Resource
from middleware.auth_middleware import require_auth
from models.resource_model import ResourceModel
from services.notification_service import NotificationService
from utils.validators import validate_required_fields

class ResourceController(Resource):
    def __init__(self):
        self.resource_model = ResourceModel()
        self.notification_service = NotificationService()

    @require_auth
    def add_resource(self):
        try:
            data = request.get_json()
            required_fields = ['title', 'type', 'url']
            missing = validate_required_fields(data, required_fields)
            if missing:
                return jsonify({'error': f'Missing fields: {", ".join(missing)}'}), 400

            resource_data = {
                'title': data['title'],
                'type': data['type'],
                'url': data['url'],
                'description': data.get('description', ''),
                'subject': data.get('subject', ''),
                'createdBy': g.current_user['uid']
            }

            resource_id = self.resource_model.add_resource(resource_data)

            # Notify learners
            self.notification_service.send_new_resource_notification(resource_data)

            return jsonify({'message': 'Resource added successfully', 'resourceId': resource_id}), 201

        except Exception as e:
            return jsonify({'error': str(e)}), 500

    def get_resources(self):
        try:
            subject = request.args.get('subject')
            resource_type = request.args.get('type')

            if subject:
                resources = self.resource_model.get_resources_by_subject(subject)
            elif resource_type:
                resources = self.resource_model.get_resources_by_type(resource_type)
            else:
                resources = self.resource_model.get_all_resources()

            return jsonify({'resources': resources}), 200

        except Exception as e:
            return jsonify({'error': str(e)}), 500

    @require_auth
    def like_resource(self, resource_id):
        try:
            user_id = g.current_user['uid']
            success = self.resource_model.like_resource(resource_id, user_id)
            if not success:
                return jsonify({'error': 'Resource not found or already liked'}), 400
            return jsonify({'message': 'Resource liked successfully'}), 200

        except Exception as e:
            return jsonify({'error': str(e)}), 500

    @require_auth
    def save_resource(self, resource_id):
        try:
            user_id = g.current_user['uid']
            success = self.resource_model.save_resource(resource_id, user_id)
            if not success:
                return jsonify({'error': 'Resource not found or already saved'}), 400
            return jsonify({'message': 'Resource saved successfully'}), 200

        except Exception as e:
            return jsonify({'error': str(e)}), 500
