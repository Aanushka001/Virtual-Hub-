function Sidebar({ currentRoute, user, userProfile }) {
  try {
    const [isCollapsed, setIsCollapsed] = React.useState(false);
    const [hoveredItem, setHoveredItem] = React.useState(null);

    const getMenuItems = () => {
      const baseItems = [
        { path: '/campus-hub', icon: 'layout-dashboard', label: 'Campus Hub', color: 'var(--accent-blue)' },
        { path: '/study-groups', icon: 'users', label: 'Study Rooms', color: 'var(--accent-purple)' },
        { path: '/mentors', icon: 'graduation-cap', label: 'Mentor Hall', color: 'var(--success-color)' },
        { path: '/resources', icon: 'folder', label: 'Digital Library', color: 'var(--warning-color)' },
        { path: '/opportunities', icon: 'calendar', label: 'Opportunity Board', color: 'var(--danger-color)' },
        { path: '/leaderboard', icon: 'trophy', label: 'Achievement Wall', color: '#FF6B35' }
      ];

      if (userProfile?.role === 'admin') {
        baseItems.push({ 
          path: '/admin', 
          icon: 'settings', 
          label: 'Admin Center', 
          color: '#6B7280' 
        });
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

    const getRoleBadgeColor = () => {
      switch (userProfile?.role) {
        case 'admin': return 'var(--accent-purple)';
        case 'mentor': return 'var(--success-color)';
        default: return 'var(--accent-blue)';
      }
    };

    const getActiveItemStyle = (item) => {
      const isActive = currentRoute === item.path || (currentRoute === '/' && item.path === '/campus-hub');
      const isHovered = hoveredItem === item.path;
      
      return `nav-item ${isActive ? 'active' : ''}`;
    };

    return (
      <div className={`sidebar ${isCollapsed ? 'w-20' : 'w-64'} transition-all duration-300`} 
           data-name="sidebar" data-file="components/Sidebar.js">
        
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <div className={`flex items-center space-x-3 ${isCollapsed ? 'justify-center' : ''}`}>
              <div className="w-10 h-10 campus-building rounded-xl flex items-center justify-center">
                <i className="icon-graduation-cap text-white text-xl"></i>
              </div>
              {!isCollapsed && (
                <div>
                  <h1 className="text-xl font-bold text-gradient">Virtual Campus</h1>
                  <p className="text-xs" style={{color: 'var(--secondary-text)'}}>Digital Learning Hub</p>
                </div>
              )}
            </div>
            <button 
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <i className={`icon-${isCollapsed ? 'chevron-right' : 'chevron-left'} text-lg`} style={{color: 'var(--secondary-text)'}}></i>
            </button>
          </div>
        </div>

        <nav className="p-4 space-y-2 flex-1">
          {getMenuItems().map((item) => (
            <div
              key={item.path}
              className={getActiveItemStyle(item)}
              onClick={() => window.router.navigate(item.path)}
              onMouseEnter={() => setHoveredItem(item.path)}
              onMouseLeave={() => setHoveredItem(null)}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white mr-3`} style={{background: item.color, boxShadow: hoveredItem === item.path ? `0 0 20px ${item.color}40` : 'none'}}>
                <i className={`icon-${item.icon} text-lg`}></i>
              </div>
              {!isCollapsed && (
                <span className="font-medium">{item.label}</span>
              )}
              {!isCollapsed && (currentRoute === item.path || (currentRoute === '/' && item.path === '/campus-hub')) && (
                <div className="ml-auto">
                  <div className="w-2 h-2 rounded-full animate-pulse" style={{background: 'var(--accent-blue)'}}></div>
                </div>
              )}
            </div>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-700">
          <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'} mb-4`}>
            <div className="relative">
              <div className={`rounded-full flex items-center justify-center text-white font-bold glow-blue transition-all ${isCollapsed ? 'w-10 h-10' : 'w-12 h-12'}`} style={{background: getRoleBadgeColor()}}>
                {user?.displayName?.charAt(0) || userProfile?.displayName?.charAt(0) || user?.email?.charAt(0) || 'U'}
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-gray-800 rounded-full animate-pulse"></div>
            </div>
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold truncate" style={{color: 'var(--primary-text)'}}>
                  {user?.displayName || userProfile?.displayName || 'Campus User'}
                </p>
                <p className="text-xs truncate" style={{color: 'var(--secondary-text)'}}>
                  {getRoleDisplay()}
                </p>
                {userProfile?.points !== undefined && (
                  <div className="flex items-center mt-1">
                    <i className="icon-star text-xs text-yellow-500 mr-1"></i>
                    <p className="text-xs font-bold" style={{color: 'var(--accent-blue)'}}>
                      {userProfile.points} Points
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {!isCollapsed && userProfile?.level && (
            <div className="mb-4">
              <div className="flex items-center justify-between text-xs mb-1" style={{color: 'var(--secondary-text)'}}>
                <span>Level {userProfile.level}</span>
                <span>{userProfile.points}/1000</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className="progress-bar h-2 rounded-full transition-all duration-500"
                  style={{ width: `${((userProfile.points % 1000) / 1000) * 100}%` }}
                ></div>
              </div>
            </div>
          )}
          
          <button
            onClick={() => window.authUtils.signOut()}
            className={`w-full btn bg-red-600 hover:bg-red-700 text-white glow-purple transition-all ${isCollapsed ? 'px-2' : ''}`}
          >
            <i className="icon-log-out text-lg mr-2"></i>
            {!isCollapsed && 'Leave Campus'}
          </button>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Sidebar component error:', error);
    return (
      <div className="sidebar border-r border-gray-700">
        <div className="p-4 text-center">
          <i className="icon-alert-circle text-2xl text-red-500 mb-2"></i>
          <p className="text-sm text-red-400">Sidebar Error</p>
        </div>
      </div>
    );
  }
}