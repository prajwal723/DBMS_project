'use client';
import Link from 'next/link';

export default function Footer({ onShowToast }) {
  const handleSubmit = (e) => {
    e.preventDefault();
    if (onShowToast) onShowToast('Thank you for subscribing to 1tapfix updates!');
    e.target.reset();
  };

  return (
    <footer id="contact" className="bg-[#0B2545] dark:bg-black text-slate-300 pt-20 pb-12 antialiased dark:border-t dark:border-slate-800 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-6 space-y-16">
        
        {/* Top 4 Column Links */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          
          {/* Brand Col */}
          <div className="space-y-4">
            <Link href="/" className="inline-block overflow-visible">
              <img 
                src="/assets/images/logo.png" 
                alt="1tapfix Logo" 
                className="h-14 w-auto object-contain scale-125 origin-left dark:invert" 
              />
            </Link>

            <p className="text-xs text-slate-400 font-normal leading-relaxed max-w-xs">
              Reliable Home Services, Simplified. Connecting homeowners with background-verified professionals for trusted maintenance across India.
            </p>

            <div className="flex gap-2.5 pt-2">
              {['in', 'tw', 'fb'].map((icon) => (
                <span 
                  key={icon}
                  className="w-8 h-8 rounded-lg bg-white/10 dark:bg-slate-800 text-slate-300 flex items-center justify-center text-xs font-bold hover:bg-[#134074] dark:hover:bg-blue-600 hover:text-white transition-colors cursor-pointer"
                >
                  {icon}
                </span>
              ))}
            </div>
          </div>

          {/* Services Col */}
          <div className="space-y-4">
            <h4 className="font-bold font-heading text-white text-sm">Services</h4>
            <ul className="space-y-2.5 text-xs text-slate-400 font-normal">
              <li><a href="#services" className="hover:text-white transition-colors">Plumbing Repair</a></li>
              <li><a href="#services" className="hover:text-white transition-colors">Electrical Services</a></li>
              <li><a href="#services" className="hover:text-white transition-colors">AC Maintenance</a></li>
              <li><a href="#services" className="hover:text-white transition-colors">Carpentry & Assembly</a></li>
              <li><a href="#services" className="hover:text-white transition-colors">Home Painting</a></li>
            </ul>
          </div>

          {/* Ecosystem Col */}
          <div className="space-y-4">
            <h4 className="font-bold font-heading text-white text-sm">Ecosystem</h4>
            <ul className="space-y-2.5 text-xs text-slate-400 font-normal">
              <li><Link href="/technician" className="hover:text-white transition-colors">Technician Hub</Link></li>
              <li><a href="#why-us" className="hover:text-white transition-colors">Why 1tapfix</a></li>
              <li><a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a></li>
              <li><a href="#about" className="hover:text-white transition-colors">Safety Standards</a></li>
            </ul>
          </div>

          {/* Newsletter Col */}
          <div className="space-y-4">
            <h4 className="font-bold font-heading text-white text-sm">Stay Updated</h4>
            <p className="text-xs text-slate-400 font-normal leading-relaxed">
              Subscribe for seasonal maintenance tips and exclusive offer updates.
            </p>
            <form onSubmit={handleSubmit} className="flex gap-2">
              <input 
                type="email" 
                placeholder="Enter email address" 
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/10 dark:bg-slate-800/80 border border-white/15 dark:border-slate-700 text-xs text-white placeholder-slate-400 focus:outline-none focus:bg-white/15 focus:border-[#8DA9C4] transition-all" 
                required 
              />
              <button 
                type="submit" 
                className="bg-[#134074] hover:bg-[#13315C] dark:bg-blue-600 dark:hover:bg-blue-500 text-white px-4 rounded-xl text-sm font-semibold transition-colors"
              >
                &rarr;
              </button>
            </form>
          </div>

        </div>

        {/* Bottom Legal & Copyright */}
        <div className="pt-8 border-t border-white/10 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 font-normal gap-4">
          <p>© 2026 1tapfix India Services Pvt. Ltd. All rights reserved.</p>
          <div className="flex gap-6">
            <button 
              type="button"
              onClick={() => onShowToast && onShowToast('Privacy Policy: 1tapfix ensures 100% data privacy and customer confidentiality.')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Privacy Policy
            </button>
            <button 
              type="button"
              onClick={() => onShowToast && onShowToast('Terms of Service: Standard verified home repair warranty & service terms apply.')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Terms of Service
            </button>
            <button 
              type="button"
              onClick={() => onShowToast && onShowToast('System Status: 100% Operational • All dispatch hubs live across Mangaluru.')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              System Status
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
}
