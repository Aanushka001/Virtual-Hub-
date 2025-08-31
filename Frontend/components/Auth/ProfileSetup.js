// components/Auth/ProfileSetup.js
function ProfileSetup({ user, onProfileComplete }) {
  const [step, setStep] = React.useState(1);
  const [profileData, setProfileData] = React.useState({
    interests: [],
    skills: [],
    bio: '',
    goals: '',
    yearOfStudy: '',
    major: ''
  });
  const [customInterest, setCustomInterest] = React.useState('');
  const [customSkill, setCustomSkill] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const predefinedInterests = [
    'Web Development', 'Mobile Development', 'Data Science', 'AI/Machine Learning',
    'Cybersecurity', 'Cloud Computing', 'UI/UX Design', 'Game Development',
    'DevOps', 'Blockchain', 'IoT', 'Robotics', 'Digital Marketing', 'Product Management'
  ];

  const predefinedSkills = [
    'JavaScript', 'Python', 'Java', 'React', 'Node.js', 'SQL',
    'Git', 'AWS', 'Docker', 'MongoDB', 'TypeScript', 'Vue.js',
    'Angular', 'Flutter', 'Kotlin', 'Swift', 'C++', 'PHP'
  ];

  const toggleSelection = (item, type) => {
    setProfileData(prev => ({
      ...prev,
      [type]: prev[type].includes(item) 
        ? prev[type].filter(i => i !== item)
        : [...prev[type], item]
    }));
  };

  const addCustomItem = (type, customValue, setCustomValue) => {
    const trimmedValue = customValue.trim();
    if (trimmedValue && !profileData[type].includes(trimmedValue)) {
      setProfileData(prev => ({
        ...prev,
        [type]: [...prev[type], trimmedValue]
      }));
      setCustomValue('');
    }
  };

  const completeProfileSetup = async () => {
    try {
      setLoading(true);
      
      const updatedProfile = {
        ...profileData,
        profileComplete: true,
        profileCompletedAt: new Date().toISOString(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      };

      await window.firestore.collection('users').doc(user.uid).update(updatedProfile);
      
      // Award points for completing profile
      await window.firestore.collection('users').doc(user.uid).update({
        points: firebase.firestore.FieldValue.increment(50),
        badges: firebase.firestore.FieldValue.arrayUnion('Profile Complete')
      });
      
      // Create welcome notification
      if (window.notificationUtils) {
        await window.notificationUtils.createNotification(
          user.uid,
          'Welcome to Virtual Campus!',
          `Profile setup complete! You earned 50 points. Start exploring study groups and mentors.`,
          'success'
        );
      }

      onProfileComplete();
    } catch (error) {
      console.error('Error completing profile setup:', error);
    } finally {
      setLoading(false);
    }
  };

  const skipStep = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      completeProfileSetup();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{background: 'var(--base-bg)'}}>
      <div className="max-w-2xl w-full mx-4">
        <div className="card">
          <div className="text-center mb-6">
            <div className="w-16 h-16 campus-building mx-auto mb-4 flex items-center justify-center">
              <i className="icon-settings text-white text-2xl"></i>
            </div>
            <h2 className="text-2xl font-bold mb-2" style={{color: 'var(--primary-text)'}}>
              Complete Your Campus Profile
            </h2>
            <p style={{color: 'var(--secondary-text)'}}>
              Help us personalize your Virtual Campus experience
            </p>
          </div>

          {/* Progress indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              {[1, 2, 3].map(stepNum => (
                <div key={stepNum} className="flex items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                    step >= stepNum ? 'glow-blue text-white' : 'border-2'
                  }`} style={{
                    background: step >= stepNum ? 'var(--accent-blue)' : 'transparent',
                    borderColor: step >= stepNum ? 'var(--accent-blue)' : 'var(--border-color)',
                    color: step >= stepNum ? 'var(--primary-text)' : 'var(--secondary-text)'
                  }}>
                    {step > stepNum ? <i className="icon-check"></i> : stepNum}
                  </div>
                  {stepNum < 3 && (
                    <div className={`flex-1 h-1 mx-4 rounded transition-all ${
                      step > stepNum ? 'progress-bar' : ''
                    }`} style={{
                      background: step > stepNum ? 'var(--accent-blue)' : 'var(--border-color)'
                    }}></div>
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between text-xs" style={{color: 'var(--secondary-text)'}}>
              <span>Interests</span>
              <span>Skills</span>
              <span>About You</span>
            </div>
          </div>

          {/* Step 1: Interests */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-xl font-semibold mb-2" style={{color: 'var(--primary-text)'}}>
                  What sparks your curiosity?
                </h3>
                <p style={{color: 'var(--secondary-text)'}}>
                  Select areas you're passionate about learning
                </p>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {predefinedInterests.map(interest => (
                  <button
                    key={interest}
                    type="button"
                    onClick={() => toggleSelection(interest, 'interests')}
                    className={`p-4 rounded-lg border text-sm font-medium transition-all hover-lift ${
                      profileData.interests.includes(interest)
                        ? 'glow-blue text-white border-blue-500'
                        : 'hover:border-blue-500'
                    }`}
                    style={{
                      background: profileData.interests.includes(interest) ? 'var(--accent-blue)' : 'var(--card-bg)',
                      borderColor: profileData.interests.includes(interest) ? 'var(--accent-blue)' : 'var(--border-color)',
                      color: profileData.interests.includes(interest) ? 'var(--primary-text)' : 'var(--primary-text)'
                    }}
                  >
                    <i className={`icon-${interest.includes('Development') ? 'code' : 
                                      interest.includes('Design') ? 'palette' :
                                      interest.includes('Data') ? 'bar-chart' : 'star'} mr-2`}></i>
                    {interest}
                  </button>
                ))}
              </div>

              <div className="flex space-x-2">
                <input
                  type="text"
                  value={customInterest}
                  onChange={(e) => setCustomInterest(e.target.value)}
                  placeholder="Add your own interest..."
                  className="flex-1 input-field"
                  onKeyPress={(e) => e.key === 'Enter' && addCustomItem('interests', customInterest, setCustomInterest)}
                />
                <button
                  type="button"
                  onClick={() => addCustomItem('interests', customInterest, setCustomInterest)}
                  className="btn btn-secondary"
                  disabled={!customInterest.trim()}
                >
                  <i className="icon-plus"></i>
                </button>
              </div>

              {profileData.interests.length > 0 && (
                <div className="p-4 rounded-lg border" style={{background: 'rgba(59, 130, 246, 0.1)', borderColor: 'var(--accent-blue)'}}>
                  <p className="text-sm font-medium mb-2" style={{color: 'var(--accent-blue)'}}>
                    Selected Interests ({profileData.interests.length})
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {profileData.interests.map(interest => (
                      <span key={interest} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                        {interest}
                        <button
                          type="button"
                          onClick={() => toggleSelection(interest, 'interests')}
                          className="ml-2 hover:text-blue-900"
                        >
                          <i className="icon-x text-xs"></i>
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={skipStep}
                  className="btn btn-secondary"
                >
                  Skip for Now
                </button>
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="btn btn-primary"
                  disabled={profileData.interests.length === 0}
                >
                  Next: Skills
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Skills */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-xl font-semibold mb-2" style={{color: 'var(--primary-text)'}}>
                  What are your superpowers?
                </h3>
                <p style={{color: 'var(--secondary-text)'}}>
                  Select your technical and professional skills
                </p>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {predefinedSkills.map(skill => (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => toggleSelection(skill, 'skills')}
                    className={`p-4 rounded-lg border text-sm font-medium transition-all hover-lift ${
                      profileData.skills.includes(skill)
                        ? 'glow-purple text-white border-purple-500'
                        : 'hover:border-purple-500'
                    }`}
                    style={{
                      background: profileData.skills.includes(skill) ? 'var(--accent-purple)' : 'var(--card-bg)',
                      borderColor: profileData.skills.includes(skill) ? 'var(--accent-purple)' : 'var(--border-color)',
                      color: 'var(--primary-text)'
                    }}
                  >
                    <i className={`icon-${skill.includes('Script') || skill.includes('Java') ? 'code' :
                                      skill.includes('AWS') || skill.includes('Docker') ? 'server' :
                                      skill.includes('Git') ? 'git-branch' : 'tool'} mr-2`}></i>
                    {skill}
                  </button>
                ))}
              </div>

              <div className="flex space-x-2">
                <input
                  type="text"
                  value={customSkill}
                  onChange={(e) => setCustomSkill(e.target.value)}
                  placeholder="Add your own skill..."
                  className="flex-1 input-field"
                  onKeyPress={(e) => e.key === 'Enter' && addCustomItem('skills', customSkill, setCustomSkill)}
                />
                <button
                  type="button"
                  onClick={() => addCustomItem('skills', customSkill, setCustomSkill)}
                  className="btn btn-secondary"
                  disabled={!customSkill.trim()}
                >
                  <i className="icon-plus"></i>
                </button>
              </div>

              {profileData.skills.length > 0 && (
                <div className="p-4 rounded-lg border" style={{background: 'rgba(139, 92, 246, 0.1)', borderColor: 'var(--accent-purple)'}}>
                  <p className="text-sm font-medium mb-2" style={{color: 'var(--accent-purple)'}}>
                    Selected Skills ({profileData.skills.length})
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {profileData.skills.map(skill => (
                      <span key={skill} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                        {skill}
                        <button
                          type="button"
                          onClick={() => toggleSelection(skill, 'skills')}
                          className="ml-2 hover:text-purple-900"
                        >
                          <i className="icon-x text-xs"></i>
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="btn btn-secondary"
                >
                  <i className="icon-arrow-left mr-2"></i>Back
                </button>
                <div className="space-x-2">
                  <button
                    type="button"
                    onClick={skipStep}
                    className="btn btn-secondary"
                  >
                    Skip
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="btn btn-primary"
                  >
                    Next: About You
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Personal Information */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-xl font-semibold mb-2" style={{color: 'var(--primary-text)'}}>
                  Tell your campus story
                </h3>
                <p style={{color: 'var(--secondary-text)'}}>
                  Help others connect with you
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{color: 'var(--primary-text)'}}>
                    <i className="icon-book-open mr-1"></i>Year of Study
                  </label>
                  <select
                    value={profileData.yearOfStudy}
                    onChange={(e) => setProfileData(prev => ({ ...prev, yearOfStudy: e.target.value }))}
                    className="input-field"
                  >
                    <option value="">Select Year</option>
                    <option value="1st Year">1st Year</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year</option>
                    <option value="4th Year">4th Year</option>
                    <option value="Graduate">Graduate Student</option>
                    <option value="Professional">Working Professional</option>
                    <option value="Self-learner">Self-learner</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{color: 'var(--primary-text)'}}>
                    <i className="icon-award mr-1"></i>Major/Field
                  </label>
                  <input
                    type="text"
                    value={profileData.major}
                    onChange={(e) => setProfileData(prev => ({ ...prev, major: e.target.value }))}
                    placeholder="e.g. Computer Science"
                    className="input-field"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{color: 'var(--primary-text)'}}>
                  <i className="icon-user mr-1"></i>Bio
                </label>
                <textarea
                  value={profileData.bio}
                  onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                  placeholder="Tell others about yourself, your background, current projects, or what you're passionate about..."
                  className="input-field h-24"
                  maxLength={300}
                />
                <p className="text-xs mt-1 text-right" style={{color: 'var(--secondary-text)'}}>
                  {profileData.bio.length}/300 characters
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{color: 'var(--primary-text)'}}>
                  <i className="icon-target mr-1"></i>Campus Goals
                </label>
                <textarea
                  value={profileData.goals}
                  onChange={(e) => setProfileData(prev => ({ ...prev, goals: e.target.value }))}
                  placeholder="What do you hope to achieve on Virtual Campus? Learning goals, networking objectives, projects you want to work on..."
                  className="input-field h-20"
                  maxLength={200}
                />
                <p className="text-xs mt-1 text-right" style={{color: 'var(--secondary-text)'}}>
                  {profileData.goals.length}/200 characters
                </p>
              </div>

              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="btn btn-secondary"
                >
                  <i className="icon-arrow-left mr-2"></i>Back
                </button>
                <div className="space-x-2">
                  <button
                    type="button"
                    onClick={skipStep}
                    className="btn btn-secondary"
                  >
                    Skip Setup
                  </button>
                  <button
                    type="button"
                    onClick={completeProfileSetup}
                    disabled={loading}
                    className="btn btn-success hover-lift"
                  >
                    <i className="icon-check mr-2"></i>
                    {loading ? 'Saving Profile...' : 'Enter Campus'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Profile Summary */}
          <div className="mt-8 pt-6 border-t" style={{borderColor: 'var(--border-color)'}}>
            <div className="text-center">
              <p className="text-xs" style={{color: 'var(--secondary-text)'}}>
                Step {step} of 3 • Profile setup helps us create better matches and recommendations
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}