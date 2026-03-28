import React from 'react';
import { CheckCircle, Clock, AlertTriangle, MessageSquare } from 'lucide-react';

const StatsOverview = ({ stats }) => {
  const getCount = (status) => stats.find(s => s._id === status)?.count || 0;
  
  const total = stats.reduce((acc, curr) => acc + curr.count, 0);
  const solved = getCount('Resolved');
  const pending = total - solved;

  const cards = [
    { title: 'Total Tickets', value: total, icon: <MessageSquare className="text-blue-600" />, bg: 'bg-blue-50' },
    { title: 'Ongoing / Pending', value: pending, icon: <Clock className="text-orange-600" />, bg: 'bg-orange-50' },
    { title: 'Solved Today', value: solved, icon: <CheckCircle className="text-green-600" />, bg: 'bg-green-50' },
    { title: 'Critical Issues', value: stats.find(s => s._id === 'High')?.count || 0, icon: <AlertTriangle className="text-red-600" />, bg: 'bg-red-50' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {cards.map((card, i) => (
        <div key={i} className={`${card.bg} p-6 rounded-xl border border-white shadow-sm flex items-center justify-between`}>
          <div>
            <p className="text-sm font-medium text-gray-600">{card.title}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{card.value}</p>
          </div>
          <div className="p-3 bg-white rounded-lg shadow-inner">
            {card.icon}
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsOverview;
