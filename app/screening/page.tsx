'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Header } from '@/components/common/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Camera, Upload, Eye, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ScreeningPage() {
  const { user, loading } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<any>(null);
  const [childName, setChildName] = useState('');

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
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

  const handleAnalyze = async () => {
    if (!selectedImage) return;
    
    setIsAnalyzing(true);
    
    // Simulate AI analysis
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Mock AI results
    const mockResults = {
      height: '68 cm',
      weight: '7.2 kg',
      skinTone: 'Normal',
      jaundice: 'Not detected',
      anemia: 'Mild signs detected',
      eyeCondition: 'Normal',
      spinalAlignment: 'Normal',
      overallHealth: 'Good',
      riskLevel: 'low',
      recommendations: [
        'Monitor iron levels due to mild anemia signs',
        'Continue regular feeding schedule',
        'Schedule next checkup in 2 weeks'
      ]
    };
    
    setAnalysisResults(mockResults);
    setIsAnalyzing(false);
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="pb-20 pt-4">
        <div className="px-4 space-y-6">
          <h1 className="text-2xl font-bold text-gray-900">
            AI Health Screening
          </h1>
          
          <Card className="health-card">
            <CardHeader>
              <CardTitle className="text-lg">Upload Child Photo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="childName">Child Name</Label>
                <Input
                  id="childName"
                  value={childName}
                  onChange={(e) => setChildName(e.target.value)}
                  placeholder="Enter child's name"
                  className="mt-1"
                />
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-center w-full">
                  <label htmlFor="photo-upload" className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
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
                  disabled={!selectedImage || isAnalyzing || !childName}
                  className="w-full"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Analyzing Image...
                    </>
                  ) : (
                    <>
                      <Eye className="h-4 w-4 mr-2" />
                      Analyze Photo
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {analysisResults && (
            <Card className="health-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">AI Analysis Results</CardTitle>
                  <Badge className={getRiskColor(analysisResults.riskLevel)}>
                    {analysisResults.riskLevel.toUpperCase()} RISK
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-700">Physical Measurements</p>
                    <div className="space-y-1 text-sm">
                      <p><span className="text-gray-600">Height:</span> {analysisResults.height}</p>
                      <p><span className="text-gray-600">Weight:</span> {analysisResults.weight}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-700">Health Indicators</p>
                    <div className="space-y-1 text-sm">
                      <p><span className="text-gray-600">Skin Tone:</span> {analysisResults.skinTone}</p>
                      <p><span className="text-gray-600">Jaundice:</span> {analysisResults.jaundice}</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700">Detailed Assessment</p>
                  <div className="grid grid-cols-1 gap-2 text-sm">
                    <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span>Anemia Signs</span>
                      <span className={analysisResults.anemia.includes('detected') ? 'text-yellow-600' : 'text-green-600'}>
                        {analysisResults.anemia}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span>Eye Condition</span>
                      <span className="text-green-600">{analysisResults.eyeCondition}</span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span>Spinal Alignment</span>
                      <span className="text-green-600">{analysisResults.spinalAlignment}</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700">Recommendations</p>
                  <div className="space-y-2">
                    {analysisResults.recommendations.map((rec: string, index: number) => (
                      <div key={index} className="flex items-start space-x-2 p-2 bg-blue-50 rounded">
                        <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-blue-800">{rec}</p>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="flex space-x-2 pt-4">
                  <Button variant="outline" className="flex-1">
                    Save to Profile
                  </Button>
                  <Button className="flex-1">
                    Schedule Follow-up
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
          
          <Card className="health-card">
            <CardHeader>
              <CardTitle className="text-lg">How AI Screening Works</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-start space-x-2">
                  <Camera className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <p>Take a clear, well-lit photo of the child</p>
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
    </div>
  );
}