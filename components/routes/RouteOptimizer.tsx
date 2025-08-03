'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Clock, Fuel, BarChart } from 'lucide-react';

const routeStats = [
  {
    label: 'Total Distance',
    value: '15.2 km',
    icon: MapPin,
    color: 'text-blue-600'
  },
  {
    label: 'Estimated Time',
    value: '4h 15m',
    icon: Clock,
    color: 'text-green-600'
  },
  {
    label: 'Fuel Cost',
    value: '₹85',
    icon: Fuel,
    color: 'text-orange-600'
  },
  {
    label: 'Efficiency',
    value: '92%',
    icon: BarChart,
    color: 'text-purple-600'
  }
];

export function RouteOptimizer() {
  return (
    <Card className="health-card">
      <CardHeader className='p-0 mt-4 mb-2'>
        <div className="flex justify-between items-center mb-4">
          <CardTitle className="text-lg">Route Optimization</CardTitle>
          <Badge variant="outline" className="text-green-600 border-green-600">
            Optimized
          </Badge>
        </div>
      </CardHeader>
      <CardContent className='p-0'>
        <div className="grid grid-cols-2 gap-4 mb-4">
          {routeStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                <Icon className={`h-5 w-5 ${stat.color}`} />
                <div>
                  <p className="text-xs text-gray-600">{stat.label}</p>
                  <p className="text-sm font-semibold text-gray-900">{stat.value}</p>
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="space-y-3">
          <div className="p-3 bg-green-50 rounded-lg border border-green-200">
            <p className="text-sm text-green-800 font-medium mb-1">
              Optimization Suggestions
            </p>
            <ul className="text-xs text-green-700 space-y-1">
              <li>• Route rearranged to reduce travel time by 45 minutes</li>
              <li>• Grouped nearby visits for better efficiency</li>
              <li>• High-priority visits scheduled for morning hours</li>
            </ul>
          </div>
          
          <Button className="w-full">
            <MapPin className="h-4 w-4 mr-2" />
            View Route on Map
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}