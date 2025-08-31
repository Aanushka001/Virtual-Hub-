// utils/firebase.js
const firebaseConfig = {
  apiKey: "AIzaSyDwPz2PcNrKc45Ybru28DsP4e12IpNqw7E",
  authDomain: "virtual-hub-fd3c7.firebaseapp.com",
  projectId: "virtual-hub-fd3c7",
  storageBucket: "virtual-hub-fd3c7.firebasestorage.app",
  messagingSenderId: "175384489156",
  appId: "1:175384489156:web:69696f4a6532634abe2d91"
};


// Initialize Firebase only if not already initialized
try {
  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
    console.log('Firebase initialized successfully');
  } else {
    console.log('Firebase already initialized');
  }
} catch (error) {
  console.error('Firebase initialization error:', error);
}

// Initialize Firebase services
try {
  window.auth = firebase.auth();
  window.firestore = firebase.firestore();
  
  // Configure Firestore settings
  window.firestore.settings({
    timestampsInSnapshots: true,
    merge: true
  });
  
  console.log('Firebase services initialized');
} catch (error) {
  console.error('Firebase services initialization error:', error);
}

// Firebase connection checker
window.checkFirebaseConnection = async () => {
  try {
    if (!window.firestore) {
      console.warn('Firestore not available');
      return false;
    }
    
    // Try to read from Firestore to check connection
    await window.firestore.collection('test').limit(1).get();
    console.log('Firebase connection verified');
    return true;
  } catch (error) {
    console.warn('Firebase connection check failed:', error);
    return false;
  }
};

// Auth state persistence
try {
  window.auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);
} catch (error) {
  console.warn('Failed to set auth persistence:', error);
}

console.log('Firebase setup completed');