# Carbon Verification Engine (CVE) - Hybrid MRV Platform

A web-based platform for reducing the cost of Measurement, Reporting, and Verification (MRV) for nature-based carbon projects by over 90% while increasing scientific confidence.

## Features

### 1. Project & Boundary Management
- **Address Search**: Search for addresses or locations using the search bar in the top-right corner of the map
- Draw polygon boundaries directly on the map
- Input project details (Land Use Type, Start Date, Practices, Area)
- Automatic project ID generation

### 2. Hybrid MRV Engine Visualization
- **Remote Sensing Layer**: Biomass/Vegetation Index visualization
- **AI Model Prediction Layer**: Predicted carbon sequestration rate
- **Uncertainty Map**: Model confidence heatmap showing sampling priority areas

### 3. Optimized Ground-Truthing Planner
- Generate minimal set of sampling points based on uncertainty map
- Calculate cost reduction compared to traditional methods
- Visual sampling point markers on map

### 4. Verification & Reporting
- Input ground truth data for each sampling point
- Calculate final Verified Carbon Tonnes (VCT)
- Display Scientific Confidence Score
- Verification status reporting
- **Automatic persistence**: All verifications are saved to Firebase

### 5. Performance Dashboard
- **Project List**: View all saved projects with verification counts
- **Summary Metrics**: 
  - Total VCT Issued
  - Total Samples Taken
  - Efficiency Metric (VCT per Sample)
  - Average Confidence Score
- **VCT Over Time Chart**: Line graph showing carbon credit generation trends
- **Confidence Trend Chart**: Bar chart showing confidence scores over time
- Real-time updates from Firebase

## Usage

1. Open `index.html` in a modern web browser
2. **Optional**: Use the search bar to find and navigate to a specific address or location
3. Draw a polygon on the map to define your project boundary
4. Fill in the project details form
5. Click "Create Project" to initialize
6. Toggle MRV layers to visualize different data layers
7. Click "Run Sampling Optimization" to generate sampling points
8. Enter carbon readings for each sampling point
9. Click "Run Final Verification" to get VCT and confidence score

## Technical Stack

- **HTML5/CSS3**: Structure and styling
- **JavaScript (Vanilla)**: Application logic
- **Leaflet.js**: Interactive map functionality
- **Leaflet Draw**: Polygon drawing tools
- **Nominatim (OpenStreetMap)**: Address geocoding service for location search
- **Firebase**: Backend services (Firestore for data, Auth for authentication)
- **Chart.js**: Data visualization for analytics dashboard

## Browser Compatibility

Works in all modern browsers that support ES6 JavaScript and Leaflet.js.

## Backend & Persistence

The application uses Firebase Firestore for data persistence:

### Data Collections

1. **Projects**: `/artifacts/{appId}/users/{userId}/projects`
   - Stores project data (boundary, land use, practices, area)
   - Allows users to save and return to unfinished projects

2. **Verifications**: `/artifacts/{appId}/users/{userId}/verifications`
   - Stores completed verification records
   - Includes VCT, confidence score, timestamp, and sample data
   - Used for analytics and historical tracking

### Authentication

- Uses Firebase Auth with custom token authentication
- Supports `__initial_auth_token` for Canvas environment integration
- Falls back to demo mode if Firebase is not configured

### Configuration

To use Firebase, update `firebase-config.js` with your Firebase project credentials:
- API Key
- Auth Domain
- Project ID
- Storage Bucket
- Messaging Sender ID
- App ID

## Notes

This is a demo/prototype application. In production, it would integrate with:
- Real satellite imagery APIs
- Machine learning models for carbon prediction
- Actual uncertainty calculations
- Enhanced authentication and user management
- Additional analytics and reporting features
