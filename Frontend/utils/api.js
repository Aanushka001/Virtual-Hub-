const API_BASE_URL = 'http://localhost:5000/api';

window.apiUtils = {
  cache: new Map(),
  requestCache: new Map(),
  cacheTimeout: 5 * 60 * 1000, // 5 minutes

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

  getCacheKey: (endpoint, params = {}) => {
    return `${endpoint}_${JSON.stringify(params)}`;
  },

  isCacheValid: (cacheKey) => {
    const cached = window.apiUtils.cache.get(cacheKey);
    if (!cached) return false;
    return (Date.now() - cached.timestamp) < window.apiUtils.cacheTimeout;
  },

  setCache: (cacheKey, data) => {
    window.apiUtils.cache.set(cacheKey, {
      data,
      timestamp: Date.now()
    });
  },

  getCache: (cacheKey) => {
    const cached = window.apiUtils.cache.get(cacheKey);
    return cached ? cached.data : null;
  },

  makeRequest: async (endpoint, options = {}, useCache = true) => {
    const cacheKey = window.apiUtils.getCacheKey(endpoint, options);
    
    // Return cached data if valid
    if (useCache && window.apiUtils.isCacheValid(cacheKey)) {
      return window.apiUtils.getCache(cacheKey);
    }

    // Prevent duplicate requests
    if (window.apiUtils.requestCache.has(cacheKey)) {
      return await window.apiUtils.requestCache.get(cacheKey);
    }

    const requestPromise = (async () => {
      try {
        const headers = await window.apiUtils.getHeaders();
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
          headers,
          ...options
        });
        
        if (response.ok) {
          const data = await response.json();
          
          // Cache successful responses
          if (useCache) {
            window.apiUtils.setCache(cacheKey, data);
          }
          
          return data;
        }
        
        return null;
      } catch (error) {
        console.log(`Backend ${endpoint} unavailable, using Firebase fallback`);
        return null;
      } finally {
        // Remove from request cache
        window.apiUtils.requestCache.delete(cacheKey);
      }
    })();

    // Add to request cache
    window.apiUtils.requestCache.set(cacheKey, requestPromise);
    
    return await requestPromise;
  },

  getDashboardStats: async (userId) => {
    const data = await window.apiUtils.makeRequest('/users/dashboard');
    if (data) return data.stats;
    
    // Fallback to direct Firebase call
    return await window.dataUtils.getUserStats(userId);
  },

  getUserActivity: async (userId) => {
    const cacheKey = `user_activity_${userId}`;
    
    if (window.apiUtils.isCacheValid(cacheKey)) {
      return window.apiUtils.getCache(cacheKey);
    }

    try {
      const userDoc = await window.firestore.collection('users').doc(userId).get();
      if (userDoc.exists) {
        const userData = userDoc.data();
        const activity = userData.recentActivity || [];
        window.apiUtils.setCache(cacheKey, activity);
        return activity;
      }
      return [];
    } catch (error) {
      console.error('Error fetching user activity:', error);
      return [];
    }
  },

  getOnlineUsers: async () => {
    const cacheKey = 'online_users';
    
    if (window.apiUtils.isCacheValid(cacheKey)) {
      return window.apiUtils.getCache(cacheKey);
    }

    try {
      const snapshot = await window.firestore.collection('users')
        .where('isOnline', '==', true)
        .limit(10)
        .get();
      
      const users = snapshot.docs.map(doc => doc.data());
      window.apiUtils.setCache(cacheKey, users);
      return users;
    } catch (error) {
      console.error('Error fetching online users:', error);
      return [];
    }
  },

  getAnnouncements: async () => {
    const data = await window.apiUtils.makeRequest('/announcements');
    if (data) return data.announcements;
    
    const cacheKey = 'announcements';
    
    if (window.apiUtils.isCacheValid(cacheKey)) {
      return window.apiUtils.getCache(cacheKey);
    }

    try {
      const snapshot = await window.firestore.collection('announcements')
        .limit(5)
        .get();
      
      const announcements = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      window.apiUtils.setCache(cacheKey, announcements);
      return announcements;
    } catch (error) {
      console.error('Error fetching announcements:', error);
      // Return default announcements
      const defaultAnnouncements = [
        {
          id: 'default_1',
          title: 'Welcome to Virtual Campus!',
          message: 'Start exploring study rooms and connect with mentors',
          isActive: true
        },
        {
          id: 'default_2',
          title: 'New Features Available',
          message: 'Check out the latest study tools and collaboration features',
          isActive: true
        }
      ];
      window.apiUtils.setCache(cacheKey, defaultAnnouncements);
      return defaultAnnouncements;
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
    
    const cacheKey = 'leaderboard';
    
    if (window.apiUtils.isCacheValid(cacheKey)) {
      return window.apiUtils.getCache(cacheKey);
    }
    
    try {
      const snapshot = await window.firestore.collection('users')
        .orderBy('points', 'desc')
        .limit(50)
        .get();
      
      const leaderboard = snapshot.docs.map((doc, index) => ({
        rank: index + 1,
        ...doc.data()
      }));
      
      window.apiUtils.setCache(cacheKey, leaderboard);
      return leaderboard;
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      return [];
    }
  },

  // Utility functions for cache management
  clearCache: () => {
    window.apiUtils.cache.clear();
    window.apiUtils.requestCache.clear();
  },

  invalidateCache: (pattern) => {
    for (const [key] of window.apiUtils.cache) {
      if (key.includes(pattern)) {
        window.apiUtils.cache.delete(key);
      }
    }
  },

  // Initialize sample data if needed
  initializeSampleData: async () => {
    try {
      // Check if we have any data
      const [groups, mentors, opportunities] = await Promise.all([
        window.dataUtils.getStudyGroups(),
        window.dataUtils.getMentors(),
        window.dataUtils.getOpportunities()
      ]);

      // If no data exists, create sample data
      if (groups.length === 0 && mentors.length === 0 && opportunities.length === 0) {
        console.log('No data found, creating sample data...');
        await window.dataUtils.createSampleData();
        
        // Clear cache to force refresh
        window.apiUtils.clearCache();
      }
    } catch (error) {
      console.error('Error initializing sample data:', error);
    }
  }
};