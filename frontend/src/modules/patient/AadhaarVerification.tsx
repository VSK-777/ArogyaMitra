import React, { useState } from 'react';
import { patientApi } from '../../api/patientApi';
import { ShieldCheck, ShieldAlert, Loader2, UploadCloud, FileType } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AadhaarVerification({ patientData }: { patientData: any }) {
    const [file, setFile] = useState<File | null>(null);
    const [shareCode, setShareCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState(patientData?.verificationStatus || 'PENDING');

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleVerify = async () => {
        if (!file || !shareCode) {
            toast.error("Please provide both the Offline e-KYC ZIP file and the Share Code.");
            return;
        }
        setLoading(true);
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
            setLoading(false);
        }
    };

    if (status === 'VERIFIED') {
        return (
            <div className="rounded-xl border border-green-200 bg-green-50 p-6 flex items-start gap-4 shadow-sm mt-6">
                <ShieldCheck className="h-6 w-6 text-green-600 mt-1" />
                <div>
                    <h3 className="font-semibold text-green-800">Identity Verified</h3>
                    <p className="text-sm text-green-700 mt-1">Your identity has been cryptographically verified using Aadhaar Paperless Offline e-KYC. Thank you for completing this requirement.</p>
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
                    <p className="text-sm text-orange-700 mt-1">The uploaded document was authentic, but the demographic information does not exactly match your profile. An administrator will review your account.</p>
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
            
            <p className="text-sm text-slate-600 mb-6">
                For prototype testing, we use <strong>Aadhaar Paperless Offline e-KYC</strong>. 
                Please visit the <a href="https://myaadhaar.uidai.gov.in/offline-ekyc" target="_blank" rel="noreferrer" className="text-blue-600 hover:underline font-medium">official UIDAI portal</a>, 
                download your Offline e-KYC ZIP, and upload it here along with your 4-digit Share Code.
                <br/><br/>
                <em>Note: We do not store your Aadhaar number or Share Code permanently. The ZIP is decrypted in memory, the digital signature is cryptographically verified, and the XML is discarded immediately.</em>
            </p>

            <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Offline e-KYC ZIP File</label>
                        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 border-dashed rounded-lg">
                            <div className="space-y-1 text-center">
                                {file ? (
                                    <FileType className="mx-auto h-12 w-12 text-blue-500" />
                                ) : (
                                    <UploadCloud className="mx-auto h-12 w-12 text-slate-400" />
                                )}
                                <div className="flex text-sm text-slate-600 justify-center">
                                    <label htmlFor="file-upload" className="relative cursor-pointer rounded-md bg-white font-medium text-blue-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2 hover:text-blue-500">
                                        <span>{file ? file.name : 'Upload a file'}</span>
                                        <input id="file-upload" name="file-upload" type="file" className="sr-only" accept=".zip" onChange={handleFileChange} />
                                    </label>
                                </div>
                                <p className="text-xs text-slate-500">ZIP up to 5MB</p>
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
                        onClick={handleVerify}
                        disabled={loading || !file || shareCode.length !== 4}
                        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Verify Identity securely'}
                    </button>
                </div>
            </div>
        </div>
    );
}

