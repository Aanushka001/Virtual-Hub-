
## /BACKEND/services/matching_service.py

from services.ai_service import AIService
from models.group_model import GroupModel
from models.mentor_model import MentorModel
from models.resource_model import ResourceModel
from models.opportunity_model import OpportunityModel

class MatchingService:
    def __init__(self):
        self.ai_service = AIService()
    
    def get_recommended_groups(self, user_profile):
        available_groups = GroupModel.get_all_groups()
        
        if not available_groups:
            return []
        
        recommendations = self.ai_service.match_study_groups(user_profile, available_groups)
        return recommendations
    
    def get_recommended_mentors(self, user_profile):
        available_mentors = MentorModel.get_all_mentors()
        
        if not available_mentors:
            return []
        
        recommendations = self.ai_service.match_mentors(user_profile, available_mentors)
        return recommendations
    
    def get_recommended_resources(self, user_profile):
        user_groups = GroupModel.get_user_groups(user_profile['uid'])
        suggestions = self.ai_service.suggest_resources(user_profile, user_groups)
        
        recommended_resources = []
        
        for keyword in suggestions.get('keywords', []):
            resources = ResourceModel.get_resources_by_category(keyword)
            recommended_resources.extend(resources[:2])
        
        for category in suggestions.get('categories', []):
            resources = ResourceModel.get_resources_by_category(category)
            recommended_resources.extend(resources[:2])
        
        unique_resources = []
        seen_ids = set()
        for resource in recommended_resources:
            if resource['id'] not in seen_ids:
                unique_resources.append(resource)
                seen_ids.add(resource['id'])
        
        return unique_resources[:10]
    
    def get_recommended_opportunities(self, user_profile):
        suggestions = self.ai_service.suggest_opportunities(user_profile)
        
        recommended_opps = []
        
        difficulty = suggestions.get('difficulty', 'Beginner')
        difficulty_opps = OpportunityModel.get_opportunities_by_difficulty(difficulty)
        recommended_opps.extend(difficulty_opps[:3])
        
        for opp_type in suggestions.get('types', []):
            type_opps = OpportunityModel.get_opportunities_by_type(opp_type)
            recommended_opps.extend(type_opps[:2])
        
        unique_opps = []
        seen_ids = set()
        for opp in recommended_opps:
            if opp['id'] not in seen_ids:
                unique_opps.append(opp)
                seen_ids.add(opp['id'])
        
        return unique_opps[:10]
