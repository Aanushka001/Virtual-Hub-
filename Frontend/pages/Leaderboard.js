// C:\Users\aanus\Desktop\Maximally AI Shipathon\Frontend\pages\Leaderboard.js
function Leaderboard({ user }) {
  try {
    const [leaderboard, setLeaderboard] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [userRank, setUserRank] = React.useState(null);
    const [userProfile, setUserProfile] = React.useState(null);

    React.useEffect(() => {
      fetchLeaderboard();
      fetchUserProfile();
    }, [user]);

    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        const leaderboardData = await window.apiUtils.getLeaderboard();
        setLeaderboard(leaderboardData || []);
        
        const currentUserRank = leaderboardData.findIndex(entry => entry.uid === user.uid);
        setUserRank(currentUserRank >= 0 ? currentUserRank + 1 : null);
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
        setLeaderboard([]);
      } finally {
        setLoading(false);
      }
    };

    const fetchUserProfile = async () => {
      try {
        const profile = await window.authUtils.getUserProfile(user.uid);
        setUserProfile(profile);
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    };

    if (loading) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-[var(--primary-color)] border-t-transparent rounded-full"></div>
        </div>
      );
    }

    return (
      <div className="space-y-6" data-name="leaderboard" data-file="pages/Leaderboard.js">
        <div>
          <h2 className="text-xl font-semibold text-[var(--text-primary)]">Achievement Wall</h2>
          <p className="text-[var(--text-secondary)]">See how you rank among campus members</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 card">
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Campus Rankings</h3>
            
            {leaderboard.length === 0 ? (
              <div className="text-center py-8">
                <div className="icon-trophy text-3xl text-[var(--text-secondary)] mb-2"></div>
                <p className="text-[var(--text-secondary)]">No rankings yet. Start earning points!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {leaderboard.slice(0, 10).map((entry, index) => (
                  <div
                    key={entry.uid || index}
                    className={`flex items-center p-3 rounded-lg ${
                      entry.uid === user.uid ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mr-4 ${
                      entry.rank <= 3 ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {entry.rank || index + 1}
                    </div>
                    
                    <div className="w-10 h-10 bg-[var(--primary-color)] rounded-full flex items-center justify-center text-white font-medium mr-4">
                      {(entry.displayName || entry.name || 'U').charAt(0)}
                    </div>
                    
                    <div className="flex-1">
                      <p className="font-medium text-[var(--text-primary)]">
                        {entry.displayName || entry.name || 'Anonymous User'}
                        {entry.uid === user.uid && <span className="text-blue-600 ml-2">(You)</span>}
                      </p>
                      <p className="text-sm text-[var(--text-secondary)]">Level {entry.level || 1}</p>
                    </div>
                    
                    <div className="text-right">
                      <p className="font-bold text-[var(--text-primary)]">{(entry.points || 0).toLocaleString()}</p>
                      <p className="text-xs text-[var(--text-secondary)]">{(entry.badges || []).length} badges</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Your Progress</h3>
            <div className="space-y-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-[var(--primary-color)]">
                  #{userRank || '--'}
                </div>
                <div className="text-sm text-[var(--text-secondary)]">Current Rank</div>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-[var(--text-secondary)]">Points</span>
                  <span className="font-medium">{(userProfile?.points || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-secondary)]">Level</span>
                  <span className="font-medium">{userProfile?.level || 1}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-secondary)]">Badges</span>
                  <span className="font-medium">{(userProfile?.badges || []).length}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-[var(--border-color)]">
                <h4 className="font-medium text-[var(--text-primary)] mb-2">Recent Badges</h4>
                <div className="grid grid-cols-3 gap-2">
                  {(userProfile?.badges || []).slice(0, 6).map((badge, index) => (
                    <div key={index} className="text-center p-2 bg-yellow-50 rounded-lg">
                      <div className="icon-trophy text-yellow-600 text-sm mb-1"></div>
                      <p className="text-xs text-yellow-700 truncate">{badge}</p>
                    </div>
                  ))}
                  {(userProfile?.badges || []).length === 0 && (
                    <div className="col-span-3 text-center text-[var(--text-secondary)] text-sm py-4">
                      No badges yet
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Leaderboard component error:', error);
    return null;
  }
}