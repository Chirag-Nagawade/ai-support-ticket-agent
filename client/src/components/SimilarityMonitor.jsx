import React from 'react';
import { Layers } from 'lucide-react';

const SimilarityMonitor = ({ tickets }) => {
  // Group tickets by Category
  const groups = tickets.reduce((acc, ticket) => {
    const key = ticket.category || 'General';
    if (!acc[key]) acc[key] = [];
    acc[key].push(ticket);
    return acc;
  }, {});

  const groupKeys = Object.keys(groups).sort((a, b) => groups[b].length - groups[a].length);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6 text-gray-800">
        <Layers className="text-blue-500" />
        <h2 className="text-xl font-bold">Similarity Monitoring (Grouped by Category)</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {groupKeys.map(key => (
          <div key={key} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-50">
              <h3 className="text-lg font-bold text-gray-800">{key} Issues</h3>
              <span className="bg-blue-100 text-blue-700 px-3 py-1 text-xs font-bold rounded-full">
                {groups[key].length} Similar
              </span>
            </div>
            
            <ul className="space-y-3">
              {groups[key].slice(0, 5).map(ticket => (
                <li key={ticket._id} className="p-3 bg-gray-50 rounded-lg border border-gray-100 flex flex-col gap-1">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-gray-900 truncate pr-2">{ticket.title}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded uppercase font-bold ${
                      ticket.priority === 'High' ? 'bg-red-100 text-red-700' : 'bg-gray-200 text-gray-600'
                    }`}>
                      {ticket.priority}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 line-clamp-1">{ticket.description}</p>
                </li>
              ))}
              {groups[key].length > 5 && (
                <li className="text-center text-xs text-blue-600 font-medium cursor-pointer hover:underline">
                  + {groups[key].length - 5} more similar tickets
                </li>
              )}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SimilarityMonitor;
