'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, AlertTriangle } from 'lucide-react';

const tasks = [
  {
    id: 1,
    title: 'Visit Meera Devi',
    description: 'Pregnancy checkup - 8 months',
    status: 'pending',
    priority: 'high',
    time: '9:00 AM'
  },
  {
    id: 2,
    title: 'Vaccination - Ravi Kumar',
    description: 'DPT booster due',
    status: 'completed',
    priority: 'medium',
    time: '10:30 AM'
  },
  {
    id: 3,
    title: 'Health screening - Lakshmi',
    description: 'Post-delivery checkup',
    status: 'pending',
    priority: 'high',
    time: '2:00 PM'
  }
];

export function TodaysTasks() {
  return (
    <Card className="health-card">
      <CardHeader className='p-0 my-4'>
        <CardTitle className="text-lg">Today's Tasks</CardTitle>
      </CardHeader>
      <CardContent className='p-0'>
        <div className="space-y-3">
          {tasks.map((task) => (
            <div key={task.id} className="flex items-start space-x-3 p-3 rounded-lg bg-gray-50">
              <div className="flex-shrink-0 mt-1">
                {task.status === 'completed' ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : task.priority === 'high' ? (
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                ) : (
                  <Clock className="h-5 w-5 text-yellow-500" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium text-gray-900">{task.title}</p>
                  <span className="text-xs text-gray-500">{task.time}</span>
                </div>
                <p className="text-xs text-gray-600 mb-2">{task.description}</p>
                <div className="flex items-center space-x-2">
                  <Badge 
                    variant={task.status === 'completed' ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    {task.status}
                  </Badge>
                  <Badge 
                    variant={task.priority === 'high' ? 'destructive' : 'outline'}
                    className="text-xs"
                  >
                    {task.priority}
                  </Badge>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}