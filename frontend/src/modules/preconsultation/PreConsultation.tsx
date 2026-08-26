import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Bot, Loader2, Send, CheckCircle } from 'lucide-react';
import { preConsultationApi } from '../../api/preConsultationApi';

interface Message {
  role: 'ai' | 'patient';
  content: string;
  isError?: boolean;
}

export default function PreConsultation() {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const aptId = searchParams.get('appointmentId'); 
  
  useEffect(() => {
    if (!aptId) {
      navigate('/patient/dashboard');
    }
  }, [aptId, navigate]);

  const [step, setStep] = useState(1);
  const [complaint, setComplaint] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [aiSummary, setAiSummary] = useState('');
  const [retryAction, setRetryAction] = useState<(() => void) | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleStart = async () => {
    if (!complaint.trim()) {
        return;
    }
    setLoading(true);
    setRetryAction(null);
    try {
        const res = await preConsultationApi.start(aptId!, complaint);
        if (res.success) {
            setMessages([
              { role: 'patient', content: complaint },
              { role: 'ai', content: res.data.firstQuestion || "I've noted your complaint. Could you tell me more about it?" }
            ]);
            setStep(2);
        }
    } catch (e: any) {
        setMessages([{ role: 'ai', content: 'AI assistant is temporarily unavailable. Please try again.', isError: true }]);
        setStep(2);
        setRetryAction(() => handleStart);
    } finally {
        setLoading(false);
    }
  };

  const handleSendMessage = async (retryMsg?: string | React.MouseEvent) => {
    const isRetry = typeof retryMsg === 'string';
    const userMsg = isRetry ? (retryMsg as string) : inputText.trim();
    
    if (!userMsg) return;
    
    if (!isRetry) {
       setMessages(prev => [...prev, { role: 'patient', content: userMsg }]);
       setInputText('');
    }
    setLoading(true);
    setRetryAction(null);
    
    try {
        const res = await preConsultationApi.chat(aptId!, userMsg);
        if (res.success) {
            // Remove previous error messages
            setMessages(prev => prev.filter(m => !m.isError).concat([{ role: 'ai', content: res.data || '' }]));
        }
    } catch (e: any) {
        setMessages(prev => [...prev.filter(m => !m.isError), { role: 'ai', content: 'AI assistant is temporarily unavailable. Please try again.', isError: true }]);
        setRetryAction(() => () => handleSendMessage(userMsg));
    } finally {
        setLoading(false);
    }
  };

  const handleComplete = async () => {
    setLoading(true);
    setRetryAction(null);
    try {
        const res = await preConsultationApi.complete(aptId!);
        if (res.success) {
            setAiSummary(res.data.aiSummary || "Summary completed successfully.");
            setStep(3);
        }
    } catch (e: any) {
        setMessages(prev => [...prev.filter(m => !m.isError), { role: 'ai', content: 'AI assistant is temporarily unavailable. Please try again.', isError: true }]);
        setRetryAction(() => handleComplete);
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8">
      
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-[600px]">
        {/* Header */}
        <div className="bg-blue-600 px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-lg">
              <Bot className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">AI Medical Assistant</h2>
              <p className="text-blue-100 text-sm">Appointment: {aptId}</p>
            </div>
          </div>
          {step === 2 && (
             <button onClick={handleComplete} disabled={loading} className="bg-white text-blue-600 px-4 py-2 rounded-md font-semibold text-sm hover:bg-blue-50">
               Finish Consultation
             </button>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50 flex flex-col">
          
          {step === 1 && (
            <div className="m-auto w-full max-w-lg bg-white p-8 rounded-xl shadow-sm border border-slate-200">
              <Bot className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-center text-slate-900 mb-2">Welcome to your Pre-Consultation</h3>
              <p className="text-slate-500 text-center mb-6">Briefly describe your main symptom or reason for visit to get started.</p>
              
              <textarea 
                value={complaint}
                onChange={(e) => setComplaint(e.target.value)}
                placeholder="e.g. I have been having severe chest pain for the last 2 hours."
                className="w-full border border-slate-300 rounded-lg p-4 h-32 focus:ring-blue-500 focus:border-blue-500 mb-4"
              />
              
              <button 
                onClick={handleStart} 
                disabled={loading || !complaint.trim()} 
                className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center"
              >
                {loading ? <Loader2 className="animate-spin h-5 w-5" /> : "Start Chat"}
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="flex flex-col gap-4">
                 {messages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'ai' ? 'justify-start' : 'justify-end'}`}>
                      <div className={`max-w-[80%] p-4 rounded-xl ${
                        msg.isError ? 'bg-orange-50 border border-orange-200 text-orange-800 rounded-tl-none' :
                        msg.role === 'ai' ? 'bg-white border border-slate-200 text-slate-800 rounded-tl-none' : 
                        'bg-blue-600 text-white rounded-tr-none'
                      }`}>
                          <p>{msg.content}</p>
                          {msg.isError && retryAction && (
                              <button 
                                onClick={retryAction}
                                className="mt-3 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                              >
                                Try Again
                              </button>
                          )}
                      </div>
                    </div>
                 ))}
               {loading && (
                 <div className="flex justify-start">
                    <div className="bg-white border border-slate-200 p-4 rounded-xl rounded-tl-none flex items-center gap-2">
                       <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                       <span className="text-slate-500 text-sm">Doctor AI is typing...</span>
                    </div>
                 </div>
               )}
               <div ref={messagesEndRef} />
            </div>
          )}

          {step === 3 && (
            <div className="m-auto w-full max-w-2xl bg-white p-8 rounded-xl shadow-sm border border-slate-200 text-center">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Pre-Consultation Complete</h3>
              <p className="text-slate-500 mb-6">A summary of this conversation has been sent to your doctor.</p>
              
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 text-left mb-8">
                 <h4 className="font-bold text-slate-700 mb-2">AI Summary</h4>
                 <p className="text-slate-600 whitespace-pre-wrap">{aiSummary}</p>
              </div>

              <button 
                onClick={() => navigate('/patient/dashboard')} 
                className="bg-blue-600 text-white font-bold px-8 py-3 rounded-lg hover:bg-blue-700"
              >
                Return to Dashboard
              </button>
            </div>
          )}

        </div>

        {/* Footer Chat Input */}
        {step === 2 && (
            <div className="p-4 bg-white border-t border-slate-200 shrink-0">
                <div className="flex items-center gap-3">
                    <input 
                       type="text"
                       value={inputText}
                       onChange={(e) => setInputText(e.target.value)}
                       onKeyDown={(e) => { if(e.key === 'Enter') handleSendMessage() }}
                       placeholder="Type your answer here..."
                       className="flex-1 bg-slate-50 border border-slate-300 rounded-full px-6 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button 
                       onClick={handleSendMessage}
                       disabled={loading || !inputText.trim()}
                       className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white h-12 w-12 rounded-full flex items-center justify-center shrink-0 transition-colors"
                    >
                       <Send className="h-5 w-5 ml-1" />
                    </button>
                </div>
            </div>
        )}
      </div>
    </div>
  );
}
