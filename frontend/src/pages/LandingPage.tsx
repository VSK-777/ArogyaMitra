import { ArrowRight, Calendar, UserCheck, Stethoscope, Clock, FileText, Brain, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 via-white to-blue-50 py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-block mb-4 px-3 py-1 rounded-full bg-blue-100 text-blue-700 font-medium text-sm border border-blue-200">
            Smart India Hackathon Project
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight mb-6">
            AI-Powered Hospital Appointment & <br className="hidden md:block" />
            <span className="text-blue-600">Medical Documentation</span>
          </h1>
          <p className="mt-4 max-w-2xl text-lg md:text-xl text-slate-600 mx-auto mb-10">
            Streamlining patient journeys from authentication and booking to AI-assisted pre-consultation and structured doctor documentation.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Link to="/api-testing" className="px-8 py-3.5 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 shadow-md transition-all flex items-center w-full sm:w-auto justify-center">
              Explore API Console
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <a href="#features" className="px-8 py-3.5 border border-slate-300 text-base font-medium rounded-lg text-slate-700 bg-white hover:bg-slate-50 transition-all w-full sm:w-auto justify-center flex">
              View Features
            </a>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 bg-white" id="about">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-slate-900 mb-6">About the Project</h2>
          <p className="text-lg text-slate-600 leading-relaxed">
            This project is a Smart India Hackathon-oriented hospital management platform designed to improve the patient and doctor consultation workflow. We focus on digital appointment management, intelligent pre-consultation using conversational AI, automated summarization, and structured medical documentation to reduce administrative burden on healthcare professionals.
          </p>
        </div>
      </section>

      {/* Workflow Section */}
      <section className="py-20 bg-slate-50 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-slate-900 mb-12 text-center">The Patient Journey</h2>
          <div className="flex flex-col md:flex-row items-center justify-center space-y-8 md:space-y-0 md:space-x-4 lg:space-x-8">
            {[
              { title: "Authentication", icon: <UserCheck className="h-6 w-6 text-blue-600" /> },
              { title: "Booking", icon: <Calendar className="h-6 w-6 text-blue-600" /> },
              { title: "Token", icon: <Clock className="h-6 w-6 text-blue-600" /> },
              { title: "Pre-consult", icon: <Brain className="h-6 w-6 text-blue-600" /> },
              { title: "Consultation", icon: <Stethoscope className="h-6 w-6 text-blue-600" /> },
              { title: "Records", icon: <FileText className="h-6 w-6 text-blue-600" /> }
            ].map((step, index, arr) => (
              <div key={index} className="flex flex-col items-center md:flex-row">
                <div className="flex flex-col items-center">
                  <div className="h-16 w-16 bg-white rounded-full flex items-center justify-center shadow-md border border-slate-100 mb-3 z-10 relative">
                    {step.icon}
                  </div>
                  <span className="font-medium text-slate-800 text-sm">{step.title}</span>
                </div>
                {index < arr.length - 1 && (
                  <div className="hidden md:block w-12 lg:w-16 h-0.5 bg-blue-200 mx-2 -mt-8"></div>
                )}
                {index < arr.length - 1 && (
                  <div className="md:hidden h-8 w-0.5 bg-blue-200 my-2"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white" id="features">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-slate-900 mb-12 text-center">Key Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Shield className="h-6 w-6 text-blue-600" />}
              title="Patient Authentication"
              description="Secure OTP-based mobile authentication via WhatsApp integration."
            />
            <FeatureCard 
              icon={<Calendar className="h-6 w-6 text-blue-600" />}
              title="Appointment Management"
              description="Patients can easily browse departments, find doctors, and book appointments."
            />
            <FeatureCard 
              icon={<Clock className="h-6 w-6 text-blue-600" />}
              title="Token Management"
              description="Every appointment receives a unique daily token representing their queue position."
            />
            <FeatureCard 
              icon={<Brain className="h-6 w-6 text-blue-600" />}
              title="AI Pre-consultation"
              description="Patients provide symptoms and medical history which is summarized by AI for the doctor."
            />
            <FeatureCard 
              icon={<Stethoscope className="h-6 w-6 text-blue-600" />}
              title="Doctor Dashboard"
              description="Doctors can view their daily queue, access summaries, and manage consultations."
            />
            <FeatureCard 
              icon={<FileText className="h-6 w-6 text-blue-600" />}
              title="Medical Documentation"
              description="Structured digital records for diagnosis, prescriptions, and historical health data."
            />
          </div>
        </div>
      </section>

      {/* Roles Section */}
      <section className="py-20 bg-slate-50 border-t border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-slate-900 mb-12 text-center">Platform Roles</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 hover:shadow-md transition-shadow">
              <div className="flex items-center mb-6">
                <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                  <UserCheck className="h-6 w-6 text-blue-700" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900">Patient</h3>
              </div>
              <ul className="space-y-3">
                {['Secure OTP authentication', 'Book and manage appointments', 'Complete pre-consultation questions', 'View queue token status', 'Access medical records and prescriptions'].map((item, i) => (
                  <li key={i} className="flex items-start">
                    <div className="flex-shrink-0 h-5 w-5 rounded-full bg-blue-100 flex items-center justify-center mt-0.5">
                      <div className="h-2 w-2 rounded-full bg-blue-600"></div>
                    </div>
                    <span className="ml-3 text-slate-600">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 hover:shadow-md transition-shadow">
              <div className="flex items-center mb-6">
                <div className="h-12 w-12 bg-indigo-100 rounded-lg flex items-center justify-center mr-4">
                  <Stethoscope className="h-6 w-6 text-indigo-700" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900">Doctor</h3>
              </div>
              <ul className="space-y-3">
                {['View live daily appointment queue', 'Review AI-generated patient summaries', 'Conduct structured consultations', 'Record diagnosis and treatment plans', 'Digitally sign and issue prescriptions'].map((item, i) => (
                  <li key={i} className="flex items-start">
                    <div className="flex-shrink-0 h-5 w-5 rounded-full bg-indigo-100 flex items-center justify-center mt-0.5">
                      <div className="h-2 w-2 rounded-full bg-indigo-600"></div>
                    </div>
                    <span className="ml-3 text-slate-600">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="py-20 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-slate-900 mb-12">Technology Stack</h2>
          <div className="flex flex-wrap justify-center gap-4 md:gap-8">
            <TechBadge title="Frontend" tech="React + Tailwind CSS" />
            <TechBadge title="Backend" tech="Java + Spring Boot 3" />
            <TechBadge title="Database" tech="MySQL" />
            <TechBadge title="Auth" tech="JWT + MSG91 OTP" />
            <TechBadge title="AI Integration" tech="Groq LLaMA / Whisper" />
          </div>
        </div>
      </section>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
  <div className="bg-slate-50 rounded-xl p-6 border border-slate-100 hover:border-blue-100 hover:bg-blue-50/50 transition-colors">
    <div className="h-12 w-12 bg-white rounded-lg flex items-center justify-center shadow-sm border border-slate-200 mb-4">
      {icon}
    </div>
    <h3 className="text-xl font-bold text-slate-900 mb-2">{title}</h3>
    <p className="text-slate-600 leading-relaxed">{description}</p>
  </div>
);

const TechBadge = ({ title, tech }: { title: string, tech: string }) => (
  <div className="px-6 py-4 bg-slate-50 border border-slate-200 rounded-lg min-w-[200px]">
    <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">{title}</div>
    <div className="font-bold text-slate-800">{tech}</div>
  </div>
);

export default LandingPage;
