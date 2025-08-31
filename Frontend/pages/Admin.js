// C:\Users\aanus\Desktop\Maximally AI Shipathon\Frontend\pages\Admin.js
function Admin({ user }) {
  try {
    const [userProfile, setUserProfile] = React.useState(null);
    const [stats, setStats] = React.useState({
      totalUsers: 0,
      activeGroups: 0,
      totalResources: 0,
      pendingApprovals: 0
    });
    const [users, setUsers] = React.useState([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
      const fetchUserProfile = async () => {
        if (user) {
          try {
            const profile = await window.authUtils.getUserProfile(user.uid);
            setUserProfile(profile);
            
            if (profile?.role === 'admin') {
              await fetchAdminData();
            }
          } catch (error) {
            console.error('Error fetching user profile:', error);
          } finally {
            setLoading(false);
          }
        }
      };
      fetchUserProfile();
    }, [user]);

    const fetchAdminData = async () => {
      try {
        const [usersSnapshot, groupsSnapshot, resourcesSnapshot] = await Promise.all([
          window.firestore.collection('users').get(),
          window.firestore.collection('study_groups').get(),
          window.firestore.collection('resources').get()
        ]);

        setStats({
          totalUsers: usersSnapshot.size,
          activeGroups: groupsSnapshot.size,
          totalResources: resourcesSnapshot.size,
          pendingApprovals: resourcesSnapshot.docs.filter(doc => !doc.data().approved).length
        });

        setUsers(usersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })));
      } catch (error) {
        console.error('Error fetching admin data:', error);
      }
    };

    const handleDeleteUser = async (userId, userName) => {
      if (window.confirm(`Are you sure you want to delete user ${userName}? This action cannot be undone.`)) {
        try {
          await window.firestore.collection('users').doc(userId).delete();
          await fetchAdminData();
          alert('User deleted successfully');
        } catch (error) {
          console.error('Error deleting user:', error);
          alert('Failed to delete user');
        }
      }
    };

    const handleApproveResource = async (resourceId) => {
      try {
        await window.firestore.collection('resources').doc(resourceId).update({
          approved: true,
          approvedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        await fetchAdminData();
        alert('Resource approved successfully');
      } catch (error) {
        console.error('Error approving resource:', error);
        alert('Failed to approve resource');
      }
    };

    if (loading) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-[var(--primary-color)] border-t-transparent rounded-full"></div>
        </div>
      );
    }

    if (userProfile?.role !== 'admin') {
      return (
        <div className="text-center py-12">
          <div className="icon-lock text-4xl text-[var(--text-secondary)] mb-4"></div>
          <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-2">Access Denied</h2>
          <p className="text-[var(--text-secondary)]">You don't have permission to access this page.</p>
        </div>
      );
    }

    return (
      <div className="space-y-6" data-name="admin" data-file="pages/Admin.js">
        <div>
          <h2 className="text-xl font-semibold text-[var(--text-primary)]">Admin Panel</h2>
          <p className="text-[var(--text-secondary)]">Manage platform users and content</p>
        </div>

        <div className="dashboard-grid">
          <div className="stat-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[var(--text-secondary)] text-sm">Total Users</p>
                <p className="text-2xl font-bold text-[var(--text-primary)]">{stats.totalUsers}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <div className="icon-users text-xl text-blue-600"></div>
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[var(--text-secondary)] text-sm">Active Groups</p>
                <p className="text-2xl font-bold text-[var(--text-primary)]">{stats.activeGroups}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <div className="icon-users text-xl text-green-600"></div>
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[var(--text-secondary)] text-sm">Resources</p>
                <p className="text-2xl font-bold text-[var(--text-primary)]">{stats.totalResources}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <div className="icon-folder text-xl text-purple-600"></div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card">
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Recent Users</h3>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {users.slice(0, 5).map((user) => (
                <div key={user.id} className="flex items-center justify-between p-2 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-[var(--primary-color)] rounded-full flex items-center justify-center text-white text-sm">
                      {user.displayName?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <p className="font-medium text-[var(--text-primary)] text-sm">{user.displayName}</p>
                      <p className="text-xs text-[var(--text-secondary)]">{user.email}</p>
                      <p className="text-xs text-[var(--text-secondary)]">Role: {user.role}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteUser(user.id, user.displayName)}
                    className="text-red-600 hover:text-red-700 text-sm"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Platform Actions</h3>
            <div className="space-y-3">
              <button
                onClick={fetchAdminData}
                className="w-full btn btn-primary text-left"
              >
                <div className="icon-refresh-cw text-lg mr-3"></div>
                Refresh Data
              </button>
              <button
                onClick={() => alert('User management feature coming soon!')}
                className="w-full btn btn-secondary text-left"
              >
                <div className="icon-user-plus text-lg mr-3"></div>
                Manage Users
              </button>
              <button
                onClick={() => alert('Resource review feature coming soon!')}
                className="w-full btn btn-secondary text-left"
              >
                <div className="icon-folder text-lg mr-3"></div>
                Review Resources
              </button>
              <button
                onClick={() => alert('Platform settings coming soon!')}
                className="w-full btn btn-secondary text-left"
              >
                <div className="icon-settings text-lg mr-3"></div>
                Platform Settings
              </button>
            </div>
          </div>
        </div>

        {stats.pendingApprovals > 0 && (
          <div className="card">
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
              Pending Approvals ({stats.pendingApprovals})
            </h3>
            <p className="text-[var(--text-secondary)]">
              There are {stats.pendingApprovals} resources waiting for approval.
            </p>
          </div>
        )}
      </div>
    );
  } catch (error) {
    console.error('Admin component error:', error);
    return null;
  }
}