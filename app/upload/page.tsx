'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, FileAudio, Loader2, Link, AlertCircle, TrendingUp, AlertTriangle } from "lucide-react";

export default function UploadPage() {
    const [file, setFile] = useState<File | null>(null);
    const [url, setJsonUrl] = useState('');
    const [bulkUrls, setBulkUrls] = useState('');
    const [activeTab, setActiveTab] = useState("file");
    const [isUploading, setIsUploading] = useState(false);
    const [result, setResult] = useState<any>(null);

    // CSV States
    const [csvFile, setCsvFile] = useState<File | null>(null);
    const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
    const [selectedColumn, setSelectedColumn] = useState<string>('');
    const [csvPreview, setCsvPreview] = useState<any[]>([]);
    const [bulkProgress, setBulkProgress] = useState<{ total: number; current: number; logs: string[] } | null>(null);

    const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setCsvFile(file);
            const reader = new FileReader();
            reader.onload = (event) => {
                const text = event.target?.result as string;
                const rows = text.split('\n').map(row => row.split(',')); // Basic CSV parsing
                if (rows.length > 0) {
                    const headers = rows[0].map(h => h.trim());
                    setCsvHeaders(headers);
                    setSelectedColumn(headers[0]); // Default first column
                    setCsvPreview(rows.slice(1, 4)); // Preview first 3 rows
                }
            };
            reader.readAsText(file);
        }
    };

    const handleUpload = async () => {
        if (activeTab === 'file' && !file) return;
        if (activeTab === 'url' && !url) return;
        if (activeTab === 'bulk' && !bulkUrls) return;
        if (activeTab === 'csv' && (!csvFile || !selectedColumn)) return;

        setIsUploading(true);
        setResult(null);
        setBulkProgress(null);

        let urlsToProcess: string[] = [];

        // 1. Prepare List
        if (activeTab === 'bulk') {
            urlsToProcess = bulkUrls.split('\n').map(u => u.trim()).filter(u => u.length > 0);
        } else if (activeTab === 'csv' && csvFile) {
            // Re-read file to get full list
            const text = await csvFile.text();
            const rows = text.split('\n').map(row => row.split(','));
            const headerIndex = rows[0].findIndex(h => h.trim() === selectedColumn);

            if (headerIndex === -1) {
                setBulkProgress({ total: 0, current: 0, logs: ["❌ Error: Column not found"] });
                setIsUploading(false);
                return;
            }

            urlsToProcess = rows.slice(1)
                .map(row => row[headerIndex]?.trim())
                .filter(u => u && u.length > 0);
        }

        // 2. Process Batch
        if (urlsToProcess.length > 0) {
            setBulkProgress({ total: urlsToProcess.length, current: 0, logs: [] });

            for (let i = 0; i < urlsToProcess.length; i++) {
                const currentUrl = urlsToProcess[i];
                setBulkProgress(prev => prev ? ({ ...prev, current: i + 1, logs: [`Processing ${i + 1}/${urlsToProcess.length}: ${currentUrl}...`, ...prev.logs] }) : null);

                try {
                    const formData = new FormData();
                    formData.append('url', currentUrl);

                    const response = await fetch('/api/process-audio', {
                        method: 'POST',
                        body: formData,
                    });

                    if (response.ok) {
                        setBulkProgress(prev => prev ? ({ ...prev, logs: [`✅ Completed: ${currentUrl}`, ...prev.logs] }) : null);
                    } else {
                        const err = await response.text();
                        setBulkProgress(prev => prev ? ({ ...prev, logs: [`❌ Failed: ${currentUrl} - ${err}`, ...prev.logs] }) : null);
                    }
                } catch (error: any) {
                    setBulkProgress(prev => prev ? ({ ...prev, logs: [`❌ Error: ${currentUrl} - ${error.message}`, ...prev.logs] }) : null);
                }
            }
            setIsUploading(false);
            return;
        }

        // Original Single Upload Logic
        const formData = new FormData();
        if (activeTab === 'file' && file) {
            formData.append('file', file);
            formData.append('mimeType', file.type);
        } else if (activeTab === 'url') {
            formData.append('url', url);
        }

        try {
            const response = await fetch('/api/process-audio', {
                method: 'POST',
                body: formData,
            });
            const data = await response.json();
            setResult(data);
        } catch (error) {
            console.error('Upload failed:', error);
            setResult({ error: 'Failed to connect to the server.' });
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="mb-8">
                <h2 className="text-3xl font-bold tracking-tight text-slate-900">Process Call</h2>
                <p className="text-slate-600">Upload an audio file or provide a URL to extract business insights.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="text-slate-900">Input Source</CardTitle>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="file" className="w-full" onValueChange={setActiveTab}>
                        <TabsList className="grid w-full grid-cols-4 mb-4 bg-slate-100 text-slate-500">
                            <TabsTrigger value="file">
                                <FileAudio className="w-4 h-4 mr-2" />
                                <span className="text-slate-700">Upload File</span>
                            </TabsTrigger>
                            <TabsTrigger value="url">
                                <Link className="w-4 h-4 mr-2" />
                                Audio URL
                            </TabsTrigger>
                            <TabsTrigger value="bulk">
                                <TrendingUp className="w-4 h-4 mr-2" />
                                Raw List
                            </TabsTrigger>
                            <TabsTrigger value="csv">
                                <Upload className="w-4 h-4 mr-2" />
                                CSV Import
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="file" className="space-y-4">
                            <div className="flex items-center gap-4">
                                <Input
                                    type="file"
                                    accept="audio/*"
                                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                                />
                            </div>
                        </TabsContent>

                        <TabsContent value="url" className="space-y-4">
                            <div className="flex items-center gap-4">
                                <Input
                                    type="url"
                                    placeholder="https://example.com/recording.mp3"
                                    value={url}
                                    onChange={(e) => setJsonUrl(e.target.value)}
                                />
                            </div>
                            <p className="text-xs text-slate-500">Ensure the URL is publicly accessible.</p>
                        </TabsContent>

                        <TabsContent value="bulk" className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Remote Audio URLs (One per line)</label>
                                <textarea
                                    className="flex min-h-[150px] w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 disabled:cursor-not-allowed disabled:opacity-50"
                                    placeholder={'https://example.com/call1.mp3\nhttps://example.com/call2.mp3'}
                                    value={bulkUrls}
                                    onChange={(e) => setBulkUrls(e.target.value)}
                                />
                            </div>
                        </TabsContent>

                        <TabsContent value="csv" className="space-y-4">
                            <div className="space-y-4">
                                <Input
                                    type="file"
                                    accept=".csv"
                                    onChange={handleCsvUpload}
                                />
                                {csvFile && csvHeaders.length > 0 && (
                                    <div className="p-4 border rounded-lg bg-slate-50 space-y-3">
                                        <div>
                                            <label className="text-xs font-semibold uppercase text-slate-500">Select URL Column</label>
                                            <select
                                                className="flex w-full mt-1 items-center justify-between rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 ring-offset-background placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                value={selectedColumn}
                                                onChange={(e) => setSelectedColumn(e.target.value)}
                                            >
                                                {csvHeaders.map(h => (
                                                    <option key={h} value={h}>{h}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="text-xs text-slate-500">
                                            <p>Preview (First 3 rows):</p>
                                            <ul className="list-disc pl-4 mt-1">
                                                {csvPreview.map((row, i) => {
                                                    const idx = csvHeaders.indexOf(selectedColumn);
                                                    return <li key={i}>{row[idx] || <i>Empty</i>}</li>;
                                                })}
                                            </ul>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </TabsContent>
                    </Tabs>

                    <Button onClick={handleUpload} disabled={isUploading || (activeTab === 'file' && !file) || (activeTab === 'url' && !url) || (activeTab === 'bulk' && !bulkUrls) || (activeTab === 'csv' && (!csvFile || !selectedColumn))} className="w-full mt-4">
                        {isUploading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                {['bulk', 'csv'].includes(activeTab) && bulkProgress ? `Processing ${bulkProgress.current}/${bulkProgress.total}...` : 'Analyzing...'}
                            </>
                        ) : (
                            <>
                                <Upload className="mr-2 h-4 w-4" />
                                Process Audio
                            </>
                        )}
                    </Button>
                </CardContent>
            </Card>

            {/* Bulk Progress Display */}
            {bulkProgress && (
                <Card className="bg-slate-50 border-slate-200">
                    <CardHeader>
                        <CardTitle className="text-sm">Batch Processing Log</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="max-h-40 overflow-y-auto space-y-1 font-mono text-xs">
                            {bulkProgress.logs.map((log, i) => (
                                <div key={i} className={log.startsWith('✅') ? 'text-green-600' : log.startsWith('❌') ? 'text-red-600' : 'text-slate-500'}>
                                    {log}
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Single Result Display */}
            {!bulkProgress && result && result.error ? (
                <Card className="border-red-500 bg-red-50/50">
                    <CardHeader>
                        <CardTitle className="flex items-center text-red-700">
                            <AlertCircle className="mr-2 h-5 w-5" />
                            Analysis Failed
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-red-600">{result.error}</p>
                        {result.raw_response && (
                            <details className="mt-2">
                                <summary className="text-xs text-red-500 cursor-pointer">View Raw Response</summary>
                                <pre className="text-xs mt-1 p-2 bg-white rounded border overflow-auto max-h-40">{result.raw_response}</pre>
                            </details>
                        )}
                    </CardContent>
                </Card>
            ) : !bulkProgress && result && result.analysis ? (
                <div className="grid gap-6 md:grid-cols-2">
                    {/* Left Column: Key Insights */}
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <Card className="bg-blue-50/50 border-blue-200">
                                <CardContent className="p-4">
                                    <h4 className="text-xs font-semibold text-blue-600 uppercase mb-1">Buyer Intent</h4>
                                    <div className="flex items-end gap-2">
                                        <span className="text-3xl font-bold text-blue-700">{result.analysis.buyer_intent_score}/10</span>
                                        <TrendingUp className="h-5 w-5 text-blue-500 mb-1" />
                                    </div>
                                </CardContent>
                            </Card>
                            <Card className="bg-amber-50/50 border-amber-200">
                                <CardContent className="p-4">
                                    <h4 className="text-xs font-semibold text-amber-600 uppercase mb-1">Deal Status</h4>
                                    <Badge variant="outline" className="bg-white text-amber-800 border-amber-300 mt-1">
                                        {result.analysis.deal_status}
                                    </Badge>
                                </CardContent>
                            </Card>
                        </div>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Business Signals</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <h4 className="font-semibold text-sm text-slate-700 mb-1">Category & Product</h4>
                                    <p className="font-medium">{result.analysis.category} - {result.analysis.product}</p>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-sm text-slate-700 mb-1">Objection Type</h4>
                                    <div className="flex items-center gap-2 text-red-600 bg-red-50 px-2 py-1 rounded-md w-fit">
                                        <AlertTriangle className="h-4 w-4" />
                                        <span className="text-sm font-medium">{result.analysis.objection_type || 'None'}</span>
                                    </div>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-sm text-slate-700 mb-1">Missing Specifications</h4>
                                    {result.analysis.missing_specs && result.analysis.missing_specs.length > 0 ? (
                                        <ul className="list-disc list-inside text-sm text-slate-700">
                                            {result.analysis.missing_specs.map((spec: string, i: number) => (
                                                <li key={i}>{spec}</li>
                                            ))}
                                        </ul>
                                    ) : <span className="text-sm text-slate-400">None detected</span>}
                                </div>
                                <div>
                                    <h4 className="font-semibold text-sm text-slate-700 mb-1">Summary</h4>
                                    <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-md">
                                        {result.analysis.summary}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column: Transcript */}
                    <div className="h-full">
                        <Card className="h-full flex flex-col">
                            <CardHeader>
                                <CardTitle className="flex justify-between items-center">
                                    <span>Transcript</span>
                                    <Badge variant="secondary">Verbatim</Badge>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="flex-1 min-h-[500px]">
                                <div className="h-full bg-slate-50 p-4 rounded-md border text-sm font-mono text-slate-700 whitespace-pre-wrap leading-relaxed overflow-y-auto max-h-[600px]">
                                    {result.transcript}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            ) : null}
        </div>
    );
}
