'use client';
import { 
  ArrowLeft, 
  User, 
  Phone, 
  MapPin, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  PlusCircle, 
  FileText,
  Lock,
  ChevronRight,
  Ban,
  Wrench
} from 'lucide-react';

export default function TechJobDetail({ 
  job, 
  onBack, 
  onUpdateStatus, 
  onOpenExtraCharges, 
  onOpenReportDelay 
}) {
  if (!job) return null;

  // Ordered Checklist Workflow Stages
  const workflowStages = [
    { key: 'Assigned', label: '1. Assigned' },
    { key: 'Accepted', label: '2. Accepted' },
    { key: 'On The Way', label: '3. On The Way' },
    { key: 'Reached Location', label: '4. Reached Location' },
    { key: 'Service Started', label: '5. Service Started' },
    { key: 'Completed', label: '6. Service Completed' }
  ];

  const isCompleted = job.status === 'Completed' || job.status === 'COMPLETED' || job.status === 'completed';
  const isCancelled = 
    job.status === 'Cancelled' || 
    job.status === 'CANCELLED' || 
    job.status === 'cancelled' || 
    (typeof job.status === 'string' && job.status.toLowerCase().includes('cancel'));
  const isLocked = isCompleted || isCancelled;

  const currentStageIndex = workflowStages.findIndex(s => s.key === job.status);
  const nextStage = currentStageIndex >= 0 && currentStageIndex < workflowStages.length - 1 
    ? workflowStages[currentStageIndex + 1] 
    : null;

  // Calculate pricing breakdown
  const fixedPrice = job.price || 0;
  const extraCharges = job.extraCharges || 0;
  const totalAmount = fixedPrice + extraCharges;

  return (
    <div className="space-y-6 antialiased max-w-5xl mx-auto transition-colors duration-200">
      
      {/* Back Button & Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-xs font-extrabold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm"
        >
          <ArrowLeft className="w-4 h-4 text-slate-400" />
          <span>Back to Jobs</span>
        </button>

        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 rounded-full text-xs font-extrabold ${
            isCancelled 
              ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50' 
              : isCompleted
                ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50'
                : job.isEmergency 
                  ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400' 
                  : 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400'
          }`}>
            {isCancelled ? 'CANCELLED' : isCompleted ? 'COMPLETED' : job.tag || (job.isEmergency ? 'EMERGENCY' : 'STANDARD')}
          </span>
        </div>
      </div>

      {/* Read-Only Cancelled Notice Banner */}
      {isCancelled && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-800 dark:text-rose-300 text-xs font-bold flex items-center justify-between shadow-sm animate-in fade-in duration-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-rose-600 text-white flex items-center justify-center font-bold shrink-0">
              <Ban className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-extrabold text-rose-900 dark:text-rose-200 text-sm">Request Cancelled (Read-Only)</h4>
              <p className="text-xs text-rose-700 dark:text-rose-400 font-medium mt-0.5">This job has been cancelled and reported to the Dispatcher terminal. No further edits or status progression can be made.</p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full bg-rose-600 text-white text-[10px] font-black uppercase tracking-wider shrink-0">
            Locked
          </span>
        </div>
      )}

      {/* Read-Only Completed Notice Banner */}
      {isCompleted && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 text-emerald-900 dark:text-emerald-300 text-xs font-bold flex items-center justify-between shadow-sm animate-in fade-in duration-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-extrabold text-emerald-950 dark:text-emerald-200 text-sm">Job Successfully Completed (Read-Only Mode)</h4>
              <p className="text-xs text-emerald-800 dark:text-emerald-400 font-medium mt-0.5">All service stages have been finalized and verified. This job record is locked against further modification.</p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full bg-emerald-600 text-white text-[10px] font-black uppercase tracking-wider shrink-0">
            Locked
          </span>
        </div>
      )}

      {/* Main Job Card */}
      <div className={`bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 border shadow-xs space-y-8 ${isCancelled ? 'border-rose-200 dark:border-rose-900/40' : isCompleted ? 'border-emerald-200 dark:border-emerald-900/40' : 'border-slate-200/60 dark:border-slate-800'}`}>
        
        {/* Title & Customer Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className={`text-2xl font-bold ${isCancelled ? 'text-slate-400 line-through' : 'text-[#0B2545] dark:text-white'}`}>{job.title}</h2>
            <p className="text-xs text-[#134074] dark:text-blue-400 font-semibold mt-1 flex items-center gap-1">
              <Wrench className="w-3.5 h-3.5" /> {job.service || job.category || 'Standard Service'}
            </p>
          </div>

          <div className="sm:text-right">
            <span className="text-2xl font-bold text-[#0B2545] dark:text-white">₹{totalAmount.toFixed(2)}</span>
            <span className="text-xs font-medium text-slate-400 dark:text-slate-500 block mt-0.5">Total Final Cost</span>
          </div>
        </div>

        {/* 1-Click Fast-Track Action Button */}
        {!isLocked && nextStage && (
          <div className="bg-[#134074] dark:bg-blue-900/80 border dark:border-blue-700/60 p-5 rounded-2xl text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#8DA9C4] dark:text-blue-300 block">Current Stage: {workflowStages[currentStageIndex]?.label || job.status}</span>
              <h4 className="text-base font-bold mt-0.5">Next Action: {nextStage.label}</h4>
            </div>
            <button
              onClick={() => onUpdateStatus(job.id, nextStage.key)}
              className="px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-xs transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer"
            >
              <span>Mark as <strong>{nextStage.label}</strong></span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Checklist-Based Job Progress Bar */}
        <div className="space-y-3 bg-[#EEF4ED]/40 dark:bg-slate-800/40 p-6 rounded-2xl border border-slate-200/60 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase text-slate-400 dark:text-slate-500 tracking-wider">
              Job Progress
            </h4>
            {isLocked && (
              <span className={`flex items-center gap-1 text-xs font-semibold ${isCancelled ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                <Lock className="w-3.5 h-3.5" /> Job Locked ({isCancelled ? 'Cancelled' : 'Completed'})
              </span>
            )}
          </div>

          {/* Workflow Stage Buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {workflowStages.map((stage, idx) => {
              const isPassed = idx < currentStageIndex;
              const isCurrent = idx === currentStageIndex;
              const isNextSequential = idx === currentStageIndex + 1;
              const isDisabled = isLocked || (idx > currentStageIndex + 1);

              return (
                <button
                  key={stage.key}
                  disabled={isDisabled}
                  onClick={() => !isDisabled && onUpdateStatus(job.id, stage.key)}
                  title={isDisabled && !isLocked ? 'Complete current stage first before advancing' : ''}
                  className={`p-3 rounded-xl text-[11px] font-semibold flex flex-col items-center justify-center gap-1 transition-all ${
                    isLocked 
                      ? isCancelled
                        ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700 cursor-not-allowed opacity-60'
                        : isCurrent || isPassed
                          ? 'bg-emerald-600 text-white shadow-xs cursor-not-allowed opacity-90'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700 cursor-not-allowed opacity-40'
                      : isCurrent 
                        ? 'bg-[#134074] dark:bg-blue-600 text-white shadow-xs'
                        : isNextSequential
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-400 dark:border-emerald-600 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 cursor-pointer font-bold'
                          : isPassed
                            ? 'bg-[#EEF4ED] dark:bg-slate-800 text-[#134074] dark:text-blue-400'
                            : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-300 dark:text-slate-600 cursor-not-allowed opacity-40'
                  }`}
                >
                  <CheckCircle2 className={`w-4 h-4 ${isCurrent ? 'text-white' : isPassed ? 'text-[#134074] dark:text-blue-400' : isNextSequential ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-300 dark:text-slate-600'}`} />
                  <span className="text-center leading-tight">{stage.label}</span>
                  {(isPassed || isCurrent) && (
                    <span className="text-[9px] font-normal opacity-85 mt-0.5">
                      {job.timestamps?.[stage.key] || (stage.key === 'Assigned' ? job.assignedAt || '09:30 AM' : 'Recorded')}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Customer & Location Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Customer Info Card */}
          <div className="p-5 rounded-2xl bg-[#EEF4ED]/30 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 space-y-3">
            <h4 className="text-xs font-bold uppercase text-slate-400 dark:text-slate-500 tracking-wider">Customer Details</h4>
            
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-[#0B2545] dark:bg-slate-700 text-white flex items-center justify-center font-bold shrink-0">
                <User className="w-5 h-5 text-[#8DA9C4] dark:text-blue-300" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#0B2545] dark:text-white">{job.customerName}</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-normal flex items-center gap-1 mt-0.5">
                  <Phone className="w-3 h-3 text-slate-400" /> {job.customerPhone}
                </p>
              </div>
            </div>

            <div className="pt-2 text-xs font-normal text-slate-600 dark:text-slate-400 space-y-1.5">
              <p className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{job.location}</span>
              </p>
              <p className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>Scheduled: {job.timeSlot || job.time || '09:30 AM'}</span>
              </p>
              <p className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-semibold pt-0.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>Total Duration: {job.duration || '1 hour'}</span>
              </p>
            </div>
          </div>

          {/* Pricing & Billing Breakdown Card */}
          <div className="p-5 rounded-2xl bg-[#EEF4ED]/30 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 space-y-3 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase text-slate-400 dark:text-slate-500 tracking-wider">Pricing & Extra Charges</h4>
              
              {!isLocked && (
                <button
                  onClick={onOpenExtraCharges}
                  className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-[#134074] dark:text-blue-400 hover:bg-[#EEF4ED] dark:hover:bg-slate-700 text-xs font-semibold flex items-center gap-1 transition-colors shadow-xs"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>+ Add Extra Charges</span>
                </button>
              )}
            </div>

            <div className="space-y-2 text-xs font-normal text-slate-600 dark:text-slate-400">
              <div className="flex justify-between items-center pb-1.5 border-b border-slate-200/60 dark:border-slate-800">
                <span>Fixed Service Base Price (Locked)</span>
                <span className="font-bold text-[#0B2545] dark:text-white">₹{fixedPrice.toFixed(2)}</span>
              </div>

              {job.extraLabour > 0 && (
                <div className="flex justify-between items-center pb-1 border-b border-slate-200/60 dark:border-slate-800 text-slate-600 dark:text-slate-400">
                  <span>Additional Labour Charges</span>
                  <span className="font-semibold text-[#134074] dark:text-blue-400">+₹{job.extraLabour.toFixed(2)}</span>
                </div>
              )}

              {job.extraMaterial > 0 && (
                <div className="flex justify-between items-center pb-1 border-b border-slate-200/60 dark:border-slate-800 text-slate-600 dark:text-slate-400">
                  <span>Additional Material Charges</span>
                  <span className="font-semibold text-[#134074] dark:text-blue-400">+₹{job.extraMaterial.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between items-center pb-2 border-b border-slate-200/60 dark:border-slate-800">
                <span>Total Additional Charges</span>
                <span className="font-bold text-[#134074] dark:text-blue-400">+₹{extraCharges.toFixed(2)}</span>
              </div>

              {job.extraChargesReason && (
                <div className="bg-white dark:bg-slate-800 p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-700 space-y-1">
                  <span className="text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500 tracking-wider block">Mandatory Justification Reason:</span>
                  <p className="text-[11px] text-slate-700 dark:text-slate-300 font-normal italic">"{job.extraChargesReason}"</p>
                </div>
              )}

              <div className="flex justify-between items-center pt-2 text-sm font-bold text-[#0B2545] dark:text-white">
                <span>Calculated Final Total Bill</span>
                <span className="text-base font-bold text-emerald-600 dark:text-emerald-400">₹{totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>

        </div>

        {/* Job Description & Customer Notes */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase text-slate-400 dark:text-slate-500 tracking-wider">Issue Description & Notes</h4>
          <p className="text-xs text-slate-600 dark:text-slate-300 font-normal leading-relaxed bg-[#EEF4ED]/30 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200/60 dark:border-slate-800">
            {job.description || job.notes || job.customerNote || "No specific customer instructions provided."}
          </p>
        </div>

        {/* Action Footer - Report Delay / Cancellation Alert & Finalize Completion */}
        {!isLocked && (() => {
          const serviceStartedReached = currentStageIndex >= 4 || job.status === 'Service Started';
          return (
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <button
                onClick={onOpenReportDelay}
                className="px-4 py-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 text-amber-700 dark:text-amber-400 text-xs font-semibold hover:bg-amber-100 dark:hover:bg-amber-900/60 transition-colors flex items-center gap-2"
              >
                <AlertTriangle className="w-4 h-4" />
                <span>Report Delay or Request Cancellation</span>
              </button>

              <div className="flex items-center gap-2">
                {!serviceStartedReached && (
                  <span className="text-[10px] font-medium text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-3 py-1 rounded-lg border border-amber-200/60 dark:border-amber-900/50 hidden sm:inline-block">
                    ⚠️ Complete "Service Started" stage to enable
                  </span>
                )}
                <button
                  disabled={!serviceStartedReached}
                  onClick={() => serviceStartedReached && onUpdateStatus(job.id, 'Completed')}
                  title={!serviceStartedReached ? 'Advance to "Service Started" stage first to enable finalization' : 'Finalize and mark job completed'}
                  className={`px-6 py-2.5 rounded-xl font-semibold text-xs transition-all flex items-center gap-2 ${
                    serviceStartedReached 
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs cursor-pointer'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700 cursor-not-allowed opacity-60'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Finalize & Mark Completed</span>
                </button>
              </div>
            </div>
          );
        })()}

      </div>

    </div>
  );
}
