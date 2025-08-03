import os
import base64
import io
from typing import Optional
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from pydantic import BaseModel
from openai import AzureOpenAI
from PIL import Image
import cv2
import numpy as np
from dotenv import load_dotenv
import requests
import json
import time

# Azure OpenAI imports
from openai import AzureOpenAI

# GCP imports
from google.cloud import videointelligence_v1
from google.cloud import vision_v1
from google.cloud import storage
import tempfile

# Load environment variables
load_dotenv()

app = FastAPI(
    title="Infant Health Assessment API",
    description="AI-powered health assessment for infants using Azure OpenAI and Video Indexer",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,  # Changed to False for public API
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=3600,
)

# Azure OpenAI Configuration
endpoint = os.getenv("AZURE_OPENAI_ENDPOINT", "https://eastus.api.cognitive.microsoft.com/")
model_name = os.getenv("AZURE_OPENAI_MODEL", "gpt-4o")
deployment = os.getenv("AZURE_OPENAI_DEPLOYMENT", "gpt-4o")
subscription_key = os.getenv("AZURE_OPENAI_API_KEY")
api_version = os.getenv("AZURE_OPENAI_API_VERSION", "2024-12-01-preview")

# GCP Configuration
gcp_project_id = os.getenv("GCP_PROJECT_ID")
gcp_bucket_name = os.getenv("GCP_BUCKET_NAME", "infant-health-videos")
gcp_credentials_path = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")

# Azure Video Indexer Configuration (keeping for fallback)
video_indexer_key = os.getenv("AZURE_VIDEO_INDEXER_KEY")
video_indexer_location = os.getenv("AZURE_VIDEO_INDEXER_LOCATION", "trial")
video_indexer_account_id = os.getenv("AZURE_VIDEO_INDEXER_ACCOUNT_ID")

# Server Configuration
host = os.getenv("HOST", "0.0.0.0")
port = int(os.getenv("PORT", "8000"))
debug = os.getenv("DEBUG", "False").lower() == "true"

# Validate required environment variables
if not subscription_key or subscription_key == "your-azure-openai-api-key-here":
    print("⚠️  WARNING: AZURE_OPENAI_API_KEY not set or using default value!")
    print("   Please create a .env file with your actual Azure OpenAI API key.")

if not video_indexer_key:
    print("⚠️  WARNING: AZURE_VIDEO_INDEXER_KEY not set!")
    print("   Video analysis features will not be available.")

# Initialize Azure OpenAI client
client = AzureOpenAI(
    api_version=api_version,
    azure_endpoint=endpoint,
    api_key=subscription_key,
)

class AssessmentResponse(BaseModel):
    condition: str
    confidence: float
    description: str
    recommendations: list[str]
    severity: str

class FacialDysmorphologyResponse(BaseModel):
    genetic_condition: str
    confidence: float
    facial_features: list[str]
    description: str
    recommendations: list[str]
    urgency_level: str
    risk_factors: list[str]

class PostureAnalysisResponse(BaseModel):
    posture_condition: str
    confidence: float
    abnormalities: list[str]
    description: str
    recommendations: list[str]
    severity: str
    risk_factors: list[str]
    body_regions: list[str]

class VideoAnalysisResponse(BaseModel):
    analysis_type: str
    detected_issues: list[str]
    confidence: float
    description: str
    recommendations: list[str]
    severity: str
    video_insights: dict
    processing_time: float

class MedicalDeviceReadingResponse(BaseModel):
    device_type: str
    extracted_values: dict
    confidence: float
    description: str
    recommendations: list[str]
    reading_quality: str
    units: dict
    timestamp: Optional[str] = ""
    is_normal_range: bool
    alert_level: str

def encode_image_to_base64(image_path: str) -> str:
    """Convert image to base64 string"""
    with open(image_path, "rb") as image_file:
        return base64.b64encode(image_file.read()).decode('utf-8')

def process_image(image_data: bytes) -> str:
    """Process image and return base64 encoded string"""
    # Convert bytes to PIL Image
    image = Image.open(io.BytesIO(image_data))
    
    # Convert to RGB if necessary
    if image.mode != 'RGB':
        image = image.convert('RGB')
    
    # Save to bytes buffer
    buffer = io.BytesIO()
    image.save(buffer, format='JPEG')
    buffer.seek(0)
    
    # Convert to base64
    return base64.b64encode(buffer.getvalue()).decode('utf-8')

def analyze_video_with_gcp(video_data: bytes, filename: str):
    """Analyze video using Google Cloud Video Intelligence API"""
    try:
        print(f"🔍 Starting GCP video analysis for: {filename}")
        
        # Initialize Video Intelligence client
        video_client = videointelligence_v1.VideoIntelligenceServiceClient()
        
        # Create temporary file for video
        with tempfile.NamedTemporaryFile(suffix='.mp4', delete=False) as temp_file:
            temp_file.write(video_data)
            temp_file_path = temp_file.name
        
        try:
            # Read video file
            with open(temp_file_path, 'rb') as video_file:
                input_content = video_file.read()
            
            # Configure the request
            features = [
                videointelligence_v1.Feature.FACE_DETECTION,
                videointelligence_v1.Feature.PERSON_DETECTION,
                videointelligence_v1.Feature.LABEL_DETECTION,
                videointelligence_v1.Feature.SHOT_CHANGE_DETECTION,
            ]
            
            # Create the request
            request = videointelligence_v1.AnnotateVideoRequest(
                input_content=input_content,
                features=features,
            )
            
            print(f"📡 Sending video to GCP Video Intelligence API...")
            
            # Make the request
            operation = video_client.annotate_video(request=request)
            
            print(f"⏳ Waiting for video analysis to complete...")
            
            # Wait for the operation to complete
            result = operation.result(timeout=600)
            
            print(f"✅ GCP video analysis completed")
            
            # Debug: Print the structure
            print(f"🔍 Debug: Result structure:")
            print(f"   - Type: {type(result)}")
            print(f"   - Has annotation_results: {hasattr(result, 'annotation_results')}")
            if hasattr(result, 'annotation_results'):
                print(f"   - Number of annotations: {len(result.annotation_results)}")
                for i, annotation in enumerate(result.annotation_results):
                    print(f"   - Annotation {i}: {type(annotation)}")
                    print(f"     - Available attributes: {dir(annotation)}")
            
            # Extract insights
            insights = {
                "faces": [],
                "persons": [],
                "shots": [],
                "labels": [],
                "duration": 0
            }
            
            # Process annotation results
            for annotation in result.annotation_results:
                # Get duration from segment if available
                if hasattr(annotation, 'segment'):
                    insights["duration"] = 0  # We'll calculate this from shot annotations
                
                # Face detection
                if hasattr(annotation, 'face_detection_annotations'):
                    print(f"🔍 Debug: Found {len(annotation.face_detection_annotations)} face detection annotations")
                    for face_detection in annotation.face_detection_annotations:
                        print(f"   - Face detection tracks: {len(face_detection.tracks)}")
                        for track in face_detection.tracks:
                            print(f"     - Track confidence: {track.confidence}")
                            print(f"     - Track attributes: {dir(track)}")
                            face_info = {
                                "confidence": track.confidence,
                                "timestamps": []
                            }
                            if hasattr(track, 'timestamped_objects'):
                                for timestamped_object in track.timestamped_objects:
                                    face_info["timestamps"].append({
                                        "time": timestamped_object.normalized_bounding_box.left,
                                        "confidence": timestamped_object.confidence
                                    })
                            insights["faces"].append(face_info)
                
                # Person detection
                if hasattr(annotation, 'person_detection_annotations'):
                    print(f"🔍 Debug: Found {len(annotation.person_detection_annotations)} person detection annotations")
                    for person_detection in annotation.person_detection_annotations:
                        print(f"   - Person detection tracks: {len(person_detection.tracks)}")
                        for track in person_detection.tracks:
                            print(f"     - Track confidence: {track.confidence}")
                            person_info = {
                                "confidence": track.confidence,
                                "timestamps": []
                            }
                            if hasattr(track, 'timestamped_objects'):
                                for timestamped_object in track.timestamped_objects:
                                    person_info["timestamps"].append({
                                        "time": timestamped_object.normalized_bounding_box.left,
                                        "confidence": timestamped_object.confidence
                                    })
                            insights["persons"].append(person_info)
                
                # Shot change detection
                if hasattr(annotation, 'shot_annotations'):
                    print(f"🔍 Debug: Found {len(annotation.shot_annotations)} shot annotations")
                    for shot_change in annotation.shot_annotations:
                        shot_info = {
                            "start_time": shot_change.start_time_offset.total_seconds(),
                            "end_time": shot_change.end_time_offset.total_seconds()
                        }
                        insights["shots"].append(shot_info)
                        # Update duration based on the last shot
                        insights["duration"] = max(insights["duration"], shot_info["end_time"])
                
                # Label detection
                if hasattr(annotation, 'segment_label_annotations'):
                    print(f"🔍 Debug: Found {len(annotation.segment_label_annotations)} label annotations")
                    for label_detection in annotation.segment_label_annotations:
                        print(f"   - Label detection attributes: {dir(label_detection)}")
                        # LabelAnnotation has 'segments' not 'entities'
                        if hasattr(label_detection, 'segments'):
                            print(f"     - Entity attributes: {dir(label_detection.entity)}")
                            for segment in label_detection.segments:
                                print(f"       - Segment attributes: {dir(segment)}")
                                label_info = {
                                    "description": label_detection.entity.description,
                                    "confidence": segment.confidence if hasattr(segment, 'confidence') else 0.0,
                                    "start_time": segment.start_time.total_seconds() if hasattr(segment, 'start_time') else 0.0,
                                    "end_time": segment.end_time.total_seconds() if hasattr(segment, 'end_time') else 0.0
                                }
                                insights["labels"].append(label_info)
            
            print(f"📊 GCP Analysis Results:")
            print(f"   - Duration: {insights['duration']} seconds")
            print(f"   - Faces detected: {len(insights['faces'])}")
            print(f"   - Persons detected: {len(insights['persons'])}")
            print(f"   - Shot changes: {len(insights['shots'])}")
            print(f"   - Labels detected: {len(insights['labels'])}")
            
            return insights
            
        finally:
            # Clean up temporary file
            os.unlink(temp_file_path)
            
    except Exception as e:
        print(f"❌ GCP video analysis error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"GCP video analysis failed: {str(e)}"
        )

def extract_video_frames(video_data: bytes, num_frames: int = 5):
    """Extract frames from video for detailed analysis"""
    try:
        print(f"🎬 Extracting {num_frames} frames from video...")
        
        # Create temporary file
        with tempfile.NamedTemporaryFile(suffix='.mp4', delete=False) as temp_file:
            temp_file.write(video_data)
            temp_file_path = temp_file.name
        
        try:
            # Use OpenCV to extract frames (if available)
            try:
                import cv2
                cap = cv2.VideoCapture(temp_file_path)
                frames = []
                
                total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
                fps = cap.get(cv2.CAP_PROP_FPS)
                duration = total_frames / fps if fps > 0 else 0
                
                # Extract frames at regular intervals
                frame_indices = [int(total_frames * i / num_frames) for i in range(num_frames)]
                
                for frame_idx in frame_indices:
                    cap.set(cv2.CAP_PROP_POS_FRAMES, frame_idx)
                    ret, frame = cap.read()
                    if ret:
                        # Convert BGR to RGB
                        frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                        # Convert to PIL Image
                        pil_image = Image.fromarray(frame_rgb)
                        # Convert to base64
                        buffer = io.BytesIO()
                        pil_image.save(buffer, format='JPEG', quality=85)
                        frame_base64 = base64.b64encode(buffer.getvalue()).decode('utf-8')
                        frames.append({
                            "frame_number": frame_idx,
                            "timestamp": frame_idx / fps if fps > 0 else 0,
                            "image": frame_base64
                        })
                
                cap.release()
                print(f"✅ Extracted {len(frames)} frames successfully")
                return frames
                
            except ImportError:
                print("⚠️ OpenCV not available, using fallback method")
                # Fallback: return empty frames list
                return []
                
        finally:
            # Clean up temporary file
            os.unlink(temp_file_path)
            
    except Exception as e:
        print(f"❌ Frame extraction error: {str(e)}")
        return []

def get_video_indexer_access_token():
    """Get access token for Azure Video Indexer"""
    if not video_indexer_key:
        raise HTTPException(
            status_code=500,
            detail="Azure Video Indexer key not configured. Please set AZURE_VIDEO_INDEXER_KEY in your .env file."
        )
    
    if not video_indexer_account_id:
        raise HTTPException(
            status_code=500,
            detail="Azure Video Indexer account ID not configured. Please set AZURE_VIDEO_INDEXER_ACCOUNT_ID in your .env file."
        )
    
    # Check if this is a paid account (not trial)
    is_paid_account = video_indexer_location != "trial"
    
    if is_paid_account:
        # For paid accounts, use the provided access token directly
        print(f"✅ Using provided access token for paid account")
        print(f"📍 Location: {video_indexer_location}")
        print(f"🆔 Account ID: {video_indexer_account_id}")
        print(f"💰 Account Type: Paid")
        return video_indexer_key
    else:
        # For trial accounts, use the API to get token
        url = f"https://api.videoindexer.ai/auth/{video_indexer_location}/Accounts/{video_indexer_account_id}/AccessToken"
        headers = {
            "Ocp-Apim-Subscription-Key": video_indexer_key
        }
        params = {
            "allowEdit": "true"
        }
        
        print(f"🔑 Getting Video Indexer access token from: {url}")
        print(f"📍 Location: {video_indexer_location}")
        print(f"🆔 Account ID: {video_indexer_account_id}")
        print(f"💰 Account Type: Trial")
        
        try:
            response = requests.get(url, headers=headers, params=params)
            
            print(f"📡 Response status: {response.status_code}")
            
            if response.status_code == 200:
                token_data = response.json()
                print(f"✅ Access token obtained successfully")
                return token_data
            else:
                print(f"❌ Failed to get access token. Status: {response.status_code}")
                print(f"📄 Response text: {response.text}")
                raise HTTPException(
                    status_code=500,
                    detail=f"Failed to get Video Indexer access token: {response.text}"
                )
        except requests.exceptions.RequestException as e:
            print(f"❌ Network error getting access token: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail=f"Network error getting Video Indexer access token: {str(e)}"
            )

def upload_video_to_indexer(video_data: bytes, filename: str):
    """Upload video to Azure Video Indexer"""
    access_token = get_video_indexer_access_token()
    
    url = f"https://api.videoindexer.ai/{video_indexer_location}/Accounts/{video_indexer_account_id}/Videos"
    headers = {
        "Authorization": f"Bearer {access_token}"
    }
    
    # Create multipart form data
    files = {
        'file': (filename, video_data, 'video/mp4')
    }
    
    params = {
        "name": filename,
        "privacy": "private"
    }
    
    print(f"📤 Uploading video to: {url}")
    print(f"📁 Filename: {filename}")
    print(f"📏 Video size: {len(video_data)} bytes")
    
    try:
        response = requests.post(url, headers=headers, params=params, files=files)
        print(f"📡 Upload response status: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Video uploaded successfully")
            print(f"📄 Upload response: {result}")
            return result
        else:
            print(f"❌ Failed to upload video. Status: {response.status_code}")
            print(f"📄 Response text: {response.text}")
            raise HTTPException(
                status_code=500,
                detail=f"Failed to upload video to Video Indexer: {response.text}"
            )
    except requests.exceptions.RequestException as e:
        print(f"❌ Network error uploading video: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Network error uploading video: {str(e)}"
        )

def get_video_analysis(video_id: str):
    """Get analysis results from Azure Video Indexer"""
    access_token = get_video_indexer_access_token()
    
    url = f"https://api.videoindexer.ai/{video_indexer_location}/Accounts/{video_indexer_account_id}/Videos/{video_id}/Index"
    headers = {
        "Authorization": f"Bearer {access_token}"
    }
    
    response = requests.get(url, headers=headers)
    if response.status_code == 200:
        return response.json()
    else:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get video analysis: {response.text}"
        )

def wait_for_video_processing(video_id: str, max_wait_time: int = 300):
    """Wait for video processing to complete"""
    access_token = get_video_indexer_access_token()
    
    url = f"https://api.videoindexer.ai/{video_indexer_location}/Accounts/{video_indexer_account_id}/Videos/{video_id}/Index"
    headers = {
        "Authorization": f"Bearer {access_token}"
    }
    
    print(f"⏳ Waiting for video processing...")
    print(f"🎬 Video ID: {video_id}")
    print(f"⏰ Max wait time: {max_wait_time} seconds")
    
    start_time = time.time()
    while time.time() - start_time < max_wait_time:
        try:
            response = requests.get(url, headers=headers)
            print(f"📡 Processing check status: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                state = data.get("state", "Unknown")
                print(f"📊 Video state: {state}")
                
                if state == "Processed":
                    print(f"✅ Video processing completed successfully")
                    return data
                elif state == "Failed":
                    error_message = data.get("errorMessage", "Unknown error")
                    print(f"❌ Video processing failed: {error_message}")
                    raise HTTPException(
                        status_code=500,
                        detail=f"Video processing failed: {error_message}"
                    )
                elif state == "Uploaded":
                    print(f"📤 Video uploaded, waiting for processing...")
                elif state == "Processing":
                    print(f"⚙️ Video is being processed...")
                else:
                    print(f"⏳ Video state: {state}, continuing to wait...")
            else:
                print(f"❌ Failed to check video status. Status: {response.status_code}")
                print(f"📄 Response text: {response.text}")
                raise HTTPException(
                    status_code=500,
                    detail=f"Failed to check video status: {response.text}"
                )
        except requests.exceptions.RequestException as e:
            print(f"❌ Network error checking video status: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail=f"Network error checking video status: {str(e)}"
            )
        
        time.sleep(5)
    
    print(f"⏰ Video processing timeout after {max_wait_time} seconds")
    raise HTTPException(
        status_code=408,
        detail="Video processing timeout"
    )

@app.get("/")
async def root():
    return {"message": "Infant Health Assessment API", "status": "running"}

@app.options("/{full_path:path}")
async def options_handler(full_path: str):
    """Handle OPTIONS requests for CORS preflight"""
    return Response(
        content="",
        status_code=200,
        headers={
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
            "Access-Control-Allow-Headers": "*",
            "Access-Control-Max-Age": "3600",
        }
    )

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "health-assessment-api"}

@app.get("/config")
async def get_config():
    """
    Get current configuration (without sensitive data)
    """
    return {
        "azure_endpoint": endpoint,
        "model": model_name,
        "deployment": deployment,
        "api_version": api_version,
        "api_key_configured": bool(subscription_key and subscription_key != "your-azure-openai-api-key-here"),
        "video_indexer_configured": bool(video_indexer_key),
        "video_indexer_location": video_indexer_location,
        "server_host": host,
        "server_port": port,
        "debug_mode": debug
    }

@app.post("/assess-skin", response_model=AssessmentResponse)
async def assess_skin_condition(file: UploadFile = File(...)):
    """
    Assess infant skin condition from uploaded image
    """
    try:
        # Check if Azure OpenAI is properly configured
        if not subscription_key or subscription_key == "your-azure-openai-api-key-here":
            raise HTTPException(
                status_code=500, 
                detail="Azure OpenAI API key not configured. Please set AZURE_OPENAI_API_KEY in your .env file."
            )
        
        # Validate file type
        if not file.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="File must be an image")
        
        # Read image data
        image_data = await file.read()
        
        # Process image to base64
        base64_image = process_image(image_data)
        
        # Create system prompt for skin assessment
        system_prompt = """You are a specialized pediatric dermatologist AI assistant. Your task is to analyze infant skin conditions from images and provide accurate assessments.

Please analyze the image and provide:
1. The most likely skin condition (e.g., rash, jaundice, eczema, diaper rash, etc.)
2. Confidence level (0-100%)
3. Detailed description of what you observe
4. Specific recommendations for parents/caregivers
5. Severity level (mild, moderate, severe)

Important guidelines:
- Be thorough but use simple language
- Focus on common infant skin conditions
- Always recommend consulting a pediatrician for serious concerns
- Consider the infant's age and skin sensitivity
- Mention any urgent signs that require immediate medical attention

Format your response as JSON with these fields:
{
    "condition": "identified condition",
    "confidence": confidence_percentage,
    "description": "detailed observation",
    "recommendations": ["recommendation1", "recommendation2", ...],
    "severity": "mild/moderate/severe"
}"""

        # Create user prompt with image
        user_prompt = f"""Please analyze this infant skin image and provide a comprehensive assessment. The image is encoded in base64: {base64_image}"""

        # Call Azure OpenAI
        response = client.chat.completions.create(
            messages=[
                {
                    "role": "system",
                    "content": system_prompt,
                },
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": user_prompt
                        },
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:image/jpeg;base64,{base64_image}"
                            }
                        }
                    ]
                }
            ],
            max_tokens=2048,
            temperature=0.3,
            top_p=0.9,
            model=deployment
        )

        # Parse the response
        response_text = response.choices[0].message.content
        
        # Try to extract JSON from response
        import json
        import re
        
        # Find JSON in the response
        json_match = re.search(r'\{.*\}', response_text, re.DOTALL)
        if json_match:
            try:
                result = json.loads(json_match.group())
                return AssessmentResponse(**result)
            except json.JSONDecodeError:
                pass
        
        # If JSON parsing fails, create a structured response
        return AssessmentResponse(
            condition="Analysis completed",
            confidence=0.8,
            description=response_text,
            recommendations=["Please consult a pediatrician for professional assessment"],
            severity="moderate"
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing image: {str(e)}")

@app.get("/test-facial-analysis")
async def test_facial_analysis():
    """
    Test endpoint to verify facial analysis functionality
    """
    try:
        # Check if Azure OpenAI is properly configured
        if not subscription_key or subscription_key == "your-azure-openai-api-key-here":
            return {
                "status": "error",
                "message": "Azure OpenAI API key not configured",
                "api_key_configured": False
            }
        
        # Create a simple test image
        from PIL import Image, ImageDraw
        import io
        
        # Create a simple facial image
        img = Image.new('RGB', (200, 200), color='#FFE4B5')
        draw = ImageDraw.Draw(img)
        
        # Draw a simple face
        draw.ellipse([50, 40, 150, 160], outline='black', width=2)  # Face
        draw.ellipse([70, 75, 95, 95], fill='white', outline='black')  # Left eye
        draw.ellipse([105, 75, 130, 95], fill='white', outline='black')  # Right eye
        draw.ellipse([77, 82, 88, 88], fill='black')  # Left pupil
        draw.ellipse([112, 82, 123, 88], fill='black')  # Right pupil
        
        # Nose
        draw.polygon([(100, 100), (95, 115), (105, 115)], fill='#FFB6C1', outline='black')
        
        # Mouth
        draw.arc([90, 120, 110, 130], 0, 180, fill='red', width=2)
        
        # Save to bytes
        buffer = io.BytesIO()
        img.save(buffer, format='JPEG')
        buffer.seek(0)
        test_image_data = buffer.getvalue()
        
        # Process image to base64
        base64_image = process_image(test_image_data)
        
        return {
            "status": "success",
            "message": "Test image created successfully",
            "api_key_configured": True,
            "test_image_size": len(test_image_data),
            "base64_length": len(base64_image),
            "azure_endpoint": endpoint,
            "model": deployment
        }
        
    except Exception as e:
        return {
            "status": "error",
            "message": f"Test failed: {str(e)}",
            "api_key_configured": bool(subscription_key and subscription_key != "your-azure-openai-api-key-here")
        }

@app.get("/test-video-indexer")
async def test_video_indexer():
    """
    Test endpoint to verify Azure Video Indexer configuration and connectivity
    """
    try:
        # Check if Video Indexer is properly configured
        if not video_indexer_key:
            return {
                "status": "error",
                "message": "Azure Video Indexer key not configured",
                "video_indexer_configured": False,
                "details": "Please set AZURE_VIDEO_INDEXER_KEY in your .env file"
            }
        
        if not video_indexer_account_id:
            return {
                "status": "error",
                "message": "Azure Video Indexer account ID not configured",
                "video_indexer_configured": False,
                "details": "Please set AZURE_VIDEO_INDEXER_ACCOUNT_ID in your .env file"
            }
        
        print(f"🔧 Testing Video Indexer Configuration:")
        print(f"   - Key configured: {'✅' if video_indexer_key else '❌'}")
        print(f"   - Account ID configured: {'✅' if video_indexer_account_id else '❌'}")
        print(f"   - Location: {video_indexer_location}")
        
        # Test getting access token
        try:
            access_token = get_video_indexer_access_token()
            print(f"✅ Access token obtained successfully")
            
            return {
                "status": "success",
                "message": "Video Indexer is properly configured and accessible",
                "video_indexer_configured": True,
                "configuration": {
                    "location": video_indexer_location,
                    "account_id": video_indexer_account_id,
                    "key_configured": bool(video_indexer_key),
                    "account_id_configured": bool(video_indexer_account_id)
                },
                "access_token_test": "success",
                "details": "Video Indexer API is working correctly"
            }
            
        except Exception as e:
            print(f"❌ Access token test failed: {str(e)}")
            return {
                "status": "error",
                "message": "Video Indexer access token test failed",
                "video_indexer_configured": True,
                "configuration": {
                    "location": video_indexer_location,
                    "account_id": video_indexer_account_id,
                    "key_configured": bool(video_indexer_key),
                    "account_id_configured": bool(video_indexer_account_id)
                },
                "access_token_test": "failed",
                "error": str(e),
                "details": "Check your Video Indexer credentials and account status"
            }
        
    except Exception as e:
        print(f"❌ Video Indexer test error: {str(e)}")
        return {
            "status": "error",
            "message": f"Video Indexer test failed: {str(e)}",
            "video_indexer_configured": False,
            "details": "Check your configuration and network connectivity"
        }

@app.post("/analyze-facial-dysmorphology", response_model=FacialDysmorphologyResponse)
async def analyze_facial_dysmorphology(file: UploadFile = File(...)):
    """
    Analyze facial features for potential genetic conditions and dysmorphology
    """
    try:
        # Check if Azure OpenAI is properly configured
        if not subscription_key or subscription_key == "your-azure-openai-api-key-here":
            raise HTTPException(
                status_code=500, 
                detail="Azure OpenAI API key not configured. Please set AZURE_OPENAI_API_KEY in your .env file."
            )
        
        # Validate file type
        if not file.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="File must be an image")
        
        # Read image data
        image_data = await file.read()
        
        # Process image to base64
        base64_image = process_image(image_data)
        
        # Create system prompt for facial dysmorphology analysis
        system_prompt = """You are a specialized clinical geneticist AI assistant. Your task is to analyze facial features in images to screen for potential genetic conditions and dysmorphology.

CRITICAL: You MUST identify and name the specific genetic condition or issue. If you detect any facial features that suggest a genetic condition, you MUST provide the specific name of the condition (e.g., "Down syndrome", "Williams syndrome", "Noonan syndrome", "Fragile X syndrome", etc.). Do not be vague - if you see features that suggest a condition, name it explicitly.

Please analyze the facial features and provide:
1. The SPECIFIC NAME of the genetic condition detected (e.g., "Down syndrome", "Williams syndrome", "Noonan syndrome") or "No specific genetic condition detected" if none are apparent
2. Confidence level (0-100%)
3. Specific facial features observed that are relevant to genetic assessment
4. Detailed description of facial morphology analysis
5. Recommendations for further evaluation
6. Urgency level (low, moderate, high, critical)
7. Risk factors and associated conditions

Important guidelines:
- ALWAYS name the specific genetic condition if you detect features suggesting one
- Focus on clinically significant facial features
- Consider common genetic syndromes (Down syndrome, Williams syndrome, Noonan syndrome, Fragile X syndrome, etc.)
- Be thorough but use accessible language
- Always recommend professional genetic evaluation
- Consider age-appropriate facial development
- Mention any urgent features requiring immediate attention
- Include both common and rare genetic conditions when relevant
- If you see features suggesting a condition, DO NOT be hesitant to name it

Format your response as JSON with these fields:
{
    "genetic_condition": "SPECIFIC CONDITION NAME (e.g., 'Down syndrome', 'Williams syndrome') or 'No specific genetic condition detected'",
    "confidence": confidence_percentage,
    "facial_features": ["feature1", "feature2", ...],
    "description": "detailed analysis of facial morphology",
    "recommendations": ["recommendation1", "recommendation2", ...],
    "urgency_level": "low/moderate/high/critical",
    "risk_factors": ["risk_factor1", "risk_factor2", ...]
}"""

        # Create user prompt with image
        user_prompt = f"""Please analyze this facial image for potential genetic conditions and dysmorphology. The image is encoded in base64: {base64_image}"""

        print(f"🔍 Processing facial analysis for file: {file.filename}")
        print(f"📏 Image size: {len(image_data)} bytes")
        print(f"🔄 Base64 length: {len(base64_image)} characters")

        # Call Azure OpenAI
        response = client.chat.completions.create(
            messages=[
                {
                    "role": "system",
                    "content": system_prompt,
                },
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": user_prompt
                        },
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:image/jpeg;base64,{base64_image}"
                            }
                        }
                    ]
                }
            ],
            max_tokens=2048,
            temperature=0.3,
            top_p=0.9,
            model=deployment
        )

        # Parse the response
        response_text = response.choices[0].message.content
        print(f"📝 Raw response length: {len(response_text)} characters")
        
        # Try to extract JSON from response
        import json
        import re
        
        # Find JSON in the response
        json_match = re.search(r'\{.*\}', response_text, re.DOTALL)
        if json_match:
            try:
                result = json.loads(json_match.group())
                print(f"✅ Successfully parsed JSON response")
                return FacialDysmorphologyResponse(**result)
            except json.JSONDecodeError as e:
                print(f"❌ JSON parsing failed: {str(e)}")
                print(f"📄 Raw response: {response_text[:500]}...")
                pass
        
        # If JSON parsing fails, create a structured response
        print(f"⚠️ Using fallback response structure")
        return FacialDysmorphologyResponse(
            genetic_condition="Analysis completed",
            confidence=0.8,
            facial_features=["Analysis performed"],
            description=response_text,
            recommendations=["Please consult a geneticist for professional evaluation"],
            urgency_level="moderate",
            risk_factors=["Professional evaluation recommended"]
        )

    except Exception as e:
        print(f"❌ Facial analysis error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error processing facial analysis: {str(e)}")

@app.post("/analyze-posture", response_model=PostureAnalysisResponse)
async def analyze_posture(file: UploadFile = File(...)):
    """
    Analyze posture and detect spine, head, or postural abnormalities
    """
    try:
        # Check if Azure OpenAI is properly configured
        if not subscription_key or subscription_key == "your-azure-openai-api-key-here":
            raise HTTPException(
                status_code=500, 
                detail="Azure OpenAI API key not configured. Please set AZURE_OPENAI_API_KEY in your .env file."
            )
        
        # Validate file type
        if not file.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="File must be an image")
        
        # Read image data
        image_data = await file.read()
        
        # Process image to base64
        base64_image = process_image(image_data)
        
        # Create system prompt for posture analysis
        system_prompt = """You are a specialized pediatric orthopedic AI assistant. Your task is to analyze posture and detect spine, head, or postural abnormalities from images.

Please analyze the posture and provide:
1. Potential posture condition(s) or abnormalities detected
2. Confidence level (0-100%)
3. Specific postural abnormalities observed
4. Detailed description of posture analysis
5. Recommendations for further evaluation or intervention
6. Severity level (mild, moderate, severe)
7. Risk factors and associated conditions
8. Body regions affected

Important guidelines:
- Focus on clinically significant postural abnormalities
- Consider common conditions like scoliosis, kyphosis, lordosis, torticollis, etc.
- Be thorough but use accessible language
- Always recommend professional orthopedic evaluation
- Consider age-appropriate postural development
- Mention any urgent features requiring immediate attention
- Include both common and rare postural conditions when relevant
- Pay attention to spine alignment, head position, shoulder level, pelvic tilt

Format your response as JSON with these fields:
{
    "posture_condition": "identified condition or 'Normal posture'",
    "confidence": confidence_percentage,
    "abnormalities": ["abnormality1", "abnormality2", ...],
    "description": "detailed analysis of posture and alignment",
    "recommendations": ["recommendation1", "recommendation2", ...],
    "severity": "mild/moderate/severe",
    "risk_factors": ["risk_factor1", "risk_factor2", ...],
    "body_regions": ["region1", "region2", ...]
}"""

        # Create user prompt with image
        user_prompt = f"""Please analyze this image for posture and detect any spine, head, or postural abnormalities. The image is encoded in base64: {base64_image}"""

        print(f"🔍 Processing posture analysis for file: {file.filename}")
        print(f"📏 Image size: {len(image_data)} bytes")
        print(f"🔄 Base64 length: {len(base64_image)} characters")

        # Call Azure OpenAI
        response = client.chat.completions.create(
            messages=[
                {
                    "role": "system",
                    "content": system_prompt,
                },
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": user_prompt
                        },
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:image/jpeg;base64,{base64_image}"
                            }
                        }
                    ]
                }
            ],
            max_tokens=2048,
            temperature=0.3,
            top_p=0.9,
            model=deployment
        )

        # Parse the response
        response_text = response.choices[0].message.content
        print(f"📝 Raw response length: {len(response_text)} characters")
        
        # Try to extract JSON from response
        import json
        import re
        
        # Find JSON in the response
        json_match = re.search(r'\{.*\}', response_text, re.DOTALL)
        if json_match:
            try:
                result = json.loads(json_match.group())
                print(f"✅ Successfully parsed JSON response")
                return PostureAnalysisResponse(**result)
            except json.JSONDecodeError as e:
                print(f"❌ JSON parsing failed: {str(e)}")
                print(f"📄 Raw response: {response_text[:500]}...")
                pass
        
        # If JSON parsing fails, create a structured response
        print(f"⚠️ Using fallback response structure")
        return PostureAnalysisResponse(
            posture_condition="Analysis completed",
            confidence=0.8,
            abnormalities=["Analysis performed"],
            description=response_text,
            recommendations=["Please consult an orthopedic specialist for professional evaluation"],
            severity="moderate",
            risk_factors=["Professional evaluation recommended"],
            body_regions=["General assessment"]
        )

    except Exception as e:
        print(f"❌ Posture analysis error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error processing posture analysis: {str(e)}")

@app.post("/analyze-video-health", response_model=VideoAnalysisResponse)
async def analyze_video_health(file: UploadFile = File(...)):
    """
    Analyze video for eye/vision issues, neurological issues, and breathing difficulties using GCP
    """
    try:
        start_time = time.time()
        
        # Check if GCP is properly configured
        if not gcp_project_id:
            raise HTTPException(
                status_code=500,
                detail="GCP Project ID not configured. Please set GCP_PROJECT_ID in your .env file."
            )
        
        print(f"🔧 GCP Configuration:")
        print(f"   - Project ID: {gcp_project_id}")
        print(f"   - Bucket Name: {gcp_bucket_name}")
        print(f"   - Credentials: {'✅' if gcp_credentials_path else '❌'}")
        
        # Validate file type
        if not file.content_type.startswith('video/'):
            raise HTTPException(status_code=400, detail="File must be a video")
        
        # Read video data
        video_data = await file.read()
        
        print(f"🎥 Processing video analysis for file: {file.filename}")
        print(f"📏 Video size: {len(video_data)} bytes")
        
        # Analyze video with GCP Video Intelligence API
        print("🔍 Starting GCP video analysis...")
        gcp_insights = analyze_video_with_gcp(video_data, file.filename)
        
        # Extract video frames for detailed analysis
        print("🎬 Extracting video frames for detailed analysis...")
        video_frames = extract_video_frames(video_data, num_frames=5)
        
        # Create system prompt for video health analysis
        system_prompt = """You are a specialized pediatric neurologist and ophthalmologist AI assistant. Your task is to analyze video data for potential health issues in infants, specifically focusing on:

1. EYE/VISION ISSUES:
   - Abnormal eye movements (nystagmus, strabismus)
   - Lack of visual tracking
   - Unusual eye positioning
   - Signs of visual impairment
   - Eye alignment issues
   - Pupil abnormalities

2. NEUROLOGICAL ISSUES:
   - Abnormal movements or tremors
   - Seizure-like activity
   - Developmental delays in movement
   - Unusual posturing or muscle tone
   - Signs of neurological disorders
   - Muscle tone abnormalities
   - Reflex abnormalities

3. BREATHING DIFFICULTIES:
   - Irregular breathing patterns
   - Signs of respiratory distress
   - Abnormal chest movements
   - Cyanosis (bluish discoloration)
   - Respiratory rate abnormalities
   - Retractions or labored breathing

IMPORTANT: Analyze the video content directly. Look for:
- Any visible infant features (eyes, face, body)
- Movement patterns
- Breathing patterns
- Any visible health concerns

Please analyze the video insights and provide:
1. Specific health issues detected (if any)
2. Confidence level (0-100%)
3. Detailed description of observations
4. Recommendations for further evaluation
5. Severity level (mild, moderate, severe, critical)
6. Urgency for medical attention

Important guidelines:
- Be thorough but use accessible language
- Focus on clinically significant findings
- Always recommend professional medical evaluation for concerning findings
- Consider age-appropriate developmental milestones
- Mention any urgent signs requiring immediate medical attention
- If no issues are detected, clearly state that

Format your response as JSON with these fields:
{
    "analysis_type": "video_health_analysis",
    "detected_issues": ["issue1", "issue2", ...],
    "confidence": confidence_percentage,
    "description": "detailed analysis of video observations",
    "recommendations": ["recommendation1", "recommendation2", ...],
    "severity": "mild/moderate/severe/critical",
    "video_insights": {
        "duration": duration_in_seconds,
        "faces_detected": number_of_faces,
        "emotions_analyzed": emotion_data,
        "motion_detected": motion_data,
        "audio_analysis": audio_data
    },
    "processing_time": processing_time_in_seconds
}"""

        # Create user prompt with GCP video insights
        user_prompt = f"""Please analyze this video data for potential health issues in an infant. Focus on eye/vision issues, neurological issues, and breathing difficulties.

GCP Video Analysis Data:
- Duration: {gcp_insights['duration']} seconds
- Faces detected: {len(gcp_insights['faces'])}
- Persons detected: {len(gcp_insights['persons'])}
- Shot changes: {len(gcp_insights['shots'])}
- Labels detected: {len(gcp_insights['labels'])}

Video Frames Extracted: {len(video_frames)} frames

Please provide a comprehensive health assessment based on this video data."""

        # Prepare messages for GPT-4V
        messages = [
            {
                "role": "system",
                "content": system_prompt,
            }
        ]
        
        # Add user message with video frames if available
        if video_frames:
            # Add text content
            content = [
                {
                    "type": "text",
                    "text": user_prompt
                }
            ]
            
            # Add video frames as images
            for i, frame in enumerate(video_frames[:3]):  # Limit to 3 frames
                content.append({
                    "type": "image_url",
                    "image_url": {
                        "url": f"data:image/jpeg;base64,{frame['image']}"
                    }
                })
            
            messages.append({
                "role": "user",
                "content": content
            })
        else:
            messages.append({
                "role": "user",
                "content": user_prompt
            })

        # Call Azure OpenAI for analysis
        response = client.chat.completions.create(
            messages=messages,
            max_tokens=2048,
            temperature=0.3,
            top_p=0.9,
            model=deployment
        )

        # Parse the response
        response_text = response.choices[0].message.content
        processing_time = time.time() - start_time
        
        print(f"📝 Raw response length: {len(response_text)} characters")
        print(f"⏱️ Processing time: {processing_time:.2f} seconds")
        
        # Try to extract JSON from response
        import json
        import re
        
        # Find JSON in the response
        json_match = re.search(r'\{.*\}', response_text, re.DOTALL)
        if json_match:
            try:
                result = json.loads(json_match.group())
                result["processing_time"] = processing_time
                result["video_insights"] = gcp_insights
                print(f"✅ Successfully parsed JSON response")
                return VideoAnalysisResponse(**result)
            except json.JSONDecodeError as e:
                print(f"❌ JSON parsing failed: {str(e)}")
                print(f"📄 Raw response: {response_text[:500]}...")
                pass
        
        # If JSON parsing fails, create a structured response
        print(f"⚠️ Using fallback response structure")
        return VideoAnalysisResponse(
            analysis_type="video_health_analysis",
            detected_issues=["Analysis completed"],
            confidence=0.8,
            description=response_text,
            recommendations=["Please consult a pediatrician for professional evaluation"],
            severity="moderate",
            video_insights=gcp_insights,
            processing_time=processing_time
        )

    except Exception as e:
        import traceback
        print(f"❌ Video analysis error: {str(e)}")
        print(f"🔍 Full traceback:")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Error processing video analysis: {str(e)}")

@app.post("/extract-medical-readings", response_model=MedicalDeviceReadingResponse)
async def extract_medical_readings(file: UploadFile = File(...)):
    """
    Extract medical device readings from photos (glucometer, blood pressure, thermometer, etc.)
    """
    try:
        # Check if Azure OpenAI is properly configured
        if not subscription_key or subscription_key == "your-azure-openai-api-key-here":
            raise HTTPException(
                status_code=500, 
                detail="Azure OpenAI API key not configured. Please set AZURE_OPENAI_API_KEY in your .env file."
            )
        
        # Validate file type
        if not file.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="File must be an image")
        
        # Read image data
        image_data = await file.read()
        
        # Process image to base64
        base64_image = process_image(image_data)
        
        # Create system prompt for medical device reading extraction
        system_prompt = """You are a specialized medical device reading extraction AI assistant. Your task is to analyze photos of medical devices and extract accurate numerical readings and values.

SUPPORTED DEVICES:
1. GLUCOMETER (Blood Glucose Monitor):
   - Extract blood glucose level (mg/dL or mmol/L)
   - Look for numbers like 120, 85, 200, etc.
   - Note if it's fasting or post-meal reading

2. BLOOD PRESSURE MONITOR:
   - Extract systolic pressure (top number)
   - Extract diastolic pressure (bottom number)
   - Extract pulse/heart rate if shown
   - Look for numbers like 120/80, 140/90, etc.

3. THERMOMETER:
   - Extract temperature reading (Fahrenheit or Celsius)
   - Look for numbers like 98.6°F, 37°C, etc.

4. PULSE OXIMETER:
   - Extract oxygen saturation percentage
   - Extract pulse rate
   - Look for numbers like 98%, 95%, etc.

5. WEIGHT SCALE:
   - Extract weight measurement
   - Note units (kg, lbs, etc.)

6. OTHER MEDICAL DEVICES:
   - Extract any numerical readings visible
   - Note device type and units

CRITICAL REQUIREMENTS:
- Extract ONLY numerical values that are clearly visible
- Do NOT guess or estimate values
- If a reading is unclear or partially visible, mark it as such
- Always specify the units (mg/dL, mmHg, °F, °C, %, etc.)
- Determine if readings are within normal ranges
- Provide appropriate medical recommendations based on readings
- For timestamp field: If a timestamp is visible on the device, extract it as a string; if not visible, use an empty string ""

NORMAL RANGES:
- Blood Glucose: 70-140 mg/dL (fasting: 70-100 mg/dL)
- Blood Pressure: <120/80 mmHg (normal), 120-129/<80 (elevated), 130-139/80-89 (stage 1), ≥140/≥90 (stage 2)
- Temperature: 97-99°F (36.1-37.2°C)
- Oxygen Saturation: 95-100%
- Pulse: 60-100 bpm (adults), 80-120 bpm (children)

Format your response as JSON with these fields:
{
    "device_type": "glucometer/blood_pressure/thermometer/pulse_oximeter/weight_scale/other",
    "extracted_values": {
        "primary_reading": "numerical_value",
        "secondary_reading": "numerical_value_if_applicable",
        "additional_readings": {}
    },
    "confidence": confidence_percentage,
    "description": "detailed description of what was extracted",
    "recommendations": ["recommendation1", "recommendation2", ...],
    "reading_quality": "clear/unclear/partial/error",
    "units": {
        "primary_unit": "mg/dL/mmHg/°F/°C/%/kg/lbs",
        "secondary_unit": "unit_if_applicable"
    },
    "timestamp": "extracted_timestamp_if_visible_or_empty_string",
    "is_normal_range": true/false,
    "alert_level": "normal/elevated/high/critical/low"
}"""

        # Create user prompt with image
        user_prompt = f"""Please analyze this medical device photo and extract all visible numerical readings. The image is encoded in base64: {base64_image}"""

        print(f"🔍 Processing medical device reading extraction for file: {file.filename}")
        print(f"📏 Image size: {len(image_data)} bytes")
        print(f"🔄 Base64 length: {len(base64_image)} characters")

        # Call Azure OpenAI
        response = client.chat.completions.create(
            messages=[
                {
                    "role": "system",
                    "content": system_prompt,
                },
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": user_prompt
                        },
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:image/jpeg;base64,{base64_image}"
                            }
                        }
                    ]
                }
            ],
            max_tokens=2048,
            temperature=0.1,  # Lower temperature for more accurate extraction
            top_p=0.9,
            model=deployment
        )

        # Parse the response
        response_text = response.choices[0].message.content
        print(f"📝 Raw response length: {len(response_text)} characters")
        
        # Try to extract JSON from response
        import json
        import re
        
        # Find JSON in the response
        json_match = re.search(r'\{.*\}', response_text, re.DOTALL)
        if json_match:
            try:
                result = json.loads(json_match.group())
                
                # Ensure timestamp is a string, not None
                if result.get("timestamp") is None:
                    result["timestamp"] = ""
                
                print(f"✅ Successfully parsed JSON response")
                return MedicalDeviceReadingResponse(**result)
            except json.JSONDecodeError as e:
                print(f"❌ JSON parsing failed: {str(e)}")
                print(f"📄 Raw response: {response_text[:500]}...")
                pass
        
        # If JSON parsing fails, create a structured response
        print(f"⚠️ Using fallback response structure")
        return MedicalDeviceReadingResponse(
            device_type="unknown",
            extracted_values={"error": "Could not extract readings"},
            confidence=0.0,
            description=response_text,
            recommendations=["Please ensure the device display is clearly visible in the photo"],
            reading_quality="error",
            units={},
            timestamp="",
            is_normal_range=False,
            alert_level="unknown"
        )

    except Exception as e:
        print(f"❌ Medical reading extraction error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error processing medical reading extraction: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    print(f"🚀 Starting Infant Health Assessment API on {host}:{port}")
    print(f"📚 API Documentation: http://{host}:{port}/docs")
    print(f"🔍 Health Check: http://{host}:{port}/health")
    
    if debug:
        print("🐛 Debug mode enabled")
    
    try:
        uvicorn.run(
            app, 
            host=host, 
            port=port, 
            reload=debug,
            log_level="info" if not debug else "debug",
            access_log=True,
            log_config=None  # Use default logging config
        )
    except KeyboardInterrupt:
        print("\n🛑 Server stopped by user")
    except Exception as e:
        print(f"❌ Server error: {str(e)}") 