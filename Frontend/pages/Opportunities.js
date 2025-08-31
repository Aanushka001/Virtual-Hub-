// C:\Users\aanus\Desktop\Maximally AI Shipathon\Frontend\pages\Opportunities.js
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
          opportunityId: opportunityId,
          opportunityTitle: opportunityTitle,
          status: 'submitted',
          appliedAt: firebase.firestore.FieldValue.serverTimestamp(),
          userProfile: {
            name: user.displayName,
            email: user.email
          }
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
        if (newSaved.has(opportunityId)) {
          newSaved.delete(opportunityId);
        } else {
          newSaved.add(opportunityId);
        }
        
        setSavedOpportunities(newSaved);
        
        await window.firestore.collection('users').doc(user.uid).update({
          savedOpportunities: Array.from(newSaved)
        });
      } catch (error) {
        console.error('Error saving opportunity:', error);
      }
    };

    const handleViewDetails = (opportunity) => {
      setSelectedOpportunity(opportunity);
    };

    const isUserApplied = (opportunityId) => {
      return applications.some(app => app.opportunityId === opportunityId);
    };

    const getDifficultyColor = (difficulty) => {
      switch (difficulty) {
        case 'Beginner': return 'bg-green-100 text-green-700 border-green-300';
        case 'Intermediate': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
        case 'Advanced': return 'bg-red-100 text-red-700 border-red-300';
        default: return 'bg-gray-100 text-gray-700 border-gray-300';
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
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-[var(--primary-color)] border-t-transparent rounded-full"></div>
        </div>
      );
    }

    return (
      <div className="space-y-6" data-name="opportunities" data-file="pages/Opportunities.js">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Opportunity Board</h2>
            <p className="text-[var(--text-secondary)]">Discover competitions, workshops, and career opportunities</p>
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
              className="btn btn-secondary shadow-md hover:shadow-lg transition-all"
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
            className="input-field w-auto shadow-sm"
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
            className="input-field w-auto shadow-sm"
          >
            <option>All Difficulty</option>
            <option>Beginner</option>
            <option>Intermediate</option>
            <option>Advanced</option>
          </select>
        </div>

        {selectedOpportunity && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-xl w-full max-w-2xl max-h-96 overflow-y-auto shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-[var(--text-primary)]">{selectedOpportunity.title}</h3>
                <button 
                  onClick={() => setSelectedOpportunity(null)}
                  className="text-gray-500 hover:text-gray-700 p-2 hover:bg-gray-100 rounded-lg"
                >
                  <div className="icon-x text-xl"></div>
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getDifficultyColor(selectedOpportunity.difficulty)}`}>
                    {selectedOpportunity.difficulty}
                  </span>
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-700 border border-blue-300">
                    {selectedOpportunity.type}
                  </span>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center text-sm">
                    <div className="icon-calendar text-lg mr-3 text-[var(--primary-color)]"></div>
                    <span><strong>Deadline:</strong> {selectedOpportunity.deadline}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <div className="icon-trophy text-lg mr-3 text-[var(--primary-color)]"></div>
                    <span><strong>Prizes:</strong> {selectedOpportunity.prizes}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <div className="icon-building text-lg mr-3 text-[var(--primary-color)]"></div>
                    <span><strong>Organizer:</strong> {selectedOpportunity.organizer}</span>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg border">
                  <h4 className="font-semibold mb-2">Description</h4>
                  <p className="text-sm text-[var(--text-secondary)]">{selectedOpportunity.description}</p>
                </div>
                
                {selectedOpportunity.tags && (
                  <div>
                    <h4 className="font-semibold mb-2">Tags</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedOpportunity.tags.map((tag, idx) => (
                        <span key={idx} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full border">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="flex space-x-3 pt-4">
                  {isUserApplied(selectedOpportunity.id) ? (
                    <button className="flex-1 btn bg-green-100 text-green-700 cursor-not-allowed">
                      <div className="icon-check text-sm mr-2"></div>
                      Applied
                    </button>
                  ) : (
                    <button 
                      onClick={() => {
                        handleApply(selectedOpportunity.id, selectedOpportunity.title);
                        setSelectedOpportunity(null);
                      }}
                      disabled={applying[selectedOpportunity.id]}
                      className="flex-1 btn btn-primary"
                    >
                      {applying[selectedOpportunity.id] ? 'Applying...' : 'Apply Now'}
                    </button>
                  )}
                  <button 
                    onClick={() => window.open(selectedOpportunity.registrationUrl, '_blank')}
                    className="btn btn-secondary"
                  >
                    <div className="icon-external-link text-sm mr-2"></div>
                    Visit
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {filteredOpportunities.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <div className="icon-calendar text-4xl text-[var(--primary-color)]"></div>
            </div>
            <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">No Opportunities Available</h3>
            <p className="text-[var(--text-secondary)]">Check back later for new opportunities or adjust your filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredOpportunities.map((opportunity) => (
              <div key={opportunity.id} className="card hover:shadow-xl transition-all transform hover:scale-105 bg-gradient-to-br from-white to-gray-50 border-2 hover:border-[var(--primary-color)]">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 bg-gradient-to-r ${
                      opportunity.type === 'Competition' ? 'from-yellow-400 to-orange-500' :
                      opportunity.type === 'Workshop' ? 'from-blue-400 to-purple-500' :
                      opportunity.type === 'Internship' ? 'from-green-400 to-teal-500' :
                      'from-pink-400 to-red-500'
                    } rounded-lg flex items-center justify-center text-white shadow-lg`}>
                      <div className={`icon-${getTypeIcon(opportunity.type)} text-lg`}></div>
                    </div>
                    <div>
                      <h3 className="font-bold text-[var(--text-primary)] text-lg">{opportunity.title}</h3>
                      <p className="text-sm text-[var(--text-secondary)]">{opportunity.organizer}</p>
                    </div>
                  </div>
                  <span className={`text-xs px-3 py-1 rounded-full font-medium border ${getDifficultyColor(opportunity.difficulty)}`}>
                    {opportunity.difficulty}
                  </span>
                </div>
                
                <div className="space-y-3 mb-4">
                  <div className="flex items-center text-sm text-[var(--text-secondary)]">
                    <div className="icon-tag text-lg mr-3 text-[var(--primary-color)]"></div>
                    <span className="font-medium">{opportunity.type}</span>
                  </div>
                  <div className="flex items-center text-sm text-[var(--text-secondary)]">
                    <div className="icon-calendar text-lg mr-3 text-[var(--primary-color)]"></div>
                    <span className="font-medium">Deadline: {opportunity.deadline}</span>
                  </div>
                  {opportunity.prizes && (
                    <div className="flex items-center text-sm text-[var(--text-secondary)]">
                      <div className="icon-trophy text-lg mr-3 text-[var(--primary-color)]"></div>
                      <span className="font-medium">{opportunity.prizes}</span>
                    </div>
                  )}
                </div>
                
                {opportunity.description && (
                  <p className="text-sm text-[var(--text-secondary)] mb-4 bg-gray-50 p-3 rounded-lg border">
                    {opportunity.description}
                  </p>
                )}

                {opportunity.tags && (
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-1">
                      {opportunity.tags.slice(0, 3).map((tag, idx) => (
                        <span key={idx} className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-full border border-blue-200">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="flex space-x-2">
                  {isUserApplied(opportunity.id) ? (
                    <button className="flex-1 btn bg-green-100 text-green-700 cursor-not-allowed shadow-sm">
                      <div className="icon-check text-sm mr-2"></div>
                      Applied
                    </button>
                  ) : (
                    <button 
                      onClick={() => handleApply(opportunity.id, opportunity.title)}
                      disabled={applying[opportunity.id]}
                      className="flex-1 btn btn-primary shadow-md hover:shadow-lg transform hover:scale-105 transition-all"
                    >
                      {applying[opportunity.id] ? 'Applying...' : 'Apply Now'}
                    </button>
                  )}
                  <button 
                    onClick={() => handleSave(opportunity.id)}
                    className={`btn shadow-md hover:shadow-lg transition-all ${
                      savedOpportunities.has(opportunity.id) 
                        ? 'bg-yellow-100 text-yellow-700 border border-yellow-300' 
                        : 'btn-secondary'
                    }`}
                  >
                    <div className="icon-bookmark text-lg"></div>
                  </button>
                  <button 
                    onClick={() => handleViewDetails(opportunity)}
                    className="btn btn-secondary shadow-md hover:shadow-lg transition-all"
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
      <div className="text-center py-12">
        <div className="icon-alert-circle text-4xl text-red-500 mb-4"></div>
        <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">Error Loading Opportunities</h3>
        <p className="text-[var(--text-secondary)]">Please refresh the page to try again</p>
      </div>
    );
  }
}