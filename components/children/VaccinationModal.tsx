'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { X, CheckCircle, AlertCircle } from 'lucide-react';
import { vaccinationService, Vaccination } from '@/lib/database';

interface VaccinationModalProps {
  childId: string;
  childName: string;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

const VACCINE_LIST = [
  { id: 'bcg', name: 'BCG Vaccine', description: 'Bacillus Calmette-Guérin vaccine for tuberculosis' },
  { id: 'opv_0', name: 'OPV-0 (Oral Polio Vaccine)', description: 'Oral polio vaccine dose' },
  { id: 'hepatitis_b', name: 'Hepatitis B Birth Dose', description: 'Hepatitis B vaccine at birth' },
  { id: 'pentavalent_1', name: 'Pentavalent-1 Vaccine', description: 'Combined vaccine for multiple diseases' },
  { id: 'rotavirus_1', name: 'Rotavirus Vaccine First Dose', description: 'Rotavirus vaccine to prevent diarrhea' },
  { id: 'measles_rubella_1', name: 'Measles-Rubella (MR-1)', description: 'Measles and rubella combined vaccine' }
];

export default function VaccinationModal({ childId, childName, isOpen, onClose, onUpdate }: VaccinationModalProps) {
  const [vaccination, setVaccination] = useState<Vaccination | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [vaccineStatus, setVaccineStatus] = useState({
    bcg: false,
    opv_0: false,
    hepatitis_b: false,
    pentavalent_1: false,
    rotavirus_1: false,
    measles_rubella_1: false
  });

  useEffect(() => {
    if (isOpen && childId) {
      loadVaccinationData();
    }
  }, [isOpen, childId]);

  const loadVaccinationData = async () => {
    try {
      setLoading(true);
      let vaccinationData = await vaccinationService.getByChildId(childId);
      
      if (!vaccinationData) {
        // Create new vaccination record if none exists
        vaccinationData = await vaccinationService.create({
          child_id: childId,
          bcg: false,
          opv_0: false,
          hepatitis_b: false,
          pentavalent_1: false,
          rotavirus_1: false,
          measles_rubella_1: false,
          total_vaccines: 6,
          completed_vaccines: 0,
          progress_percentage: 0,
          last_updated: new Date().toISOString()
        });
      }
      
      if (vaccinationData) {
        setVaccination(vaccinationData);
        setVaccineStatus({
          bcg: vaccinationData.bcg,
          opv_0: vaccinationData.opv_0,
          hepatitis_b: vaccinationData.hepatitis_b,
          pentavalent_1: vaccinationData.pentavalent_1,
          rotavirus_1: vaccinationData.rotavirus_1,
          measles_rubella_1: vaccinationData.measles_rubella_1
        });
      }
    } catch (error) {
      console.error('Error loading vaccination data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVaccineToggle = (vaccineId: keyof typeof vaccineStatus) => {
    setVaccineStatus(prev => ({
      ...prev,
      [vaccineId]: !prev[vaccineId]
    }));
  };

  const handleSave = async () => {
    if (!vaccination) return;
    
    try {
      setSaving(true);
      await vaccinationService.updateProgress(vaccination.id, vaccineStatus);
      onUpdate();
      onClose();
    } catch (error) {
      console.error('Error saving vaccination data:', error);
    } finally {
      setSaving(false);
    }
  };

  const calculateProgress = () => {
    const completed = Object.values(vaccineStatus).filter(v => v).length;
    return Math.round((completed / 6) * 100);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-xl font-semibold">
            Vaccination Tracking - {childName}
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <>
              {/* Progress Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Vaccination Progress</h3>
                  <span className="text-sm font-medium text-blue-600">
                    {Object.values(vaccineStatus).filter(v => v).length}/6 Completed
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${calculateProgress()}%` }}
                  ></div>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  {calculateProgress() === 100 ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                  )}
                  <span>
                    {calculateProgress() === 100 
                      ? 'All vaccines completed!' 
                      : `${6 - Object.values(vaccineStatus).filter(v => v).length} vaccines remaining`
                    }
                  </span>
                </div>
              </div>

              {/* Vaccine List */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Vaccine Checklist</h3>
                <div className="space-y-3">
                  {VACCINE_LIST.map((vaccine) => (
                    <div key={vaccine.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                      <Checkbox
                        id={vaccine.id}
                        checked={vaccineStatus[vaccine.id as keyof typeof vaccineStatus]}
                        onCheckedChange={() => handleVaccineToggle(vaccine.id as keyof typeof vaccineStatus)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <Label 
                          htmlFor={vaccine.id} 
                          className="text-sm font-medium cursor-pointer"
                        >
                          {vaccine.name}
                        </Label>
                        <p className="text-xs text-gray-600 mt-1">
                          {vaccine.description}
                        </p>
                      </div>
                      {vaccineStatus[vaccine.id as keyof typeof vaccineStatus] && (
                        <CheckCircle className="h-4 w-4 text-green-600 mt-1" />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={onClose}
                  disabled={saving}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 