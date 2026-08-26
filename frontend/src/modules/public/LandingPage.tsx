import { useNavigate } from 'react-router-dom';
import { 
  Calendar, Bot, Mic, Users, Shield, FileText, 
  Activity, Stethoscope, ClipboardList, Bell,
  ArrowRight, CheckCircle2, Hospital, UserCog,
  Clock, Lock, ChevronRight
} from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b border-slate-100 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Hospital className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-lg text-slate-900">MediFlow AI</span>
            </div>
            <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
              <a href="#features" className="hover:text-blue-600 transition-colors">Features</a>
              <a href="#how-it-works" className="hover:text-blue-600 transition-colors">How It Works</a>
              <a href="#roles" className="hover:text-blue-600 transition-colors">Access Portals</a>
              <a href="#ai" className="hover:text-blue-600 transition-colors">AI Assistant</a>
            </div>
            <button onClick={() => navigate('/auth')} className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm">
              Login / Register
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-green-50"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-1.5 rounded-full text-sm font-medium mb-6">
              <Bot className="h-4 w-4" />
              AI-Powered Healthcare Platform
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 leading-tight tracking-tight">
              Smart Hospital<br />
              <span className="text-blue-600">Appointment & Documentation</span><br />
              System
            </h1>
            <p className="mt-6 text-lg text-slate-600 leading-relaxed max-w-2xl">
              Streamlining patient care from appointment booking to consultation with 
              AI-assisted pre-consultation, voice-based input, real-time queue management,
              and intelligent clinical documentation.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <button onClick={() => navigate('/auth')} className="bg-blue-600 text-white px-8 py-3.5 rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/25 flex items-center gap-2">
                Patient Login <ArrowRight className="h-4 w-4" />
              </button>
              <a href="#how-it-works" className="bg-white text-slate-700 px-8 py-3.5 rounded-xl text-sm font-bold hover:bg-slate-50 transition-all border border-slate-200 shadow-sm flex items-center gap-2">
                Explore How It Works <ChevronRight className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Key Features */}
      <section id="features" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold text-slate-900">Platform Capabilities</h2>
            <p className="mt-4 text-slate-500 max-w-2xl mx-auto">Every module is built to work end-to-end with real backend APIs and database operations.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: <Calendar className="h-6 w-6" />, title: "Smart Appointment Booking", desc: "Hospital → Department → Doctor → Slot → Appointment ID → Token", color: "blue" },
              { icon: <Bot className="h-6 w-6" />, title: "AI Pre-Consultation", desc: "Collects symptoms, asks follow-up questions, generates structured summary for the doctor", color: "purple" },
              { icon: <Mic className="h-6 w-6" />, title: "Voice-Based Input", desc: "Patient speaks into the browser microphone. Groq Whisper transcribes. AI processes.", color: "orange" },
              { icon: <Clock className="h-6 w-6" />, title: "Real-Time Token Queue", desc: "Daily token system per doctor. Live queue position. Auto-refreshing doctor dashboard.", color: "green" },
              { icon: <Stethoscope className="h-6 w-6" />, title: "Doctor Clinical Workspace", desc: "Patient context, pre-consultation summary, clinical notes, diagnosis, prescription.", color: "red" },
              { icon: <FileText className="h-6 w-6" />, title: "AI Documentation", desc: "Doctor notes → AI draft → Doctor review → Doctor approval → Final medical record.", color: "indigo" },
              { icon: <ClipboardList className="h-6 w-6" />, title: "Digital Medical Records", desc: "Consultations, prescriptions, and documents stored and retrievable per patient.", color: "teal" },
              { icon: <Bell className="h-6 w-6" />, title: "Notifications", desc: "Appointment confirmations, reminders, token updates, and prescription availability.", color: "amber" },
            ].map((f, i) => (
              <div key={i} className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md transition-shadow">
                <div className={`w-12 h-12 rounded-lg bg-${f.color}-100 text-${f.color}-600 flex items-center justify-center mb-4`}>
                  {f.icon}
                </div>
                <h3 className="font-bold text-slate-900 mb-2">{f.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold text-slate-900">How It Works</h2>
            <p className="mt-4 text-slate-500 max-w-2xl mx-auto">From appointment booking to final medical documentation — every step is connected.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {[
              { step: "1", title: "Book Appointment", desc: "Select hospital, department, doctor, date, and time slot.", icon: <Calendar className="h-8 w-8" /> },
              { step: "2", title: "Pre-Consultation", desc: "Answer AI questions via text or voice. AI creates a structured summary.", icon: <Bot className="h-8 w-8" /> },
              { step: "3", title: "Token & Queue", desc: "Receive your token number. Track your position in the doctor's queue.", icon: <Clock className="h-8 w-8" /> },
              { step: "4", title: "Doctor Consultation", desc: "Doctor reviews AI summary, examines patient, enters clinical notes.", icon: <Stethoscope className="h-8 w-8" /> },
              { step: "5", title: "Documentation", desc: "AI drafts documentation. Doctor reviews, edits, approves. Record saved.", icon: <FileText className="h-8 w-8" /> },
            ].map((s, i) => (
              <div key={i} className="text-center">
                <div className="mx-auto w-16 h-16 rounded-full bg-blue-600 text-white flex items-center justify-center mb-4 shadow-lg shadow-blue-600/20">
                  {s.icon}
                </div>
                <div className="text-xs font-bold text-blue-600 mb-1">STEP {s.step}</div>
                <h3 className="font-bold text-slate-900 mb-2">{s.title}</h3>
                <p className="text-sm text-slate-500">{s.desc}</p>
                {i < 4 && <div className="hidden md:block mt-4 text-slate-300 text-2xl">→</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Role-Based Access */}
      <section id="roles" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold text-slate-900">Role-Based Access Portals</h2>
            <p className="mt-4 text-slate-500 max-w-2xl mx-auto">Five distinct user categories, each with a dedicated workflow and dashboard.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: "Patient (Online)", desc: "Register with mobile + OTP. Book appointments, complete AI pre-consultation, view tokens, medical records, and prescriptions.", icon: <Users className="h-6 w-6" />, color: "blue" },
              { title: "Walk-in Patient", desc: "Visit the hospital directly. Receptionist registers and books the appointment. Same Appointment ID + Token architecture.", icon: <Hospital className="h-6 w-6" />, color: "green" },
              { title: "Receptionist", desc: "Search/register patients. Book appointments. Generate tokens. Manage check-ins. Handle the walk-in patient workflow.", icon: <ClipboardList className="h-6 w-6" />, color: "orange" },
              { title: "Doctor", desc: "View today's queue. Access patient context and AI pre-consultation summary. Enter consultation notes. Create prescriptions. Approve AI documentation.", icon: <Stethoscope className="h-6 w-6" />, color: "red" },
              { title: "Administrator", desc: "Manage users, doctors, departments. View real analytics. Access audit logs. Configure system settings.", icon: <UserCog className="h-6 w-6" />, color: "purple" },
            ].map((r, i) => (
              <div key={i} className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md transition-shadow">
                <div className={`w-12 h-12 rounded-lg bg-${r.color}-100 text-${r.color}-600 flex items-center justify-center mb-4`}>
                  {r.icon}
                </div>
                <h3 className="font-bold text-slate-900 text-lg mb-2">{r.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{r.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Section */}
      <section id="ai" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 px-4 py-1.5 rounded-full text-sm font-medium mb-6">
                <Bot className="h-4 w-4" />
                AI Assistant — Not a Replacement
              </div>
              <h2 className="text-3xl font-extrabold text-slate-900 mb-6">AI-Assisted Pre-Consultation & Documentation</h2>
              <p className="text-slate-600 leading-relaxed mb-8">
                Our AI system collects patient information through natural text and voice conversations, 
                asks relevant clinical follow-up questions, and creates a structured preliminary summary. 
                The doctor always remains the final clinical decision-maker.
              </p>
              <ul className="space-y-4">
                {[
                  "Collects symptoms, medical history, and current medications",
                  "Supports voice input via browser microphone (Groq Whisper)",
                  "Asks intelligent follow-up questions based on symptoms",
                  "Generates structured pre-consultation summary",
                  "Converts doctor notes into documentation drafts",
                  "Doctor reviews, edits, and approves before finalization",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-slate-700 text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-slate-50 rounded-2xl border border-slate-200 p-8">
              <h3 className="font-bold text-slate-900 mb-6 text-lg">AI Workflow</h3>
              <div className="space-y-4">
                {[
                  { label: "Patient Input", detail: "Text or voice symptoms" },
                  { label: "AI Analysis", detail: "Symptom organization + follow-up questions" },
                  { label: "AI Summary", detail: "Structured preliminary summary" },
                  { label: "Doctor Review", detail: "Doctor reads AI summary with patient context" },
                  { label: "Consultation", detail: "Doctor examines, diagnoses, prescribes" },
                  { label: "AI Documentation", detail: "AI drafts clinical documentation" },
                  { label: "Doctor Approval", detail: "Doctor reviews, edits, approves → Final Record" },
                ].map((step, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">{i+1}</div>
                    <div className="flex-1">
                      <span className="font-semibold text-slate-900 text-sm">{step.label}</span>
                      <span className="text-slate-500 text-sm ml-2">— {step.detail}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Appointment ID vs Token */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold text-slate-900">Appointment & Queue Architecture</h2>
            <p className="mt-4 text-slate-500 max-w-2xl mx-auto">Globally unique Appointment IDs linked to daily Token queue positions.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-white rounded-xl border border-slate-200 p-8">
              <h3 className="font-bold text-blue-600 text-lg mb-4">Appointment ID</h3>
              <p className="text-slate-600 text-sm mb-4">Globally unique. Connects all records for a single appointment.</p>
              <div className="bg-blue-50 rounded-lg p-4 font-mono text-sm text-blue-800 mb-4">APT-20260826-000482</div>
              <ul className="space-y-2 text-sm text-slate-600">
                <li className="flex gap-2"><ChevronRight className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" /> Pre-consultation</li>
                <li className="flex gap-2"><ChevronRight className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" /> AI Summary</li>
                <li className="flex gap-2"><ChevronRight className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" /> Consultation Notes</li>
                <li className="flex gap-2"><ChevronRight className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" /> Prescription</li>
                <li className="flex gap-2"><ChevronRight className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" /> Medical Documents</li>
              </ul>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-8">
              <h3 className="font-bold text-green-600 text-lg mb-4">Token (Queue Position)</h3>
              <p className="text-slate-600 text-sm mb-4">Daily queue number per doctor. Resets each day.</p>
              <div className="bg-green-50 rounded-lg p-4 font-mono text-sm text-green-800 mb-4">Token 17</div>
              <ul className="space-y-2 text-sm text-slate-600">
                <li className="flex gap-2"><ChevronRight className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" /> Belongs to Doctor + Date</li>
                <li className="flex gap-2"><ChevronRight className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" /> Restarts daily: 1, 2, 3...</li>
                <li className="flex gap-2"><ChevronRight className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" /> Maps to Appointment ID</li>
                <li className="flex gap-2"><ChevronRight className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" /> Real-time queue tracking</li>
                <li className="flex gap-2"><ChevronRight className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" /> Doctor dashboard display</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Security */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold text-slate-900">Enterprise-Grade Security</h2>
            <p className="mt-4 text-slate-500 max-w-2xl mx-auto">Medical data requires the highest level of protection.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: <Lock className="h-6 w-6" />, title: "JWT Authentication", desc: "Secure token-based authentication with Spring Security." },
              { icon: <Shield className="h-6 w-6" />, title: "Role-Based Access", desc: "PATIENT, RECEPTIONIST, DOCTOR, ADMIN roles enforced at backend." },
              { icon: <Activity className="h-6 w-6" />, title: "Audit Logging", desc: "Critical actions are logged: logins, appointments, consultations." },
              { icon: <FileText className="h-6 w-6" />, title: "Data Protection", desc: "HTTPS in deployment. Sensitive data validated and secured." },
            ].map((s, i) => (
              <div key={i} className="text-center p-6 bg-slate-50 rounded-xl border border-slate-200">
                <div className="w-12 h-12 rounded-lg bg-slate-200 text-slate-700 flex items-center justify-center mx-auto mb-4">
                  {s.icon}
                </div>
                <h3 className="font-bold text-slate-900 mb-2">{s.title}</h3>
                <p className="text-sm text-slate-500">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-extrabold text-white mb-4">Ready to Experience Smart Healthcare?</h2>
          <p className="text-blue-100 mb-8 text-lg">Register as a patient, or log in as a doctor, receptionist, or administrator.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <button onClick={() => navigate('/auth')} className="bg-white text-blue-600 px-8 py-3.5 rounded-xl text-sm font-bold hover:bg-blue-50 transition-all shadow-lg flex items-center gap-2">
              Get Started <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-blue-600 p-2 rounded-lg">
                  <Hospital className="h-5 w-5 text-white" />
                </div>
                <span className="font-bold text-lg text-white">MediFlow AI</span>
              </div>
              <p className="text-sm leading-relaxed">AI-Powered Hospital Appointment, Pre-Consultation & Documentation System.</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a></li>
                <li><a href="#ai" className="hover:text-white transition-colors">AI Assistant</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Access Portals</h4>
              <ul className="space-y-2 text-sm">
                <li><button onClick={() => navigate('/auth')} className="hover:text-white transition-colors">Patient Portal</button></li>
                <li><button onClick={() => navigate('/auth')} className="hover:text-white transition-colors">Doctor Portal</button></li>
                <li><button onClick={() => navigate('/auth')} className="hover:text-white transition-colors">Receptionist Portal</button></li>
                <li><button onClick={() => navigate('/auth')} className="hover:text-white transition-colors">Admin Portal</button></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Technology</h4>
              <ul className="space-y-2 text-sm">
                <li>React + TypeScript</li>
                <li>Spring Boot + Spring Security</li>
                <li>MySQL + JPA</li>
                <li>Groq Whisper AI</li>
                <li>JWT Authentication</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 mt-10 pt-8 text-center text-sm">
            <p>&copy; 2026 MediFlow AI — Smart Innovation Hackathon Project. Built with Java Spring Boot & React.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
