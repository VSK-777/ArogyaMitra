import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Bot, Loader2, Send, CheckCircle, Mic, Square, AlertCircle } from 'lucide-react';
import { preConsultationApi } from '../../api/preConsultationApi';


interface Message {
  role: 'ai' | 'patient';
  content: string;
  isError?: boolean;
}

import { useTranslation } from 'react-i18next';

export default function PreConsultation() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
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
        let apiComplaint = complaint;
        if (i18n.language.startsWith('te')) {
            apiComplaint += "\n(System note: Please reply to me and ask the next follow-up question entirely in Telugu language)";
        }
        const res = await preConsultationApi.start(aptId!, apiComplaint);
        if (res.success) {
            setMessages([
              { role: 'patient', content: complaint },
              { role: 'ai', content: res.data.firstQuestion || "I've noted your complaint. Could you tell me more about it?" }
            ]);
            setStep(2);
        }
    } catch (e: any) {
        setMessages([{ role: 'ai', content: e.response?.data?.message || e.message || 'AI assistant is temporarily unavailable.', isError: true }]);
        setStep(2);
        setRetryAction(() => handleStart);
    } finally {
        setLoading(false);
    }
  };

  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [recordingError, setRecordingError] = useState<string | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<BlobPart[]>([]);

  const startRecording = async () => {
      try {
          setRecordingError(null);
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          const mediaRecorder = new MediaRecorder(stream);
          mediaRecorderRef.current = mediaRecorder;
          audioChunksRef.current = [];

          mediaRecorder.ondataavailable = (e) => {
              if (e.data.size > 0) {
                  audioChunksRef.current.push(e.data);
              }
          };

          mediaRecorder.onstop = async () => {
              const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
              stream.getTracks().forEach(track => track.stop());
              
              if (audioBlob.size > 10_000_000) {
                  setRecordingError('Voice recording has reached the maximum size.');
                  return;
              }

              setIsTranscribing(true);
              try {
                  const res = await preConsultationApi.sendAudio(aptId!, audioBlob);
                  if (res.success && res.data) {
                      setInputText(res.data);
                  }
              } catch (e: any) {
                  setRecordingError('Voice transcription is temporarily unavailable.');
              } finally {
                  setIsTranscribing(false);
              }
          };

          mediaRecorder.start();
          setIsRecording(true);

          setTimeout(() => {
              if (mediaRecorderRef.current?.state === 'recording') {
                  stopRecording();
                  setRecordingError('Voice recording has reached the maximum duration.');
              }
          }, 60000);

      } catch (err: any) {
          if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
              setRecordingError('Microphone access is required for voice input. You can continue using text input.');
          } else {
              setRecordingError('Voice input is unavailable on this device. You can continue using text input.');
          }
      }
  };

  const stopRecording = () => {
      if (mediaRecorderRef.current?.state === 'recording') {
          mediaRecorderRef.current.stop();
          setIsRecording(false);
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
        setMessages(prev => [...prev.filter(m => !m.isError), { role: 'ai', content: e.response?.data?.message || e.message || 'AI assistant is temporarily unavailable.', isError: true }]);
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
        } else {
            setMessages(prev => [...prev.filter(m => !m.isError), { role: 'ai', content: res.message || 'Error saving consultation. Please try again.', isError: true }]);
            setRetryAction(() => handleComplete);
        }
    } catch (e: any) {
        setMessages(prev => [...prev.filter(m => !m.isError), { role: 'ai', content: e.response?.data?.message || 'Server error. Please try again.', isError: true }]);
        setRetryAction(() => handleComplete);
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8">
      
      <div className="bg-white rounded-md shadow-sm border border-slate-200 overflow-hidden flex flex-col h-[600px]">
        {/* Header */}
        <div className="bg-blue-700 px-6 py-4 flex items-center justify-between shrink-0">
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
             <button onClick={handleComplete} disabled={loading} className="bg-white text-blue-700 px-4 py-2 rounded-md font-semibold text-sm hover:bg-blue-50">
               Finish Consultation
             </button>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50 flex flex-col">
          
          {step === 1 && (
            <div className="m-auto w-full max-w-lg bg-white p-8 rounded-md shadow-sm border border-slate-200">
              <Bot className="h-12 w-12 text-blue-700 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-center text-slate-900 mb-2">{t('preConsultation.welcome')}</h3>
              <p className="text-slate-500 text-center mb-6">{t('preConsultation.describe_symptom')}</p>
              
              <textarea 
                value={complaint}
                onChange={(e) => setComplaint(e.target.value)}
                placeholder={t('preConsultation.placeholder')}
                className="w-full border border-slate-300 rounded-lg p-4 h-32 focus:ring-blue-500 focus:border-blue-500 mb-4"
              />
              
              <button 
                onClick={handleStart} 
                disabled={loading || !complaint.trim()} 
                className="w-full bg-blue-700 text-white font-bold py-3 rounded-lg hover:bg-blue-800 disabled:opacity-50 flex items-center justify-center"
              >
                {loading ? <Loader2 className="animate-spin h-5 w-5" /> : t('preConsultation.start_chat')}
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="flex flex-col gap-4">
                 {messages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'ai' ? 'justify-start' : 'justify-end'}`}>
                      <div className={`max-w-[80%] p-4 rounded-md ${
                        msg.isError ? 'bg-orange-50 border border-orange-200 text-orange-800 rounded-tl-none' :
                        msg.role === 'ai' ? 'bg-white border border-slate-200 text-slate-800 rounded-tl-none' : 
                        'bg-blue-700 text-white rounded-tr-none'
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
                    <div className="bg-white border border-slate-200 p-4 rounded-md rounded-tl-none flex items-center gap-2">
                       <Loader2 className="h-5 w-5 animate-spin text-blue-700" />
                       <span className="text-slate-500 text-sm">{t('preConsultation.doc_typing')}</span>
                    </div>
                 </div>
               )}
               <div ref={messagesEndRef} />
            </div>
          )}

          {step === 3 && (
            <div className="m-auto w-full max-w-2xl bg-white p-8 rounded-md shadow-sm border border-slate-200 text-center">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-slate-900 mb-2">{t('preConsultation.pre_consult_complete')}</h3>
              <p className="text-slate-500 mb-6">{t('preConsultation.summary_sent')}</p>
              
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 text-left mb-8">
                 <h4 className="font-bold text-slate-700 mb-2">{t('preConsultation.ai_summary')}</h4>
                 <p className="text-slate-600 whitespace-pre-wrap">{aiSummary}</p>
              </div>

              <button 
                onClick={() => navigate('/patient/dashboard')} 
                className="bg-blue-700 text-white font-bold px-8 py-3 rounded-lg hover:bg-blue-800"
              >
                Return to Dashboard
              </button>
            </div>
          )}

        </div>

        {/* Footer Chat Input */}
        {step === 2 && (
            <div className="p-4 bg-white border-t border-slate-200 shrink-0">
                {recordingError && (
                    <div className="mb-3 p-3 bg-red-50 text-red-700 text-sm rounded-lg flex items-start gap-2">
                        <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                        <div className="flex-1">{recordingError}</div>
                        <button onClick={() => setRecordingError(null)} className="text-red-500 hover:text-red-700 text-xs font-bold uppercase">{t('preConsultation.dismiss')}</button>
                    </div>
                )}
                <div className="flex items-center gap-3">
                    {isRecording ? (
                        <button
                           onClick={stopRecording}
                           title="Stop recording"
                           aria-label="Stop voice recording"
                           className="bg-red-100 hover:bg-red-200 text-red-600 h-12 px-4 rounded-full flex items-center justify-center shrink-0 transition-colors"
                        >
                           <Square className="h-4 w-4 fill-current mr-2" />
                           <span className="font-semibold text-sm">{t('preConsultation.recording')}</span>
                        </button>
                    ) : (
                        <button 
                           onClick={startRecording}
                           disabled={isTranscribing || loading}
                           title="Start voice input"
                           aria-label="Start voice input"
                           className="bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-600 h-12 w-12 rounded-full flex items-center justify-center shrink-0 transition-colors"
                        >
                           {isTranscribing ? <Loader2 className="h-5 w-5 animate-spin text-blue-700" /> : <Mic className="h-5 w-5" />}
                        </button>
                    )}

                    <input 
                       type="text"
                       value={isTranscribing ? t('preConsultation.transcribing') : inputText}
                       onChange={(e) => setInputText(e.target.value)}
                       onKeyDown={(e) => { if(e.key === 'Enter') handleSendMessage() }}
                       placeholder={isRecording ? t('preConsultation.listening') : t('preConsultation.type_answer')}
                       disabled={isRecording || isTranscribing}
                       className="flex-1 bg-slate-50 border border-slate-300 rounded-full px-6 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                    />
                    <button 
                       onClick={handleSendMessage}
                       disabled={loading || !inputText.trim() || isRecording || isTranscribing}
                       className="bg-blue-700 hover:bg-blue-800 disabled:opacity-50 text-white h-12 w-12 rounded-full flex items-center justify-center shrink-0 transition-colors"
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





