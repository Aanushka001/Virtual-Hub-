from utils.database import db

class GroupModel:
    @staticmethod
    def create_group(group_data):
        group_data['currentMembers'] = 1
        group_data['isActive'] = True
        return db.create_document('study_groups', group_data)
    
    @staticmethod
    def get_group_by_id(group_id):
        return db.get_document('study_groups', group_id)
    
    @staticmethod
    def get_all_groups():
        return db.query_collection('study_groups', filters=[('isActive', '==', True)])
    
    @staticmethod
    def get_groups_by_subject(subject):
        return db.query_collection(
            'study_groups',
            filters=[('subject', '==', subject), ('isActive', '==', True)]
        )
    
    @staticmethod
    def update_group(group_id, data):
        db.update_document('study_groups', group_id, data)
    
    @staticmethod
    def join_group(group_id, user_id):
        group = db.get_document('study_groups', group_id)
        if group:
            members = group.get('members', [])
            max_members = group.get('maxMembers', 5)
            
            if len(members) < max_members and user_id not in members:
                members.append(user_id)
                db.update_document('study_groups', group_id, {
                    'members': members,
                    'currentMembers': len(members)
                })
                return True
        return False
    
    @staticmethod
    def leave_group(group_id, user_id):
        group = db.get_document('study_groups', group_id)
        if group:
            members = group.get('members', [])
            if user_id in members:
                members.remove(user_id)
                db.update_document('study_groups', group_id, {
                    'members': members,
                    'currentMembers': len(members)
                })
                return True
        return False
    
    @staticmethod
    def get_user_groups(user_id):
        return db.query_collection(
            'study_groups',
            filters=[('members', 'array_contains', user_id)]
        )
    
    @staticmethod
    def delete_group(group_id):
        db.update_document('study_groups', group_id, {'isActive': False})

# # /BACKEND/models/group_model.py
# from utils.database import db

# class GroupModel:
#     @staticmethod
#     def create_group(group_data):
#         group_data['currentMembers'] = 1
#         group_data['isActive'] = True
#         return db.create_document('study_groups', group_data)
    
#     @staticmethod
#     def get_group_by_id(group_id):
#         return db.get_document('study_groups', group_id)
    
#     @staticmethod
#     def get_all_groups():
#         return db.query_collection('study_groups', filters=[('isActive', '==', True)])
    
#     @staticmethod
#     def get_groups_by_subject(subject):
#         return db.query_collection(
#             'study_groups',
#             filters=[('subject', '==', subject), ('isActive', '==', True)]
#         )
    
#     @staticmethod
#     def update_group(group_id, data):
#         db.update_document('study_groups', group_id, data)
    
#     @staticmethod
#     def join_group(group_id, user_id):
#         group = db.get_document('study_groups', group_id)
#         if group:
#             members = group.get('members', [])
#             max_members = group.get('maxMembers', 5)
            
#             if len(members) < max_members and user_id not in members:
#                 members.append(user_id)
#                 db.update_document('study_groups', group_id, {
#                     'members': members,
#                     'currentMembers': len(members)
#                 })
#                 return True
#         return False
    
#     @staticmethod
#     def leave_group(group_id, user_id):
#         group = db.get_document('study_groups', group_id)
#         if group:
#             members = group.get('members', [])
#             if user_id in members:
#                 members.remove(user_id)
#                 db.update_document('study_groups', group_id, {
#                     'members': members,
#                     'currentMembers': len(members)
#                 })
#                 return True
#         return False
    
#     @staticmethod
#     def get_user_groups(user_id):
#         return db.query_collection(
#             'study_groups',
#             filters=[('members', 'array_contains', user_id)]
#         )
    
#     @staticmethod
#     def delete_group(group_id):
#         db.update_document('study_groups', group_id, {'isActive': False})