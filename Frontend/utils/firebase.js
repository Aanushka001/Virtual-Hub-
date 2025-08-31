
const firebaseConfig = {
  apiKey: "AIzaSyDwPz2PcNrKc45Ybru28DsP4e12IpNqw7E",
  authDomain: "virtual-hub-fd3c7.firebaseapp.com",
  projectId: "virtual-hub-fd3c7",
  storageBucket: "virtual-hub-fd3c7.appspot.com",
  messagingSenderId: "175384489156",
  appId: "1:175384489156:web:69696f4a6532634abe2d91"
};

// Initialize Firebase if not already initialized
try {
  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
    console.log("Firebase initialized successfully");
  } else {
    console.log("Firebase already initialized");
  }
} catch (error) {
  console.error("Firebase initialization error:", error);
}

// Initialize services
try {
  window.auth = firebase.auth();
  window.firestore = firebase.firestore();

  console.log("Firebase services ready");
} catch (error) {
  console.error("Firebase services initialization error:", error);
}

// Optional: check connection
window.checkFirebaseConnection = async () => {
  try {
    await window.firestore.collection("test").limit(1).get();
    console.log("Firestore connection verified");
    return true;
  } catch (err) {
    console.warn("Firestore connection failed:", err);
    return false;
  }
};

// Auth persistence
try {
  window.auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);
} catch (error) {
  console.warn("Failed to set auth persistence:", error);
}
// </script>
