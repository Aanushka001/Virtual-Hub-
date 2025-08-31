from utils.database import db

class ResourceModel:
    @staticmethod
    def create_resource(resource_data):
        resource_data['isApproved'] = False
        resource_data['isPublic'] = True
        resource_data['downloadCount'] = 0
        resource_data['rating'] = 0.0
        return db.create_document('resources', resource_data)
    
    @staticmethod
    def get_resource_by_id(resource_id):
        return db.get_document('resources', resource_id)
    
    @staticmethod
    def get_all_resources():
        return db.query_collection(
            'resources',
            filters=[('isApproved', '==', True), ('isPublic', '==', True)]
        )
    
    @staticmethod
    def get_resources_by_category(category):
        return db.query_collection(
            'resources',
            filters=[
                ('category', '==', category),
                ('isApproved', '==', True),
                ('isPublic', '==', True)
            ]
        )
    
    @staticmethod
    def get_resources_by_type(resource_type):
        return db.query_collection(
            'resources',
            filters=[
                ('type', '==', resource_type),
                ('isApproved', '==', True),
                ('isPublic', '==', True)
            ]
        )
    
    @staticmethod
    def get_user_resources(user_id):
        return db.query_collection('resources', filters=[('uploadedBy', '==', user_id)])
    
    @staticmethod
    def update_resource(resource_id, data):
        db.update_document('resources', resource_id, data)
    
    @staticmethod
    def approve_resource(resource_id):
        db.update_document('resources', resource_id, {'isApproved': True})
    
    @staticmethod
    def increment_download(resource_id):
        resource = db.get_document('resources', resource_id)
        if resource:
            current_count = resource.get('downloadCount', 0)
            db.update_document('resources', resource_id, {'downloadCount': current_count + 1})
    
    @staticmethod
    def get_pending_resources():
        return db.query_collection('resources', filters=[('isApproved', '==', False)])
# # /BACKEND/models/resource_model.py
# from utils.database import db

# class ResourceModel:
#     @staticmethod
#     def create_resource(resource_data):
#         resource_data['isApproved'] = False
#         resource_data['downloadCount'] = 0
#         resource_data['rating'] = 0.0
#         return db.create_document('resources', resource_data)
    
#     @staticmethod
#     def get_resource_by_id(resource_id):
#         return db.get_document('resources', resource_id)
    
#     @staticmethod
#     def get_all_resources():
#         return db.query_collection('resources', filters=[('isApproved', '==', True)])
    
#     @staticmethod
#     def get_resources_by_category(category):
#         return db.query_collection(
#             'resources',
#             filters=[('category', '==', category), ('isApproved', '==', True)]
#         )
    
#     @staticmethod
#     def get_user_resources(user_id):
#         return db.query_collection('resources', filters=[('uploadedBy', '==', user_id)])
    
#     @staticmethod
#     def update_resource(resource_id, data):
#         db.update_document('resources', resource_id, data)
    
#     @staticmethod
#     def approve_resource(resource_id):
#         db.update_document('resources', resource_id, {'isApproved': True})