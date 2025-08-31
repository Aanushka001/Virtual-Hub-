// components/Auth/SignupForm.js
function SignupForm({ onSwitchToLogin }) {
  const [formData, setFormData] = React.useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    userType: 'student',
    agreeToTerms: false
  });
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [passwordStrength, setPasswordStrength] = React.useState(0);
  const [showPassword, setShowPassword] = React.useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Comprehensive validation
      if (!formData.firstName.trim() || !formData.lastName.trim()) {
        throw new Error('Please enter your full name');
      }

      if (!window.authUtils.validateEmail(formData.email)) {
        throw new Error('Please enter a valid email address');
      }

      if (formData.password.length < 6) {
        throw new Error('Password must be at least 6 characters long');
      }

      if (formData.password !== formData.confirmPassword) {
        throw new Error('Passwords do not match');
      }

      if (!formData.agreeToTerms) {
        throw new Error('Please agree to the terms and conditions');
      }

      const userData = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        displayName: `${formData.firstName.trim()} ${formData.lastName.trim()}`,
        role: formData.userType,
        interests: [],
        skills: [],
        bio: '',
        goals: '',
        yearOfStudy: '',
        major: '',
        points: 0,
        level: 1,
        badges: ['New Member'],
        notifications: [],
        recentActivity: [],
        profileComplete: false,
        isDemo: false,
        accountCreated: new Date().toISOString()
      };

      await window.authUtils.signUp(formData.email, formData.password, userData);
      
      // Success feedback
      setTimeout(() => {
        if (window.notificationUtils) {
          window.notificationUtils.addNotification({
            type: 'success',
            title: 'Account Created!',
            message: 'Welcome to Virtual Campus. Let\'s complete your profile.',
            time: 'Just now'
          });
        }
      }, 500);

    } catch (error) {
      console.error('Signup error:', error);
      setError(error.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user starts typing
    if (error) setError('');

    // Password strength calculation
    if (name === 'password') {
      calculatePasswordStrength(value);
    }
  };

  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 6) strength += 25;
    if (password.length >= 8) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password) || /[^A-Za-z0-9]/.test(password)) strength += 25;
    setPasswordStrength(strength);
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength < 25) return '#EF4444';
    if (passwordStrength < 50) return '#F59E0B';
    if (passwordStrength < 75) return '#3B82F6';
    return '#10B981';
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength < 25) return 'Weak';
    if (passwordStrength < 50) return 'Fair';
    if (passwordStrength < 75) return 'Good';
    return 'Strong';
  };

  return (
    <div className="card animate-fade-in-up" data-name="signup-form" data-file="components/Auth/SignupForm.js">
      <div className="text-center mb-6">
        <div className="w-16 h-16 campus-building mx-auto mb-4 flex items-center justify-center">
          <i className="icon-user-plus text-white text-2xl"></i>
        </div>
        <h2 className="text-2xl font-bold mb-2" style={{color: 'var(--primary-text)'}}>
          Join Virtual Campus
        </h2>
        <p style={{color: 'var(--secondary-text)'}}>
          Create your account and start your learning journey
        </p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-900 border border-red-700 rounded-lg text-red-300 text-sm animate-fade-in-up">
          <div className="flex items-center">
            <i className="icon-alert-circle mr-2"></i>
            {error}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2" style={{color: 'var(--primary-text)'}}>
              <i className="icon-user mr-1"></i>First Name
            </label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              className="input-field"
              placeholder="John"
              required
              disabled={loading}
              autoComplete="given-name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2" style={{color: 'var(--primary-text)'}}>
              Last Name
            </label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              className="input-field"
              placeholder="Doe"
              required
              disabled={loading}
              autoComplete="family-name"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2" style={{color: 'var(--primary-text)'}}>
            <i className="icon-mail mr-1"></i>Campus Email
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="input-field"
            placeholder="john.doe@campus.edu"
            required
            disabled={loading}
            autoComplete="email"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2" style={{color: 'var(--primary-text)'}}>
            <i className="icon-graduation-cap mr-1"></i>I am a
          </label>
          <select
            name="userType"
            value={formData.userType}
            onChange={handleChange}
            className="input-field"
            disabled={loading}
          >
            <option value="student">Student</option>
            <option value="mentor">Mentor</option>
            <option value="faculty">Faculty</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2" style={{color: 'var(--primary-text)'}}>
            <i className="icon-lock mr-1"></i>Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="input-field pr-12"
              placeholder="Minimum 6 characters"
              required
              disabled={loading}
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
              disabled={loading}
            >
              <i className={`icon-${showPassword ? 'eye-off' : 'eye'}`}></i>
            </button>
          </div>
          
          {formData.password && (
            <div className="mt-2">
              <div className="flex items-center justify-between text-xs mb-1">
                <span style={{color: 'var(--secondary-text)'}}>Password Strength</span>
                <span style={{color: getPasswordStrengthColor()}}>{getPasswordStrengthText()}</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className="h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${passwordStrength}%`,
                    backgroundColor: getPasswordStrengthColor()
                  }}
                ></div>
              </div>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2" style={{color: 'var(--primary-text)'}}>
            Confirm Password
          </label>
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            className="input-field"
            placeholder="Confirm your password"
            required
            disabled={loading}
            autoComplete="new-password"
          />
          {formData.confirmPassword && formData.password !== formData.confirmPassword && (
            <p className="text-red-400 text-xs mt-1">
              <i className="icon-x-circle mr-1"></i>Passwords do not match
            </p>
          )}
        </div>

        <div className="flex items-start space-x-3">
          <input
            type="checkbox"
            name="agreeToTerms"
            checked={formData.agreeToTerms}
            onChange={handleChange}
            className="mt-1"
            disabled={loading}
            required
          />
          <label className="text-sm" style={{color: 'var(--secondary-text)'}}>
            I agree to the{' '}
            <button type="button" className="text-blue-400 hover:text-blue-300 underline">
              Terms of Service
            </button>
            {' '}and{' '}
            <button type="button" className="text-blue-400 hover:text-blue-300 underline">
              Privacy Policy
            </button>
          </label>
        </div>

        <button
          type="submit"
          disabled={loading || !formData.agreeToTerms || formData.password !== formData.confirmPassword}
          className="w-full btn btn-primary hover-lift"
        >
          <i className="icon-user-plus mr-2"></i>
          {loading ? 'Creating Account...' : 'Create Campus Account'}
        </button>
      </form>

      <div className="mt-6 text-center">
        <div className="mb-4">
          <div className="flex items-center justify-center space-x-4 text-xs" style={{color: 'var(--secondary-text)'}}>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              Secure Registration
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
              Instant Access
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
              Free Campus
            </div>
          </div>
        </div>
        
        <p style={{color: 'var(--secondary-text)'}}>
          Already have an account?{' '}
          <button
            onClick={onSwitchToLogin}
            className="font-medium hover:underline transition-colors"
            style={{color: 'var(--accent-blue)'}}
            disabled={loading}
          >
            Sign In to Campus
          </button>
        </p>
      </div>
    </div>
  );
}