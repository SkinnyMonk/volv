'use client';

import { ChevronRight, Trash2, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { getAllLayouts, deleteLayout } from '@/lib/layoutStorage';
import { CustomLayout } from '@/types/layout';

export default function TemplateSelector() {
  const router = useRouter();
  const [customLayouts, setCustomLayouts] = useState<CustomLayout[]>(() => getAllLayouts());

  const templates = [
    {
      id: 1,
      title: 'Blank Layout',
      description: 'Start from a blank canvas and design your own unique layout',
      icon: '🎨',
      widgets: [],
      color: 'from-blue-600 to-blue-400',
    },
    {
      id: 2,
      title: 'Chart & Market Watch',
      description: 'Monitor market data and trading charts at a glance',
      icon: '📈',
      widgets: [1, 6], // Chart, Market Watch
      color: 'from-green-600 to-green-400',
    },
    {
      id: 3,
      title: 'Trading Dashboard',
      description: 'Complete trading setup with positions, orders, and market depth',
      icon: '📊',
      widgets: [3, 4, 5], // Positions, Orders, Market Depth
      color: 'from-purple-600 to-purple-400',
    },
    {
      id: 4,
      title: 'Option Chain Pro',
      description: 'Specialized layout for option trading and analysis',
      icon: '🎯',
      widgets: [2, 1, 6], // Option Chain, Chart, Market Watch
      color: 'from-orange-600 to-orange-400',
    },
  ];

  const handleSelectTemplate = (templateId: number) => {
    // Redirect to layout page with template info
    router.push(`/layout?template=${templateId}`);
  };

  const handleOpenCustomLayout = (layoutId: string) => {
    router.push(`/layout?layoutId=${layoutId}`);
  };

  const handleDeleteCustomLayout = (e: React.MouseEvent, layoutId: string) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this layout?')) {
      deleteLayout(layoutId);
      setCustomLayouts(customLayouts.filter((l) => l.id !== layoutId));
    }
  };

  return (
    <main className="min-h-screen w-screen bg-linear-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="border-b border-gray-700 bg-slate-900 bg-opacity-50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-8 py-12">
          <h1 className="text-5xl font-bold text-white mb-3">Create Your Layout</h1>
          <p className="text-gray-300 text-lg">
            Choose a template or continue with your custom layouts
          </p>
        </div>
      </div>

      {/* Custom Layouts Section */}
      {customLayouts.length > 0 && (
        <div className="border-b border-gray-700 bg-slate-800 bg-opacity-30">
          <div className="max-w-7xl mx-auto px-8 py-12">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">Your Custom Layouts</h2>
              <p className="text-gray-400">Continue working on your saved layouts</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {customLayouts.map((layout) => (
                <div
                  key={layout.id}
                  onClick={() => handleOpenCustomLayout(layout.id)}
                  className="group cursor-pointer rounded-xl bg-linear-to-br from-slate-700 to-slate-800 border border-gray-600 hover:border-blue-400 p-6 transition-all duration-300 hover:shadow-xl"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors">
                        {layout.name}
                      </h3>
                      <p className="text-xs text-gray-400 mt-1">
                        {layout.widgets.length} widget{layout.widgets.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <button
                      onClick={(e) => handleDeleteCustomLayout(e, layout.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-red-600 rounded-lg"
                      title="Delete layout"
                    >
                      <Trash2 size={16} className="text-white" />
                    </button>
                  </div>

                  {/* Layout ID */}
                  <div className="mb-4 p-3 bg-slate-900 rounded-lg">
                    <p className="text-xs text-gray-400">Layout ID</p>
                    <p className="text-xs font-mono text-blue-400 truncate">{layout.id}</p>
                  </div>

                  {/* Updated Time */}
                  <p className="text-xs text-gray-500 mb-4">
                    Updated {new Date(layout.updatedAt).toLocaleDateString()}
                  </p>

                  {/* CTA */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-600 group-hover:border-blue-600 transition-colors">
                    <span className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">
                      Continue editing
                    </span>
                    <ArrowRight className="w-4 h-4 text-blue-400 group-hover:translate-x-1 transition-transform duration-200" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Preset Templates Section */}
      <div className="max-w-7xl mx-auto px-8 py-16">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">Preset Templates</h2>
          <p className="text-gray-400">Start with a pre-configured layout</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {templates.map((template) => (
            <div
              key={template.id}
              className="group cursor-pointer"
              onClick={() => handleSelectTemplate(template.id)}
            >
              {/* Card Container */}
              <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-slate-800 to-slate-700 border border-gray-600 hover:border-gray-400 transition-all duration-300 hover:shadow-2xl h-full">
                
                {/* Gradient Background */}
                <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 bg-linear-to-br ${template.color} transition-opacity duration-300`} />
                
                {/* Content */}
                <div className="relative p-8 h-full flex flex-col justify-between">
                  {/* Top Section */}
                  <div>
                    {/* Icon */}
                    <div className="w-16 h-16 rounded-xl bg-slate-700 group-hover:bg-slate-600 flex items-center justify-center text-4xl mb-6 transition-all duration-300 group-hover:scale-110">
                      {template.icon}
                    </div>

                    {/* Title */}
                    <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-blue-400 transition-colors duration-200">
                      {template.title}
                    </h3>

                    {/* Description */}
                    <p className="text-gray-300 text-base leading-relaxed mb-6">
                      {template.description}
                    </p>
                  </div>

                  {/* Widget Preview Pills */}
                  {template.widgets.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-6">
                      {[
                        { id: 1, name: 'Chart' },
                        { id: 2, name: 'Option Chain' },
                        { id: 3, name: 'Positions' },
                        { id: 4, name: 'Orders' },
                        { id: 5, name: 'Market Depth' },
                        { id: 6, name: 'Market Watch' },
                      ]
                        .filter((w) => template.widgets.includes(w.id))
                        .map((widget) => (
                          <span
                            key={widget.id}
                            className="px-3 py-1 rounded-full text-xs font-medium bg-slate-700 text-gray-200 border border-gray-600"
                          >
                            {widget.name}
                          </span>
                        ))}
                    </div>
                  )}

                  {/* Bottom Section with CTA */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-600 group-hover:border-gray-500 transition-colors">
                    <span className="text-sm font-semibold text-gray-300 group-hover:text-white transition-colors">
                      {template.widgets.length === 0
                        ? 'Start from scratch'
                        : `${template.widgets.length} pre-configured widgets`}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-white font-semibold group-hover:block hidden transition-all duration-200">
                        Get Started
                      </span>
                      <ChevronRight className="w-5 h-5 text-blue-400 group-hover:translate-x-1 transition-transform duration-200" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Info */}
      <div className="border-t border-gray-700 mt-16 py-8 bg-slate-900 bg-opacity-50">
        <div className="max-w-7xl mx-auto px-8 text-center">
          <p className="text-gray-400 text-sm">
            💡 Tip: All templates are fully customizable. Add, remove, or resize widgets anytime. Your custom layouts are automatically saved.
          </p>
        </div>
      </div>
    </main>
  );
}
