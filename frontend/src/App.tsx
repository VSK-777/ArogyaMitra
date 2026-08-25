import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import ApiTesting from "./pages/ApiTesting";
import { Stethoscope, FlaskConical } from "lucide-react";

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col font-sans text-slate-900 bg-slate-50">
        <nav className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <Stethoscope className="h-8 w-8 text-blue-600" />
                <span className="ml-2 text-xl font-bold text-slate-900">SIH HealthCare</span>
              </div>
              <div className="flex items-center space-x-2 sm:space-x-4">
                <Link to="/" className="text-slate-600 hover:text-blue-600 px-3 py-2 rounded-md font-medium transition-colors">Home</Link>
                <Link to="/api-testing" className="flex items-center text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md font-medium transition-colors shadow-sm">
                  <FlaskConical className="h-4 w-4 mr-2" />
                  API Testing
                </Link>
              </div>
            </div>
          </div>
        </nav>

        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/api-testing" element={<ApiTesting />} />
          </Routes>
        </main>

        <footer className="bg-slate-900 text-slate-300 py-12">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <div className="flex justify-center mb-4">
                <Stethoscope className="h-10 w-10 text-blue-400 opacity-80" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">SIH Hospital Management System</h3>
            <p className="mb-6 text-slate-400 max-w-2xl mx-auto">AI-Powered Hospital Appointment, Pre-Consultation & Medical Documentation System.</p>
            <div className="inline-block px-4 py-1 rounded-full bg-slate-800 text-xs font-semibold tracking-wider text-slate-400 uppercase mb-4 border border-slate-700">
                Academic / SIH Project Prototype
            </div>
            <p className="text-sm text-slate-500 mt-4">&copy; {new Date().getFullYear()} SIH Hospital System. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;
