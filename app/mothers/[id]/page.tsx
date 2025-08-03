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
  User, 
  Baby, 
  Calendar, 
  FileText, 
  ArrowLeft, 
  Phone, 
  MapPin, 
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motherService, childService, visitService, screeningService, examinationService } from '@/lib/database';

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

interface Child {
  id: string;
  name: string;
  age_in_months: number;
  health_status: 'healthy' | 'needs_attention' | 'critical';
  last_screening: string;
  vaccinations_completed: number;
  vaccinations_total: number;
  has_photo: boolean;
  created_at: string;
}

interface Visit {
  id: string;
  mother_id: string;
  visit_date: string;
  visit_type: 'prenatal' | 'postnatal' | 'screening' | 'vaccination';
  status: 'scheduled' | 'completed' | 'cancelled' | 'no_show';
  notes?: string;
  created_at: string;
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

interface Examination {
  id: string;
  person_id: string;
  person_type: 'mother' | 'child';
  answers: any;
  bmi?: number;
  bmi_category?: 'underweight' | 'normal' | 'overweight' | 'obese';
  health_status: 'healthy' | 'needs_attention' | 'critical';
  notes?: string;
  created_at: string;
}

export default function MotherViewPage({ params }: { params: { id: string } }) {
  const { user, loading } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();
  const { id } = params;

  const [mother, setMother] = useState<Mother | null>(null);
  const [children, setChildren] = useState<Child[]>([]);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [screenings, setScreenings] = useState<Screening[]>([]);
  const [examinations, setExaminations] = useState<Examination[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  useEffect(() => {
    const loadMotherData = async () => {
      if (!id) return;
      try {
        setLoadingData(true);
        
        // Load mother data
        const motherData = await motherService.getById(id);
        if (motherData) {
          setMother(motherData);
          
          // Load children
          const childrenData = await childService.getByMotherId(id);
          setChildren(childrenData || []);
          
          // Load visits
          const visitsData = await visitService.getByMotherId(id);
          setVisits(visitsData || []);
          
          // Load screenings for mother
          const screeningsData = await screeningService.getByPersonId(id, 'mother');
          setScreenings(screeningsData || []);

          // Load examinations for mother
          const examinationsData = await examinationService.getByPersonId(id, 'mother');
          setExaminations(examinationsData || []);
        }
      } catch (error) {
        console.error('Error loading mother data:', error);
      } finally {
        setLoadingData(false);
      }
    };
    loadMotherData();
  }, [id]);

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getHealthStatusColor = (status: string) => {
    switch (status) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'needs_attention': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'healthy': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getVisitStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'scheduled': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      case 'no_show': return 'bg-orange-100 text-orange-800 border-orange-200';
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

  if (loadingData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center min-h-[calc(100vh-120px)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading mother details...</p>
          </div>
        </div>
        <BottomNavigation />
      </div>
    );
  }

  if (!mother) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center min-h-[calc(100vh-120px)]">
          <div className="text-center text-red-600 font-semibold">
            Mother not found.
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
          <div className="flex flex-col gap-2 justify-between items-center mt-4 space-x-2">
            <h1 className="text-2xl font-bold text-gray-900">{mother.name}</h1>
            <div className="flex space-x-2">
              <Button
                onClick={() => router.push(`/examination/mother/${mother.id}`)}
                variant="outline"
                className="border-green-600 text-green-600 hover:bg-green-50"
              >
                Conduct Examination
              </Button>
              <Button
                onClick={() => router.push(`/screening/mother/${mother.id}`)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Screen Mother
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Mother Details */}
          <div className="lg:col-span-1">
            <Card className="professional-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5 text-blue-600" />
                  <span>Mother Details</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-600">Age:</span>
                    <span className="text-sm text-gray-900">{mother.age} years</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-600">Mobile:</span>
                    <span className="text-sm text-gray-900">{mother.mobile}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-600">Address:</span>
                    <span className="text-sm text-gray-900">{mother.address}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-600">Risk Level:</span>
                    <Badge className={getRiskColor(mother.risk_level)}>
                      {mother.risk_level.toUpperCase()}
                    </Badge>
                  </div>
                  {mother.pregnancy_week && (
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-600">Pregnancy Week:</span>
                      <span className="text-sm text-gray-900">Week {mother.pregnancy_week}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-600">Children:</span>
                    <span className="text-sm text-gray-900">{mother.children_count}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-600">Last Visit:</span>
                    <span className="text-sm text-gray-900">{formatDate(mother.last_visit)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Children */}
            <Card className="professional-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Baby className="h-5 w-5 text-pink-600" />
                  <span>Children ({children.length})</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {children.length > 0 ? (
                  <div className="space-y-3">
                    {children.map((child) => (
                      <div key={child.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div>
                            <h4 className="font-medium text-gray-900">{child.name}</h4>
                            <p className="text-sm text-gray-600">{child.age_in_months} months old</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Badge className={getHealthStatusColor(child.health_status)}>
                            {child.health_status.replace('_', ' ')}
                          </Badge>
                          <Button
                            size="sm"
                            onClick={() => router.push(`/screening/child/${child.id}`)}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            Screen
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">No children registered yet.</p>
                )}
              </CardContent>
            </Card>

            {/* Visits */}
            <Card className="professional-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5 text-green-600" />
                  <span>Visits ({visits.length})</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {visits.length > 0 ? (
                  <div className="space-y-3">
                    {visits.map((visit) => (
                      <div key={visit.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <h4 className="font-medium text-gray-900 capitalize">{visit.visit_type} Visit</h4>
                          <p className="text-sm text-gray-600">{formatDate(visit.visit_date)}</p>
                          {visit.notes && (
                            <p className="text-sm text-gray-500 mt-1">{visit.notes}</p>
                          )}
                        </div>
                        <Badge className={getVisitStatusColor(visit.status)}>
                          {visit.status.toUpperCase()}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">No visits recorded yet.</p>
                )}
              </CardContent>
            </Card>

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

                        {/* Detailed Medical Readings Display */}
                        {screening.analysis_results?.medicalReadings && (
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <h5 className="text-sm font-medium text-gray-700 mb-3">Medical Device Readings:</h5>
                            
                            {/* Device Info */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                              <div className="space-y-2">
                                <div className="flex justify-between">
                                  <span className="text-sm font-medium text-gray-600">Device Type:</span>
                                  <span className="text-sm text-gray-900 capitalize">{screening.analysis_results.medicalReadings.device_type}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-sm font-medium text-gray-600">Primary Reading:</span>
                                  <span className="text-sm text-gray-900 font-semibold">
                                    {screening.analysis_results.medicalReadings.extracted_values.primary_reading} {screening.analysis_results.medicalReadings.units.primary_unit}
                                  </span>
                                </div>
                                {screening.analysis_results.medicalReadings.extracted_values.secondary_reading && (
                                  <div className="flex justify-between">
                                    <span className="text-sm font-medium text-gray-600">Secondary Reading:</span>
                                    <span className="text-sm text-gray-900 font-semibold">
                                      {screening.analysis_results.medicalReadings.extracted_values.secondary_reading} {screening.analysis_results.medicalReadings.units.secondary_unit}
                                    </span>
                                  </div>
                                )}
                                <div className="flex justify-between">
                                  <span className="text-sm font-medium text-gray-600">Confidence:</span>
                                  <span className="text-sm text-gray-900">{screening.analysis_results.medicalReadings.confidence}%</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-sm font-medium text-gray-600">Reading Quality:</span>
                                  <span className="text-sm text-gray-900 capitalize">{screening.analysis_results.medicalReadings.reading_quality}</span>
                                </div>
                                {screening.analysis_results.medicalReadings.timestamp && (
                                  <div className="flex justify-between">
                                    <span className="text-sm font-medium text-gray-600">Timestamp:</span>
                                    <span className="text-sm text-gray-900">{screening.analysis_results.medicalReadings.timestamp}</span>
                                  </div>
                                )}
                              </div>
                              
                              <div className="space-y-2">
                                <div className="flex justify-between">
                                  <span className="text-sm font-medium text-gray-600">Alert Level:</span>
                                  <span className={`text-sm font-medium ${
                                    screening.analysis_results.medicalReadings.alert_level === 'normal' ? 'text-green-600' :
                                    screening.analysis_results.medicalReadings.alert_level === 'elevated' ? 'text-yellow-600' :
                                    screening.analysis_results.medicalReadings.alert_level === 'high' ? 'text-orange-600' :
                                    'text-red-600'
                                  }`}>
                                    {screening.analysis_results.medicalReadings.alert_level.toUpperCase()}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-sm font-medium text-gray-600">Normal Range:</span>
                                  <span className={`text-sm font-medium ${
                                    screening.analysis_results.medicalReadings.is_normal_range ? 'text-green-600' : 'text-red-600'
                                  }`}>
                                    {screening.analysis_results.medicalReadings.is_normal_range ? 'Yes' : 'No'}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* General Analysis Results Summary */}
                        {!screening.analysis_results?.medicalReadings && screening.analysis_results && (
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <h5 className="text-sm font-medium text-gray-700 mb-2">Analysis Results:</h5>
                            <div className="text-xs text-gray-600 space-y-1">
                              <p><span className="font-medium">Analysis Type:</span> {screening.analysis_type}</p>
                              {screening.condition && (
                                <p><span className="font-medium">Condition:</span> {screening.condition}</p>
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

            {/* Examinations */}
            <Card className="professional-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5 text-green-600" />
                  <span>Examinations ({examinations.length})</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {examinations.length > 0 ? (
                  <div className="space-y-4">
                    {examinations.map((examination) => (
                      <div key={examination.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            <h4 className="font-medium text-gray-900">
                              Health Examination
                            </h4>
                          </div>
                          <Badge className={getHealthStatusColor(examination.health_status)}>
                            {examination.health_status.replace('_', ' ').toUpperCase()}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-sm font-medium text-gray-600">Date:</span>
                              <span className="text-sm text-gray-900">{formatDate(examination.created_at)}</span>
                            </div>
                            {examination.bmi && (
                              <div className="flex justify-between">
                                <span className="text-sm font-medium text-gray-600">BMI:</span>
                                <span className="text-sm text-gray-900 font-semibold">
                                  {examination.bmi} ({examination.bmi_category})
                                </span>
                              </div>
                            )}
                            {examination.notes && (
                              <div className="flex justify-between">
                                <span className="text-sm font-medium text-gray-600">Notes:</span>
                                <span className="text-sm text-gray-900">{examination.notes}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Examination Answers */}
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <h5 className="text-sm font-medium text-gray-700 mb-2">Examination Answers:</h5>
                          <div className="space-y-1">
                            {Object.entries(examination.answers).map(([key, value]) => (
                              <div key={key} className="flex justify-between text-sm">
                                <span className="text-gray-600 capitalize">{key.replace('_', ' ')}:</span>
                                <span className="text-gray-900 font-medium">{value as string}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">No examinations recorded yet.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      <BottomNavigation />
    </div>
  );
} 