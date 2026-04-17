"use client";

import { 
  Plus, 
  ChevronRight, 
  ArrowRight, 
  ArrowUpRight, 
  CheckCircle2, 
  ChevronDown, 
  Play, 
  Users, 
  Briefcase, 
  Database,
  ArrowUp,
  Search,
  MessageCircle,
  Mail,
  Phone,
  Facebook,
  Twitter,
  Linkedin,
  Instagram
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import Image from "next/image";
import { clsx } from "clsx";

export default function HireExpertsPage() {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const faqs = [
    {
      q: "Why should I hire from Refrens?",
      a: "Refrens will provide you people with deep expertise in their field. We will provide you people who have done similar work as yours in past. Our escrow based payment protection system ensures your payment is safe and secure."
    },
    {
      q: "Are Refrens freelancers reliable?",
      a: "We do our screening and ensure we share reliable & verified profiles but in case if you have any apprehensions related to a freelancer we have an escrow system in place to safeguard the interests of both parties."
    },
    {
      q: "Should the payment happen from your platform?",
      a: "Not necessarily. You can choose to pay directly as well. In case you have any apprehensions, the Escrow system can be used to safeguard."
    },
    {
      q: "In case we don't go ahead with you then?",
      a: "In case for some reason it does not work out with the initial few profiles, we can share more expert profiles within 24hrs. In case if you go ahead with someone from your own network, that's fine as well."
    },
    {
      q: "Is the budget mandatory to be shared with you?",
      a: "No, it is not mandatory. You can submit a requirement without the budget as well. However, with a budget, the requirement becomes more clear and we know about your expectations in more detail."
    }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-[#020617] text-[#1A1A1A] dark:text-white font-sans -m-8">
      {/* Navigation Header */}
      <header className="bg-[#7C3AED] px-10 py-4 flex items-center justify-between sticky top-0 z-50 shadow-lg">
        <div className="flex items-center gap-12">
          <div className="text-white font-black text-2xl tracking-tighter flex items-center gap-1">
            <div className="w-6 h-6 bg-white transform rotate-45 flex items-center justify-center">
              <div className="w-3 h-3 bg-[#7C3AED] transform -rotate-45" />
            </div>
            Refrens
          </div>
          <nav className="hidden md:flex items-center gap-8 text-[11px] font-bold text-white/80 uppercase tracking-widest">
            <Link href="#" className="hover:text-white transition-colors">Referred Leads</Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg font-bold text-[11px] border border-white/20 transition-all uppercase tracking-widest">
            Go to Dashboard <ArrowRight size={14} />
          </Link>
          <div className="w-10 h-10 rounded-full bg-[#1A1A1A] border-2 border-white/20 flex items-center justify-center text-xs font-bold shadow-lg">
            SM
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-[#7C3AED] pt-20 pb-40 px-10 text-center space-y-8 relative overflow-hidden">
        {/* Subtle Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-10">
           <div className="absolute top-10 left-10 w-64 h-64 bg-white rounded-full blur-3xl" />
           <div className="absolute bottom-10 right-10 w-64 h-64 bg-pink-400 rounded-full blur-3xl" />
        </div>

        <div className="max-w-4xl mx-auto space-y-6 relative z-10">
          <h1 className="text-5xl md:text-6xl font-black text-white leading-[1.1] tracking-tight">
            Hire Financial Advisor & Accountants
          </h1>
          <p className="text-lg text-white/80 leading-relaxed font-medium max-w-3xl mx-auto">
            Comprehensive CA services for businesses – from company incorporation, bookkeeping, GST, and tax filings to payroll, audits, ROC compliance, and expert financial advisory – all under one roof.
          </p>
          <div className="pt-6">
            <button className="px-10 py-5 bg-[#D81159] hover:bg-[#B00E4A] text-white rounded-xl font-black text-sm shadow-2xl shadow-pink-900/40 transition-all active:scale-95 uppercase tracking-widest">
              Get In Touch
            </button>
          </div>
        </div>
      </section>

      {/* Trust & Featured Bar */}
      <div className="relative -mt-20 z-20">
        <div className="max-w-6xl mx-auto px-10">
          {/* Trust Caption */}
          <div className="bg-slate-50 dark:bg-slate-900/50 py-3 rounded-t-2xl border-x border-t border-[#F0EAF0] dark:border-slate-800 text-center">
             <span className="text-[10px] font-black text-[#999] dark:text-slate-500 uppercase tracking-[0.2em] flex items-center justify-center gap-2">
                Clients Rate Refrens Experts <span className="text-yellow-500">⭐ 4.9/5 based on 10,000+ Reviews</span>
             </span>
          </div>
          
          {/* Logos Bar */}
          <div className="bg-white dark:bg-slate-900 border border-[#F0EAF0] dark:border-slate-800 rounded-2xl shadow-2xl p-10">
            <p className="text-center text-2xl font-black text-[#333] dark:text-white mb-10">Featured In</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-12 items-center opacity-70 grayscale hover:grayscale-0 transition-all">
               <div className="text-3xl font-black italic tracking-tighter text-[#1A1A1A] dark:text-white text-center">YOURSTORY</div>
               <div className="text-3xl font-black tracking-tighter text-[#1A1A1A] dark:text-white text-center">VCCIRCLE</div>
               <div className="text-2xl font-serif font-black text-[#1A1A1A] dark:text-white text-center">ECONOMIC TIMES</div>
               <div className="text-2xl font-serif font-black text-[#1A1A1A] dark:text-white text-center tracking-tighter">THE INDIAN EXPRESS</div>
            </div>
          </div>
        </div>
      </div>

      {/* How it Works Section */}
      <section className="py-32 px-10 text-center space-y-20">
        <h2 className="text-4xl font-black text-[#1A1A1A] dark:text-white tracking-tight">How it Works?</h2>
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-16 relative">
          {/* Connecting Line (Desktop) */}
          <div className="hidden md:block absolute top-12 left-1/4 right-1/4 h-0.5 bg-dashed border-t-2 border-dashed border-slate-200 dark:border-slate-800 -z-10" />
          
          <div className="space-y-6 group">
            <div className="w-24 h-24 bg-[#7C3AED] rounded-full mx-auto flex items-center justify-center text-white shadow-xl shadow-purple-200/50 group-hover:scale-110 transition-transform">
               <ArrowUp size={32} strokeWidth={3} />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-black text-[#1A1A1A] dark:text-white uppercase tracking-tight">Post your requirement</h3>
              <p className="text-sm text-[#666] dark:text-slate-400 font-medium leading-relaxed">Share your requirement details like Budget, Time frame, description. Leave the rest on us.</p>
            </div>
          </div>

          <div className="space-y-6 group">
            <div className="w-24 h-24 bg-[#38BDF8] rounded-full mx-auto flex items-center justify-center text-white shadow-xl shadow-blue-200/50 group-hover:scale-110 transition-transform">
               <Search size={32} strokeWidth={3} />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-black text-[#1A1A1A] dark:text-white uppercase tracking-tight">Browse Experts' Profile</h3>
              <p className="text-sm text-[#666] dark:text-slate-400 font-medium leading-relaxed">We will share multiple experts' profile & portfolio for your requirement. Browse through them before making a decision</p>
            </div>
          </div>

          <div className="space-y-6 group">
            <div className="w-24 h-24 bg-[#84CC16] rounded-full mx-auto flex items-center justify-center text-white shadow-xl shadow-lime-200/50 group-hover:scale-110 transition-transform">
               <CheckCircle2 size={32} strokeWidth={3} />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-black text-[#1A1A1A] dark:text-white uppercase tracking-tight">Get the work done</h3>
              <p className="text-sm text-[#666] dark:text-slate-400 font-medium leading-relaxed">Select the one that you find the best. Get your work done.</p>
            </div>
          </div>
        </div>

        <div className="pt-10">
           <button className="px-8 py-3 bg-[#D81159] hover:bg-[#B00E4A] text-white rounded-lg font-bold text-[12px] shadow-lg shadow-pink-200/50 transition-all active:scale-95 uppercase tracking-widest">
              Hire Experts
           </button>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-slate-50 dark:bg-slate-900/30 py-24 px-10 text-center space-y-16 border-y border-[#F0EAF0] dark:border-slate-800">
        <h2 className="text-3xl font-black text-[#1A1A1A] dark:text-white tracking-tight">"Why Hire Experts from Refrens?"</h2>
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="space-y-4">
             <div className="w-24 h-24 rounded-full bg-orange-100 flex items-center justify-center mx-auto shadow-inner">
                <Users size={32} className="text-orange-500" />
             </div>
             <div className="space-y-1">
                <p className="text-2xl font-black text-[#1A1A1A] dark:text-white">11500+</p>
                <p className="text-[11px] font-bold text-[#999] uppercase tracking-widest">Happy Clients</p>
             </div>
          </div>
          <div className="space-y-4">
             <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center mx-auto shadow-inner">
                <Briefcase size={32} className="text-blue-500" />
             </div>
             <div className="space-y-1">
                <p className="text-2xl font-black text-[#1A1A1A] dark:text-white">14700+</p>
                <p className="text-[11px] font-bold text-[#999] uppercase tracking-widest">Projects Delivered</p>
             </div>
          </div>
          <div className="space-y-4">
             <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center mx-auto shadow-inner">
                <div className="text-2xl font-black text-green-600">₹</div>
             </div>
             <div className="space-y-1">
                <p className="text-2xl font-black text-[#1A1A1A] dark:text-white">₹8,10,00,000+</p>
                <p className="text-[11px] font-bold text-[#999] uppercase tracking-widest">Worth Business Done</p>
             </div>
          </div>
        </div>
        <div className="pt-6">
           <button className="px-8 py-3 bg-[#D81159] hover:bg-[#B00E4A] text-white rounded-lg font-bold text-[12px] shadow-lg shadow-pink-200/50 transition-all active:scale-95 uppercase tracking-widest">
              Hire Experts
           </button>
        </div>
      </section>

      {/* Expert Categories Section */}
      <section className="py-32 px-10">
        <div className="max-w-6xl mx-auto space-y-16">
          <h2 className="text-3xl font-black text-[#1A1A1A] dark:text-white tracking-tight">Hire Financial Advisor & Accountants</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
             <div className="relative group">
                <div className="aspect-[4/3] rounded-3xl overflow-hidden bg-purple-50 dark:bg-slate-800 border-2 border-[#F0EAF0] dark:border-slate-800 shadow-2xl">
                   {/* Illustrative Graphic */}
                   <div className="absolute inset-0 flex flex-col items-center justify-center space-y-6">
                      <div className="w-48 h-64 bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-6 flex flex-col gap-4 border border-[#F0EAF0] dark:border-slate-800">
                         <div className="w-full h-8 bg-[#FAF9FA] dark:bg-slate-800 rounded-lg flex items-center justify-center">
                            <span className="text-[10px] font-black tracking-widest text-[#7C3AED] uppercase">TAXES</span>
                         </div>
                         <div className="space-y-2">
                            <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full" />
                            <div className="w-3/4 h-2 bg-slate-100 dark:bg-slate-800 rounded-full" />
                            <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full" />
                         </div>
                         <div className="mt-auto flex items-center justify-between">
                            <div className="w-8 h-8 rounded-full bg-[#7C3AED] flex items-center justify-center"><CheckCircle2 size={16} className="text-white" /></div>
                            <div className="text-xl font-bold text-[#7C3AED]">₹</div>
                         </div>
                      </div>
                      <div className="absolute top-1/2 -translate-y-1/2 -right-4 w-12 h-12 bg-pink-500 rounded-xl shadow-xl flex items-center justify-center text-white"><ArrowUpRight size={24} /></div>
                   </div>
                </div>
                {/* Visual accents */}
                <div className="absolute -top-6 -left-6 w-32 h-32 bg-purple-200/30 rounded-full blur-2xl -z-10" />
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                {[
                  "Chartered Accountant (CA's)",
                  "Accountant",
                  "Tax Consultant",
                  "Financial Advisor",
                  "Chartered Accountant in Mumbai"
                ].map((category) => (
                  <button key={category} className="flex items-center justify-between p-5 border border-[#F0EAF0] dark:border-slate-800 rounded-2xl hover:border-[#7C3AED] hover:shadow-lg hover:shadow-purple-50 transition-all text-left group">
                    <span className="text-sm font-bold text-[#444] dark:text-slate-300 group-hover:text-[#7C3AED]">{category}</span>
                    <ChevronRight size={16} className="text-[#DDD] group-hover:text-[#7C3AED] transition-colors" />
                  </button>
                ))}
             </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 px-10 bg-slate-50 dark:bg-slate-900/30">
        <div className="max-w-6xl mx-auto space-y-16">
          <h2 className="text-4xl font-black text-center text-[#1A1A1A] dark:text-white tracking-tight">Testimonials</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
             {[
               { name: "Rajesh", role: "Founder, Radiosparx", text: "We were able to bring 2.5x more visitors to Radiosparx thanks to Refrens Profiles." },
               { name: "Himanshu", role: "Founder, Packaged Food", text: "We needed a consultant who can help us with some licenses. Refrens team worked hard to connect us with the right consultant." },
               { name: "Nayan", role: "Founder, Sugai Labs", text: "We needed a designer for a short term project. We got it through Refrens and the whole experience was pretty smooth." },
               { name: "Suresh", role: "Founder, Logistic Solution", text: "We needed a logo designer for our business on very short notice. Refrens helped us to arrange one and the logo was great too." },
               { name: "Ananya", role: "Business Owner", text: "If you're a business owner looking for a simple yet powerful accounting software solution to manage your finances, I wholeheartedly recommend Refrens." },
               { name: "Vikas", role: "Marketing Head", text: "Wanted website content meeting all SEO benchmarks and high readability score. The content delivered through Refrens met the expected standard." }
             ].map((t, i) => (
               <div key={i} className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-[#F0EAF0] dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow flex flex-col gap-6">
                  <p className="text-sm text-[#555] dark:text-slate-400 font-medium leading-relaxed italic">"{t.text}"</p>
                  <div className="flex items-center gap-4 mt-auto">
                     <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-[#7C3AED] uppercase text-xs">
                        {t.name.charAt(0)}
                     </div>
                     <div className="flex flex-col">
                        <span className="text-sm font-black tracking-tight">{t.name}</span>
                        <span className="text-[10px] font-bold text-[#AAA] tracking-widest uppercase">{t.role}</span>
                     </div>
                  </div>
               </div>
             ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-32 px-10">
        <div className="max-w-3xl mx-auto space-y-12">
          <h2 className="text-4xl font-black text-center text-[#1A1A1A] dark:text-white tracking-tight">Frequently Asked Questions (FAQ)</h2>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="border border-[#F0EAF0] dark:border-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-slate-900 shadow-sm">
                <button 
                  onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-6 text-left hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <span className="text-[15px] font-black text-[#333] dark:text-white tracking-tight">{faq.q}</span>
                  <div className={clsx(
                    "w-6 h-6 rounded-full border border-slate-200 dark:border-slate-700 flex items-center justify-center transition-all",
                    activeFaq === i ? "rotate-180 bg-slate-100 dark:bg-slate-800" : ""
                  )}>
                    <ChevronDown size={14} className="text-[#999]" />
                  </div>
                </button>
                {activeFaq === i && (
                  <div className="px-6 pb-6 animate-in slide-in-from-top-2 duration-300">
                    <p className="text-[14px] text-[#666] dark:text-slate-400 font-medium leading-relaxed">
                      {faq.a}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="pt-8 text-center">
             <button className="px-8 py-3 bg-[#D81159] hover:bg-[#B00E4A] text-white rounded-lg font-bold text-[12px] shadow-lg shadow-pink-200/50 transition-all active:scale-95 uppercase tracking-widest">
                Hire Experts
             </button>
          </div>
        </div>
      </section>

      {/* Footer Section */}
      <footer className="bg-white dark:bg-[#020617] pt-24 pb-12 px-10 border-t border-[#F0EAF0] dark:border-slate-800">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16">
          {/* Logo & Contact */}
          <div className="lg:col-span-4 space-y-8">
            <div className="text-[#7C3AED] font-black text-2xl tracking-tighter flex items-center gap-1">
              <div className="w-6 h-6 bg-[#7C3AED] transform rotate-45 flex items-center justify-center">
                <div className="w-3 h-3 bg-white transform -rotate-45" />
              </div>
              Refrens
            </div>
            
            <div className="flex gap-4">
               {[Facebook, Twitter, Linkedin, Instagram].map((Icon, i) => (
                  <button key={i} className="p-2 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-[#7C3AED] hover:border-[#7C3AED] transition-all">
                     <Icon size={18} />
                  </button>
               ))}
            </div>

            <div className="space-y-4">
               <p className="text-[11px] font-bold text-[#999] dark:text-slate-500 uppercase tracking-widest">Made with ☕ and ❤️ in Bengaluru.</p>
               <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm font-bold text-[#666] dark:text-slate-400">
                     <Phone size={16} className="text-[#7C3AED]" /> +91 91040 43038
                  </div>
                  <div className="flex items-center gap-3 text-sm font-bold text-[#666] dark:text-slate-400">
                     <Mail size={16} className="text-[#7C3AED]" /> care@refrens.com
                  </div>
               </div>
            </div>

            <div className="space-y-4">
               <p className="text-[11px] text-[#AAA] font-medium leading-relaxed">
                  Refrens Internet Pvt. Ltd. | All Rights Reserved
                  <br />
                  This site is protected by reCAPTCHA and the Google Privacy Policy and Terms of Service apply.
               </p>
               <div className="w-32 h-32 rounded-full border-4 border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center p-4 text-center">
                  <div className="text-[10px] font-black text-[#BBB] uppercase leading-tight">CERTIFIED</div>
                  <div className="text-xl font-black text-[#BBB]">ISO</div>
                  <div className="text-[10px] font-bold text-[#BBB] uppercase">27001:2022</div>
               </div>
            </div>
          </div>

          {/* Site Links */}
          <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-3 gap-12">
             <div className="space-y-6">
                <h4 className="text-[11px] font-black text-[#1A1A1A] dark:text-white uppercase tracking-[0.2em] border-b border-slate-100 dark:border-slate-800 pb-3">Company</h4>
                <ul className="space-y-3 text-[13px] font-semibold text-[#666] dark:text-slate-400">
                   {["About Us", "Contact Us", "We are Hiring", "Blog", "Help and Support"].map(link => (
                      <li key={link} className="hover:text-[#7C3AED] cursor-pointer transition-colors">{link}</li>
                   ))}
                </ul>
             </div>
             <div className="space-y-6">
                <h4 className="text-[11px] font-black text-[#1A1A1A] dark:text-white uppercase tracking-[0.2em] border-b border-slate-100 dark:border-slate-800 pb-3">Products</h4>
                <ul className="space-y-3 text-[13px] font-semibold text-[#666] dark:text-slate-400">
                   {[
                     "Cloud Accounting Software", "AI Accounting Agent", "GST Billing Software", 
                     "e-Invoicing Software", "Inventory Software", "Quotation Software", 
                     "Lead Management Software", "Sales CRM", "Expense Management Software"
                   ].map(link => (
                      <li key={link} className="hover:text-[#7C3AED] cursor-pointer transition-colors line-clamp-1">{link}</li>
                   ))}
                </ul>
             </div>
             <div className="space-y-6">
                <h4 className="text-[11px] font-black text-[#1A1A1A] dark:text-white uppercase tracking-[0.2em] border-b border-slate-100 dark:border-slate-800 pb-3">Templates</h4>
                <ul className="space-y-3 text-[13px] font-semibold text-[#666] dark:text-slate-400">
                   {[
                     "Invoice Templates", "GST Invoice Format", "Quotation Templates", 
                     "Proforma Invoice Templates", "Purchase Order Templates", "Tax Invoice Templates",
                     "Delivery Challan Format"
                   ].map(link => (
                      <li key={link} className="hover:text-[#7C3AED] cursor-pointer transition-colors line-clamp-1">{link}</li>
                   ))}
                </ul>
             </div>
          </div>
        </div>

        {/* Global Footer Bar */}
        <div className="mt-20 pt-10 border-t border-[#F0EAF0] dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-8">
           <div className="flex items-center gap-2 text-[11px] font-black text-[#999] uppercase tracking-widest">
              Refrens for CAs: <span className="text-[#D81159]">CA Elite</span> | <span className="text-[#D81159]">Become Refrens Distributor</span>
           </div>
           <div className="flex items-center gap-6 opacity-30 invert dark:invert-0">
              <div className="text-xl font-black italic tracking-tighter">VISA</div>
              <div className="text-xl font-bold tracking-tighter">mastercard</div>
              <div className="text-xl font-black tracking-tighter">UPI</div>
              <div className="text-[10px] font-bold uppercase tracking-widest border border-current px-2 py-0.5">Wallets</div>
           </div>
        </div>
      </footer>
    </div>
  );
}
