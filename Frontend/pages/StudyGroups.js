function StudyGroups({ user, userProfile, setCurrentRoute }) {
  try {
    const [groups, setGroups] = React.useState([]);
    const [showCreateForm, setShowCreateForm] = React.useState(false);
    const [loading, setLoading] = React.useState(true);
    const [joining, setJoining] = React.useState({});
    const [selectedGroup, setSelectedGroup] = React.useState(null);
    const [groupMembers, setGroupMembers] = React.useState({});
    const [showChat, setShowChat] = React.useState(false);
    const [activeChatGroup, setActiveChatGroup] = React.useState(null);
    const [messages, setMessages] = React.useState([]);
    const [newMessage, setNewMessage] = React.useState('');
    const [filters, setFilters] = React.useState({
      subject: 'All Subjects',
      level: 'All Levels'
    });
    const [newGroup, setNewGroup] = React.useState({
      name: '',
      subject: '',
      level: 'Beginner',
      description: '',
      maxMembers: 5
    });

    React.useEffect(() => {
      fetchGroups();
    }, [user]);

    const fetchGroups = async () => {
      try {
        setLoading(true);
        const groupData = await window.apiUtils.getStudyGroups();
        setGroups(groupData || []);
        
        for (const group of groupData || []) {
          if (group.members && group.members.length > 0) {
            await fetchGroupMembers(group.id, group.members);
          }
        }
      } catch (error) {
        console.error('Error fetching groups:', error);
        setGroups([]);
      } finally {
        setLoading(false);
      }
    };

    const fetchGroupMembers = async (groupId, memberIds) => {
      try {
        const memberDetails = [];
        for (const memberId of memberIds) {
          const memberProfile = await window.authUtils.getUserProfile(memberId);
          if (memberProfile) {
            memberDetails.push({
              uid: memberId,
              displayName: memberProfile.displayName || 'Unknown User',
              role: memberProfile.role || 'student',
              interests: memberProfile.interests || [],
              skills: memberProfile.skills || [],
              isOnline: Math.random() > 0.5,
              points: memberProfile.points || Math.floor(Math.random() * 1000)
            });
          }
        }
        setGroupMembers(prev => ({ ...prev, [groupId]: memberDetails }));
      } catch (error) {
        console.error('Error fetching group members:', error);
      }
    };

    const handleCreateGroup = async (e) => {
      e.preventDefault();
      try {
        await window.dataUtils.createStudyGroup(newGroup, user.uid);
        setShowCreateForm(false);
        setNewGroup({
          name: '',
          subject: '',
          level: 'Beginner',
          description: '',
          maxMembers: 5
        });
        await fetchGroups();
        
        await window.notificationUtils.addNotification({
          type: 'group',
          title: 'Study Room Created!',
          message: `You created "${newGroup.name}" study room`,
          time: 'Just now'
        });
      } catch (error) {
        console.error('Error creating group:', error);
      }
    };

    const handleJoinGroup = async (groupId, groupName) => {
      try {
        setJoining(prev => ({ ...prev, [groupId]: true }));
        await window.dataUtils.joinStudyGroup(groupId, user.uid, userProfile?.displayName || user.displayName);
        await fetchGroups();
        
        await window.notificationUtils.addNotification({
          type: 'group',
          title: 'Joined Study Room!',
          message: `You joined "${groupName}"`,
          time: 'Just now'
        });
      } catch (error) {
        console.error('Error joining group:', error);
      } finally {
        setJoining(prev => ({ ...prev, [groupId]: false }));
      }
    };

    const handleViewGroupDetails = (group) => {
      setSelectedGroup(group);
    };

    const handleEnterRoom = (group) => {
      setActiveChatGroup(group);
      setShowChat(true);
      loadChatMessages(group.id);
    };

    const loadChatMessages = async (groupId) => {
      try {
        const chatMessages = [
          {
            id: 'msg1',
            userId: 'user1',
            userName: 'Alex Thompson',
            message: 'Hey everyone! Ready for today\'s React session?',
            timestamp: new Date(Date.now() - 300000).toISOString(),
            type: 'text'
          },
          {
            id: 'msg2',
            userId: 'user2',
            userName: 'Sarah Chen',
            message: 'Yes! I\'ve prepared some questions about hooks',
            timestamp: new Date(Date.now() - 240000).toISOString(),
            type: 'text'
          },
          {
            id: 'msg3',
            userId: user.uid,
            userName: userProfile?.displayName || user.displayName,
            message: 'Great! I brought my latest project to share',
            timestamp: new Date(Date.now() - 120000).toISOString(),
            type: 'text'
          }
        ];
        setMessages(chatMessages);
      } catch (error) {
        console.error('Error loading chat messages:', error);
        setMessages([]);
      }
    };

    const handleSendMessage = async (e) => {
      e.preventDefault();
      if (!newMessage.trim()) return;

      const messageData = {
        id: `msg_${Date.now()}`,
        userId: user.uid,
        userName: userProfile?.displayName || user.displayName,
        message: newMessage,
        timestamp: new Date().toISOString(),
        type: 'text'
      };

      setMessages(prev => [...prev, messageData]);
      setNewMessage('');

      try {
        await window.firestore.collection('messages').add({
          ...messageData,
          groupId: activeChatGroup.id,
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
      } catch (error) {
        console.error('Error sending message:', error);
      }
    };

    const formatTime = (timestamp) => {
      const date = new Date(timestamp);
      const now = new Date();
      const diffMinutes = Math.floor((now - date) / 60000);
      
      if (diffMinutes < 1) return 'Just now';
      if (diffMinutes < 60) return `${diffMinutes}m ago`;
      if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h ago`;
      return date.toLocaleDateString();
    };

    const isUserInGroup = (group) => {
      return group.members && group.members.includes(user?.uid);
    };

    const getStatusColor = (isOnline) => {
      return isOnline ? 'bg-green-500' : 'bg-gray-500';
    };

    const filteredGroups = groups.filter(group => {
      if (filters.subject !== 'All Subjects' && group.subject !== filters.subject) return false;
      if (filters.level !== 'All Levels' && group.level !== filters.level) return false;
      return true;
    });

    if (loading) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-t-transparent rounded-full" style={{borderColor: 'var(--accent-blue)'}}></div>
        </div>
      );
    }

    if (showChat && activeChatGroup) {
      return (
        <div className="h-full flex flex-col" data-name="study-room-chat">
          <div className="flex items-center justify-between p-4 border-b" style={{background: 'var(--card-bg)', borderColor: 'var(--border-color)'}}>
            <div className="flex items-center space-x-3">
              <button 
                onClick={() => {
                  setShowChat(false);
                  setActiveChatGroup(null);
                }}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <i className="icon-arrow-left text-xl" style={{color: 'var(--secondary-text)'}}></i>
              </button>
              <div>
                <h3 className="font-semibold" style={{color: 'var(--primary-text)'}}>{activeChatGroup.name}</h3>
                <p className="text-sm" style={{color: 'var(--secondary-text)'}}>{activeChatGroup.subject} • {groupMembers[activeChatGroup.id]?.length || 0} members</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => handleViewGroupDetails(activeChatGroup)}
                className="btn btn-secondary"
              >
                <i className="icon-users text-sm mr-2"></i>
                Members
              </button>
              <button className="btn btn-secondary">
                <i className="icon-video text-sm mr-2"></i>
                Video Call
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{background: 'var(--base-bg)'}}>
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.userId === user.uid ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.userId === user.uid 
                    ? 'text-white glow-blue' 
                    : 'border'
                }`} style={{
                  background: message.userId === user.uid ? 'var(--accent-blue)' : 'var(--card-bg)',
                  color: message.userId === user.uid ? 'var(--primary-text)' : 'var(--primary-text)',
                  borderColor: message.userId === user.uid ? 'none' : 'var(--border-color)'
                }}>
                  {message.userId !== user.uid && (
                    <p className="text-xs font-medium mb-1 opacity-70">{message.userName}</p>
                  )}
                  <p className="text-sm">{message.message}</p>
                  <p className={`text-xs mt-1 ${message.userId === user.uid ? 'opacity-70' : 'opacity-60'}`}>
                    {formatTime(message.timestamp)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={handleSendMessage} className="p-4 border-t" style={{background: 'var(--card-bg)', borderColor: 'var(--border-color)'}}>
            <div className="flex space-x-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 input-field"
              />
              <button type="submit" className="btn btn-primary">
                <i className="icon-send text-lg"></i>
              </button>
            </div>
          </form>
        </div>
      );
    }

    return (
      <div className="space-y-6" data-name="study-groups" data-file="pages/StudyGroups.js">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => window.router.navigate('/campus-hub')}
              className="btn btn-secondary hover-lift"
            >
              <i className="icon-arrow-left text-lg mr-2"></i>
              Back to Hub
            </button>
            <div>
              <h2 className="text-2xl font-bold mb-2" style={{color: 'var(--primary-text)'}}>Study Rooms</h2>
              <p style={{color: 'var(--secondary-text)'}}>Join collaborative learning spaces and connect with peers</p>
            </div>
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="btn btn-primary glow-blue hover-lift"
          >
            <i className="icon-plus text-lg mr-2"></i>
            Create Study Room
          </button>
        </div>

        <div className="flex flex-wrap gap-4 mb-6">
          <select 
            value={filters.subject}
            onChange={(e) => setFilters(prev => ({ ...prev, subject: e.target.value }))}
            className="input-field w-auto"
          >
            <option>All Subjects</option>
            <option>Web Development</option>
            <option>Data Science</option>
            <option>Mobile Development</option>
            <option>UI/UX Design</option>
            <option>Computer Science</option>
            <option>Design</option>
          </select>
          <select 
            value={filters.level}
            onChange={(e) => setFilters(prev => ({ ...prev, level: e.target.value }))}
            className="input-field w-auto"
          >
            <option>All Levels</option>
            <option>Beginner</option>
            <option>Intermediate</option>
            <option>Advanced</option>
          </select>
        </div>

        {showCreateForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="p-6 rounded-xl w-full max-w-md" style={{background: 'var(--card-bg)'}}>
              <h3 className="text-xl font-bold mb-6" style={{color: 'var(--primary-text)'}}>Create New Study Room</h3>
              <form onSubmit={handleCreateGroup} className="space-y-4">
                <input
                  type="text"
                  placeholder="Room Name"
                  value={newGroup.name}
                  onChange={(e) => setNewGroup(prev => ({ ...prev, name: e.target.value }))}
                  className="input-field"
                  required
                />
                <input
                  type="text"
                  placeholder="Subject"
                  value={newGroup.subject}
                  onChange={(e) => setNewGroup(prev => ({ ...prev, subject: e.target.value }))}
                  className="input-field"
                  required
                />
                <select
                  value={newGroup.level}
                  onChange={(e) => setNewGroup(prev => ({ ...prev, level: e.target.value }))}
                  className="input-field"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
                <textarea
                  placeholder="Room Description"
                  value={newGroup.description}
                  onChange={(e) => setNewGroup(prev => ({ ...prev, description: e.target.value }))}
                  className="input-field h-20"
                />
                <select
                  value={newGroup.maxMembers}
                  onChange={(e) => setNewGroup(prev => ({ ...prev, maxMembers: parseInt(e.target.value) }))}
                  className="input-field"
                >
                  <option value={3}>3 Members</option>
                  <option value={5}>5 Members</option>
                  <option value={8}>8 Members</option>
                  <option value={10}>10 Members</option>
                </select>
                <div className="flex space-x-3">
                  <button type="submit" className="flex-1 btn btn-primary">Create Room</button>
                  <button 
                    type="button" 
                    onClick={() => setShowCreateForm(false)}
                    className="flex-1 btn btn-secondary"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {selectedGroup && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="p-6 rounded-xl w-full max-w-2xl max-h-96 overflow-y-auto" style={{background: 'var(--card-bg)'}}>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold" style={{color: 'var(--primary-text)'}}>{selectedGroup.name} - Members</h3>
                <button 
                  onClick={() => setSelectedGroup(null)}
                  className="p-2 hover:bg-gray-700 rounded-lg" style={{color: 'var(--secondary-text)'}}
                >
                  <i className="icon-x text-xl"></i>
                </button>
              </div>
              
              <div className="space-y-3">
                {groupMembers[selectedGroup.id]?.map((member) => (
                  <div key={member.uid} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-700 transition-colors" style={{borderColor: 'var(--border-color)'}}>
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-medium text-lg" style={{background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-purple))'}}>
                          {member.displayName.charAt(0)}
                        </div>
                        <div className={`absolute -bottom-1 -right-1 w-4 h-4 ${getStatusColor(member.isOnline)} border-2 rounded-full`} style={{borderColor: 'var(--card-bg)'}}></div>
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold" style={{color: 'var(--primary-text)'}}>{member.displayName}</p>
                        <p className="text-sm" style={{color: 'var(--secondary-text)'}}>
                          {member.isOnline ? 'Online now' : 'Offline'} • {member.points} points
                        </p>
                        {member.interests.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {member.interests.slice(0, 3).map((interest, idx) => (
                              <span key={idx} className="text-xs px-2 py-1 rounded-full" style={{background: 'rgba(59, 130, 246, 0.2)', color: 'var(--accent-blue)'}}>
                                {interest}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                        member.role === 'mentor' ? 'text-green-400' :
                        member.role === 'admin' ? 'text-purple-400' :
                        'text-gray-400'
                      }`} style={{
                        background: member.role === 'mentor' ? 'rgba(16, 185, 129, 0.2)' :
                                   member.role === 'admin' ? 'rgba(139, 92, 246, 0.2)' :
                                   'rgba(107, 114, 128, 0.2)'
                      }}>
                        {member.role}
                      </span>
                      {member.uid !== user.uid && (
                        <button 
                          onClick={() => {
                            // Example future action: send a direct message or invite
                            handleEnterRoom(selectedGroup);
                          }}
                          className="ml-3 btn btn-secondary text-sm"
                        >
                          Message
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGroups.map((group) => (
            <div 
              key={group.id} 
              className="p-6 rounded-xl border hover-lift transition cursor-pointer" 
              style={{background: 'var(--card-bg)', borderColor: 'var(--border-color)'}}
            >
              <h3 className="text-lg font-semibold mb-2" style={{color: 'var(--primary-text)'}}>{group.name}</h3>
              <p className="text-sm mb-3" style={{color: 'var(--secondary-text)'}}>{group.description}</p>
              <p className="text-xs mb-2" style={{color: 'var(--secondary-text)'}}>
                {group.subject} • {group.level}
              </p>
              <p className="text-xs mb-4" style={{color: 'var(--secondary-text)'}}>
                {group.members?.length || 0}/{group.maxMembers} members
              </p>
              <div className="flex space-x-2">
                {isUserInGroup(group) ? (
                  <button 
                    onClick={() => handleEnterRoom(group)} 
                    className="flex-1 btn btn-primary"
                  >
                    Enter Room
                  </button>
                ) : (
                  <button 
                    onClick={() => handleJoinGroup(group.id, group.name)} 
                    className="flex-1 btn btn-secondary"
                    disabled={joining[group.id]}
                  >
                    {joining[group.id] ? 'Joining...' : 'Join Room'}
                  </button>
                )}
                <button 
                  onClick={() => handleViewGroupDetails(group)} 
                  className="btn btn-secondary"
                >
                  Members
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  } catch (err) {
    console.error('StudyGroups error:', err);
    return <div className="p-6 text-red-500">Something went wrong loading Study Groups.</div>;
  }
}
