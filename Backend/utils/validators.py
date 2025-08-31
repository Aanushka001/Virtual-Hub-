import re
from datetime import datetime

def validate_email(email):
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def validate_password(password):
    return len(password) >= 6

def validate_required_fields(data, required_fields):
    missing = []
    for field in required_fields:
        if field not in data or not data[field]:
            missing.append(field)
    return missing

def validate_user_data(data):
    errors = []
    
    if 'email' in data and not validate_email(data['email']):
        errors.append('Invalid email format')
    
    if 'password' in data and not validate_password(data['password']):
        errors.append('Password must be at least 6 characters')
    
    if 'role' in data and data['role'] not in ['student', 'mentor', 'admin']:
        errors.append('Invalid role')
    
    return errors

def validate_group_data(data):
    errors = []
    
    required = ['name', 'subject', 'level']
    missing = validate_required_fields(data, required)
    if missing:
        errors.extend([f'{field} is required' for field in missing])
    
    if 'level' in data and data['level'] not in ['Beginner', 'Intermediate', 'Advanced']:
        errors.append('Invalid level')
    
    if 'maxMembers' in data and (not isinstance(data['maxMembers'], int) or data['maxMembers'] < 1):
        errors.append('Max members must be a positive integer')
    
    return errors

def validate_resource_data(data):
    errors = []
    
    required = ['title', 'type', 'category']
    missing = validate_required_fields(data, required)
    if missing:
        errors.extend([f'{field} is required' for field in missing])
    
    if 'type' in data and data['type'] not in ['PDF', 'Video', 'Article', 'Link']:
        errors.append('Invalid resource type')
    
    return errors

def validate_opportunity_data(data):
    errors = []
    
    required = ['title', 'type', 'difficulty', 'deadline']
    missing = validate_required_fields(data, required)
    if missing:
        errors.extend([f'{field} is required' for field in missing])
    
    if 'type' in data and data['type'] not in ['Competition', 'Workshop', 'Internship', 'Event']:
        errors.append('Invalid opportunity type')
    
    if 'difficulty' in data and data['difficulty'] not in ['Beginner', 'Intermediate', 'Advanced']:
        errors.append('Invalid difficulty level')
    
    return errors


# # C:\Users\aanus\Desktop\Maximally AI Shipathon\Backend\utils\validators.py
# import re
# from datetime import datetime

# def validate_email(email):
#     pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
#     return re.match(pattern, email) is not None

# def validate_password(password):
#     return len(password) >= 6

# def validate_required_fields(data, required_fields):
#     missing = []
#     for field in required_fields:
#         if field not in data or not data[field]:
#             missing.append(field)
#     return missing

# def validate_user_data(data):
#     errors = []
    
#     if 'email' in data and not validate_email(data['email']):
#         errors.append('Invalid email format')
    
#     if 'password' in data and not validate_password(data['password']):
#         errors.append('Password must be at least 6 characters')
    
#     if 'role' in data and data['role'] not in ['student', 'mentor', 'admin']:
#         errors.append('Invalid role')
    
#     return errors

# def validate_group_data(data):
#     errors = []
    
#     required = ['name', 'subject', 'level']
#     missing = validate_required_fields(data, required)
#     if missing:
#         errors.extend([f'{field} is required' for field in missing])
    
#     if 'level' in data and data['level'] not in ['Beginner', 'Intermediate', 'Advanced']:
#         errors.append('Invalid level')
    
#     if 'maxMembers' in data and (not isinstance(data['maxMembers'], int) or data['maxMembers'] < 1):
#         errors.append('Max members must be a positive integer')
    
#     return errors

# def validate_resource_data(data):
#     errors = []
    
#     required = ['title', 'type', 'category']
#     missing = validate_required_fields(data, required)
#     if missing:
#         errors.extend([f'{field} is required' for field in missing])
    
#     if 'type' in data and data['type'] not in ['PDF', 'Video', 'Article', 'Link']:
#         errors.append('Invalid resource type')
    
#     return errors

# def validate_opportunity_data(data):
#     errors = []
    
#     required = ['title', 'type', 'difficulty', 'deadline']
#     missing = validate_required_fields(data, required)
#     if missing:
#         errors.extend([f'{field} is required' for field in missing])
    
#     if 'type' in data and data['type'] not in ['Competition', 'Workshop', 'Internship', 'Event']:
#         errors.append('Invalid opportunity type')
    
#     if 'difficulty' in data and data['difficulty'] not in ['Beginner', 'Intermediate', 'Advanced']:
#         errors.append('Invalid difficulty level')
    
#     return errors