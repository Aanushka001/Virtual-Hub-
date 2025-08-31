// utils/router.js
// Simple hash-based router for Virtual Hub
window.router = {
  navigate: (path) => {
    try {
      if (!path) {
        console.warn('No path provided to navigate');
        return;
      }
      
      // Ensure path starts with /
      const cleanPath = path.startsWith('/') ? path : `/${path}`;
      window.location.hash = cleanPath;
      
      // Trigger custom navigation event
      window.dispatchEvent(new CustomEvent('routeChange', { 
        detail: { path: cleanPath }
      }));
    } catch (error) {
      console.error('Navigation error:', error);
    }
  },

  getCurrentRoute: () => {
    try {
      return window.location.hash.slice(1) || '/';
    } catch (error) {
      console.error('Error getting current route:', error);
      return '/';
    }
  },

  getRouteParams: () => {
    try {
      const hash = window.location.hash.slice(1);
      const [path, queryString] = hash.split('?');
      const params = {};
      
      if (queryString) {
        queryString.split('&').forEach(param => {
          const [key, value] = param.split('=');
          params[decodeURIComponent(key)] = decodeURIComponent(value || '');
        });
      }
      
      return { path: path || '/', params };
    } catch (error) {
      console.error('Error parsing route params:', error);
      return { path: '/', params: {} };
    }
  },

  setRouteParam: (key, value) => {
    try {
      const { path, params } = window.router.getRouteParams();
      params[key] = value;
      
      const queryString = Object.entries(params)
        .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
        .join('&');
      
      const newHash = queryString ? `${path}?${queryString}` : path;
      window.location.hash = newHash;
    } catch (error) {
      console.error('Error setting route param:', error);
    }
  },

  routes: {
    '/': 'Campus Hub',
    '/campus-hub': 'Campus Hub',
    '/study-groups': 'Study Groups',
    '/mentors': 'Mentors', 
    '/resources': 'Resources',
    '/opportunities': 'Opportunities',
    '/leaderboard': 'Leaderboard',
    '/admin': 'Admin Panel',
    '/profile': 'Profile',
    '/settings': 'Settings'
  },

  getRouteName: (path) => {
    try {
      return window.router.routes[path] || 'Unknown Page';
    } catch (error) {
      console.error('Error getting route name:', error);
      return 'Unknown Page';
    }
  },

  isValidRoute: (path) => {
    try {
      return Object.keys(window.router.routes).includes(path);
    } catch (error) {
      console.error('Error validating route:', error);
      return false;
    }
  },

  // Add breadcrumb functionality
  getBreadcrumbs: () => {
    try {
      const currentPath = window.router.getCurrentRoute();
      const pathParts = currentPath.split('/').filter(part => part);
      
      const breadcrumbs = [{ name: 'Home', path: '/' }];
      
      let currentRoute = '';
      pathParts.forEach(part => {
        currentRoute += `/${part}`;
        const routeName = window.router.getRouteName(currentRoute);
        if (routeName !== 'Unknown Page') {
          breadcrumbs.push({ name: routeName, path: currentRoute });
        }
      });
      
      return breadcrumbs;
    } catch (error) {
      console.error('Error getting breadcrumbs:', error);
      return [{ name: 'Home', path: '/' }];
    }
  },

  // Add route change listener
  onRouteChange: (callback) => {
    try {
      if (typeof callback !== 'function') {
        console.warn('Route change callback must be a function');
        return;
      }

      const handleHashChange = () => {
        const currentRoute = window.router.getCurrentRoute();
        callback(currentRoute);
      };

      window.addEventListener('hashchange', handleHashChange);
      window.addEventListener('routeChange', handleHashChange);
      
      // Return cleanup function
      return () => {
        window.removeEventListener('hashchange', handleHashChange);
        window.removeEventListener('routeChange', handleHashChange);
      };
    } catch (error) {
      console.error('Error setting up route change listener:', error);
      return () => {}; // Return empty cleanup function
    }
  },

  // Add route protection
  requireAuth: (route, user) => {
    try {
      if (!user && route !== '/' && route !== '/login') {
        window.router.navigate('/');
        return false;
      }
      return true;
    } catch (error) {
      console.error('Error checking route auth:', error);
      return false;
    }
  },

  // Add admin route protection
  requireAdmin: (route, userProfile) => {
    try {
      if (route === '/admin' && userProfile?.role !== 'admin') {
        window.router.navigate('/');
        return false;
      }
      return true;
    } catch (error) {
      console.error('Error checking admin route:', error);
      return false;
    }
  }
};