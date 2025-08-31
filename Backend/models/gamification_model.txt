
## /BACKEND/models/gamification_model.py

from utils.database import db

class GamificationModel:
    @staticmethod
    def create_achievement(achievement_data):
        return db.create_document('achievements', achievement_data)
    
    @staticmethod
    def get_achievement_by_id(achievement_id):
        return db.get_document('achievements', achievement_id)
    
    @staticmethod
    def get_all_achievements():
        return db.query_collection('achievements')
    
    @staticmethod
    def award_badge(user_id, badge_id):
        badge_data = {
            'userId': user_id,
            'badgeId': badge_id,
            'awardedAt': db.get_timestamp()
        }
        user_badge_id = f"{user_id}_{badge_id}"
        
        existing = db.get_document('user_badges', user_badge_id)
        if not existing:
            badge_data['id'] = user_badge_id
            db.create_document('user_badges', badge_data)
            return True
        return False
    
    @staticmethod
    def get_user_badges(user_id):
        return db.query_collection('user_badges', filters=[('userId', '==', user_id)])
    
    @staticmethod
    def create_notification(user_id, title, message, notification_type='info', data=None):
        notification_data = {
            'userId': user_id,
            'title': title,
            'message': message,
            'type': notification_type,
            'data': data or {},
            'isRead': False
        }
        return db.create_document('notifications', notification_data)
    
    @staticmethod
    def get_user_notifications(user_id, limit=20):
        return db.query_collection(
            'notifications',
            filters=[('userId', '==', user_id)],
            order_by=('createdAt', 'desc'),
            limit=limit
        )
    
    @staticmethod
    def mark_notification_read(notification_id):
        db.update_document('notifications', notification_id, {'isRead': True})
    
    @staticmethod
    def update_leaderboard():
        users = db.query_collection('users', order_by=('points', 'desc'), limit=100)
        
        rankings = []
        for i, user in enumerate(users):
            rankings.append({
                'userId': user['uid'],
                'name': user['displayName'],
                'points': user['points'],
                'level': user['level'],
                'badges': len(user.get('badges', [])),
                'rank': i + 1
            })
        
        leaderboard_data = {
            'id': 'global',
            'type': 'global',
            'rankings': rankings,
            'lastUpdated': db.get_timestamp()
        }
        
        existing = db.get_document('leaderboard', 'global')
        if existing:
            db.update_document('leaderboard', 'global', leaderboard_data)
        else:
            db.create_document('leaderboard', leaderboard_data)
    
    @staticmethod
    def get_leaderboard(leaderboard_type='global'):
        return db.get_document('leaderboard', leaderboard_type)
