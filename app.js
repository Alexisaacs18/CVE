// Global state
let map;
let drawnItems;
let drawControl;
let projectData = null;
let currentLayers = {
    remoteSensing: null,
    aiPrediction: null,
    uncertainty: null
};
let searchMarker = null;
let searchTimeout = null;

// Initialize map
function initMap() {
    // Create map centered on a sample location (can be changed)
    map = L.map('map', {
        center: [34.05, -118.25],
        zoom: 13,
        zoomControl: true
    });

    // Add base tile layer (using OpenStreetMap)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
    }).addTo(map);

    // Initialize feature group for drawn items
    drawnItems = new L.FeatureGroup();
    map.addLayer(drawnItems);

    // Initialize draw control
    drawControl = new L.Control.Draw({
        draw: {
            polygon: {
                allowIntersection: false,
                showArea: true
            },
            polyline: false,
            rectangle: false,
            circle: false,
            circlemarker: false,
            marker: false
        },
        edit: {
            featureGroup: drawnItems,
            remove: true
        }
    });

    map.addControl(drawControl);

    // Handle drawing events
    map.on(L.Draw.Event.CREATED, function(e) {
        const layer = e.layer;
        drawnItems.addLayer(layer);
        
        // Enable create project button if form is filled
        checkFormComplete();
        
        // Show legend
        document.getElementById('map-legend').style.display = 'block';
    });

    map.on(L.Draw.Event.DELETED, function(e) {
        if (drawnItems.getLayers().length === 0) {
            document.getElementById('map-legend').style.display = 'none';
            document.getElementById('create-project-btn').disabled = true;
        }
    });

    map.on(L.Draw.Event.EDITED, function(e) {
        checkFormComplete();
    });
}

// Check if form is complete
function checkFormComplete() {
    const landUse = document.getElementById('land-use').value;
    const projectDate = document.getElementById('project-date').value;
    const practices = document.getElementById('practices').value;
    const areaHa = document.getElementById('area-ha').value;
    const hasPolygon = drawnItems.getLayers().length > 0;

    const btn = document.getElementById('create-project-btn');
    if (landUse && projectDate && practices && areaHa && hasPolygon) {
        btn.disabled = false;
    } else {
        btn.disabled = true;
    }
}

// Generate mock data for project
function generateMockData(projectData) {
    const area = parseFloat(projectData.area_ha);
    
    // Generate mock baseline prediction
    const baseline = Math.round(area * 1.2 + Math.random() * area * 0.3);
    
    // Generate mock sampling points (5-10 points based on area)
    const numPoints = Math.min(Math.max(Math.ceil(area / 200), 5), 10);
    const samplingPoints = [];
    
    // Get polygon bounds for generating points
    const polygon = drawnItems.getLayers()[0];
    const bounds = polygon.getBounds();
    const center = bounds.getCenter();
    
    for (let i = 0; i < numPoints; i++) {
        // Generate points within bounds with some randomness
        const lat = center.lat + (Math.random() - 0.5) * (bounds.getNorth() - bounds.getSouth()) * 0.8;
        const lng = center.lng + (Math.random() - 0.5) * (bounds.getEast() - bounds.getWest()) * 0.8;
        
        samplingPoints.push({
            id: `S-${String(i + 1).padStart(2, '0')}`,
            lat: lat,
            lng: lng,
            required_reading: (1.2 + Math.random() * 0.8).toFixed(2)
        });
    }
    
    return {
        model_prediction_tco2e_yr: baseline,
        optimized_sampling_points: samplingPoints
    };
}

// Create project
async function createProject() {
    const landUse = document.getElementById('land-use').value;
    const projectDate = document.getElementById('project-date').value;
    const practices = document.getElementById('practices').value;
    const areaHa = parseFloat(document.getElementById('area-ha').value);
    
    if (!drawnItems.getLayers().length) {
        alert('Please draw a polygon on the map first!');
        return;
    }
    
    const polygon = drawnItems.getLayers()[0];
    const geoJson = polygon.toGeoJSON();
    
    // Create project data
    projectData = {
        projectId: `CVE-${landUse.toUpperCase()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`,
        landUse: landUse,
        area_ha: areaHa,
        projectDate: projectDate,
        practices: practices,
        geometry: geoJson,
        createdAt: new Date().toISOString()
    };
    
    // Generate mock data
    const mockData = generateMockData(projectData);
    projectData = { ...projectData, ...mockData };
    
    // Save to Firebase
    await saveProject(projectData);
    
    // Update UI
    document.getElementById('project-id').textContent = projectData.projectId;
    document.getElementById('project-area').textContent = `${areaHa} ha`;
    document.getElementById('baseline').textContent = `${projectData.model_prediction_tco2e_yr} tCO₂e/yr`;
    document.getElementById('project-info').style.display = 'block';
    
    // Show other panels
    document.getElementById('layers-panel').style.display = 'block';
    document.getElementById('optimization-panel').style.display = 'block';
    
    // Fit map to polygon
    map.fitBounds(polygon.getBounds());
    
    // Disable draw control
    map.removeControl(drawControl);
}

// Toggle layers
function toggleLayer(layerName, enabled) {
    // Remove existing layer if any
    if (currentLayers[layerName]) {
        map.removeLayer(currentLayers[layerName]);
        currentLayers[layerName] = null;
    }
    
    if (!enabled || !projectData) return;
    
    const polygon = drawnItems.getLayers()[0];
    const bounds = polygon.getBounds();
    
    switch(layerName) {
        case 'remoteSensing':
            // Create biomass/vegetation index layer (simulated with colored overlay)
            currentLayers.remoteSensing = L.rectangle(bounds, {
                color: '#10b981',
                fillColor: '#10b981',
                fillOpacity: 0.3,
                weight: 2
            }).addTo(map);
            break;
            
        case 'aiPrediction':
            // Create AI prediction layer (simulated with gradient)
            currentLayers.aiPrediction = L.rectangle(bounds, {
                color: '#3b82f6',
                fillColor: '#3b82f6',
                fillOpacity: 0.4,
                weight: 2
            }).addTo(map);
            break;
            
        case 'uncertainty':
            // Create uncertainty heatmap (simulated)
            // In a real implementation, this would be a proper heatmap layer
            const uncertaintyLayer = L.rectangle(bounds, {
                color: '#f59e0b',
                fillColor: '#f59e0b',
                fillOpacity: 0.5,
                weight: 2
            }).addTo(map);
            
            // Add some random "hot spots" for uncertainty
            const numHotSpots = 3;
            for (let i = 0; i < numHotSpots; i++) {
                const lat = bounds.getSouth() + Math.random() * (bounds.getNorth() - bounds.getSouth());
                const lng = bounds.getWest() + Math.random() * (bounds.getEast() - bounds.getWest());
                
                L.circleMarker([lat, lng], {
                    radius: 15,
                    color: '#f97316',
                    fillColor: '#f97316',
                    fillOpacity: 0.8,
                    weight: 2
                }).addTo(map);
            }
            
            currentLayers.uncertainty = uncertaintyLayer;
            break;
    }
}

// Run optimization
function runOptimization() {
    if (!projectData) {
        alert('Please create a project first!');
        return;
    }
    
    const traditionalSamples = Math.ceil(projectData.area_ha / 8); // 1 sample per 8 hectares
    const optimizedCount = projectData.optimized_sampling_points.length;
    const reduction = ((1 - optimizedCount / traditionalSamples) * 100).toFixed(1);
    
    // Update UI
    document.getElementById('traditional-samples').textContent = traditionalSamples;
    document.getElementById('optimized-samples').textContent = optimizedCount;
    document.getElementById('cost-reduction').textContent = `${reduction}%`;
    document.getElementById('optimization-results').style.display = 'block';
    
    // Add sampling points to map
    projectData.optimized_sampling_points.forEach(point => {
        const marker = L.marker([point.lat, point.lng], {
            icon: L.divIcon({
                className: 'sampling-marker',
                html: `<div style="background: #3b82f6; color: white; border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 12px; border: 2px solid white;">${point.id}</div>`,
                iconSize: [30, 30],
                iconAnchor: [15, 15]
            })
        }).addTo(map);
        
        marker.bindPopup(`<strong>${point.id}</strong><br>Required: ${point.required_reading} tCO₂e/ha`);
    });
    
    // Show verification panel
    document.getElementById('verification-panel').style.display = 'block';
    
    // Create sample input fields
    createSampleInputs();
}

// Create sample input fields
function createSampleInputs() {
    const container = document.getElementById('sample-inputs');
    container.innerHTML = '';
    
    projectData.optimized_sampling_points.forEach(point => {
        const group = document.createElement('div');
        group.className = 'sample-input-group';
        group.innerHTML = `
            <label for="sample-${point.id}">${point.id} - Carbon Reading (tCO₂e/ha)</label>
            <input 
                type="number" 
                id="sample-${point.id}" 
                step="0.01" 
                placeholder="${point.required_reading}"
                onchange="updateSampleInput('${point.id}', this.value)"
            />
        `;
        container.appendChild(group);
    });
    
    checkSampleInputsComplete();
}

// Update sample input
function updateSampleInput(pointId, value) {
    if (!projectData.sampleReadings) {
        projectData.sampleReadings = {};
    }
    projectData.sampleReadings[pointId] = parseFloat(value) || 0;
    checkSampleInputsComplete();
}

// Check if all samples are entered
function checkSampleInputsComplete() {
    const allEntered = projectData.optimized_sampling_points.every(point => {
        const input = document.getElementById(`sample-${point.id}`);
        return input && input.value !== '';
    });
    
    document.getElementById('verify-btn').disabled = !allEntered;
}

// Run verification
async function runVerification() {
    if (!projectData || !projectData.optimized_sampling_points) {
        alert('Please run optimization first!');
        return;
    }
    
    // Collect all readings
    const readings = projectData.optimized_sampling_points.map(point => {
        const input = document.getElementById(`sample-${point.id}`);
        return parseFloat(input.value) || parseFloat(point.required_reading);
    });
    
    // Calculate average
    const avgReading = readings.reduce((sum, val) => sum + val, 0) / readings.length;
    
    // Calculate VCT (simplified calculation)
    const vct = Math.round(avgReading * projectData.area_ha * 0.85);
    
    // Calculate confidence (simulated)
    const confidence = parseFloat((95 + Math.random() * 3).toFixed(1));
    
    // Update UI
    document.getElementById('vct-value').textContent = `${vct.toLocaleString()} VCT`;
    document.getElementById('confidence-value').textContent = `${confidence}%`;
    document.getElementById('status-value').textContent = 'Verified & Ready to Mint';
    document.getElementById('verification-results').style.display = 'block';
    
    // Save verification to Firebase
    await saveVerification({
        projectId: projectData.projectId,
        vct: vct,
        confidence: confidence,
        timestamp: new Date().toISOString(),
        sampleCount: projectData.optimized_sampling_points.length,
        readings: readings
    });
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    initMap();
    
    // Form change listeners
    document.getElementById('land-use').addEventListener('change', checkFormComplete);
    document.getElementById('project-date').addEventListener('change', checkFormComplete);
    document.getElementById('practices').addEventListener('change', checkFormComplete);
    document.getElementById('area-ha').addEventListener('input', checkFormComplete);
    
    // Create project button
    document.getElementById('create-project-btn').addEventListener('click', createProject);
    
    // Layer toggles
    document.getElementById('layer-remote').addEventListener('change', function(e) {
        toggleLayer('remoteSensing', e.target.checked);
    });
    
    document.getElementById('layer-ai').addEventListener('change', function(e) {
        toggleLayer('aiPrediction', e.target.checked);
    });
    
    document.getElementById('layer-uncertainty').addEventListener('change', function(e) {
        toggleLayer('uncertainty', e.target.checked);
    });
    
    // Optimization button
    document.getElementById('optimize-btn').addEventListener('click', runOptimization);
    
    // Verification button
    document.getElementById('verify-btn').addEventListener('click', runVerification);
    
    // Search functionality
    const searchInput = document.getElementById('address-search');
    const searchBtn = document.getElementById('search-btn');
    
    // Search on button click
    searchBtn.addEventListener('click', function() {
        const query = searchInput.value.trim();
        if (query) {
            performGeocodeSearch(query);
        }
    });
    
    // Search on Enter key
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            const query = searchInput.value.trim();
            if (query) {
                performGeocodeSearch(query);
            }
        }
    });
    
    // Search as user types (debounced)
    searchInput.addEventListener('input', function() {
        const query = searchInput.value.trim();
        searchAddress(query);
    });
    
    // Hide results when clicking outside
    document.addEventListener('click', function(e) {
        const searchContainer = document.querySelector('.search-container');
        if (!searchContainer.contains(e.target)) {
            hideSearchResults();
        }
    });
    
    // Navigation tabs
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.addEventListener('click', function() {
            const view = this.dataset.view;
            switchView(view);
        });
    });
    
    // Initialize storage backend
    if (window.localStorageBackend) {
        console.log('✅ Storage backend ready');
    }
});

// Geocoding functions
function searchAddress(query) {
    if (!query || query.trim().length < 3) {
        hideSearchResults();
        return;
    }
    
    const resultsContainer = document.getElementById('search-results');
    resultsContainer.innerHTML = '<div class="search-loading">Searching...</div>';
    resultsContainer.classList.add('active');
    
    // Clear previous timeout
    if (searchTimeout) {
        clearTimeout(searchTimeout);
    }
    
    // Debounce search requests
    searchTimeout = setTimeout(() => {
        performGeocodeSearch(query);
    }, 500);
}

function performGeocodeSearch(query) {
    const resultsContainer = document.getElementById('search-results');
    
    // Use Nominatim (OpenStreetMap's geocoding service)
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`;
    
    fetch(url, {
        headers: {
            'User-Agent': 'Carbon Verification Engine'
        }
    })
    .then(response => response.json())
    .then(data => {
        displaySearchResults(data);
    })
    .catch(error => {
        console.error('Geocoding error:', error);
        resultsContainer.innerHTML = '<div class="search-no-results">Error searching. Please try again.</div>';
    });
}

function displaySearchResults(results) {
    const resultsContainer = document.getElementById('search-results');
    
    if (!results || results.length === 0) {
        resultsContainer.innerHTML = '<div class="search-no-results">No results found</div>';
        return;
    }
    
    resultsContainer.innerHTML = results.map((result, index) => {
        const displayName = result.display_name;
        const address = result.address || {};
        const shortName = address.road || address.city || address.county || displayName.split(',')[0];
        
        return `
            <div class="search-result-item" data-index="${index}" data-lat="${result.lat}" data-lng="${result.lon}" data-name="${displayName.replace(/"/g, '&quot;')}">
                <div class="search-result-name">${shortName}</div>
                <div class="search-result-address">${displayName}</div>
            </div>
        `;
    }).join('');
    
    // Add click handlers to results
    resultsContainer.querySelectorAll('.search-result-item').forEach(item => {
        item.addEventListener('click', function() {
            const lat = parseFloat(this.dataset.lat);
            const lng = parseFloat(this.dataset.lng);
            const name = this.dataset.name;
            goToLocation(lat, lng, name);
        });
    });
}

function goToLocation(lat, lng, name) {
    // Remove previous marker
    if (searchMarker) {
        map.removeLayer(searchMarker);
    }
    
    // Add new marker
    searchMarker = L.marker([lat, lng], {
        icon: L.divIcon({
            className: 'search-marker',
            html: `<div style="background: #3b82f6; color: white; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 12px; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">📍</div>`,
            iconSize: [24, 24],
            iconAnchor: [12, 12]
        })
    }).addTo(map);
    
    // Bind popup
    if (name) {
        searchMarker.bindPopup(`<strong>${name}</strong>`).openPopup();
    }
    
    // Zoom to location
    map.setView([lat, lng], 15, {
        animate: true,
        duration: 0.5
    });
    
    // Hide search results
    hideSearchResults();
    
    // Clear search input
    document.getElementById('address-search').value = '';
}

function hideSearchResults() {
    const resultsContainer = document.getElementById('search-results');
    resultsContainer.classList.remove('active');
    resultsContainer.innerHTML = '';
}

// Storage Operations (using localStorage backend)
async function saveProject(projectData) {
    try {
        if (window.localStorageBackend) {
            await window.localStorageBackend.projects.save(projectData);
            // Trigger update event
            window.dispatchEvent(new Event('projectsUpdated'));
        } else {
            console.log('⚠️ Storage backend not available');
        }
    } catch (error) {
        console.error('Error saving project:', error);
    }
}

async function saveVerification(verificationData) {
    try {
        if (window.localStorageBackend) {
            const verificationId = `verification-${Date.now()}`;
            await window.localStorageBackend.verifications.save({
                ...verificationData,
                id: verificationId
            });
        } else {
            console.log('⚠️ Storage backend not available');
        }
    } catch (error) {
        console.error('Error saving verification:', error);
    }
}

// Navigation functions
function switchView(viewName) {
    // Hide all views
    document.querySelectorAll('.view-container').forEach(view => {
        view.classList.remove('active');
    });
    
    // Show selected view
    const targetView = document.getElementById(`${viewName}-view`);
    if (targetView) {
        targetView.classList.add('active');
    }
    
    // Update nav tabs
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    const activeTab = document.querySelector(`[data-view="${viewName}"]`);
    if (activeTab) {
        activeTab.classList.add('active');
    }
    
    // Refresh dashboard if switching to performance view
    if (viewName === 'performance' && window.refreshDashboard) {
        window.refreshDashboard();
    }
}

// Make functions globally available for inline handlers
window.updateSampleInput = updateSampleInput;
window.switchView = switchView;

