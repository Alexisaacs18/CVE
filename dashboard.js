// Performance Dashboard
let projectsData = [];
let verificationsData = [];
let vctChart = null;
let confidenceChart = null;

// Load data from localStorage backend
async function loadDashboardData() {
    if (!window.localStorageBackend) {
        console.log('Storage backend not available, using demo data');
        loadDemoData();
        return;
    }
    
    try {
        const userId = window.localStorageBackend.getUserId();
        
        // Load projects with subscription (real-time updates)
        const unsubscribeProjects = window.localStorageBackend.projects.subscribe((data) => {
            projectsData = data.map(p => ({ id: p.projectId, ...p }));
            updateProjectsTable();
            updateMetrics();
        }, userId);
        
        // Store unsubscribe function for cleanup
        window._unsubscribeProjects = unsubscribeProjects;
        
        // Load verifications with subscription (real-time updates)
        const unsubscribeVerifications = window.localStorageBackend.verifications.subscribe((data) => {
            verificationsData = data.map(v => ({ id: v.id, ...v }));
            updateCharts();
            updateMetrics();
        }, userId, { orderBy: 'timestamp', orderDirection: 'desc' });
        
        // Store unsubscribe function for cleanup
        window._unsubscribeVerifications = unsubscribeVerifications;
        
        // If no data exists, load demo data
        if (projectsData.length === 0 && verificationsData.length === 0) {
            loadDemoData();
        }
        
    } catch (error) {
        console.error('Error loading dashboard data:', error);
        loadDemoData();
    }
}

// Demo data for when Firebase is not available
function loadDemoData() {
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;
    const oneMonth = 30 * oneDay;
    const oneYear = 365 * oneDay;
    
    // Generate realistic projects with varied dates
    projectsData = [
        {
            id: 'CVE-CROPLAND-001',
            projectId: 'CVE-CROPLAND-001',
            landUse: 'Cropland',
            area_ha: 1250,
            practices: 'No-Till',
            projectDate: '2022-01-15',
            createdAt: new Date(now - 18 * oneMonth).toISOString()
        },
        {
            id: 'CVE-FOREST-002',
            projectId: 'CVE-FOREST-002',
            landUse: 'Forest',
            area_ha: 3200,
            practices: 'Afforestation',
            projectDate: '2021-06-01',
            createdAt: new Date(now - 30 * oneMonth).toISOString()
        },
        {
            id: 'CVE-RANGELAND-003',
            projectId: 'CVE-RANGELAND-003',
            landUse: 'Rangeland',
            area_ha: 850,
            practices: 'Rotational Grazing',
            projectDate: '2022-09-10',
            createdAt: new Date(now - 15 * oneMonth).toISOString()
        },
        {
            id: 'CVE-CROPLAND-004',
            projectId: 'CVE-CROPLAND-004',
            landUse: 'Cropland',
            area_ha: 2100,
            practices: 'Cover Crops',
            projectDate: '2023-03-20',
            createdAt: new Date(now - 9 * oneMonth).toISOString()
        },
        {
            id: 'CVE-WETLAND-005',
            projectId: 'CVE-WETLAND-005',
            landUse: 'Wetland',
            area_ha: 450,
            practices: 'Restoration',
            projectDate: '2022-11-05',
            createdAt: new Date(now - 13 * oneMonth).toISOString()
        },
        {
            id: 'CVE-FOREST-006',
            projectId: 'CVE-FOREST-006',
            landUse: 'Forest',
            area_ha: 5800,
            practices: 'Afforestation',
            projectDate: '2020-04-12',
            createdAt: new Date(now - 44 * oneMonth).toISOString()
        }
    ];
    
    // Generate realistic verifications with historical data
    verificationsData = [
        // CVE-CROPLAND-001 - Multiple verifications over time
        {
            id: 'verification-001',
            projectId: 'CVE-CROPLAND-001',
            vct: 1180,
            confidence: 94.8,
            timestamp: new Date(now - 12 * oneMonth).toISOString(),
            sampleCount: 8
        },
        {
            id: 'verification-002',
            projectId: 'CVE-CROPLAND-001',
            vct: 1245,
            confidence: 96.2,
            timestamp: new Date(now - 6 * oneMonth).toISOString(),
            sampleCount: 8
        },
        {
            id: 'verification-003',
            projectId: 'CVE-CROPLAND-001',
            vct: 1320,
            confidence: 97.1,
            timestamp: new Date(now - 1 * oneMonth).toISOString(),
            sampleCount: 8
        },
        
        // CVE-FOREST-002 - Annual verifications
        {
            id: 'verification-004',
            projectId: 'CVE-FOREST-002',
            vct: 2850,
            confidence: 95.3,
            timestamp: new Date(now - 24 * oneMonth).toISOString(),
            sampleCount: 12
        },
        {
            id: 'verification-005',
            projectId: 'CVE-FOREST-002',
            vct: 3120,
            confidence: 96.7,
            timestamp: new Date(now - 12 * oneMonth).toISOString(),
            sampleCount: 12
        },
        {
            id: 'verification-006',
            projectId: 'CVE-FOREST-002',
            vct: 3420,
            confidence: 97.5,
            timestamp: new Date(now - 1 * oneMonth).toISOString(),
            sampleCount: 12
        },
        
        // CVE-RANGELAND-003 - Recent project
        {
            id: 'verification-007',
            projectId: 'CVE-RANGELAND-003',
            vct: 680,
            confidence: 95.9,
            timestamp: new Date(now - 3 * oneMonth).toISOString(),
            sampleCount: 6
        },
        {
            id: 'verification-008',
            projectId: 'CVE-RANGELAND-003',
            vct: 720,
            confidence: 96.4,
            timestamp: new Date(now - 1 * oneMonth).toISOString(),
            sampleCount: 6
        },
        
        // CVE-CROPLAND-004 - Growing project
        {
            id: 'verification-009',
            projectId: 'CVE-CROPLAND-004',
            vct: 1890,
            confidence: 94.2,
            timestamp: new Date(now - 6 * oneMonth).toISOString(),
            sampleCount: 10
        },
        {
            id: 'verification-010',
            projectId: 'CVE-CROPLAND-004',
            vct: 2100,
            confidence: 95.8,
            timestamp: new Date(now - 1 * oneMonth).toISOString(),
            sampleCount: 10
        },
        
        // CVE-WETLAND-005 - Specialized project
        {
            id: 'verification-011',
            projectId: 'CVE-WETLAND-005',
            vct: 520,
            confidence: 98.1,
            timestamp: new Date(now - 9 * oneMonth).toISOString(),
            sampleCount: 5
        },
        {
            id: 'verification-012',
            projectId: 'CVE-WETLAND-005',
            vct: 580,
            confidence: 98.5,
            timestamp: new Date(now - 3 * oneMonth).toISOString(),
            sampleCount: 5
        },
        
        // CVE-FOREST-006 - Long-term project with many verifications
        {
            id: 'verification-013',
            projectId: 'CVE-FOREST-006',
            vct: 4200,
            confidence: 93.5,
            timestamp: new Date(now - 36 * oneMonth).toISOString(),
            sampleCount: 18
        },
        {
            id: 'verification-014',
            projectId: 'CVE-FOREST-006',
            vct: 4850,
            confidence: 94.8,
            timestamp: new Date(now - 24 * oneMonth).toISOString(),
            sampleCount: 18
        },
        {
            id: 'verification-015',
            projectId: 'CVE-FOREST-006',
            vct: 5520,
            confidence: 96.2,
            timestamp: new Date(now - 12 * oneMonth).toISOString(),
            sampleCount: 18
        },
        {
            id: 'verification-016',
            projectId: 'CVE-FOREST-006',
            vct: 6120,
            confidence: 97.3,
            timestamp: new Date(now - 1 * oneMonth).toISOString(),
            sampleCount: 18
        },
        
        // Additional recent verifications for better chart visualization
        {
            id: 'verification-017',
            projectId: 'CVE-CROPLAND-001',
            vct: 1380,
            confidence: 97.8,
            timestamp: new Date(now - 15 * oneDay).toISOString(),
            sampleCount: 8
        },
        {
            id: 'verification-018',
            projectId: 'CVE-FOREST-002',
            vct: 3580,
            confidence: 98.1,
            timestamp: new Date(now - 10 * oneDay).toISOString(),
            sampleCount: 12
        }
    ];
    
    // Sort verifications by timestamp (newest first)
    verificationsData.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
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
    
    // Group verifications by project and sort each project's data by timestamp
    const projectGroups = {};
    verificationsData.forEach(v => {
        if (!projectGroups[v.projectId]) {
            projectGroups[v.projectId] = [];
        }
        projectGroups[v.projectId].push({
            timestamp: v.timestamp,
            vct: v.vct
        });
    });
    
    // Sort each project's data by timestamp
    Object.keys(projectGroups).forEach(projectId => {
        projectGroups[projectId].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    });
    
    // Create datasets using x/y coordinates so each project's line connects properly
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
    const datasets = Object.keys(projectGroups).map((projectId, index) => {
        const projectData = projectGroups[projectId];
        
        return {
            label: projectId,
            data: projectData.map(item => ({
                x: new Date(item.timestamp).getTime(),
                y: item.vct
            })),
            borderColor: colors[index % colors.length],
            backgroundColor: colors[index % colors.length] + '40',
            tension: 0.4,
            fill: false,
            pointRadius: 4,
            pointHoverRadius: 6,
            pointBackgroundColor: colors[index % colors.length],
            pointBorderColor: '#ffffff',
            pointBorderWidth: 2,
            borderWidth: 2
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
            maintainAspectRatio: true,
            interaction: {
                intersect: false,
                mode: 'index'
            },
            elements: {
                line: {
                    borderJoinStyle: 'round',
                    borderCapStyle: 'round'
                },
                point: {
                    hoverRadius: 6
                }
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        color: '#a0aec0',
                        font: {
                            size: 11
                        },
                        usePointStyle: true,
                        padding: 15
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(30, 39, 66, 0.95)',
                    titleColor: '#ffffff',
                    bodyColor: '#a0aec0',
                    borderColor: '#2d3748',
                    borderWidth: 1,
                    padding: 12,
                    callbacks: {
                        title: function(context) {
                            const date = new Date(context[0].parsed.x);
                            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                        },
                        label: function(context) {
                            return context.dataset.label + ': ' + context.parsed.y.toLocaleString() + ' VCT';
                        }
                    }
                }
            },
            scales: {
                x: {
                    type: 'linear',
                    position: 'bottom',
                    ticks: {
                        color: '#a0aec0',
                        font: {
                            size: 10
                        },
                        maxRotation: 45,
                        minRotation: 45,
                        callback: function(value) {
                            const date = new Date(value);
                            return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
                        }
                    },
                    grid: {
                        color: '#2d3748',
                        drawBorder: false
                    }
                },
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: '#a0aec0',
                        font: {
                            size: 10
                        },
                        callback: function(value) {
                            return value.toLocaleString();
                        }
                    },
                    grid: {
                        color: '#2d3748',
                        drawBorder: false
                    }
                }
            }
        }
    });
}

function updateConfidenceChart() {
    const ctx = document.getElementById('confidence-chart');
    if (!ctx) return;
    
    // Sort verifications by timestamp
    const sortedVerifications = [...verificationsData].sort((a, b) => 
        new Date(a.timestamp) - new Date(b.timestamp)
    );
    
    // Get labels (formatted dates)
    const labels = sortedVerifications.map(v => {
        const date = new Date(v.timestamp);
        return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    });
    
    // Get confidence values
    const data = sortedVerifications.map(v => v.confidence);
    
    if (confidenceChart) {
        confidenceChart.destroy();
    }
    
    confidenceChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Confidence Score (%)',
                data: data,
                borderColor: '#10b981',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                borderWidth: 2,
                tension: 0.4,
                fill: true,
                pointRadius: 4,
                pointHoverRadius: 6,
                pointBackgroundColor: '#10b981',
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                intersect: false,
                mode: 'index'
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        color: '#a0aec0',
                        font: {
                            size: 11
                        },
                        usePointStyle: true,
                        padding: 15
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(30, 39, 66, 0.95)',
                    titleColor: '#ffffff',
                    bodyColor: '#a0aec0',
                    borderColor: '#2d3748',
                    borderWidth: 1,
                    padding: 12,
                    callbacks: {
                        label: function(context) {
                            return 'Confidence: ' + context.parsed.y.toFixed(1) + '%';
                        }
                    }
                }
            },
            scales: {
                x: {
                    ticks: {
                        color: '#a0aec0',
                        font: {
                            size: 10
                        },
                        maxRotation: 45,
                        minRotation: 45
                    },
                    grid: {
                        color: '#2d3748',
                        drawBorder: false
                    }
                },
                y: {
                    beginAtZero: false,
                    min: 90,
                    max: 100,
                    ticks: {
                        color: '#a0aec0',
                        font: {
                            size: 10
                        },
                        callback: function(value) {
                            return value + '%';
                        },
                        stepSize: 2
                    },
                    grid: {
                        color: '#2d3748',
                        drawBorder: false
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
        // Wait for storage backend to be ready
        if (window.localStorageBackend) {
            loadDashboardData();
        } else {
            setTimeout(() => {
                if (window.localStorageBackend) {
                    loadDashboardData();
                } else {
                    loadDemoData();
                }
            }, 100);
        }
    });
} else {
    // DOM already loaded
    if (window.localStorageBackend) {
        loadDashboardData();
    } else {
        setTimeout(() => {
            if (window.localStorageBackend) {
                loadDashboardData();
            } else {
                loadDemoData();
            }
        }, 100);
    }
}

// Make loadProject available globally
window.loadProject = loadProject;

