import React, { useState, useContext } from 'react';
import api from '../utils/api';
import { UserPlus, UserCheck } from 'lucide-react';

const AgentManager = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'agent', department: 'Support Team' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });
    try {
      await api.post('/auth/register', formData);
      setMessage({ type: 'success', text: `Support agent ${formData.name} created successfully!` });
      setFormData({ name: '', email: '', password: '', role: 'agent', department: 'Support Team' });
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to create agent' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl border border-gray-100 shadow-sm">
      <div className="flex items-center gap-2 mb-6">
        <UserPlus className="text-blue-500" />
        <h2 className="text-xl font-bold text-gray-800">Create New Support Agent</h2>
      </div>

      {message.text && (
        <div className={`p-4 mb-6 rounded-lg text-sm font-medium border flex items-center gap-2 ${
          message.type === 'success' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'
        }`}>
          {message.type === 'success' && <UserCheck size={16} />}
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Full Name</label>
            <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Email Address</label>
            <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Password</label>
          <input type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} required
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" />
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Department</label>
          <select value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} required
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none">
            <option value="Billing Team">Billing Team</option>
            <option value="Technical Team">Technical Team</option>
            <option value="Account Team">Account Team</option>
            <option value="Support Team">Support Team</option>
          </select>
        </div>

        <button type="submit" disabled={loading}
          className="w-full py-3 bg-blue-600 text-white font-bold rounded-lg shadow-lg hover:bg-blue-700 transition duration-200 disabled:bg-blue-300">
          {loading ? 'Creating Agent...' : 'Register Support Staff'}
        </button>
      </form>
    </div>
  );
};

export default AgentManager;
