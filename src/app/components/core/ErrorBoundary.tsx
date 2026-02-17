import React, { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from "../ui/button";

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
    onReset?: () => void;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: React.ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
        };
    }

    static getDerivedStateFromError(error: Error): State {
        return {
            hasError: true,
            error,
            errorInfo: null,
        };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        // Log error to console in development
        console.error('Error Boundary caught an error:', error, errorInfo);

        // TODO: Log to error monitoring service (Sentry, etc.)
        // logErrorToService(error, errorInfo);

        this.setState({
            error,
            errorInfo,
        });
    }

    handleReset = () => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null,
        });
        this.props.onReset?.();
    };

    render() {
        if (this.state.hasError) {
            // Custom fallback if provided
            if (this.props.fallback) {
                return this.props.fallback;
            }

            // Default error UI
            return (
                <div className="min-h-screen bg-background flex items-center justify-center p-6">
                    <div className="bg-card border border-destructive/20 rounded-3xl p-12 max-w-2xl w-full text-center shadow-xl">
                        <div className="w-20 h-20 bg-destructive/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <AlertTriangle className="w-10 h-10 text-destructive" />
                        </div>

                        <h1 className="text-3xl font-black text-foreground mb-3">
                            Oops! Something went wrong
                        </h1>

                        <p className="text-muted-foreground mb-8 text-lg">
                            We encountered an unexpected error. Don't worry, your data is safe.
                        </p>

                        {/* Error details (only in development) */}
                        {process.env.NODE_ENV === 'development' && this.state.error && (
                            <div className="bg-muted/50 rounded-2xl p-6 mb-8 text-left">
                                <h3 className="font-bold text-sm text-destructive mb-2">
                                    Error Details (Development Only):
                                </h3>
                                <pre className="text-xs text-muted-foreground overflow-auto max-h-40 font-mono">
                                    {this.state.error.toString()}
                                    {this.state.errorInfo?.componentStack}
                                </pre>
                            </div>
                        )}

                        <div className="flex gap-4 justify-center">
                            <Button
                                onClick={this.handleReset}
                                className="h-12 px-8 rounded-2xl font-bold"
                                size="lg"
                            >
                                <RefreshCw className="w-5 h-5 mr-2" />
                                Try Again
                            </Button>
                            <Button
                                onClick={() => window.location.href = '/dashboard'}
                                variant="outline"
                                className="h-12 px-8 rounded-2xl font-bold"
                                size="lg"
                            >
                                <Home className="w-5 h-5 mr-2" />
                                Go Home
                            </Button>
                        </div>

                        <p className="text-xs text-muted-foreground mt-8">
                            If this problem persists, please contact support
                        </p>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

// Convenience wrapper for functional components
export function withErrorBoundary<P extends object>(
    Component: React.ComponentType<P>,
    errorBoundaryProps?: Omit<Props, 'children'>
) {
    return function WithErrorBoundaryWrapper(props: P) {
        return (
            <ErrorBoundary {...errorBoundaryProps}>
                <Component {...props} />
            </ErrorBoundary>
        );
    };
}
