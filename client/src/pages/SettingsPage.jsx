import React from "react";
import Button from "../components/ui/Button";

export default function SettingsPage({
    selectedRepo,
    repos,
    openDetails,
    webhookSecretVisible,
    setWebhookSecretVisible,
    settingsBranch,
    setSettingsBranch,
    settingsPath,
    setSettingsPath,
    preferences,
    setPreferences,
    hasUnsavedSettings,
    setHasUnsavedSettings,
    handlePreferenceToggle,
    saveConfigurations,
    copyToClipboard
}) {
    return (
        <div className="space-y-10 animate-fade">
            <header>
                <div className="flex items-center gap-3 mb-2">
                    <span className="material-symbols-outlined text-primary text-3xl">settings</span>
                    <h1 className="font-headline text-3xl font-black">Repository Settings</h1>
                </div>
                {selectedRepo ? (
                    <div className="flex items-center gap-2 px-4 py-2 bg-surface-container-low rounded-full w-fit border border-outline-variant/30 text-xs font-bold text-on-surface-variant">
                        <span className="material-symbols-outlined text-sm">terminal</span>
                        {selectedRepo.fullName}
                    </div>
                ) : (
                    <div className="text-sm text-outline">Select a repository below to configure settings</div>
                )}
            </header>

            {/* Repository Selector Dropdown if multiple repos exist */}
            {repos.length > 0 && (
                <div className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-outline-variant/20 max-w-md shadow-sm">
                    <span className="text-sm font-bold text-on-surface-variant">Active Repository:</span>
                    <select
                        className="bg-surface-container-low border-outline-variant/30 rounded-xl px-4 py-2 text-sm font-bold focus:ring-primary focus:border-primary flex-1"
                        onChange={(e) => {
                            const r = repos.find((repo) => repo._id === e.target.value);
                            if (r) openDetails(r);
                        }}
                        value={selectedRepo?._id || ""}
                    >
                        {repos.map((r) => (
                            <option key={r._id} value={r._id}>{r.fullName}</option>
                        ))}
                    </select>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Webhook Card */}
                <section className="lg:col-span-7 bg-white rounded-3xl p-8 shadow-sm border border-outline-variant/10 flex flex-col justify-between gap-6">
                    <div className="space-y-6">
                        <div className="flex items-center gap-4 mb-2">
                            <div className="p-3 bg-primary-container/10 rounded-xl text-primary-container">
                                <span className="material-symbols-outlined">webhook</span>
                            </div>
                            <h2 className="font-headline text-xl font-bold">Webhook Integration Details</h2>
                        </div>
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-on-surface-variant ml-1">Payload URL</label>
                                <div className="flex items-center bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-3">
                                    <input className="bg-transparent border-none focus:ring-0 w-full text-sm font-mono text-on-surface outline-none" readOnly type="text" value="http://api.pushdoc.io/webhooks/github" />
                                    <button className="text-outline hover:text-primary transition-colors" onClick={() => copyToClipboard("http://api.pushdoc.io/webhooks/github")}>
                                        <span className="material-symbols-outlined text-sm">content_copy</span>
                                    </button>
                                </div>
                                <p className="text-[11px] text-outline ml-1 font-semibold">Events will be sent to this endpoint from GitHub.</p>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-on-surface-variant ml-1">Webhook Secret</label>
                                <div className="flex items-center bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-3">
                                    <input className="bg-transparent border-none focus:ring-0 w-full text-sm text-on-surface outline-none" type={webhookSecretVisible ? "text" : "password"} defaultValue="secret_token_1234567890" />
                                    <button className="text-outline hover:text-primary transition-colors" onClick={() => setWebhookSecretVisible(!webhookSecretVisible)}>
                                        <span className="material-symbols-outlined text-sm">{webhookSecretVisible ? "visibility_off" : "visibility"}</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <button className="flex items-center gap-2 border border-outline-variant px-6 py-3 rounded-full text-xs font-bold text-on-surface-variant hover:bg-surface-container-high transition-colors w-fit" onClick={() => alert("Secret regenerated successfully!")}>
                        <span className="material-symbols-outlined text-base">refresh</span>
                        Regenerate Webhook Secret
                    </button>
                </section>

                {/* Target Path Card */}
                <section className="lg:col-span-5 bg-white rounded-3xl p-8 shadow-sm border border-outline-variant/10 flex flex-col justify-between gap-6">
                    <div className="space-y-6">
                        <div className="flex items-center gap-4 mb-2">
                            <div className="p-3 bg-secondary-container/20 rounded-xl text-secondary">
                                <span className="material-symbols-outlined">account_tree</span>
                            </div>
                            <h2 className="font-headline text-xl font-bold">Target &amp; Path</h2>
                        </div>
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-on-surface-variant ml-1">Analysis Branch</label>
                                <div className="relative">
                                    <input className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-3 focus:border-primary-container focus:ring-2 focus:ring-primary-container/10 transition-all font-mono text-sm" onChange={(e) => { setSettingsBranch(e.target.value); setHasUnsavedSettings(true); }} type="text" value={settingsBranch} />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-outline-variant material-symbols-outlined text-sm">edit</span>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-on-surface-variant ml-1">Documentation Output Path</label>
                                <div className="relative">
                                    <input className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-3 focus:border-primary-container focus:ring-2 focus:ring-primary-container/10 transition-all font-mono text-sm" onChange={(e) => { setSettingsPath(e.target.value); setHasUnsavedSettings(true); }} type="text" value={settingsPath} />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-outline-variant material-symbols-outlined text-sm">description</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="w-full h-28 rounded-2xl bg-surface-container overflow-hidden relative border border-outline-variant/10 flex flex-col justify-center px-6">
                        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "radial-gradient(circle at 2px 2px, #004ac6 1px, transparent 0)", backgroundSize: "24px 24px" }}></div>
                        <p className="text-[10px] text-outline font-bold uppercase tracking-widest mb-1">Preview Output Configuration</p>
                        <p className="text-xs text-on-surface-variant leading-relaxed font-semibold">Changes to <code className="bg-white/80 px-1 rounded font-bold">{settingsBranch}</code> will automatically update <code className="bg-white/80 px-1 rounded font-bold">{settingsPath}</code>.</p>
                    </div>
                </section>

                {/* Analysis preferences */}
                <section className="lg:col-span-12 bg-white rounded-3xl p-8 shadow-sm border border-outline-variant/10">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 border-b border-outline-variant/10 pb-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-tertiary-fixed/30 rounded-xl text-tertiary">
                                <span className="material-symbols-outlined">psychology</span>
                            </div>
                            <div>
                                <h2 className="font-headline text-xl font-bold">Analysis Preferences</h2>
                                <p className="text-xs text-on-surface-variant font-semibold mt-1">Toggle components to include in the AI generation process.</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 bg-surface-container-low p-2 rounded-2xl border border-outline-variant/20">
                            <span className="text-xs font-bold text-on-surface-variant ml-2">Output Profile:</span>
                            <select className="bg-white border-outline-variant/30 rounded-xl px-4 py-2 text-xs font-bold focus:ring-primary focus:border-primary outline-none">
                                <option>Minimalist</option>
                                <option selected>Standard Developer</option>
                                <option>Exhaustive</option>
                            </select>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <label className="flex items-center justify-between p-6 rounded-2xl border border-outline-variant/20 hover:bg-surface-container-low transition-all cursor-pointer group">
                            <div className="flex flex-col">
                                <span className="font-bold text-sm text-on-surface">Route Analyzer</span>
                                <span className="text-xs text-outline font-medium mt-1">Parses Express/Fastify endpoint definitions.</span>
                            </div>
                            <input checked={preferences.routeAnalyzer} className="rounded border-outline-variant/50 text-primary focus:ring-primary w-5 h-5 cursor-pointer" onChange={() => handlePreferenceToggle("routeAnalyzer")} type="checkbox" />
                        </label>
                        <label className="flex items-center justify-between p-6 rounded-2xl border border-outline-variant/20 hover:bg-surface-container-low transition-all cursor-pointer group">
                            <div className="flex flex-col">
                                <span className="font-bold text-sm text-on-surface">Model Analyzer</span>
                                <span className="text-xs text-outline font-medium mt-1">Explains Prisma/Mongoose schemas.</span>
                            </div>
                            <input checked={preferences.modelAnalyzer} className="rounded border-outline-variant/50 text-primary focus:ring-primary w-5 h-5 cursor-pointer" onChange={() => handlePreferenceToggle("modelAnalyzer")} type="checkbox" />
                        </label>
                        <label className="flex items-center justify-between p-6 rounded-2xl border border-outline-variant/20 hover:bg-surface-container-low transition-all cursor-pointer group">
                            <div className="flex flex-col">
                                <span className="font-bold text-sm text-on-surface">Controller Analyzer</span>
                                <span className="text-xs text-outline font-medium mt-1">Summarizes business logic in handlers.</span>
                            </div>
                            <input checked={preferences.controllerAnalyzer} className="rounded border-outline-variant/50 text-primary focus:ring-primary w-5 h-5 cursor-pointer" onChange={() => handlePreferenceToggle("controllerAnalyzer")} type="checkbox" />
                        </label>
                    </div>
                </section>
            </div>

            {/* Sticky Action Bar for Unsaved Changes */}
            {hasUnsavedSettings && (
                <div className="fixed bottom-10 left-1/2 -translate-x-1/2 w-[90%] max-w-4xl bg-on-background shadow-2xl rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-4 z-50 animate-fade">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-secondary-fixed animate-pulse"></div>
                        <p className="text-surface-container-low text-xs font-semibold">Unsaved changes detected in analysis preferences.</p>
                    </div>
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <button className="flex-1 md:flex-initial px-6 py-2.5 rounded-2xl text-xs font-bold text-error bg-error-container hover:bg-error-container/80 transition-colors" onClick={() => { setPreferences({ routeAnalyzer: true, modelAnalyzer: true, controllerAnalyzer: false }); setHasUnsavedSettings(false); }}>
                            Reset
                        </button>
                        <button className="flex-1 md:flex-initial px-8 py-2.5 rounded-2xl text-xs font-bold text-on-primary bg-primary-container hover:bg-primary transition-all shadow-[0_4px_15px_rgba(37,99,235,0.3)] text-white" onClick={saveConfigurations}>
                            Save Configurations
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
