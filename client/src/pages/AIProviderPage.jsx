import React from "react";

export default function AIProviderPage({
    geminiKeyLabel,
    setGeminiKeyLabel,
    geminiKey,
    setGeminiKey,
    geminiKeyVisible,
    setGeminiKeyVisible,
    groqKeyLabel,
    setGroqKeyLabel,
    groqKey,
    setGroqKey,
    groqKeyVisible,
    setGroqKeyVisible,
    geminiKeyStatus,
    setGeminiKeyStatus,
    groqKeyStatus,
    setGroqKeyStatus,
    handleSaveGeminiKey,
    handleSaveGroqKey
}) {
    return (
        <div className="space-y-10 animate-fade">
            <header>
                <h1 className="font-headline text-3xl font-black text-on-surface tracking-tight">AI Provider &amp; Failover Keys</h1>
                <p className="text-sm text-on-surface-variant mt-2 font-semibold">Manage your Gemini and Groq API token priorities and failover settings.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Active Keys Status Table - Span 8 */}
                <div className="lg:col-span-8 bg-white rounded-3xl p-8 shadow-sm border border-outline-variant/20">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="font-bold text-lg font-headline">Active Keys Status</h2>
                        <span className="flex items-center gap-1.5 px-3 py-1 bg-secondary-container/20 text-secondary rounded-full text-xs font-bold">
                            <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse"></span>
                            System Operational
                        </span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-outline-variant/20 text-xs font-bold text-outline">
                                    <th className="pb-4">Provider</th>
                                    <th className="pb-4">Role</th>
                                    <th className="pb-4">Status</th>
                                    <th className="pb-4">Latency</th>
                                    <th className="pb-4">Health</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-outline-variant/10 text-sm font-semibold">
                                <tr>
                                    <td className="py-5 flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                            <span className="material-symbols-outlined text-lg">diamond</span>
                                        </div>
                                        <span>Gemini Pro 1.5</span>
                                    </td>
                                    <td className="py-5"><span className="px-2.5 py-1 rounded-full bg-primary-fixed text-primary text-[10px] font-bold">PRIMARY</span></td>
                                    <td className="py-5 text-secondary">Active-Healthy</td>
                                    <td className="py-5 font-mono text-xs">482ms</td>
                                    <td className="py-5">
                                        <div className="w-24 bg-[#e2e8f0] h-1.5 rounded-full overflow-hidden">
                                            <div className="bg-secondary h-full" style={{ width: "98%" }}></div>
                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <td className="py-5 flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                            <span className="material-symbols-outlined text-lg">diamond</span>
                                        </div>
                                        <span>Gemini Flash</span>
                                    </td>
                                    <td className="py-5"><span className="px-2.5 py-1 rounded-full bg-surface-container-highest text-on-surface-variant text-[10px] font-bold">STANDBY</span></td>
                                    <td className="py-5 text-on-surface-variant">Ready</td>
                                    <td className="py-5 font-mono text-xs">210ms</td>
                                    <td className="py-5">
                                        <div className="w-24 bg-[#e2e8f0] h-1.5 rounded-full overflow-hidden">
                                            <div className="bg-secondary h-full" style={{ width: "100%" }}></div>
                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <td className="py-5 flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-tertiary-fixed text-on-tertiary-fixed flex items-center justify-center text-tertiary">
                                            <span className="material-symbols-outlined text-lg">bolt</span>
                                        </div>
                                        <span>Groq Llama 3</span>
                                    </td>
                                    <td className="py-5"><span className="px-2.5 py-1 rounded-full bg-tertiary-fixed text-on-tertiary-fixed-variant text-[10px] font-bold">FAILOVER</span></td>
                                    <td className="py-5 text-tertiary">Standby-Ready</td>
                                    <td className="py-5 font-mono text-xs">114ms</td>
                                    <td className="py-5">
                                        <div className="w-24 bg-[#e2e8f0] h-1.5 rounded-full overflow-hidden">
                                            <div className="bg-secondary h-full" style={{ width: "95%" }}></div>
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Stats graphs cards - Span 4 */}
                <div className="lg:col-span-4 flex flex-col gap-6">
                    <div className="bg-white rounded-3xl p-8 shadow-sm border border-outline-variant/20 flex-1 bg-white">
                        <h3 className="text-xs font-bold text-outline uppercase tracking-wider mb-6">Tokens Used this Month</h3>
                        <div className="flex items-end gap-3 h-28 mb-4">
                            <div className="flex-1 bg-primary-fixed hover:bg-primary h-[40%] rounded-t-lg transition-all" title="W1: 1.2M"></div>
                            <div className="flex-1 bg-primary-fixed hover:bg-primary h-[70%] rounded-t-lg transition-all" title="W2: 2.1M"></div>
                            <div className="flex-1 bg-primary-fixed hover:bg-primary h-[55%] rounded-t-lg transition-all" title="W3: 1.6M"></div>
                            <div className="flex-1 bg-primary h-[90%] rounded-t-lg transition-all" title="W4: 2.8M"></div>
                        </div>
                        <div className="flex justify-between text-xs font-bold text-on-surface-variant">
                            <span>7.7M Total Tokens</span>
                            <span className="text-secondary">+12% vs last month</span>
                        </div>
                    </div>

                    <div className="bg-on-background text-surface rounded-3xl p-8 shadow-sm flex-1 relative overflow-hidden flex flex-col justify-between">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-secondary/10 blur-[50px] rounded-full"></div>
                        <div className="relative z-10 space-y-2">
                            <h3 className="text-xs font-bold text-outline-variant uppercase tracking-wider">Total Savings ($)</h3>
                            <div className="text-4xl font-black text-secondary-fixed leading-tight text-white">$1,240.50</div>
                            <p className="text-xs text-surface-variant">Saved via intelligent failover and token routing this billing cycle.</p>
                        </div>
                    </div>
                </div>

                {/* Key configurations - Span 12 */}
                <div className="lg:col-span-12 bg-white rounded-3xl p-8 border border-outline-variant/20 shadow-sm space-y-6">
                    <h2 className="font-bold text-lg font-headline">Provider Key Configuration</h2>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Gemini Key Config Form */}
                        <div className="bg-surface-container-low rounded-2xl p-6 border border-outline-variant/10 space-y-4">
                            <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-primary text-xl">verified_user</span>
                                <h3 className="text-sm font-bold">Add New Gemini Token</h3>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-outline mb-1.5">API Key Label</label>
                                    <input className="w-full bg-white border border-outline-variant/30 rounded-xl px-4 py-2.5 text-xs font-semibold focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" onChange={(e) => setGeminiKeyLabel(e.target.value)} placeholder="e.g. Production Main" type="text" value={geminiKeyLabel} />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-outline mb-1.5">API Token</label>
                                    <div className="relative">
                                        <input className="w-full bg-white border border-outline-variant/30 rounded-xl px-4 py-2.5 text-xs font-semibold focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" onChange={(e) => setGeminiKey(e.target.value)} type={geminiKeyVisible ? "text" : "password"} value={geminiKey} />
                                        <button className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface" onClick={() => setGeminiKeyVisible(!geminiKeyVisible)}>
                                            <span className="material-symbols-outlined text-sm">{geminiKeyVisible ? "visibility_off" : "visibility"}</span>
                                        </button>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1.5 text-secondary text-xs font-bold">
                                    <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                                    {geminiKeyStatus}
                                </div>
                                <button className="w-full bg-on-background text-surface py-3 rounded-xl text-xs font-bold hover:bg-on-background/90 transition-all text-white" onClick={handleSaveGeminiKey}>Save Gemini Key</button>
                            </div>
                        </div>

                        {/* Groq Key Config Form */}
                        <div className="bg-surface-container-low rounded-2xl p-6 border border-outline-variant/10 space-y-4">
                            <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-tertiary text-xl">security</span>
                                <h3 className="text-sm font-bold">Add New Groq Token</h3>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-outline mb-1.5">API Key Label</label>
                                    <input className="w-full bg-white border border-outline-variant/30 rounded-xl px-4 py-2.5 text-xs font-semibold focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" onChange={(e) => setGroqKeyLabel(e.target.value)} placeholder="e.g. Failover Tier 1" type="text" value={groqKeyLabel} />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-outline mb-1.5">API Token</label>
                                    <div className="relative">
                                        <input className="w-full bg-white border border-outline-variant/30 rounded-xl px-4 py-2.5 text-xs font-semibold focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" onChange={(e) => setGroqKey(e.target.value)} placeholder="Enter Groq Key..." type={groqKeyVisible ? "text" : "password"} value={groqKey} />
                                        <button className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface" onClick={() => setGroqKeyVisible(!groqKeyVisible)}>
                                            <span className="material-symbols-outlined text-sm">{groqKeyVisible ? "visibility_off" : "visibility"}</span>
                                        </button>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1.5 text-error text-xs font-bold">
                                    <span className="material-symbols-outlined text-sm">error</span>
                                    {groqKeyStatus}
                                </div>
                                <button className="w-full bg-surface border border-outline-variant text-on-surface py-3 rounded-xl text-xs font-bold hover:bg-surface-variant transition-all" onClick={handleSaveGroqKey}>Save Groq Key</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
