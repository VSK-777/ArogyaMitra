import { useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Bot, Mic, Square, Loader2,  } from 'lucide-react';
import { preConsultationApi } from '../../api/preConsultationApi';

export default function PreConsultation() {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const aptId = searchParams.get('appointmentId'); // Expected to be passed in URL like ?appointmentId=APT-123

  const [step, setStep] = useState(1);
  const [complaint, setComplaint] = useState('');
  const [loading, setLoading] = useState(false);
  const [aiQuestion, setAiQuestion] = useState('');
  const [aiSummary, setAiSummary] = useState('');

  // Audio Recording State
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const handleStart = async () => {
    if (!aptId) {
        alert("No Appointment ID provided!");
        return;
    }
    if (!complaint) {
        alert("Please provide a complaint.");
        return;
    }
    setLoading(true);
    try {
        await preConsultationApi.start(aptId, complaint);
        setStep(2); // Move to Audio recording step for AI follow up
    } catch (e: any) {
        alert(e.response?.data?.message || 'Error starting pre-consultation');
    } finally {
        setLoading(false);
    }
  };

  const startRecording = async () => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorderRef.current = new MediaRecorder(stream);
        audioChunksRef.current = [];

        mediaRecorderRef.current.ondataavailable = (event) => {
            if (event.data.size > 0) {
                audioChunksRef.current.push(event.data);
            }
        };

        mediaRecorderRef.current.onstop = async () => {
            const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
            sendAudioToBackend(audioBlob);
        };

        mediaRecorderRef.current.start();
        setIsRecording(true);
    } catch (err) {
        alert("Microphone access denied or not available.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stop();
        setIsRecording(false);
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  const sendAudioToBackend = async (blob: Blob) => {
    setLoading(true);
    try {
        const res = await preConsultationApi.sendAudio(aptId!, blob);
        if (res.success) {
            setAiQuestion(res.data); // Backend returns the next question text
        } else {
            alert(res.message);
        }
    } catch (e: any) {
        alert('Error transcribing audio');
    } finally {
        setLoading(false);
    }
  };

  const handleComplete = async () => {
    setLoading(true);
    try {
        const res = await preConsultationApi.complete(aptId!);
        if (res.success) {
            setAiSummary(res.data.aiSummary);
            setStep(3);
        } else {
            alert(res.message);
        }
    } catch (e: any) {
        alert('Error completing pre-consultation');
    } finally {
        setLoading(false);
    }
  };

  if (step === 3) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12 animate-in fade-in">
         <div className="mx-auto w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
            <Bot className="w-8 h-8" />
         </div>
         <h2 className="text-2xl font-bold text-slate-900 mb-2">AI Summary Generated</h2>
         <div className="bg-white p-6 rounded-lg border border-slate-200 text-left my-6 text-sm text-slate-700 whitespace-pre-wrap">
            {aiSummary || "Your pre-consultation details have been analyzed by our AI and securely sent to your doctor."}
         </div>
         <button onClick={() => navigate('/patient/dashboard')} className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700">Return to Dashboard</button>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4 mb-8">
         <div className="bg-blue-100 p-3 rounded-xl"><Bot className="h-8 w-8 text-blue-600" /></div>
         <div>
             <h1 className="text-2xl font-bold text-slate-900">AI Pre-Consultation</h1>
             <p className="text-slate-500">Appointment ID: {aptId || 'None'}</p>
         </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6">
        
        {step === 1 && (
            <div className="animate-in fade-in">
                <label className="block text-sm font-medium text-slate-700 mb-2">What is the main reason for your visit today? (Chief Complaint)</label>
                <textarea 
                    value={complaint}
                    onChange={(e) => setComplaint(e.target.value)}
                    rows={4} 
                    className="w-full border-gray-300 rounded-md shadow-sm border p-3 focus:ring-blue-500 focus:border-blue-500" 
                    placeholder="E.g. I have been having chest pain when walking up stairs..."
                ></textarea>
                
                <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button disabled={loading} onClick={handleStart} className="bg-blue-600 flex gap-2 items-center text-white px-8 py-2.5 rounded-md hover:bg-blue-700 font-medium shadow-sm">
                    {loading && <Loader2 className="animate-spin h-4 w-4" />}
                    Start AI Follow-up
                </button>
                </div>
            </div>
        )}

        {step === 2 && (
            <div className="animate-in fade-in space-y-6">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                    <h3 className="font-semibold text-blue-900 flex gap-2 items-center"><Bot className="w-5 h-5"/> AI Assistant</h3>
                    <p className="text-blue-800 mt-2">
                        {aiQuestion || "I will now ask you a few follow-up questions to understand your condition better. Please press record to answer."}
                    </p>
                </div>

                <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50">
                    
                    {loading ? (
                        <div className="text-slate-500 flex flex-col items-center gap-2">
                            <Loader2 className="animate-spin h-8 w-8 text-blue-600" />
                            <p>Processing Audio with Groq Whisper...</p>
                        </div>
                    ) : (
                        <>
                            {!isRecording ? (
                                <button onClick={startRecording} className="bg-red-100 text-red-600 p-4 rounded-full hover:bg-red-200 flex flex-col items-center gap-2 transition-all">
                                    <Mic className="w-8 h-8" />
                                </button>
                            ) : (
                                <button onClick={stopRecording} className="bg-red-600 text-white p-4 rounded-full hover:bg-red-700 flex flex-col items-center gap-2 animate-pulse shadow-lg">
                                    <Square className="w-8 h-8 fill-current" />
                                </button>
                            )}
                            <p className="mt-4 text-sm font-medium text-slate-600">
                                {isRecording ? "Recording... Click to Stop" : "Click to Record Voice Answer"}
                            </p>
                        </>
                    )}
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button disabled={loading || isRecording} onClick={handleComplete} className="bg-green-600 flex gap-2 items-center text-white px-8 py-2.5 rounded-md hover:bg-green-700 font-medium shadow-sm">
                    {loading && <Loader2 className="animate-spin h-4 w-4" />}
                    Finish Pre-Consultation
                </button>
                </div>
            </div>
        )}

      </div>
    </div>
  );
}
