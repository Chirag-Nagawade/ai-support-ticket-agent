import React, { useState } from 'react';

const TicketList = ({ tickets, role, onStatusChange }) => {
  const [showResolveModal, setShowResolveModal] = useState(null);
  const [manualMsg, setManualMsg] = useState('');

  if (!tickets || tickets.length === 0) {
    return <div className="text-gray-500 italic mt-4">No tickets found.</div>;
  }

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const submitResolution = (ticketId, aiMsg) => {
    onStatusChange(ticketId, 'Resolved', manualMsg, aiMsg);
    setShowResolveModal(null);
    setManualMsg('');
  };

  return (
    <div className="mt-8 space-y-6 pb-20">
      <h2 className="text-2xl font-bold text-gray-800">Your Tickets</h2>
      <div className="grid gap-6">
        {tickets.map(ticket => (
          <div key={ticket._id} className={`bg-white p-6 rounded-lg shadow border transition ${
            ticket.priority === 'High' && ticket.status !== 'Resolved' ? 'border-red-300 shadow-md' : 'border-gray-200'
          }`}>
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-gray-900">{ticket.title}</h3>
                  {ticket.priority === 'High' && ticket.status !== 'Resolved' && (
                    <span className="animate-pulse bg-red-600 text-white text-[10px] px-2 py-0.5 rounded-full font-bold uppercase">Critical</span>
                  )}
                </div>
                <p className="text-sm text-gray-500 mt-1">Submitted: {new Date(ticket.createdAt).toLocaleString()}</p>
                {role !== 'user' && ticket.user && (
                  <p className="text-sm text-gray-600 mb-2 font-medium">
                    By: <span className="text-gray-900">{ticket.user.name || 'Local User'}</span> ({ticket.user.email || ticket.user})
                  </p>
                )}
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                  ticket.status === 'Open' ? 'bg-orange-100 text-orange-800' :
                  ticket.status === 'Resolved' ? 'bg-green-100 text-green-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {ticket.status}
                </span>
                {role !== 'user' && (
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(ticket.priority)}`}>
                    Priority: {ticket.priority}
                  </span>
                )}
              </div>
            </div>
            
            <p className="text-gray-700 mt-4 whitespace-pre-wrap">{ticket.description}</p>
            
            {/* RESOLUTION MESSAGES FOR USER */}
            {ticket.status === 'Resolved' && (ticket.resolution_msg || ticket.ai_resolution_msg) && (
              <div className="mt-6 p-5 bg-green-50 border border-green-200 rounded-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-2 opacity-10">
                  <svg className="w-12 h-12 text-green-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                </div>
                <h4 className="text-sm font-bold text-green-800 mb-3 flex items-center">
                  Resolution Update
                </h4>
                {ticket.ai_resolution_msg && (
                  <div className="mb-3">
                    <p className="text-xs font-semibold text-green-700 uppercase tracking-wider mb-1">AI Assistant Message:</p>
                    <p className="text-sm text-green-900 border-l-4 border-green-300 pl-3 italic">{ticket.ai_resolution_msg}</p>
                  </div>
                )}
                {ticket.resolution_msg && (
                  <div>
                    <p className="text-xs font-semibold text-green-700 uppercase tracking-wider mb-1">Agent Feedback:</p>
                    <p className="text-sm text-green-900">{ticket.resolution_msg}</p>
                  </div>
                )}
              </div>
            )}

            {/* AI Insights Section - visible to agents/admins */}
            {role !== 'user' && ticket.status !== 'Resolved' && (
              <div className="mt-4 p-4 bg-indigo-50 border border-indigo-100 rounded-md">
                <h4 className="text-sm font-bold text-indigo-900 mb-2 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                  System Intelligence
                </h4>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div><span className="font-semibold text-indigo-800">Sentiment:</span> {ticket.sentiment}</div>
                  <div><span className="font-semibold text-indigo-800">Category:</span> {ticket.category}</div>
                  <div><span className="font-semibold text-indigo-800">Assigned Team:</span> {ticket.assigned_team}</div>
                  <div><span className="font-semibold text-indigo-800">Similar Issues:</span> {ticket.similar_issues || 'None detected'}</div>
                </div>
                {ticket.ai_response && (
                  <div className="mt-3 p-3 bg-white rounded border border-indigo-100">
                    <p className="text-xs font-semibold text-indigo-800 mb-1 underline">Suggested Response:</p>
                    <p className="text-xs text-gray-700 italic">{ticket.ai_response}</p>
                  </div>
                )}
              </div>
            )}

            {/* Actions */}
            {role !== 'user' && ticket.status !== 'Resolved' && (
              <div className="mt-4 pt-4 border-t border-gray-100 flex gap-2">
                <button onClick={() => onStatusChange(ticket._id, 'In Progress')} className="text-xs px-3 py-1 bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200">Start Work</button>
                <button onClick={() => setShowResolveModal(ticket)} className="text-xs px-4 py-1.5 bg-green-600 text-white font-bold rounded shadow-sm hover:bg-green-700">Resolve Ticket</button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Resolve Modal */}
      {showResolveModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 animate-in fade-in zoom-in duration-200">
            <h3 className="text-xl font-bold text-gray-900">Resolve Ticket</h3>
            <p className="text-sm text-gray-500 mt-1">{showResolveModal.title}</p>
            
            <div className="mt-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-indigo-600 uppercase mb-2 tracking-tight">AI Suggested Response (Automated)</label>
                <div className="p-3 bg-indigo-50 border border-indigo-100 rounded text-sm text-indigo-900 italic">
                  {showResolveModal.ai_response || "Our AI suggests thanking the user for their patience while the issue was investigated."}
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase mb-2 tracking-tight">Manual Response (Optional)</label>
                <textarea 
                  value={manualMsg}
                  onChange={(e) => setManualMsg(e.target.value)}
                  placeholder="Enter details on what was fixed..."
                  className="w-full p-3 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none h-24"
                ></textarea>
              </div>
            </div>

            <div className="mt-8 flex gap-3 justify-end">
              <button 
                onClick={() => setShowResolveModal(null)}
                className="px-4 py-2 text-sm font-semibold text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button 
                onClick={() => submitResolution(showResolveModal._id, showResolveModal.ai_response)}
                className="px-6 py-2 bg-green-600 text-white text-sm font-bold rounded-lg hover:bg-green-700 shadow-md"
              >
                Complete Resolution
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TicketList;
