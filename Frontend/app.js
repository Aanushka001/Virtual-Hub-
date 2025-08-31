// app.js - Main Application Component

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center" style={{background: 'var(--base-bg)'}}>
          <div className="text-center p-8 card">
            <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="icon-alert-circle text-white text-2xl"></i>
            </div>
            <h1 className="text-2xl font-bold mb-4" style={{color: 'var(--primary-text)'}}>Campus Connection Lost</h1>
            <p className="mb-6" style={{color: 'var(--secondary-text)'}}>We're experiencing technical difficulties. Please try refreshing the page.</p>
            <button 
              onClick={() => window.location.reload()} 
              className="btn btn-primary hover-lift"
            >
              <i className="icon-refresh-cw text-sm mr-2"></i>
              Reconnect to Campus
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function App() {
  // Initialize all state variables with proper default values
  const [user, setUser] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [currentRoute, setCurrentRoute] = React.useState('/');
  const [authMode, setAuthMode] = React.useState('login');
  const [campusInitialized, setCampusInitialized] = React.useState(false);
  const [userProfile, setUserProfile] = React.useState(null);
  const [initializationProgress, setInitializationProgress] = React.useState(0);
  const [initializationError, setInitializationError] = React.useState(null);

  // Campus initialization effect
  React.useEffect(() => {
    const initializeCampus = async () => {
      try {
        console.log('Starting campus initialization...');
        setInitializationProgress(10);
        
        // Wait for Firebase to be available
        let attempts = 0;
        while (typeof firebase === 'undefined' && attempts < 50) {
          await new Promise(resolve => setTimeout(resolve, 100));
          attempts++;
        }
        
        if (typeof firebase === 'undefined') {
          throw new Error('Firebase failed to load after 5 seconds');
        }
        
        setInitializationProgress(25);
        console.log('Firebase loaded successfully');
        
        // Wait for Firebase services to be initialized
        attempts = 0;
        while ((!window.auth || !window.firestore) && attempts < 30) {
          await new Promise(resolve => setTimeout(resolve, 100));
          attempts++;
        }
        
        setInitializationProgress(50);
        
        if (!window.auth) {
          console.warn('Firebase Auth not available, continuing with limited functionality');
        }
        
        if (!window.firestore) {
          console.warn('Firestore not available, continuing with limited functionality');
        }
        
        setInitializationProgress(75);
        
        // Test Firebase connection if available
        let connected = false;
        if (window.checkFirebaseConnection) {
          try {
            connected = await window.checkFirebaseConnection();
          } catch (error) {
            console.warn('Firebase connection test failed:', error);
          }
        }
        
        setInitializationProgress(100);
        console.log('Campus initialization completed, Firebase connected:', connected);
        
        setTimeout(() => {
          setCampusInitialized(true);
        }, 300);
        
      } catch (error) {
        console.error('Error initializing campus:', error);
        setInitializationError(error.message);
        setInitializationProgress(100);
        setTimeout(() => {
          setCampusInitialized(true);
        }, 1000);
      }
    };

    initializeCampus();
  }, []);

  // Authentication state management
  React.useEffect(() => {
    if (!campusInitialized) return;
    
    let unsubscribe = () => {};
    
    try {
      // Check if Firebase Auth is available
      if (!window.auth) {
        console.warn('Firebase Auth not available, setting loading to false');
        setLoading(false);
        return;
      }

      unsubscribe = window.auth.onAuthStateChanged(async (authUser) => {
        try {
          console.log('Auth state changed:', authUser ? 'User logged in' : 'User logged out');
          setUser(authUser);
          
          if (authUser) {
            try {
              // Get user profile
              let profile = null;
              if (window.authUtils) {
                profile = await window.authUtils.getUserProfile(authUser.uid);
              }
              
              if (profile) {
                setUserProfile(profile);
                console.log('User profile loaded:', profile.displayName);
              } else {
                // Create minimal profile if none exists
                const defaultProfile = {
                  uid: authUser.uid,
                  displayName: authUser.displayName || authUser.email?.split('@')[0] || 'Student',
                  email: authUser.email,
                  role: 'student',
                  points: 0,
                  level: 1,
                  badges: [],
                  notifications: [],
                  profileComplete: true,
                  isOnline: true,
                  createdAt: new Date(),
                  updatedAt: new Date()
                };
                
                setUserProfile(defaultProfile);
                console.log('Created default profile for user');
                
                // Try to save to Firestore if available
                if (window.firestore) {
                  try {
                    await window.firestore.collection('users').doc(authUser.uid).set(defaultProfile, { merge: true });
                    console.log('Default profile saved to Firestore');
                  } catch (firestoreError) {
                    console.warn('Failed to save profile to Firestore:', firestoreError);
                  }
                }
              }
              
              // Update online status if Firestore is available
              if (window.firestore) {
                try {
                  await window.firestore.collection('users').doc(authUser.uid).set({
                    isOnline: true,
                    lastSeen: firebase.firestore.FieldValue.serverTimestamp()
                  }, { merge: true });
                } catch (error) {
                  console.warn('Failed to update online status:', error);
                }
              }
            } catch (error) {
              console.error('Error processing user profile:', error);
            }
          } else {
            setUserProfile(null);
          }
          
          setLoading(false);
        } catch (error) {
          console.error('Auth state change error:', error);
          setLoading(false);
        }
      });

    } catch (error) {
      console.error('Auth listener setup error:', error);
      setLoading(false);
    }

    // Route change handling
    const handleRouteChange = () => {
      try {
        const route = window.location.hash.slice(1) || '/';
        setCurrentRoute(route);
        console.log('Route changed to:', route);
      } catch (error) {
        console.error('Route change error:', error);
        setCurrentRoute('/');
      }
    };

    window.addEventListener('hashchange', handleRouteChange);
    handleRouteChange();

    // Cleanup on page unload
    const handleBeforeUnload = async () => {
      if (user && window.firestore) {
        try {
          await window.firestore.collection('users').doc(user.uid).update({
            isOnline: false,
            lastSeen: firebase.firestore.FieldValue.serverTimestamp()
          });
        } catch (error) {
          console.error('Error updating offline status on unload:', error);
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      try {
        unsubscribe();
        window.removeEventListener('hashchange', handleRouteChange);
        window.removeEventListener('beforeunload', handleBeforeUnload);
      } catch (error) {
        console.error('Cleanup error:', error);
      }
    };
  }, [campusInitialized, user]);

  // Show initialization error if it occurred
  if (initializationError) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{background: 'var(--base-bg)'}}>
        <div className="text-center p-8 card">
          <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="icon-alert-triangle text-white text-2xl"></i>
          </div>
          <h1 className="text-2xl font-bold mb-4" style={{color: 'var(--primary-text)'}}>Campus Setup Failed</h1>
          <p className="mb-4" style={{color: 'var(--secondary-text)'}}>{initializationError}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="btn btn-primary hover-lift"
          >
            <i className="icon-refresh-cw text-sm mr-2"></i>
            Retry Setup
          </button>
        </div>
      </div>
    );
  }

  // Loading state during initialization
  if (loading || !campusInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{background: 'var(--base-bg)'}}>
        <div className="text-center p-8">
          <div className="relative mb-8">
            <div className="w-20 h-20 campus-building flex items-center justify-center mx-auto">
              <i className="icon-graduation-cap text-white text-3xl animate-pulse"></i>
            </div>
            <div className="absolute inset-0 w-20 h-20 border-4 border-blue-200 rounded-full animate-spin mx-auto" style={{borderColor: 'var(--accent-blue)', borderTopColor: 'transparent'}}></div>
          </div>
          
          <h2 className="text-2xl font-bold mb-4 text-gradient">
            {!campusInitialized ? 'Setting up Virtual Campus...' : 'Loading Campus Hub...'}
          </h2>
          
          <div className="w-64 bg-gray-200 rounded-full h-3 mx-auto mb-4 overflow-hidden" style={{backgroundColor: 'var(--border-color)'}}>
            <div 
              className="progress-bar h-3 rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${initializationProgress}%` }}
            ></div>
          </div>
          
          <p style={{color: 'var(--secondary-text)'}} className="animate-pulse">
            {initializationProgress < 25 ? 'Loading Firebase...' :
             initializationProgress < 50 ? 'Initializing services...' :
             initializationProgress < 75 ? 'Connecting to database...' :
             'Almost ready...'}
          </p>
        </div>
      </div>
    );
  }

  // Authentication flow - Show login/signup if no user
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{background: 'var(--base-bg)'}}>
        <div className="max-w-md w-full mx-4">
          <div className="text-center mb-8 animate-fade-in-up">
            <div className="w-20 h-20 campus-building mx-auto mb-6 flex items-center justify-center hover-lift">
              <i className="icon-graduation-cap text-white text-3xl"></i>
            </div>
            <h1 className="text-4xl font-bold mb-3 text-gradient">Virtual Campus</h1>
            <p style={{color: 'var(--secondary-text)'}} className="text-lg">Your Digital Learning Ecosystem</p>
          </div>
          
          <div className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            {authMode === 'login' ? (
              typeof LoginForm !== 'undefined' ? (
                React.createElement(LoginForm, { onSwitchToSignup: () => setAuthMode('signup') })
              ) : (
                <div className="text-center p-8 card">
                  <p style={{color: 'var(--secondary-text)'}}>Loading login form...</p>
                  <button 
                    onClick={() => window.location.reload()} 
                    className="btn btn-primary mt-4"
                  >
                    Refresh Page
                  </button>
                </div>
              )
            ) : (
              typeof SignupForm !== 'undefined' ? (
                React.createElement(SignupForm, { onSwitchToLogin: () => setAuthMode('login') })
              ) : (
                <div className="text-center p-8 card">
                  <p style={{color: 'var(--secondary-text)'}}>Loading signup form...</p>
                  <button 
                    onClick={() => setAuthMode('login')} 
                    className="btn btn-primary mt-4"
                  >
                    Back to Login
                  </button>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    );
  }

  // Profile setup needed
  if (!userProfile?.profileComplete) {
    return typeof ProfileSetup !== 'undefined' ? (
      React.createElement(ProfileSetup, { 
        user: user, 
        onProfileComplete: (profileData) => {
          setUserProfile(prev => ({ ...prev, ...profileData, profileComplete: true }));
        }
      })
    ) : (
      <div className="min-h-screen flex items-center justify-center" style={{background: 'var(--base-bg)'}}>
        <div className="text-center p-8 card">
          <h2 className="text-xl font-bold mb-4" style={{color: 'var(--primary-text)'}}>Profile Setup Required</h2>
          <p style={{color: 'var(--secondary-text)'}} className="mb-4">Loading profile setup...</p>
          <button 
            onClick={() => window.location.reload()} 
            className="btn btn-primary"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  // Main app rendering function
  const renderCurrentPage = () => {
    try {
      const pageProps = { user, userProfile, setCurrentRoute };
      
      console.log('Rendering page for route:', currentRoute);
      
      switch (currentRoute) {
        case '/':
        case '/campus-hub':
          return typeof CampusHub !== 'undefined' ? 
            React.createElement(CampusHub, pageProps) : 
            <div className="p-8 text-center card">
              <h3 className="text-lg font-semibold mb-2" style={{color: 'var(--primary-text)'}}>Campus Hub</h3>
              <p style={{color: 'var(--secondary-text)'}}>Campus Hub component not loaded</p>
            </div>;
            
        case '/study-groups':
          return typeof StudyGroups !== 'undefined' ? 
            React.createElement(StudyGroups, pageProps) : 
            <div className="p-8 text-center card">
              <h3 className="text-lg font-semibold mb-2" style={{color: 'var(--primary-text)'}}>Study Groups</h3>
              <p style={{color: 'var(--secondary-text)'}}>Study Groups component not loaded</p>
            </div>;
            
        case '/mentors':
          return typeof Mentors !== 'undefined' ? 
            React.createElement(Mentors, pageProps) : 
            <div className="p-8 text-center card">
              <h3 className="text-lg font-semibold mb-2" style={{color: 'var(--primary-text)'}}>Mentors</h3>
              <p style={{color: 'var(--secondary-text)'}}>Mentors component not loaded</p>
            </div>;
            
        case '/resources':
          return typeof Resources !== 'undefined' ? 
            React.createElement(Resources, pageProps) : 
            <div className="p-8 text-center card">
              <h3 className="text-lg font-semibold mb-2" style={{color: 'var(--primary-text)'}}>Resources</h3>
              <p style={{color: 'var(--secondary-text)'}}>Resources component not loaded</p>
            </div>;
            
        case '/opportunities':
          return typeof Opportunities !== 'undefined' ? 
            React.createElement(Opportunities, pageProps) : 
            <div className="p-8 text-center card">
              <h3 className="text-lg font-semibold mb-2" style={{color: 'var(--primary-text)'}}>Opportunities</h3>
              <p style={{color: 'var(--secondary-text)'}}>Opportunities component not loaded</p>
            </div>;
            
        case '/leaderboard':
          return typeof Leaderboard !== 'undefined' ? 
            React.createElement(Leaderboard, pageProps) : 
            <div className="p-8 text-center card">
              <h3 className="text-lg font-semibold mb-2" style={{color: 'var(--primary-text)'}}>Leaderboard</h3>
              <p style={{color: 'var(--secondary-text)'}}>Leaderboard component not loaded</p>
            </div>;
            
        case '/admin':
          return typeof Admin !== 'undefined' ? 
            React.createElement(Admin, pageProps) : 
            <div className="p-8 text-center card">
              <h3 className="text-lg font-semibold mb-2" style={{color: 'var(--primary-text)'}}>Admin Panel</h3>
              <p style={{color: 'var(--secondary-text)'}}>Admin component not loaded</p>
            </div>;
            
        default:
          return typeof CampusHub !== 'undefined' ? 
            React.createElement(CampusHub, pageProps) : 
            <div className="p-8 text-center card">
              <h3 className="text-lg font-semibold mb-2" style={{color: 'var(--primary-text)'}}>Welcome to Campus</h3>
              <p style={{color: 'var(--secondary-text)'}}>Default page loading...</p>
            </div>;
      }
    } catch (error) {
      console.error('Error rendering page:', error);
      return (
        <div className="p-8 text-center card">
          <div className="icon-alert-circle text-4xl text-red-500 mb-4"></div>
          <h3 className="text-lg font-semibold mb-2" style={{color: 'var(--primary-text)'}}>Page Loading Error</h3>
          <p style={{color: 'var(--secondary-text)'}}>Please refresh the page to try again</p>
          <button 
            onClick={() => window.location.reload()} 
            className="btn btn-primary mt-4"
          >
            Refresh Page
          </button>
        </div>
      );
    }
  };

  // Main app render
  try {
    return (
      <div className="min-h-screen" style={{background: 'var(--base-bg)'}} data-name="app" data-file="app.js">
        {typeof Sidebar !== 'undefined' ? 
          React.createElement(Sidebar, { 
            currentRoute, 
            user, 
            userProfile,
            onSignOut: async () => {
              try {
                if (window.authUtils) {
                  await window.authUtils.signOut();
                } else {
                  console.error('authUtils not available');
                  window.location.reload();
                }
              } catch (error) {
                console.error('Sign out error:', error);
                window.location.reload();
              }
            }
          }) : 
          null
        }
        <div className="main-content animate-fade-in-up">
          {typeof Header !== 'undefined' ? 
            React.createElement(Header, { 
              user, 
              userProfile,
              onSignOut: async () => {
                try {
                  if (window.authUtils) {
                    await window.authUtils.signOut();
                  } else {
                    console.error('authUtils not available');
                    window.location.reload();
                  }
                } catch (error) {
                  console.error('Sign out error:', error);
                  window.location.reload();
                }
              }
            }) : 
            null
          }
          <div className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            {renderCurrentPage()}
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('App component error:', error);
    return (
      <div className="min-h-screen flex items-center justify-center" style={{background: 'var(--base-bg)'}}>
        <div className="text-center p-8 card">
          <i className="icon-alert-circle text-4xl text-red-500 mb-4"></i>
          <h2 className="text-xl font-bold text-red-400 mb-2">Campus System Error</h2>
          <p className="text-red-300 mb-4">Please refresh the page to reconnect</p>
          <button 
            onClick={() => window.location.reload()} 
            className="btn btn-primary"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }
}

// Safe rendering with error handling
try {
  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
  } else {
    initializeApp();
  }
} catch (error) {
  console.error('Critical rendering error:', error);
  showFallbackUI();
}

function initializeApp() {
  try {
    const rootElement = document.getElementById('root');
    if (!rootElement) {
      throw new Error('Root element not found');
    }

    // Check if React is available
    if (typeof React === 'undefined' || typeof ReactDOM === 'undefined') {
      throw new Error('React libraries not loaded');
    }

    const root = ReactDOM.createRoot(rootElement);
    root.render(
      React.createElement(ErrorBoundary, null, React.createElement(App))
    );
    
    console.log('App rendered successfully');
  } catch (error) {
    console.error('App initialization error:', error);
    showFallbackUI();
  }
}

function showFallbackUI() {
  const rootElement = document.getElementById('root');
  if (rootElement) {
    rootElement.innerHTML = `
      <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; background: #0F0F0F; color: white; font-family: sans-serif;">
        <div style="text-align: center; padding: 2rem; background: #1C1C1E; border-radius: 0.75rem; border: 1px solid #2D2D30; max-width: 400px; margin: 1rem;">
          <div style="width: 4rem; height: 4rem; background: linear-gradient(135deg, #3B82F6, #8B5CF6); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1rem;">
            <span style="font-size: 1.5rem;">🎓</span>
          </div>
          <h1 style="color: #EF4444; margin-bottom: 1rem; font-size: 1.5rem;">Critical System Error</h1>
          <p style="color: #D1D5DB; margin-bottom: 2rem;">Unable to initialize Virtual Campus. This may be due to:</p>
          <ul style="color: #D1D5DB; text-align: left; margin-bottom: 2rem; list-style: none; padding: 0;">
            <li style="margin-bottom: 0.5rem;">• Missing Firebase configuration</li>
            <li style="margin-bottom: 0.5rem;">• JavaScript libraries not loaded</li>
            <li style="margin-bottom: 0.5rem;">• Network connectivity issues</li>
          </ul>
          <button onclick="window.location.reload()" style="background: #3B82F6; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 0.5rem; cursor: pointer; font-weight: 600;">
            Reload Campus
          </button>
        </div>
      </div>
    `;
  }
}