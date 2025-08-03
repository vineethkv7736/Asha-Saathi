'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Clock, Navigation, CheckCircle } from 'lucide-react';

const todayVisits = [
  {
    id: 1,
    name: 'Meera Devi',
    address: 'Kakkanad, Kochi',
    time: '9:00 AM',
    type: 'Pregnancy checkup',
    status: 'pending',
    priority: 'high',
    estimatedDuration: '30 min'
  },
  {
    id: 2,
    name: 'Ravi Kumar (Child)',
    address: 'Edapally, Kochi',
    time: '10:30 AM',
    type: 'Vaccination',
    status: 'completed',
    priority: 'medium',
    estimatedDuration: '20 min'
  },
  {
    id: 3,
    name: 'Lakshmi Nair',
    address: 'Palarivattom, Kochi',
    time: '2:00 PM',
    type: 'Post-delivery checkup',
    status: 'pending',
    priority: 'high',
    estimatedDuration: '45 min'
  }
];

export function TodaysRoute() {
  const totalDistance = '12.5 km';
  const estimatedTime = '3 hrs 30 min';
  const completedVisits = todayVisits.filter(visit => visit.status === 'completed').length;

  return (
    <Card className="health-card">
      <CardHeader className='p-0'>
        <div className="flex justify-between items-center mb-4">
          <CardTitle className="text-lg">Today's Route</CardTitle>
          <Button size="sm" variant="outline">
            <Navigation className="h-4 w-4 mr-1" />
            Start Navigation
          </Button>
        </div>
        <div className="flex items-center space-x-4 text-sm text-gray-600">
          <span className="flex items-center">
            <MapPin className="h-4 w-4 mr-1" />
            {totalDistance}
          </span>
          <span className="flex items-center">
            <Clock className="h-4 w-4 mr-1" />
            {estimatedTime}
          </span>
          <span className="flex items-center">
            <CheckCircle className="h-4 w-4 mr-1" />
            {completedVisits}/{todayVisits.length} finished
          </span>
        </div>
      </CardHeader>
      <CardContent className='p-0 mt-6'>
        <div className="space-y-3">
          {todayVisits.map((visit, index) => (
            <div key={visit.id} className="flex items-start space-x-3 p-3 rounded-lg bg-gray-50">
              <div className="flex-shrink-0 mt-1">
                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-medium">
                  {index + 1}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium text-gray-900">{visit.name}</p>
                  <span className="text-xs text-gray-500">{visit.time}</span>
                </div>
                <p className="text-xs text-gray-600 mb-1">{visit.address}</p>
                <p className="text-xs text-blue-600 mb-2">{visit.type}</p>
                <div className="flex items-center space-x-2">
                  <Badge 
                    variant={visit.status === 'completed' ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    {visit.status}
                  </Badge>
                  <Badge 
                    variant={visit.priority === 'high' ? 'destructive' : 'outline'}
                    className="text-xs"
                  >
                    {visit.priority}
                  </Badge>
                  <span className="text-xs text-gray-500">{visit.estimatedDuration}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}