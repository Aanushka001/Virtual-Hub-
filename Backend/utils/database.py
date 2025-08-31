import firebase_admin
from firebase_admin import credentials, firestore, auth, storage
from datetime import datetime
import json

class Database:
    _instance = None
    _db = None
    _bucket = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(Database, cls).__new__(cls)
            cls._initialize()
        return cls._instance
    
    @classmethod
    def _initialize(cls):
        try:
            firebase_admin.get_app()
        except ValueError:
            cred = credentials.Certificate({
                "type": "service_account",
                "project_id": "virtual-hub-fd3c7",
                "private_key_id": "1aea176544b3f4e6e697cde8fc41f2007124dedb",
                "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCYSqbXPx7rkhc8\nCs0SgHvrj5FnFm7B8ZeaOLmxStOKJ0sxUnM7J122LiX3lkoQnwkwCnUt7vDBw7mk\nHjhSi9YJJAPOwzi9omUZG7XABjkdXppL7Onrv57MpwBE4d2d4RIOHfvMpRCJ3rNY\nyNln1PbxJWaUsVXrO0oodLW23TPHL4Lj1LrnrcpCZNsAhkJvsX6RcBWK552lLn97\nqIbO8RcAXVOMJHJJPUqQFgKsexacMiUum+XMx9NsCUol+zND+Bet9CO3fwV3gjDv\n/KEWMI4LraoL6INHQuWf40nXGXsBYvftGIIlx9exkztpn6ytHoQ0HnbfSolmHzt/\nmF7vRqzhAgMBAAECggEACTsPzSDUpUoFQddpwgMAVTEuNVsPuuOuNmPVJYuNMjow\nKDzWIodqpQiRC+ZpINly5h2MKAzr541kgC/GEYLLpgwvyuWHApTdnzL7G44vrLm3\njSiUA9JpNABfV3gqmvoxwkyg9DDWcB+L1rLTMqRJlNOZLyQR5XXXiIeNHW4KSGVf\nOtloGqkZefoD+5C0YfSRipMShF0zW8SpoW2K2QP92woeJPPHvNEeV7WyjeCL8P0z\nDzqmjcOHimb2tl0rqDM/9P4V2aOAWwElgIl08LqfQhiq3qtkdPs1ibRzHS6HeJz2\nElwx9WlFwAMaHW+ZNfw1jgx3zNZTt9Cs6utrdL2pvQKBgQDGzUkiOV1WfjM6Cdta\n6wOdvujHU/XQFzOKUfGdANLR/ebFu27q7Il7n35Brq8eCPy1nlBfw7ibCTIqFg1S\n/NcBzOIeQYBLN0BYu3fB30wSMs4lMxoXoG41xL5t3wDaP8aamn1q6rsKx+SGuFwd\nqwR+9ciWfFP5s9gtgKv52i6VxwKBgQDEG6jxlxnFm4oziko9Ncd+4InFIcKVBCal\nzYvChZALzSAOUMoFYSiNY1i6+33f25f94A34a97zxvpeo7B6uvy6WcDJb86bwc3E\nP1O7x114g52+VQ/0JSp+xoArSFqqDH2JbQLp7d8/liCYQjiKKJz1/wbashglDQ5n\nEH7QGE8IFwKBgD4WlyStLc15lJ4nve5jP7ngierW+gqHdH1aok8alr0mwxA2Pan5\nPebyJQh2ehKzU9mVHB0Mj3c8JAKo6Hhmpu/VATnZ0yuqkdokkn5mMufsHh3YG+oN\nHN6GF8NQxn9jM6/NWCYwMUJos6KvqXVKmBjewkrdgYyW8okjipJ55dq5AoGAOgoF\nohqaIgW6jS5sclksRbymiZVIRVoJJiEDL/rfet6mkhYO9DChE9dHN2+e/VW8UgKx\nn8gtH/DPwJqpbGlSysQtbnCMsURWZbJoUbbbTwOE+AOsyREG1qZg4G51hsZTkQyW\nRC2GWQdRdj6DBUCn05Y6rRbwVmba0F3taiEHotkCgYEArV0nJKteusabrThWKjl1\nglcdyYRXqlURaFdcQlF75JseFYOpN9ogBogylEStQVUT8NJ1riob3TKjqVJn0wb5\nT9bXuAAPaDtWmYNamhDhxbnE821aQO5Wj8szfHNJUQ6+WbjO4yd/7JNTJklXJ38Z\ni03l4e9stA7TB5o/yXZJ27o=\n-----END PRIVATE KEY-----\n",
                "client_email": "firebase-adminsdk-fbsvc@virtual-hub-fd3c7.iam.gserviceaccount.com",
                "client_id": "107424926202738121319",
                "auth_uri":"https://accounts.google.com/o/oauth2/auth",
                "token_uri":"https://oauth2.googleapis.com/token"
            })
            firebase_admin.initialize_app(cred, {
                'storageBucket': 'virtual-hub-fd3c7.firebasestorage.app'
            })
        
        cls._db = firestore.client()
        cls._bucket = storage.bucket()
    
    @property
    def db(self):
        return self._db
    
    @property
    def bucket(self):
        return self._bucket
    
    @property
    def auth(self):
        return auth
    
    def get_timestamp(self):
        return firestore.SERVER_TIMESTAMP
    
    def create_document(self, collection, data):
        try:
            doc_ref = self._db.collection(collection).document()
            data['id'] = doc_ref.id
            data['createdAt'] = self.get_timestamp()
            data['updatedAt'] = self.get_timestamp()
            doc_ref.set(data)
            return doc_ref.id
        except Exception as e:
            print(f"Error creating document in {collection}: {str(e)}")
            raise e
    
    def get_document(self, collection, doc_id):
        try:
            doc = self._db.collection(collection).document(doc_id).get()
            if doc.exists:
                return doc.to_dict()
            return None
        except Exception as e:
            print(f"Error getting document {doc_id} from {collection}: {str(e)}")
            return None
    
    def update_document(self, collection, doc_id, data):
        try:
            data['updatedAt'] = self.get_timestamp()
            self._db.collection(collection).document(doc_id).update(data)
            return True
        except Exception as e:
            print(f"Error updating document {doc_id} in {collection}: {str(e)}")
            raise e
    
    def delete_document(self, collection, doc_id):
        try:
            self._db.collection(collection).document(doc_id).delete()
            return True
        except Exception as e:
            print(f"Error deleting document {doc_id} from {collection}: {str(e)}")
            raise e
    
    def query_collection(self, collection, filters=None, order_by=None, limit=None):
        try:
            query = self._db.collection(collection)
            
            if filters:
                for field, operator, value in filters:
                    query = query.where(filter=firestore.FieldFilter(field, operator, value))
            
            if order_by:
                field, direction = order_by
                if direction.upper() == 'DESCENDING':
                    query = query.order_by(field, direction=firestore.Query.DESCENDING)
                else:
                    query = query.order_by(field)
            
            if limit:
                query = query.limit(limit)
            
            docs = query.stream()
            return [doc.to_dict() for doc in docs]
        except Exception as e:
            print(f"Error querying collection {collection}: {str(e)}")
            return []
    
    def array_union(self, values):
        return firestore.ArrayUnion(values)
    
    def array_remove(self, values):
        return firestore.ArrayRemove(values)
    
    def increment(self, value=1):
        return firestore.Increment(value)
    
    def batch_write(self):
        return self._db.batch()
    
    def transaction(self):
        return self._db.transaction()
    
    def collection_group(self, collection_id):
        return self._db.collection_group(collection_id)

db_instance = Database()