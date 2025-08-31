// components/Auth/LoginForm.js
function LoginForm({ onSwitchToSignup }) {
  const [formData, setFormData] = React.useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [demoUsed, setDemoUsed] = React.useState(false);

  React.useEffect(() => {
    try {
      const used = localStorage.getItem('demoUsed') === 'true';
      setDemoUsed(used);
    } catch (error) {
      console.error('Error checking demo usage:', error);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Input validation
      if (!formData.email || !formData.password) {
        throw new Error('Please fill in all fields');
      }

      if (!window.authUtils.validateEmail(formData.email)) {
        throw new Error('Please enter a valid email address');
      }

      await window.authUtils.signIn(formData.email, formData.password);
      
      // Success feedback
      setTimeout(() => {
        if (window.notificationUtils) {
          window.notificationUtils.addNotification({
            type: 'success',
            title: 'Welcome Back!',
            message: 'Successfully signed in to Virtual Campus',
            time: 'Just now'
          });
        }
      }, 500);

    } catch (error) {
      console.error('Login error:', error);
      setError(error.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    if (demoUsed) {
      setError('Demo session already used. Please create an account to continue exploring.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await window.authUtils.demoSignIn();
      localStorage.setItem('demoUsed', 'true');
      setDemoUsed(true);
      
      // Demo welcome message
      setTimeout(() => {
        if (window.notificationUtils) {
          window.notificationUtils.addNotification({
            type: 'info',
            title: 'Demo Mode Active',
            message: 'Explore all campus features with sample data',
            time: 'Just now'
          });
        }
      }, 1000);

    } catch (error) {
      console.error('Demo login error:', error);
      setError('Demo mode unavailable. Please try regular sign in.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleQuickFill = () => {
    setFormData({
      email: 'student@campus.edu',
      password: 'demo123'
    });
  };

  return (
    <div className="card animate-fade-in-up" data-name="login-form" data-file="components/Auth/LoginForm.js">
      <div className="text-center mb-6">
        <div className="w-16 h-16 campus-building mx-auto mb-4 flex items-center justify-center">
          <i className="icon-log-in text-white text-2xl"></i>
        </div>
        <h2 className="text-2xl font-bold mb-2" style={{color: 'var(--primary-text)'}}>
          Welcome Back
        </h2>
        <p style={{color: 'var(--secondary-text)'}}>
          Enter your campus credentials to continue
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

      {!demoUsed && (
        <div className="mb-6">
          <button
            onClick={handleDemoLogin}
            disabled={loading}
            className="w-full btn bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 mb-4 hover-lift"
          >
            <i className="icon-play-circle mr-2"></i>
            {loading ? 'Loading Demo...' : 'Explore Campus Demo'}
          </button>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t" style={{borderColor: 'var(--border-color)'}}></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4" style={{background: 'var(--card-bg)', color: 'var(--secondary-text)'}}>
                or sign in with your account
              </span>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2" style={{color: 'var(--primary-text)'}}>
            <i className="icon-mail mr-2"></i>Campus Email
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="input-field"
            placeholder="your.email@campus.edu"
            required
            disabled={loading}
            autoComplete="email"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2" style={{color: 'var(--primary-text)'}}>
            <i className="icon-lock mr-2"></i>Password
          </label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="input-field"
            placeholder="Enter your password"
            required
            disabled={loading}
            autoComplete="current-password"
          />
        </div>

        <div className="flex items-center justify-between text-sm">
          <button
            type="button"
            onClick={handleQuickFill}
            className="text-blue-400 hover:text-blue-300 transition-colors"
            disabled={loading}
          >
            Quick Fill (Test)
          </button>
          <button
            type="button"
            className="text-blue-400 hover:text-blue-300 transition-colors"
            disabled={loading}
          >
            Forgot Password?
          </button>
        </div>

        <button
          type="submit"
          disabled={loading || !formData.email || !formData.password}
          className="w-full btn btn-primary hover-lift"
        >
          <i className="icon-log-in mr-2"></i>
          {loading ? 'Entering Campus...' : 'Enter Campus'}
        </button>
      </form>

      <div className="mt-6 text-center">
        <div className="mb-4">
          <div className="flex items-center justify-center space-x-4 text-xs" style={{color: 'var(--secondary-text)'}}>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              Secure Login
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
              Fast Access
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
              Campus Network
            </div>
          </div>
        </div>
        
        <p style={{color: 'var(--secondary-text)'}}>
          New to campus?{' '}
          <button
            onClick={onSwitchToSignup}
            className="font-medium hover:underline transition-colors"
            style={{color: 'var(--accent-blue)'}}
            disabled={loading}
          >
            Join Virtual Campus
          </button>
        </p>
      </div>
    </div>
  );
}