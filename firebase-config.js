// Firebase Configuration
// This should be replaced with your actual Firebase config
// For Canvas environment, use the provided Firebase configuration

let firebaseApp = null;
let auth = null;
let db = null;
let currentUser = null;

const APP_ID = 'cve-platform'; // Change this to match your app ID

// Initialize Firebase
async function initFirebase() {
    if (window.firebaseModules) {
        // Try to get Firebase config from environment or use placeholder
        // For Canvas environment, this would come from the environment
        let firebaseConfig = null;
        
        // Check if Firebase config is provided in the environment (Canvas)
        if (window.__FIREBASE_CONFIG__) {
            firebaseConfig = window.__FIREBASE_CONFIG__;
        } else {
            // Use placeholder config - replace with your actual Firebase config
            firebaseConfig = {
                apiKey: "YOUR_API_KEY",
                authDomain: "YOUR_AUTH_DOMAIN",
                projectId: "YOUR_PROJECT_ID",
                storageBucket: "YOUR_STORAGE_BUCKET",
                messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
                appId: "YOUR_APP_ID"
            };
            
            // Check if config has placeholder values
            if (firebaseConfig.apiKey === "YOUR_API_KEY") {
                console.warn('Firebase not configured. Using demo mode. To enable backend, update firebase-config.js with your Firebase credentials.');
                currentUser = { uid: 'demo-user-' + Date.now() };
                window.firebaseInitialized = false;
                return { firebaseApp: null, auth: null, db: null, currentUser };
            }
        }

        // For Canvas environment, use __initial_auth_token if available
        const initialAuthToken = window.__initial_auth_token || null;

        try {
            firebaseApp = window.firebaseModules.initializeApp(firebaseConfig);
            auth = window.firebaseModules.getAuth(firebaseApp);
            db = window.firebaseModules.getFirestore(firebaseApp);

            // Sign in with custom token if available
            if (initialAuthToken) {
                await window.firebaseModules.signInWithCustomToken(auth, initialAuthToken);
                currentUser = auth.currentUser;
                console.log('✅ Firebase connected. Authenticated user:', currentUser.uid);
            } else {
                // For demo purposes, create a mock user
                console.warn('⚠️ No auth token provided. Using demo mode.');
                currentUser = { uid: 'demo-user-' + Date.now() };
            }

            window.firebaseInitialized = true;
            console.log('✅ Firebase initialized successfully');
            return { firebaseApp, auth, db, currentUser };
        } catch (error) {
            console.error('❌ Firebase initialization error:', error);
            // Fallback to demo mode
            currentUser = { uid: 'demo-user-' + Date.now() };
            window.firebaseInitialized = false;
            return { firebaseApp: null, auth: null, db: null, currentUser };
        }
    } else {
        console.warn('⚠️ Firebase modules not loaded. Using demo mode.');
        currentUser = { uid: 'demo-user-' + Date.now() };
        window.firebaseInitialized = false;
        return { firebaseApp: null, auth: null, db: null, currentUser };
    }
}

// Get current user ID
function getUserId() {
    return currentUser ? currentUser.uid : 'demo-user';
}

// Initialize on load
initFirebase().then(() => {
    console.log('Firebase initialized');
    if (window.onFirebaseReady) {
        window.onFirebaseReady();
    }
});

// Export for use in other files
window.firebaseConfig = {
    APP_ID,
    getUserId,
    getAuth: () => auth,
    getDb: () => db,
    getCurrentUser: () => currentUser,
    isInitialized: () => window.firebaseInitialized === true
};

