'use client';

import { useState, useEffect } from 'react';
import { 
  User, 
  Phone, 
  Wrench, 
  Briefcase, 
  MapPin, 
  CheckCircle2, 
  Save, 
  Star, 
  Clock, 
  ShieldAlert, 
  TrendingUp,
  Loader2,
  Sparkles,
  LogOut
} from 'lucide-react';

export default function TechProfile({ 
  availability = 'Available', 
  onToggleAvailability,
  currentUser,
  onUpdateProfile,
  onLogout
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const [profileData, setProfileData] = useState({
    name: currentUser?.name || 'Technician',
    phone: currentUser?.phone || currentUser?.mobile || '',
    email: currentUser?.email || '',
    specialization: currentUser?.specialization || 'General Services',
    experienceYears: currentUser?.experienceYears || '5',
    workingArea: currentUser?.workingArea || 'Mangaluru Region',
    avatarUrl: currentUser?.avatarUrl || '',
    availability: availability || 'Available'
  });

  // Profile data fetcher
  useEffect(() => {
    let isMounted = true;

    async function loadProfile() {
      try {
        const res = await fetch('/api/auth/me');
        const json = await res.json();
        if (!isMounted) return;

        if (json.authenticated && json.user) {
          const u = json.user;
          const t = u.technician || {};
          const syncedData = {
            name: u.name || 'Technician',
            phone: u.mobile || '',
            email: u.email || '',
            specialization: t.specialization || 'General Services',
            experienceYears: String(t.experienceYears || '5'),
            workingArea: t.workingArea || 'Mangaluru Region',
            avatarUrl: t.avatarUrl || '',
            availability: t.status || availability || 'Available'
          };
          setProfileData(syncedData);
          if (onUpdateProfile) onUpdateProfile(syncedData);
        }
        setLoading(false);
      } catch (err) {
        console.warn('Error loading profile:', err);
        if (isMounted) setLoading(false);
      }
    }

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, [currentUser]);

  // Profile update handler
  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        name: profileData.name.trim(),
        mobile: profileData.phone.trim(),
        specialization: profileData.specialization.trim(),
        experienceYears: profileData.experienceYears,
        workingArea: profileData.workingArea.trim(),
        avatarUrl: profileData.avatarUrl,
        status: profileData.availability,
      };

      await fetch('/api/users/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      setIsEditing(false);
      setSavedSuccess(true);
      if (onUpdateProfile) onUpdateProfile(payload);
      setTimeout(() => setSavedSuccess(false), 3500);
    } catch (err) {
      console.error('Failed to update profile:', err);
      alert('Error updating profile: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 antialiased max-w-5xl mx-auto transition-colors duration-200">
      
      {/* Real-time Dynamic Profile Form */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-6 relative">
        
        {loading && (
          <div className="absolute inset-0 bg-white/75 dark:bg-slate-900/80 backdrop-blur-xs z-10 rounded-2xl flex items-center justify-center gap-2 text-xs font-semibold text-[#0B2545] dark:text-white">
            <Loader2 className="w-5 h-5 animate-spin text-[#134074] dark:text-blue-400" />
            <span>Fetching profile...</span>
          </div>
        )}

        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-lg font-bold text-[#0B2545] dark:text-white">Technician Profile & Duty Settings</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-normal mt-0.5">Synced with 1tapfix database</p>
          </div>

          <button
            onClick={() => setIsEditing(!isEditing)}
            className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors flex items-center gap-1.5"
          >
            {isEditing ? 'Cancel Editing' : 'Edit Profile'}
          </button>
        </div>

        {savedSuccess && (
          <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 text-emerald-700 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>Profile changes saved successfully!</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          
          {/* Profile Icon Header */}
          <div className="flex items-center gap-5">
            <div className="relative">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#134074] dark:bg-blue-600 text-white flex items-center justify-center border-2 border-slate-200 dark:border-slate-700 shadow-xs">
                <User className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </div>
            </div>

            <div>
              <h4 className="text-base font-bold text-[#0B2545] dark:text-white">{profileData.name}</h4>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{profileData.specialization}</p>
              
              {/* Duty Toggle */}
              <div className="mt-2 flex items-center gap-2">
                <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500">Current Duty Status:</span>
                <button
                  type="button"
                  onClick={() => onToggleAvailability && onToggleAvailability()}
                  className={`px-3 py-1 rounded-lg text-[10px] font-semibold border transition-all ${
                    availability === 'ONLINE' || availability === 'Available'
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/40'
                      : availability === 'BUSY' || availability === 'Busy'
                        ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/40'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  ● {availability} (Click to toggle)
                </button>
              </div>
            </div>
          </div>

          {/* Editable Fields Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">Full Name</label>
              <input 
                type="text"
                disabled={!isEditing}
                value={profileData.name}
                onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                className="w-full px-4 py-2.5 bg-[#EEF4ED]/40 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 rounded-xl text-xs font-normal text-[#0B2545] dark:text-white disabled:opacity-75 focus:outline-none focus:bg-white dark:focus:bg-slate-800 focus:border-[#134074] dark:focus:border-blue-500 transition-all"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">Phone Number</label>
              <input 
                type="tel"
                disabled={!isEditing}
                value={profileData.phone}
                onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                className="w-full px-4 py-2.5 bg-[#EEF4ED]/40 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 rounded-xl text-xs font-normal text-[#0B2545] dark:text-white disabled:opacity-75 focus:outline-none focus:bg-white dark:focus:bg-slate-800 focus:border-[#134074] dark:focus:border-blue-500 transition-all"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">Service Specialization</label>
              <input 
                type="text"
                disabled={!isEditing}
                value={profileData.specialization}
                onChange={(e) => setProfileData({ ...profileData, specialization: e.target.value })}
                className="w-full px-4 py-2.5 bg-[#EEF4ED]/40 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 rounded-xl text-xs font-normal text-[#0B2545] dark:text-white disabled:opacity-75 focus:outline-none focus:bg-white dark:focus:bg-slate-800 focus:border-[#134074] dark:focus:border-blue-500 transition-all"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">Years of Experience</label>
              <input 
                type="text"
                disabled={!isEditing}
                value={profileData.experienceYears}
                onChange={(e) => setProfileData({ ...profileData, experienceYears: e.target.value })}
                className="w-full px-4 py-2.5 bg-[#EEF4ED]/40 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 rounded-xl text-xs font-normal text-[#0B2545] dark:text-white disabled:opacity-75 focus:outline-none focus:bg-white dark:focus:bg-slate-800 focus:border-[#134074] dark:focus:border-blue-500 transition-all"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">Working Coverage Zone</label>
              <input 
                type="text"
                disabled={!isEditing}
                value={profileData.workingArea}
                onChange={(e) => setProfileData({ ...profileData, workingArea: e.target.value })}
                className="w-full px-4 py-2.5 bg-[#EEF4ED]/40 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 rounded-xl text-xs font-normal text-[#0B2545] dark:text-white disabled:opacity-75 focus:outline-none focus:bg-white dark:focus:bg-slate-800 focus:border-[#134074] dark:focus:border-blue-500 transition-all"
                placeholder="e.g. Indiranagar & HSR Layout, Bengaluru"
                required
              />
            </div>

          </div>

          {isEditing && (
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-right">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 bg-[#134074] hover:bg-[#13315C] dark:bg-blue-600 dark:hover:bg-blue-500 text-white text-xs font-semibold rounded-xl shadow-xs transition-all flex items-center gap-2 inline-flex disabled:opacity-60 cursor-pointer"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving profile...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save Profile Updates</span>
                  </>
                )}
              </button>
            </div>
          )}

        </form>

        <div className="pt-6 border-t border-slate-200/80 dark:border-slate-800">
          <button
            type="button"
            onClick={onLogout}
            className="w-full py-3 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/50 font-semibold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <LogOut className="w-4 h-4 text-rose-600 dark:text-rose-400" />
            <span>Sign Out of Technician Account</span>
          </button>
        </div>

      </div>

    </div>
  );
}
