# import firebase_admin
# from firebase_admin import credentials, firestore
# from datetime import datetime, timedelta
# import random
# import os

# def initialize_firebase():
#     if not firebase_admin._apps:
#         service_account_path = r"C:\Users\aanus\Desktop\Maximally AI Shipathon\Backend\firebase-credentials.json"
#         cred = credentials.Certificate(service_account_path)

#         firebase_admin.initialize_app(cred)
#     return firestore.client()

# def get_random_date(days_back=365):
#     return datetime.now() - timedelta(days=random.randint(0, days_back))

# def get_timestamp():
#     return firestore.SERVER_TIMESTAMP

# def seed_users(db):
#     users_data = [
#         {
#             "firstName": "Alice",
#             "lastName": "Johnson",
#             "email": "alice.johnson@email.com",
#             "displayName": "Alice Johnson",
#             "role": "student",
#             "skills": ["Python", "Machine Learning", "Data Analysis"],
#             "interests": ["AI", "Web Development", "Mobile Apps"],
#             "bio": "Computer Science student passionate about AI and machine learning. Looking to connect with fellow developers.",
#             "profilePicture": "https://randomuser.me/api/portraits/women/1.jpg",
#             "location": "San Francisco, CA",
#             "university": "Stanford University",
#             "graduationYear": 2025,
#             "gpa": 3.8,
#             "isVerified": True,
#             "points": random.randint(500, 2000),
#             "level": random.randint(3, 10),
#             "badges": ["first_login", "week_streak", "helpful_member"],
#             "preferences": {
#                 "studyStyle": "collaborative",
#                 "timeZone": "PST",
#                 "availability": ["evening", "weekend"]
#             },
#             "createdAt": get_random_date(200),
#             "lastActive": get_random_date(1)
#         },
#         {
#             "firstName": "Bob",
#             "lastName": "Smith",
#             "email": "bob.smith@email.com",
#             "displayName": "Bob Smith",
#             "role": "mentor",
#             "skills": ["React", "Node.js", "System Design", "Leadership"],
#             "interests": ["Startups", "Product Management", "Mentoring"],
#             "bio": "Senior Software Engineer with 8 years experience. Love helping students transition to industry.",
#             "profilePicture": "https://randomuser.me/api/portraits/men/2.jpg",
#             "location": "New York, NY",
#             "company": "Google",
#             "position": "Senior Software Engineer",
#             "experience": 8,
#             "isVerified": True,
#             "points": random.randint(1000, 3000),
#             "level": random.randint(8, 15),
#             "badges": ["mentor_helper", "active_participant", "collaboration_master"],
#             "preferences": {
#                 "mentorStyle": "hands-on",
#                 "timeZone": "EST",
#                 "availability": ["weekday_evening"]
#             },
#             "createdAt": get_random_date(300),
#             "lastActive": get_random_date(2)
#         },
#         {
#             "firstName": "Carol",
#             "lastName": "Davis",
#             "email": "carol.davis@email.com",
#             "displayName": "Carol Davis",
#             "role": "student",
#             "skills": ["Java", "Spring Boot", "Database Design"],
#             "interests": ["Backend Development", "Cloud Computing", "DevOps"],
#             "bio": "Final year CS student specializing in backend systems and cloud architecture.",
#             "profilePicture": "https://randomuser.me/api/portraits/women/3.jpg",
#             "location": "Austin, TX",
#             "university": "University of Texas",
#             "graduationYear": 2024,
#             "gpa": 3.9,
#             "isVerified": True,
#             "points": random.randint(400, 1800),
#             "level": random.randint(5, 12),
#             "badges": ["study_champion", "problem_solver"],
#             "preferences": {
#                 "studyStyle": "focused",
#                 "timeZone": "CST",
#                 "availability": ["morning", "afternoon"]
#             },
#             "createdAt": get_random_date(150),
#             "lastActive": get_random_date(3)
#         },
#         {
#             "firstName": "David",
#             "lastName": "Wilson",
#             "email": "david.wilson@email.com",
#             "displayName": "David Wilson",
#             "role": "admin",
#             "skills": ["System Administration", "Security", "Analytics"],
#             "interests": ["Platform Management", "User Experience", "Data Analytics"],
#             "bio": "Platform administrator ensuring smooth operations and user experience.",
#             "profilePicture": "https://randomuser.me/api/portraits/men/4.jpg",
#             "location": "Seattle, WA",
#             "isVerified": True,
#             "points": random.randint(2000, 4000),
#             "level": random.randint(12, 20),
#             "badges": ["admin", "platform_guardian", "community_builder"],
#             "adminLevel": "super_admin",
#             "permissions": ["user_management", "content_moderation", "analytics"],
#             "createdAt": get_random_date(400),
#             "lastActive": get_random_date(1)
#         },
#         {
#             "firstName": "Emma",
#             "lastName": "Brown",
#             "email": "emma.brown@email.com",
#             "displayName": "Emma Brown",
#             "role": "student",
#             "skills": ["JavaScript", "React", "UI/UX Design"],
#             "interests": ["Frontend Development", "Design Systems", "Accessibility"],
#             "bio": "Creative developer with a passion for beautiful and accessible user interfaces.",
#             "profilePicture": "https://randomuser.me/api/portraits/women/5.jpg",
#             "location": "Los Angeles, CA",
#             "university": "UCLA",
#             "graduationYear": 2025,
#             "gpa": 3.7,
#             "isVerified": True,
#             "points": random.randint(600, 2200),
#             "level": random.randint(4, 11),
#             "badges": ["resource_sharer", "active_participant"],
#             "preferences": {
#                 "studyStyle": "visual",
#                 "timeZone": "PST",
#                 "availability": ["afternoon", "evening"]
#             },
#             "createdAt": get_random_date(180),
#             "lastActive": get_random_date(1)
#         },
#         {
#             "firstName": "Frank",
#             "lastName": "Miller",
#             "email": "frank.miller@email.com",
#             "displayName": "Frank Miller",
#             "role": "mentor",
#             "skills": ["Product Management", "Strategy", "Analytics", "Leadership"],
#             "interests": ["Product Strategy", "User Research", "Team Building"],
#             "bio": "Product Manager with expertise in building scalable platforms and leading cross-functional teams.",
#             "profilePicture": "https://randomuser.me/api/portraits/men/6.jpg",
#             "location": "Chicago, IL",
#             "company": "Microsoft",
#             "position": "Senior Product Manager",
#             "experience": 6,
#             "isVerified": True,
#             "points": random.randint(1200, 3500),
#             "level": random.randint(10, 18),
#             "badges": ["mentor_helper", "leadership_expert", "strategy_master"],
#             "preferences": {
#                 "mentorStyle": "strategic",
#                 "timeZone": "CST",
#                 "availability": ["weekday_evening", "weekend"]
#             },
#             "createdAt": get_random_date(250),
#             "lastActive": get_random_date(2)
#         },
#         {
#             "firstName": "Grace",
#             "lastName": "Lee",
#             "email": "grace.lee@email.com",
#             "displayName": "Grace Lee",
#             "role": "student",
#             "skills": ["Python", "Data Science", "Statistics", "R"],
#             "interests": ["Data Analytics", "Machine Learning", "Research"],
#             "bio": "Graduate student researching applications of ML in healthcare and social good.",
#             "profilePicture": "https://randomuser.me/api/portraits/women/7.jpg",
#             "location": "Boston, MA",
#             "university": "MIT",
#             "graduationYear": 2024,
#             "gpa": 4.0,
#             "isVerified": True,
#             "points": random.randint(800, 2500),
#             "level": random.randint(6, 13),
#             "badges": ["research_star", "data_expert", "academic_achiever"],
#             "preferences": {
#                 "studyStyle": "research-oriented",
#                 "timeZone": "EST",
#                 "availability": ["morning", "evening"]
#             },
#             "createdAt": get_random_date(120),
#             "lastActive": get_random_date(1)
#         },
#         {
#             "firstName": "Henry",
#             "lastName": "Garcia",
#             "email": "henry.garcia@email.com",
#             "displayName": "Henry Garcia",
#             "role": "student",
#             "skills": ["C++", "Algorithms", "Competitive Programming"],
#             "interests": ["Software Engineering", "Algorithms", "System Design"],
#             "bio": "Computer Science major with strong algorithmic thinking and competitive programming background.",
#             "profilePicture": "https://randomuser.me/api/portraits/men/8.jpg",
#             "location": "Denver, CO",
#             "university": "Colorado School of Mines",
#             "graduationYear": 2025,
#             "gpa": 3.6,
#             "isVerified": True,
#             "points": random.randint(700, 2100),
#             "level": random.randint(5, 12),
#             "badges": ["algorithm_master", "problem_solver", "competitive_coder"],
#             "preferences": {
#                 "studyStyle": "problem-solving",
#                 "timeZone": "MST",
#                 "availability": ["evening", "late_night"]
#             },
#             "createdAt": get_random_date(160),
#             "lastActive": get_random_date(2)
#         }
#     ]
    
#     user_refs = []
#     for user_data in users_data:
#         doc_ref = db.collection('users').document()
#         user_data['uid'] = doc_ref.id
#         user_data['id'] = doc_ref.id
#         doc_ref.set(user_data)
#         user_refs.append(doc_ref.id)
    
#     return user_refs

# def seed_study_groups(db, user_ids):
#     groups_data = [
#         {
#             "name": "AI/ML Study Group",
#             "description": "Weekly discussions on machine learning algorithms, papers, and practical implementations.",
#             "subject": "Machine Learning",
#             "category": "Technology",
#             "tags": ["AI", "Machine Learning", "Python", "Research"],
#             "createdBy": random.choice(user_ids),
#             "members": random.sample(user_ids, random.randint(3, 6)),
#             "maxMembers": 15,
#             "currentMembers": 0,
#             "isPrivate": False,
#             "isActive": True,
#             "meetingSchedule": {
#                 "frequency": "weekly",
#                 "dayOfWeek": "Wednesday",
#                 "time": "19:00",
#                 "timezone": "PST"
#             },
#             "location": "Virtual",
#             "status": "active",
#             "rules": ["Be respectful", "Come prepared", "Share resources"],
#             "createdAt": get_random_date(90),
#             "lastActivity": get_random_date(5)
#         },
#         {
#             "name": "Frontend Development Bootcamp",
#             "description": "Intensive group focusing on modern frontend technologies and best practices.",
#             "subject": "Web Development",
#             "category": "Programming",
#             "tags": ["React", "JavaScript", "CSS", "UI/UX"],
#             "createdBy": random.choice(user_ids),
#             "members": random.sample(user_ids, random.randint(4, 7)),
#             "maxMembers": 12,
#             "currentMembers": 0,
#             "isPrivate": False,
#             "isActive": True,
#             "meetingSchedule": {
#                 "frequency": "bi-weekly",
#                 "dayOfWeek": "Saturday",
#                 "time": "14:00",
#                 "timezone": "EST"
#             },
#             "location": "Virtual",
#             "status": "active",
#             "rules": ["Commit to attending sessions", "Share your projects", "Help others debug"],
#             "createdAt": get_random_date(60),
#             "lastActivity": get_random_date(3)
#         },
#         {
#             "name": "Data Science Research Circle",
#             "description": "Graduate-level discussion group for advanced data science topics and research.",
#             "subject": "Data Science",
#             "category": "Research",
#             "tags": ["Data Science", "Statistics", "Research", "Python", "R"],
#             "createdBy": random.choice(user_ids),
#             "members": random.sample(user_ids, random.randint(3, 5)),
#             "maxMembers": 8,
#             "currentMembers": 0,
#             "isPrivate": True,
#             "isActive": True,
#             "meetingSchedule": {
#                 "frequency": "weekly",
#                 "dayOfWeek": "Friday",
#                 "time": "16:00",
#                 "timezone": "EST"
#             },
#             "location": "MIT Campus",
#             "status": "active",
#             "rules": ["PhD/Masters students only", "Present research weekly", "Peer review papers"],
#             "createdAt": get_random_date(45),
#             "lastActivity": get_random_date(2)
#         },
#         {
#             "name": "Algorithm Interview Prep",
#             "description": "Daily practice sessions for technical interviews at top tech companies.",
#             "subject": "Algorithms",
#             "category": "Interview Preparation",
#             "tags": ["Algorithms", "Interviews", "Coding", "Career"],
#             "createdBy": random.choice(user_ids),
#             "members": random.sample(user_ids, random.randint(5, 8)),
#             "maxMembers": 20,
#             "currentMembers": 0,
#             "isPrivate": False,
#             "isActive": True,
#             "meetingSchedule": {
#                 "frequency": "daily",
#                 "time": "18:00",
#                 "timezone": "PST"
#             },
#             "location": "Virtual",
#             "status": "active",
#             "rules": ["Solve 2 problems daily", "Explain solutions clearly", "Be supportive"],
#             "createdAt": get_random_date(30),
#             "lastActivity": get_random_date(1)
#         }
#     ]
    
#     group_refs = []
#     for group_data in groups_data:
#         doc_ref = db.collection('study_groups').document()
#         group_data['id'] = doc_ref.id
#         group_data['currentMembers'] = len(group_data['members'])
#         doc_ref.set(group_data)
#         group_refs.append(doc_ref.id)
    
#     return group_refs

# def seed_mentors(db, user_ids):
#     mentor_user_ids = random.sample(user_ids, 3)
    
#     mentor_refs = []
#     for user_id in mentor_user_ids:
#         mentor_data = {
#             "userId": user_id,
#             "expertise": random.choice([
#                 "Frontend Development", "Backend Development", "Data Science",
#                 "Machine Learning", "Product Management", "Career Guidance"
#             ]),
#             "experienceLevel": random.choice(["Mid-level", "Senior", "Lead"]),
#             "yearsOfExperience": random.randint(3, 15),
#             "company": random.choice(["Google", "Microsoft", "Amazon", "Meta"]),
#             "position": random.choice([
#                 "Software Engineer", "Senior Software Engineer", "Product Manager"
#             ]),
#             "isActive": True,
#             "totalMentees": random.randint(5, 25),
#             "activeMentees": random.randint(1, 8),
#             "rating": round(random.uniform(4.0, 5.0), 1),
#             "availability": {
#                 "monday": random.choice([True, False]),
#                 "tuesday": random.choice([True, False]),
#                 "wednesday": random.choice([True, False]),
#                 "thursday": random.choice([True, False]),
#                 "friday": random.choice([True, False]),
#                 "saturday": random.choice([True, False]),
#                 "sunday": random.choice([True, False])
#             },
#             "createdAt": get_random_date(200),
#             "updatedAt": get_random_date(10)
#         }
        
#         doc_ref = db.collection('mentors').document()
#         mentor_data['id'] = doc_ref.id
#         doc_ref.set(mentor_data)
#         mentor_refs.append(doc_ref.id)
    
#     return mentor_refs

# def seed_opportunities(db, user_ids):
#     opportunities_data = [
#         {
#             "title": "Software Engineering Intern - Frontend",
#             "company": "TechStart Inc.",
#             "description": "Join our dynamic team to build cutting-edge web applications using React and TypeScript.",
#             "type": "internship",
#             "difficulty": "intermediate",
#             "location": "San Francisco, CA",
#             "isRemote": True,
#             "requirements": [
#                 "Experience with React and JavaScript",
#                 "Knowledge of HTML/CSS",
#                 "Understanding of Git",
#                 "Strong communication skills"
#             ],
#             "skills": ["React", "JavaScript", "HTML", "CSS", "Git"],
#             "salary": "25-35 USD/hour",
#             "duration": "3 months",
#             "applicationDeadline": datetime.now() + timedelta(days=30),
#             "contactEmail": "hr@techstart.com",
#             "isActive": True,
#             "applicants": random.randint(15, 50),
#             "featured": True,
#             "postedBy": random.choice(user_ids),
#             "tags": ["Frontend", "React", "Internship", "Remote"],
#             "createdAt": get_random_date(20),
#             "updatedAt": get_random_date(5)
#         },
#         {
#             "title": "Data Science Research Assistant",
#             "company": "University Research Lab",
#             "description": "Research position focusing on machine learning applications in healthcare data analysis.",
#             "type": "research",
#             "difficulty": "advanced",
#             "location": "Boston, MA",
#             "isRemote": False,
#             "requirements": [
#                 "Graduate student in Computer Science or related field",
#                 "Experience with Python and scikit-learn",
#                 "Statistical analysis background"
#             ],
#             "skills": ["Python", "Machine Learning", "Statistics", "Research"],
#             "salary": "20-25 USD/hour",
#             "duration": "6 months",
#             "applicationDeadline": datetime.now() + timedelta(days=45),
#             "contactEmail": "research@university.edu",
#             "isActive": True,
#             "applicants": random.randint(8, 30),
#             "featured": False,
#             "postedBy": random.choice(user_ids),
#             "tags": ["Data Science", "Research", "Healthcare", "Python"],
#             "createdAt": get_random_date(15),
#             "updatedAt": get_random_date(3)
#         },
#         {
#             "title": "Full Stack Developer - Startup",
#             "company": "InnovateTech",
#             "description": "Build the next generation of social learning platforms. Equity + competitive salary.",
#             "type": "full_time",
#             "difficulty": "advanced",
#             "location": "Austin, TX",
#             "isRemote": True,
#             "requirements": [
#                 "3+ years full stack development",
#                 "Experience with Node.js and React",
#                 "Database design experience"
#             ],
#             "skills": ["Node.js", "React", "MongoDB", "AWS", "Docker"],
#             "salary": "90000-130000 USD/year",
#             "applicationDeadline": datetime.now() + timedelta(days=21),
#             "contactEmail": "jobs@innovatetech.com",
#             "isActive": True,
#             "applicants": random.randint(30, 80),
#             "featured": True,
#             "postedBy": random.choice(user_ids),
#             "tags": ["Full Stack", "Startup", "Equity", "Remote"],
#             "createdAt": get_random_date(10),
#             "updatedAt": get_random_date(2)
#         }
#     ]
    
#     opportunity_refs = []
#     for opp_data in opportunities_data:
#         doc_ref = db.collection('opportunities').document()
#         opp_data['id'] = doc_ref.id
#         doc_ref.set(opp_data)
#         opportunity_refs.append(doc_ref.id)
    
#     return opportunity_refs

# def seed_resources(db, user_ids):
#     resources_data = [
#         {
#             "title": "Complete React Development Course",
#             "description": "Comprehensive course covering React fundamentals to advanced patterns and state management.",
#             "type": "course",
#             "category": "Web Development",
#             "url": "https://example.com/react-course",
#             "author": "John Developer",
#             "tags": ["React", "JavaScript", "Frontend", "Web Development"],
#             "difficulty": "intermediate",
#             "estimatedTime": "40 hours",
#             "rating": 4.8,
#             "downloadCount": random.randint(100, 500),
#             "isApproved": True,
#             "isPublic": True,
#             "uploadedBy": random.choice(user_ids),
#             "createdAt": get_random_date(100),
#             "updatedAt": get_random_date(20)
#         },
#         {
#             "title": "Machine Learning Algorithms Guide",
#             "description": "Comprehensive guide covering all major ML algorithms with Python implementations.",
#             "type": "document",
#             "category": "Data Science",
#             "url": "https://example.com/ml-guide.pdf",
#             "author": "Dr. AI Expert",
#             "tags": ["Machine Learning", "Algorithms", "Python", "Data Science"],
#             "difficulty": "intermediate",
#             "estimatedTime": "15 hours",
#             "rating": 4.6,
#             "downloadCount": random.randint(200, 700),
#             "isApproved": True,
#             "isPublic": True,
#             "uploadedBy": random.choice(user_ids),
#             "createdAt": get_random_date(80),
#             "updatedAt": get_random_date(15)
#         },
#         {
#             "title": "System Design Interview Prep",
#             "description": "Complete guide to acing system design interviews with real examples and solutions.",
#             "type": "guide",
#             "category": "Interview Preparation",
#             "url": "https://example.com/system-design-guide",
#             "author": "Senior Engineer",
#             "tags": ["System Design", "Interviews", "Architecture", "Scalability"],
#             "difficulty": "advanced",
#             "estimatedTime": "20 hours",
#             "rating": 4.9,
#             "downloadCount": random.randint(300, 800),
#             "isApproved": True,
#             "isPublic": True,
#             "uploadedBy": random.choice(user_ids),
#             "createdAt": get_random_date(120),
#             "updatedAt": get_random_date(30)
#         },
#         {
#             "title": "Python Fundamentals Workshop",
#             "description": "Interactive workshop materials for learning Python from scratch with hands-on exercises.",
#             "type": "workshop",
#             "category": "Programming",
#             "url": "https://example.com/python-workshop",
#             "author": "Code Academy",
#             "tags": ["Python", "Beginner", "Programming", "Workshop"],
#             "difficulty": "beginner",
#             "estimatedTime": "8 hours",
#             "rating": 4.4,
#             "downloadCount": random.randint(150, 600),
#             "isApproved": True,
#             "isPublic": True,
#             "uploadedBy": random.choice(user_ids),
#             "createdAt": get_random_date(70),
#             "updatedAt": get_random_date(10)
#         }
#     ]
    
#     resource_refs = []
#     for resource_data in resources_data:
#         doc_ref = db.collection('resources').document()
#         resource_data['id'] = doc_ref.id
#         doc_ref.set(resource_data)
#         resource_refs.append(doc_ref.id)
    
#     return resource_refs

# def seed_conversations_and_messages(db, user_ids):
#     conversation_pairs = []
#     for i in range(len(user_ids)):
#         for j in range(i + 1, min(i + 4, len(user_ids))):
#             conversation_pairs.append((user_ids[i], user_ids[j]))
    
#     message_templates = [
#         "Hey! How's your project coming along?",
#         "I found this great tutorial that might help you",
#         "Want to pair program on this problem?",
#         "Thanks for explaining that concept!",
#         "Let's schedule a study session",
#         "I'm stuck on this algorithm, any ideas?",
#         "Your presentation was really impressive",
#         "Can you review my code when you have time?"
#     ]
    
#     for user1_id, user2_id in conversation_pairs:
#         conversation_id = '_'.join(sorted([user1_id, user2_id]))
        
#         for _ in range(random.randint(3, 8)):
#             sender_id = random.choice([user1_id, user2_id])
#             recipient_id = user2_id if sender_id == user1_id else user1_id
            
#             message_data = {
#                 'senderId': sender_id,
#                 'recipientId': recipient_id,
#                 'content': random.choice(message_templates),
#                 'type': 'text',
#                 'isRead': random.choice([True, False]),
#                 'createdAt': get_random_date(30)
#             }
            
#             doc_ref = db.collection('messages').document()
#             message_data['id'] = doc_ref.id
#             doc_ref.set(message_data)
        
#         conversation_data = {
#             'id': conversation_id,
#             'participants': sorted([user1_id, user2_id]),
#             'lastMessage': random.choice(message_templates),
#             'lastMessageAt': get_random_date(7),
#             'unreadCount': {user1_id: random.randint(0, 3), user2_id: random.randint(0, 3)}
#         }
        
#         db.collection('conversations').document(conversation_id).set(conversation_data)

# def seed_mentor_connections(db, user_ids, mentor_ids):
#     student_ids = [uid for uid in user_ids if uid not in mentor_ids]
    
#     for _ in range(15):
#         connection_data = {
#             'studentId': random.choice(student_ids),
#             'mentorId': random.choice(mentor_ids),
#             'message': random.choice([
#                 "I would love guidance on my career transition",
#                 "Looking for help with system design concepts",
#                 "Need advice on building my portfolio",
#                 "Want to improve my coding interview skills",
#                 "Seeking mentorship for my startup idea"
#             ]),
#             'status': random.choice(['pending', 'accepted', 'rejected']),
#             'createdAt': get_random_date(60)
#         }
        
#         doc_ref = db.collection('mentor_connections').document()
#         connection_data['id'] = doc_ref.id
#         doc_ref.set(connection_data)

# def seed_opportunity_applications(db, user_ids, opportunity_ids):
#     # Filter for student users (not mentors/admins)
#     # Get actual student users from the database
#     student_ids = []
#     for user_id in user_ids:
#         user_doc = db.collection('users').document(user_id).get()
#         if user_doc.exists:
#             user_data = user_doc.to_dict()
#             if user_data.get('role') == 'student':
#                 student_ids.append(user_id)
    
#     print(f"Found {len(student_ids)} students for opportunity applications")
    
#     # Only proceed if we have students
#     if not student_ids:
#         print("No students found, skipping opportunity applications")
#         return
    
#     for opportunity_id in opportunity_ids:
#         # Determine number of applicants based on available students
#         max_applicants = min(len(student_ids), 6)  # Cap at 6 or total students
#         min_applicants = min(3, len(student_ids))  # At least 3, or all students if fewer
        
#         # Only create applications if we have students
#         if max_applicants > 0:
#             num_applicants = random.randint(min_applicants, max_applicants)
#             applicants = random.sample(student_ids, num_applicants)
            
#             for user_id in applicants:
#                 application_data = {
#                     'opportunityId': opportunity_id,
#                     'userId': user_id,
#                     'applicationData': {
#                         'coverLetter': 'I am very interested in this position and believe my skills align well with your requirements.',
#                         'resumeUrl': 'https://example.com/resume.pdf',
#                         'portfolio': 'https://example.com/portfolio'
#                     },
#                     'status': random.choice(['applied', 'reviewing', 'accepted', 'rejected']),
#                     'appliedAt': get_random_date(30)
#                 }
                
#                 doc_ref = db.collection('opportunity_applications').document()
#                 application_data['id'] = doc_ref.id
#                 doc_ref.set(application_data)
                
#             print(f"Created {num_applicants} applications for opportunity {opportunity_id}")

# def seed_user_badges(db, user_ids):
#     badge_types = [
#         "first_login", "week_streak", "month_streak", "helpful_member",
#         "resource_sharer", "active_participant", "mentor_helper",
#         "study_champion", "collaboration_master", "problem_solver"
#     ]
    
#     for user_id in user_ids:
#         user_badge_count = random.randint(2, 5)
#         user_badges = random.sample(badge_types, user_badge_count)
        
#         for badge_id in user_badges:
#             badge_data = {
#                 'userId': user_id,
#                 'badgeId': badge_id,
#                 'awardedAt': get_random_date(100)
#             }
            
#             user_badge_id = f"{user_id}_{badge_id}"
#             badge_data['id'] = user_badge_id
#             db.collection('user_badges').document(user_badge_id).set(badge_data)

# def seed_notifications(db, user_ids):
#     notification_types = [
#         "group_invitation", "mentor_request", "achievement_earned",
#         "message_received", "opportunity_match", "study_reminder"
#     ]
    
#     for user_id in user_ids:
#         for _ in range(random.randint(3, 8)):
#             notification_data = {
#                 'userId': user_id,
#                 'title': random.choice([
#                     "New study group invitation",
#                     "Achievement unlocked!",
#                     "New message received",
#                     "Perfect opportunity match",
#                     "Study reminder"
#                 ]),
#                 'message': random.choice([
#                     "You've been invited to join the AI Study Group",
#                     "Congratulations! You've earned a new badge",
#                     "Alice sent you a message",
#                     "New internship opportunity matches your profile",
#                     "Don't forget your daily study goal"
#                 ]),
#                 'type': random.choice(notification_types),
#                 'data': {},
#                 'isRead': random.choice([True, False]),
#                 'createdAt': get_random_date(14)
#             }
            
#             doc_ref = db.collection('notifications').document()
#             notification_data['id'] = doc_ref.id
#             doc_ref.set(notification_data)

# def seed_achievements(db):
#     achievements_data = [
#         {
#             "name": "First Steps",
#             "description": "Complete your first study session",
#             "type": "milestone",
#             "points": 50,
#             "icon": "trophy",
#             "requirements": {"study_sessions": 1}
#         },
#         {
#             "name": "Team Player",
#             "description": "Join your first study group",
#             "type": "social",
#             "points": 100,
#             "icon": "users",
#             "requirements": {"groups_joined": 1}
#         },
#         {
#             "name": "Knowledge Seeker",
#             "description": "Access 10 learning resources",
#             "type": "learning",
#             "points": 150,
#             "icon": "book",
#             "requirements": {"resources_accessed": 10}
#         },
#         {
#             "name": "Mentor Master",
#             "description": "Help 5 students as a mentor",
#             "type": "mentoring",
#             "points": 300,
#             "icon": "graduation-cap",
#             "requirements": {"students_helped": 5}
#         },
#         {
#             "name": "Problem Solver",
#             "description": "Solve 25 coding challenges",
#             "type": "achievement",
#             "points": 200,
#             "icon": "code",
#             "requirements": {"problems_solved": 25}
#         }
#     ]
    
#     for achievement_data in achievements_data:
#         doc_ref = db.collection('achievements').document()
#         achievement_data['id'] = doc_ref.id
#         doc_ref.set(achievement_data)

# def seed_leaderboard(db, user_ids):
#     users_with_points = []
#     for user_id in user_ids:
#         user = db.collection('users').document(user_id).get().to_dict()
#         if user:
#             users_with_points.append({
#                 'userId': user_id,
#                 'name': user.get('displayName', 'Unknown'),
#                 'points': user.get('points', 0),
#                 'level': user.get('level', 1),
#                 'badges': len(user.get('badges', [])),
#                 'rank': 0
#             })
    
#     users_with_points.sort(key=lambda x: x['points'], reverse=True)
    
#     for i, user_data in enumerate(users_with_points):
#         user_data['rank'] = i + 1
    
#     leaderboard_data = {
#         'id': 'global',
#         'type': 'global',
#         'rankings': users_with_points,
#         'lastUpdated': get_timestamp()
#     }
    
#     db.collection('leaderboard').document('global').set(leaderboard_data)

# def create_user_interactions(db, user_ids, group_ids, opportunity_ids, resource_ids, mentor_ids):
#     for user_id in user_ids:
#         user_groups = random.sample(group_ids, random.randint(1, 3))
#         for group_id in user_groups:
#             group_ref = db.collection('study_groups').document(group_id)
#             group_data = group_ref.get().to_dict()
#             if group_data:
#                 current_members = group_data.get('members', [])
#                 if user_id not in current_members:
#                     current_members.append(user_id)
#                     group_ref.update({
#                         'members': current_members,
#                         'currentMembers': len(current_members)
#                     })
        
#         if random.choice([True, False, False]):
#             selected_opportunities = random.sample(opportunity_ids, random.randint(1, 2))
#             for opp_id in selected_opportunities:
#                 application_data = {
#                     'opportunityId': opp_id,
#                     'userId': user_id,
#                     'applicationData': {
#                         'coverLetter': 'I am excited about this opportunity and believe I would be a great fit.',
#                         'resumeUrl': 'https://example.com/resume.pdf'
#                     },
#                     'status': random.choice(['applied', 'reviewing', 'accepted', 'rejected']),
#                     'appliedAt': get_random_date(30)
#                 }
                
#                 doc_ref = db.collection('opportunity_applications').document()
#                 application_data['id'] = doc_ref.id
#                 doc_ref.set(application_data)
        
#         accessed_resources = random.sample(resource_ids, random.randint(2, 4))
#         for resource_id in accessed_resources:
#             resource_ref = db.collection('resources').document(resource_id)
#             resource_data = resource_ref.get().to_dict()
#             if resource_data:
#                 current_downloads = resource_data.get('downloadCount', 0)
#                 resource_ref.update({'downloadCount': current_downloads + 1})
        
#         if user_id in mentor_ids:
#             potential_students = [uid for uid in user_ids if uid != user_id and uid not in mentor_ids]
#             mentees = random.sample(potential_students, random.randint(1, 3))
            
#             for student_id in mentees:
#                 connection_data = {
#                     'studentId': student_id,
#                     'mentorId': user_id,
#                     'message': 'I would appreciate your guidance and mentorship',
#                     'status': random.choice(['pending', 'accepted']),
#                     'createdAt': get_random_date(45)
#                 }
                
#                 doc_ref = db.collection('mentor_connections').document()
#                 connection_data['id'] = doc_ref.id
#                 doc_ref.set(connection_data)

# def seed_additional_collections(db, user_ids):
#     for user_id in user_ids:
#         activity_data = {
#             'userId': user_id,
#             'activityType': random.choice(['login', 'join_group', 'message_sent', 'resource_accessed']),
#             'description': random.choice([
#                 'User logged into the platform',
#                 'Joined a new study group',
#                 'Sent message to another user',
#                 'Accessed a learning resource'
#             ]),
#             'timestamp': get_random_date(30)
#         }
        
#         doc_ref = db.collection('user_activity').document()
#         activity_data['id'] = doc_ref.id
#         doc_ref.set(activity_data)
    
#     subjects = ["Machine Learning", "Web Development", "Data Science", "Algorithms", "Mobile Development"]
#     for subject in subjects:
#         subject_data = {
#             'name': subject,
#             'description': f'Resources and groups related to {subject}',
#             'resourceCount': random.randint(5, 20),
#             'groupCount': random.randint(1, 5),
#             'difficulty': random.choice(['beginner', 'intermediate', 'advanced']),
#             'popularity': random.randint(50, 500)
#         }
        
#         doc_ref = db.collection('subjects').document()
#         subject_data['id'] = doc_ref.id
#         doc_ref.set(subject_data)

# def create_study_sessions(db, user_ids, group_ids):
#     for group_id in group_ids:
#         for _ in range(random.randint(2, 4)):
#             session_data = {
#                 'groupId': group_id,
#                 'title': random.choice([
#                     'Weekly Study Session',
#                     'Algorithm Practice',
#                     'Project Review',
#                     'Concept Discussion',
#                     'Mock Interview'
#                 ]),
#                 'description': random.choice([
#                     'Regular study session covering this week\'s topics',
#                     'Practice coding problems together',
#                     'Review and discuss recent projects',
#                     'Deep dive into complex concepts',
#                     'Practice interview questions'
#                 ]),
#                 'hostId': random.choice(user_ids),
#                 'participants': random.sample(user_ids, random.randint(3, 6)),
#                 'scheduledAt': get_random_date(14),
#                 'duration': random.choice([60, 90, 120]),
#                 'status': random.choice(['scheduled', 'completed', 'cancelled']),
#                 'isRecurring': random.choice([True, False]),
#                 'createdAt': get_random_date(30)
#             }
            
#             doc_ref = db.collection('study_sessions').document()
#             session_data['id'] = doc_ref.id
#             doc_ref.set(session_data)

# def main():
#     try:
#         db = initialize_firebase()
#         print("Firebase initialized successfully")
        
#         print("Seeding users...")
#         user_ids = seed_users(db)
#         print(f"Created {len(user_ids)} users")
        
#         print("Seeding study groups...")
#         group_ids = seed_study_groups(db, user_ids)
#         print(f"Created {len(group_ids)} study groups")
        
#         print("Seeding mentors...")
#         mentor_ids = seed_mentors(db, user_ids)
#         print(f"Created {len(mentor_ids)} mentors")
        
#         print("Seeding opportunities...")
#         opportunity_ids = seed_opportunities(db, user_ids)
#         print(f"Created {len(opportunity_ids)} opportunities")
        
#         print("Seeding resources...")
#         resource_ids = seed_resources(db, user_ids)
#         print(f"Created {len(resource_ids)} resources")
        
#         print("Seeding conversations and messages...")
#         seed_conversations_and_messages(db, user_ids)
#         print("Created conversations and messages")
        
#         print("Seeding mentor connections...")
#         seed_mentor_connections(db, user_ids, mentor_ids)
#         print("Created mentor connections")
        
#         print("Seeding opportunity applications...")
#         seed_opportunity_applications(db, user_ids, opportunity_ids)
#         print("Created opportunity applications")
        
#         print("Seeding user badges...")
#         seed_user_badges(db, user_ids)
#         print("Created user badges")
        
#         print("Seeding notifications...")
#         seed_notifications(db, user_ids)
#         print("Created notifications")
        
#         print("Seeding achievements...")
#         seed_achievements(db)
#         print("Created achievements")
        
#         print("Creating user interactions...")
#         create_user_interactions(db, user_ids, group_ids, opportunity_ids, resource_ids, mentor_ids)
#         print("Created user interactions")
        
#         print("Seeding additional collections...")
#         seed_additional_collections(db, user_ids)
#         print("Created additional collections")
        
#         print("Creating study sessions...")
#         create_study_sessions(db, user_ids, group_ids)
#         print("Created study sessions")
        
#         print("Seeding leaderboard...")
#         seed_leaderboard(db, user_ids)
#         print("Created leaderboard")
        
#         print("\nDatabase seeding completed successfully!")
#         print(f"Total users created: {len(user_ids)}")
#         print(f"Total groups created: {len(group_ids)}")
#         print(f"Total mentors created: {len(mentor_ids)}")
#         print(f"Total opportunities created: {len(opportunity_ids)}")
#         print(f"Total resources created: {len(resource_ids)}")
#         print("All users have multiple interactions with other users and models")
        
#     except Exception as e:
#         print(f"Error during seeding: {str(e)}")
#         raise e

# if __name__ == "__main__":
#     main()


from utils.database import db
from datetime import datetime, timedelta
import uuid

def generate_id(prefix=""):
    return f"{prefix}_{uuid.uuid4().hex[:8]}"

def seed_study_groups():
    groups = [
        {
            "id": generate_id("group"),
            "name": "Web Development Fundamentals",
            "subject": "Programming",
            "level": "Beginner",
            "description": "Learn HTML, CSS, and JavaScript basics together",
            "maxMembers": 6,
            "members": [],
            "createdBy": "system",
            "tags": ["HTML", "CSS", "JavaScript"],
            "meetingSchedule": "Mon/Wed 6-8 PM",
            "createdAt": datetime.utcnow(),
            "isActive": True
        },
        {
            "id": generate_id("group"),
            "name": "Advanced React Patterns",
            "subject": "Frontend Development",
            "level": "Advanced",
            "description": "Deep dive into React hooks, context, and performance optimization",
            "maxMembers": 4,
            "members": [],
            "createdBy": "system",
            "tags": ["React", "Hooks", "Performance"],
            "meetingSchedule": "Tue/Thu 7-9 PM",
            "createdAt": datetime.utcnow(),
            "isActive": True
        },
        {
            "id": generate_id("group"),
            "name": "Data Science Bootcamp",
            "subject": "Data Science",
            "level": "Intermediate",
            "description": "Python, pandas, and machine learning fundamentals",
            "maxMembers": 5,
            "members": [],
            "createdBy": "system",
            "tags": ["Python", "Pandas", "ML"],
            "meetingSchedule": "Sat 10 AM-12 PM",
            "createdAt": datetime.utcnow(),
            "isActive": True
        },
        {
            "id": generate_id("group"),
            "name": "AI/ML Research Group",
            "subject": "Artificial Intelligence",
            "level": "Advanced",
            "description": "Explore cutting-edge AI research and implementations",
            "maxMembers": 6,
            "members": [],
            "createdBy": "system",
            "tags": ["AI", "Machine Learning", "Research"],
            "meetingSchedule": "Wed 8-10 PM",
            "createdAt": datetime.utcnow(),
            "isActive": True
        }
    ]
    
    for group in groups:
        db.study_groups.insert_one(group)
    
    print(f"Seeded {len(groups)} study groups")

def seed_mentors():
    mentors = [
        {
            "id": generate_id("mentor"),
            "userId": generate_id("user"),
            "name": "Sarah Johnson",
            "expertise": "Full Stack Development",
            "experience": "5 years",
            "bio": "Senior developer at Tech Corp, passionate about mentoring junior developers",
            "company": "Tech Corp",
            "linkedIn": "linkedin.com/in/sarahjohnson",
            "specializations": ["React", "Node.js", "AWS", "MongoDB"],
            "availability": {
                "days": ["Monday", "Wednesday", "Friday"],
                "hours": "6-8 PM",
                "timezone": "EST"
            },
            "rating": 4.9,
            "totalSessions": 45,
            "isActive": True,
            "createdAt": datetime.utcnow()
        },
        {
            "id": generate_id("mentor"),
            "userId": generate_id("user"),
            "name": "Michael Chen",
            "expertise": "Data Science & AI",
            "experience": "7 years",
            "bio": "Data scientist and AI researcher, helping students break into data science",
            "company": "DataTech Inc",
            "linkedIn": "linkedin.com/in/michaelchen",
            "specializations": ["Python", "TensorFlow", "Statistics", "Deep Learning"],
            "availability": {
                "days": ["Tuesday", "Thursday", "Saturday"],
                "hours": "7-9 PM",
                "timezone": "EST"
            },
            "rating": 4.8,
            "totalSessions": 32,
            "isActive": True,
            "createdAt": datetime.utcnow()
        },
        {
            "id": generate_id("mentor"),
            "userId": generate_id("user"),
            "name": "Emily Davis",
            "expertise": "UX/UI Design",
            "experience": "4 years",
            "bio": "Product designer focused on user-centered design and prototyping",
            "company": "Design Studio",
            "linkedIn": "linkedin.com/in/emilydavis",
            "specializations": ["Figma", "User Research", "Prototyping", "Design Systems"],
            "availability": {
                "days": ["Monday", "Wednesday", "Saturday"],
                "hours": "5-7 PM",
                "timezone": "EST"
            },
            "rating": 4.7,
            "totalSessions": 28,
            "isActive": True,
            "createdAt": datetime.utcnow()
        }
    ]
    
    for mentor in mentors:
        db.mentors.insert_one(mentor)
    
    print(f"Seeded {len(mentors)} mentors")

def seed_resources():
    resources = [
        {
            "id": generate_id("resource"),
            "title": "Complete React Development Guide",
            "type": "PDF",
            "category": "Programming",
            "description": "Comprehensive guide covering React fundamentals to advanced concepts",
            "url": "https://example.com/react-guide.pdf",
            "tags": ["React", "JavaScript", "Frontend"],
            "uploadedBy": "system",
            "uploaderName": "Campus Library",
            "fileSize": "2.5 MB",
            "downloads": 0,
            "isApproved": True,
            "createdAt": datetime.utcnow()
        },
        {
            "id": generate_id("resource"),
            "title": "JavaScript ES6+ Features Tutorial",
            "type": "Video",
            "category": "Programming",
            "description": "Learn modern JavaScript features and best practices",
            "url": "https://example.com/js-es6-tutorial",
            "tags": ["JavaScript", "ES6", "Tutorial"],
            "uploadedBy": "system",
            "uploaderName": "Campus Library",
            "duration": "45 min",
            "downloads": 0,
            "isApproved": True,
            "createdAt": datetime.utcnow()
        },
        {
            "id": generate_id("resource"),
            "title": "UI Design Principles Handbook",
            "type": "PDF",
            "category": "Design",
            "description": "Essential principles for creating user-friendly interfaces",
            "url": "https://example.com/ui-design-principles.pdf",
            "tags": ["UI", "Design", "Principles"],
            "uploadedBy": "system",
            "uploaderName": "Campus Library",
            "fileSize": "1.8 MB",
            "downloads": 0,
            "isApproved": True,
            "createdAt": datetime.utcnow()
        },
        {
            "id": generate_id("resource"),
            "title": "Python Data Science Toolkit",
            "type": "Link",
            "category": "Data Science",
            "description": "Complete toolkit for data science with Python",
            "url": "https://example.com/python-data-science",
            "tags": ["Python", "Data Science", "Analytics"],
            "uploadedBy": "system",
            "uploaderName": "Campus Library",
            "downloads": 0,
            "isApproved": True,
            "createdAt": datetime.utcnow()
        }
    ]
    
    for resource in resources:
        db.resources.insert_one(resource)
    
    print(f"Seeded {len(resources)} resources")

def seed_opportunities():
    opportunities = [
        {
            "id": generate_id("opp"),
            "title": "Global Innovation Hackathon 2025",
            "type": "Competition",
            "difficulty": "Intermediate",
            "deadline": "2025-01-15",
            "description": "Build innovative solutions for real-world problems with a $10,000 prize pool",
            "requirements": ["Team of 2-4 members", "Working prototype", "5-minute presentation"],
            "prizes": "$10,000 total prize pool",
            "organizer": "TechCorp Global",
            "registrationUrl": "https://example.com/hackathon-2025",
            "createdBy": "system",
            "applicants": 0,
            "isActive": True,
            "createdAt": datetime.utcnow()
        },
        {
            "id": generate_id("opp"),
            "title": "React Masterclass Workshop",
            "type": "Workshop",
            "difficulty": "Beginner",
            "deadline": "2024-12-20",
            "description": "Learn React from industry experts in this comprehensive workshop",
            "requirements": ["Basic JavaScript knowledge", "Laptop with code editor"],
            "prizes": "Certificate of completion",
            "organizer": "React Academy",
            "registrationUrl": "https://example.com/react-workshop",
            "createdBy": "system",
            "applicants": 0,
            "isActive": True,
            "createdAt": datetime.utcnow()
        },
        {
            "id": generate_id("opp"),
            "title": "Data Science Summer Internship",
            "type": "Internship",
            "difficulty": "Advanced",
            "deadline": "2025-02-01",
            "description": "Work with real datasets and machine learning projects at DataTech",
            "requirements": ["Python proficiency", "Statistics background", "Portfolio of projects"],
            "prizes": "Paid internship + mentorship program",
            "organizer": "DataTech Solutions",
            "registrationUrl": "https://example.com/data-internship",
            "createdBy": "system",
            "applicants": 0,
            "isActive": True,
            "createdAt": datetime.utcnow()
        },
        {
            "id": generate_id("opp"),
            "title": "Mobile App Development Challenge",
            "type": "Competition",
            "difficulty": "Intermediate",
            "deadline": "2025-01-30",
            "description": "Create innovative mobile applications for social impact",
            "requirements": ["Mobile app prototype", "Demo video", "Business plan"],
            "prizes": "$5,000 + app store publication",
            "organizer": "Mobile Dev Community",
            "registrationUrl": "https://example.com/mobile-challenge",
            "createdBy": "system",
            "applicants": 0,
            "isActive": True,
            "createdAt": datetime.utcnow()
        }
    ]
    
    for opportunity in opportunities:
        db.opportunities.insert_one(opportunity)
    
    print(f"Seeded {len(opportunities)} opportunities")

def seed_demo_users():
    demo_users = [
        {
            "uid": "demo_student_001",
            "firstName": "Alex",
            "lastName": "Student",
            "displayName": "Alex Student",
            "email": "demo.student@campus.edu",
            "role": "student",
            "roles": ["student"],
            "interests": ["Web Development", "AI", "Mobile Apps"],
            "skills": ["JavaScript", "Python", "React"],
            "points": 150,
            "level": 2,
            "badges": ["New Member", "First Group"],
            "profileImage": "",
            "bio": "Passionate about learning new technologies",
            "isDemo": True,
            "isOnline": False,
            "studyGroups": [],
            "mentorships": [],
            "savedOpportunities": [],
            "notifications": [],
            "recentActivity": [
                {
                    "action": "Joined Virtual Campus",
                    "time": "Just now",
                    "type": "platform"
                }
            ],
            "createdAt": datetime.utcnow(),
            "lastSeen": datetime.utcnow()
        },
        {
            "uid": "demo_mentor_001",
            "firstName": "Jamie",
            "lastName": "Mentor",
            "displayName": "Jamie Mentor",
            "email": "demo.mentor@campus.edu",
            "role": "mentor",
            "roles": ["mentor", "student"],
            "interests": ["Teaching", "Mentoring", "Full Stack Development"],
            "skills": ["React", "Node.js", "Leadership", "Teaching"],
            "points": 850,
            "level": 5,
            "badges": ["Mentor", "Helper", "Expert", "Community Builder"],
            "profileImage": "",
            "bio": "Experienced developer passionate about helping others grow",
            "isDemo": True,
            "isOnline": False,
            "studyGroups": [],
            "mentorships": [],
            "savedOpportunities": [],
            "notifications": [],
            "recentActivity": [
                {
                    "action": "Joined as Campus Mentor",
                    "time": "Just now",
                    "type": "platform"
                }
            ],
            "createdAt": datetime.utcnow(),
            "lastSeen": datetime.utcnow()
        }
    ]
    
    for user in demo_users:
        try:
            existing = db.users.find_one({"uid": user["uid"]})
            if not existing:
                db.users.insert_one(user)
        except Exception as e:
            print(f"Error seeding demo user {user['uid']}: {e}")
    
    print(f"Seeded {len(demo_users)} demo users")

def seed_campus_announcements():
    announcements = [
        {
            "id": generate_id("announce"),
            "title": "Welcome to Virtual Campus!",
            "message": "Explore study rooms, connect with mentors, and discover opportunities",
            "type": "welcome",
            "priority": "high",
            "targetAudience": "all",
            "isActive": True,
            "createdAt": datetime.utcnow(),
            "expiresAt": datetime.utcnow() + timedelta(days=30)
        },
        {
            "id": generate_id("announce"),
            "title": "New Study Rooms Available",
            "message": "Join AI Lab and Mobile Dev workshops starting this week",
            "type": "academic",
            "priority": "medium",
            "targetAudience": "students",
            "isActive": True,
            "createdAt": datetime.utcnow(),
            "expiresAt": datetime.utcnow() + timedelta(days=7)
        },
        {
            "id": generate_id("announce"),
            "title": "Mentorship Program Open",
            "message": "Connect with industry experts and senior students",
            "type": "mentorship",
            "priority": "medium", 
            "targetAudience": "all",
            "isActive": True,
            "createdAt": datetime.utcnow(),
            "expiresAt": datetime.utcnow() + timedelta(days=14)
        }
    ]
    
    for announcement in announcements:
        db.announcements.insert_one(announcement)
    
    print(f"Seeded {len(announcements)} campus announcements")

def initialize_campus_data():
    try:
        print("Initializing Virtual Campus...")
        
        if db.study_groups.count_documents({}) == 0:
            seed_study_groups()
        
        if db.mentors.count_documents({}) == 0:
            seed_mentors()
        
        if db.resources.count_documents({}) == 0:
            seed_resources()
        
        if db.opportunities.count_documents({}) == 0:
            seed_opportunities()
        
        if db.users.count_documents({"isDemo": True}) == 0:
            seed_demo_users()
        
        if db.announcements.count_documents({}) == 0:
            seed_campus_announcements()
        
        print("Virtual Campus initialization complete!")
        
    except Exception as e:
        print(f"Error initializing campus data: {e}")

def create_fresh_user(user_data):
    fresh_user = {
        "uid": user_data.get("uid", generate_id("user")),
        "firstName": user_data["firstName"],
        "lastName": user_data["lastName"],
        "displayName": user_data["displayName"],
        "email": user_data["email"],
        "role": user_data["role"],
        "roles": user_data.get("roles", [user_data["role"]]),
        "interests": user_data.get("interests", []),
        "skills": user_data.get("skills", []),
        "points": 0,
        "level": 1,
        "badges": [],
        "profileImage": "",
        "bio": "",
        "isDemo": False,
        "isOnline": False,
        "studyGroups": [],
        "mentorships": [],
        "savedOpportunities": [],
        "notifications": [
            {
                "id": generate_id("notif"),
                "type": "welcome",
                "title": "Welcome to Virtual Campus!",
                "message": "Complete your profile and start exploring",
                "read": False,
                "time": "Just now",
                "timestamp": datetime.utcnow()
            }
        ],
        "recentActivity": [
            {
                "action": "Joined Virtual Campus",
                "time": "Just now",
                "type": "platform"
            }
        ],
        "profileComplete": False,
        "createdAt": datetime.utcnow(),
        "lastSeen": datetime.utcnow()
    }
    
    return fresh_user

if __name__ == "__main__":
    initialize_campus_data()