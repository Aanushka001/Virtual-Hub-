// pages/Dashboard.js - Fixed Dashboard component
function Dashboard({ user, userProfile, setCurrentRoute }) {
  try {
    const [stats, setStats] = React.useState({
      studyGroups: 0,
      mentorships: 0,
      resources: 0,
      points: 0
    });
    const [liveUsers, setLiveUsers] = React.useState([]);
    const [recentActivity, setRecentActivity] = React.useState([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
      const fetchDashboardData = async () => {
        if (user) {
          try {
            const [dashStats, activity, onlineUsers] = await Promise.all([
              window.apiUtils.getDashboardStats(user.uid),
              window.apiUtils.getUserActivity(user.uid),
              window.apiUtils.getOnlineUsers()
            ]);

            setStats(dashStats || { 
              studyGroups: 0, 
              mentorships: 0, 
              resources: 0, 
              points: userProfile?.points || 0 
            });
            setRecentActivity(activity || []);
            setLiveUsers(onlineUsers || []);
          } catch (error) {
            console.error('Error fetching dashboard data:', error);
          } finally {
            setLoading(false);
          }
        }
      };

      fetchDashboardData();
    }, [user, userProfile]);

    const quickActions = [
      { 
        label: 'Find Study Room', 
        icon: 'users', 
        action: () => {
          setCurrentRoute('/study-groups');
          window.location.hash = '/study-groups';
        },
        description: 'Join or create study groups'
      },
      { 
        label: 'Visit Mentor Hall', 
        icon: 'graduation-cap', 
        action: () => {
          setCurrentRoute('/mentors');
          window.location.hash = '/mentors';
        },
        description: 'Connect with mentors'
      },
      { 
        label: 'Browse Library', 
        icon: 'folder', 
        action: () => {
          setCurrentRoute('/resources');
          window.location.hash = '/resources';
        },
        description: 'Access learning resources'
      },
      { 
        label: 'Check Opportunities', 
        icon: 'calendar', 
        action: () => {
          setCurrentRoute('/opportunities');
          window.location.hash = '/opportunities';
        },
        description: 'Explore events & competitions'
      }
    ];

    if (loading) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
        </div>
      );
    }

    return (
      <div className="space-y-6" data-name="dashboard" data-file="pages/Dashboard.js">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-xl shadow-lg">
          <h2 className="text-2xl font-bold mb-2">Welcome to Virtual Campus!</h2>
          <p className="opacity-90">
            {userProfile?.role === 'admin' ? 'Administrative Dashboard' :
             userProfile?.role === 'mentor' ? 'Mentor Central Hub' :
             'Your digital campus experience starts here'}
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-md border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Study Groups</p>
                <p className="text-2xl font-bold text-gray-800">{stats.studyGroups}</p>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <div className="icon-users text-lg text-blue-600"></div>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-md border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Mentorships</p>
                <p className="text-2xl font-bold text-gray-800">{stats.mentorships}</p>
              </div>
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <div className="icon-graduation-cap text-lg text-green-600"></div>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-md border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Resources</p>
                <p className="text-2xl font-bold text-gray-800">{stats.resources}</p>
              </div>
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <div className="icon-folder text-lg text-purple-600"></div>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-md border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Campus Points</p>
                <p className="text-2xl font-bold text-gray-800">{stats.points}</p>
              </div>
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <div className="icon-trophy text-lg text-yellow-600"></div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-md border">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Campus Navigation</h3>
            <div className="grid grid-cols-2 gap-3">
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  onClick={action.action}
                  className="p-4 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg transition-all text-left group hover:shadow-md"
                >
                  <div className={`icon-${action.icon} text-2xl text-blue-600 mb-2 group-hover:scale-110 transition-transform`}></div>
                  <p className="font-medium text-gray-800 mb-1">{action.label}</p>
                  <p className="text-xs text-gray-600">{action.description}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md border">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Who's Online</h3>
            <div className="space-y-3">
              {liveUsers.slice(0, 5).map((liveUser, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                      {(liveUser.displayName || 'U').charAt(0)}
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">
                      {liveUser.displayName || 'Anonymous User'}
                    </p>
                    <p className="text-xs text-gray-600">
                      {liveUser.role === 'mentor' ? 'Available for mentoring' : 'Online now'}
                    </p>
                  </div>
                </div>
              ))}
              {liveUsers.length === 0 && (
                <p className="text-sm text-gray-600 text-center py-4">
                  No one else is online right now
                </p>
              )}
            </div>
          </div>
        </div>

        {recentActivity.length > 0 && (
          <div className="bg-white p-6 rounded-xl shadow-md border">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Campus Activity</h3>
            <div className="space-y-3">
              {recentActivity.slice(0, 4).map((activity, index) => (
                <div key={index} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                    <div className={`icon-${
                      activity.type === 'group' ? 'users' : 
                      activity.type === 'resource' ? 'book' : 
                      activity.type === 'achievement' ? 'trophy' : 'user'
                    } text-sm text-gray-600`}></div>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800">{activity.action}</p>
                    <p className="text-xs text-gray-600">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  } catch (error) {
    console.error('Dashboard component error:', error);
    return (
      <div className="p-6 text-center">
        <div className="icon-alert-circle text-4xl text-red-500 mb-4"></div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Error Loading Dashboard</h3>
        <p className="text-gray-600">Please refresh the page to try again</p>
      </div>
    );
  }
}