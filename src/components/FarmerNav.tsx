import { Link, useLocation } from 'react-router-dom';
import {
  Home,
  Package,
  Gavel,
  ShoppingCart,
  User,
  Settings,
  FileText,
  Calendar
} from 'lucide-react';
import { cn } from '../lib/utils';

const navigationItems = [
  {
    name: 'Dashboard',
    href: '/farmer/dashboard',
    icon: Home,
  },
  {
    name: 'Products',
    href: '/farmer/products',
    icon: Package,
  },
  {
    name: 'Auctions',
    href: '/farmer/auctions',
    icon: Gavel,
  },
  {
    name: 'Orders',
    href: '/farmer/orders',
    icon: ShoppingCart,
  },
  {
    name: 'Appointments',
    href: '/farmer/appointments',
    icon: Calendar,
  },
  {
    name: 'Reports',
    href: '/farmer/reports',
    icon: FileText,
  },
  {
    name: 'Profile',
    href: '/farmer/profile',
    icon: User,
  },
  {
    name: 'Settings',
    href: '/farmer/settings',
    icon: Settings,
  },
];

export default function FarmerNav() {
  const location = useLocation();

  return (
    <nav className="flex flex-col space-y-1">
      {navigationItems.map((item) => {
        const isActive = location.pathname === item.href;
        return (
          <Link
            key={item.name}
            to={item.href}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900',
              isActive && 'bg-gray-100 text-gray-900'
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.name}
          </Link>
        );
      })}
    </nav>
  );
} 