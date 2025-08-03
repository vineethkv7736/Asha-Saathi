'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Users, Baby, AlertTriangle, CheckCircle, Calendar, Activity } from 'lucide-react';
import { useState, useEffect } from 'react';
import { dashboardService } from '@/lib/database';

interface Stats {
  totalMothers: number;
  totalChildren: number;
  highRiskMothers: number;
  childrenNeedingAttention: number;
  totalVisits: number;
  todayVisits: number;
}

export function DashboardStats() {
  const [stats, setStats] = useState<Stats>({
    totalMothers: 0,
    totalChildren: 0,
    highRiskMothers: 0,
    childrenNeedingAttention: 0,
    totalVisits: 0,
    todayVisits: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await dashboardService.getStats();
        setStats(data);
      } catch (error) {
        console.error('Error loading stats:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  const statsData = [
    {
      title: 'Total Mothers',
      value: stats.totalMothers.toString(),
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-gradient-to-br from-blue-50 to-blue-100',
      borderColor: 'border-blue-200',
      gradient: 'from-blue-500 to-blue-600'
    },
    {
      title: 'Total Children',
      value: stats.totalChildren.toString(),
      icon: Baby,
      color: 'text-green-600',
      bgColor: 'bg-gradient-to-br from-green-50 to-green-100',
      borderColor: 'border-green-200',
      gradient: 'from-green-500 to-green-600'
    },
    {
      title: 'High Risk Mothers',
      value: stats.highRiskMothers.toString(),
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-gradient-to-br from-red-50 to-red-100',
      borderColor: 'border-red-200',
      gradient: 'from-red-500 to-red-600'
    },
    {
      title: 'Today\'s Visits',
      value: stats.todayVisits.toString(),
      icon: Calendar,
      color: 'text-purple-600',
      bgColor: 'bg-gradient-to-br from-purple-50 to-purple-100',
      borderColor: 'border-purple-200',
      gradient: 'from-purple-500 to-purple-600'
    }
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded mb-3"></div>
                <div className="h-6 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {statsData.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index} className={`border-0 shadow-sm hover:shadow-md transition-all duration-200 ${stat.bgColor} ${stat.borderColor}`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</p>
                  <p className="text-sm text-gray-600 font-medium">{stat.title}</p>
                </div>
                <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.gradient} shadow-sm`}>
                  <Icon className={`h-6 w-6 text-white`} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}