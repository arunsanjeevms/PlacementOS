import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { ProtectedRoute, PublicOnlyRoute } from "@/components/auth/RouteGuards";
import { LoadingScreen } from "@/components/shared/LoadingScreen";
import { ModulePlaceholder } from "@/pages/ModulePlaceholder";

// Auth pages
const LoginPage = lazy(() => import("@/pages/auth/LoginPage"));
const RegisterPage = lazy(() => import("@/pages/auth/RegisterPage"));
const ForgotPasswordPage = lazy(() => import("@/pages/auth/ForgotPasswordPage"));
const ResetPasswordPage = lazy(() => import("@/pages/auth/ResetPasswordPage"));
const VerifyEmailPage = lazy(() => import("@/pages/auth/VerifyEmailPage"));

// App pages
const DashboardPage = lazy(() => import("@/pages/DashboardPage"));
const TodayPage = lazy(() => import("@/pages/TodayPage"));
const TasksPage = lazy(() => import("@/pages/TasksPage"));
const WeeklyPlannerPage = lazy(() => import("@/pages/WeeklyPlannerPage"));
const MonthlyPlannerPage = lazy(() => import("@/pages/MonthlyPlannerPage"));
const PomodoroPage = lazy(() => import("@/pages/PomodoroPage"));
const JavaTrackerPage = lazy(() => import("@/pages/JavaTrackerPage"));
const DsaTrackerPage = lazy(() => import("@/pages/DsaTrackerPage"));
const AptitudeTrackerPage = lazy(() => import("@/pages/AptitudeTrackerPage"));
const ProjectsPage = lazy(() => import("@/pages/ProjectsPage"));
const NotFoundPage = lazy(() => import("@/pages/NotFoundPage"));

export default function App() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <Routes>
        <Route path="/" element={<Navigate to="/app" replace />} />

        {/* Public auth routes */}
        <Route element={<PublicOnlyRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        </Route>
        {/* Reset + verify work whether or not authenticated */}
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />

        {/* Protected app shell */}
        <Route element={<ProtectedRoute />}>
          <Route path="/app" element={<AppLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="today" element={<TodayPage />} />
            <Route path="tasks" element={<TasksPage />} />
            <Route path="weekly" element={<WeeklyPlannerPage />} />
            <Route path="monthly" element={<MonthlyPlannerPage />} />
            <Route path="calendar" element={<ModulePlaceholder title="Calendar" />} />
            <Route path="pomodoro" element={<PomodoroPage />} />
            <Route path="java" element={<JavaTrackerPage />} />
            <Route path="dsa" element={<DsaTrackerPage />} />
            <Route path="aptitude" element={<AptitudeTrackerPage />} />
            <Route path="projects" element={<ProjectsPage />} />
            <Route path="journal" element={<ModulePlaceholder title="Interview Journal" />} />
            <Route path="mocks" element={<ModulePlaceholder title="Mock Interviews" />} />
            <Route path="companies" element={<ModulePlaceholder title="Company Tracker" />} />
            <Route path="resources" element={<ModulePlaceholder title="Resources" />} />
            <Route path="notes" element={<ModulePlaceholder title="Notes" />} />
            <Route path="bookmarks" element={<ModulePlaceholder title="Bookmarks" />} />
            <Route path="heatmap" element={<ModulePlaceholder title="Heatmap" />} />
            <Route path="stats" element={<ModulePlaceholder title="Statistics" />} />
            <Route path="achievements" element={<ModulePlaceholder title="Achievements" />} />
            <Route path="profile" element={<ModulePlaceholder title="Profile" />} />
            <Route path="settings" element={<ModulePlaceholder title="Settings" />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}
