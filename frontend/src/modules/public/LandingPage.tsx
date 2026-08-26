import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, Bot, Mic, Users, Shield, FileText, 
  Stethoscope, ClipboardList, Bell,
  ArrowRight, CheckCircle2, Hospital, UserCog,
  Clock, Lock, Menu, X, Database, Server
} from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-blue-200">
      
      {/* 3. NAVIGATION BAR */}
      <nav className={`fixed w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-white/90 backdrop-blur-md shadow-sm border-b border-slate-200 py-3' : 'bg-transparent py-5'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => window.scrollTo(0, 0)}>
              <div className="bg-blue-600 p-2 rounded-lg flex items-center justify-center">
                <Hospital className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-xl tracking-tight text-slate-900">SIH Health</span>
            </div>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
              <a href="#how-it-works" className="hover:text-blue-600 transition-colors">How It Works</a>
              <a href="#features" className="hover:text-blue-600 transition-colors">Features</a>
              <a href="#ai-consultation" className="hover:text-blue-600 transition-colors">AI Pre-Consultation</a>
              <a href="#architecture" className="hover:text-blue-600 transition-colors">About</a>
            </div>

            {/* Auth Buttons */}
            <div className="hidden md:flex items-center gap-4">
              <button onClick={() => navigate('/auth')} className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors">
                Login
              </button>
              <button onClick={() => navigate('/auth')} className="bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm shadow-blue-600/20">
                Get Started
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button className="md:hidden text-slate-600" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-white pt-24 px-6 pb-6 flex flex-col gap-6 border-b border-slate-200 shadow-xl">
           <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className="text-lg font-medium text-slate-800 border-b border-slate-100 pb-4">How It Works</a>
           <a href="#features" onClick={() => setMobileMenuOpen(false)} className="text-lg font-medium text-slate-800 border-b border-slate-100 pb-4">Features</a>
           <a href="#ai-consultation" onClick={() => setMobileMenuOpen(false)} className="text-lg font-medium text-slate-800 border-b border-slate-100 pb-4">AI Pre-Consultation</a>
           <a href="#architecture" onClick={() => setMobileMenuOpen(false)} className="text-lg font-medium text-slate-800 border-b border-slate-100 pb-4">About</a>
           <button onClick={() => { setMobileMenuOpen(false); navigate('/auth'); }} className="mt-4 bg-blue-600 text-white px-6 py-3.5 rounded-xl text-base font-bold text-center shadow-lg shadow-blue-600/20">
             Login / Register
           </button>
        </div>
      )}

      {/* 2 & 4. HERO SECTION */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-white">
        {/* Subtle Background Elements */}
        <div className="absolute top-0 right-0 -mr-40 -mt-40 w-[800px] h-[800px] rounded-full bg-blue-50/50 blur-3xl opacity-70 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -ml-40 -mb-40 w-[600px] h-[600px] rounded-full bg-slate-50/80 blur-3xl opacity-70 pointer-events-none"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
            
            {/* Left Column: Copy */}
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide mb-6 border border-blue-100/50 shadow-sm">
                <Bot className="h-3.5 w-3.5" />
                AI-POWERED HEALTHCARE PLATFORM
              </div>
              <h1 className="text-5xl lg:text-6xl font-extrabold text-slate-900 leading-[1.1] tracking-tight mb-6">
                Smarter Hospital Care. <br/>
                <span className="text-blue-600">Simpler for Everyone.</span>
              </h1>
              <p className="text-lg text-slate-600 leading-relaxed mb-10 max-w-lg">
                A unified hospital platform for appointment booking, AI-assisted pre-consultation, token management, and secure medical documentation.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button onClick={() => navigate('/auth')} className="bg-blue-600 text-white px-8 py-4 rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 group">
                  Get Started <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </button>
                <a href="#how-it-works" className="bg-white text-slate-700 border border-slate-200 px-8 py-4 rounded-xl text-sm font-bold hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm flex items-center justify-center gap-2">
                  Explore How It Works
                </a>
              </div>
            </div>

            {/* Right Column: Visual Mockup */}
            <div className="relative lg:ml-10">
               {/* Main Dashboard Panel */}
               <div className="bg-white rounded-2xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] border border-slate-100 overflow-hidden transform -rotate-1 hover:rotate-0 transition-transform duration-500">
                  <div className="bg-slate-50 border-b border-slate-100 px-4 py-3 flex items-center gap-2">
                     <div className="flex gap-1.5">
                       <div className="w-3 h-3 rounded-full bg-red-400"></div>
                       <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                       <div className="w-3 h-3 rounded-full bg-green-400"></div>
                     </div>
                     <div className="mx-auto bg-white border border-slate-200 rounded-md px-24 py-1 text-[10px] text-slate-400 font-mono">sih-health.app/dashboard</div>
                  </div>
                  <div className="p-6 grid gap-4 bg-slate-50/50">
                     {/* Mockup Card 1: Token */}
                     <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                           <div className="bg-blue-100 text-blue-600 w-12 h-12 rounded-lg flex items-center justify-center font-bold text-xl">
                             17
                           </div>
                           <div>
                             <div className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">Your Token</div>
                             <div className="text-sm font-bold text-slate-900">Dr. Sarah Jenkins</div>
                           </div>
                        </div>
                        <div className="text-right">
                           <div className="text-xs text-slate-500 mb-0.5">Est. Wait</div>
                           <div className="text-sm font-bold text-emerald-600">12 min</div>
                        </div>
                     </div>

                     {/* Mockup Card 2: AI Pre-Consultation */}
                     <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                        <div className="bg-blue-600 px-4 py-3 text-white text-xs font-bold flex items-center gap-2">
                           <Bot className="h-4 w-4" /> Doctor AI Assistant
                        </div>
                        <div className="p-4 space-y-3">
                           <div className="flex gap-3">
                             <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0"><Bot className="h-3.5 w-3.5" /></div>
                             <div className="bg-slate-100 rounded-2xl rounded-tl-none p-3 text-xs text-slate-700">What brings you in today?</div>
                           </div>
                           <div className="flex gap-3 flex-row-reverse">
                             <div className="bg-blue-600 text-white rounded-2xl rounded-tr-none p-3 text-xs">I have sharp pain in my left leg.</div>
                           </div>
                           <div className="flex gap-3">
                             <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0"><Bot className="h-3.5 w-3.5" /></div>
                             <div className="bg-slate-100 rounded-2xl rounded-tl-none p-3 text-xs text-slate-700">How long have you had this pain?</div>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
               
               {/* Floating elements */}
               <div className="absolute -right-6 -bottom-6 bg-white p-4 rounded-xl shadow-xl border border-slate-100 hidden sm:flex items-center gap-3 z-20">
                  <div className="bg-green-100 text-green-600 p-2 rounded-lg"><CheckCircle2 className="h-5 w-5" /></div>
                  <div>
                    <div className="text-xs text-slate-500 font-medium">Appointment Confirmed</div>
                    <div className="text-sm font-bold text-slate-900">Today, 2:30 PM</div>
                  </div>
               </div>
            </div>

          </div>
        </div>
      </section>

      {/* 5. TRUST / VALUE STRIP */}
      <div className="bg-slate-900 py-8 border-y border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 divide-x divide-slate-800">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 px-4 text-center sm:text-left">
              <Bot className="h-5 w-5 text-blue-400 mb-1 sm:mb-0" />
              <span className="text-slate-300 text-sm font-medium">AI-Assisted Care</span>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 px-4 text-center sm:text-left">
              <Shield className="h-5 w-5 text-emerald-400 mb-1 sm:mb-0" />
              <span className="text-slate-300 text-sm font-medium">Secure Records</span>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 px-4 text-center sm:text-left">
              <Clock className="h-5 w-5 text-amber-400 mb-1 sm:mb-0" />
              <span className="text-slate-300 text-sm font-medium">Real-Time Queue</span>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 px-4 text-center sm:text-left">
              <Calendar className="h-5 w-5 text-purple-400 mb-1 sm:mb-0" />
              <span className="text-slate-300 text-sm font-medium">Smart Appointments</span>
            </div>
          </div>
        </div>
      </div>

      {/* 6. PLATFORM FEATURES */}
      <section id="features" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-base text-blue-600 font-bold tracking-wide uppercase mb-3">Core Modules</h2>
            <h3 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-6">Everything Your Hospital Needs</h3>
            <p className="text-lg text-slate-600">A unified suite of tools designed to reduce wait times, organize clinical information, and streamline the hospital experience.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
             {/* Feature 1 */}
             <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm hover:shadow-md transition-shadow group">
               <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                 <Calendar className="h-6 w-6" />
               </div>
               <div className="text-xs font-bold text-slate-400 mb-2 font-mono">01</div>
               <h4 className="text-xl font-bold text-slate-900 mb-3">Smart Appointments</h4>
               <p className="text-slate-600 text-sm leading-relaxed mb-6">Book and manage appointments with real-time availability. Avoid double bookings and seamlessly map to daily tokens.</p>
               <div className="h-1 w-12 bg-slate-100 rounded-full"></div>
             </div>

             {/* Feature 2 */}
             <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm hover:shadow-md transition-shadow group">
               <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600 mb-6 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                 <Bot className="h-6 w-6" />
               </div>
               <div className="text-xs font-bold text-slate-400 mb-2 font-mono">02</div>
               <h4 className="text-xl font-bold text-slate-900 mb-3">AI Pre-Consultation</h4>
               <p className="text-slate-600 text-sm leading-relaxed mb-6">Collect symptoms and relevant patient information via AI before the consultation even begins, saving doctor time.</p>
               <div className="h-1 w-12 bg-slate-100 rounded-full"></div>
             </div>

             {/* Feature 3 */}
             <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm hover:shadow-md transition-shadow group">
               <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center text-green-600 mb-6 group-hover:bg-green-600 group-hover:text-white transition-colors">
                 <Clock className="h-6 w-6" />
               </div>
               <div className="text-xs font-bold text-slate-400 mb-2 font-mono">03</div>
               <h4 className="text-xl font-bold text-slate-900 mb-3">Token & Queue</h4>
               <p className="text-slate-600 text-sm leading-relaxed mb-6">Generate daily tokens and provide real-time queue visibility for patients, reducing physical waiting room congestion.</p>
               <div className="h-1 w-12 bg-slate-100 rounded-full"></div>
             </div>

             {/* Feature 4 */}
             <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm hover:shadow-md transition-shadow group">
               <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 mb-6 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                 <FileText className="h-6 w-6" />
               </div>
               <div className="text-xs font-bold text-slate-400 mb-2 font-mono">04</div>
               <h4 className="text-xl font-bold text-slate-900 mb-3">Medical Documents</h4>
               <p className="text-slate-600 text-sm leading-relaxed mb-6">Securely manage reports, prescriptions, and medical histories with robust access control for authorized personnel only.</p>
               <div className="h-1 w-12 bg-slate-100 rounded-full"></div>
             </div>

             {/* Feature 5 */}
             <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm hover:shadow-md transition-shadow group">
               <div className="w-12 h-12 bg-rose-50 rounded-xl flex items-center justify-center text-rose-600 mb-6 group-hover:bg-rose-600 group-hover:text-white transition-colors">
                 <Stethoscope className="h-6 w-6" />
               </div>
               <div className="text-xs font-bold text-slate-400 mb-2 font-mono">05</div>
               <h4 className="text-xl font-bold text-slate-900 mb-3">Doctor Workspace</h4>
               <p className="text-slate-600 text-sm leading-relaxed mb-6">Give doctors instant access to patient history, AI summaries, and intuitive tools for recording diagnoses.</p>
               <div className="h-1 w-12 bg-slate-100 rounded-full"></div>
             </div>

             {/* Feature 6 */}
             <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm hover:shadow-md transition-shadow group">
               <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600 mb-6 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                 <Bell className="h-6 w-6" />
               </div>
               <div className="text-xs font-bold text-slate-400 mb-2 font-mono">06</div>
               <h4 className="text-xl font-bold text-slate-900 mb-3">Live Notifications</h4>
               <p className="text-slate-600 text-sm leading-relaxed mb-6">Keep patients and hospital staff aligned with immediate status updates on appointments, prescriptions, and queues.</p>
               <div className="h-1 w-12 bg-slate-100 rounded-full"></div>
             </div>
          </div>
        </div>
      </section>

      {/* 7. AI PRE-CONSULTATION */}
      <section id="ai-consultation" className="py-24 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <div className="grid lg:grid-cols-2 gap-16 items-center">
             
             <div className="order-2 lg:order-1">
               <div className="inline-flex items-center gap-2 text-blue-600 font-bold text-sm tracking-wide uppercase mb-4">
                 <Bot className="h-5 w-5" /> Signature Feature
               </div>
               <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-6">AI-Assisted Pre-Consultation</h2>
               <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                 Patients can answer guided, medically-safe questions before meeting the doctor. 
                 The AI collects symptoms, asks context-aware follow-ups, and organizes relevant information to significantly reduce consultation time.
               </p>
               
               <ul className="space-y-4 mb-10">
                 {[
                   "Accurate symptom collection & history",
                   "Dynamic, context-aware follow-up questions",
                   "Voice input support via microphone",
                   "Auto-generated structured summary for doctors"
                 ].map((item, i) => (
                   <li key={i} className="flex items-center gap-3 text-slate-700 font-medium">
                     <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" /> {item}
                   </li>
                 ))}
               </ul>

               <button onClick={() => navigate('/auth')} className="bg-slate-900 text-white px-8 py-3.5 rounded-xl text-sm font-bold hover:bg-slate-800 transition-colors shadow-md">
                 Experience it as a Patient
               </button>
             </div>

             {/* UI Mockup */}
             <div className="relative order-1 lg:order-2">
                <div className="absolute inset-0 bg-blue-50 rounded-[2rem] transform translate-x-4 translate-y-4"></div>
                <div className="relative bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden flex flex-col h-[500px]">
                   <div className="bg-blue-600 px-6 py-4 flex items-center justify-between">
                     <div className="flex items-center gap-3">
                       <div className="bg-white/20 p-2 rounded-lg"><Bot className="h-5 w-5 text-white" /></div>
                       <div className="text-white font-bold">AI Medical Assistant</div>
                     </div>
                   </div>
                   
                   <div className="flex-1 p-6 overflow-y-auto bg-slate-50 space-y-6">
                     
                     <div className="flex gap-4">
                       <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                         <Bot className="h-4 w-4 text-blue-600" />
                       </div>
                       <div className="bg-white border border-slate-200 p-4 rounded-2xl rounded-tl-none shadow-sm text-sm text-slate-700 max-w-[80%]">
                         What brings you in today?
                       </div>
                     </div>

                     <div className="flex gap-4 flex-row-reverse">
                       <div className="bg-blue-600 text-white p-4 rounded-2xl rounded-tr-none shadow-sm text-sm max-w-[80%]">
                         I have pain in both feet.
                       </div>
                     </div>

                     <div className="flex gap-4">
                       <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                         <Bot className="h-4 w-4 text-blue-600" />
                       </div>
                       <div className="bg-white border border-slate-200 p-4 rounded-2xl rounded-tl-none shadow-sm text-sm text-slate-700 max-w-[80%]">
                         How long have you experienced the pain?
                       </div>
                     </div>

                     <div className="flex gap-4 flex-row-reverse">
                       <div className="bg-blue-600 text-white p-4 rounded-2xl rounded-tr-none shadow-sm text-sm max-w-[80%]">
                         About one week.
                       </div>
                     </div>
                     
                     <div className="flex gap-4">
                       <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                         <Bot className="h-4 w-4 text-blue-600" />
                       </div>
                       <div className="bg-white border border-slate-200 p-4 rounded-2xl rounded-tl-none shadow-sm text-sm text-slate-700 max-w-[80%]">
                         How severe is the pain from 1 to 10?
                       </div>
                     </div>

                   </div>

                   <div className="p-4 bg-white border-t border-slate-200">
                     <div className="flex items-center gap-3">
                       <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 shrink-0">
                         <Mic className="h-5 w-5" />
                       </div>
                       <div className="flex-1 bg-slate-100 rounded-full px-4 py-2.5 text-sm text-slate-400">
                         Type your answer...
                       </div>
                       <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white shrink-0">
                         <ArrowRight className="h-5 w-5" />
                       </div>
                     </div>
                   </div>
                </div>
             </div>
           </div>
        </div>
      </section>

      {/* 9. HOW IT WORKS (Timeline) */}
      <section id="how-it-works" className="py-24 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-20">
             <h2 className="text-3xl md:text-4xl font-extrabold mb-6">A Seamless Connected Workflow</h2>
             <p className="text-slate-400 text-lg">Every step is designed to optimize time and information flow.</p>
          </div>
          
          <div className="relative">
             <div className="hidden lg:block absolute top-12 left-0 w-full h-0.5 bg-slate-800 z-0"></div>
             
             <div className="grid lg:grid-cols-5 gap-8 lg:gap-4 relative z-10">
               {[
                 { num: "01", title: "Book Appointment", desc: "Select your preferred doctor and secure a slot." },
                 { num: "02", title: "AI Pre-Consultation", desc: "Answer quick AI questions to prepare your history." },
                 { num: "03", title: "Receive Token", desc: "Get a daily token and view live queue times." },
                 { num: "04", title: "Doctor Consultation", desc: "Doctor reviews your organized data efficiently." },
                 { num: "05", title: "Digital Docs", desc: "Access prescriptions and reports instantly." },
               ].map((step, i) => (
                 <div key={i} className="text-center">
                    <div className="w-16 h-16 bg-slate-900 border-4 border-slate-800 rounded-full flex items-center justify-center font-bold text-lg mx-auto mb-6 text-slate-300">
                      {step.num}
                    </div>
                    <h4 className="font-bold mb-3 text-lg">{step.title}</h4>
                    <p className="text-sm text-slate-400 px-2">{step.desc}</p>
                 </div>
               ))}
             </div>
          </div>
        </div>
      </section>

      {/* 10. TOKEN / QUEUE VISUALIZATION */}
      <section className="py-24 bg-slate-50 border-b border-slate-200 overflow-hidden">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
               
               <div className="order-2 lg:order-1 relative">
                  <div className="absolute inset-0 bg-blue-100 rounded-full blur-3xl opacity-50 transform -translate-x-1/4 -translate-y-1/4"></div>
                  <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-200 max-w-sm mx-auto w-full relative z-10">
                     <div className="absolute top-0 right-8 -translate-y-1/2 bg-blue-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md uppercase tracking-wide flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span> Live Update
                     </div>
                     <div className="text-center mb-8 pt-4">
                       <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Your Token</h3>
                       <div className="text-6xl font-black text-slate-900 tracking-tight">A-027</div>
                       <div className="text-slate-500 mt-3 font-medium">Dr. Robert Chen</div>
                     </div>
                     
                     <div className="space-y-4">
                        <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 flex justify-between items-center">
                           <span className="text-blue-800 font-bold text-sm">Currently Serving</span>
                           <span className="text-2xl font-black text-blue-700">A-023</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                           <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 text-center">
                              <div className="text-slate-500 text-xs font-bold uppercase mb-1">Patients Ahead</div>
                              <div className="text-2xl font-bold text-slate-900">3</div>
                           </div>
                           <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 text-center">
                              <div className="text-emerald-700 text-xs font-bold uppercase mb-1">Estimated Wait</div>
                              <div className="text-2xl font-bold text-emerald-700">12 min</div>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>

               <div className="order-1 lg:order-2">
                  <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-6">Know Your Place in the Queue</h2>
                  <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                    Say goodbye to crowded waiting rooms. Our dynamic token management system gives patients real-time visibility into their queue position and estimated wait times right from their phone.
                  </p>
                  <ul className="space-y-4">
                     <li className="flex items-start gap-3 text-slate-700">
                        <CheckCircle2 className="h-6 w-6 text-blue-600 shrink-0" />
                        <span><strong className="text-slate-900 block">Auto-generated tokens</strong> Unique tokens mapped cleanly to each appointment slot.</span>
                     </li>
                     <li className="flex items-start gap-3 text-slate-700">
                        <CheckCircle2 className="h-6 w-6 text-blue-600 shrink-0" />
                        <span><strong className="text-slate-900 block">Live synchronization</strong> Real-time updates as the doctor or receptionist manages the queue.</span>
                     </li>
                     <li className="flex items-start gap-3 text-slate-700">
                        <CheckCircle2 className="h-6 w-6 text-blue-600 shrink-0" />
                        <span><strong className="text-slate-900 block">Daily resets</strong> Tokens automatically restart every single day for clean scheduling.</span>
                     </li>
                  </ul>
               </div>
            </div>
         </div>
      </section>

      {/* 11. MEDICAL DOCUMENTATION */}
      <section className="py-24 bg-white relative overflow-hidden">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center max-w-3xl mx-auto mb-16">
               <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-6">Your Medical Information, Organized.</h2>
               <p className="text-lg text-slate-600">Access prescriptions, consultation summaries, and lab reports securely via our unified documentation interface.</p>
            </div>
            
            <div className="max-w-4xl mx-auto bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden shadow-xl shadow-slate-200/50">
               <div className="bg-white border-b border-slate-200 px-2 sm:px-6 py-4 flex gap-4 sm:gap-8 overflow-x-auto hide-scrollbar">
                  <div className="font-bold text-blue-600 border-b-2 border-blue-600 pb-4 -mb-4 whitespace-nowrap">Consultation Summary</div>
                  <div className="font-medium text-slate-500 hover:text-slate-700 cursor-pointer whitespace-nowrap">Prescription</div>
                  <div className="font-medium text-slate-500 hover:text-slate-700 cursor-pointer whitespace-nowrap">Lab Report</div>
                  <div className="font-medium text-slate-500 hover:text-slate-700 cursor-pointer whitespace-nowrap">Medical History</div>
               </div>
               <div className="p-4 sm:p-8">
                  <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8">
                     <div className="flex justify-between items-start mb-6 pb-6 border-b border-slate-100">
                        <div>
                           <h3 className="font-bold text-xl text-slate-900 mb-1">Consultation Summary</h3>
                           <div className="text-sm text-slate-500">August 26, 2026 • Dr. Sarah Jenkins</div>
                        </div>
                        <div className="bg-blue-50 text-blue-600 px-3 py-1 rounded-md text-xs font-bold">PDF</div>
                     </div>
                     <div className="space-y-6">
                        <div>
                           <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Chief Complaint</div>
                           <div className="text-slate-800 font-medium">Sharp pain in left leg, duration of one week. Pain level 7/10.</div>
                        </div>
                        <div>
                           <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Diagnosis</div>
                           <div className="text-slate-800 font-medium">Mild muscle strain. No signs of deep vein thrombosis.</div>
                        </div>
                        <div>
                           <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Treatment Plan</div>
                           <ul className="list-disc pl-5 text-slate-800 font-medium space-y-1">
                             <li>Rest and elevate leg when possible.</li>
                             <li>Apply ice pack for 15 minutes twice daily.</li>
                             <li>Ibuprofen 400mg as needed for pain.</li>
                           </ul>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </section>

      {/* 8. ROLE-BASED EXPERIENCE */}
      <section id="roles" className="py-24 bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-6">One Platform. Every Role.</h2>
            <p className="text-lg text-slate-600">Secure, role-based dashboards tailored exactly to what each user needs.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
             {/* Patient */}
             <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm hover:border-blue-200 transition-colors">
               <div className="flex items-center gap-3 mb-6">
                 <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center shrink-0">
                   <Users className="h-6 w-6" />
                 </div>
                 <h4 className="font-bold text-lg text-slate-900">Patient</h4>
               </div>
               <ul className="text-sm text-slate-600 space-y-3">
                 <li className="flex items-center gap-3"><CheckCircle2 className="h-4 w-4 text-blue-500 shrink-0" /> Book appointments</li>
                 <li className="flex items-center gap-3"><CheckCircle2 className="h-4 w-4 text-blue-500 shrink-0" /> Complete AI pre-consultation</li>
                 <li className="flex items-center gap-3"><CheckCircle2 className="h-4 w-4 text-blue-500 shrink-0" /> Track tokens</li>
                 <li className="flex items-center gap-3"><CheckCircle2 className="h-4 w-4 text-blue-500 shrink-0" /> Access medical documents</li>
               </ul>
             </div>

             {/* Doctor */}
             <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm hover:border-emerald-200 transition-colors">
               <div className="flex items-center gap-3 mb-6">
                 <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center shrink-0">
                   <Stethoscope className="h-6 w-6" />
                 </div>
                 <h4 className="font-bold text-lg text-slate-900">Doctor</h4>
               </div>
               <ul className="text-sm text-slate-600 space-y-3">
                 <li className="flex items-center gap-3"><CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" /> View real-time queue</li>
                 <li className="flex items-center gap-3"><CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" /> Review patient history</li>
                 <li className="flex items-center gap-3"><CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" /> Review pre-consultation</li>
                 <li className="flex items-center gap-3"><CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" /> Record consultation</li>
               </ul>
             </div>

             {/* Receptionist */}
             <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm hover:border-amber-200 transition-colors">
               <div className="flex items-center gap-3 mb-6">
                 <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center shrink-0">
                   <ClipboardList className="h-6 w-6" />
                 </div>
                 <h4 className="font-bold text-lg text-slate-900">Receptionist</h4>
               </div>
               <ul className="text-sm text-slate-600 space-y-3">
                 <li className="flex items-center gap-3"><CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0" /> Register patients</li>
                 <li className="flex items-center gap-3"><CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0" /> Book appointments</li>
                 <li className="flex items-center gap-3"><CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0" /> Generate tokens</li>
                 <li className="flex items-center gap-3"><CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0" /> Manage check-in</li>
               </ul>
             </div>

             {/* Admin */}
             <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm hover:border-purple-200 transition-colors">
               <div className="flex items-center gap-3 mb-6">
                 <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center shrink-0">
                   <UserCog className="h-6 w-6" />
                 </div>
                 <h4 className="font-bold text-lg text-slate-900">Administrator</h4>
               </div>
               <ul className="text-sm text-slate-600 space-y-3">
                 <li className="flex items-center gap-3"><CheckCircle2 className="h-4 w-4 text-purple-500 shrink-0" /> Manage users</li>
                 <li className="flex items-center gap-3"><CheckCircle2 className="h-4 w-4 text-purple-500 shrink-0" /> Manage doctors</li>
                 <li className="flex items-center gap-3"><CheckCircle2 className="h-4 w-4 text-purple-500 shrink-0" /> Manage departments</li>
                 <li className="flex items-center gap-3"><CheckCircle2 className="h-4 w-4 text-purple-500 shrink-0" /> View analytics</li>
               </ul>
             </div>
          </div>
        </div>
      </section>

      {/* 12. SECURITY & 13. ARCHITECTURE COMPACT SECTION */}
      <section className="py-24 bg-slate-900 text-white border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <div className="grid lg:grid-cols-2 gap-16 items-center">
              {/* Security */}
              <div>
                <h3 className="text-3xl font-extrabold mb-8 flex items-center gap-3">
                  <Shield className="h-8 w-8 text-emerald-400" /> Secure by Design
                </h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  {[
                    "JWT Authentication", "Role-Based Access Control", 
                    "Encrypted Communication", "Audit Logging", 
                    "Protected Medical Documents"
                  ].map((s, i) => (
                    <div key={i} className="bg-slate-800/80 p-4 rounded-xl text-sm font-medium text-slate-200 flex items-center gap-3 border border-slate-700 hover:border-slate-600 transition-colors">
                      <Lock className="h-4 w-4 text-emerald-400 shrink-0" /> {s}
                    </div>
                  ))}
                </div>
              </div>

              {/* Architecture Preview */}
              <div>
                <h3 className="text-3xl font-extrabold mb-8 flex items-center gap-3">
                  <Server className="h-8 w-8 text-blue-400" /> Built for Modern Hospitals
                </h3>
                <div className="bg-slate-800/80 rounded-2xl p-8 border border-slate-700">
                  <div className="flex flex-col items-center">
                    <div className="flex gap-4 w-full justify-center text-sm font-bold text-slate-300 mb-4">
                       Patients / Doctors / Receptionists / Admin
                    </div>
                    <div className="text-slate-500 mb-4 font-black text-lg">↓</div>
                    <div className="bg-blue-600 px-6 py-3 rounded-xl text-sm font-bold w-full text-center mb-4 shadow-lg">React Frontend</div>
                    <div className="text-slate-500 mb-4 font-black text-lg">↓</div>
                    <div className="bg-emerald-600 px-6 py-3 rounded-xl text-sm font-bold w-full text-center mb-8 shadow-lg">REST API / Spring Boot</div>
                    
                    <div className="w-full flex justify-between px-8 mb-4 relative">
                       <div className="absolute top-0 left-8 right-8 h-px bg-slate-700"></div>
                       <div className="w-px h-6 bg-slate-700"></div>
                       <div className="w-px h-6 bg-slate-700"></div>
                       <div className="w-px h-6 bg-slate-700"></div>
                    </div>
                    
                    <div className="flex gap-4 w-full">
                       <div className="bg-slate-700 px-3 py-4 rounded-xl text-xs font-bold text-center flex-1 border border-slate-600 flex flex-col items-center gap-2">
                         <Database className="h-4 w-4 text-slate-400" /> Database
                       </div>
                       <div className="bg-slate-700 px-3 py-4 rounded-xl text-xs font-bold text-center flex-1 border border-slate-600 flex flex-col items-center gap-2">
                         <Bot className="h-4 w-4 text-slate-400" /> Gemini AI
                       </div>
                       <div className="bg-slate-700 px-3 py-4 rounded-xl text-xs font-bold text-center flex-1 border border-slate-600 flex flex-col items-center gap-2">
                         <FileText className="h-4 w-4 text-slate-400" /> Storage
                       </div>
                    </div>
                  </div>
                </div>
              </div>
           </div>
        </div>
      </section>

      {/* 14. FINAL CTA */}
      <section className="py-24 bg-white relative overflow-hidden border-b border-slate-200">
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
          <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 mb-6 tracking-tight">Ready to Experience Smarter Healthcare?</h2>
          <p className="text-slate-600 mb-10 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            Book an appointment, complete your pre-consultation and experience a connected hospital workflow.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button onClick={() => navigate('/auth')} className="bg-blue-600 text-white px-10 py-4 rounded-xl text-base font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20">
              Get Started
            </button>
            <button onClick={() => navigate('/auth')} className="bg-slate-100 text-slate-900 px-10 py-4 rounded-xl text-base font-bold hover:bg-slate-200 transition-all border border-slate-200">
              Login
            </button>
          </div>
        </div>
      </section>

      {/* 15. FOOTER */}
      <footer className="bg-slate-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8">
            
            {/* Branding */}
            <div className="md:col-span-1">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="bg-blue-600 p-2 rounded-lg">
                  <Hospital className="h-5 w-5 text-white" />
                </div>
                <span className="font-bold text-xl tracking-tight text-slate-900">SIH Health</span>
              </div>
              <p className="text-sm text-slate-500 leading-relaxed">
                A modern hospital management system prioritizing AI-assisted patient care, efficient queueing, and secure clinical documentation.
              </p>
            </div>
            
            {/* Platform */}
            <div>
              <h4 className="font-bold text-slate-900 mb-4 text-sm">Platform</h4>
              <ul className="space-y-3 text-sm text-slate-600">
                <li><a href="#how-it-works" className="hover:text-blue-600 transition-colors">Appointments</a></li>
                <li><a href="#ai-consultation" className="hover:text-blue-600 transition-colors">AI Pre-Consultation</a></li>
                <li><a href="#features" className="hover:text-blue-600 transition-colors">Token Management</a></li>
                <li><a href="#features" className="hover:text-blue-600 transition-colors">Medical Documents</a></li>
              </ul>
            </div>
            
            {/* Users */}
            <div>
              <h4 className="font-bold text-slate-900 mb-4 text-sm">For Users</h4>
              <ul className="space-y-3 text-sm text-slate-600">
                <li><button onClick={() => navigate('/auth')} className="hover:text-blue-600 transition-colors">Patient Portal</button></li>
                <li><button onClick={() => navigate('/auth')} className="hover:text-blue-600 transition-colors">Doctor Portal</button></li>
                <li><button onClick={() => navigate('/auth')} className="hover:text-blue-600 transition-colors">Receptionist Portal</button></li>
                <li><button onClick={() => navigate('/auth')} className="hover:text-blue-600 transition-colors">Administrator</button></li>
              </ul>
            </div>
            
            {/* Resources */}
            <div>
              <h4 className="font-bold text-slate-900 mb-4 text-sm">Resources</h4>
              <ul className="space-y-3 text-sm text-slate-600">
                <li><a href="#how-it-works" className="hover:text-blue-600 transition-colors">How It Works</a></li>
                <li><a href="#architecture" className="hover:text-blue-600 transition-colors">System Architecture</a></li>
                <li><a href="#features" className="hover:text-blue-600 transition-colors">About</a></li>
              </ul>
            </div>

          </div>
          
          <div className="border-t border-slate-200 mt-16 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-500">
            <p>&copy; 2026 SIH Health Innovation. Built for the modern hospital.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
