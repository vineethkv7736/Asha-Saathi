'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Info, CheckCircle } from 'lucide-react';

const alerts = [
  {
    id: 1,
    type: 'warning',
    title: 'High BP Alert',
    message: 'Sunita Sharma - BP reading 150/90 mmHg',
    time: '2 hours ago'
  },
  {
    id: 2,
    type: 'info',
    title: 'Vaccination Due',
    message: '3 children have pending vaccinations',
    time: '4 hours ago'
  },
  {
    id: 3,
    type: 'success',
    title: 'Health Screening Complete',
    message: 'AI screening completed for 5 children',
    time: '6 hours ago'
  }
];

export function RecentAlerts() {
  return (
    <Card className="health-card">
      <CardHeader className='p-0 my-4'>
        <CardTitle className="text-lg">Recent Alerts</CardTitle>
      </CardHeader>
      <CardContent className='p-0'>
        <div className="space-y-3">
          {alerts.map((alert) => {
            const Icon = alert.type === 'warning' ? AlertTriangle : 
                        alert.type === 'success' ? CheckCircle : Info;
            const variant = alert.type === 'warning' ? 'destructive' : 'default';
            
            return (
              <Alert key={alert.id} variant={variant} className="py-3">
                <Icon className="h-4 w-4" />
                <AlertDescription>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-sm">{alert.title}</p>
                      <p className="text-sm mt-1">{alert.message}</p>
                    </div>
                    <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                      {alert.time}
                    </span>
                  </div>
                </AlertDescription>
              </Alert>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}