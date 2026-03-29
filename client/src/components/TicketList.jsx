import React from 'react';
import { 
  CheckCircle2, 
  Circle, 
  AlertTriangle, 
  Clock, 
  User as UserIcon,
  Tag,
  ChevronRight
} from 'lucide-react';

const TicketList = ({ tickets, role, onStatusChange, selectedTicketId, onSelectTicket }) => {
  if (!tickets || tickets.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-dashed border-gray-200 p-12 text-center text-gray-400">
        <Clock size={48} className="mx-auto mb-4 opacity-10" />
        <p className="text-lg font-medium italic">No active tickets in queue.</p>
      </div>
    );
  }

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'critical': return 'text-red-500 bg-gray-900 border-red-500';
      case 'high': return 'text-red-600 bg-red-100 border-red-200';
      case 'medium': return 'text-yellow-700 bg-yellow-100 border-yellow-200';
      case 'low': return 'text-emerald-700 bg-emerald-100 border-emerald-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'open': return 'text-orange-600';
      case 'in progress': return 'text-blue-600';
      case 'resolved': return 'text-emerald-600';
      default: return 'text-gray-500';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/50 border-b border-gray-100">
              <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">ID</th>
              <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">User</th>
              <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Summary</th>
              <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Category</th>
              <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Dept</th>
              <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Priority</th>
              <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {tickets.map(ticket => (
              <tr 
                key={ticket._id} 
                onClick={() => onSelectTicket(ticket)}
                className={`group cursor-pointer transition-all duration-200 transition ${
                  selectedTicketId === ticket._id 
                    ? 'bg-gray-900 text-white' 
                    : 'hover:bg-gray-50'
                }`}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                   <span className={`text-[11px] font-black uppercase tracking-tighter ${selectedTicketId === ticket._id ? 'text-gray-400' : 'text-gray-400'}`}>
                    #{ticket._id?.slice(-4)}
                   </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs ${selectedTicketId === ticket._id ? 'bg-white/10 text-white' : 'bg-gray-100 text-gray-600'}`}>
                       {ticket.user?.name?.[0] || 'U'}
                    </div>
                    <div>
                      <div className={`text-xs font-black capitalize ${selectedTicketId === ticket._id ? 'text-white' : 'text-gray-900'}`}>
                        {ticket.user?.name || 'Local User'}
                      </div>
                      <div className={`text-[10px] ${selectedTicketId === ticket._id ? 'text-gray-400' : 'text-gray-500'}`}>
                        {ticket.user?.email || 'user@local.ai'}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 max-w-xs">
                  <div className={`text-xs font-bold truncate ${selectedTicketId === ticket._id ? 'text-white' : 'text-gray-900'}`}>
                    {ticket.ai_summary || ticket.title}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <Tag size={12} className={selectedTicketId === ticket._id ? 'text-gray-400' : 'text-gray-400'} />
                    <span className={`text-xs font-black uppercase tracking-tight ${selectedTicketId === ticket._id ? 'text-gray-300' : 'text-gray-700'}`}>
                      {ticket.category || 'General'}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md border ${
                    selectedTicketId === ticket._id 
                      ? 'bg-white/10 text-white border-white/20' 
                      : 'bg-blue-50 text-blue-700 border-blue-100'
                  }`}>
                    {ticket.assigned_team || 'Support Team'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                   <div className="flex items-center gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full ${
                        ticket.priority?.toLowerCase() === 'critical' ? 'bg-red-600 shadow-[0_0_12px_rgba(239,68,68,1)] animate-ping' : 
                        ticket.priority?.toLowerCase() === 'high' ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]' : 
                        ticket.priority?.toLowerCase() === 'medium' ? 'bg-yellow-500' : 
                        'bg-emerald-500'
                      }`}></div>
                      <span className={`text-xs font-black uppercase tracking-wider ${selectedTicketId === ticket._id ? 'text-gray-300' : 'text-gray-700'}`}>
                        {ticket.priority || 'Low'}
                      </span>
                   </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                   <div className="flex items-center justify-end gap-3">
                      <span className={`text-[10px] font-black uppercase tracking-widest ${
                        selectedTicketId === ticket._id 
                          ? 'text-white' 
                          : getStatusColor(ticket.status)
                      }`}>
                        {ticket.status}
                      </span>
                      <ChevronRight size={14} className={`transition transform group-hover:translate-x-1 ${selectedTicketId === ticket._id ? 'text-white/30' : 'text-gray-300'}`} />
                   </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TicketList;
