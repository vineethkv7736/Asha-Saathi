'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Header } from '@/components/common/Header';
import { BottomNavigation } from '@/components/common/BottomNavigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Baby, 
  User, 
  FileText, 
  ArrowLeft, 
  Calendar,
  Activity,
  Shield,
  TrendingUp
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { childService, motherService, screeningService } from '@/lib/database';

interface Child {
  id: string;
  name: string;
  age_in_months: number;
  mother_id: string;
  health_status: 'healthy' | 'needs_attention' | 'critical';
  last_screening: string;
  vaccinations_completed: number;
  vaccinations_total: number;
  has_photo: boolean;
  skin_condition?: string;
  posture_condition?: string;
  created_at: string;
  updated_at: string;
}

interface Mother {
  id: string;
  name: string;
  age: number;
  mobile: string;
  address: string;
  risk_level: 'low' | 'medium' | 'high';
  pregnancy_week?: number;
  last_visit: string;
  children_count: number;
  created_at: string;
  updated_at: string;
}

interface Screening {
  id: string;
  person_id: string;
  person_type: 'mother' | 'child';
  image_url?: string;
  analysis_results: any;
  analysis_type: 'skin' | 'posture' | 'general' | 'combined';
  condition?: string;
  notes?: string;
  risk_level: 'low' | 'medium' | 'high';
  created_at: string;
}

export default function ChildViewPage({ params }: { params: { id: string } }) {
  const { user, loading } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();
  const { id } = params;

  const [child, setChild] = useState<Child | null>(null);
  const [mother, setMother] = useState<Mother | null>(null);
  const [screenings, setScreenings] = useState<Screening[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  useEffect(() => {
    const loadChildData = async () => {
      if (!id) return;
      try {
        setLoadingData(true);
        
        // Load child data
        const childData = await childService.getById(id);
        if (childData) {
          setChild(childData);
          
          // Load mother data
          const motherData = await motherService.getById(childData.mother_id);
          setMother(motherData);
          
          // Load screenings for child
          const screeningsData = await screeningService.getByPersonId(id, 'child');
          setScreenings(screeningsData || []);
        }
      } catch (error) {
        console.error('Error loading child data:', error);
      } finally {
        setLoadingData(false);
      }
    };
    loadChildData();
  }, [id]);

  const getHealthStatusColor = (status: string) => {
    switch (status) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'needs_attention': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'healthy': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const calculateAge = (months: number) => {
    if (months < 12) {
      return `${months} month${months !== 1 ? 's' : ''}`;
    } else {
      const years = Math.floor(months / 12);
      const remainingMonths = months % 12;
      if (remainingMonths === 0) {
        return `${years} year${years !== 1 ? 's' : ''}`;
      } else {
        return `${years} year${years !== 1 ? 's' : ''} ${remainingMonths} month${remainingMonths !== 1 ? 's' : ''}`;
      }
    }
  };

  if (loadingData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center min-h-[calc(100vh-120px)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading child details...</p>
          </div>
        </div>
        <BottomNavigation />
      </div>
    );
  }

  if (!child) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center min-h-[calc(100vh-120px)]">
          <div className="text-center text-red-600 font-semibold">
            Child not found.
          </div>
        </div>
        <BottomNavigation />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header />
      
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex flex-col justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.back()}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </Button>
          </div>
          <div className="flex justify-between items-center mt-4 space-x-2">
            <h1 className="text-2xl font-bold text-gray-900">{child.name}</h1>
            <Button
              onClick={() => router.push(`/screening/child/${child.id}`)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Screen Child
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Child Details */}
          <div className="lg:col-span-1">
            <Card className="professional-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Baby className="h-5 w-5 text-pink-600" />
                  <span>Child Details</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-600">Age:</span>
                    <span className="text-sm text-gray-900">{calculateAge(child.age_in_months)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-600">Health Status:</span>
                    <Badge className={getHealthStatusColor(child.health_status)}>
                      {child.health_status.replace('_', ' ')}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-600">Vaccinations:</span>
                    <span className="text-sm text-gray-900">{child.vaccinations_completed}/{child.vaccinations_total}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-600">Last Screening:</span>
                    <span className="text-sm text-gray-900">{formatDate(child.last_screening)}</span>
                  </div>
                  {child.skin_condition && (
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-600">Skin Condition:</span>
                      <span className="text-sm text-gray-900">{child.skin_condition}</span>
                    </div>
                  )}
                  {child.posture_condition && (
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-600">Posture Condition:</span>
                      <span className="text-sm text-gray-900">{child.posture_condition}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-600">Has Photo:</span>
                    <span className="text-sm text-gray-900">{child.has_photo ? 'Yes' : 'No'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Mother Info */}
            {mother && (
              <Card className="professional-card mt-6">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <User className="h-5 w-5 text-blue-600" />
                    <span>Mother</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-600">Name:</span>
                    <span className="text-sm text-gray-900">{mother.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-600">Age:</span>
                    <span className="text-sm text-gray-900">{mother.age} years</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-600">Mobile:</span>
                    <span className="text-sm text-gray-900">{mother.mobile}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-600">Risk Level:</span>
                    <Badge className={getRiskColor(mother.risk_level)}>
                      {mother.risk_level.toUpperCase()}
                    </Badge>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => router.push(`/mothers/${mother.id}`)}
                    className="w-full"
                  >
                    View Mother Details
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Screenings */}
            <Card className="professional-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5 text-purple-600" />
                  <span>Screenings ({screenings.length})</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {screenings.length > 0 ? (
                  <div className="space-y-4">
                    {screenings.map((screening) => (
                      <div key={screening.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            <h4 className="font-medium text-gray-900 capitalize">
                              {screening.analysis_type} Analysis
                            </h4>
                            {screening.condition && (
                              <span className="text-sm text-gray-600">({screening.condition})</span>
                            )}
                          </div>
                          <Badge className={getRiskColor(screening.risk_level)}>
                            {screening.risk_level.toUpperCase()}
                          </Badge>
                        </div>
                        
                        <div className="text-sm text-gray-600 space-y-1">
                          <p><span className="font-medium">Date:</span> {formatDate(screening.created_at)}</p>
                          {screening.notes && (
                            <p><span className="font-medium">Notes:</span> {screening.notes}</p>
                          )}
                        </div>

                        {/* Analysis Results Summary */}
                        {screening.analysis_results && (
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <h5 className="text-sm font-medium text-gray-700 mb-2">Analysis Results:</h5>
                            <div className="text-xs text-gray-600 space-y-1">
                              {screening.analysis_type === 'skin' && screening.analysis_results.skin && (
                                <div>
                                  <p><span className="font-medium">Condition:</span> {screening.analysis_results.skin.condition}</p>
                                  <p><span className="font-medium">Confidence:</span> {screening.analysis_results.skin.confidence}%</p>
                                  <p><span className="font-medium">Severity:</span> {screening.analysis_results.skin.severity}</p>
                                </div>
                              )}
                              {screening.analysis_type === 'posture' && screening.analysis_results.posture && (
                                <div>
                                  <p><span className="font-medium">Condition:</span> {screening.analysis_results.posture.posture_condition}</p>
                                  <p><span className="font-medium">Confidence:</span> {screening.analysis_results.posture.confidence}%</p>
                                  <p><span className="font-medium">Severity:</span> {screening.analysis_results.posture.severity}</p>
                                </div>
                              )}
                              {screening.analysis_type === 'combined' && (
                                <div>
                                  <p><span className="font-medium">Combined Analysis:</span> Multiple assessments performed</p>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">No screenings recorded yet.</p>
                )}
              </CardContent>
            </Card>

            {/* Health Summary */}
            <Card className="professional-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="h-5 w-5 text-green-600" />
                  <span>Health Summary</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-700">Vaccination Progress</span>
                      <span className="text-sm font-semibold text-blue-600">
                        {Math.round((child.vaccinations_completed / child.vaccinations_total) * 100)}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-700">Health Status</span>
                      <Badge className={getHealthStatusColor(child.health_status)}>
                        {child.health_status.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-700">Total Screenings</span>
                      <span className="text-sm font-semibold text-purple-600">{screenings.length}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-700">Last Screening</span>
                      <span className="text-sm text-gray-600">{formatDate(child.last_screening)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      <BottomNavigation />
    </div>
  );
} 