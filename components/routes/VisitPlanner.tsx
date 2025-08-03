'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { CalendarDays, Plus, Shuffle } from 'lucide-react';
import { useState } from 'react';

const pendingVisits = [
  {
    id: 1,
    name: 'Sunita Sharma',
    type: 'Health checkup',
    priority: 'medium',
    dueDate: '2024-01-16',
    selected: false
  },
  {
    id: 2,
    name: 'Baby Arjun',
    type: 'Growth monitoring',
    priority: 'low',
    dueDate: '2024-01-17',
    selected: false
  },
  {
    id: 3,
    name: 'Priya Nair',
    type: 'Vaccination',
    priority: 'high',
    dueDate: '2024-01-16',
    selected: false
  }
];

export function VisitPlanner() {
  const [visits, setVisits] = useState(pendingVisits);

  const toggleVisitSelection = (id: number) => {
    setVisits(visits.map(visit => 
      visit.id === id ? { ...visit, selected: !visit.selected } : visit
    ));
  };

  const selectedCount = visits.filter(visit => visit.selected).length;

  return (
    <Card className="health-card">
      <CardHeader className='p-0 my-4'>
        <div className="flex flex-col justify-between items-center">
          <CardTitle className="text-lg mb-2">Plan Tomorrow's Visits</CardTitle>
          <div className="flex space-x-2">
            <Button size="sm" variant="outline">
              <Plus className="h-4 w-4 mr-1" />
              Add Visit
            </Button>
            <Button size="sm" disabled={selectedCount === 0}>
              <Shuffle className="h-4 w-4 mr-1" />
              Optimize Route
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className='p-0'>
        <div className="space-y-3">
          {visits.map((visit) => (
            <div key={visit.id} className="flex items-start space-x-3 p-3 rounded-lg border border-gray-200">
              <Checkbox 
                checked={visit.selected}
                onCheckedChange={() => toggleVisitSelection(visit.id)}
                className="mt-1"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium text-gray-900">{visit.name}</p>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    visit.priority === 'high' ? 'bg-red-100 text-red-800' :
                    visit.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {visit.priority}
                  </span>
                </div>
                <p className="text-xs text-gray-600 mb-1">{visit.type}</p>
                <div className="flex items-center text-xs text-gray-500">
                  <CalendarDays className="h-3 w-3 mr-1" />
                  Due: {new Date(visit.dueDate).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {selectedCount > 0 && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              {selectedCount} visit{selectedCount > 1 ? 's' : ''} selected for route optimization
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}