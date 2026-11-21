'use client';

import { useState, useEffect } from 'react';
import {
  User,
  Mail,
  Phone,
  Briefcase,
  Loader2,
  CheckCircle2
} from 'lucide-react';
import { useRouter } from 'next/navigation';

const skillOptions = [
  'Electrical',
  'Plumbing',
  'AC Repair',
  'Refrigerator Repair',
  'Washing Machine Repair',
  'Microwave Repair',
  'Television Repair',
  'RO Water Purifier',
  'Carpentry',
  'Painting',
  'Home Cleaning',
  'Pest Control',
];

export default function TechnicianProfileForm() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: '',
    email: '',
    mobile: '',
    experience: '',
    skills: [],
    serviceArea: '',
  });

  // Profile data fetcher
  useEffect(() => {
    let isMounted = true;

    async function loadForm() {
      try {
        const res = await fetch('/api/auth/me');
        const json = await res.json();
        if (!isMounted) return;

        if (json.authenticated && json.user) {
          const u = json.user;
          const t = u.technician || {};
          setFormData({
            name: u.name || '',
            age: u.age ? String(u.age) : '',
            gender: u.gender || '',
            email: u.email || '',
            mobile: u.mobile || '',
            experience: String(t.experienceYears || '5'),
            skills: t.specialization ? t.specialization.split(', ') : [],
            serviceArea: t.workingArea || '',
          });
        }
        setLoading(false);
      } catch (err) {
        console.warn('Error loading tech form:', err);
        if (isMounted) setLoading(false);
      }
    }

    loadForm();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSkillChange = (skill) => {
    if (formData.skills.includes(skill)) {
      setFormData({
        ...formData,
        skills: formData.skills.filter((item) => item !== skill),
      });
    } else {
      setFormData({
        ...formData,
        skills: [...formData.skills, skill],
      });
    }
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();

    const {
      name,
      age,
      gender,
      mobile,
      experience,
      skills,
      serviceArea
    } = formData;

    if (!name.trim()) {
      alert('Please enter your full name.');
      return;
    }

    if (!mobile.trim()) {
      alert('Please enter your mobile number.');
      return;
    }

    if (skills.length === 0) {
      alert('Please select at least one skill.');
      return;
    }

    if (!serviceArea.trim()) {
      alert('Please enter your service area.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: name.trim(),
        fullName: name.trim(),
        age: age ? Number(age) : 30,
        gender: gender || 'Male',
        mobile: mobile.trim(),
        phone: mobile.trim(),
        email: formData.email,
        experience: experience ? Number(experience) : 8,
        experienceYears: String(experience || 8),
        skills: skills,
        specialization: skills.join(', '),
        serviceArea: serviceArea.trim(),
        workingArea: serviceArea.trim(),
      };

      const res = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to save profile');
      }

      setSavedSuccess(true);
      setTimeout(() => {
        setSavedSuccess(false);
        router.push('/technician');
      }, 1500);
    } catch (err) {
      console.error('Save error:', err);
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-card p-6 sm:p-8 relative transition-colors duration-200">
      
      {loading && (
        <div className="absolute inset-0 bg-white/75 dark:bg-slate-900/80 backdrop-blur-xs z-10 rounded-2xl flex items-center justify-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300">
          <Loader2 className="w-5 h-5 animate-spin text-blue-600 dark:text-blue-400" />
          <span>Fetching Profile...</span>
        </div>
      )}

      <h1 className="text-2xl sm:text-3xl font-bold text-[#0A2540] dark:text-white mb-8 font-heading">
        Technician Profile & Skill Settings
      </h1>

      {savedSuccess && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 text-emerald-700 dark:text-emerald-400 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>Profile saved & updated successfully! Redirecting...</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">

        <div>
          <label className="font-semibold text-xs text-slate-700 dark:text-slate-300">Full Name</label>
          <div className="relative mt-1">
            <User className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400 dark:text-slate-500" />
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Rajesh Kumar"
              className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 rounded-xl pl-10 p-3 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              required
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          <div>
            <label className="font-semibold text-xs text-slate-700 dark:text-slate-300">Age</label>
            <input
              type="number"
              name="age"
              value={formData.age}
              onChange={handleChange}
              placeholder="e.g. 32"
              className="w-full mt-1 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 rounded-xl p-3 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>

          <div>
            <label className="font-semibold text-xs text-slate-700 dark:text-slate-300">Gender</label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="w-full mt-1 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl p-3 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            >
              <option value="">Select Gender</option>
              <option>Male</option>
              <option>Female</option>
              <option>Other</option>
            </select>
          </div>
        </div>

        <div>
          <label className="font-semibold text-xs text-slate-700 dark:text-slate-300">Email Address</label>
          <div className="relative mt-1">
            <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400 dark:text-slate-500" />
            <input
              type="email"
              value={formData.email}
              readOnly
              className="w-full border border-slate-300 dark:border-slate-700 rounded-xl pl-10 p-3 text-xs font-semibold bg-slate-100 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 cursor-not-allowed"
            />
          </div>
        </div>

        <div>
          <label className="font-semibold text-xs text-slate-700 dark:text-slate-300">Mobile Phone Number</label>
          <div className="relative mt-1">
            <Phone className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400 dark:text-slate-500" />
            <input
              type="text"
              name="mobile"
              value={formData.mobile}
              onChange={handleChange}
              placeholder="e.g. +91 98765 43210"
              className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 rounded-xl pl-10 p-3 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              required
            />
          </div>
        </div>

        <div>
          <label className="font-semibold text-xs text-slate-700 dark:text-slate-300">Experience (Years)</label>
          <div className="relative mt-1">
            <Briefcase className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400 dark:text-slate-500" />
            <input
              type="number"
              name="experience"
              value={formData.experience}
              onChange={handleChange}
              placeholder="e.g. 8"
              className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 rounded-xl pl-10 p-3 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              required
            />
          </div>
        </div>

        <div>
          <label className="font-semibold text-xs text-slate-700 dark:text-slate-300">Service Coverage Area</label>
          <input
            type="text"
            name="serviceArea"
            value={formData.serviceArea}
            onChange={handleChange}
            placeholder="e.g. Indiranagar & HSR Layout, Bengaluru"
            className="w-full mt-1 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 rounded-xl p-3 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            required
          />
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Enter the cities or regional sectors where you provide services.
          </p>
        </div>

        <div>
          <label className="font-semibold text-xs text-slate-700 dark:text-slate-300">Service Specializations & Skill Set</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-3">
            {skillOptions.map((skill) => (
              <label
                key={skill}
                className="flex items-center gap-3 border border-slate-200 dark:border-slate-700 rounded-xl p-3 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 transition"
              >
                <input
                  type="checkbox"
                  checked={formData.skills.includes(skill)}
                  onChange={() => handleSkillChange(skill)}
                  className="w-4 h-4 accent-blue-600 rounded"
                />
                <span>{skill}</span>
              </label>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full bg-[#0A2540] hover:bg-[#12395f] dark:bg-blue-600 dark:hover:bg-blue-500 text-white py-3.5 rounded-xl font-bold transition flex items-center justify-center gap-2 disabled:opacity-60 text-xs shadow-sm cursor-pointer"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Saving Profile...</span>
            </>
          ) : (
            <span>Save Profile & Skill Updates</span>
          )}
        </button>

      </form>
    </div>
  );
}
