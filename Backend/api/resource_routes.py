
# /BACKEND/api/resource_routes.py
from flask import request, g
from flask_restx import Namespace, Resource, fields
from middleware.auth_middleware import require_auth
from models.resource_model import ResourceModel
from services.gamification_service import GamificationService
from utils.validators import validate_resource_data, validate_required_fields

resource_ns = Namespace('resources', description='Resource operations')

resource_model = resource_ns.model('Resource', {
    'title': fields.String(required=True),
    'type': fields.String(required=True, enum=['PDF', 'Video', 'Article', 'Link']),
    'category': fields.String(required=True),
    'description': fields.String(),
    'url': fields.String(),
    'tags': fields.List(fields.String())
})

@resource_ns.route('')
class ResourceListResource(Resource):
    def get(self):
        """Get all approved resources"""
        try:
            category = request.args.get('category')
            resource_type = request.args.get('type')
            
            resource_model_instance = ResourceModel()
            if category:
                resources = resource_model_instance.get_resources_by_category(category)
            else:
                resources = resource_model_instance.get_all_resources()
            
            if resource_type:
                resources = [r for r in resources if r.get('type') == resource_type]
            
            return {'resources': resources}, 200
            
        except Exception as e:
            return {'error': str(e)}, 500
    
    @resource_ns.expect(resource_model)
    @require_auth
    def post(self):
        """Upload a new resource"""
        try:
            data = request.get_json()
            
            required_fields = ['title', 'type', 'category']
            missing = validate_required_fields(data, required_fields)
            if missing:
                return {'error': f'Missing fields: {", ".join(missing)}'}, 400
            
            validation_errors = validate_resource_data(data)
            if validation_errors:
                return {'error': validation_errors}, 400
            
            resource_data = {
                'title': data['title'],
                'type': data['type'],
                'category': data['category'],
                'description': data.get('description', ''),
                'url': data.get('url', ''),
                'tags': data.get('tags', []),
                'uploadedBy': g.current_user['uid'],
                'uploaderName': g.current_user['displayName']
            }
            
            resource_model_instance = ResourceModel()
            resource_id = resource_model_instance.create_resource(resource_data)
            
            gamification_service = GamificationService()
            gamification_service.award_points(g.current_user['uid'], 'share_resource')
            
            return {
                'message': 'Resource uploaded successfully',
                'resourceId': resource_id
            }, 201
            
        except Exception as e:
            return {'error': str(e)}, 500
