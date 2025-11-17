# Carbon Verification Engine (CVE) - Hybrid MRV Platform

A web-based platform for reducing the cost of Measurement, Reporting, and Verification (MRV) for nature-based carbon projects by over 90% while increasing scientific confidence.

## Features

### 1. Project & Boundary Management
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

## Usage

1. Open `index.html` in a modern web browser
2. Draw a polygon on the map to define your project boundary
3. Fill in the project details form
4. Click "Create Project" to initialize
5. Toggle MRV layers to visualize different data layers
6. Click "Run Sampling Optimization" to generate sampling points
7. Enter carbon readings for each sampling point
8. Click "Run Final Verification" to get VCT and confidence score

## Technical Stack

- **HTML5/CSS3**: Structure and styling
- **JavaScript (Vanilla)**: Application logic
- **Leaflet.js**: Interactive map functionality
- **Leaflet Draw**: Polygon drawing tools

## Browser Compatibility

Works in all modern browsers that support ES6 JavaScript and Leaflet.js.

## Notes

This is a demo/prototype application. In production, it would integrate with:
- Real satellite imagery APIs
- Machine learning models for carbon prediction
- Actual uncertainty calculations
- Database for project storage
- Authentication and user management
