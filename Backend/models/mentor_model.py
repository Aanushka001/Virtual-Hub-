from utils.database import db

class MentorModel:
    @staticmethod
    def create_mentor(mentor_data):
        mentor_data['isActive'] = True
        mentor_data['totalMentees'] = 0
        mentor_data['activeMentees'] = 0
        mentor_data['rating'] = 5.0
        return db.create_document('mentors', mentor_data)
    
    @staticmethod
    def get_mentor_by_id(mentor_id):
        return db.get_document('mentors', mentor_id)
    
    @staticmethod
    def get_mentor_by_user_id(user_id):
        mentors = db.query_collection('mentors', filters=[('userId', '==', user_id)])
        return mentors[0] if mentors else None
    
    @staticmethod
    def get_all_mentors():
        return db.query_collection('mentors', filters=[('isActive', '==', True)])
    
    @staticmethod
    def get_mentors_by_expertise(expertise):
        return db.query_collection(
            'mentors',
            filters=[('expertise', '==', expertise), ('isActive', '==', True)]
        )
    
    @staticmethod
    def update_mentor(mentor_id, data):
        db.update_document('mentors', mentor_id, data)
    
    @staticmethod
    def create_connection(student_id, mentor_id, message):
        connection_data = {
            'studentId': student_id,
            'mentorId': mentor_id,
            'message': message,
            'status': 'pending'
        }
        return db.create_document('mentor_connections', connection_data)
    
    @staticmethod
    def update_connection_status(connection_id, status):
        db.update_document('mentor_connections', connection_id, {'status': status})
    
    @staticmethod
    def get_mentor_connections(mentor_id):
        return db.query_collection(
            'mentor_connections',
            filters=[('mentorId', '==', mentor_id)]
        )
    
    @staticmethod
    def get_student_connections(student_id):
        return db.query_collection(
            'mentor_connections',
            filters=[('studentId', '==', student_id)]
        )
# # C:\Users\aanus\Desktop\Maximally AI Shipathon\Backend\models\mentor_model.py
# from utils.database import db

# class MentorModel:
#     @staticmethod
#     def create_mentor(mentor_data):
#         mentor_data['isActive'] = True
#         mentor_data['totalMentees'] = 0
#         mentor_data['activeMentees'] = 0
#         mentor_data['rating'] = 5.0
#         return db.create_document('mentors', mentor_data)
    
#     @staticmethod
#     def get_mentor_by_id(mentor_id):
#         return db.get_document('mentors', mentor_id)
    
#     @staticmethod
#     def get_mentor_by_user_id(user_id):
#         mentors = db.query_collection('mentors', filters=[('userId', '==', user_id)])
#         return mentors[0] if mentors else None
    
#     @staticmethod
#     def get_all_mentors():
#         return db.query_collection('mentors', filters=[('isActive', '==', True)])
    
#     @staticmethod
#     def get_mentors_by_expertise(expertise):
#         return db.query_collection(
#             'mentors',
#             filters=[('expertise', '==', expertise), ('isActive', '==', True)]
#         )
    
#     @staticmethod
#     def update_mentor(mentor_id, data):
#         db.update_document('mentors', mentor_id, data)
    
#     @staticmethod
#     def create_connection(student_id, mentor_id, message):
#         connection_data = {
#             'studentId': student_id,
#             'mentorId': mentor_id,
#             'message': message,
#             'status': 'pending'
#         }
#         return db.create_document('mentor_connections', connection_data)
    
#     @staticmethod
#     def update_connection_status(connection_id, status):
#         db.update_document('mentor_connections', connection_id, {'status': status})
    
#     @staticmethod
#     def get_mentor_connections(mentor_id):
#         return db.query_collection(
#             'mentor_connections',
#             filters=[('mentorId', '==', mentor_id)]
#         )
    
#     @staticmethod
#     def get_student_connections(student_id):
#         return db.query_collection(
#             'mentor_connections',
#             filters=[('studentId', '==', student_id)]
#         )