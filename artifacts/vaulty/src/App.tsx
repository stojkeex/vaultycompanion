import { Switch, Route, Redirect, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import ScrollToTop from "@/components/scroll-to-top";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Ai from "@/pages/ai";
import Premium from "@/pages/premium";
import Login from "@/pages/login";
import Register from "@/pages/register";
import Chat from "@/pages/chat";
import RecentChats from "@/pages/recent-chats";
import EditProfile from "@/pages/edit-profile";
import Settings from "@/pages/settings";
import Support from "@/pages/support"; 
import Quests from "@/pages/quests"; 
import Academy from "@/pages/academy"; 
import Article from "@/pages/article"; 
import NewsPage from "@/pages/news";
import NewsDetail from "@/pages/news-detail";
import ChatUserInfo from "@/pages/chat-user-info";
import CompanionPreview from "@/pages/companion-preview";
import CompanionChat from "@/pages/companion-chat";
import LiveStream from "@/pages/live";
import CreateCompanion from "@/pages/create-companion";

import { AuthProvider, useAuth } from "@/contexts/auth-context";
import { NotificationProvider } from "@/contexts/notification-context";
import { CurrencyProvider } from "@/contexts/currency-context";
import { PremiumProvider } from "@/contexts/premium-context";
import { FeedProvider } from "@/contexts/feed-context";
import { CallProvider } from "@/contexts/call-context";
import { BottomNav } from "@/components/bottom-nav";
import { IncomingCallModal } from "@/components/incoming-call-modal";
import { ActiveCallModal } from "@/components/active-call-modal";

import { LoadingScreen } from "@/components/loading-screen";
import { useState, useEffect } from "react";
import { FloatingAdminButton } from "@/components/admin/floating-admin-button";
import { RatingProvider } from "@/components/rating-provider";
import { ThemeProvider, useTheme } from "@/contexts/theme-context";

import TOSPage from "@/pages/tos";
import Landing from "@/pages/landing";

// Protected Route Component
function ProtectedRoute({ component: Component, hideNav = false }: { component: React.ComponentType, hideNav?: boolean }) {
  const { user, loading } = useAuth();
  const [location] = useLocation();
  
  if (loading) return null; 
  
  // SuperAdmin protection
  if (location === "/superadmin" && user?.email !== "sezunmaj@gmail.com") {
    return <Redirect to="/404" />;
  }
  
  if (!user) return <Redirect to="/login" />;
  
  return <Component />;
}

import CreateProfile from "@/pages/create-profile";
function Router() {
  const { theme } = useTheme();
  return (
    <div className={`relative min-h-screen ${theme === 'dark' ? 'dark' : 'light'}`}>
      <Switch>
        <Route path="/login" component={Login} />
        <Route path="/register" component={Register} />
        <Route path="/create-profile" component={() => <ProtectedRoute component={CreateProfile} hideNav={true} />} />
        <Route path="/" component={Landing} />
        
        {/* Home is now using the new Home component with correct design */}
        <Route path="/home" component={() => <ProtectedRoute component={Home} />} />
        {/* Support old route but redirect to home */}
        <Route path="/home/:tab" component={() => <Redirect to="/home" />} />

        <Route path="/news" component={() => <ProtectedRoute component={NewsPage} />} />
        <Route path="/news/:slug" component={() => <ProtectedRoute component={NewsDetail} />} />
        
        <Route path="/tos" component={() => <ProtectedRoute component={TOSPage} hideNav={true} />} />

        {/* Hide Nav for AI page as requested */}
        <Route path="/tools" component={() => <ProtectedRoute component={Ai} hideNav={true} />} />
        <Route path="/ai" component={() => <ProtectedRoute component={Ai} hideNav={true} />} />
        
        <Route path="/premium" component={() => <ProtectedRoute component={Premium} />} />
        
        <Route path="/companion/:id" component={() => <ProtectedRoute component={CompanionPreview} />} />
        <Route path="/create-companion" component={() => <ProtectedRoute component={CreateCompanion} />} />
        <Route path="/live" component={() => <ProtectedRoute component={LiveStream} hideNav={true} />} />
        <Route path="/messages/:id" component={() => <ProtectedRoute component={CompanionChat} hideNav={true} />} />
        <Route path="/messages/user/:id" component={() => <ProtectedRoute component={Chat} hideNav={true} />} />

        <Route path="/edit-profile" component={() => <ProtectedRoute component={EditProfile} />} />
        <Route path="/settings" component={() => <ProtectedRoute component={Settings} />} />
        <Route path="/support" component={() => <ProtectedRoute component={Support} />} />
        <Route path="/quests" component={() => <ProtectedRoute component={Quests} />} />
        <Route path="/academy" component={() => <ProtectedRoute component={Academy} />} /> 
        <Route path="/academy/:slug" component={() => <ProtectedRoute component={Article} />} /> 
        <Route component={NotFound} />
      </Switch>
    </div>
  );
}

import { ChristmasOfferModal } from "@/components/christmas-offer-modal";
import { PremiumThanksProvider } from "@/components/premium-thanks-modal";

function AppInner() {
  const [showSplash, setShowSplash] = useState(true);
  const [location] = useLocation();
  const isLanding = location === "/";

  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'IMG') e.preventDefault();
    };
    const handleDragStart = (e: DragEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'IMG') e.preventDefault();
    };
    document.addEventListener('contextmenu', handleContextMenu, true);
    document.addEventListener('dragstart', handleDragStart, true);
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu, true);
      document.removeEventListener('dragstart', handleDragStart, true);
    };
  }, []);

  return (
    <>
      {showSplash && <LoadingScreen onComplete={() => setShowSplash(false)} />}
      {!showSplash && (
        <>
          <ScrollToTop />
          <ChristmasOfferModal />
          <Router />
          {!isLanding && <BottomNav />}
          <Toaster />
        </>
      )}
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <PremiumProvider>
            <PremiumThanksProvider>
              <CurrencyProvider>
                <NotificationProvider>
                  <FeedProvider>
                    <TooltipProvider>
                      <RatingProvider>
                        <AppInner />
                      </RatingProvider>
                    </TooltipProvider>
                  </FeedProvider>
                </NotificationProvider>
              </CurrencyProvider>
            </PremiumThanksProvider>
          </PremiumProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
