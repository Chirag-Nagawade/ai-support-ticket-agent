import React from 'react';
import { 
  Layers, 
  MessageSquare, 
  ChevronRight,
  ShieldCheck,
  User,
  Activity,
  Tag
} from 'lucide-react';

const SimilarityMonitor = ({ tickets, onSelectGroup }) => {
  // Group tickets by Category
  const groups = tickets.reduce((acc, ticket) => {
    const key = ticket.category || 'General';
    if (!acc[key]) acc[key] = [];
    acc[key].push(ticket);
    return acc;
  }, {});

  const groupKeys = Object.keys(groups).sort((a, b) => groups[b].length - groups[a].length);

  const getCategoryIcon = (category) => {
    switch (category?.toLowerCase()) {
      case 'billing': return <Tag size={18} />;
      case 'account': return <User size={18} />;
      case 'technical': return <Activity size={18} />;
      default: return <Tag size={18} />;
    }
  };

  if (groupKeys.length === 0) return null;

  return (
    <div className="space-y-6 mt-12">
      <div className="flex items-center gap-3 mb-8">
        <Activity className="text-gray-900" size={24} />
        <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight italic">Grouped Similar Issues</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {groupKeys.map(key => {
          const latestTicket = groups[key][0];
          return (
            <div key={key} className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 group relative overflow-hidden">
               {/* Decorative background element */}
               <div className="absolute -right-4 -top-4 w-24 h-24 bg-gray-50 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-700"></div>
               
               <div className="relative z-10">
                <div className="flex justify-between items-start mb-8">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-gray-900 text-white rounded-xl shadow-lg">
                      {getCategoryIcon(key)}
                    </div>
                    <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">{key}</h3>
                  </div>
                  <span className="bg-gray-900 text-white px-3 py-1 text-[10px] font-black rounded-lg uppercase tracking-widest">
                    {groups[key].length} Tickets
                  </span>
                </div>
                
                <div className="space-y-4 mb-8">
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 italic">Latest Issue</p>
                    <p className="text-xs font-bold text-gray-800 leading-relaxed line-clamp-2">
                       "{latestTicket.title}"
                    </p>
                  </div>
                  <p className="text-[10px] font-bold text-gray-400">
                    {new Date(latestTicket.createdAt).toLocaleDateString()}
                  </p>
                </div>
                
                <button 
                  onClick={() => onSelectGroup(key)}
                  className="w-full py-3 border-2 border-gray-900 text-[10px] font-black uppercase tracking-widest text-gray-900 rounded-xl hover:bg-gray-900 hover:text-white transition-colors duration-200 flex items-center justify-center gap-2 group-hover:shadow-lg"
                >
                  View Details
                  <ChevronRight size={14} />
                </button>
               </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SimilarityMonitor;
