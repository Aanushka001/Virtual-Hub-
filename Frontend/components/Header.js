// components/Header.js
function Header({ user, userProfile, onSignOut }) {
  const [showProfileMenu, setShowProfileMenu] = React.useState(false);
  const [signingOut, setSigningOut] = React.useState(false);

  const handleSignOut = async () => {
    if (signingOut) return;
    
    setSigningOut(true);
    try {
      console.log('Header: Starting sign out process...');
      
      if (onSignOut) {
        await onSignOut();
      } else if (window.authUtils) {
        await window.authUtils.signOut();
      } else {
        console.error('No sign out method available, forcing reload');
        window.location.reload();
      }
    } catch (error) {
      console.error('Header sign out error:', error);
      // Force reload as fallback
      window.location.reload();
    } finally {
      setSigningOut(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const displayName = userProfile?.displayName || user?.displayName || user?.email?.split('@')[0] || 'Student';

  return (
    <header className="bg-card-bg border-b border-border-color p-4 sticky top-0 z-30 glass-effect">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button 
            className="lg:hidden p-2 rounded-lg hover:bg-gray-700 transition-colors"
            onClick={() => {
              const sidebar = document.querySelector('.sidebar');
              if (sidebar) {
                sidebar.classList.toggle('mobile-open');
              }
            }}
          >
            <i className="icon-menu text-xl" style={{color: 'var(--primary-text)'}}></i>
          </button>
          
          <div>
            <h1 className="text-xl font-bold text-gradient">Virtual Campus</h1>
            <p className="text-sm" style={{color: 'var(--secondary-text)'}}>
              Digital Learning Ecosystem
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <button className="relative p-2 rounded-lg hover:bg-gray-700 transition-colors group">
            <i className="icon-bell text-xl" style={{color: 'var(--secondary-text)'}}></i>
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* Search */}
          <button className="p-2 rounded-lg hover:bg-gray-700 transition-colors">
            <i className="icon-search text-xl" style={{color: 'var(--secondary-text)'}}></i>
          </button>

          {/* Profile Menu */}
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              <div className="avatar">
                {getInitials(displayName)}
              </div>
              <div className="hidden md:block text-left">
                <p className="font-medium" style={{color: 'var(--primary-text)'}}>
                  {displayName}
                </p>
                <p className="text-xs" style={{color: 'var(--secondary-text)'}}>
                  {userProfile?.role || 'Student'} • Level {userProfile?.level || 1}
                </p>
              </div>
              <i className="icon-chevron-down text-sm" style={{color: 'var(--secondary-text)'}}></i>
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-64 card py-2 z-50 animate-fade-in-up">
                <div className="px-4 py-3 border-b border-border-color">
                  <div className="flex items-center space-x-3">
                    <div className="avatar">
                      {getInitials(displayName)}
                    </div>
                    <div>
                      <p className="font-medium" style={{color: 'var(--primary-text)'}}>
                        {displayName}
                      </p>
                      <p className="text-sm" style={{color: 'var(--secondary-text)'}}>
                        {user?.email}
                      </p>
                      {userProfile?.isDemo && (
                        <span className="inline-block px-2 py-1 text-xs bg-purple-900 text-purple-300 rounded-full mt-1">
                          Demo Mode
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="py-2">
                  <button className="w-full text-left px-4 py-2 hover:bg-gray-700 transition-colors flex items-center">
                    <i className="icon-user mr-3" style={{color: 'var(--secondary-text)'}}></i>
                    <span style={{color: 'var(--primary-text)'}}>Profile Settings</span>
                  </button>
                  
                  <button className="w-full text-left px-4 py-2 hover:bg-gray-700 transition-colors flex items-center">
                    <i className="icon-settings mr-3" style={{color: 'var(--secondary-text)'}}></i>
                    <span style={{color: 'var(--primary-text)'}}>Preferences</span>
                  </button>
                  
                  <button className="w-full text-left px-4 py-2 hover:bg-gray-700 transition-colors flex items-center">
                    <i className="icon-help-circle mr-3" style={{color: 'var(--secondary-text)'}}></i>
                    <span style={{color: 'var(--primary-text)'}}>Help & Support</span>
                  </button>
                </div>

                <div className="border-t border-border-color pt-2">
                  <button
                    onClick={handleSignOut}
                    disabled={signingOut}
                    className="w-full text-left px-4 py-2 hover:bg-red-900 transition-colors flex items-center text-red-400 hover:text-red-300"
                  >
                    <i className={`mr-3 ${signingOut ? 'icon-loader animate-spin' : 'icon-log-out'}`}></i>
                    <span>{signingOut ? 'Signing Out...' : 'Sign Out'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Click outside to close menu */}
      {showProfileMenu && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowProfileMenu(false)}
        ></div>
      )}
    </header>
  );
}