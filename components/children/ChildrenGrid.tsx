'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Users, Camera, Eye } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { childService, motherService } from '@/lib/database';
import type { Database } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

type Child = Database['public']['Tables']['children']['Row'];
type Mother = Database['public']['Tables']['mothers']['Row'];

interface ChildrenGridProps {
  searchTerm: string;
  filterAge: string;
}

export function ChildrenGrid({ searchTerm, filterAge }: ChildrenGridProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [children, setChildren] = useState<Child[]>([]);
  const [mothers, setMothers] = useState<Mother[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [childrenData, mothersData] = await Promise.all([
          childService.getAll(),
          motherService.getAll()
        ]);
        setChildren(childrenData);
        setMothers(mothersData);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const getMotherName = (motherId: string) => {
    const mother = mothers.find(m => m.id === motherId);
    return mother?.name || 'Unknown Mother';
  };

  const getAgeString = (ageInMonths: number) => {
    if (ageInMonths < 12) {
      return `${ageInMonths} month${ageInMonths !== 1 ? 's' : ''}`;
    } else {
      const years = Math.floor(ageInMonths / 12);
      const months = ageInMonths % 12;
      if (months === 0) {
        return `${years} year${years !== 1 ? 's' : ''}`;
      } else {
        return `${years} year${years !== 1 ? 's' : ''} ${months} month${months !== 1 ? 's' : ''}`;
      }
    }
  };

  const filteredChildren = children.filter(child => {
    const motherName = getMotherName(child.mother_id);
    const matchesSearch = child.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         motherName.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesFilter = true;
    if (filterAge !== 'all') {
      switch (filterAge) {
        case '0-6m':
          matchesFilter = child.age_in_months <= 6;
          break;
        case '6-12m':
          matchesFilter = child.age_in_months > 6 && child.age_in_months <= 12;
          break;
        case '1-2y':
          matchesFilter = child.age_in_months > 12 && child.age_in_months <= 24;
          break;
        case '2-5y':
          matchesFilter = child.age_in_months > 24 && child.age_in_months <= 60;
          break;
      }
    }
    
    return matchesSearch && matchesFilter;
  });

  const getHealthStatusColor = (status: string) => {
    switch (status) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'needs_attention': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'good': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {filteredChildren.map((child) => (
        <Card key={child.id} className="health-card">
          <CardContent className="p-4">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-semibold text-lg text-gray-900">{child.name}</h3>
                <p className="text-sm text-gray-600">{getAgeString(child.age_in_months)}</p>
                <p className="text-sm text-blue-600">Mother: {getMotherName(child.mother_id)}</p>
              </div>
              <div className="flex flex-col items-end space-y-1">
                <Badge className={getHealthStatusColor(child.health_status)}>
                  {child.health_status.replace('_', ' ').toUpperCase()}
                </Badge>
                {child.has_photo && (
                  <Badge variant="outline" className="text-xs">
                    <Camera className="h-3 w-3 mr-1" />
                    AI Screened
                  </Badge>
                )}
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center text-sm text-gray-600">
                <Calendar className="h-4 w-4 mr-2" />
                Last screening: {new Date(child.last_screening).toLocaleDateString()}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Users className="h-4 w-4 mr-2" />
                Vaccinations: {child.vaccinations_completed}/{child.vaccinations_total}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex-1 bg-gray-200 rounded-full h-2 mr-4">
                <div 
                  className="bg-blue-600 h-2 rounded-full" 
                  style={{ 
                    width: `${(child.vaccinations_completed / child.vaccinations_total) * 100}%` 
                  }}
                ></div>
              </div>
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  onClick={() => router.push(`/screening/child/${child.id}`)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Screen
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => router.push(`/children/${child.id}`)}
                  className="border-gray-300 hover:bg-gray-50"
                >
                  View
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      
      {filteredChildren.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No children found matching your criteria.
        </div>
      )}
    </div>
  );
}