'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Users, Baby, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/dashboard', icon: Home, label: 'Dashboard' },
  { href: '/mothers', icon: Users, label: 'Mothers' },
  { href: '/children', icon: Baby, label: 'Children' },
  { href: '/routes', icon: MapPin, label: 'Routes' },
];

export function BottomNavigation() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-gray-200 shadow-lg px-4 py-3 z-50">
      <div className="flex justify-around max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center py-2 px-4 rounded-xl transition-all duration-200 relative group",
                isActive 
                  ? "text-white bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg transform scale-105" 
                  : "text-gray-600 hover:text-blue-600 hover:bg-blue-50"
              )}
            >
              <div className={cn(
                "p-2 rounded-lg transition-all duration-200",
                isActive 
                  ? "bg-white/20" 
                  : "group-hover:bg-blue-100"
              )}>
                <Icon className={cn(
                  "h-5 w-5 transition-all duration-200",
                  isActive ? "text-white" : "group-hover:text-blue-600"
                )} />
              </div>
              <span className={cn(
                "text-xs font-medium mt-1 transition-all duration-200",
                isActive ? "text-white" : "group-hover:text-blue-600"
              )}>
                {item.label}
              </span>
              
              {/* Active indicator */}
              {isActive && (
                <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-white rounded-full"></div>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}