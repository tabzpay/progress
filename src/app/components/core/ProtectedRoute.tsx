import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../../lib/contexts/AuthContext";

export function ProtectedRoute() {
    const { session, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!session) {
        // Redirect to sign-in but save the location they were trying to go to
        return <Navigate to="/sign-in" state={{ from: location }} replace />;
    }

    return <Outlet />;
}
