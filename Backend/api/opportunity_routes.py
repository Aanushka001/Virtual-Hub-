
# /BACKEND/api/opportunity_routes.py
from flask import request, g
from flask_restx import Namespace, Resource, fields
from middleware.auth_middleware import require_auth
from models.opportunity_model import OpportunityModel
from services.gamification_service import GamificationService
from utils.validators import validate_opportunity_data, validate_required_fields

opportunity_ns = Namespace('opportunities', description='Opportunity operations')

opportunity_model = opportunity_ns.model('Opportunity', {
    'title': fields.String(required=True),
    'type': fields.String(required=True, enum=['Competition', 'Workshop', 'Internship', 'Event']),
    'difficulty': fields.String(required=True, enum=['Beginner', 'Intermediate', 'Advanced']),
    'deadline': fields.String(required=True),
    'description': fields.String(),
    'requirements': fields.List(fields.String()),
    'prizes': fields.String(),
    'organizer': fields.String()
})

@opportunity_ns.route('')
class OpportunityListResource(Resource):
    def get(self):
        """Get all opportunities"""
        try:
            opp_type = request.args.get('type')
            difficulty = request.args.get('difficulty')
            
            opportunity_model_instance = OpportunityModel()
            if opp_type:
                opportunities = opportunity_model_instance.get_opportunities_by_type(opp_type)
            elif difficulty:
                opportunities = opportunity_model_instance.get_opportunities_by_difficulty(difficulty)
            else:
                opportunities = opportunity_model_instance.get_all_opportunities()
            
            return {'opportunities': opportunities}, 200
            
        except Exception as e:
            return {'error': str(e)}, 500
    
    @opportunity_ns.expect(opportunity_model)
    @require_auth
    def post(self):
        """Create new opportunity"""
        try:
            data = request.get_json()
            
            required_fields = ['title', 'type', 'difficulty', 'deadline']
            missing = validate_required_fields(data, required_fields)
            if missing:
                return {'error': f'Missing fields: {", ".join(missing)}'}, 400
            
            validation_errors = validate_opportunity_data(data)
            if validation_errors:
                return {'error': validation_errors}, 400
            
            opportunity_data = {
                'title': data['title'],
                'type': data['type'],
                'difficulty': data['difficulty'],
                'deadline': data['deadline'],
                'description': data.get('description', ''),
                'requirements': data.get('requirements', []),
                'prizes': data.get('prizes', ''),
                'organizer': data.get('organizer', ''),
                'createdBy': g.current_user['uid']
            }
            
            opportunity_model_instance = OpportunityModel()
            opportunity_id = opportunity_model_instance.create_opportunity(opportunity_data)
            
            gamification_service = GamificationService()
            gamification_service.award_points(g.current_user['uid'], 'organize_event')
            
            return {
                'message': 'Opportunity created successfully',
                'opportunityId': opportunity_id
            }, 201
            
        except Exception as e:
            return {'error': str(e)}, 500
