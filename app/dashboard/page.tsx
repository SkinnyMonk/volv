'use client';

import Link from 'next/link';
import {
  TrendingUp,
  BarChart3,
  List,
  Eye,
  Layers,
  Share2,
} from 'lucide-react';

interface WidgetCard {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  color: string;
}

const widgets: WidgetCard[] = [
  {
    id: 'chart',
    name: 'Chart',
    description: 'Real-time price charts and technical analysis',
    icon: <TrendingUp className="w-8 h-8" />,
    href: '/widgets/chart',
    color: 'from-blue-600 to-blue-400',
  },
  {
    id: 'market-watch',
    name: 'Market Watch',
    description: 'Track your favorite stocks and market movers',
    icon: <Eye className="w-8 h-8" />,
    href: '/widgets/market-watch',
    color: 'from-green-600 to-green-400',
  },
  {
    id: 'market-depth',
    name: 'Market Depth',
    description: 'View bid-ask levels and order book depth',
    icon: <Layers className="w-8 h-8" />,
    href: '/widgets/market-depth',
    color: 'from-purple-600 to-purple-400',
  },
  {
    id: 'option-chain',
    name: 'Option Chain',
    description: 'Analyze options data and implied volatility',
    icon: <BarChart3 className="w-8 h-8" />,
    href: '/widgets/option-chain',
    color: 'from-orange-600 to-orange-400',
  },
  {
    id: 'positions',
    name: 'Positions',
    description: 'Manage and monitor your portfolio positions',
    icon: <Share2 className="w-8 h-8" />,
    href: '/widgets/positions',
    color: 'from-pink-600 to-pink-400',
  },
  {
    id: 'orders',
    name: 'Orders',
    description: 'View all your active and historical orders',
    icon: <List className="w-8 h-8" />,
    href: '/widgets/orders',
    color: 'from-red-600 to-red-400',
  },
];

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-950">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="space-y-8">
      <div>
       
      </div>

      {/* Widgets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {widgets.map((widget) => (
          <Link
            key={widget.id}
            href={widget.href}
            className="group relative block h-full"
          >
            <div className="absolute inset-0 bg-linear-to-br opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-lg" />
            <div className="relative bg-gray-900 border border-gray-800 rounded-lg p-6 hover:border-gray-700 transition-all duration-300 transform group-hover:scale-105 cursor-pointer h-full flex flex-col">
              {/* Gradient background on hover */}
              <div
                className={`absolute inset-0 bg-linear-to-br ${widget.color} opacity-0 group-hover:opacity-5 rounded-lg transition-opacity duration-300`}
              />

              <div className="relative z-10 flex-1 flex flex-col">
                <div
                  className={`inline-block p-3 rounded-lg bg-linear-to-br ${widget.color} text-white mb-4 self-start`}
                >
                  {widget.icon}
                </div>

                <h2 className="text-xl font-semibold text-white group-hover:text-gray-100 transition-colors mb-2">
                  {widget.name}
                </h2>

                <p className="text-gray-400 text-sm leading-relaxed flex-1">
                  {widget.description}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
        </div>
      </div>
    </div>
  );
}
