from utils.database import db

class UserModel:
    @staticmethod
    def create_user(user_data):
        return db.create_document('users', user_data)
    
    @staticmethod
    def get_user_by_id(user_id):
        return db.get_document('users', user_id)
    
    @staticmethod
    def get_user_by_email(email):
        users = db.query_collection('users', filters=[('email', '==', email)])
        return users[0] if users else None
    
    @staticmethod
    def update_user(user_id, data):
        db.update_document('users', user_id, data)
    
    @staticmethod
    def delete_user(user_id):
        db.delete_document('users', user_id)
    
    @staticmethod
    def get_all_users():
        return db.query_collection('users')
    
    @staticmethod
    def add_points(user_id, points):
        user = db.get_document('users', user_id)
        if user:
            current_points = user.get('points', 0)
            new_points = current_points + points
            
            from utils.helpers import get_level_from_points
            new_level = get_level_from_points(new_points)
            
            db.update_document('users', user_id, {
                'points': new_points,
                'level': new_level
            })
    
    @staticmethod
    def add_badge(user_id, badge_id):
        user = db.get_document('users', user_id)
        if user:
            badges = user.get('badges', [])
            if badge_id not in badges:
                badges.append(badge_id)
                db.update_document('users', user_id, {'badges': badges})
    
    @staticmethod
    def get_leaderboard(limit=10):
        return db.query_collection(
            'users',
            order_by=('points', 'desc'),
            limit=limit
        )

# # /BACKEND/models/user_model.py
# from utils.database import db

# class UserModel:
#     @staticmethod
#     def create_user(user_data):
#         return db.create_document('users', user_data)
    
#     @staticmethod
#     def get_user_by_id(user_id):
#         user = db.get_document('users', user_id)
#         if user:
#             user['uid'] = user.get('id', user_id)  # Ensure uid is set
#         return user
    
#     @staticmethod
#     def get_user_by_email(email):
#         users = db.query_collection('users', filters=[('email', '==', email)])
#         if users:
#             user = users[0]
#             user['uid'] = user.get('id', user.get('uid'))
#             return user
#         return None
    
#     @staticmethod
#     def update_user(user_id, data):
#         db.update_document('users', user_id, data)
    
#     @staticmethod
#     def delete_user(user_id):
#         db.delete_document('users', user_id)
    
#     @staticmethod
#     def get_all_users():
#         return db.query_collection('users')
    
#     @staticmethod
#     def add_points(user_id, points):
#         user = db.get_document('users', user_id)
#         if user:
#             current_points = user.get('points', 0)
#             new_points = current_points + points
            
#             from utils.helpers import get_level_from_points
#             new_level = get_level_from_points(new_points)
            
#             db.update_document('users', user_id, {
#                 'points': new_points,
#                 'level': new_level
#             })
    
#     @staticmethod
#     def add_badge(user_id, badge_id):
#         user = db.get_document('users', user_id)
#         if user:
#             badges = user.get('badges', [])
#             if badge_id not in badges:
#                 badges.append(badge_id)
#                 db.update_document('users', user_id, {'badges': badges})
    
#     @staticmethod
#     def get_leaderboard(limit=10):
#         return db.query_collection(
#             'users',
#             order_by=('points', 'desc'),
#             limit=limit
#         )