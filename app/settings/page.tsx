'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, AlertTriangle, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function SettingsPage() {
    const [isResetting, setIsResetting] = useState(false);
    const [resetSuccess, setResetSuccess] = useState(false);
    const [error, setError] = useState('');

    const handleReset = async () => {
        if (!confirm('Are you sure you want to delete ALL call data? This cannot be undone.')) return;

        setIsResetting(true);
        setError('');
        try {
            const res = await fetch('/api/calls?action=reset', {
                method: 'DELETE',
            });

            if (!res.ok) throw new Error('Failed to reset data');

            setResetSuccess(true);
            setTimeout(() => setResetSuccess(false), 3000);
        } catch (err) {
            setError('An error occurred while resetting data.');
            console.error(err);
        } finally {
            setIsResetting(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
            <div className="mb-8">
                <h2 className="text-3xl font-bold tracking-tight text-slate-900">Settings</h2>
                <p className="text-slate-600">Manage your dashboard preferences and data.</p>
            </div>

            <Card className="border-red-200 shadow-sm">
                <CardHeader>
                    <CardTitle className="text-red-700 flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5" />
                        Danger Zone
                    </CardTitle>
                    <CardDescription className="text-slate-500">
                        Irreversible actions for data management.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-100">
                        <div>
                            <h4 className="font-semibold text-slate-900">Reset Dashboard Data</h4>
                            <p className="text-sm text-slate-600">Permanently delete all processed calls and analysis.</p>
                        </div>
                        <Button
                            variant="destructive"
                            onClick={handleReset}
                            disabled={isResetting}
                            className="bg-red-600 hover:bg-red-700 text-white"
                        >
                            {isResetting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Resetting...
                                </>
                            ) : (
                                <>
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Clear All Data
                                </>
                            )}
                        </Button>
                    </div>

                    {resetSuccess && (
                        <Alert className="bg-green-50 border-green-200">
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                            <AlertTitle className="text-green-800">Success</AlertTitle>
                            <AlertDescription className="text-green-700">
                                All data has been successfully cleared.
                            </AlertDescription>
                        </Alert>
                    )}

                    {error && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Error</AlertTitle>
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
