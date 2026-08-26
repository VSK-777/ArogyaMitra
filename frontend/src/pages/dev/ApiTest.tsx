import { useState } from 'react';

import { doctorApi } from '../../api/doctorApi';

export default function ApiTest() {
    const [result, setResult] = useState<any>(null);
    
    const testDoctorQueue = async () => {
        try {
            const res = await doctorApi.getQueue();
            setResult(res);
        } catch (e: any) {
            setResult(e.response?.data || e.message);
        }
    };
    
    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">API Sandbox (Dev Only)</h1>
            <div className="space-x-4 mb-4">
                <button onClick={testDoctorQueue} className="px-4 py-2 bg-blue-600 text-white rounded">Test Doctor Queue</button>
            </div>
            <pre className="bg-slate-900 text-green-400 p-4 rounded overflow-auto h-96">
                {JSON.stringify(result, null, 2)}
            </pre>
        </div>
    );
}
