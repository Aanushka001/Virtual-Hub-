// utils/auth.js
const API_BASE_URL = 'http://localhost:5000/api';

window.authUtils = {
  getFirebaseToken: async () => {
    try {
      const user = window.auth?.currentUser;
      if (user) {
        return await user.getIdToken();
      }
      return null;
    } catch (error) {
      console.error('Error getting Firebase token:', error);
      return null;
    }
  },

  signUp: async (email, password, userData) => {
    try {
      // Validate input
      if (!email || !password || !userData) {
        throw new Error('Missing required signup data');
      }

      // Check if Firebase Auth is available
      if (!window.auth) {
        throw new Error('Firebase authentication not initialized');
      }

      const userCredential = await window.auth.createUserWithEmailAndPassword(email, password);
      const user = userCredential.user;

      const cleanUserData = {
        ...userData,
        email: user.email,
        uid: user.uid,
        points: 0,
        level: 1,
        badges: [],
        studyGroups: [],
        mentorships: [],
        resources: [],
        notifications: [],
        isDemo: false,
        profileComplete: false,
        isOnline: true,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      };

      // Save to Firestore
      if (window.firestore) {
        await window.firestore.collection('users').doc(user.uid).set(cleanUserData);
      }

      // Try backend signup (optional)
      try {
        const idToken = await user.getIdToken();
        await fetch(`${API_BASE_URL}/auth/signup`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${idToken}`
          },
          body: JSON.stringify({ email, password, ...userData })
        });
      } catch (backendError) {
        console.warn('Backend signup failed, continuing with Firebase only:', backendError);
      }

      return user;
    } catch (error) {
      console.error('SignUp error:', error);
      throw error;
    }
  },

  demoSignIn: async () => {
    try {
      // Check if demo was already used
      const demoUsed = localStorage.getItem('demoUsed') === 'true';
      if (demoUsed) {
        throw new Error('Demo session already used. Please create an account to continue.');
      }

      // Check if Firebase Auth is available
      if (!window.auth) {
        throw new Error('Firebase authentication not initialized');
      }

      const demoEmail = `demo.student.${Date.now()}@campus.edu`;
      const demoPassword = 'demo123456';
      
      const userCredential = await window.auth.createUserWithEmailAndPassword(demoEmail, demoPassword);
      const user = userCredential.user;

      const demoUserData = {
        firstName: 'Demo',
        lastName: 'Student',
        displayName: 'Demo Student',
        email: user.email,
        uid: user.uid,
        role: 'student',
        interests: ['Web Development', 'Data Science'],
        skills: ['JavaScript', 'Python'],
        bio: 'Demo student exploring Virtual Campus',
        goals: 'Learn new technologies and connect with peers',
        yearOfStudy: '2nd Year',
        major: 'Computer Science',
        points: 150,
        level: 2,
        badges: ['New Member', 'First Login'],
        notifications: [],
        profileComplete: true,
        isDemo: true,
        isOnline: true,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      };

      // Save to Firestore
      if (window.firestore) {
        await window.firestore.collection('users').doc(user.uid).set(demoUserData);
      }
      
      // Mark demo as used
      localStorage.setItem('demoUsed', 'true');
      localStorage.setItem('isDemoMode', 'true');

      return user;
    } catch (error) {
      console.error('Demo SignIn error:', error);
      throw error;
    }
  },

  signIn: async (email, password) => {
    try {
      if (!email || !password) {
        throw new Error('Email and password are required');
      }

      // Check if Firebase Auth is available
      if (!window.auth) {
        throw new Error('Firebase authentication not initialized');
      }

      const userCredential = await window.auth.signInWithEmailAndPassword(email, password);
      const user = userCredential.user;

      // Update user online status
      if (window.firestore) {
        try {
          await window.firestore.collection('users').doc(user.uid).update({
            isOnline: true,
            lastSeen: firebase.firestore.FieldValue.serverTimestamp()
          });
        } catch (firestoreError) {
          console.warn('Failed to update online status:', firestoreError);
        }
      }

      // Try backend signin (optional)
      try {
        const idToken = await user.getIdToken();
        const res = await fetch(`${API_BASE_URL}/auth/signin`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${idToken}`
          },
          body: JSON.stringify({ email, password })
        });
        
        if (res.ok) {
          const data = await res.json();
          if (data.token) {
            localStorage.setItem('jwtToken', data.token);
          }
        }
      } catch (backendError) {
        console.warn('Backend signin failed, continuing with Firebase only:', backendError);
      }

      return user;
    } catch (error) {
      console.error('SignIn error:', error);
      throw error;
    }
  },

  signOut: async () => {
    try {
      console.log('Starting signOut process...');
      
      const user = window.auth?.currentUser;
      if (user && window.firestore) {
        // Update user offline status before signing out
        try {
          await window.firestore.collection('users').doc(user.uid).update({
            isOnline: false,
            lastSeen: firebase.firestore.FieldValue.serverTimestamp()
          });
        } catch (error) {
          console.warn('Failed to update offline status:', error);
        }
      }
      
      // Sign out from Firebase
      if (window.auth) {
        await window.auth.signOut();
      }
      
      // Clear specific localStorage items (NOT localStorage.clear())
      try {
        localStorage.removeItem('jwtToken');
        localStorage.removeItem('isDemoMode');
        // Note: Keep 'demoUsed' so demo can only be used once
      } catch (storageError) {
        console.warn('Error clearing localStorage items:', storageError);
      }
      
      console.log('SignOut completed successfully');
      
      // Force page reload to reset application state
      setTimeout(() => {
        window.location.reload();
      }, 100);
      
    } catch (error) {
      console.error('SignOut error:', error);
      // Even if there's an error, try to clear localStorage and reload
      try {
        localStorage.removeItem('jwtToken');
        localStorage.removeItem('isDemoMode');
      } catch (clearError) {
        console.error('Failed to clear localStorage:', clearError);
      }
      
      // Force reload on error
      window.location.reload();
      throw error;
    }
  },

  getUserProfile: async (uid) => {
    try {
      if (!uid) {
        console.warn('No UID provided to getUserProfile');
        return null;
      }

      // Check if Firestore is available
      if (!window.firestore) {
        console.warn('Firestore not available');
        return null;
      }

      const doc = await window.firestore.collection('users').doc(uid).get();
      if (doc.exists) {
        return doc.data();
      }

      // Try backend fallback
      try {
        const firebaseToken = await window.authUtils.getFirebaseToken();
        if (firebaseToken) {
          const res = await fetch(`${API_BASE_URL}/users/profile/${uid}`, {
            headers: { 
              'Authorization': `Bearer ${firebaseToken}`,
              'Content-Type': 'application/json'
            }
          });
          if (res.ok) {
            const data = await res.json();
            return data.user;
          }
        }
      } catch (error) {
        console.error('Backend profile fetch failed:', error);
      }
      
      return null;
    } catch (error) {
      console.error('getUserProfile error:', error);
      return null;
    }
  },

  updateUserProfile: async (uid, updateData) => {
    try {
      if (!uid || !updateData) {
        throw new Error('UID and update data are required');
      }

      if (!window.firestore) {
        throw new Error('Firestore not available');
      }

      await window.firestore.collection('users').doc(uid).update({
        ...updateData,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      return true;
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  },

  isAdmin: async (uid) => {
    try {
      if (!uid) return false;
      
      const profile = await window.authUtils.getUserProfile(uid);
      return profile?.role === 'admin';
    } catch (error) {
      console.error('isAdmin error:', error);
      return false;
    }
  },

  getToken: async () => {
    try {
      return await window.authUtils.getFirebaseToken();
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  },

  isAuthenticated: () => {
    try {
      return !!(window.auth?.currentUser);
    } catch (error) {
      console.error('Error checking authentication:', error);
      return false;
    }
  },

  validateEmail: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  validatePassword: (password) => {
    return password && password.length >= 6;
  }
};