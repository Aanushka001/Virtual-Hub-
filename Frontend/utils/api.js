// utils/api.js
const API_BASE_URL = 'http://localhost:5000/api';

window.apiUtils = {
  getHeaders: async () => {
    try {
      const user = window.auth.currentUser;
      if (user) {
        const firebaseToken = await user.getIdToken();
        return {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${firebaseToken}`
        };
      }
      return { 'Content-Type': 'application/json' };
    } catch (error) {
      console.error('Error getting headers:', error);
      return { 'Content-Type': 'application/json' };
    }
  },

  makeRequest: async (endpoint, options = {}) => {
    try {
      const headers = await window.apiUtils.getHeaders();
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers,
        ...options
      });
      
      if (response.ok) {
        return await response.json();
      }
      
      console.log(`Backend ${endpoint} failed (${response.status}), using Firebase fallback`);
      return null;
    } catch (error) {
      console.log(`Backend ${endpoint} unavailable, using Firebase fallback`);
      return null;
    }
  },

  getDashboardStats: async (userId) => {
    const data = await window.apiUtils.makeRequest('/users/dashboard');
    if (data) return data.stats;
    
    return await window.dataUtils.getUserStats(userId);
  },

  getUserActivity: async (userId) => {
    try {
      const userDoc = await window.firestore.collection('users').doc(userId).get();
      if (userDoc.exists) {
        const userData = userDoc.data();
        return userData.recentActivity || [];
      }
      return [];
    } catch (error) {
      console.error('Error fetching user activity:', error);
      return [];
    }
  },

  getOnlineUsers: async () => {
    try {
      const snapshot = await window.firestore.collection('users')
        .where('isOnline', '==', true)
        .limit(10)
        .get();
      
      return snapshot.docs.map(doc => doc.data());
    } catch (error) {
      console.error('Error fetching online users:', error);
      return [];
    }
  },

  getAnnouncements: async () => {
    const data = await window.apiUtils.makeRequest('/announcements');
    if (data) return data.announcements;
    
    try {
      const snapshot = await window.firestore.collection('announcements')
        .limit(5)
        .get();
      
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error fetching announcements:', error);
      return [
        {
          id: 'default_1',
          title: 'Welcome to Virtual Campus!',
          message: 'Start exploring study rooms and connect with mentors',
          isActive: true,
          createdAt: new Date().toISOString()
        }
      ];
    }
  },

  getStudyGroups: async () => {
    const data = await window.apiUtils.makeRequest('/groups');
    if (data) return data.groups;
    
    return await window.dataUtils.getStudyGroups();
  },

  getMentors: async () => {
    const data = await window.apiUtils.makeRequest('/mentors');
    if (data) return data.mentors;
    
    return await window.dataUtils.getMentors();
  },

  getResources: async () => {
    const data = await window.apiUtils.makeRequest('/resources');
    if (data) return data.resources;
    
    return await window.dataUtils.getResources();
  },

  getOpportunities: async () => {
    const data = await window.apiUtils.makeRequest('/opportunities');
    if (data) return data.opportunities;
    
    return await window.dataUtils.getOpportunities();
  },

  getLeaderboard: async () => {
    const data = await window.apiUtils.makeRequest('/leaderboard');
    if (data) return data.leaderboard;
    
    try {
      const snapshot = await window.firestore.collection('users')
        .orderBy('points', 'desc')
        .limit(50)
        .get();
      
      return snapshot.docs.map((doc, index) => ({
        rank: index + 1,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      return [];
    }
  }
};