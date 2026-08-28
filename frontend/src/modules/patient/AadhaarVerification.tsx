import React, { useState, useEffect } from 'react';
import { patientApi } from '../../api/patientApi';
import { ShieldCheck, ShieldAlert, Loader2, UploadCloud, FileType, Smartphone } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AadhaarVerification({ patientData }: { patientData: any }) {
    const [status, setStatus] = useState(patientData?.verificationStatus || 'PENDING');
    
    // App-to-App state
    const [appToAppLoading, setAppToAppLoading] = useState(false);
    const [verificationStep, setVerificationStep] = useState<'IDLE' | 'CONSENT' | 'WAITING' | 'VERIFYING'>('IDLE');
    const [transactionId, setTransactionId] = useState<string | null>(null);

    // Fallback state
    const [showFallback, setShowFallback] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [shareCode, setShareCode] = useState('');
    const [fallbackLoading, setFallbackLoading] = useState(false);

    useEffect(() => {
        let interval: any;
        if ((verificationStep === 'WAITING' || verificationStep === 'VERIFYING') && transactionId) {
            interval = setInterval(async () => {
                try {
                    const res = await patientApi.getAadhaarAppToAppStatus(transactionId);
                    if (res.success) {
                        if (res.data.status === 'VERIFIED') {
                            setStatus('VERIFIED');
                            setVerificationStep('IDLE');
                            toast.success("Aadhaar Identity Verified successfully!");
                            clearInterval(interval);
                        } else if (res.data.status === 'FAILED' || res.data.status === 'EXPIRED') {
                            setVerificationStep('IDLE');
                            toast.error(`Verification ${res.data.status.toLowerCase()}: ${res.data.error || 'Please try again.'}`);
                            clearInterval(interval);
                        }
                    }
                } catch (e) {
                    console.error("Status check failed", e);
                }
            }, 3000);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [verificationStep, transactionId]);

    const handleInitiateAppToApp = async () => {
        setAppToAppLoading(true);
        try {
            const res = await patientApi.initiateAadhaarAppToApp();
            if (res.success) {
                setTransactionId(res.data.transactionId);
                setVerificationStep('WAITING');
                
                // If it's the mock provider for dev, simulate opening app and completing
                if (res.data.provider === 'MOCK_APP_TO_APP') {
                    toast.success("DEV MODE: Mocking App-to-App intent...");
                    // We simulate the app completing by hitting the mock callback directly after 3 seconds
                    setTimeout(async () => {
                        setVerificationStep('VERIFYING');
                        try {
                            // Hit backend callback directly to simulate UIDAI success
                            await fetch(`/api/patients/me/aadhaar/app-to-app/callback?transactionId=${res.data.transactionId}&nonce=ignore_in_mock&success=true`, {
                                method: 'POST',
                                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                            });
                        } catch (e) {
                            console.error(e);
                        }
                    }, 3000);
                } else {
                    // Production intent redirect
                    window.location.href = res.data.intentUrl;
                }
            } else {
                toast.error(res.message || "Failed to initiate verification.");
                setVerificationStep('IDLE');
            }
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "An error occurred.");
            setVerificationStep('IDLE');
        } finally {
            setAppToAppLoading(false);
        }
    };

    const handleFallbackFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleFallbackVerify = async () => {
        if (!file || !shareCode) {
            toast.error("Please provide both the Offline e-KYC ZIP file and the Share Code.");
            return;
        }
        setFallbackLoading(true);
        try {
            const res = await patientApi.verifyAadhaarOfflineEkyc(file, shareCode);
            if (res.success) {
                setStatus(res.data);
                toast.success("Verification processed successfully.");
            } else {
                toast.error(res.message || "Verification failed.");
            }
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "An error occurred during verification.");
        } finally {
            setFallbackLoading(false);
        }
    };

    if (status === 'VERIFIED') {
        return (
            <div className="rounded-xl border border-green-200 bg-green-50 p-6 flex items-start gap-4 shadow-sm mt-6">
                <ShieldCheck className="h-6 w-6 text-green-600 mt-1" />
                <div>
                    <h3 className="font-semibold text-green-800">Aadhaar Identity Verified</h3>
                    <p className="text-sm text-green-700 mt-1">Your identity has been cryptographically verified. Thank you for completing this requirement.</p>
                </div>
            </div>
        );
    }

    if (status === 'REVIEW_REQUIRED') {
        return (
            <div className="rounded-xl border border-orange-200 bg-orange-50 p-6 flex items-start gap-4 shadow-sm mt-6">
                <ShieldAlert className="h-6 w-6 text-orange-600 mt-1" />
                <div>
                    <h3 className="font-semibold text-orange-800">Verification Under Review</h3>
                    <p className="text-sm text-orange-700 mt-1">An administrator will review your account information.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm mt-6">
            <div className="flex items-center gap-3 mb-4">
                <ShieldAlert className="h-6 w-6 text-blue-600" />
                <h3 className="text-lg font-bold text-slate-900">Aadhaar Identity Verification</h3>
            </div>
            
            {verificationStep === 'IDLE' && (
                <div className="bg-slate-50 p-5 rounded-lg border border-slate-200 mb-6 text-center">
                    <Smartphone className="h-12 w-12 text-blue-600 mx-auto mb-3" />
                    <h4 className="font-semibold text-slate-800 text-lg mb-2">Verify your identity securely using the official Aadhaar App.</h4>
                    <p className="text-sm text-slate-600 mb-6 max-w-lg mx-auto">
                        Fast and seamless verification. Your Aadhaar authentication and explicit consent are handled securely by the official UIDAI application. We will only request the minimum information required to verify your profile.
                    </p>
                    <button 
                        onClick={() => setVerificationStep('CONSENT')}
                        className="bg-blue-600 text-white px-6 py-2.5 rounded-md font-semibold hover:bg-blue-700 shadow-sm"
                    >
                        Verify with Aadhaar
                    </button>
                </div>
            )}

            {verificationStep === 'CONSENT' && (
                <div className="bg-blue-50 p-5 rounded-lg border border-blue-200 mb-6 text-center">
                    <h4 className="font-semibold text-blue-900 text-lg mb-2">Consent Required</h4>
                    <p className="text-sm text-blue-800 mb-6 max-w-lg mx-auto">
                        SIH Health will open the official Aadhaar App. You will authenticate and approve the information you choose to share. 
                        We require this to verify your hospital registration.
                    </p>
                    <div className="flex justify-center gap-4">
                        <button 
                            onClick={() => setVerificationStep('IDLE')}
                            className="bg-white text-slate-700 border border-slate-300 px-6 py-2.5 rounded-md font-semibold hover:bg-slate-50 shadow-sm"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={handleInitiateAppToApp}
                            disabled={appToAppLoading}
                            className="bg-blue-600 text-white px-6 py-2.5 rounded-md font-semibold hover:bg-blue-700 shadow-sm flex items-center justify-center min-w-[120px]"
                        >
                            {appToAppLoading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Continue'}
                        </button>
                    </div>
                </div>
            )}

            {verificationStep === 'WAITING' && (
                <div className="bg-orange-50 p-6 rounded-lg border border-orange-200 mb-6 text-center">
                    <Loader2 className="h-10 w-10 text-orange-500 animate-spin mx-auto mb-4" />
                    <h4 className="font-semibold text-orange-900 text-lg mb-2">⏳ Waiting for Aadhaar verification...</h4>
                    <p className="text-sm text-orange-800">
                        Please complete the process in the official Aadhaar App.
                    </p>
                    <button 
                        onClick={() => setVerificationStep('IDLE')}
                        className="mt-6 text-sm text-orange-700 underline"
                    >
                        Cancel or Try Again
                    </button>
                </div>
            )}

            {verificationStep === 'VERIFYING' && (
                <div className="bg-blue-50 p-6 rounded-lg border border-blue-200 mb-6 text-center">
                    <Loader2 className="h-10 w-10 text-blue-600 animate-spin mx-auto mb-4" />
                    <h4 className="font-semibold text-blue-900 text-lg mb-2">⏳ Verifying your identity securely...</h4>
                    <p className="text-sm text-blue-800">
                        Processing the response from UIDAI...
                    </p>
                </div>
            )}

            {verificationStep === 'IDLE' && !showFallback && (
                <div className="text-center">
                    <p className="text-sm text-slate-500">
                        Can't use the Aadhaar App? 
                        <button onClick={() => setShowFallback(true)} className="ml-2 text-blue-600 hover:underline font-medium">
                            Continue with Offline e-KYC
                        </button>
                    </p>
                </div>
            )}

            {showFallback && verificationStep === 'IDLE' && (
                <div className="mt-8 border-t border-slate-200 pt-6">
                    <h4 className="font-semibold text-slate-800 mb-2">Offline e-KYC Fallback</h4>
                    <p className="text-sm text-slate-600 mb-6">
                        Download your Offline e-KYC ZIP from the <a href="https://myaadhaar.uidai.gov.in/offline-ekyc" target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">official UIDAI portal</a>, and upload it here along with your 4-digit Share Code.
                    </p>

                    <div className="grid gap-6 sm:grid-cols-2">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Offline e-KYC ZIP File</label>
                                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 border-dashed rounded-lg bg-slate-50">
                                    <div className="space-y-1 text-center">
                                        {file ? (
                                            <FileType className="mx-auto h-12 w-12 text-blue-500" />
                                        ) : (
                                            <UploadCloud className="mx-auto h-12 w-12 text-slate-400" />
                                        )}
                                        <div className="flex text-sm text-slate-600 justify-center">
                                            <label htmlFor="file-upload" className="relative cursor-pointer rounded-md font-medium text-blue-600 hover:text-blue-500">
                                                <span>{file ? file.name : 'Upload a file'}</span>
                                                <input id="file-upload" name="file-upload" type="file" className="sr-only" accept=".zip" onChange={handleFallbackFileChange} />
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4 flex flex-col justify-end">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">4-Digit Share Code</label>
                                <input 
                                    type="password" 
                                    maxLength={4}
                                    value={shareCode}
                                    onChange={(e) => setShareCode(e.target.value)}
                                    placeholder="e.g. 1234"
                                    className="block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-3 border"
                                />
                            </div>
                            <button 
                                onClick={handleFallbackVerify}
                                disabled={fallbackLoading || !file || shareCode.length !== 4}
                                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-slate-800 hover:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {fallbackLoading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Verify with ZIP'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
