'use client';

import { ChevronRight } from 'lucide-react';

interface Template {
  id: number;
  title: string;
  description: string;
  icon: string;
  widgets: number[];
  color: string;
}

interface LayoutTemplateSelectorProps {
  onSelectTemplate: (templateId: number) => void;
}

const TEMPLATES: Template[] = [
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
    title: 'Scalper',
    description: 'Optimized for quick intraday options trading',
    icon: '📈',
    widgets: [1, 6],
    color: 'from-green-600 to-green-400',
  },
  {
    id: 3,
    title: 'Trader',
    description: 'Complete trading setup with positions, orders, and market depth',
    icon: '📊',
    widgets: [3, 4, 5],
    color: 'from-purple-600 to-purple-400',
  },
  {
    id: 4,
    title: 'Options',
    description: 'Specialized layout for option trading and analysis',
    icon: '🎯',
    widgets: [2, 1, 6],
    color: 'from-orange-600 to-orange-400',
  },
];

export default function LayoutTemplateSelector({ onSelectTemplate }: LayoutTemplateSelectorProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold text-white mb-2">Choose a Layout Template</h2>
        <p className="text-gray-400">Select a template to get started or begin from scratch</p>
      </div>

      {/* Template Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl w-full">
        {TEMPLATES.map((template) => (
          <button
            key={template.id}
            onClick={() => onSelectTemplate(template.id)}
            className="group cursor-pointer text-left"
          >
            {/* Card */}
            <div className="relative overflow-hidden rounded-xl bg-linear-to-br from-slate-800 to-slate-700 border border-gray-600 hover:border-gray-400 transition-all duration-300 hover:shadow-2xl p-6 h-full">
              {/* Gradient Background */}
              <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 bg-linear-to-br ${template.color} transition-opacity duration-300`} />

              {/* Content */}
              <div className="relative flex flex-col justify-between h-full">
                {/* Icon */}
                <div className="w-14 h-14 rounded-lg bg-slate-700 group-hover:bg-slate-600 flex items-center justify-center text-3xl mb-4 transition-all duration-300 group-hover:scale-110">
                  {template.icon}
                </div>

                {/* Title & Description */}
                <div>
                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors duration-200">
                    {template.title}
                  </h3>
                  <p className="text-gray-400 text-sm leading-relaxed mb-4">
                    {template.description}
                  </p>
                </div>

                {/* Bottom Info */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-600 group-hover:border-gray-500 transition-colors">
                  <span className="text-xs font-semibold text-gray-400 group-hover:text-gray-300 transition-colors">
                    {template.widgets.length === 0
                      ? 'Start from scratch'
                      : `${template.widgets.length} pre-configured widgets`}
                  </span>
                  <ChevronRight className="w-4 h-4 text-blue-400 group-hover:translate-x-1 transition-transform duration-200" />
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
