'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Phone, Eye, Camera } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { motherService } from '@/lib/database';
import type { Database } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

type Mother = Database['public']['Tables']['mothers']['Row'];

interface MothersGridProps {
  searchTerm: string;
  filterRisk: string;
}

export function MothersGrid({ searchTerm, filterRisk }: MothersGridProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [mothers, setMothers] = useState<Mother[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMothers = async () => {
      try {
        const data = await motherService.getAll();
        setMothers(data);
      } catch (error) {
        console.error('Error loading mothers:', error);
      } finally {
        setLoading(false);
      }
    };

    loadMothers();
  }, []);

  const filteredMothers = mothers.filter(mother => {
    const matchesSearch = mother.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         mother.address.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterRisk === 'all' || mother.risk_level === filterRisk;
    
    return matchesSearch && matchesFilter;
  });

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
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
      {filteredMothers.map((mother) => (
        <Card key={mother.id} className={`health-card risk-${mother.risk_level}`}>
          <CardContent className="p-4">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-semibold text-lg text-gray-900">{mother.name}</h3>
                <p className="text-sm text-gray-600">Age: {mother.age} years</p>
                {mother.pregnancy_week && (
                  <p className="text-sm text-blue-600 font-medium">
                    {mother.pregnancy_week} weeks pregnant
                  </p>
                )}
              </div>
              <Badge className={getRiskColor(mother.risk_level)}>
                {mother.risk_level.toUpperCase()} RISK
              </Badge>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center text-sm text-gray-600">
                <Phone className="h-4 w-4 mr-2" />
                {mother.mobile}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <MapPin className="h-4 w-4 mr-2" />
                {mother.address}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Calendar className="h-4 w-4 mr-2" />
                Last visit: {new Date(mother.last_visit).toLocaleDateString()}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Children: {mother.children_count}
              </div>
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  onClick={() => router.push(`/screening/mother/${mother.id}`)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Screen
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => router.push(`/mothers/${mother.id}`)}
                  className="border-gray-300 hover:bg-gray-50"
                >
                  View
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      
      {filteredMothers.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No mothers found matching your criteria.
        </div>
      )}
    </div>
  );
}