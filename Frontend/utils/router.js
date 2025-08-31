window.router = {
  currentRoute: '/',
  listeners: new Set(),
  navigationInProgress: false,
  navigationQueue: [],
  
  navigate: (path) => {
    if (window.router.navigationInProgress || window.router.currentRoute === path) {
      return;
    }
    
    window.router.navigationInProgress = true;
    window.router.navigationQueue.push(path);
    
    // Process navigation queue
    setTimeout(() => {
      if (window.router.navigationQueue.length > 0) {
        const targetPath = window.router.navigationQueue.pop();
        window.router.navigationQueue = [];
        
        window.location.hash = targetPath;
        window.router.currentRoute = targetPath;
        
        setTimeout(() => {
          window.router.navigationInProgress = false;
        }, 100);
      }
    }, 50);
  },

  getCurrentRoute: () => {
    return window.location.hash.slice(1) || '/';
  },

  addListener: (callback) => {
    window.router.listeners.add(callback);
    return () => window.router.listeners.delete(callback);
  },

  notifyListeners: () => {
    window.router.listeners.forEach(callback => {
      try {
        callback(window.router.currentRoute);
      } catch (error) {
        console.error('Router listener error:', error);
      }
    });
  },

  routes: {
    '/': 'Campus Hub',
    '/campus-hub': 'Campus Hub',
    '/study-groups': 'Study Rooms',
    '/mentors': 'Mentor Hall', 
    '/resources': 'Digital Library',
    '/opportunities': 'Opportunity Board',
    '/leaderboard': 'Achievement Wall',
    '/admin': 'Admin Panel'
  },

  init: () => {
    // Initialize router on load
    window.router.currentRoute = window.router.getCurrentRoute();
    
    // Set up hash change listener with debouncing
    let hashChangeTimeout;
    window.addEventListener('hashchange', () => {
      clearTimeout(hashChangeTimeout);
      hashChangeTimeout = setTimeout(() => {
        const newRoute = window.router.getCurrentRoute();
        if (newRoute !== window.router.currentRoute) {
          window.router.currentRoute = newRoute;
          window.router.notifyListeners();
        }
      }, 50);
    });
  }
};

// Initialize router when script loads
if (typeof window !== 'undefined') {
  window.router.init();
}