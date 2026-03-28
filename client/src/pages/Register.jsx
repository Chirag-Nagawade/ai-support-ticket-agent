import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'user', department: '' });
  const { register, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const isAdmin = user && user.role === 'admin';


  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(formData);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 py-12">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center text-gray-800">Create Account</h2>
        {error && <p className="mt-4 text-sm text-center text-red-600">{error}</p>}
        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm text-gray-700">Name</label>
            <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required
              className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600" />
          </div>
          <div>
            <label className="block text-sm text-gray-700">Email Address</label>
            <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required
              className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600" />
          </div>
          <div>
            <label className="block text-sm text-gray-700">Password</label>
            <input type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} required
              className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600" />
          </div>
          
          {isAdmin && (
            <>
              <div>
                <label className="block text-sm text-gray-700">Role</label>
                <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}
                  className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600">
                  <option value="user">User</option>
                  <option value="agent">Support Agent</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              {formData.role === 'agent' && (
                <div>
                  <label className="block text-sm text-gray-700">Department</label>
                  <select value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} required
                    className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600">
                    <option value="">Select Department</option>
                    <option value="Billing Team">Billing Team</option>
                    <option value="Technical Team">Technical Team</option>
                    <option value="Account Team">Account Team</option>
                    <option value="Support Team">Support Team</option>
                  </select>
                </div>
              )}
            </>
          )}

          <button type="submit" className="w-full px-4 py-2 mt-6 text-white bg-blue-600 rounded-md hover:bg-blue-700">
            {isAdmin ? 'Create Administrative Account' : 'Register'}
          </button>
        </form>
        {!isAdmin && (
          <p className="mt-4 text-sm text-center text-gray-600">
            Already have an account? <Link to="/login" className="text-blue-600 hover:underline">Sign In</Link>
          </p>
        )}
        {isAdmin && (
          <p className="mt-4 text-sm text-center text-green-600 font-medium">
            Logged in as Admin. You can create staff accounts here.
          </p>
        )}
      </div>
    </div>
  );
};

export default Register;
