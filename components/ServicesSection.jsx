'use client';
import { useState } from 'react';
import { Wrench, Zap, Snowflake, Hammer, Paintbrush, Sparkles, Settings, ShieldAlert, ArrowRight } from 'lucide-react';

export default function ServicesSection({ onSelectService }) {
  const [services] = useState([
    { id: 'plumbing', name: 'Plumbing Repair', price: 399, icon: Wrench, desc: 'Pipe repair, leak fixing, tap & vanity installation', tag: 'Popular' },
    { id: 'electrical', name: 'Electrical Works', price: 499, icon: Zap, desc: 'Wiring, circuit breaker, lighting & switch repairs', tag: 'Verified' },
    { id: 'ac_service', name: 'AC Servicing & Repair', price: 699, icon: Snowflake, desc: 'Air conditioning cleaning, gas check & duct repair', tag: 'Seasonal' },
    { id: 'carpentry', name: 'Carpentry & Furniture', price: 599, icon: Hammer, desc: 'Furniture assembly, door lock & custom woodwork', tag: 'Expert' },
    { id: 'painting', name: 'Home Painting', price: 1499, icon: Paintbrush, desc: 'Interior & exterior wall painting & waterproofing', tag: 'Full Service' },
    { id: 'cleaning', name: 'Deep Sanitation', price: 899, icon: Sparkles, desc: 'Deep home sanitation, kitchen & carpet cleaning', tag: 'Hygiene' },
    { id: 'appliances', name: 'Appliance Repair', price: 499, icon: Settings, desc: 'Refrigerator, oven, microwave & washer maintenance', tag: 'Fast Fix' },
    { id: 'pest_control', name: 'Pest Inspection', price: 999, icon: ShieldAlert, desc: 'Eco-friendly pest inspection & removal service', tag: 'Safe' }
  ]);

  return (
    <section id="services" className="py-20 bg-white dark:bg-slate-950 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-6 space-y-12">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-regalNavy dark:text-blue-400 bg-[#EEF4ED] dark:bg-slate-800 px-4 py-1.5 rounded-full border border-powderBlue/40 dark:border-slate-700">
            Transparent Upfront Pricing
          </span>
          <h2 className="text-3xl md:text-4xl font-black font-heading text-prussianBlue dark:text-white tracking-tight">
            Our Core Home Services
          </h2>
          <p className="text-sm font-normal text-slate-600 dark:text-slate-300 leading-relaxed">
            Select a service category to view verified technicians, fixed pricing in Indian Rupees, and schedule a convenient home appointment.
          </p>
        </div>

        {/* Services Grid (16px radius cards) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((srv) => {
            const IconComp = srv.icon;
            return (
              <div 
                key={srv.id}
                onClick={() => onSelectService(srv)}
                className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-card hover:border-blue-500/40 hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col justify-between space-y-5 group"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-xl bg-mintCream dark:bg-slate-800 text-regalNavy dark:text-blue-400 flex items-center justify-center group-hover:bg-regalNavy dark:group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      <IconComp className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-bold text-regalNavy dark:text-blue-400 bg-mintCream dark:bg-slate-800 px-2.5 py-1 rounded-full border border-powderBlue/30 dark:border-slate-700">
                      {srv.tag}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold font-heading text-prussianBlue dark:text-white group-hover:text-regalNavy dark:group-hover:text-blue-400 transition-colors">
                      {srv.name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-normal leading-relaxed mt-1">
                      {srv.desc}
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold block">Starts from</span>
                    <span className="text-lg font-black font-heading text-prussianBlue dark:text-white">₹{srv.price}</span>
                  </div>

                  <span className="text-xs font-semibold text-regalNavy dark:text-blue-400 group-hover:text-oxfordNavy dark:group-hover:text-blue-300 flex items-center gap-1">
                    <span>Book Now</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
