// LocalStorage-based Backend
// Provides the same interface as Firebase but uses browser localStorage

const APP_ID = 'cve-platform';
const STORAGE_PREFIX = `cve_${APP_ID}_`;

// Get current user ID (using a consistent demo user)
function getUserId() {
    let userId = localStorage.getItem(STORAGE_PREFIX + 'userId');
    if (!userId) {
        userId = 'user-' + Date.now();
        localStorage.setItem(STORAGE_PREFIX + 'userId', userId);
    }
    return userId;
}

// Generate a unique ID
function generateId() {
    return 'id-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
}

// Projects Collection
const ProjectsStorage = {
    // Save a project
    async save(projectData) {
        try {
            const userId = getUserId();
            const key = `${STORAGE_PREFIX}projects_${userId}`;
            const projects = this.getAll(userId);
            
            // Find existing project or add new one
            const existingIndex = projects.findIndex(p => p.projectId === projectData.projectId);
            if (existingIndex >= 0) {
                projects[existingIndex] = { ...projects[existingIndex], ...projectData, updatedAt: new Date().toISOString() };
            } else {
                projects.push({ ...projectData, updatedAt: new Date().toISOString() });
            }
            
            localStorage.setItem(key, JSON.stringify(projects));
            console.log('✅ Project saved to localStorage:', projectData.projectId);
            return projectData.projectId;
        } catch (error) {
            console.error('Error saving project:', error);
            throw error;
        }
    },
    
    // Get all projects for user
    getAll(userId) {
        try {
            const key = `${STORAGE_PREFIX}projects_${userId}`;
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('Error loading projects:', error);
            return [];
        }
    },
    
    // Get a single project
    get(projectId, userId) {
        const projects = this.getAll(userId);
        return projects.find(p => p.projectId === projectId) || null;
    },
    
    // Delete a project
    delete(projectId, userId) {
        try {
            const key = `${STORAGE_PREFIX}projects_${userId}`;
            const projects = this.getAll(userId);
            const filtered = projects.filter(p => p.projectId !== projectId);
            localStorage.setItem(key, JSON.stringify(filtered));
            return true;
        } catch (error) {
            console.error('Error deleting project:', error);
            return false;
        }
    },
    
    // Subscribe to changes (simulates Firebase onSnapshot)
    subscribe(callback, userId) {
        // Call immediately with current data
        callback(this.getAll(userId));
        
        // Set up storage event listener for cross-tab updates
        const storageListener = (e) => {
            if (e.key && e.key.startsWith(`${STORAGE_PREFIX}projects_${userId}`)) {
                callback(this.getAll(userId));
            }
        };
        window.addEventListener('storage', storageListener);
        
        // Also listen for custom events (same-tab updates)
        const customListener = () => {
            callback(this.getAll(userId));
        };
        window.addEventListener('projectsUpdated', customListener);
        
        // Return unsubscribe function
        return () => {
            window.removeEventListener('storage', storageListener);
            window.removeEventListener('projectsUpdated', customListener);
        };
    }
};

// Verifications Collection
const VerificationsStorage = {
    // Save a verification
    async save(verificationData) {
        try {
            const userId = getUserId();
            const key = `${STORAGE_PREFIX}verifications_${userId}`;
            const verifications = this.getAll(userId);
            
            const verification = {
                ...verificationData,
                id: verificationData.id || generateId(),
                userId: userId,
                createdAt: new Date().toISOString()
            };
            
            verifications.push(verification);
            localStorage.setItem(key, JSON.stringify(verifications));
            console.log('✅ Verification saved to localStorage:', verification.id);
            
            // Trigger custom event for same-tab updates
            window.dispatchEvent(new Event('verificationsUpdated'));
            
            return verification.id;
        } catch (error) {
            console.error('Error saving verification:', error);
            throw error;
        }
    },
    
    // Get all verifications for user
    getAll(userId) {
        try {
            const key = `${STORAGE_PREFIX}verifications_${userId}`;
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('Error loading verifications:', error);
            return [];
        }
    },
    
    // Get verifications by project
    getByProject(projectId, userId) {
        const verifications = this.getAll(userId);
        return verifications.filter(v => v.projectId === projectId);
    },
    
    // Subscribe to changes (simulates Firebase onSnapshot)
    subscribe(callback, userId, options = {}) {
        // Sort function
        const sortFn = (a, b) => {
            if (options.orderBy === 'timestamp' && options.orderDirection === 'desc') {
                return new Date(b.timestamp) - new Date(a.timestamp);
            }
            return 0;
        };
        
        // Call immediately with current data
        const data = this.getAll(userId).sort(sortFn);
        callback(data);
        
        // Set up storage event listener for cross-tab updates
        const storageListener = (e) => {
            if (e.key && e.key.startsWith(`${STORAGE_PREFIX}verifications_${userId}`)) {
                const data = this.getAll(userId).sort(sortFn);
                callback(data);
            }
        };
        window.addEventListener('storage', storageListener);
        
        // Also listen for custom events (same-tab updates)
        const customListener = () => {
            const data = this.getAll(userId).sort(sortFn);
            callback(data);
        };
        window.addEventListener('verificationsUpdated', customListener);
        
        // Return unsubscribe function
        return () => {
            window.removeEventListener('storage', storageListener);
            window.removeEventListener('verificationsUpdated', customListener);
        };
    }
};

// Export storage API that matches Firebase interface
window.localStorageBackend = {
    APP_ID,
    getUserId,
    projects: ProjectsStorage,
    verifications: VerificationsStorage,
    isInitialized: () => true // Always initialized
};

console.log('✅ LocalStorage backend initialized');

