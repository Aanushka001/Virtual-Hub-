function Opportunities({ user }) {
  try {
    const [opportunities, setOpportunities] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [applying, setApplying] = React.useState({});
    const [savedOpportunities, setSavedOpportunities] = React.useState(new Set());
    const [filters, setFilters] = React.useState({
      type: 'All Types',
      difficulty: 'All Difficulty'
    });
    const [selectedOpportunity, setSelectedOpportunity] = React.useState(null);
    const [applications, setApplications] = React.useState([]);

    React.useEffect(() => {
      fetchOpportunities();
      loadSavedOpportunities();
      loadUserApplications();
    }, [user]);

    const fetchOpportunities = async () => {
      try {
        setLoading(true);
        const opportunityData = await window.apiUtils.getOpportunities();
        setOpportunities(opportunityData || []);
      } catch (error) {
        console.error('Error fetching opportunities:', error);
        setOpportunities([]);
      } finally {
        setLoading(false);
      }
    };

    const loadSavedOpportunities = async () => {
      try {
        const userDoc = await window.firestore.collection('users').doc(user.uid).get();
        if (userDoc.exists) {
          const userData = userDoc.data();
          setSavedOpportunities(new Set(userData.savedOpportunities || []));
        }
      } catch (error) {
        console.error('Error loading saved opportunities:', error);
      }
    };

    const loadUserApplications = async () => {
      try {
        const snapshot = await window.firestore.collection('applications')
          .where('userId', '==', user.uid)
          .get();
        const userApplications = snapshot.docs.map(doc => doc.data());
        setApplications(userApplications);
      } catch (error) {
        console.error('Error loading applications:', error);
      }
    };

    const handleApply = async (opportunityId, opportunityTitle) => {
      try {
        setApplying(prev => ({ ...prev, [opportunityId]: true }));
        const applicationId = `app_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const applicationData = {
          id: applicationId,
          userId: user.uid,
          opportunityId,
          opportunityTitle,
          status: 'submitted',
          appliedAt: firebase.firestore.FieldValue.serverTimestamp(),
          userProfile: { name: user.displayName, email: user.email }
        };
        await window.firestore.collection('applications').doc(applicationId).set(applicationData);
        setApplications(prev => [...prev, applicationData]);
        window.notificationUtils.addNotification({
          type: 'opportunity',
          title: 'Application Submitted!',
          message: `Applied for "${opportunityTitle}"`,
          time: 'Just now'
        });
      } catch (error) {
        console.error('Error applying for opportunity:', error);
      } finally {
        setApplying(prev => ({ ...prev, [opportunityId]: false }));
      }
    };

    const handleSave = async (opportunityId) => {
      try {
        const newSaved = new Set(savedOpportunities);
        if (newSaved.has(opportunityId)) newSaved.delete(opportunityId);
        else newSaved.add(opportunityId);
        setSavedOpportunities(newSaved);
        await window.firestore.collection('users').doc(user.uid).update({
          savedOpportunities: Array.from(newSaved)
        });
      } catch (error) {
        console.error('Error saving opportunity:', error);
      }
    };

    const handleViewDetails = (opportunity) => setSelectedOpportunity(opportunity);

    const isUserApplied = (opportunityId) => applications.some(app => app.opportunityId === opportunityId);

    const getDifficultyColor = (difficulty) => {
      switch (difficulty) {
        case 'Beginner': return 'bg-green-800 text-green-200 border-green-700';
        case 'Intermediate': return 'bg-yellow-800 text-yellow-200 border-yellow-700';
        case 'Advanced': return 'bg-red-800 text-red-200 border-red-700';
        default: return 'bg-gray-800 text-gray-200 border-gray-700';
      }
    };

    const getTypeIcon = (type) => {
      switch (type) {
        case 'Competition': return 'trophy';
        case 'Workshop': return 'book-open';
        case 'Internship': return 'briefcase';
        case 'Event': return 'calendar';
        default: return 'star';
      }
    };

    const filteredOpportunities = opportunities.filter(opp => {
      if (filters.type !== 'All Types' && opp.type !== filters.type) return false;
      if (filters.difficulty !== 'All Difficulty' && opp.difficulty !== filters.difficulty) return false;
      return true;
    });

    if (loading) {
      return (
        <div className="flex items-center justify-center py-12 bg-black text-white min-h-screen">
          <div className="animate-spin w-8 h-8 border-4 border-white border-t-transparent rounded-full"></div>
        </div>
      );
    }

    return (
      <div className="space-y-6 bg-black text-white min-h-screen px-4 py-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold mb-2">Opportunity Board</h2>
            <p className="text-gray-300">Discover competitions, workshops, and career opportunities</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => {
                window.notificationUtils.addNotification({
                  type: 'opportunity',
                  title: 'Applications Updated!',
                  message: `You have ${applications.length} active applications`,
                  time: 'Just now'
                });
              }}
              className="btn bg-gray-800 text-white shadow-md hover:shadow-lg transition-all"
            >
              <div className="icon-file-text text-sm mr-2"></div>
              My Applications ({applications.length})
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 mb-6">
          <select
            value={filters.type}
            onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
            className="input-field w-auto bg-gray-900 text-white border-gray-700 shadow-sm"
          >
            <option>All Types</option>
            <option>Competition</option>
            <option>Workshop</option>
            <option>Internship</option>
            <option>Event</option>
          </select>
          <select
            value={filters.difficulty}
            onChange={(e) => setFilters(prev => ({ ...prev, difficulty: e.target.value }))}
            className="input-field w-auto bg-gray-900 text-white border-gray-700 shadow-sm"
          >
            <option>All Difficulty</option>
            <option>Beginner</option>
            <option>Intermediate</option>
            <option>Advanced</option>
          </select>
        </div>

        {filteredOpportunities.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <div className="icon-calendar text-4xl text-white"></div>
            </div>
            <h3 className="text-xl font-bold mb-2">No Opportunities Available</h3>
            <p className="text-gray-300">Check back later for new opportunities or adjust your filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredOpportunities.map((opportunity) => (
              <div key={opportunity.id} className="card bg-gray-900 text-white border-gray-700 hover:shadow-xl transition-all transform hover:scale-105">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center shadow-lg ${
                      opportunity.type === 'Competition' ? 'bg-yellow-700' :
                      opportunity.type === 'Workshop' ? 'bg-blue-700' :
                      opportunity.type === 'Internship' ? 'bg-green-700' :
                      'bg-pink-700'
                    } text-white`}>
                      <div className={`icon-${getTypeIcon(opportunity.type)} text-lg`}></div>
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">{opportunity.title}</h3>
                      <p className="text-gray-400 text-sm">{opportunity.organizer}</p>
                    </div>
                  </div>
                  <span className={`text-xs px-3 py-1 rounded-full font-medium border ${getDifficultyColor(opportunity.difficulty)}`}>
                    {opportunity.difficulty}
                  </span>
                </div>

                <div className="space-y-3 mb-4 text-gray-300">
                  <div className="flex items-center text-sm">
                    <div className="icon-tag text-lg mr-3 text-white"></div>
                    <span className="font-medium">{opportunity.type}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <div className="icon-calendar text-lg mr-3 text-white"></div>
                    <span className="font-medium">Deadline: {opportunity.deadline}</span>
                  </div>
                  {opportunity.prizes && (
                    <div className="flex items-center text-sm">
                      <div className="icon-trophy text-lg mr-3 text-white"></div>
                      <span className="font-medium">{opportunity.prizes}</span>
                    </div>
                  )}
                </div>

                {opportunity.description && (
                  <p className="text-sm mb-4 bg-gray-800 p-3 rounded-lg border border-gray-700">
                    {opportunity.description}
                  </p>
                )}

                {opportunity.tags && (
                  <div className="mb-4 flex flex-wrap gap-1">
                    {opportunity.tags.slice(0, 3).map((tag, idx) => (
                      <span key={idx} className="text-xs bg-gray-700 text-white px-2 py-1 rounded-full border border-gray-600">{tag}</span>
                    ))}
                  </div>
                )}

                <div className="flex space-x-2">
                  {isUserApplied(opportunity.id) ? (
                    <button className="flex-1 btn bg-green-800 text-green-200 cursor-not-allowed shadow-sm">
                      <div className="icon-check text-sm mr-2"></div>
                      Applied
                    </button>
                  ) : (
                    <button 
                      onClick={() => handleApply(opportunity.id, opportunity.title)}
                      disabled={applying[opportunity.id]}
                      className="flex-1 btn bg-blue-800 text-white shadow-md hover:shadow-lg transform hover:scale-105 transition-all"
                    >
                      {applying[opportunity.id] ? 'Applying...' : 'Apply Now'}
                    </button>
                  )}
                  <button 
                    onClick={() => handleSave(opportunity.id)}
                    className={`btn shadow-md hover:shadow-lg transition-all ${
                      savedOpportunities.has(opportunity.id) 
                        ? 'bg-yellow-800 text-yellow-200 border border-yellow-700' 
                        : 'bg-gray-800 text-white border-gray-700'
                    }`}
                  >
                    <div className="icon-bookmark text-lg"></div>
                  </button>
                  <button 
                    onClick={() => handleViewDetails(opportunity)}
                    className="btn bg-gray-800 text-white shadow-md hover:shadow-lg transition-all"
                  >
                    <div className="icon-info text-lg"></div>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  } catch (error) {
    console.error('Opportunities component error:', error);
    return (
      <div className="text-center py-12 bg-black text-white min-h-screen">
        <div className="icon-alert-circle text-4xl text-red-500 mb-4"></div>
        <h3 className="text-lg font-semibold mb-2">Error Loading Opportunities</h3>
        <p className="text-gray-300">Please refresh the page to try again</p>
      </div>
    );
  }
}
