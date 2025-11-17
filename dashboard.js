// Performance Dashboard
let projectsData = [];
let verificationsData = [];
let vctChart = null;
let confidenceChart = null;

// Load data from Firebase
async function loadDashboardData() {
    if (!window.firebaseConfig || !window.firebaseConfig.isInitialized()) {
        console.log('Firebase not initialized, using demo data');
        loadDemoData();
        return;
    }
    
    try {
        const db = window.firebaseConfig.getDb();
        const userId = window.firebaseConfig.getUserId();
        const APP_ID = window.firebaseConfig.APP_ID;
        
        const { collection, query, onSnapshot, orderBy } = window.firebaseModules;
        
        // Load projects
        const projectsRef = collection(db, `artifacts/${APP_ID}/users/${userId}/projects`);
        const projectsQuery = query(projectsRef, orderBy('createdAt', 'desc'));
        
        onSnapshot(projectsQuery, (snapshot) => {
            projectsData = [];
            snapshot.forEach((doc) => {
                projectsData.push({ id: doc.id, ...doc.data() });
            });
            updateProjectsTable();
            updateMetrics();
        });
        
        // Load verifications
        const verificationsRef = collection(db, `artifacts/${APP_ID}/users/${userId}/verifications`);
        const verificationsQuery = query(verificationsRef, orderBy('timestamp', 'desc'));
        
        onSnapshot(verificationsQuery, (snapshot) => {
            verificationsData = [];
            snapshot.forEach((doc) => {
                verificationsData.push({ id: doc.id, ...doc.data() });
            });
            updateCharts();
            updateMetrics();
        });
        
    } catch (error) {
        console.error('Error loading dashboard data:', error);
        loadDemoData();
    }
}

// Demo data for when Firebase is not available
function loadDemoData() {
    projectsData = [
        {
            id: 'CVE-CROPLAND-001',
            projectId: 'CVE-CROPLAND-001',
            landUse: 'Cropland',
            area_ha: 1250,
            practices: 'No-Till',
            createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()
        }
    ];
    
    verificationsData = [
        {
            id: 'verification-1',
            projectId: 'CVE-CROPLAND-001',
            vct: 1245,
            confidence: 96.2,
            timestamp: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            sampleCount: 8
        },
        {
            id: 'verification-2',
            projectId: 'CVE-CROPLAND-001',
            vct: 1320,
            confidence: 97.1,
            timestamp: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
            sampleCount: 8
        }
    ];
    
    updateProjectsTable();
    updateCharts();
    updateMetrics();
}

// Update projects table
function updateProjectsTable() {
    const tbody = document.getElementById('projects-table-body');
    
    if (projectsData.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="empty-state">No projects yet. Create a project to get started.</td></tr>';
        return;
    }
    
    tbody.innerHTML = projectsData.map(project => {
        const projectVerifications = verificationsData.filter(v => v.projectId === project.projectId);
        const latestVerification = projectVerifications[0] || null;
        const verificationCount = projectVerifications.length;
        
        return `
            <tr>
                <td>${project.projectId}</td>
                <td>${project.landUse}</td>
                <td>${project.area_ha} ha</td>
                <td>${verificationCount}</td>
                <td>${latestVerification ? latestVerification.vct.toLocaleString() + ' VCT' : '-'}</td>
                <td>
                    <button class="btn-small" onclick="loadProject('${project.projectId}')">Load</button>
                </td>
            </tr>
        `;
    }).join('');
}

// Update summary metrics
function updateMetrics() {
    const totalVCT = verificationsData.reduce((sum, v) => sum + (v.vct || 0), 0);
    const totalSamples = verificationsData.reduce((sum, v) => sum + (v.sampleCount || 0), 0);
    const efficiency = totalSamples > 0 ? (totalVCT / totalSamples).toFixed(1) : 0;
    const avgConfidence = verificationsData.length > 0
        ? (verificationsData.reduce((sum, v) => sum + (v.confidence || 0), 0) / verificationsData.length).toFixed(1)
        : 0;
    
    document.getElementById('total-vct').textContent = totalVCT.toLocaleString();
    document.getElementById('total-samples').textContent = totalSamples;
    document.getElementById('efficiency-metric').textContent = efficiency;
    document.getElementById('avg-confidence').textContent = avgConfidence + '%';
}

// Update charts
function updateCharts() {
    updateVCTChart();
    updateConfidenceChart();
}

function updateVCTChart() {
    const ctx = document.getElementById('vct-chart');
    if (!ctx) return;
    
    // Group verifications by project and time
    const projectGroups = {};
    verificationsData.forEach(v => {
        if (!projectGroups[v.projectId]) {
            projectGroups[v.projectId] = [];
        }
        const date = new Date(v.timestamp);
        projectGroups[v.projectId].push({
            x: date.toISOString().split('T')[0], // Format as YYYY-MM-DD
            y: v.vct
        });
    });
    
    // Sort by timestamp
    Object.keys(projectGroups).forEach(projectId => {
        projectGroups[projectId].sort((a, b) => new Date(a.x) - new Date(b.x));
    });
    
    const datasets = Object.keys(projectGroups).map((projectId, index) => {
        const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
        return {
            label: projectId,
            data: projectGroups[projectId],
            borderColor: colors[index % colors.length],
            backgroundColor: colors[index % colors.length] + '40',
            tension: 0.4,
            fill: false
        };
    });
    
    if (vctChart) {
        vctChart.destroy();
    }
    
    vctChart = new Chart(ctx, {
        type: 'line',
        data: {
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        color: '#a0aec0',
                        font: {
                            size: 12
                        }
                    }
                },
                title: {
                    display: false
                }
            },
            scales: {
                x: {
                    ticks: {
                        color: '#a0aec0',
                        maxRotation: 45,
                        minRotation: 45
                    },
                    grid: {
                        color: '#2d3748'
                    }
                },
                y: {
                    ticks: {
                        color: '#a0aec0',
                        callback: function(value) {
                            return value.toLocaleString();
                        }
                    },
                    grid: {
                        color: '#2d3748'
                    }
                }
            }
        }
    });
}

function updateConfidenceChart() {
    const ctx = document.getElementById('confidence-chart');
    if (!ctx) return;
    
    // Group by time period (monthly)
    const monthlyData = {};
    verificationsData.forEach(v => {
        const date = new Date(v.timestamp);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        
        if (!monthlyData[monthKey]) {
            monthlyData[monthKey] = [];
        }
        monthlyData[monthKey].push(v.confidence);
    });
    
    const labels = Object.keys(monthlyData).sort();
    const data = labels.map(key => {
        const values = monthlyData[key];
        return values.reduce((sum, v) => sum + v, 0) / values.length;
    });
    
    if (confidenceChart) {
        confidenceChart.destroy();
    }
    
    confidenceChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Average Confidence (%)',
                data: data,
                backgroundColor: '#10b981',
                borderColor: '#10b981',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                x: {
                    ticks: {
                        color: '#a0aec0'
                    },
                    grid: {
                        color: '#2d3748'
                    }
                },
                y: {
                    beginAtZero: false,
                    min: 90,
                    max: 100,
                    ticks: {
                        color: '#a0aec0',
                        callback: function(value) {
                            return value + '%';
                        }
                    },
                    grid: {
                        color: '#2d3748'
                    }
                }
            }
        }
    });
}

// Load a project (for future implementation)
function loadProject(projectId) {
    alert(`Loading project ${projectId} - Feature coming soon!`);
    // This would switch to project view and load the project data
}

// Refresh dashboard
function refreshDashboard() {
    loadDashboardData();
}

// Initialize dashboard when view is shown
window.refreshDashboard = refreshDashboard;

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        // Wait for Firebase to be ready
        if (window.firebaseConfig && window.firebaseConfig.isInitialized()) {
            loadDashboardData();
        } else {
            setTimeout(() => {
                if (window.firebaseConfig && window.firebaseConfig.isInitialized()) {
                    loadDashboardData();
                } else {
                    loadDemoData();
                }
            }, 1000);
        }
    });
} else {
    // DOM already loaded
    if (window.firebaseConfig && window.firebaseConfig.isInitialized()) {
        loadDashboardData();
    } else {
        setTimeout(() => {
            if (window.firebaseConfig && window.firebaseConfig.isInitialized()) {
                loadDashboardData();
            } else {
                loadDemoData();
            }
        }, 1000);
    }
}

// Make loadProject available globally
window.loadProject = loadProject;

