'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserPlus, Baby, Camera, MapPin } from 'lucide-react';
import Link from 'next/link';

const actions = [
  {
    title: 'Add Mother',
    description: 'Register new mother',
    icon: UserPlus,
    href: '/mothers?action=add',
    color: 'bg-blue-500 hover:bg-blue-600'
  },
  {
    title: 'Add Child',
    description: 'Register new child',
    icon: Baby,
    href: '/children?action=add',
    color: 'bg-green-500 hover:bg-green-600'
  },
  {
    title: 'AI Screening',
    description: 'Photo-based health check',
    icon: Camera,
    href: '/screening',
    color: 'bg-purple-500 hover:bg-purple-600'
  },
  {
    title: 'Plan Route',
    description: 'Optimize daily visits',
    icon: MapPin,
    href: '/routes',
    color: 'bg-orange-500 hover:bg-orange-600'
  }
];

export function QuickActions() {
  return (
    <Card className="health-card">
      <CardContent className='p-0'>        <div className="grid grid-cols-2 gap-3">
          {actions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Link key={index} href={action.href}>
                <Button
                  variant="outline"
                  className="w-full h-auto p-4 flex flex-col items-center space-y-2 hover:shadow-md transition-all"
                >
                  <div className={`p-3 rounded-full text-white ${action.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="text-center">
                    <p className="font-medium text-sm">{action.title}</p>
                    <p className="text-xs text-gray-500 mt-1">{action.description}</p>
                  </div>
                </Button>
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}