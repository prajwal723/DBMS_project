'use client';

import { useEffect, useState } from 'react';
import { User, Mail, Phone, MapPin } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function CustomerProfileForm() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [statusMsg, setStatusMsg] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: '',
    email: '',
    mobile: '',
    address: '',
  });

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/users/profile');
      const data = await res.json();

      if (!data.success || !data.data) {
        // Fallback to /api/auth/me
        const authRes = await fetch('/api/auth/me');
        const authData = await authRes.json();
        if (authData.authenticated && authData.user) {
          const u = authData.user;
          setFormData({
            name: u.name || '',
            age: u.age ? String(u.age) : '',
            gender: u.gender || '',
            email: u.email || '',
            mobile: u.mobile || '',
            address: u.address || '',
          });
          if (!u.name || !u.mobile || !u.address) {
            setIsEditing(true);
          }
        }
        return;
      }

      const p = data.data;
      setFormData({
        name: p.name || '',
        age: p.age ? String(p.age) : '',
        gender: p.gender || '',
        email: p.email || '',
        mobile: p.mobile || '',
        address: p.address || '',
      });

      // Automatically enable edit mode for fresh registrations
      if (!p.name || !p.mobile || !p.address) {
        setIsEditing(true);
      }
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      alert('Please enter your name');
      return;
    }

    if (formData.age && (Number(formData.age) < 16 || Number(formData.age) > 120)) {
      alert('Please enter a valid age between 16 and 120');
      return;
    }

    const cleanedMobile = formData.mobile.replace(/\D/g, '').slice(-10);
    if (!/^\d{10}$/.test(cleanedMobile)) {
      alert('Please enter a valid 10-digit mobile number');
      return;
    }

    if (!formData.address.trim()) {
      alert('Please enter your service address');
      return;
    }

    try {
      const res = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name.trim(),
          age: formData.age ? Number(formData.age) : null,
          gender: formData.gender || '',
          mobile: cleanedMobile,
          address: formData.address.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to update profile');
      }

      setIsEditing(false);
      setStatusMsg('Profile updated successfully!');
      setTimeout(() => setStatusMsg(null), 3000);

      if (data.data) {
        setFormData({
          name: data.data.name || '',
          age: data.data.age ? String(data.data.age) : '',
          gender: data.data.gender || '',
          email: data.data.email || formData.email,
          mobile: data.data.mobile || cleanedMobile,
          address: data.data.address || '',
        });
      }
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-slate-700 dark:text-slate-300 font-semibold">
        Loading...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-card rounded-2xl p-6 sm:p-8 transition-colors duration-200">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#0B2545] dark:text-white">
          Customer Profile
        </h1>
        {statusMsg && (
          <span className="text-xs sm:text-sm font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-3.5 py-1.5 rounded-full border border-emerald-200 dark:border-emerald-800/40">
            {statusMsg}
          </span>
        )}
      </div>

      <div className="space-y-6">
        <div>
          <label className="font-medium text-slate-700 dark:text-slate-300 text-sm">Full Name *</label>

          <div className="relative mt-2">
            <User className="absolute left-3.5 top-3.5 w-5 h-5 text-slate-400 dark:text-slate-500" />

            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              disabled={!isEditing}
              placeholder="Your full name"
              className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 rounded-xl pl-11 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:bg-slate-100 dark:disabled:bg-slate-800/50 disabled:text-slate-500 dark:disabled:text-slate-400"
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          <div>
            <label className="font-medium text-slate-700 dark:text-slate-300 text-sm">Age (Optional)</label>

            <input
              type="number"
              name="age"
              value={formData.age}
              onChange={handleChange}
              disabled={!isEditing}
              placeholder="e.g. 28"
              className="w-full mt-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:bg-slate-100 dark:disabled:bg-slate-800/50 disabled:text-slate-500 dark:disabled:text-slate-400"
            />
          </div>

          <div>
            <label className="font-medium text-slate-700 dark:text-slate-300 text-sm">Gender (Optional)</label>

            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              disabled={!isEditing}
              className="w-full mt-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:bg-slate-100 dark:disabled:bg-slate-800/50 disabled:text-slate-500 dark:disabled:text-slate-400"
            >
              <option value="">Select Gender</option>
              <option>Male</option>
              <option>Female</option>
              <option>Other</option>
            </select>
          </div>
        </div>

        <div>
          <label className="font-medium text-slate-700 dark:text-slate-300 text-sm">Email Address</label>

          <div className="relative mt-2">
            <Mail className="absolute left-3.5 top-3.5 w-5 h-5 text-slate-400 dark:text-slate-500" />

            <input
              type="email"
              value={formData.email}
              readOnly
              className="w-full border border-slate-300 dark:border-slate-700 rounded-xl pl-11 p-3 bg-slate-100 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-sm cursor-not-allowed"
            />
          </div>
        </div>

        <div>
          <label className="font-medium text-slate-700 dark:text-slate-300 text-sm">Mobile Number *</label>

          <div className="relative mt-2">
            <Phone className="absolute left-3.5 top-3.5 w-5 h-5 text-slate-400 dark:text-slate-500" />

            <input
              type="text"
              name="mobile"
              value={formData.mobile}
              onChange={handleChange}
              disabled={!isEditing}
              placeholder="10-digit mobile number"
              className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 rounded-xl pl-11 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:bg-slate-100 dark:disabled:bg-slate-800/50 disabled:text-slate-500 dark:disabled:text-slate-400"
            />
          </div>
        </div>

        <div>
          <label className="font-medium text-slate-700 dark:text-slate-300 text-sm">Service Address *</label>

          <div className="relative mt-2">
            <MapPin className="absolute left-3.5 top-3.5 w-5 h-5 text-slate-400 dark:text-slate-500" />

            <textarea
              rows={3}
              name="address"
              value={formData.address}
              onChange={handleChange}
              disabled={!isEditing}
              placeholder="Enter full home address (flat/house no., street, landmark, city)"
              className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 rounded-xl pl-11 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:bg-slate-100 dark:disabled:bg-slate-800/50 disabled:text-slate-500 dark:disabled:text-slate-400"
            />
          </div>
        </div>

        {!isEditing ? (
          <div className="flex gap-4 pt-2">
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="w-1/2 bg-[#0B2545] hover:bg-[#12395f] dark:bg-blue-600 dark:hover:bg-blue-500 text-white py-3 rounded-xl font-semibold text-sm transition shadow-xs"
            >
              Edit Profile
            </button>
            <button
              type="button"
              onClick={() => router.push('/customer')}
              className="w-1/2 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 py-3 rounded-xl font-semibold text-sm transition"
            >
              Back to Dashboard
            </button>
          </div>
        ) : (
          <div className="flex gap-4 pt-2">
            <button
              type="button"
              onClick={() => {
                setIsEditing(false);
                fetchProfile();
              }}
              className="w-1/2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 py-3 rounded-xl font-semibold text-sm transition"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSave}
              className="w-1/2 bg-[#0B2545] hover:bg-[#12395f] dark:bg-blue-600 dark:hover:bg-blue-500 text-white py-3 rounded-xl font-semibold text-sm transition shadow-xs"
            >
              Save Changes
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
