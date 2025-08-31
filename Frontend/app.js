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
        <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--base-bg)' }}>
          <div className="text-center p-8 card">
            <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="icon-alert-circle text-white text-2xl"></i>
            </div>
            <h1 className="text-2xl font-bold mb-4" style={{ color: 'var(--primary-text)' }}>Campus Connection Lost</h1>
            <p className="mb-6" style={{ color: 'var(--secondary-text)' }}>We're experiencing technical difficulties. Please try refreshing the page.</p>
            <button onClick={() => window.location.reload()} className="btn btn-primary hover-lift">
              <i className="icon-refresh-cw text-sm mr-2"></i>Reconnect to Campus
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function App() {
  const [user, setUser] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [currentRoute, setCurrentRoute] = React.useState('/');
  const [authMode, setAuthMode] = React.useState('login');
  const [campusInitialized, setCampusInitialized] = React.useState(false);
  const [userProfile, setUserProfile] = React.useState(null);
  const [initializationError, setInitializationError] = React.useState(null);
  const [retryCount, setRetryCount] = React.useState(0);
  const routeRef = React.useRef('/');

  // Maximum retry attempts and timeout settings
  const MAX_RETRIES = 3;
  const INIT_TIMEOUT = 10000; // 10 seconds
  const AUTH_TIMEOUT = 8000; // 8 seconds

  // Initialize Campus with proper timeout and error handling
  React.useEffect(() => {
    const initializeCampus = async () => {
      const startTime = Date.now();
      
      try {
        console.log('Starting campus initialization...');
        
        // Create a timeout promise
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Initialization timeout')), INIT_TIMEOUT)
        );

        // Firebase initialization with timeout
        const initPromise = new Promise(async (resolve, reject) => {
          try {
            let attempts = 0;
            const maxWait = 50; // ms between checks
            
            // Wait for Firebase with retry logic
            while (!window.auth || !window.firestore) {
              if (attempts * maxWait > AUTH_TIMEOUT) {
                throw new Error('Firebase services not available');
              }
              await new Promise(r => setTimeout(r, maxWait));
              attempts++;
            }

            console.log('Firebase services detected');
            resolve();
          } catch (error) {
            reject(error);
          }
        });

        // Race between initialization and timeout
        await Promise.race([initPromise, timeoutPromise]);

        setCampusInitialized(true);
        console.log('Campus initialized successfully');

        // Setup auth listener with timeout protection
        setupAuthListener();

      } catch (error) {
        console.error('Campus initialization failed:', error);
        
        if (retryCount < MAX_RETRIES) {
          console.log(`Retrying initialization (${retryCount + 1}/${MAX_RETRIES})`);
          setRetryCount(prev => prev + 1);
          // Retry after delay
          setTimeout(() => {
            setInitializationError(null);
            setCampusInitialized(false);
          }, 2000 * (retryCount + 1)); // Exponential backoff
          return;
        }
        
        // Fallback to offline mode after max retries
        console.log('Switching to offline mode');
        setInitializationError('Unable to connect to campus services. Running in offline mode.');
        setCampusInitialized(true);
        setupOfflineMode();
      } finally {
        // Always clear loading after timeout
        const elapsed = Date.now() - startTime;
        const minLoadTime = 1000; // Minimum loading time for UX
        
        if (elapsed < minLoadTime) {
          setTimeout(() => setLoading(false), minLoadTime - elapsed);
        } else {
          setLoading(false);
        }
      }
    };

    initializeCampus();
  }, [retryCount]);

  // Setup Firebase Auth Listener
  const setupAuthListener = () => {
    try {
      if (window.auth && window.auth.onAuthStateChanged) {
        const unsubscribe = window.auth.onAuthStateChanged(async (authUser) => {
          console.log('Auth state changed:', authUser ? 'User logged in' : 'No user');
          setUser(authUser);

          if (authUser) {
            await loadUserProfile(authUser);
          } else {
            setUserProfile(null);
          }
        });

        // Cleanup function
        return unsubscribe;
      } else {
        throw new Error('Firebase Auth not available');
      }
    } catch (error) {
      console.error('Auth listener setup failed:', error);
      // Fallback: Check for existing session
      const savedUser = localStorage.getItem('virtual_hub_user');
      if (savedUser) {
        try {
          const userData = JSON.parse(savedUser);
          setUser(userData);
          setUserProfile(userData.profile || null);
        } catch (e) {
          console.error('Error parsing saved user:', e);
          localStorage.removeItem('virtual_hub_user');
        }
      }
    }
  };

  // Setup Offline Mode
  const setupOfflineMode = () => {
    console.log('Setting up offline mode');
    
    // Check for cached user data
    const cachedUser = localStorage.getItem('virtual_hub_user');
    const cachedProfile = localStorage.getItem('virtual_hub_profile');
    
    if (cachedUser && cachedProfile) {
      try {
        setUser(JSON.parse(cachedUser));
        setUserProfile(JSON.parse(cachedProfile));
        console.log('Loaded cached user data');
      } catch (error) {
        console.error('Error loading cached data:', error);
      }
    }
  };

  // Load User Profile with error handling
  const loadUserProfile = async (authUser) => {
    try {
      if (!window.firestore) {
        // Use cached profile or create basic profile
        const cachedProfile = localStorage.getItem('virtual_hub_profile');
        if (cachedProfile) {
          setUserProfile(JSON.parse(cachedProfile));
          return;
        }
        
        // Create basic profile for offline mode
        const basicProfile = {
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
        
        setUserProfile(basicProfile);
        localStorage.setItem('virtual_hub_profile', JSON.stringify(basicProfile));
        return;
      }

      // Try to load from Firestore with timeout
      const profilePromise = new Promise(async (resolve, reject) => {
        try {
          const userRef = window.firestore.collection('users').doc(authUser.uid);
          const doc = await userRef.get();
          
          const profile = doc.exists ? doc.data() : {
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

          if (!doc.exists) {
            await userRef.set(profile, { merge: true });
          }

          // Update online status
          await userRef.set({
            isOnline: true,
            lastSeen: firebase.firestore.FieldValue.serverTimestamp()
          }, { merge: true });

          resolve(profile);
        } catch (error) {
          reject(error);
        }
      });

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Profile load timeout')), 5000)
      );

      const profile = await Promise.race([profilePromise, timeoutPromise]);
      setUserProfile(profile);
      
      // Cache profile data
      localStorage.setItem('virtual_hub_profile', JSON.stringify(profile));
      localStorage.setItem('virtual_hub_user', JSON.stringify({
        uid: authUser.uid,
        email: authUser.email,
        displayName: authUser.displayName,
        profile
      }));

    } catch (error) {
      console.warn('Error loading/creating profile:', error);
      
      // Use cached data or create minimal profile
      const cachedProfile = localStorage.getItem('virtual_hub_profile');
      if (cachedProfile) {
        setUserProfile(JSON.parse(cachedProfile));
      } else {
        const minimalProfile = {
          uid: authUser.uid,
          displayName: authUser.displayName || 'Student',
          email: authUser.email,
          role: 'student',
          points: 0,
          level: 1,
          badges: [],
          profileComplete: true,
          isOnline: false
        };
        setUserProfile(minimalProfile);
      }
    }
  };

  // Route handling
  React.useEffect(() => {
    const handleRouteChange = () => {
      const route = window.location.hash.slice(1) || '/';
      if (routeRef.current !== route) {
        routeRef.current = route;
        setCurrentRoute(route);
        console.log('Route changed to:', route);
      }
    };

    window.addEventListener('hashchange', handleRouteChange);
    handleRouteChange();

    return () => window.removeEventListener('hashchange', handleRouteChange);
  }, []);

  // Update offline status on unload (with error handling)
  React.useEffect(() => {
    const handleBeforeUnload = async () => {
      if (user && window.firestore) {
        try {
          await Promise.race([
            window.firestore.collection('users').doc(user.uid).update({
              isOnline: false,
              lastSeen: firebase.firestore.FieldValue.serverTimestamp()
            }),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 2000))
          ]);
        } catch (error) {
          console.warn('Could not update offline status:', error);
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [user]);

  // Retry initialization function
  const retryInitialization = () => {
    setInitializationError(null);
    setLoading(true);
    setCampusInitialized(false);
    setRetryCount(0);
  };

  // Render initialization error
  if (initializationError && !campusInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--base-bg)' }}>
        <div className="text-center p-8 card max-w-md">
          <div className="w-16 h-16 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="icon-wifi-off text-white text-2xl"></i>
          </div>
          <h1 className="text-2xl font-bold mb-4" style={{ color: 'var(--primary-text)' }}>Connection Issues</h1>
          <p className="mb-6 text-sm" style={{ color: 'var(--secondary-text)' }}>{initializationError}</p>
          <div className="space-y-3">
            <button onClick={retryInitialization} className="btn btn-primary hover-lift w-full">
              <i className="icon-refresh-cw text-sm mr-2"></i>Retry Connection
            </button>
            <button 
              onClick={() => {
                setCampusInitialized(true);
                setInitializationError(null);
                setupOfflineMode();
              }} 
              className="btn btn-secondary hover-lift w-full"
            >
              <i className="icon-globe text-sm mr-2"></i>Continue Offline
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Render loading state
  if (loading || !campusInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--base-bg)' }}>
        <div className="text-center p-8">
          <div className="w-20 h-20 campus-building flex items-center justify-center mx-auto mb-4">
            <i className="icon-graduation-cap text-white text-3xl animate-pulse"></i>
          </div>
          <h2 className="text-2xl font-bold mb-4 text-gradient">Loading Virtual Campus...</h2>
          <div className="w-48 h-2 bg-gray-200 rounded-full mx-auto mb-4">
            <div className="progress-bar h-full rounded-full" style={{ width: `${Math.min(100, (Date.now() % 3000) / 30)}%` }}></div>
          </div>
          <p className="text-sm" style={{ color: 'var(--secondary-text)' }}>
            {retryCount > 0 ? `Attempting to reconnect... (${retryCount}/${MAX_RETRIES})` : 'Initializing campus services...'}
          </p>
        </div>
      </div>
    );
  }

  // Render authentication
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--base-bg)' }}>
        <div className="max-w-md w-full mx-4">
          {initializationError && (
            <div className="mb-4 p-3 bg-yellow-100 border border-yellow-300 rounded-lg text-center">
              <p className="text-sm text-yellow-800">
                <i className="icon-wifi-off mr-2"></i>
                Running in offline mode - some features may be limited
              </p>
            </div>
          )}
          {authMode === 'login'
            ? React.createElement(window.LoginForm, { onSwitchToSignup: () => setAuthMode('signup') })
            : React.createElement(window.SignupForm, { onSwitchToLogin: () => setAuthMode('login') })
          }
        </div>
      </div>
    );
  }

  // Render profile setup
  if (!userProfile?.profileComplete) {
    return React.createElement(window.ProfileSetup, {
      user,
      onProfileComplete: (profileData) => setUserProfile(prev => ({ ...prev, ...profileData, profileComplete: true }))
    });
  }

  // Main app render
  const renderCurrentPage = () => {
    const pageProps = { user, userProfile, setCurrentRoute };
    const pages = {
      '/': window.CampusHub,
      '/campus-hub': window.CampusHub,
      '/study-groups': window.StudyGroups,
      '/mentors': window.Mentors,
      '/resources': window.Resources,
      '/opportunities': window.Opportunities,
      '/leaderboard': window.Leaderboard,
      '/admin': window.Admin
    };
    const PageComponent = pages[currentRoute] || window.CampusHub;
    
    try {
      return PageComponent ? React.createElement(PageComponent, pageProps) : (
        <div className="p-6 text-center">
          <div className="icon-compass text-4xl" style={{ color: 'var(--secondary-text)' }}></div>
          <h3 className="text-lg font-semibold mt-4 mb-2" style={{ color: 'var(--primary-text)' }}>Page Not Found</h3>
          <p style={{ color: 'var(--secondary-text)' }}>The requested page could not be loaded.</p>
          <button 
            onClick={() => {
              setCurrentRoute('/');
              window.location.hash = '/';
            }}
            className="btn btn-primary mt-4"
          >
            Return to Campus Hub
          </button>
        </div>
      );
    } catch (error) {
      console.error('Page render error:', error);
      return (
        <div className="p-6 text-center">
          <div className="icon-alert-triangle text-4xl text-red-500 mb-4"></div>
          <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--primary-text)' }}>Page Error</h3>
          <p className="mb-4" style={{ color: 'var(--secondary-text)' }}>There was an error loading this page.</p>
          <button onClick={() => window.location.reload()} className="btn btn-primary">
            Refresh Page
          </button>
        </div>
      );
    }
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--base-bg)' }}>
      {/* Connection status indicator */}
      {initializationError && (
        <div className="fixed top-4 right-4 z-50">
          <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-2 text-xs text-yellow-800">
            <i className="icon-wifi-off mr-1"></i>
            Offline Mode
          </div>
        </div>
      )}
      
      {window.Sidebar && React.createElement(window.Sidebar, { currentRoute, user, userProfile })}
      <div className="main-content animate-fade-in-up">
        {window.Header && React.createElement(window.Header, { user, userProfile })}
        <div className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          {renderCurrentPage()}
        </div>
      </div>
    </div>
  );
}

// Initialize App with error handling
function initializeApp() {
  try {
    const rootElement = document.getElementById('root');
    if (!rootElement) {
      console.error('Root element not found');
      document.body.innerHTML = '<div style="padding: 20px; text-align: center;"><h2>Campus Not Available</h2><p>Unable to initialize the virtual campus. Please refresh the page.</p></div>';
      return;
    }
    
    const root = ReactDOM.createRoot(rootElement);
    root.render(
      React.createElement(ErrorBoundary, null, React.createElement(App))
    );
    console.log('Virtual Campus initialized successfully');
  } catch (error) {
    console.error('App initialization failed:', error);
    document.body.innerHTML = '<div style="padding: 20px; text-align: center;"><h2>Initialization Error</h2><p>Please refresh the page to try again.</p></div>';
  }
}

// Enhanced DOM ready check
function waitForDOM() {
  return new Promise((resolve) => {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', resolve);
    } else {
      resolve();
    }
  });
}

// Initialize when ready
waitForDOM().then(() => {
  // Small delay to ensure all scripts are loaded
  setTimeout(initializeApp, 100);
});