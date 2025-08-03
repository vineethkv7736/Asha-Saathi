'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Header } from '@/components/common/Header';
import { BottomNavigation } from '@/components/common/BottomNavigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Camera, Upload, Eye, AlertTriangle, CheckCircle, Loader2, ArrowLeft, User, Baby } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motherService, childService, screeningService } from '@/lib/database';

interface Person {
  id: string;
  name: string;
  type: 'mother' | 'child';
}

function isValidType(type: string): type is 'mother' | 'child' {
  return type === 'mother' || type === 'child';
}

interface ScreeningPageProps {
  params: {
    type: string;
    id: string;
  };
}

export default function DynamicScreeningPage({ params }: ScreeningPageProps) {
  const { user, loading } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();
  const typeParam = params.type;
  const id = params.id;
  const type: 'mother' | 'child' | undefined = isValidType(typeParam) ? typeParam : undefined;

  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<any>(null);
  const [skinResult, setSkinResult] = useState<any>(null);
  const [postureResult, setPostureResult] = useState<any>(null);
  const [medicalReadingsResult, setMedicalReadingsResult] = useState<any>(null);
  const [person, setPerson] = useState<Person | null>(null);
  const [loadingPerson, setLoadingPerson] = useState(true);
  const [screeningNotes, setScreeningNotes] = useState('');
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  useEffect(() => {
    const loadPerson = async () => {
      if (!id || !type) return;
      try {
        setLoadingPerson(true);
        let personData;
        if (type === 'mother') {
          personData = await motherService.getById(id);
          if (personData) {
            setPerson({
              id: personData.id,
              name: personData.name,
              type: 'mother',
            });
          }
        } else if (type === 'child') {
          personData = await childService.getById(id);
          if (personData) {
            setPerson({
              id: personData.id,
              name: personData.name,
              type: 'child',
            });
          }
        }
      } catch (error) {
        console.error('Error loading person:', error);
      } finally {
        setLoadingPerson(false);
      }
    };
    loadPerson();
  }, [id, type]);

  if (!type) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-red-600 font-semibold">
          Invalid screening type. Please check the URL.
        </div>
      </div>
    );
  }

  if (loading || loadingPerson) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading screening page...</p>
        </div>
      </div>
    );
  }

  if (!user || !person) {
    return null;
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // --- Child AI API Integration ---
  const callChildAIApis = async (file: File) => {
    try {
      setAnalyzing(true);
      setApiError(null);
      setSkinResult(null);
      setPostureResult(null);
      setAnalysisResults(null);

      // Call both APIs simultaneously
      const skinForm = new FormData();
      skinForm.append('file', file);
      const skinPromise = fetch('https://5fa783580e47.ngrok-free.app/assess-skin', {
        method: 'POST',
        body: skinForm,
      }).then(res => res.json());

      const postureForm = new FormData();
      postureForm.append('file', file);
      const posturePromise = fetch('https://5fa783580e47.ngrok-free.app/analyze-posture', {
        method: 'POST',
        body: postureForm,
      }).then(res => res.json());

      // Wait for both APIs to complete
      const [skinJson, postureJson] = await Promise.all([skinPromise, posturePromise]);
      
      setSkinResult(skinJson);
      setPostureResult(postureJson);
      setAnalysisResults({ skin: skinJson, posture: postureJson });
    } catch (error) {
      console.error('❌ Error calling child AI APIs:', error);
      setApiError('Failed to analyze image. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  const callMedicalReadingsAPI = async (file: File) => {
    try {
      setAnalyzing(true);
      setApiError(null);
      setMedicalReadingsResult(null);
      setAnalysisResults(null);

      const formData = new FormData();
      formData.append('file', file);
      const response = await fetch('https://5fa783580e47.ngrok-free.app/extract-medical-readings', {
        method: 'POST',
        body: formData,
      });
      const result = await response.json();
      
      setMedicalReadingsResult(result);
      setAnalysisResults({ medicalReadings: result });
    } catch (error) {
      console.error('❌ Error calling medical readings API:', error);
      setApiError('Failed to extract medical readings. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedImage) {
      setApiError('Please select an image first.');
      return;
    }

    if (type === 'child') {
      await callChildAIApis(selectedImage);
    } else if (type === 'mother') {
      await callMedicalReadingsAPI(selectedImage);
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleSaveScreening = async () => {
    if (!person || !analysisResults) return;
    try {
      let skin_condition: string | null = null;
      let posture_condition: string | null = null;
      if (type === 'child') {
        skin_condition = skinResult?.condition || null;
        posture_condition = postureResult?.posture_condition || null;
      }
      
      // Save skin screening if condition exists
      if (type === 'child' && skinResult?.condition) {
        const skinScreeningData = {
          person_id: person.id,
          person_type: person.type,
          image_url: imagePreview || undefined,
          analysis_results: { skin: skinResult },
          analysis_type: 'skin' as const,
          condition: skinResult.condition,
          notes: screeningNotes,
          risk_level: skinResult.severity || 'low',
        };
        await screeningService.create(skinScreeningData);
      }
      
      // Save posture screening if condition exists
      if (type === 'child' && postureResult?.posture_condition) {
        const postureScreeningData = {
          person_id: person.id,
          person_type: person.type,
          image_url: imagePreview || undefined,
          analysis_results: { posture: postureResult },
          analysis_type: 'posture' as const,
          condition: postureResult.posture_condition,
          notes: screeningNotes,
          risk_level: 'low' as const,
        };
        await screeningService.create(postureScreeningData);
      }
      
      // Save medical readings screening for mothers
      if (type === 'mother' && medicalReadingsResult) {
        const medicalScreeningData = {
          person_id: person.id,
          person_type: person.type,
          image_url: imagePreview || undefined,
          analysis_results: { medicalReadings: medicalReadingsResult },
          analysis_type: 'general' as const,
          condition: medicalReadingsResult.device_type,
          notes: screeningNotes,
          risk_level: medicalReadingsResult.alert_level || 'low',
        };
        await screeningService.create(medicalScreeningData);
      }
      
      // Save general screening for mothers or combined for children
      const generalScreeningData = {
        person_id: person.id,
        person_type: person.type,
        image_url: imagePreview || undefined,
        analysis_results: analysisResults,
        analysis_type: type === 'child' ? 'combined' as const : 'general' as const,
        condition: type === 'child' ? undefined : (medicalReadingsResult?.device_type || 'general_health'),
        notes: screeningNotes,
        risk_level: (type === 'child' && skinResult?.severity) ? skinResult.severity : (analysisResults.riskLevel || 'low'),
      };
      const savedScreening = await screeningService.create(generalScreeningData);
      
      // Only update child if condition values are present
      if (type === 'child' && (skin_condition || posture_condition)) {
        const childUpdate: any = {};
        if (skin_condition) childUpdate.skin_condition = skin_condition;
        if (posture_condition) childUpdate.posture_condition = posture_condition;
        if (Object.keys(childUpdate).length > 0) {
          await childService.update(person.id, childUpdate);
        }
      }
      if (savedScreening) {
        console.log('✅ Screening saved successfully:', savedScreening.id);
        alert('Screening results saved successfully!');
      } else {
        console.error('❌ Failed to save screening');
        alert('Failed to save screening results. Please try again.');
      }
    } catch (error) {
      console.error('❌ Error saving screening:', error);
      alert('An error occurred while saving the screening results.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 pb-8">
      <Header />
      <main className="pb-20 pt-6">
        <div className="px-4 max-w-4xl mx-auto space-y-6">
          {/* Header with back button */}
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </Button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">
                AI Health Screening
              </h1>
              <p className="text-gray-600">
                {type === 'mother' ? 'Maternal' : 'Child'} Health Assessment
              </p>
            </div>
          </div>

          {/* Person Info Card */}
          <Card className="professional-card">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className={`p-3 rounded-full ${type === 'mother' ? 'bg-pink-100' : 'bg-blue-100'}`}>
                  {type === 'mother' ? (
                    <User className="h-6 w-6 text-pink-600" />
                  ) : (
                    <Baby className="h-6 w-6 text-blue-600" />
                  )}
                </div>
                <div className='flex flex-col'>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">{person.name}</h2>
                    <p className="text-gray-600 capitalize">{person.type} • ID: {person.id}</p>
                  </div>
                  <Badge className={type === 'mother' ? 'bg-pink-100 w-fit mt-2 text-pink-800' : 'bg-blue-100 w-fit mt-2 px-3 text-blue-800'}>
                    {type === 'mother' ? 'Mother' : 'Child'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Upload Section */}
          <Card className="professional-card">
            <CardHeader>
              <CardTitle className="text-lg">Upload Photo for Analysis</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-center w-full">
                  <label htmlFor="photo-upload" className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                    {imagePreview ? (
                      <img 
                        src={imagePreview} 
                        alt="Preview" 
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Camera className="w-10 h-10 mb-3 text-gray-400" />
                        <p className="mb-2 text-sm text-gray-500">
                          <span className="font-semibold">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-gray-500">PNG, JPG or JPEG (MAX. 10MB)</p>
                      </div>
                    )}
                    <input 
                      id="photo-upload" 
                      type="file" 
                      className="hidden" 
                      accept="image/*"
                      onChange={handleImageUpload}
                    />
                  </label>
                </div>
                
                <Button 
                  onClick={handleAnalyze}
                  disabled={!selectedImage || analyzing}
                  className="w-full gradient-button"
                >
                  {analyzing ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin mr-2" />
                      {type === 'child' ? 'Analyzing Skin & Posture...' : 'Analyzing Image...'}
                    </>
                  ) : (
                    <>
                      <Eye className="h-5 w-5 mr-2" />
                      Analyze Photo
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Analysis Results */}
          {/* Results Section */}
          {analysisResults && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-900">Analysis Results</h3>
              
              {/* Medical Readings Results for Mothers */}
              {type === 'mother' && medicalReadingsResult && (
                <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-semibold text-gray-900">
                      Medical Device Readings
                    </h4>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      medicalReadingsResult.alert_level === 'normal' ? 'bg-green-100 text-green-800' :
                      medicalReadingsResult.alert_level === 'elevated' ? 'bg-yellow-100 text-yellow-800' :
                      medicalReadingsResult.alert_level === 'high' ? 'bg-orange-100 text-orange-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {medicalReadingsResult.alert_level || 'normal'}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-gray-600">Device Type:</span>
                        <span className="text-sm text-gray-900 capitalize">{medicalReadingsResult.device_type}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-gray-600">Primary Reading:</span>
                        <span className="text-sm text-gray-900 font-semibold">
                          {medicalReadingsResult.extracted_values.primary_reading} {medicalReadingsResult.units.primary_unit}
                        </span>
                      </div>
                      {medicalReadingsResult.extracted_values.secondary_reading && (
                        <div className="flex justify-between">
                          <span className="text-sm font-medium text-gray-600">Secondary Reading:</span>
                          <span className="text-sm text-gray-900 font-semibold">
                            {medicalReadingsResult.extracted_values.secondary_reading} {medicalReadingsResult.units.secondary_unit}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-gray-600">Confidence:</span>
                        <span className="text-sm text-gray-900">{(medicalReadingsResult.confidence)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-gray-600">Reading Quality:</span>
                        <span className="text-sm text-gray-900 capitalize">{medicalReadingsResult.reading_quality}</span>
                      </div>
                      {medicalReadingsResult.timestamp && (
                        <div className="flex justify-between">
                          <span className="text-sm font-medium text-gray-600">Timestamp:</span>
                          <span className="text-sm text-gray-900">{medicalReadingsResult.timestamp}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-gray-600">Normal Range:</span>
                        <span className={`text-sm font-medium ${
                          medicalReadingsResult.is_normal_range ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {medicalReadingsResult.is_normal_range ? 'Yes' : 'No'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <h5 className="text-sm font-medium text-gray-700 mb-2">Description:</h5>
                      <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
                        {medicalReadingsResult.description}
                      </p>
                    </div>
                    
                    {medicalReadingsResult.recommendations && medicalReadingsResult.recommendations.length > 0 && (
                      <div>
                        <h5 className="text-sm font-medium text-gray-700 mb-2">Recommendations:</h5>
                        <ul className="space-y-1">
                          {medicalReadingsResult.recommendations.map((rec: string, index: number) => (
                            <li key={index} className="text-sm text-gray-600 flex items-start">
                              <span className="text-blue-500 mr-2">•</span>
                              {rec}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {/* Child Results */}
              {type === 'child' && (
                <>
                  {skinResult && skinResult.condition && (
                    <div className="space-y-2">
                      <h4 className="text-md font-semibold text-pink-700 flex items-center">
                        Skin Condition Assessment
                      </h4>
                      <div className="text-sm text-gray-700">
                        <p><span className="font-medium">Condition:</span> {skinResult.condition}</p>
                        <p><span className="font-medium">Confidence:</span> {(skinResult.confidence)}%</p>
                        <p><span className="font-medium">Severity:</span> {skinResult.severity}</p>
                        <p><span className="font-medium">Description:</span> {skinResult.description}</p>
                        <div className="mt-2">
                          <span className="font-medium">Recommendations:</span>
                          <ul className="list-disc ml-6 text-gray-600">
                            {skinResult.recommendations?.map((rec: string, i: number) => (
                              <li key={i}>{rec}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}
                  {postureResult && postureResult.posture_condition && (
                    <div className="space-y-2 mt-6">
                      <h4 className="text-md font-semibold text-blue-700 flex items-center">
                        Posture Analysis
                      </h4>
                      <div className="text-sm text-gray-700">
                        <p><span className="font-medium">Condition:</span> {postureResult.posture_condition}</p>
                        <p><span className="font-medium">Confidence:</span> {(postureResult.confidence)}%</p>
                        <p><span className="font-medium">Severity:</span> {postureResult.severity}</p>
                        <p><span className="font-medium">Description:</span> {postureResult.description}</p>
                        <div className="mt-2">
                          <span className="font-medium">Abnormalities:</span>
                          <ul className="list-disc ml-6 text-gray-600">
                            {postureResult.abnormalities?.map((ab: string, i: number) => (
                              <li key={i}>{ab}</li>
                            ))}
                          </ul>
                        </div>
                        <div className="mt-2">
                          <span className="font-medium">Recommendations:</span>
                          <ul className="list-disc ml-6 text-gray-600">
                            {postureResult.recommendations?.map((rec: string, i: number) => (
                              <li key={i}>{rec}</li>
                            ))}
                          </ul>
                        </div>
                        <div className="mt-2">
                          <span className="font-medium">Risk Factors:</span>
                          <ul className="list-disc ml-6 text-gray-600">
                            {postureResult.risk_factors?.map((rf: string, i: number) => (
                              <li key={i}>{rf}</li>
                            ))}
                          </ul>
                        </div>
                        <div className="mt-2">
                          <span className="font-medium">Body Regions:</span>
                          <ul className="list-disc ml-6 text-gray-600">
                            {postureResult.body_regions?.map((br: string, i: number) => (
                              <li key={i}>{br}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
              
                             {/* Notes Section */}
               <div className="space-y-2">
                 <Label htmlFor="screening-notes">Additional Notes</Label>
                 <textarea
                   id="screening-notes"
                   value={screeningNotes}
                   onChange={(e) => setScreeningNotes(e.target.value)}
                   placeholder="Add any additional observations or notes..."
                   className="w-full p-3 border border-gray-300 rounded-lg resize-none h-24 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                 />
               </div>
               
               {/* Save Button */}
               <div className="flex justify-end">
                 <Button 
                   onClick={handleSaveScreening}
                   className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                 >
                   Save Screening Results
                 </Button>
               </div>
               
               {/* Error Display */}
               {apiError && (
                 <div className="text-red-600 text-sm mt-2 p-3 bg-red-50 rounded-md border border-red-200">
                   {apiError}
                 </div>
               )}
             </div>
           )}
          
          {/* How it works */}
          <Card className="professional-card">
            <CardHeader>
              <CardTitle className="text-lg">How AI Screening Works</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-start space-x-2">
                  <Camera className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <p>Take a clear, well-lit photo of the {person.type}</p>
                </div>
                <div className="flex items-start space-x-2">
                  <Eye className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <p>AI analyzes physical features for health indicators</p>
                </div>
                <div className="flex items-start space-x-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <p>Flags potential health concerns for review</p>
                </div>
                <div className="flex items-start space-x-2">
                  <CheckCircle className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
                  <p>Provides recommendations for follow-up care</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <BottomNavigation />
    </div>
  );
} 