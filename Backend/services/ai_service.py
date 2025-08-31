

## /BACKEND/services/ai_service.py

import requests
from config import Config

class AIService:
    def __init__(self):
        self.api_key = Config.AI_API_KEY
        self.api_url = Config.AI_API_URL
    
    def match_study_groups(self, user_profile, available_groups):
        try:
            prompt = f"""
            User Profile:
            - Interests: {user_profile.get('interests', [])}
            - Skills: {user_profile.get('skills', [])}
            - Level: {user_profile.get('level', 1)}
            
            Available Groups:
            {[{'name': g['name'], 'subject': g['subject'], 'level': g['level']} for g in available_groups]}
            
            Return the top 3 most suitable groups with compatibility scores.
            """
            
            recommendations = []
            for group in available_groups[:3]:
                score = self._calculate_compatibility_score(user_profile, group)
                recommendations.append({
                    'group': group,
                    'score': score,
                    'reason': f"Matches your {group['subject']} interests"
                })
            
            return sorted(recommendations, key=lambda x: x['score'], reverse=True)
        
        except Exception as e:
            return self._fallback_group_matching(user_profile, available_groups)
    
    def match_mentors(self, user_profile, available_mentors):
        try:
            recommendations = []
            user_interests = user_profile.get('interests', [])
            
            for mentor in available_mentors:
                score = 0
                mentor_expertise = mentor.get('expertise', '').lower()
                
                for interest in user_interests:
                    if interest.lower() in mentor_expertise:
                        score += 0.3
                
                if mentor.get('rating', 0) > 4.0:
                    score += 0.2
                
                if mentor.get('experience', '0') in ['3-5 years', '5+ years']:
                    score += 0.1
                
                recommendations.append({
                    'mentor': mentor,
                    'score': min(score, 1.0),
                    'reason': f"Expert in {mentor.get('expertise', 'various fields')}"
                })
            
            return sorted(recommendations, key=lambda x: x['score'], reverse=True)[:5]
        
        except Exception as e:
            return self._fallback_mentor_matching(user_profile, available_mentors)
    
    def suggest_resources(self, user_profile, user_groups):
        try:
            user_interests = user_profile.get('interests', [])
            group_subjects = [g.get('subject', '') for g in user_groups]
            
            keywords = user_interests + group_subjects
            
            return {
                'keywords': keywords,
                'categories': ['Programming', 'Design', 'Data Science'],
                'types': ['PDF', 'Video', 'Article']
            }
        
        except Exception as e:
            return {'keywords': [], 'categories': [], 'types': []}
    
    def suggest_opportunities(self, user_profile):
        try:
            user_level = user_profile.get('level', 1)
            interests = user_profile.get('interests', [])
            
            difficulty_mapping = {
                1: 'Beginner',
                2: 'Beginner',
                3: 'Intermediate',
                4: 'Intermediate',
                5: 'Advanced'
            }
            
            suggested_difficulty = difficulty_mapping.get(user_level, 'Beginner')
            
            return {
                'difficulty': suggested_difficulty,
                'categories': interests[:3],
                'types': ['Workshop', 'Competition']
            }
        
        except Exception as e:
            return {'difficulty': 'Beginner', 'categories': [], 'types': []}
    
    def _calculate_compatibility_score(self, user, group):
        score = 0.0
        
        user_interests = [i.lower() for i in user.get('interests', [])]
        group_subject = group.get('subject', '').lower()
        
        if any(interest in group_subject for interest in user_interests):
            score += 0.4
        
        user_level = user.get('level', 1)
        group_level = group.get('level', 'Beginner')
        
        level_mapping = {'Beginner': 1, 'Intermediate': 3, 'Advanced': 5}
        group_level_num = level_mapping.get(group_level, 1)
        
        level_diff = abs(user_level - group_level_num)
        if level_diff <= 1:
            score += 0.3
        elif level_diff <= 2:
            score += 0.1
        
        if group.get('currentMembers', 0) < group.get('maxMembers', 5):
            score += 0.3
        
        return min(score, 1.0)
    
    def _fallback_group_matching(self, user_profile, available_groups):
        return [{'group': g, 'score': 0.5, 'reason': 'General match'} for g in available_groups[:3]]
    
    def _fallback_mentor_matching(self, user_profile, available_mentors):
        return [{'mentor': m, 'score': 0.5, 'reason': 'General match'} for m in available_mentors[:3]]



# # /BACKEND/services/ai_service.py
# import requests
# from config import Config

# class AIService:
#     def __init__(self):
#         self.api_key = Config.AI_API_KEY
#         self.api_url = Config.AI_API_URL
    
#     def match_study_groups(self, user_profile, available_groups):
#         """AI-powered study group matching"""
#         try:
#             recommendations = []
#             for group in available_groups:
#                 score = self._calculate_compatibility_score(user_profile, group)
#                 recommendations.append({
#                     'group': group,
#                     'score': score,
#                     'reason': f"Matches your {group.get('subject', 'academic')} interests"
#                 })
            
#             return sorted(recommendations, key=lambda x: x['score'], reverse=True)[:5]
        
#         except Exception as e:
#             return self._fallback_group_matching(user_profile, available_groups)
    
#     def match_mentors(self, user_profile, available_mentors):
#         """AI-powered mentor matching"""
#         try:
#             recommendations = []
#             user_interests = user_profile.get('interests', [])
            
#             for mentor in available_mentors:
#                 score = 0
#                 mentor_expertise = mentor.get('expertise', '').lower()
                
#                 # Interest matching
#                 for interest in user_interests:
#                     if interest.lower() in mentor_expertise:
#                         score += 0.3
                
#                 # Rating bonus
#                 if mentor.get('rating', 0) > 4.0:
#                     score += 0.2
                
#                 # Experience bonus
#                 if mentor.get('experience', '0') in ['3-5 years', '5+ years']:
#                     score += 0.1
                
#                 # Availability bonus
#                 if mentor.get('activeMentees', 0) < 5:
#                     score += 0.4
                
#                 recommendations.append({
#                     'mentor': mentor,
#                     'score': min(score, 1.0),
#                     'reason': f"Expert in {mentor.get('expertise', 'various fields')}"
#                 })
            
#             return sorted(recommendations, key=lambda x: x['score'], reverse=True)[:5]
        
#         except Exception as e:
#             return self._fallback_mentor_matching(user_profile, available_mentors)
    
#     def suggest_resources(self, user_profile, user_groups):
#         """AI-powered resource suggestions"""
#         try:
#             user_interests = user_profile.get('interests', [])
#             group_subjects = [g.get('subject', '') for g in user_groups]
            
#             keywords = list(set(user_interests + group_subjects))
            
#             return {
#                 'keywords': keywords,
#                 'categories': ['Programming', 'Design', 'Data Science', 'Web Development'],
#                 'types': ['PDF', 'Video', 'Article']
#             }
        
#         except Exception as e:
#             return {'keywords': [], 'categories': [], 'types': []}
    
#     def suggest_opportunities(self, user_profile):
#         """AI-powered opportunity suggestions"""
#         try:
#             user_level = user_profile.get('level', 1)
#             interests = user_profile.get('interests', [])
            
#             difficulty_mapping = {
#                 1: 'Beginner',
#                 2: 'Beginner', 
#                 3: 'Intermediate',
#                 4: 'Intermediate',
#                 5: 'Advanced',
#                 6: 'Advanced',
#                 7: 'Advanced',
#                 8: 'Advanced'
#             }
            
#             suggested_difficulty = difficulty_mapping.get(user_level, 'Beginner')
            
#             return {
#                 'difficulty': suggested_difficulty,
#                 'categories': interests[:3],
#                 'types': ['Workshop', 'Competition', 'Internship']
#             }
        
#         except Exception as e:
#             return {'difficulty': 'Beginner', 'categories': [], 'types': []}
    
#     def _calculate_compatibility_score(self, user, group):
#         """Calculate compatibility score between user and group"""
#         score = 0.0
        
#         # Interest matching
#         user_interests = [i.lower() for i in user.get('interests', [])]
#         group_subject = group.get('subject', '').lower()
        
#         if any(interest in group_subject for interest in user_interests):
#             score += 0.4
        
#         # Level matching
#         user_level = user.get('level', 1)
#         group_level = group.get('level', 'Beginner')
        
#         level_mapping = {'Beginner': 1, 'Intermediate': 3, 'Advanced': 5}
#         group_level_num = level_mapping.get(group_level, 1)
        
#         level_diff = abs(user_level - group_level_num)
#         if level_diff <= 1:
#             score += 0.3
#         elif level_diff <= 2:
#             score += 0.1
        
#         # Availability in group
#         current_members = group.get('currentMembers', 0)
#         max_members = group.get('maxMembers', 5)
#         if current_members < max_members:
#             score += 0.3
        
#         return min(score, 1.0)
    
#     def _fallback_group_matching(self, user_profile, available_groups):
#         """Fallback matching when AI service fails"""
#         return [{'group': g, 'score': 0.5, 'reason': 'General match'} for g in available_groups[:3]]
    
#     def _fallback_mentor_matching(self, user_profile, available_mentors):
#         """Fallback matching when AI service fails"""
#         return [{'mentor': m, 'score': 0.5, 'reason': 'General match'} for m in available_mentors[:3]]

