
## /BACKEND/services/notification_service.py

from models.gamification_model import GamificationModel
from flask_socketio import emit

class NotificationService:
    def __init__(self, socketio=None):
        self.socketio = socketio
        self.gamification_model = GamificationModel()
    
    def send_notification(self, user_id, title, message, notification_type='info', data=None):
        notification_id = self.gamification_model.create_notification(
            user_id, title, message, notification_type, data
        )
        
        if self.socketio:
            self.socketio.emit('notification', {
                'id': notification_id,
                'title': title,
                'message': message,
                'type': notification_type,
                'data': data
            }, room=user_id)
        
        return notification_id
    
    def send_group_notification(self, group_members, title, message, notification_type='info'):
        for member_id in group_members:
            self.send_notification(member_id, title, message, notification_type)
    
    def send_mentor_request_notification(self, mentor_id, student_name):
        self.send_notification(
            mentor_id,
            'New Mentor Request',
            f'{student_name} has requested you as a mentor',
            'mentor'
        )
    
    def send_group_join_notification(self, group_members, new_member_name, group_name):
        for member_id in group_members:
            self.send_notification(
                member_id,
                'New Group Member',
                f'{new_member_name} joined {group_name}',
                'group'
            )
    
    def send_resource_approval_notification(self, user_id, resource_title):
        self.send_notification(
            user_id,
            'Resource Approved',
            f'Your resource "{resource_title}" has been approved',
            'success'
        )
    
    def mark_notification_read(self, notification_id):
        self.gamification_model.mark_notification_read(notification_id)
    
    def get_user_notifications(self, user_id, limit=20):
        return self.gamification_model.get_user_notifications(user_id, limit)




# # /BACKEND/services/notification_service.py
# from models.gamification_model import GamificationModel

# class NotificationService:
#     def __init__(self, socketio=None):
#         self.socketio = socketio
#         self.gamification_model = GamificationModel()
    
#     def send_notification(self, user_id, title, message, notification_type='info', data=None):
#         """Send notification to user"""
#         notification_id = self.gamification_model.create_notification(
#             user_id, title, message, notification_type, data
#         )
        
#         if self.socketio:
#             self.socketio.emit('notification', {
#                 'id': notification_id,
#                 'title': title,
#                 'message': message,
#                 'type': notification_type,
#                 'data': data
#             }, room=user_id)
        
#         return notification_id
    
#     def send_group_notification(self, group_members, title, message, notification_type='info'):
#         """Send notification to all group members"""
#         for member_id in group_members:
#             self.send_notification(member_id, title, message, notification_type)
    
#     def send_mentor_request_notification(self, mentor_id, student_name):
#         """Notify mentor of new request"""
#         self.send_notification(
#             mentor_id,
#             'New Mentor Request',
#             f'{student_name} has requested you as a mentor',
#             'mentor'
#         )
    
#     def send_group_join_notification(self, group_members, new_member_name, group_name):
#         """Notify group members of new member"""
#         for member_id in group_members:
#             self.send_notification(
#                 member_id,
#                 'New Group Member',
#                 f'{new_member_name} joined {group_name}',
#                 'group'
#             )
    
#     def send_resource_approval_notification(self, user_id, resource_title):
#         """Notify user of resource approval"""
#         self.send_notification(
#             user_id,
#             'Resource Approved',
#             f'Your resource "{resource_title}" has been approved',
#             'success'
#         )
    
#     def mark_notification_read(self, notification_id):
#         """Mark notification as read"""
#         self.gamification_model.mark_notification_read(notification_id)
    
#     def get_user_notifications(self, user_id, limit=20):
#         """Get user notifications"""
#         return self.gamification_model.get_user_notifications(user_id, limit)

