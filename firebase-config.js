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
        // Replace with your actual Firebase config
        // In Canvas, this would come from the environment
        const firebaseConfig = {
            apiKey: "YOUR_API_KEY",
            authDomain: "YOUR_AUTH_DOMAIN",
            projectId: "YOUR_PROJECT_ID",
            storageBucket: "YOUR_STORAGE_BUCKET",
            messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
            appId: "YOUR_APP_ID"
        };

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
                console.log('Authenticated user:', currentUser.uid);
            } else {
                // For demo purposes, create a mock user
                console.warn('No auth token provided. Using demo mode.');
                currentUser = { uid: 'demo-user-' + Date.now() };
            }

            window.firebaseInitialized = true;
            return { firebaseApp, auth, db, currentUser };
        } catch (error) {
            console.error('Firebase initialization error:', error);
            // Fallback to demo mode
            currentUser = { uid: 'demo-user-' + Date.now() };
            window.firebaseInitialized = false;
            return { firebaseApp: null, auth: null, db: null, currentUser };
        }
    } else {
        console.warn('Firebase modules not loaded. Using demo mode.');
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

