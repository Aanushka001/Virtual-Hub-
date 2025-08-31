
## /BACKEND/services/file_service.py

import os
import uuid
from werkzeug.utils import secure_filename
from config import Config
from utils.helpers import sanitize_filename

class FileService:
    def __init__(self):
        self.max_file_size = Config.MAX_FILE_SIZE
        self.allowed_extensions = Config.ALLOWED_EXTENSIONS
        self.upload_folder = 'uploads'
        
        if not os.path.exists(self.upload_folder):
            os.makedirs(self.upload_folder)
    
    def validate_file(self, file):
        if not file or file.filename == '':
            return False, 'No file selected'
        
        if not self._allowed_file(file.filename):
            return False, f'File type not allowed. Allowed types: {", ".join(self.allowed_extensions)}'
        
        file.seek(0, 2)
        file_size = file.tell()
        file.seek(0)
        
        if file_size > self.max_file_size:
            return False, f'File size exceeds {self.max_file_size // (1024*1024)}MB limit'
        
        return True, 'Valid file'
    
    def save_file(self, file, user_id):
        is_valid, message = self.validate_file(file)
        if not is_valid:
            return None, message
        
        filename = secure_filename(file.filename)
        filename = sanitize_filename(filename)
        
        file_extension = filename.rsplit('.', 1)[1].lower()
        unique_filename = f"{uuid.uuid4().hex}.{file_extension}"
        
        file_path = os.path.join(self.upload_folder, unique_filename)
        file.save(file_path)
        
        file_info = {
            'filename': filename,
            'unique_filename': unique_filename,
            'file_path': file_path,
            'file_size': os.path.getsize(file_path),
            'file_url': f'/api/files/{unique_filename}',
            'uploaded_by': user_id
        }
        
        return file_info, 'File uploaded successfully'
    
    def delete_file(self, file_path):
        try:
            if os.path.exists(file_path):
                os.remove(file_path)
                return True
        except Exception:
            pass
        return False
    
    def get_file_info(self, filename):
        file_path = os.path.join(self.upload_folder, filename)
        if os.path.exists(file_path):
            return {
                'filename': filename,
                'file_path': file_path,
                'file_size': os.path.getsize(file_path)
            }
        return None
    
    def _allowed_file(self, filename):
        return '.' in filename and \
               filename.rsplit('.', 1)[1].lower() in self.allowed_extensions
