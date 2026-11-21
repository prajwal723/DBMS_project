'use client';
import { 
  Briefcase, 
  ShieldAlert, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  ArrowRight, 
  TrendingUp, 
  Flame, 
  Layers, 
  Star,
  ChevronRight,
  User
} from 'lucide-react';
import MagicBento, { ParticleCard } from './MagicBento';

export default function TechDashboard({ 
  jobs = [], 
  onSelectJob, 
  onViewAllJobs, 
  onTriggerEmergency,
  maxCapacity = 6,
  avgRating = null,
  positivePercentage = 0
}) {
  const isJobCancelled = (j) => 
    j.status === 'Cancelled' || 
    j.status === 'CANCELLED' || 
    j.status === 'cancelled' || 
    (typeof j.status === 'string' && j.status.toLowerCase().includes('cancel'));

  const getTimeMinutes = (job) => {
    const timeStr = job.timeSlot || job.time || '';
    const match = String(timeStr).match(/(\d+):(\d+)\s*(AM|PM)?/i);
    if (match) {
      let hours = parseInt(match[1], 10);
      const minutes = parseInt(match[2], 10);
      const ampm = match[3];
      if (ampm) {
        if (ampm.toUpperCase() === 'PM' && hours < 12) hours += 12;
        if (ampm.toUpperCase() === 'AM' && hours === 12) hours = 0;
      }
      return hours * 60 + minutes;
    }

    if (job.createdAt) {
      if (typeof job.createdAt === 'object' && job.createdAt?.seconds) {
        return Math.floor(job.createdAt.seconds / 60);
      }
      const d = new Date(job.createdAt);
      if (!isNaN(d.getTime())) return Math.floor(d.getTime() / (1000 * 60));
    }

    return 0;
  };

  const getJobTier = (job) => {
    const isCancelled = 
      job.status === 'Cancelled' || 
      job.status === 'CANCELLED' || 
      job.status === 'cancelled' ||
      (typeof job.status === 'string' && job.status.toLowerCase().includes('cancel'));
    const isEmg = Boolean(job.isEmergency || job.tag === 'EMERGENCY' || job.category === 'Emergency' || job.bookingCollection === 'emergencyBookings');
    const isUrgent = Boolean(job.tag === 'URGENT' || job.priority === 'HIGH');
    
    if (isEmg && !isCancelled) return 1; // Tier 1: Emergency Requests (Top)
    if (isUrgent && !isCancelled) return 2; // Tier 2: Urgent Requests
    if (!isCancelled) return 3; // Tier 3: Normal Active Requests
    return 4; // Tier 4: Cancelled Requests (Bottom)
  };

  const activeJobs = jobs.filter(j => j.status !== 'Completed' && !isJobCancelled(j));
  const emergencyJobs = jobs.filter(j => (j.isEmergency || j.tag === 'EMERGENCY' || j.tag === 'URGENT') && !isJobCancelled(j) && j.status !== 'Completed');
  const completedTodayCount = jobs.filter(j => j.status === 'Completed').length;
  const totalJobsHandledToday = jobs.filter(j => !isJobCancelled(j)).length;
  const capacityPercentage = Math.min(100, Math.round((totalJobsHandledToday / maxCapacity) * 100));

  const displayScheduleJobs = [...jobs].sort((a, b) => {
    const tierA = getJobTier(a);
    const tierB = getJobTier(b);
    if (tierA !== tierB) return tierA - tierB; // Tier 1 (Emergency) -> Tier 2 (Urgent) -> Tier 3 (Normal) -> Tier 4 (Cancelled)

    const timeA = getTimeMinutes(a);
    const timeB = getTimeMinutes(b);
    if (timeA !== timeB && timeA > 0 && timeB > 0) return timeA - timeB;

    return String(a.id || '').localeCompare(String(b.id || ''));
  });

  return (
    <div className="space-y-7 antialiased transition-colors duration-200">
      
      {/* Top Row: 4 Metric Cards with MagicBento Particle Spotlight Effect */}
      <MagicBento 
        glowColor="19, 64, 116"
        spotlightRadius={280}
        particleCount={10}
        enableTilt={true}
        enableMagnetism={true}
        clickEffect={true}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
      >
        
        {/* Metric 1: Assigned Jobs */}
        <ParticleCard glowColor="19, 64, 116" className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">Assigned Jobs</span>
            <div className="w-8 h-8 rounded-xl bg-[#EEF4ED] dark:bg-slate-800 text-[#134074] dark:text-blue-400 flex items-center justify-center">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-[#0B2545] dark:text-white tracking-tight">{activeJobs.length} Active</div>
          <div className="text-xs font-medium text-[#134074] dark:text-blue-400 flex items-center gap-1">
            <span>Scheduled for today</span>
          </div>
        </ParticleCard>

        {/* Metric 2: Emergency Alerts */}
        <ParticleCard 
          onClick={onTriggerEmergency}
          glowColor="225, 29, 72"
          className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-rose-200 dark:border-rose-900/50 bg-rose-50/20 dark:bg-rose-950/20 shadow-xs space-y-2 cursor-pointer hover:shadow-md hover:border-rose-300 dark:hover:border-rose-800 transition-all"
        >
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-1">
              Emergency Jobs
            </span>
            <div className="w-8 h-8 rounded-xl bg-rose-100/70 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-rose-600 dark:text-rose-400 tracking-tight">
            {emergencyJobs.length > 0 ? `${emergencyJobs.length} Pending` : '0 Active'}
          </div>
          <div className="text-xs font-medium text-rose-600 dark:text-rose-400">
            Urgent Requests
          </div>
        </ParticleCard>

        {/* Metric 3: Daily Workload Capacity */}
        <ParticleCard glowColor="217, 119, 6" className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">Daily Workload</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-[#0B2545] dark:text-white tracking-tight">
            {totalJobsHandledToday} / {maxCapacity} Jobs
          </div>
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
            {capacityPercentage}% Capacity Used
          </div>
        </ParticleCard>

        {/* Metric 4: Satisfaction & Rating */}
        <ParticleCard glowColor="5, 150, 105" className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">Technician Rating</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Star className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-[#0B2545] dark:text-white tracking-tight">
            {avgRating ? `${avgRating} / 5.0` : 'Not rated'}
          </div>
          <div className="text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
            <span>{avgRating ? `${positivePercentage}% Positive Feedback` : 'No reviews yet'}</span>
          </div>
        </ParticleCard>

      </MagicBento>

      {/* Main Section: Schedule & Urgent Broadcast Callout */}
      <MagicBento 
        glowColor="19, 64, 116"
        spotlightRadius={320}
        particleCount={10}
        enableTilt={true}
        enableMagnetism={true}
        clickEffect={true}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        
        {/* Left Column (2 Cols): Assigned Schedule Card */}
        <ParticleCard glowColor="19, 64, 116" className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-start space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-[#0B2545] dark:text-white">Today's Schedule</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-normal mt-0.5">Select a job to view details and update workflow status</p>
            </div>
            <button 
              onClick={onViewAllJobs}
              className="text-xs font-semibold text-[#134074] dark:text-blue-400 hover:text-[#13315C] dark:hover:text-blue-300 hover:underline flex items-center gap-1 transition-colors z-10"
            >
              <span>View All ({jobs.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Jobs List */}
          <div className="space-y-3 flex flex-col justify-start">
            {displayScheduleJobs.length === 0 ? (
              <div className="text-center py-12 bg-[#EEF4ED]/40 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-200/80 dark:border-slate-700 text-xs font-medium text-slate-500 dark:text-slate-400">
                No jobs scheduled for today
              </div>
            ) : (
              displayScheduleJobs.map((job) => {
                const isCancelled = 
                  job.status === 'Cancelled' || 
                  job.status === 'CANCELLED' || 
                  job.status === 'cancelled' || 
                  (typeof job.status === 'string' && job.status.toLowerCase().includes('cancel'));

                const isEmergency = Boolean(job.isEmergency || job.tag === 'EMERGENCY' || job.category === 'Emergency');

                return (
                  <div 
                    key={job.id}
                    onClick={() => onSelectJob(job)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                      isCancelled 
                        ? 'border-rose-200 dark:border-rose-900/40 bg-rose-50/40 dark:bg-rose-950/30 hover:bg-rose-50/60' 
                        : isEmergency
                          ? 'border border-rose-300 dark:border-rose-800 bg-rose-50/20 dark:bg-rose-950/30 hover:bg-rose-50/50 hover:shadow-sm'
                          : 'border-slate-200/80 dark:border-slate-800 hover:border-blue-500/40 hover:shadow-sm bg-white dark:bg-slate-900/90 hover:bg-[#EEF4ED]/30 dark:hover:bg-slate-800/80'
                    }`}
                  >
                    <div className="flex items-start gap-3.5">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        isCancelled 
                          ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400' 
                          : isEmergency 
                            ? 'bg-rose-600 text-white' 
                            : 'bg-[#EEF4ED] dark:bg-slate-800 text-[#134074] dark:text-blue-400'
                      }`}>
                        {isCancelled ? <ShieldAlert className="w-5 h-5" /> : isEmergency ? <ShieldAlert className="w-5 h-5" /> : <Briefcase className="w-5 h-5" />}
                      </div>

                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className={`text-sm font-bold ${isCancelled ? 'text-slate-400 line-through' : 'text-[#0B2545] dark:text-white'}`}>
                            {job.title}
                          </h4>

                          {isEmergency && !isCancelled && (
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-rose-600 text-white uppercase tracking-wider">
                              EMERGENCY
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-slate-500 dark:text-slate-400 font-normal mt-1 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate max-w-xs">{job.location}</span>
                        </p>

                        <div className="flex items-center gap-3 text-[11px] font-medium text-slate-400 mt-2">
                          <span className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                            <User className="w-3 h-3 text-slate-400" /> {job.customerName}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                            <Clock className="w-3 h-3 text-slate-400" /> {job.timeSlot || job.time}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-end justify-between sm:justify-center gap-2 shrink-0">
                      <span className="text-sm font-bold text-[#0B2545] dark:text-white">
                        ₹{(job.price + (job.extraCharges || 0)).toFixed(2)}
                      </span>
                      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold ${
                        isCancelled
                          ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-900/40'
                          : job.status === 'Completed' 
                            ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400' 
                            : job.status === 'Service Started' || job.status === 'On The Way'
                              ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400' 
                              : 'bg-[#EEF4ED] dark:bg-slate-800 text-[#134074] dark:text-blue-400'
                      }`}>
                        {isCancelled ? 'Cancelled' : job.status}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </ParticleCard>

        {/* Right Column (1 Col): Live Emergency & Action Box */}
        <div className="space-y-5 flex flex-col justify-start">
          
          {/* Emergency Card Box */}
          <ParticleCard glowColor="225, 29, 72" className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-rose-200 dark:border-rose-900/50 bg-rose-50/20 dark:bg-rose-950/20 shadow-xs flex flex-col justify-start space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-rose-200/60 dark:border-rose-900/40">
              <h3 className="text-base font-bold text-rose-700 dark:text-rose-400 flex items-center gap-2">
                Emergency Calls
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-rose-600 text-white">
                LIVE
              </span>
            </div>

            <p className="text-xs font-normal text-slate-600 dark:text-slate-300 leading-relaxed">
              Emergency requests in your service area are shown here. First technician to accept gets assigned.
            </p>

            <button
              onClick={onTriggerEmergency}
              className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 z-10"
            >
              <span>View Emergency Calls</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </ParticleCard>

          {/* Quick Dynamic Performance Summary Card */}
          <ParticleCard glowColor="19, 64, 116" className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-start space-y-4">
            <h3 className="text-base font-bold text-[#0B2545] dark:text-white">Performance Summary</h3>
            
            <div className="space-y-3 text-xs font-medium text-slate-600 dark:text-slate-400">
              <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
                <span>Jobs Completed Today</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">{completedTodayCount} Jobs</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
                <span>Total Jobs Handled</span>
                <span className="font-bold text-[#0B2545] dark:text-white">{jobs.length} Jobs</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
                <span>Emergency Jobs Accepted</span>
                <span className="font-bold text-rose-600 dark:text-rose-400">
                  {jobs.filter(j => (j.isEmergency || j.tag === 'EMERGENCY') && !isJobCancelled(j)).length} Jobs
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>Cancellation Rate</span>
                {(() => {
                  const cancelled = jobs.filter(isJobCancelled).length;
                  const rate = jobs.length > 0 ? ((cancelled / jobs.length) * 100).toFixed(1) + '%' : '0.0%';
                  return (
                    <span className={`font-bold ${cancelled > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-500 dark:text-slate-400'}`}>
                      {rate}
                    </span>
                  );
                })()}
              </div>
            </div>
          </ParticleCard>

        </div>

      </MagicBento>

    </div>
  );
}
