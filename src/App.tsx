import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useEffect } from "react";
import { initializeStore } from "@/lib/store";

import EventTypesPage from "./pages/EventTypesPage";
import AvailabilityPage from "./pages/AvailabilityPage";
import BookingsPage from "./pages/BookingsPage";
import PublicBookingPage from "./pages/PublicBookingPage";
import PublicProfilePage from "./pages/PublicProfilePage";
import SettingsPage from "./pages/SettingsPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import TeamsPage from "./pages/TeamsPage";
import AppsPage from "./pages/AppsPage";
import RoutingPage from "./pages/RoutingPage";
import WorkflowsPage from "./pages/WorkflowsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    initializeStore();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/event-types" replace />} />
            <Route path="/login" element={<Navigate to="/event-types" replace />} />
            <Route path="/signup" element={<Navigate to="/event-types" replace />} />
            <Route path="/forgot-password" element={<Navigate to="/event-types" replace />} />
            <Route path="/event-types" element={<EventTypesPage />} />
            <Route path="/availability" element={<AvailabilityPage />} />
            <Route path="/bookings" element={<BookingsPage />} />
            <Route path="/teams" element={<TeamsPage />} />
            <Route path="/apps" element={<AppsPage />} />
            <Route path="/routing" element={<RoutingPage />} />
            <Route path="/workflows" element={<WorkflowsPage />} />
            <Route path="/book/:slug" element={<PublicBookingPage />} />
            <Route path="/public" element={<PublicProfilePage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
