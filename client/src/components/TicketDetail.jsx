import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { 
  ShieldCheck, 
  Clock, 
  MessageSquare, 
  Activity, 
  HelpCircle, 
  AlertCircle,
  Zap,
  ArrowRight,
  CheckCircle2,
  HelpCircle as QuestionIcon,
  X,
  Send
} from 'lucide-react';

const TicketDetail = ({ ticket, onStatusChange, onClose, onUserReply }) => {
  const { user } = useContext(AuthContext);
  const [actionType, setActionType] = useState('none'); // 'none', 'resolve', 'info'
  const [manualMsg, setManualMsg] = useState('');

  if (!ticket) return (
    <div className="h-full flex flex-col items-center justify-center text-gray-400 bg-white rounded-xl border border-dashed border-gray-200 p-8">
      <MessageSquare size={48} className="mb-4 opacity-20" />
      <p className="text-lg font-medium">Select a ticket to begin</p>
    </div>
  );

  const isAdminOrStaff = user?.role === 'admin' || user?.role === 'agent';
  
  const getPriorityStyles = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'critical': return 'bg-gray-900 text-red-500 border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.3)] animate-pulse';
      case 'high': return 'bg-red-50 text-red-700 border-red-100';
      case 'medium': return 'bg-yellow-50 text-yellow-700 border-yellow-100';
      case 'low': return 'bg-green-50 text-green-700 border-green-100';
      default: return 'bg-gray-50 text-gray-700 border-gray-100';
    }
  };

  const handleExecuteAction = () => {
    if (actionType === 'resolve') {
      onStatusChange(ticket._id, 'Resolved', manualMsg, ticket.ai_response);
    } else if (actionType === 'info') {
      onStatusChange(ticket._id, 'Pending Info', '', '', manualMsg);
    }
    setActionType('none');
    setManualMsg('');
  };

  const handleUserSubmitReply = () => {
    if (!manualMsg.trim()) return;
    onUserReply(ticket._id, manualMsg);
    setManualMsg('');
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-gray-100 flex flex-col h-full overflow-hidden animate-in slide-in-from-right-4 duration-300 relative">
      {/* Header */}
      <div className="p-8 border-b border-gray-50 bg-gray-50/30 flex justify-between items-start">
        <div>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 italic">
            {isAdminOrStaff ? 'Triage Intelligence' : 'Support Case Details'}
          </p>
          <h2 className="text-2xl font-black text-gray-900 leading-tight">Ticket #{ticket._id?.slice(-8)}</h2>
        </div>
        <div className={`px-4 py-2 rounded-xl border text-[10px] font-black uppercase tracking-widest ${getPriorityStyles(ticket.priority)}`}>
          {ticket.priority || 'Unassigned'}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-10 space-y-16">
        
        {/* Status Section */}
        <section className="space-y-6">
          <div className="flex items-center gap-4">
             <div className={`w-3 h-3 rounded-full ${ticket.status === 'Resolved' ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.5)]'}`}></div>
             <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">
               Current Status: <span className="text-gray-900">{ticket.status}</span>
             </p>
          </div>

          {/* Resolution Content - Minimalist */}
          {(ticket.status === 'Resolved' || ticket.status === 'Closed') && (
            <div className="py-8 border-y border-gray-100 animate-in fade-in slide-in-from-top-4 duration-700">
               <div className="flex items-start gap-6">
                 <div className="shrink-0 w-12 h-12 bg-gray-900 text-white rounded-2xl flex items-center justify-center">
                   <CheckCircle2 size={24} />
                 </div>
                 <div className="space-y-6 flex-1">
                   <div>
                     <h3 className="text-2xl font-black text-gray-900 tracking-tight mb-2">Issue Resolved</h3>
                     <div className="w-12 h-1 bg-gray-900 rounded-full"></div>
                   </div>
                   
                   <div className="space-y-6">
                     {ticket.resolution_msg && (
                       <div className="space-y-2">
                         <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Support Message</p>
                         <p className="text-lg font-black text-gray-800 leading-snug">
                           {ticket.resolution_msg}
                         </p>
                       </div>
                     )}
                     
                     {ticket.ai_resolution_msg && (
                       <div className="bg-gray-50 p-6 rounded-2xl border-l-4 border-gray-900">
                         <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Automated Dispatch</p>
                         <p className="text-sm font-medium text-gray-600 leading-relaxed italic">
                           "{ticket.ai_resolution_msg}"
                         </p>
                       </div>
                     )}
                   </div>
                 </div>
               </div>
            </div>
          )}

          {/* Pending Info Banner - Minimalist */}
          {ticket.status === 'Pending Info' && ticket.staff_message && (
            <div className="bg-blue-50 p-8 rounded-3xl border border-blue-100 flex items-start gap-4">
               <QuestionIcon className="text-blue-500 mt-1" size={20} />
               <div className="space-y-2">
                 <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest">Clarification Required</p>
                 <p className="text-base font-bold text-blue-900 leading-relaxed italic">
                   "{ticket.staff_message}"
                 </p>
               </div>
            </div>
          )}
        </section>

        {/* Intelligence Summary */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">AI Intelligence Digest</h4>
            {isAdminOrStaff && (
              <div className="flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full border border-gray-200">
                <Activity size={10} className="text-gray-400" />
                <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Live Analysis</span>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <p className="text-3xl font-black text-gray-900 tracking-tight leading-tight">
              "{ticket.ai_summary || ticket.title}"
            </p>
            <div className="flex flex-wrap gap-3">
               <span className="px-3 py-1 bg-white border border-gray-200 rounded-lg text-[10px] font-black uppercase text-gray-600 flex items-center gap-1">
                 {ticket.category}
               </span>
               <span className={`px-3 py-1 border rounded-lg text-[10px] font-black uppercase flex items-center gap-1 ${ticket.sentiment === 'Negative' ? 'bg-red-50 border-red-100 text-red-600' : 'bg-emerald-50 border-emerald-100 text-emerald-600'}`}>
                 {ticket.sentiment} Sentiment
               </span>
               <span className="px-3 py-1 bg-blue-50 border border-blue-100 rounded-lg text-[10px] font-black uppercase text-blue-600 flex items-center gap-1">
                 <ShieldCheck size={10} /> {ticket.assigned_team || 'Support Team'}
               </span>
            </div>
          </div>
        </section>

        {/* Original Intent */}
        <section className="space-y-4">
           <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Original Dispatch</h4>
           <div className="bg-white border-2 border-gray-100 p-8 rounded-[2rem] shadow-sm italic whitespace-pre-wrap">
             <p className="text-base text-gray-700 font-medium leading-relaxed">
               {ticket.description}
             </p>
           </div>
        </section>

        {/* Staff Operations */}
        {isAdminOrStaff && (
          <section className="pt-10 border-t border-gray-100 space-y-6">
            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Operational Context</h4>
            <div className="bg-red-50 p-8 rounded-3xl border border-red-100">
               <div className="flex items-center gap-3 mb-4">
                 <Zap size={16} className="text-red-500" />
                 <p className="text-[9px] font-black text-red-400 uppercase tracking-widest">Internal Resolution Suggestion</p>
               </div>
               <p className="text-sm font-bold text-red-900 leading-relaxed italic">
                  "{ticket.ai_response || "Parsing ticket context..."}"
               </p>
            </div>
          </section>
        )}
      </div>

      {/* Action Hub */}
      <div className="p-8 border-t border-gray-50 bg-white space-y-4 shadow-lg z-10">
        {isAdminOrStaff ? (
          <>
            {actionType === 'none' ? (
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => setActionType('resolve')}
                  className="py-4 bg-gray-900 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl flex items-center justify-center gap-3 hover:bg-black transition-all shadow-xl"
                >
                  <CheckCircle2 size={16} /> Resolve
                </button>
                <button 
                  onClick={() => setActionType('info')}
                  className="py-4 border-2 border-gray-200 text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl flex items-center justify-center gap-3 hover:border-gray-900 hover:text-gray-900 transition-all"
                >
                  <QuestionIcon size={16} /> Need Info
                </button>
              </div>
            ) : (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="flex justify-between items-center bg-gray-50 px-4 py-2 rounded-xl">
                   <p className="text-[8px] font-black uppercase tracking-widest text-gray-400">
                     Action: {actionType === 'resolve' ? 'Solving Issue' : 'Collecting Data'}
                   </p>
                   <button onClick={() => setActionType('none')} className="text-gray-400 hover:text-black">
                     <X size={14} />
                   </button>
                </div>
                <textarea 
                  value={manualMsg}
                  onChange={(e) => setManualMsg(e.target.value)}
                  placeholder={actionType === 'resolve' ? "Personal resolution message (Optional)..." : "What info do you need from the user?"}
                  className="w-full p-4 bg-gray-50 border-2 border-gray-50 rounded-2xl text-xs font-bold focus:border-gray-900 outline-none transition-all placeholder:text-gray-400 h-24"
                />
                <button 
                  onClick={handleExecuteAction}
                  className="w-full py-4 bg-gray-900 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl flex items-center justify-center gap-3 hover:bg-black transition-all shadow-xl"
                  disabled={!manualMsg.trim() && actionType === 'info'}
                >
                  <Send size={16} /> Dispatch Message
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col gap-6 w-full animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                 <div className={`p-2 rounded-lg ${ticket.status === 'Resolved' ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-600'}`}>
                   <Activity size={18} />
                 </div>
                 <div>
                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest italic">Current Status</p>
                    <p className="text-xs font-black text-gray-900 uppercase tracking-widest">{ticket.status}</p>
                 </div>
              </div>
              
              {ticket.status === 'Resolved' && (
                <button 
                  onClick={() => onStatusChange(ticket._id, 'Open')}
                  className="px-6 py-3 border-2 border-gray-900 text-gray-900 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-gray-900 hover:text-white transition-all shadow-lg"
                >
                  Reopen Ticket
                </button>
              )}
            </div>
            
            {(ticket.status === 'Pending Info' || ticket.is_pending_user) && (
              <div className="space-y-4 w-full pt-4 border-t border-gray-100">
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Requires Action</p>
                <textarea 
                  value={manualMsg}
                  onChange={(e) => setManualMsg(e.target.value)}
                  placeholder="Provide clarification or additional details..."
                  className="w-full p-4 bg-blue-50/50 border-2 border-blue-100 rounded-2xl text-xs font-bold focus:border-blue-500 outline-none transition-all placeholder:text-blue-300 h-24"
                />
                <button 
                  onClick={handleUserSubmitReply}
                  className="w-full py-4 bg-blue-600 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl flex items-center justify-center gap-3 hover:bg-blue-700 transition-all shadow-md disabled:bg-blue-200 disabled:cursor-not-allowed"
                  disabled={!manualMsg.trim()}
                >
                  <Send size={16} /> Refile Ticket
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TicketDetail;
