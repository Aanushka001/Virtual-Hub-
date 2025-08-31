function Sidebar({ currentRoute, user, userProfile, onSignOut }) {
  try {
    const [isNavigating, setIsNavigating] = React.useState(false);
    const navigationTimeoutRef = React.useRef(null);

    const navigateWithDelay = (path) => {
      if (isNavigating || currentRoute === path) return;
      
      setIsNavigating(true);
      
      if (navigationTimeoutRef.current) {
        clearTimeout(navigationTimeoutRef.current);
      }
      
      navigationTimeoutRef.current = setTimeout(() => {
        window.location.hash = path;
        setIsNavigating(false);
      }, 150);
    };

    React.useEffect(() => {
      return () => {
        if (navigationTimeoutRef.current) {
          clearTimeout(navigationTimeoutRef.current);
        }
      };
    }, []);

    const getMenuItems = () => {
      const baseItems = [
        { path: '/campus-hub', icon: 'layout-dashboard', label: 'Campus Hub' },
        { path: '/study-groups', icon: 'users', label: 'Study Rooms' },
        { path: '/mentors', icon: 'graduation-cap', label: 'Mentor Hall' },
        { path: '/resources', icon: 'folder', label: 'Digital Library' },
        { path: '/opportunities', icon: 'calendar', label: 'Opportunity Board' },
        { path: '/leaderboard', icon: 'trophy', label: 'Achievement Wall' }
      ];

      if (userProfile?.role === 'admin') {
        baseItems.push({ path: '/admin', icon: 'settings', label: 'Admin Center' });
      }

      return baseItems;
    };

    const getRoleDisplay = () => {
      if (!userProfile) return 'Loading...';
      
      switch (userProfile.role) {
        case 'admin':
          return 'Campus Administrator';
        case 'mentor':
          return 'Campus Mentor';
        case 'student':
        default:
          return userProfile.isDemo ? 'Demo Student' : 'Campus Student';
      }
    };

    const handleSignOut = async () => {
      if (isNavigating) return;
      
      try {
        setIsNavigating(true);
        if (onSignOut) {
          await onSignOut();
        } else if (window.authUtils) {
          await window.authUtils.signOut();
        } else {
          window.location.reload();
        }
      } catch (error) {
        console.error('Sign out error:', error);
        window.location.reload();
      } finally {
        setIsNavigating(false);
      }
    };

    return (
      <div className="sidebar" data-name="sidebar" data-file="components/Sidebar.js">
        <div className="p-6 border-b" style={{borderColor: 'var(--border-color)'}}>
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <div className="icon-graduation-cap text-white text-lg"></div>
            </div>
            <div>
              <h1 className="text-xl font-bold" style={{color: 'var(--primary-text)'}}>Virtual Campus</h1>
              <p className="text-xs" style={{color: 'var(--secondary-text)'}}>Digital Learning Hub</p>
            </div>
          </div>
        </div>

        <nav className="p-4 space-y-2">
          {getMenuItems().map((item) => (
            <div
              key={item.path}
              className={`nav-item ${
                (currentRoute === item.path || (currentRoute === '/' && item.path === '/campus-hub')) 
                  ? 'active' 
                  : ''
              } ${isNavigating ? 'pointer-events-none opacity-60' : ''}`}
              onClick={() => navigateWithDelay(item.path)}
              style={{
                cursor: isNavigating ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <div className={`icon-${item.icon} text-xl mr-3`}></div>
              <span>{item.label}</span>
              {isNavigating && currentRoute === item.path && (
                <div className="ml-auto animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full"></div>
              )}
            </div>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t" style={{borderColor: 'var(--border-color)'}}>
          <div className="flex items-center space-x-3 mb-3">
            <div className="avatar text-sm">
              {user?.displayName?.charAt(0) || userProfile?.displayName?.charAt(0) || user?.email?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate" style={{color: 'var(--primary-text)'}}>
                {user?.displayName || userProfile?.displayName || 'Campus User'}
              </p>
              <p className="text-xs truncate" style={{color: 'var(--secondary-text)'}}>
                {getRoleDisplay()}
              </p>
              {userProfile?.points !== undefined && (
                <p className="text-xs font-medium" style={{color: 'var(--accent-blue)'}}>
                  {userProfile.points.toLocaleString()} Campus Points
                </p>
              )}
            </div>
          </div>
          <button
            onClick={handleSignOut}
            disabled={isNavigating}
            className={`w-full btn btn-secondary text-sm ${
              isNavigating ? 'opacity-60 cursor-not-allowed' : ''
            }`}
          >
            {isNavigating ? (
              <>
                <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full mr-2"></div>
                Signing Out...
              </>
            ) : (
              <>
                <div className="icon-log-out text-sm mr-2"></div>
                Leave Campus
              </>
            )}
          </button>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Sidebar component error:', error);
    return (
      <div className="sidebar flex items-center justify-center">
        <div className="text-center p-4">
          <div className="icon-alert-circle text-2xl text-red-500 mb-2"></div>
          <p className="text-sm text-red-400">Sidebar Error</p>
          <button 
            onClick={() => window.location.reload()} 
            className="btn btn-primary text-xs mt-2"
          >
            Refresh
          </button>
        </div>
      </div>
    );
  }
}