
## /BACKEND/services/gamification_service.py

from models.gamification_model import GamificationModel
from models.user_model import UserModel
from utils.helpers import calculate_points

class GamificationService:
    def __init__(self):
        self.gamification_model = GamificationModel()
        self.user_model = UserModel()
    
    def award_points(self, user_id, action_type, additional_data=None):
        points = calculate_points(action_type)
        if points > 0:
            self.user_model.add_points(user_id, points)
            
            self.gamification_model.create_notification(
                user_id,
                'Points Earned!',
                f'You earned {points} points for {action_type.replace("_", " ")}',
                'success',
                {'points': points, 'action': action_type}
            )
            
            self._check_for_badges(user_id, action_type, additional_data)
    
    def _check_for_badges(self, user_id, action_type, additional_data):
        user = self.user_model.get_user_by_id(user_id)
        if not user:
            return
        
        user_points = user.get('points', 0)
        current_badges = user.get('badges', [])
        
        badge_criteria = {
            'first_steps': {'points': 10, 'name': 'First Steps'},
            'active_learner': {'points': 100, 'name': 'Active Learner'},
            'knowledge_seeker': {'points': 500, 'name': 'Knowledge Seeker'},
            'community_leader': {'points': 1000, 'name': 'Community Leader'},
            'expert_contributor': {'points': 2000, 'name': 'Expert Contributor'}
        }
        
        for badge_id, criteria in badge_criteria.items():
            if badge_id not in current_badges and user_points >= criteria['points']:
                self._award_badge(user_id, badge_id, criteria['name'])
        
        action_badges = {
            'join_group': 'group_member',
            'become_mentor': 'mentor_badge',
            'win_hackathon': 'champion',
            'help_peer': 'helper'
        }
        
        if action_type in action_badges:
            badge_id = action_badges[action_type]
            if badge_id not in current_badges:
                self._award_badge(user_id, badge_id, badge_id.replace('_', ' ').title())
    
    def _award_badge(self, user_id, badge_id, badge_name):
        success = self.gamification_model.award_badge(user_id, badge_id)
        if success:
            self.user_model.add_badge(user_id, badge_id)
            
            self.gamification_model.create_notification(
                user_id,
                'New Badge Earned!',
                f'Congratulations! You earned the "{badge_name}" badge',
                'achievement',
                {'badge_id': badge_id, 'badge_name': badge_name}
            )
    
    def get_user_progress(self, user_id):
        user = self.user_model.get_user_by_id(user_id)
        if not user:
            return None
        
        badges = self.gamification_model.get_user_badges(user_id)
        notifications = self.gamification_model.get_user_notifications(user_id, limit=10)
        
        return {
            'points': user.get('points', 0),
            'level': user.get('level', 1),
            'badges': len(badges),
            'recent_badges': badges[:5],
            'notifications': notifications
        }
    
    def update_global_leaderboard(self):
        self.gamification_model.update_leaderboard()


# # /BACKEND/services/gamification_service.py
# from models.gamification_model import GamificationModel
# from models.user_model import UserModel
# from utils.helpers import calculate_points

# class GamificationService:
#     def __init__(self):
#         self.gamification_model = GamificationModel()
#         self.user_model = UserModel()
    
#     def award_points(self, user_id, action_type, additional_data=None):
#         """Award points to user for specific actions"""
#         points = calculate_points(action_type)
#         if points > 0:
#             self.user_model.add_points(user_id, points)
            
#             self.gamification_model.create_notification(
#                 user_id,
#                 'Points Earned!',
#                 f'You earned {points} points for {action_type.replace("_", " ")}',
#                 'success',
#                 {'points': points, 'action': action_type}
#             )
            
#             self._check_for_badges(user_id, action_type, additional_data)
    
#     def _check_for_badges(self, user_id, action_type, additional_data):
#         """Check and award badges based on user activity"""
#         user = self.user_model.get_user_by_id(user_id)
#         if not user:
#             return
        
#         user_points = user.get('points', 0)
#         current_badges = user.get('badges', [])
        
#         # Point-based badges
#         badge_criteria = {
#             'first_steps': {'points': 10, 'name': 'First Steps'},
#             'active_learner': {'points': 100, 'name': 'Active Learner'},
#             'knowledge_seeker': {'points': 500, 'name': 'Knowledge Seeker'},
#             'community_leader': {'points': 1000, 'name': 'Community Leader'},
#             'expert_contributor': {'points': 2000, 'name': 'Expert Contributor'}
#         }
        
#         for badge_id, criteria in badge_criteria.items():
#             if badge_id not in current_badges and user_points >= criteria['points']:
#                 self._award_badge(user_id, badge_id, criteria['name'])
        
#         # Action-based badges
#         action_badges = {
#             'join_group': 'group_member',
#             'become_mentor': 'mentor_badge',
#             'win_hackathon': 'champion',
#             'help_peer': 'helper'
#         }
        
#         if action_type in action_badges:
#             badge_id = action_badges[action_type]
#             if badge_id not in current_badges:
#                 self._award_badge(user_id, badge_id, badge_id.replace('_', ' ').title())
    
#     def _award_badge(self, user_id, badge_id, badge_name):
#         """Award badge to user"""
#         success = self.gamification_model.award_badge(user_id, badge_id)
#         if success:
#             self.user_model.add_badge(user_id, badge_id)
            
#             self.gamification_model.create_notification(
#                 user_id,
#                 'New Badge Earned!',
#                 f'Congratulations! You earned the "{badge_name}" badge',
#                 'achievement',
#                 {'badge_id': badge_id, 'badge_name': badge_name}
#             )
    
#     def get_user_progress(self, user_id):
#         """Get user progress and achievements"""
#         user = self.user_model.get_user_by_id(user_id)
#         if not user:
#             return None
        
#         badges = self.gamification_model.get_user_badges(user_id)
#         notifications = self.gamification_model.get_user_notifications(user_id, limit=10)
        
#         return {
#             'points': user.get('points', 0),
#             'level': user.get('level', 1),
#             'badges': len(badges),
#             'recent_badges': badges[:5],
#             'notifications': notifications
#         }
    
#     def update_global_leaderboard(self):
#         """Update global leaderboard"""
#         self.gamification_model.update_leaderboard()
