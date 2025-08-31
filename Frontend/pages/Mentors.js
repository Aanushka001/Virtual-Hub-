function Mentors({ user }) {
  try {
    const [mentors, setMentors] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [connecting, setConnecting] = React.useState({});
    const [showRequestModal, setShowRequestModal] = React.useState(false);
    const [selectedMentor, setSelectedMentor] = React.useState(null);
    const [requestMessage, setRequestMessage] = React.useState('');

    React.useEffect(() => {
      fetchMentors();
    }, [user]);

    const fetchMentors = async () => {
      try {
        setLoading(true);
        const mentorData = await window.apiUtils.getMentors();
        setMentors(mentorData || []);
      } catch (error) {
        console.error('Error fetching mentors:', error);
        setMentors([]);
      } finally {
        setLoading(false);
      }
    };

    const handleConnectRequest = (mentor) => {
      setSelectedMentor(mentor);
      setShowRequestModal(true);
    };

    const sendMentorRequest = async () => {
      try {
        setConnecting(prev => ({ ...prev, [selectedMentor.id]: true }));
        await window.apiUtils.requestMentorship(selectedMentor.id, requestMessage);
        
        window.notificationUtils.addNotification({
          type: 'mentor',
          title: 'Mentorship Request Sent!',
          message: `Request sent to ${selectedMentor.name}`,
          time: 'Just now'
        });

        setShowRequestModal(false);
        setRequestMessage('');
        setSelectedMentor(null);
      } catch (error) {
        console.error('Error sending mentor request:', error);
      } finally {
        setConnecting(prev => ({ ...prev, [selectedMentor.id]: false }));
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
      <div className="space-y-6" data-name="mentors" data-file="pages/Mentors.js">
        <div>
          <h2 className="text-xl font-semibold text-[var(--text-primary)]">Mentor Hall</h2>
          <p className="text-[var(--text-secondary)]">Connect with experienced mentors and industry experts</p>
        </div>

        <div className="flex flex-wrap gap-4 mb-6">
          <select className="input-field w-auto">
            <option>All Expertise Areas</option>
            <option>Web Development</option>
            <option>Data Science</option>
            <option>UI/UX Design</option>
            <option>Mobile Development</option>
            <option>DevOps</option>
          </select>
          <select className="input-field w-auto">
            <option>All Experience Levels</option>
            <option>1-3 years</option>
            <option>3-5 years</option>
            <option>5+ years</option>
          </select>
        </div>

        {mentors.length === 0 ? (
          <div className="text-center py-12">
            <div className="icon-graduation-cap text-4xl text-[var(--text-secondary)] mb-4"></div>
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">No Mentors Available</h3>
            <p className="text-[var(--text-secondary)]">Check back later for mentor opportunities</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {mentors.map((mentor) => (
              <div key={mentor.id} className="card hover:shadow-md transition-shadow">
                <div className="text-center mb-4">
                  <div className="w-16 h-16 bg-[var(--primary-color)] rounded-full mx-auto mb-3 flex items-center justify-center text-white text-xl font-bold">
                    {mentor.name?.charAt(0) || 'M'}
                  </div>
                  <h3 className="font-semibold text-[var(--text-primary)]">{mentor.name}</h3>
                  <p className="text-sm text-[var(--text-secondary)]">{mentor.expertise}</p>
                  {mentor.company && (
                    <p className="text-xs text-[var(--text-secondary)] mt-1">{mentor.company}</p>
                  )}
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--text-secondary)]">Experience:</span>
                    <span className="font-medium">{mentor.experience}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--text-secondary)]">Rating:</span>
                    <div className="flex items-center">
                      <div className="icon-star text-yellow-500 text-sm mr-1"></div>
                      <span className="font-medium">{mentor.rating || '4.8'}</span>
                    </div>
                  </div>
                  {mentor.bio && (
                    <p className="text-xs text-[var(--text-secondary)] mt-2 line-clamp-2">
                      {mentor.bio}
                    </p>
                  )}
                </div>
                
                <button 
                  onClick={() => handleConnectRequest(mentor)}
                  disabled={connecting[mentor.id]}
                  className="w-full btn btn-primary"
                >
                  {connecting[mentor.id] ? 'Connecting...' : 'Request Mentorship'}
                </button>
              </div>
            ))}
          </div>
        )}

        {showRequestModal && selectedMentor && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4">Request Mentorship</h3>
              <p className="text-sm text-[var(--text-secondary)] mb-4">
                Send a message to {selectedMentor.name}
              </p>
              <textarea
                value={requestMessage}
                onChange={(e) => setRequestMessage(e.target.value)}
                placeholder="Hi! I'm interested in learning about..."
                className="input-field h-24 mb-4"
                maxLength={500}
              />
              <div className="flex space-x-2">
                <button 
                  onClick={sendMentorRequest}
                  className="flex-1 btn btn-primary"
                  disabled={!requestMessage.trim()}
                >
                  Send Request
                </button>
                <button 
                  onClick={() => {
                    setShowRequestModal(false);
                    setSelectedMentor(null);
                    setRequestMessage('');
                  }}
                  className="flex-1 btn btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  } catch (error) {
    console.error('Mentors component error:', error);
    return null;
  }
}