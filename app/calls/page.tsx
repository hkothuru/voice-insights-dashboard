'use client';

import { useState } from 'react';
import { CallList } from '@/components/CallList';
import { CallDetail } from '@/components/CallDetail';

export default function CallsPage() {
    const [selectedCall, setSelectedCall] = useState<any | null>(null);
    const [refreshKey, setRefreshKey] = useState(0);

    const handleCallDeleted = (id: string) => {
        setSelectedCall(null);
        setRefreshKey(prev => prev + 1);
    };

    return (
        <div className="h-[calc(100vh-8rem)] flex flex-col">
            <div className="mb-4">
                <h2 className="text-3xl font-bold tracking-tight">Calls Explorer</h2>
                <p className="text-slate-600">Detailed insights from recent buyer-seller conversations.</p>
            </div>

            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 overflow-hidden">
                <div className="md:col-span-1 lg:col-span-1 overflow-auto">
                    <CallList
                        key={refreshKey}
                        selectedCallId={selectedCall?.id}
                        onSelectCall={setSelectedCall}
                    />
                </div>
                <div className="md:col-span-2 lg:col-span-3 h-full overflow-hidden">
                    <CallDetail call={selectedCall} onDelete={handleCallDeleted} />
                </div>
            </div>
        </div>
    );
}
