from utils.database import db

class OpportunityModel:
    @staticmethod
    def create_opportunity(opportunity_data):
        opportunity_data['isActive'] = True
        opportunity_data['applicants'] = 0
        return db.create_document('opportunities', opportunity_data)
    
    @staticmethod
    def get_opportunity_by_id(opportunity_id):
        return db.get_document('opportunities', opportunity_id)
    
    @staticmethod
    def get_all_opportunities():
        return db.query_collection('opportunities', filters=[('isActive', '==', True)])
    
    @staticmethod
    def get_opportunities_by_type(opp_type):
        return db.query_collection(
            'opportunities',
            filters=[('type', '==', opp_type), ('isActive', '==', True)]
        )
    
    @staticmethod
    def get_opportunities_by_difficulty(difficulty):
        return db.query_collection(
            'opportunities',
            filters=[('difficulty', '==', difficulty), ('isActive', '==', True)]
        )
    
    @staticmethod
    def update_opportunity(opportunity_id, data):
        db.update_document('opportunities', opportunity_id, data)
    
    @staticmethod
    def apply_to_opportunity(opportunity_id, user_id, application_data):
        application = {
            'opportunityId': opportunity_id,
            'userId': user_id,
            'applicationData': application_data,
            'status': 'applied'
        }
        
        app_id = db.create_document('opportunity_applications', application)
        
        opportunity = db.get_document('opportunities', opportunity_id)
        if opportunity:
            current_applicants = opportunity.get('applicants', 0)
            db.update_document('opportunities', opportunity_id, {
                'applicants': current_applicants + 1
            })
        
        return app_id
    
    @staticmethod
    def get_user_applications(user_id):
        return db.query_collection(
            'opportunity_applications',
            filters=[('userId', '==', user_id)]
        )
    
    @staticmethod
    def get_opportunity_applications(opportunity_id):
        return db.query_collection(
            'opportunity_applications',
            filters=[('opportunityId', '==', opportunity_id)]
        )

# # /BACKEND/models/opportunity_model.py
# from utils.database import db

# class OpportunityModel:
#     @staticmethod
#     def create_opportunity(opportunity_data):
#         opportunity_data['isActive'] = True
#         opportunity_data['participants'] = []
#         return db.create_document('opportunities', opportunity_data)
    
#     @staticmethod
#     def get_opportunity_by_id(opportunity_id):
#         return db.get_document('opportunities', opportunity_id)
    
#     @staticmethod
#     def get_all_opportunities():
#         return db.query_collection('opportunities', filters=[('isActive', '==', True)])
    
#     @staticmethod
#     def get_opportunities_by_type(opp_type):
#         return db.query_collection(
#             'opportunities',
#             filters=[('type', '==', opp_type), ('isActive', '==', True)]
#         )
    
#     @staticmethod
#     def get_opportunities_by_difficulty(difficulty):
#         return db.query_collection(
#             'opportunities',
#             filters=[('difficulty', '==', difficulty), ('isActive', '==', True)]
#         )
    
#     @staticmethod
#     def update_opportunity(opportunity_id, data):
#         db.update_document('opportunities', opportunity_id, data)
    
#     @staticmethod
#     def register_participant(opportunity_id, user_id):
#         opportunity = db.get_document('opportunities', opportunity_id)
#         if opportunity:
#             participants = opportunity.get('participants', [])
#             if user_id not in participants:
#                 participants.append(user_id)
#                 db.update_document('opportunities', opportunity_id, {'participants': participants})
#                 return True
#         return False