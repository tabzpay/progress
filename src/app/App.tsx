import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SignIn } from "./screens/SignIn";
import { Onboarding } from "./screens/Onboarding";
import { Dashboard } from "./screens/Dashboard";
import { CreateLoan } from "./screens/CreateLoan";
import { LoanDetail } from "./screens/LoanDetail";
import { AddPayment } from "./screens/AddPayment";
import { Groups } from "./screens/Groups";
import { GroupDetail } from "./screens/GroupDetail";
import { Profile } from "./screens/Profile";
import { EditProfile } from "./screens/EditProfile";
import { DesignSystem } from "./screens/DesignSystem";
import { Landing } from "./screens/Landing";
import { Features } from "./screens/marketing/Features";
import { HowItWorks } from "./screens/marketing/HowItWorks";
import { Pricing } from "./screens/marketing/Pricing";
import { Stories } from "./screens/marketing/Stories";
import { Privacy } from "./screens/marketing/Privacy";
import { Terms } from "./screens/marketing/Terms";
import { Register } from "./screens/Register";
import { ForgotPassword } from "./screens/ForgotPassword";
import About from "./screens/About";
import Contact from "./screens/Contact";
import Blog from "./screens/Blog";
import HelpCenter from "./screens/HelpCenter";
import { MoreUtilities } from "./screens/MoreUtilities";
import { SendNotice } from "./screens/SendNotice";
import { ActivityLog } from "./screens/ActivityLog";
import { Toaster } from "./components/ui/sonner";
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { KeyboardShortcutsProvider } from "./components/KeyboardShortcutsProvider";
import { CommandPalette } from "./components/CommandPalette";
import { HelpModal } from "./components/HelpModal";

export default function App() {
  const [session, setSession] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then((res: { data: { session: any } }) => {
      setSession(res.data.session);
      setIsLoading(false);
    });

    // Listen for changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: string, session: any) => {
      setSession(session);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const isAuthenticated = !!session;

  return (
    <BrowserRouter>
      <KeyboardShortcutsProvider>
        <Routes>
          {/* Marketing Pages */}
          <Route path="/" element={<Landing />} />
          <Route path="/features" element={<Features />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/stories" element={<Stories />} />
          <Route path="/about" element={<About />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/help" element={<HelpCenter />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />

          {/* Auth Routes */}
          <Route path="/sign-in" element={<SignIn />} />
          <Route path="/get-started" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/onboarding" element={<Onboarding />} />

          {/* Main App Routes */}
          {isAuthenticated ? (
            <>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/create-loan" element={<CreateLoan />} />
              <Route path="/loan/:loanId" element={<LoanDetail />} />
              <Route path="/loan/:loanId/add-payment" element={<AddPayment />} />
              <Route path="/groups" element={<Groups />} />
              <Route path="/groups/:groupId" element={<GroupDetail />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/profile/edit" element={<EditProfile />} />
              <Route path="/more" element={<MoreUtilities />} />
              <Route path="/send-notice" element={<SendNotice />} />
              <Route path="/activity-log" element={<ActivityLog />} />
              <Route path="/design-system" element={<DesignSystem />} />
            </>
          ) : (
            <Route path="*" element={<Navigate to="/" replace />} />
          )}

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Toaster />
        <CommandPalette />
        <HelpModal />
      </KeyboardShortcutsProvider>
    </BrowserRouter>
  );
}