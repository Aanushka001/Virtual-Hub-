window.dataUtils = {
  requestCache: new Map(),
  dataCache: new Map(),
  cacheTimeout: 3 * 60 * 1000, // 3 minutes for data cache

  // Prevent duplicate requests with same parameters
  withRequestDeduplication: async (key, requestFn) => {
    if (window.dataUtils.requestCache.has(key)) {
      return await window.dataUtils.requestCache.get(key);
    }

    const promise = requestFn();
    window.dataUtils.requestCache.set(key, promise);
    
    try {
      const result = await promise;
      return result;
    } finally {
      // Clean up after request completes
      setTimeout(() => {
        window.dataUtils.requestCache.delete(key);
      }, 1000);
    }
  },

  // Cache data with timestamp
  setCacheData: (key, data) => {
    window.dataUtils.dataCache.set(key, {
      data,
      timestamp: Date.now()
    });
  },

  getCacheData: (key) => {
    const cached = window.dataUtils.dataCache.get(key);
    if (!cached) return null;
    
    if (Date.now() - cached.timestamp > window.dataUtils.cacheTimeout) {
      window.dataUtils.dataCache.delete(key);
      return null;
    }
    
    return cached.data;
  },

  getUserStats: async (userId) => {
    const cacheKey = `user_stats_${userId}`;
    const cached = window.dataUtils.getCacheData(cacheKey);
    if (cached) return cached;

    return await window.dataUtils.withRequestDeduplication(`getUserStats_${userId}`, async () => {
      try {
        const isDemo = window.localStorage.getItem('isDemoMode') === 'true';
        
        if (isDemo) {
          const stats = { studyGroups: 2, mentorships: 1, resources: 3, points: 150 };
          window.dataUtils.setCacheData(cacheKey, stats);
          return stats;
        }

        const [userDoc, userGroupsSnapshot, userResourcesSnapshot, userMentorshipsSnapshot] = await Promise.all([
          window.firestore.collection('users').doc(userId).get(),
          window.firestore.collection('study_groups').where('members', 'array-contains', userId).get(),
          window.firestore.collection('resources').where('uploadedBy', '==', userId).get(),
          window.firestore.collection('mentorships').where('studentId', '==', userId).where('status', '==', 'accepted').get()
        ]);

        const userData = userDoc.data() || {};
        const stats = {
          studyGroups: userGroupsSnapshot.size,
          mentorships: userMentorshipsSnapshot.size,
          resources: userResourcesSnapshot.size,
          points: userData.points || 0
        };

        window.dataUtils.setCacheData(cacheKey, stats);
        return stats;
      } catch (error) {
        console.error('Error fetching user stats:', error);
        const fallbackStats = { studyGroups: 0, mentorships: 0, resources: 0, points: 0 };
        window.dataUtils.setCacheData(cacheKey, fallbackStats);
        return fallbackStats;
      }
    });
  },

  getStudyGroups: async () => {
    const cacheKey = 'study_groups';
    const cached = window.dataUtils.getCacheData(cacheKey);
    if (cached) return cached;

    return await window.dataUtils.withRequestDeduplication('getStudyGroups', async () => {
      try {
        const snapshot = await window.firestore.collection('study_groups').orderBy('createdAt', 'desc').get();
        const groups = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        window.dataUtils.setCacheData(cacheKey, groups);
        return groups;
      } catch (error) {
        console.error('Error fetching study groups:', error);
        return [];
      }
    });
  },

  getMentors: async () => {
    const cacheKey = 'mentors';
    const cached = window.dataUtils.getCacheData(cacheKey);
    if (cached) return cached;

    return await window.dataUtils.withRequestDeduplication('getMentors', async () => {
      try {
        const snapshot = await window.firestore.collection('mentors').get();
        const mentors = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        window.dataUtils.setCacheData(cacheKey, mentors);
        return mentors;
      } catch (error) {
        console.error('Error fetching mentors:', error);
        return [];
      }
    });
  },

  getResources: async () => {
    const cacheKey = 'resources';
    const cached = window.dataUtils.getCacheData(cacheKey);
    if (cached) return cached;

    return await window.dataUtils.withRequestDeduplication('getResources', async () => {
      try {
        const snapshot = await window.firestore.collection('resources').orderBy('createdAt', 'desc').get();
        const resources = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        window.dataUtils.setCacheData(cacheKey, resources);
        return resources;
      } catch (error) {
        console.error('Error fetching resources:', error);
        return [];
      }
    });
  },

  getOpportunities: async () => {
    const cacheKey = 'opportunities';
    const cached = window.dataUtils.getCacheData(cacheKey);
    if (cached) return cached;

    return await window.dataUtils.withRequestDeduplication('getOpportunities', async () => {
      try {
        const snapshot = await window.firestore.collection('opportunities').orderBy('createdAt', 'desc').get();
        const opportunities = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        window.dataUtils.setCacheData(cacheKey, opportunities);
        return opportunities;
      } catch (error) {
        console.error('Error fetching opportunities:', error);
        return [];
      }
    });
  },

  getUserAchievements: async (userId) => {
    const cacheKey = `user_achievements_${userId}`;
    const cached = window.dataUtils.getCacheData(cacheKey);
    if (cached) return cached;

    return await window.dataUtils.withRequestDeduplication(`getUserAchievements_${userId}`, async () => {
      try {
        const userDoc = await window.firestore.collection('users').doc(userId).get();
        if (userDoc.exists) {
          const userData = userDoc.data();
          const achievements = userData.badges || [];
          window.dataUtils.setCacheData(cacheKey, achievements);
          return achievements;
        }
        return [];
      } catch (error) {
        console.error('Error fetching user achievements:', error);
        return [];
      }
    });
  },

  createStudyGroup: async (groupData, userId) => {
    return await window.dataUtils.withRequestDeduplication(`createGroup_${userId}_${Date.now()}`, async () => {
      try {
        const newGroup = {
          ...groupData,
          members: [userId],
          createdBy: userId,
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
          memberCount: 1,
          isActive: true
        };

        const docRef = await window.firestore.collection('study_groups').add(newGroup);
        
        // Update user points
        await window.firestore.collection('users').doc(userId).update({
          points: firebase.firestore.FieldValue.increment(10),
          studyGroups: firebase.firestore.FieldValue.arrayUnion(docRef.id)
        });

        // Clear cache to force refresh
        window.dataUtils.dataCache.delete('study_groups');
        window.dataUtils.dataCache.delete(`user_stats_${userId}`);

        await window.notificationUtils.createNotification(
          userId,
          'Study Group Created',
          `You created the study group "${groupData.name}"`,
          'success'
        );

        return docRef.id;
      } catch (error) {
        console.error('Error creating study group:', error);
        throw error;
      }
    });
  },

  joinStudyGroup: async (groupId, userId, userName) => {
    return await window.dataUtils.withRequestDeduplication(`joinGroup_${groupId}_${userId}`, async () => {
      try {
        const groupRef = window.firestore.collection('study_groups').doc(groupId);
        const groupDoc = await groupRef.get();
        
        if (!groupDoc.exists) {
          throw new Error('Study group not found');
        }

        const groupData = groupDoc.data();
        
        if (groupData.members.includes(userId)) {
          throw new Error('Already a member of this group');
        }

        if (groupData.members.length >= (groupData.maxMembers || 5)) {
          throw new Error('Group is full');
        }

        await groupRef.update({
          members: firebase.firestore.FieldValue.arrayUnion(userId),
          memberCount: firebase.firestore.FieldValue.increment(1)
        });

        // Update user points
        await window.firestore.collection('users').doc(userId).update({
          points: firebase.firestore.FieldValue.increment(10),
          studyGroups: firebase.firestore.FieldValue.arrayUnion(groupId)
        });

        // Clear relevant caches
        window.dataUtils.dataCache.delete('study_groups');
        window.dataUtils.dataCache.delete(`user_stats_${userId}`);

        // Notify existing members
        for (const memberId of groupData.members) {
          await window.notificationUtils.createNotification(
            memberId,
            'New Group Member',
            `${userName} joined your study group "${groupData.name}"`,
            'info'
          );
        }

        await window.notificationUtils.createNotification(
          userId,
          'Joined Study Group',
          `You joined the study group "${groupData.name}"`,
          'success'
        );

        return true;
      } catch (error) {
        console.error('Error joining study group:', error);
        throw error;
      }
    });
  },

  requestMentorship: async (mentorId, studentId, studentName, message) => {
    return await window.dataUtils.withRequestDeduplication(`requestMentor_${mentorId}_${studentId}`, async () => {
      try {
        const mentorDoc = await window.firestore.collection('mentors').doc(mentorId).get();
        
        if (!mentorDoc.exists) {
          throw new Error('Mentor not found');
        }

        const mentorData = mentorDoc.data();

        const requestData = {
          mentorId: mentorId,
          studentId: studentId,
          studentName: studentName,
          message: message || '',
          status: 'pending',
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        const docRef = await window.firestore.collection('mentorship_requests').add(requestData);

        await window.notificationUtils.createNotification(
          mentorData.userId,
          'New Mentorship Request',
          `${studentName} requested mentorship from you`,
          'info'
        );

        await window.notificationUtils.createNotification(
          studentId,
          'Mentorship Request Sent',
          `Your mentorship request to ${mentorData.name} has been sent`,
          'success'
        );

        return docRef.id;
      } catch (error) {
        console.error('Error requesting mentorship:', error);
        throw error;
      }
    });
  },

  createSampleData: async () => {
    return await window.dataUtils.withRequestDeduplication('createSampleData', async () => {
      try {
        // Check if data already exists
        const [groupsSnapshot, mentorsSnapshot, opportunitiesSnapshot] = await Promise.all([
          window.firestore.collection('study_groups').limit(1).get(),
          window.firestore.collection('mentors').limit(1).get(),
          window.firestore.collection('opportunities').limit(1).get()
        ]);

        if (groupsSnapshot.size > 0 || mentorsSnapshot.size > 0 || opportunitiesSnapshot.size > 0) {
          console.log('Sample data already exists');
          return false;
        }

        const sampleGroups = [
          {
            name: 'React Developers Hub',
            subject: 'Web Development',
            level: 'Intermediate',
            description: 'Learn React.js and build modern web applications together',
            maxMembers: 5,
            members: [],
            createdBy: 'system',
            isActive: true,
            memberCount: 0
          },
          {
            name: 'Python Data Science',
            subject: 'Data Science',
            level: 'Beginner',
            description: 'Introduction to data analysis with Python and pandas',
            maxMembers: 8,
            members: [],
            createdBy: 'system',
            isActive: true,
            memberCount: 0
          },
          {
            name: 'UI/UX Design Workshop',
            subject: 'Design',
            level: 'Intermediate',
            description: 'Learn modern design principles and create amazing user experiences',
            maxMembers: 6,
            members: [],
            createdBy: 'system',
            isActive: true,
            memberCount: 0
          }
        ];

        const sampleMentors = [
          {
            name: 'Sarah Johnson',
            userId: 'mentor_1',
            expertise: 'Web Development',
            experience: '5+ years',
            bio: 'Senior Frontend Developer at Google with expertise in React, Vue, and modern JavaScript frameworks',
            company: 'Google',
            rating: 4.9,
            availability: 'Weekends'
          },
          {
            name: 'Alex Chen',
            userId: 'mentor_2',
            expertise: 'Data Science',
            experience: '3-5 years',
            bio: 'Data Scientist specializing in machine learning and statistical analysis',
            company: 'Meta',
            rating: 4.8,
            availability: 'Evenings'
          },
          {
            name: 'Maria Rodriguez',
            userId: 'mentor_3',
            expertise: 'UI/UX Design',
            experience: '4-6 years',
            bio: 'Lead UX Designer with experience in user research and interface design',
            company: 'Adobe',
            rating: 4.9,
            availability: 'Flexible'
          }
        ];

        const sampleOpportunities = [
          {
            title: 'Global Hackathon 2025',
            type: 'Competition',
            difficulty: 'Intermediate',
            deadline: '2025-09-15',
            description: 'Build innovative solutions for social good and compete with teams worldwide',
            prizes: '$10,000 in prizes',
            organizer: 'TechForGood',
            isActive: true
          },
          {
            title: 'AI/ML Workshop Series',
            type: 'Workshop',
            difficulty: 'Beginner',
            deadline: '2025-09-10',
            description: 'Learn fundamentals of artificial intelligence and machine learning',
            location: 'Online',
            organizer: 'AI Academy',
            isActive: true
          },
          {
            title: 'Summer Tech Internship',
            type: 'Internship',
            difficulty: 'Advanced',
            deadline: '2025-09-05',
            description: '3-month paid internship program with leading tech companies',
            prizes: 'Paid position with potential for full-time offer',
            organizer: 'Tech Careers',
            isActive: true
          }
        ];

        // Create sample data with batched writes for better performance
        const batch = window.firestore.batch();

        sampleGroups.forEach((group) => {
          const docRef = window.firestore.collection('study_groups').doc();
          batch.set(docRef, {
            ...group,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
          });
        });

        sampleMentors.forEach((mentor) => {
          const docRef = window.firestore.collection('mentors').doc();
          batch.set(docRef, {
            ...mentor,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
          });
        });

        sampleOpportunities.forEach((opportunity) => {
          const docRef = window.firestore.collection('opportunities').doc();
          batch.set(docRef, {
            ...opportunity,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
          });
        });

        await batch.commit();

        // Clear all caches to force refresh
        window.dataUtils.dataCache.clear();
        window.apiUtils?.clearCache?.();

        console.log('Sample data created successfully');
        return true;
      } catch (error) {
        console.error('Error creating sample data:', error);
        return false;
      }
    });
  },

  // Utility functions
  clearCache: () => {
    window.dataUtils.dataCache.clear();
    window.dataUtils.requestCache.clear();
  },

  invalidateUserCache: (userId) => {
    const keysToDelete = [];
    for (const [key] of window.dataUtils.dataCache) {
      if (key.includes(userId)) {
        keysToDelete.push(key);
      }
    }
    keysToDelete.forEach(key => window.dataUtils.dataCache.delete(key));
  }
};