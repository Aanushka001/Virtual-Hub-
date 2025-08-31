// utils/data.js - Fixed data utilities
window.dataUtils = {
  // User statistics
  getUserStats: async (userId) => {
    try {
      if (!userId || !window.firestore) {
        return {
          studyGroups: 0,
          mentorships: 0,
          resources: 0,
          points: 0
        };
      }

      const userDoc = await window.firestore.collection('users').doc(userId).get();
      if (!userDoc.exists) {
        return {
          studyGroups: 0,
          mentorships: 0,
          resources: 0,
          points: 0
        };
      }

      const userData = userDoc.data();
      return {
        studyGroups: (userData.studyGroups || []).length,
        mentorships: (userData.mentorships || []).length,
        resources: (userData.resources || []).length,
        points: userData.points || 0
      };
    } catch (error) {
      console.error('Error getting user stats:', error);
      return {
        studyGroups: 0,
        mentorships: 0,
        resources: 0,
        points: 0
      };
    }
  },

  // Study groups
  getStudyGroups: async () => {
    try {
      if (!window.firestore) {
        return [
          {
            id: 'group_1',
            name: 'React Fundamentals',
            subject: 'Web Development',
            level: 'Beginner',
            description: 'Learn React basics together',
            maxMembers: 5,
            members: ['user1', 'user2'],
            createdBy: 'mentor1',
            createdAt: new Date().toISOString()
          },
          {
            id: 'group_2',
            name: 'Data Science Bootcamp',
            subject: 'Data Science',
            level: 'Intermediate',
            description: 'Advanced data analysis techniques',
            maxMembers: 8,
            members: ['user3'],
            createdBy: 'mentor2',
            createdAt: new Date().toISOString()
          }
        ];
      }

      const snapshot = await window.firestore.collection('study_groups').get();
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error fetching study groups:', error);
      return [];
    }
  },

  createStudyGroup: async (groupData, userId) => {
    try {
      if (!window.firestore) {
        throw new Error('Firestore not available');
      }

      const groupId = `group_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const newGroup = {
        ...groupData,
        id: groupId,
        createdBy: userId,
        members: [userId],
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        isActive: true
      };

      await window.firestore.collection('study_groups').doc(groupId).set(newGroup);
      return groupId;
    } catch (error) {
      console.error('Error creating study group:', error);
      throw error;
    }
  },

  joinStudyGroup: async (groupId, userId, userName) => {
    try {
      if (!window.firestore) {
        throw new Error('Firestore not available');
      }

      await window.firestore.collection('study_groups').doc(groupId).update({
        members: firebase.firestore.FieldValue.arrayUnion(userId)
      });

      // Update user's study groups
      await window.firestore.collection('users').doc(userId).update({
        studyGroups: firebase.firestore.FieldValue.arrayUnion(groupId)
      });

      return true;
    } catch (error) {
      console.error('Error joining study group:', error);
      throw error;
    }
  },

  // Mentors
  getMentors: async () => {
    try {
      if (!window.firestore) {
        return [
          {
            id: 'mentor_1',
            name: 'Dr. Sarah Johnson',
            expertise: 'Full Stack Development',
            company: 'Google',
            experience: '8+ years',
            rating: 4.9,
            bio: 'Senior Software Engineer specializing in React and Node.js',
            isAvailable: true
          },
          {
            id: 'mentor_2',
            name: 'Michael Chen',
            expertise: 'Data Science & ML',
            company: 'Microsoft',
            experience: '6+ years',
            rating: 4.8,
            bio: 'Data Scientist with expertise in Python and machine learning',
            isAvailable: true
          },
          {
            id: 'mentor_3',
            name: 'Emily Rodriguez',
            expertise: 'UI/UX Design',
            company: 'Adobe',
            experience: '5+ years',
            rating: 4.9,
            bio: 'Product Designer focused on user-centered design principles',
            isAvailable: false
          }
        ];
      }

      const snapshot = await window.firestore.collection('mentors').get();
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error fetching mentors:', error);
      return [];
    }
  },

  // Resources
  getResources: async () => {
    try {
      if (!window.firestore) {
        return [
          {
            id: 'resource_1',
            title: 'JavaScript Fundamentals Guide',
            type: 'PDF',
            category: 'Programming',
            description: 'Complete guide to JavaScript basics',
            size: '2.5 MB',
            uploadedBy: 'mentor1',
            uploaderName: 'Dr. Sarah Johnson',
            createdAt: new Date().toISOString()
          },
          {
            id: 'resource_2',
            title: 'React Hooks Tutorial',
            type: 'Video',
            category: 'Programming',
            description: 'Learn React Hooks with practical examples',
            duration: '45 min',
            uploadedBy: 'mentor2',
            uploaderName: 'Michael Chen',
            createdAt: new Date().toISOString()
          }
        ];
      }

      const snapshot = await window.firestore.collection('resources').get();
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error fetching resources:', error);
      return [];
    }
  },

  // Opportunities
  getOpportunities: async () => {
    try {
      if (!window.firestore) {
        return [
          {
            id: 'opp_1',
            title: 'Global Coding Challenge 2025',
            type: 'Competition',
            difficulty: 'Intermediate',
            organizer: 'TechCorp',
            deadline: 'March 15, 2025',
            prizes: '$10,000 in prizes',
            description: 'Build innovative solutions using modern web technologies',
            tags: ['JavaScript', 'React', 'API'],
            registrationUrl: 'https://example.com/register'
          },
          {
            id: 'opp_2',
            title: 'AI/ML Workshop Series',
            type: 'Workshop',
            difficulty: 'Beginner',
            organizer: 'AI Institute',
            deadline: 'February 28, 2025',
            prizes: 'Certificate + Mentorship',
            description: 'Learn machine learning fundamentals with hands-on projects',
            tags: ['Python', 'ML', 'TensorFlow'],
            registrationUrl: 'https://example.com/ai-workshop'
          },
          {
            id: 'opp_3',
            title: 'Summer Internship Program',
            type: 'Internship',
            difficulty: 'Advanced',
            organizer: 'StartupX',
            deadline: 'April 1, 2025',
            prizes: 'Paid Internship + Job Offer',
            description: 'Work on real-world projects with experienced developers',
            tags: ['Full-time', 'Remote', 'Startup'],
            registrationUrl: 'https://example.com/internship'
          }
        ];
      }

      const snapshot = await window.firestore.collection('opportunities').get();
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error fetching opportunities:', error);
      return [];
    }
  },

  // Utility functions
  generateId: (prefix = '') => {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  },

  formatDate: (date) => {
    try {
      if (!date) return 'Unknown';
      const d = new Date(date);
      return d.toLocaleDateString();
    } catch (error) {
      return 'Invalid Date';
    }
  },

  formatTime: (timestamp) => {
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diffMinutes = Math.floor((now - date) / 60000);
      
      if (diffMinutes < 1) return 'Just now';
      if (diffMinutes < 60) return `${diffMinutes}m ago`;
      if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h ago`;
      return date.toLocaleDateString();
    } catch (error) {
      return 'Unknown time';
    }
  },

  // Error handling
  handleDataError: (error, context) => {
    console.error(`Data error in ${context}:`, error);
    
    // You could also send to error tracking service here
    if (window.errorTracking) {
      window.errorTracking.logError(error, context);
    }
  },

  // Validation
  validateGroupData: (groupData) => {
    const required = ['name', 'subject', 'level'];
    for (const field of required) {
      if (!groupData[field] || groupData[field].trim() === '') {
        throw new Error(`${field} is required`);
      }
    }
    
    if (groupData.maxMembers < 2 || groupData.maxMembers > 20) {
      throw new Error('Max members must be between 2 and 20');
    }
    
    return true;
  },

  validateResourceData: (resourceData) => {
    const required = ['title', 'type', 'category'];
    for (const field of required) {
      if (!resourceData[field] || resourceData[field].trim() === '') {
        throw new Error(`${field} is required`);
      }
    }
    return true;
  }
};