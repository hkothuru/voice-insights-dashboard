'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Phone, Clock, MapPin, IndianRupee, TrendingUp } from "lucide-react";

interface CallListProps {
    selectedCallId?: string;
    onSelectCall: (call: any) => void;
}

export function CallList({ selectedCallId, onSelectCall }: CallListProps) {
    const [calls, setCalls] = useState<any[]>([]);

    useEffect(() => {
        fetch('/api/calls')
            .then(res => res.json())
            .then(data => {
                setCalls(data);
                // Automatically select the first call if none selected
                if (data.length > 0 && !selectedCallId) {
                    onSelectCall(data[0]);
                }
            })
            .catch(err => console.error(err));
    }, []);

    return (
        <div className="space-y-4 max-h-[calc(100vh-12rem)] overflow-y-auto pr-2">
            {calls.map((call) => (
                <Card
                    key={call.id}
                    className={cn(
                        "cursor-pointer transition-all hover:border-blue-400 hover:shadow-md",
                        selectedCallId === call.id ? "border-blue-600 bg-blue-50/50 ring-1 ring-blue-600" : "bg-white"
                    )}
                    onClick={() => onSelectCall(call)}
                >
                    <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-2">
                            <Badge variant="outline" className={cn(
                                "text-xs",
                                call.analysis?.buyer_intent_score >= 8 ? "bg-green-50 text-green-700 border-green-200" :
                                    call.analysis?.buyer_intent_score >= 5 ? "bg-yellow-50 text-yellow-700 border-yellow-200" :
                                        "bg-red-50 text-red-700 border-red-200"
                            )}>
                                Intent: {call.analysis?.buyer_intent_score}/10
                            </Badge>
                            <div className="flex items-center text-xs text-slate-600 font-medium">
                                <Clock className="h-3 w-3 mr-1" />
                                {Math.floor((call.duration_seconds || 0) / 60)}m {(call.duration_seconds || 0) % 60}s
                            </div>
                        </div>

                        <h4 className="font-semibold text-sm mb-1">{call.analysis?.product || 'Unknown Product'}</h4>
                        <p className="text-xs text-slate-500 mb-3 truncate">
                            {call.analysis?.buyer_id || 'Unknown'} • {call.analysis?.seller_id || 'Unknown'}
                        </p>

                        <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="flex items-center text-slate-600">
                                <TrendingUp className="h-3 w-3 mr-1" />
                                {call.analysis?.deal_status || 'N/A'}
                            </div>
                            <div className="flex items-center text-slate-600">
                                {call.analysis?.price_discussion?.final_price && (
                                    <>
                                        <IndianRupee className="h-3 w-3 mr-1" />
                                        {call.analysis.price_discussion.final_price}
                                    </>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
