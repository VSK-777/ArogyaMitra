import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, Bot, FileText, Mic, 
  Stethoscope, ClipboardList, Bell,
  ArrowRight, Hospital, Menu, X, 
  CheckCircle2, ShieldCheck, FileCheck, Layers
} from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-blue-200">
      
      {/* 1. NAVIGATION BAR */}
      <nav className="fixed w-full z-50 bg-white border-b border-slate-200 shadow-sm py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo(0, 0)}>
              <div className="bg-blue-700 p-2 rounded-md flex items-center justify-center">
                <Hospital className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-xl tracking-tight text-slate-900">SIH Health</span>
            </div>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
              <a href="#platform" className="hover:text-blue-700 transition-colors">Platform</a>
              <a href="#ai-consultation" className="hover:text-blue-700 transition-colors">AI Diagnostics</a>
              <a href="#workflows" className="hover:text-blue-700 transition-colors">Workflows</a>
              <a href="#security" className="hover:text-blue-700 transition-colors">Security</a>
            </div>

            {/* CTA */}
            <div className="hidden md:flex items-center gap-4">
              <button onClick={() => navigate('/auth')} className="text-sm font-semibold text-slate-700 hover:text-blue-700 transition-colors">
                Sign In
              </button>
              <button onClick={() => navigate('/auth')} className="bg-blue-700 text-white px-5 py-2.5 rounded-md text-sm font-semibold hover:bg-blue-800 transition-colors shadow-sm">
                Get Started
              </button>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 text-slate-600 hover:bg-slate-100 rounded-md transition-colors">
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 w-full bg-white border-b border-slate-200 py-4 px-4 shadow-sm flex flex-col gap-4">
            <a href="#platform" onClick={() => setMobileMenuOpen(false)} className="text-base font-medium text-slate-700 p-2 hover:bg-slate-50 rounded-md">Platform</a>
            <a href="#ai-consultation" onClick={() => setMobileMenuOpen(false)} className="text-base font-medium text-slate-700 p-2 hover:bg-slate-50 rounded-md">AI Diagnostics</a>
            <a href="#workflows" onClick={() => setMobileMenuOpen(false)} className="text-base font-medium text-slate-700 p-2 hover:bg-slate-50 rounded-md">Workflows</a>
            <a href="#security" onClick={() => setMobileMenuOpen(false)} className="text-base font-medium text-slate-700 p-2 hover:bg-slate-50 rounded-md">Security</a>
            <hr className="border-slate-200" />
            <button onClick={() => navigate('/auth')} className="w-full text-left p-2 text-base font-bold text-slate-900">Sign In</button>
            <button onClick={() => navigate('/auth')} className="w-full bg-blue-700 text-white px-4 py-3 rounded-md text-base font-bold text-center">Get Started</button>
          </div>
        )}
      </nav>

      {/* 2. HERO SECTION */}
      <section className="pt-32 pb-20 lg:pt-40 lg:pb-32 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            
            {/* Left Column: Copy */}
            <div className="max-w-2xl">
              <h1 className="text-4xl lg:text-5xl font-bold text-slate-900 leading-tight tracking-tight mb-6">
                One platform for managing modern hospital operations.
              </h1>
              <p className="text-lg text-slate-600 leading-relaxed mb-8 max-w-lg">
                Appointments → Pre-consultations → Digital Records → Queue Management → Administration. A unified clinical workspace designed for healthcare professionals.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button onClick={() => navigate('/auth')} className="bg-blue-700 text-white px-8 py-3.5 rounded-md text-sm font-semibold hover:bg-blue-800 transition-colors shadow-sm flex items-center justify-center gap-2">
                  Access Platform <ArrowRight className="h-4 w-4" />
                </button>
                <a href="#platform" className="bg-white text-slate-700 border border-slate-300 px-8 py-3.5 rounded-md text-sm font-semibold hover:bg-slate-50 transition-colors flex items-center justify-center gap-2">
                  View Capabilities
                </a>
              </div>
            </div>
            
            {/* Right Column: Realistic Product UI Preview */}
            <div className="relative">
              <div className="bg-slate-100 rounded-lg border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[400px]">
                {/* Mock Browser/App Header */}
                <div className="bg-white border-b border-slate-200 p-3 flex items-center gap-4">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-slate-200"></div>
                    <div className="w-3 h-3 rounded-full bg-slate-200"></div>
                    <div className="w-3 h-3 rounded-full bg-slate-200"></div>
                  </div>
                  <div className="bg-slate-100 h-6 flex-1 rounded-md max-w-md mx-auto border border-slate-200"></div>
                </div>
                {/* Mock App Body */}
                <div className="flex flex-1 p-4 gap-4">
                  <div className="w-48 hidden sm:flex flex-col gap-2">
                    <div className="h-8 bg-slate-200 rounded-md w-full"></div>
                    <div className="h-8 bg-white border border-slate-200 rounded-md w-full"></div>
                    <div className="h-8 bg-white border border-slate-200 rounded-md w-full"></div>
                    <div className="h-8 bg-white border border-slate-200 rounded-md w-full"></div>
                  </div>
                  <div className="flex-1 flex flex-col gap-4">
                    <div className="h-10 w-1/3 bg-slate-200 rounded-md"></div>
                    <div className="bg-white border border-slate-200 rounded-md p-4 flex-1">
                      <div className="border-b border-slate-100 pb-3 mb-3 flex justify-between">
                         <div className="h-5 w-32 bg-slate-200 rounded"></div>
                         <div className="h-5 w-20 bg-emerald-100 rounded"></div>
                      </div>
                      <div className="space-y-2">
                        <div className="h-4 w-full bg-slate-50 rounded"></div>
                        <div className="h-4 w-5/6 bg-slate-50 rounded"></div>
                        <div className="h-4 w-4/6 bg-slate-50 rounded"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. PLATFORM CAPABILITIES */}
      <section id="platform" className="py-24 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight mb-4">Core Capabilities</h2>
            <p className="text-lg text-slate-600 max-w-2xl">Enterprise-grade modules designed for operational efficiency across all hospital departments.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            <div className="bg-white border border-slate-200 rounded-lg p-6">
              <Calendar className="h-6 w-6 text-blue-700 mb-4" />
              <h3 className="text-lg font-bold text-slate-900 mb-2">Smart Appointments</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Streamlined booking workflows with real-time availability, secure payment gateways, and automated confirmations.
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-lg p-6">
              <Bot className="h-6 w-6 text-blue-700 mb-4" />
              <h3 className="text-lg font-bold text-slate-900 mb-2">Clinical AI Assistant</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Pre-consultation data gathering that structures patient symptoms into actionable medical summaries for doctors.
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-lg p-6">
              <ClipboardList className="h-6 w-6 text-blue-700 mb-4" />
              <h3 className="text-lg font-bold text-slate-900 mb-2">Queue Management</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Live token tracking and automated waiting room displays to minimize patient congestion and optimize throughput.
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-lg p-6">
              <FileText className="h-6 w-6 text-blue-700 mb-4" />
              <h3 className="text-lg font-bold text-slate-900 mb-2">Electronic Health Records</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Secure, centralized storage for patient history, lab reports, and prescriptions with role-based access controls.
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-lg p-6">
              <Stethoscope className="h-6 w-6 text-blue-700 mb-4" />
              <h3 className="text-lg font-bold text-slate-900 mb-2">Doctor Workspace</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Dedicated consultation interfaces combining patient history, active symptoms, and digital prescription tools.
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-lg p-6">
              <Bell className="h-6 w-6 text-blue-700 mb-4" />
              <h3 className="text-lg font-bold text-slate-900 mb-2">Live Notifications</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Real-time updates for appointment status changes, queue progression, and critical system alerts.
              </p>
            </div>
            
          </div>
        </div>
      </section>

      {/* 4. AI PRE-CONSULTATION WORKFLOW */}
      <section id="ai-consultation" className="py-24 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 tracking-tight mb-6">AI-Structured Clinical Intake</h2>
              <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                Reduce consultation times by 30%. Our integrated AI assistant collects patient symptoms before they enter the room and formats them into a structured medical summary for the physician.
              </p>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="bg-slate-100 p-2 rounded border border-slate-200 mt-1"><Mic className="h-5 w-5 text-slate-700" /></div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-base">Patient Input</h4>
                    <p className="text-sm text-slate-600">Patients describe symptoms in natural language.</p>
                  </div>
                </div>
                <div className="w-0.5 h-6 bg-slate-200 ml-5 -my-4"></div>
                <div className="flex items-start gap-4">
                  <div className="bg-slate-100 p-2 rounded border border-slate-200 mt-1"><Layers className="h-5 w-5 text-slate-700" /></div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-base">AI Processing</h4>
                    <p className="text-sm text-slate-600">Medical NLP extracts symptoms, duration, and severity.</p>
                  </div>
                </div>
                <div className="w-0.5 h-6 bg-slate-200 ml-5 -my-4"></div>
                <div className="flex items-start gap-4">
                  <div className="bg-blue-50 p-2 rounded border border-blue-200 mt-1"><FileCheck className="h-5 w-5 text-blue-700" /></div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-base">Doctor Output</h4>
                    <p className="text-sm text-slate-600">Formatted clinical summary presented instantly in the EMR.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-slate-50 border border-slate-200 p-6 rounded-lg">
               <div className="bg-white border border-slate-200 rounded-md p-4 mb-4">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">AI Summary Output</span>
                  <div className="space-y-3">
                     <div className="bg-blue-50/50 p-2 rounded border border-blue-100 text-sm"><strong className="text-blue-900">Summary:</strong> Patient presents with acute lower back pain...</div>
                     <div className="bg-slate-50 p-2 rounded border border-slate-100 text-sm"><strong>Symptoms:</strong> Lumbar ache, restricted mobility</div>
                     <div className="bg-slate-50 p-2 rounded border border-slate-100 text-sm"><strong>Medications:</strong> Ibuprofen (OTC)</div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. ROLE BASED ACCESS */}
      <section id="workflows" className="py-24 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-16">
            <h2 className="text-3xl font-bold tracking-tight mb-4">Role-Based Architecture</h2>
            <p className="text-lg text-slate-400 max-w-2xl">Tailored interfaces that provide the exact tools required for each hospital function.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
              <h3 className="font-bold text-lg mb-4 text-slate-100">Patient Portal</h3>
              <ul className="space-y-3 text-sm text-slate-400">
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-slate-500" /> Book Appointments</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-slate-500" /> Pre-Consultation</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-slate-500" /> Live Token Status</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-slate-500" /> Medical Records</li>
              </ul>
            </div>
            
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
              <h3 className="font-bold text-lg mb-4 text-slate-100">Doctor Workspace</h3>
              <ul className="space-y-3 text-sm text-slate-400">
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-slate-500" /> Daily Schedule</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-slate-500" /> Patient History</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-slate-500" /> AI Summaries</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-slate-500" /> Prescriptions</li>
              </ul>
            </div>

            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
              <h3 className="font-bold text-lg mb-4 text-slate-100">Receptionist Desk</h3>
              <ul className="space-y-3 text-sm text-slate-400">
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-slate-500" /> Global Schedule</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-slate-500" /> Queue Management</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-slate-500" /> Patient Check-in</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-slate-500" /> Cancellations</li>
              </ul>
            </div>

            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
              <h3 className="font-bold text-lg mb-4 text-slate-100">Administrator Panel</h3>
              <ul className="space-y-3 text-sm text-slate-400">
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-slate-500" /> System Overview</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-slate-500" /> Staff Management</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-slate-500" /> Department Setup</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-slate-500" /> Audit Logs</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 6. SECURITY */}
      <section id="security" className="py-24 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
               <div className="bg-white border border-slate-200 p-8 rounded-lg">
                 <ShieldCheck className="h-10 w-10 text-slate-700 mb-6" />
                 <h3 className="text-xl font-bold text-slate-900 mb-4">Enterprise Security Architecture</h3>
                 <div className="space-y-4">
                    <div className="border-b border-slate-100 pb-3 text-sm">
                      <strong className="block text-slate-900 mb-1">Role-Based Access Control (RBAC)</strong>
                      <span className="text-slate-600">Strict permission boundaries ensuring staff only access authorized patient data.</span>
                    </div>
                    <div className="border-b border-slate-100 pb-3 text-sm">
                      <strong className="block text-slate-900 mb-1">Secure Authentication</strong>
                      <span className="text-slate-600">Stateless JWT tokens with rigorous session validation and expiration protocols.</span>
                    </div>
                    <div className="text-sm">
                      <strong className="block text-slate-900 mb-1">Protected Infrastructure</strong>
                      <span className="text-slate-600">PostgreSQL data persistence and isolated microservices for AI processing.</span>
                    </div>
                 </div>
               </div>
            </div>
            <div>
              <h2 className="text-3xl font-bold text-slate-900 tracking-tight mb-6">Designed for Compliance</h2>
              <p className="text-lg text-slate-600 mb-6 leading-relaxed">
                Hospital data requires the highest level of structural integrity. Our platform separates authentication, operational logic, and medical documentation into distinct, secure boundaries.
              </p>
              <button onClick={() => navigate('/auth')} className="text-blue-700 font-semibold text-sm hover:underline flex items-center gap-1">
                View Security Documentation <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 7. FOOTER */}
      <footer className="bg-white py-12 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <Hospital className="h-5 w-5 text-slate-400" />
              <span className="font-bold text-lg text-slate-900">SIH Health</span>
            </div>
            <div className="flex gap-6 text-sm text-slate-600">
              <a href="#platform" className="hover:text-slate-900 transition-colors">Platform</a>
              <a href="#security" className="hover:text-slate-900 transition-colors">Security</a>
              <button onClick={() => navigate('/auth')} className="hover:text-slate-900 transition-colors">Sign In</button>
            </div>
            <div className="text-sm text-slate-500">
              &copy; 2026 SIH Health Innovation.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}



