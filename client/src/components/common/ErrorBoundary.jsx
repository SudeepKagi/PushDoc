import React from "react";
import { AlertCircle, RefreshCw } from "lucide-react";

export default class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("Uncaught frontend error in React tree:", error, errorInfo);
    }

    handleReload = () => {
        window.location.reload();
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-bg flex flex-col items-center justify-center p-6 text-text-primary">
                    <div className="max-w-md w-full bg-surface border border-border p-6 rounded-[8px] text-center space-y-4 shadow-lg">
                        <div className="h-12 w-12 rounded-full bg-danger/15 text-danger flex items-center justify-center mx-auto">
                            <AlertCircle className="h-6 w-6" />
                        </div>
                        <h2 className="text-lg font-semibold tracking-tight">Something went wrong</h2>
                        <p className="text-xs text-text-secondary">
                            An unexpected rendering error occurred. You can reload the application to restore state.
                        </p>
                        {this.state.error?.message && (
                            <div className="text-left bg-surface-raised p-3 rounded-[4px] border border-border font-mono text-[11px] text-danger/90 overflow-x-auto">
                                {this.state.error.message}
                            </div>
                        )}
                        <button
                            onClick={this.handleReload}
                            className="inline-flex items-center justify-center gap-2 bg-accent text-bg font-medium text-xs px-4 py-2 rounded-[6px] hover:bg-accent/90 transition-colors w-full"
                        >
                            <RefreshCw className="h-3.5 w-3.5" />
                            <span>Reload Application</span>
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
