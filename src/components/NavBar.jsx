import React from 'react';
import { Home, Utensils, MessageCircle } from 'lucide-react';

const tabs = [
  { key: 'Dashboard', label: 'Dashboard', icon: Home },
  { key: 'Logs', label: 'Food & Workout', icon: Utensils },
  { key: 'Coach', label: 'Coach', icon: MessageCircle },
];

export default function NavBar({ active, onChange }) {
  return (
    <nav className="flex gap-2 overflow-x-auto rounded-xl border border-orange-100 bg-white p-2 shadow-sm">
      {tabs.map((t) => {
        const Icon = t.icon;
        const isActive = active === t.key;
        return (
          <button
            key={t.key}
            onClick={() => onChange(t.key)}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm transition-all ${
              isActive
                ? 'bg-orange-500 text-white shadow'
                : 'text-slate-600 hover:bg-orange-50 hover:text-orange-600'
            }`}
          >
            <Icon size={18} />
            {t.label}
          </button>
        );
      })}
    </nav>
  );
}
