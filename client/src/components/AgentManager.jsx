import React, { useState, useEffect, useContext } from 'react';
import api from '../utils/api';
import { 
  UserPlus, 
  UserCheck, 
  Users, 
  Trash2, 
  Edit2, 
  X, 
  Check,
  Shield,
  Briefcase
} from 'lucide-react';

const AgentManager = () => {
  const [staff, setStaff] = useState([]);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'agent', department: 'Support Team' });
  const [editingStaff, setEditingStaff] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      const res = await api.get('/auth/staff');
      setStaff(res.data);
    } catch (err) {
      console.error('Failed to fetch staff', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });
    try {
      if (editingStaff) {
        await api.put(`/auth/staff/${editingStaff._id}`, {
          name: formData.name,
          email: formData.email,
          department: formData.department
        });
        setMessage({ type: 'success', text: `Staff ${formData.name} updated successfully!` });
      } else {
        await api.post('/auth/register', formData);
        setMessage({ type: 'success', text: `Support agent ${formData.name} created successfully!` });
      }
      setFormData({ name: '', email: '', password: '', role: 'agent', department: 'Support Team' });
      setEditingStaff(null);
      fetchStaff();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Action failed' });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (member) => {
    setEditingStaff(member);
    setFormData({
      name: member.name,
      email: member.email,
      password: '', // Password not editable here
      role: member.role,
      department: member.department
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this staff member?')) return;
    try {
      await api.delete(`/auth/staff/${id}`);
      setStaff(staff.filter(s => s._id !== id));
      setMessage({ type: 'success', text: 'Staff member removed' });
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to delete staff' });
    }
  };

  const cancelEdit = () => {
    setEditingStaff(null);
    setFormData({ name: '', email: '', password: '', role: 'agent', department: 'Support Team' });
  };

  return (
    <div className="space-y-12">
      {/* Registration / Edit Form */}
      <div className="max-w-4xl mx-auto bg-white p-10 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 w-2 h-full bg-gray-900"></div>
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 bg-gray-900 text-white rounded-lg">
            {editingStaff ? <Edit2 size={20} /> : <UserPlus size={20} />}
          </div>
          <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight">
            {editingStaff ? `Update Staff: ${editingStaff.name}` : 'Register New Support Staff'}
          </h2>
        </div>

        {message.text && (
          <div className={`p-4 mb-8 rounded-xl text-xs font-black uppercase tracking-widest border flex items-center justify-between ${
            message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-red-50 text-red-700 border-red-100'
          }`}>
            <div className="flex items-center gap-3">
              {message.type === 'success' ? <Check size={16} /> : <X size={16} />}
              {message.text}
            </div>
            <button onClick={() => setMessage({type:'', text:''})} className="opacity-50 hover:opacity-100">
               <X size={14} />
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 italic">Full Name</label>
              <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required
                className="w-full px-5 py-3 bg-gray-50 border-2 border-gray-50 rounded-xl focus:border-gray-900 focus:bg-white transition-all outline-none text-sm font-bold" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 italic">Email Address</label>
              <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required
                className="w-full px-5 py-3 bg-gray-50 border-2 border-gray-50 rounded-xl focus:border-gray-900 focus:bg-white transition-all outline-none text-sm font-bold" />
            </div>
          </div>

          {!editingStaff && (
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 italic">Security Password</label>
              <input type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} required
                className="w-full px-5 py-3 bg-gray-50 border-2 border-gray-50 rounded-xl focus:border-gray-900 focus:bg-white transition-all outline-none text-sm font-bold" />
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 italic">Operational Department</label>
            <select value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} required
              className="w-full px-5 py-3 bg-gray-50 border-2 border-gray-50 rounded-xl focus:border-gray-900 focus:bg-white transition-all outline-none text-sm font-bold appearance-none">
              <option value="Billing Team">Billing & Finance</option>
              <option value="Technical Team">Technical Solutions</option>
              <option value="Account Team">Account Management</option>
              <option value="Support Team">General Support</option>
            </select>
          </div>

          <div className="flex gap-4 pt-4">
            <button type="submit" disabled={loading}
              className="flex-1 py-4 bg-gray-900 text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-xl hover:bg-black transition-all disabled:opacity-50">
              {loading ? 'Processing...' : editingStaff ? 'Update Credentials' : 'Authorize Staff Member'}
            </button>
            {editingStaff && (
              <button type="button" onClick={cancelEdit}
                className="px-8 py-4 border-2 border-gray-200 text-[10px] font-black uppercase tracking-widest text-gray-400 rounded-xl hover:border-gray-900 hover:text-gray-900 transition-all">
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Staff List */}
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Users className="text-gray-900" size={24} />
          <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight italic">Active Personnel</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {staff.map(member => (
            <div key={member._id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all group">
               <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-gray-900 font-black text-lg">
                       {member.name[0]}
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-gray-900 uppercase tracking-tight">{member.name}</h4>
                      <p className="text-[10px] font-bold text-gray-400">{member.email}</p>
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleEdit(member)} className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-50 rounded-lg">
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => handleDelete(member._id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                      <Trash2 size={16} />
                    </button>
                  </div>
               </div>

               <div className="space-y-3">
                 <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-2 text-gray-400">
                      <Briefcase size={14} />
                      <span className="text-[10px] font-black uppercase tracking-widest">Dept</span>
                    </div>
                    <span className="text-[10px] font-black text-gray-900 uppercase">{member.department}</span>
                 </div>
                 <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-2 text-gray-400">
                      <Shield size={14} />
                      <span className="text-[10px] font-black uppercase tracking-widest">Role</span>
                    </div>
                    <span className="text-[10px] font-black text-gray-900 uppercase">{member.role}</span>
                 </div>
               </div>
            </div>
          ))}
          {staff.length === 0 && (
            <div className="col-span-full py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400">
               <Users size={48} className="mb-4 opacity-10" />
               <p className="font-bold uppercase tracking-widest text-xs italic">No personnel authorized yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AgentManager;
