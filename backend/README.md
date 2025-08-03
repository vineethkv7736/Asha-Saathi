# Infant Health Assessment API

A comprehensive AI-powered health assessment API for infants using Azure OpenAI and Azure Video Indexer. This API provides multiple endpoints for analyzing various aspects of infant health through image and video analysis.

## 🚀 Features

- **Skin Condition Assessment**: Analyze infant skin conditions from images
- **Facial Dysmorphology Analysis**: Detect potential genetic conditions from facial features
- **Posture Analysis**: Identify spine, head, and postural abnormalities
- **Video Health Analysis**: Analyze videos for eye/vision, neurological, and breathing issues
- **Medical Device Reading Extraction**: Extract readings from medical device photos

## 🛠️ Technology Stack

- **FastAPI**: Modern web framework for building APIs
- **Azure OpenAI**: GPT-4o model for AI-powered analysis
- **Azure Video Indexer**: Video processing and analysis
- **PIL (Pillow)**: Image processing
- **OpenCV**: Computer vision capabilities
- **Pydantic**: Data validation and serialization

## 📋 Prerequisites

Before running this API, ensure you have:

1. **Azure OpenAI Account** with API key
2. **Azure Video Indexer Account** (for video analysis features)
3. **Python 3.8+** installed
4. **Required environment variables** configured

## 🔧 Environment Setup

Create a `.env` file in the project root with the following variables:

```env
# Azure OpenAI Configuration
AZURE_OPENAI_ENDPOINT=https://eastus.api.cognitive.microsoft.com/
AZURE_OPENAI_API_KEY=your-azure-openai-api-key-here
AZURE_OPENAI_MODEL=gpt-4o
AZURE_OPENAI_DEPLOYMENT=gpt-4o
AZURE_OPENAI_API_VERSION=2024-12-01-preview

# Azure Video Indexer Configuration
AZURE_VIDEO_INDEXER_KEY=your-video-indexer-key
AZURE_VIDEO_INDEXER_LOCATION=trial
AZURE_VIDEO_INDEXER_ACCOUNT_ID=your-account-id

# Server Configuration
HOST=0.0.0.0
PORT=8000
DEBUG=False
```

## 📦 Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd skin
   ```

2. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Run the API**:
   ```bash
   # Option 1: Direct startup
   python main.py
   
   # Option 2: Using the startup script (recommended)
   python start_server.py
   
   # Option 3: Using uvicorn directly
   uvicorn main:app --host 0.0.0.0 --port 8000 --reload
   ```

The API will be available at `http://localhost:8000`

## 📚 API Endpoints

### 1. Health Check Endpoints

#### `GET /`
**Purpose**: Root endpoint to verify API is running

**Response**:
```json
{
  "message": "Infant Health Assessment API",
  "status": "running"
}
```

#### `GET /health`
**Purpose**: Health check endpoint

**Response**:
```json
{
  "status": "healthy",
  "service": "health-assessment-api"
}
```

#### `GET /config`
**Purpose**: Get current API configuration (without sensitive data)

**Response**:
```json
{
  "azure_endpoint": "https://eastus.api.cognitive.microsoft.com/",
  "model": "gpt-4o",
  "deployment": "gpt-4o",
  "api_version": "2024-12-01-preview",
  "api_key_configured": true,
  "video_indexer_configured": true,
  "video_indexer_location": "trial",
  "server_host": "0.0.0.0",
  "server_port": 8000,
  "debug_mode": false
}
```

### 2. Skin Condition Assessment

#### `POST /assess-skin`
**Purpose**: Analyze infant skin conditions from uploaded images

**Request**:
- **Method**: POST
- **Content-Type**: multipart/form-data
- **Body**: Image file (JPEG, PNG, etc.)

**Response Model**:
```json
{
  "condition": "string",           // Identified skin condition
  "confidence": 0.85,              // Confidence level (0-1)
  "description": "string",         // Detailed observation
  "recommendations": ["string"],   // List of recommendations
  "severity": "mild"               // mild/moderate/severe
}
```

**Example Response**:
```json
{
  "condition": "Diaper rash",
  "confidence": 0.92,
  "description": "Red, irritated skin in the diaper area with small raised bumps",
  "recommendations": [
    "Change diapers frequently",
    "Use barrier cream",
    "Consult pediatrician if symptoms persist"
  ],
  "severity": "moderate"
}
```

### 3. Facial Dysmorphology Analysis

#### `POST /analyze-facial-dysmorphology`
**Purpose**: Analyze facial features for potential genetic conditions

**Request**:
- **Method**: POST
- **Content-Type**: multipart/form-data
- **Body**: Image file

**Response Model**:
```json
{
  "genetic_condition": "string",     // Specific condition name or "No specific genetic condition detected"
  "confidence": 0.85,                // Confidence level (0-1)
  "facial_features": ["string"],     // Observed facial features
  "description": "string",           // Detailed analysis
  "recommendations": ["string"],     // Recommendations
  "urgency_level": "moderate",       // low/moderate/high/critical
  "risk_factors": ["string"]         // Risk factors
}
```

**Example Response**:
```json
{
  "genetic_condition": "No specific genetic condition detected",
  "confidence": 0.88,
  "facial_features": [
    "Normal facial proportions",
    "Symmetrical features",
    "Age-appropriate development"
  ],
  "description": "Facial features appear within normal developmental ranges",
  "recommendations": [
    "Continue regular pediatric checkups",
    "Monitor developmental milestones"
  ],
  "urgency_level": "low",
  "risk_factors": ["None identified"]
}
```

### 4. Posture Analysis

#### `POST /analyze-posture`
**Purpose**: Analyze posture and detect spine, head, or postural abnormalities

**Request**:
- **Method**: POST
- **Content-Type**: multipart/form-data
- **Body**: Image file

**Response Model**:
```json
{
  "posture_condition": "string",     // Identified condition or "Normal posture"
  "confidence": 0.85,                // Confidence level (0-1)
  "abnormalities": ["string"],       // Specific abnormalities
  "description": "string",           // Detailed analysis
  "recommendations": ["string"],     // Recommendations
  "severity": "mild",                // mild/moderate/severe
  "risk_factors": ["string"],        // Risk factors
  "body_regions": ["string"]         // Affected body regions
}
```

**Example Response**:
```json
{
  "posture_condition": "Mild head tilt",
  "confidence": 0.78,
  "abnormalities": [
    "Slight head tilt to the right",
    "Mild shoulder asymmetry"
  ],
  "description": "Observed slight head tilt with minimal shoulder asymmetry",
  "recommendations": [
    "Consult pediatrician for evaluation",
    "Monitor for progression",
    "Consider physical therapy if persistent"
  ],
  "severity": "mild",
  "risk_factors": ["Possible torticollis"],
  "body_regions": ["Head", "Neck", "Shoulders"]
}
```

### 5. Video Health Analysis

#### `POST /analyze-video-health`
**Purpose**: Analyze videos for eye/vision issues, neurological issues, and breathing difficulties

**Request**:
- **Method**: POST
- **Content-Type**: multipart/form-data
- **Body**: Video file

**Response Model**:
```json
{
  "analysis_type": "video_health_analysis",
  "detected_issues": ["string"],     // Issues detected
  "confidence": 0.85,                // Confidence level (0-1)
  "description": "string",           // Detailed analysis
  "recommendations": ["string"],     // Recommendations
  "severity": "mild",                // mild/moderate/severe/critical
  "video_insights": {                // Video analysis data
    "duration": 30.5,
    "faces": [...],
    "emotions": [...],
    "motion": [...],
    "audio": {...},
    "transcript": [...]
  },
  "processing_time": 45.2            // Processing time in seconds
}
```

**Example Response**:
```json
{
  "analysis_type": "video_health_analysis",
  "detected_issues": [
    "Normal eye movements",
    "Regular breathing pattern",
    "Age-appropriate motor activity"
  ],
  "confidence": 0.91,
  "description": "Video analysis shows normal developmental patterns with no concerning neurological or respiratory issues",
  "recommendations": [
    "Continue regular pediatric monitoring",
    "Maintain current care routine"
  ],
  "severity": "mild",
  "video_insights": {
    "duration": 45.2,
    "faces": [{"id": 1, "confidence": 0.95}],
    "emotions": [{"happiness": 0.8}],
    "motion": [{"activity": "normal"}],
    "audio": {"speech": "detected"},
    "transcript": ["baby sounds"]
  },
  "processing_time": 67.3
}
```

### 6. Medical Device Reading Extraction

#### `POST /extract-medical-readings`
**Purpose**: Extract readings from medical device photos (glucometer, blood pressure, thermometer, etc.)

**Request**:
- **Method**: POST
- **Content-Type**: multipart/form-data
- **Body**: Image file

**Response Model**:
```json
{
  "device_type": "string",           // glucometer/blood_pressure/thermometer/pulse_oximeter/weight_scale/other
  "extracted_values": {              // Extracted numerical values
    "primary_reading": "string",
    "secondary_reading": "string",
    "additional_readings": {}
  },
  "confidence": 0.95,                // Confidence level (0-1)
  "description": "string",           // Detailed description
  "recommendations": ["string"],     // Medical recommendations
  "reading_quality": "clear",        // clear/unclear/partial/error
  "units": {                         // Units for readings
    "primary_unit": "string",
    "secondary_unit": "string"
  },
  "timestamp": "string",             // Extracted timestamp or empty string
  "is_normal_range": true,           // Whether readings are normal
  "alert_level": "normal"            // normal/elevated/high/critical/low
}
```

**Example Response**:
```json
{
  "device_type": "glucometer",
  "extracted_values": {
    "primary_reading": "120",
    "secondary_reading": "",
    "additional_readings": {}
  },
  "confidence": 0.98,
  "description": "Blood glucose reading of 120 mg/dL extracted from glucometer display",
  "recommendations": [
    "Reading is within normal range",
    "Continue regular monitoring",
    "Maintain healthy diet"
  ],
  "reading_quality": "clear",
  "units": {
    "primary_unit": "mg/dL",
    "secondary_unit": ""
  },
  "timestamp": "2024-01-15 14:30",
  "is_normal_range": true,
  "alert_level": "normal"
}
```

### 7. Test Endpoints

#### `GET /test-facial-analysis`
**Purpose**: Test endpoint to verify facial analysis functionality

**Response**:
```json
{
  "status": "success",
  "message": "Test image created successfully",
  "api_key_configured": true,
  "test_image_size": 12345,
  "base64_length": 67890,
  "azure_endpoint": "https://eastus.api.cognitive.microsoft.com/",
  "model": "gpt-4o"
}
```

## 🔍 API Documentation

Once the server is running, you can access:

- **Interactive API Documentation**: `http://localhost:8000/docs`
- **Alternative Documentation**: `http://localhost:8000/redoc`
- **Health Check**: `http://localhost:8000/health`

## 📊 Normal Ranges Reference

The API uses these normal ranges for medical device readings:

- **Blood Glucose**: 70-140 mg/dL (fasting: 70-100 mg/dL)
- **Blood Pressure**: <120/80 mmHg (normal), 120-129/<80 (elevated), 130-139/80-89 (stage 1), ≥140/≥90 (stage 2)
- **Temperature**: 97-99°F (36.1-37.2°C)
- **Oxygen Saturation**: 95-100%
- **Pulse**: 60-100 bpm (adults), 80-120 bpm (children)

## ⚠️ Important Notes

1. **Medical Disclaimer**: This API is for educational and screening purposes only. Always consult healthcare professionals for medical decisions.

2. **Data Privacy**: Ensure proper data handling and privacy measures when using this API with real patient data.

3. **API Limits**: Be aware of Azure OpenAI and Video Indexer rate limits and costs.

4. **Image Quality**: Higher quality images generally provide better analysis results.

5. **Video Processing**: Video analysis may take several minutes depending on video length and complexity.

## 🐛 Troubleshooting

### Common Issues:

1. **Azure OpenAI API Key Error**:
   - Ensure `AZURE_OPENAI_API_KEY` is set correctly in `.env`
   - Verify the API key has proper permissions

2. **Video Indexer Errors**:
   - Check `AZURE_VIDEO_INDEXER_KEY` and `AZURE_VIDEO_INDEXER_ACCOUNT_ID`
   - Ensure Video Indexer account is active

3. **Image Processing Errors**:
   - Verify image format is supported (JPEG, PNG, etc.)
   - Check image file size (should be reasonable)

4. **Validation Errors**:
   - Ensure all required fields are provided
   - Check data types match expected formats

## 📝 License

[Add your license information here]

## 🤝 Contributing

[Add contribution guidelines here]

---

**For support or questions, please refer to the API documentation at `http://localhost:8000/docs`** 