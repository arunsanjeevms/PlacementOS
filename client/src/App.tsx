import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { ProtectedRoute, PublicOnlyRoute } from "@/components/auth/RouteGuards";
import { LoadingScreen } from "@/components/shared/LoadingScreen";

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
const NotesPage = lazy(() => import("@/pages/NotesPage"));
const ResourcesPage = lazy(() => import("@/pages/ResourcesPage"));
const BookmarksPage = lazy(() => import("@/pages/BookmarksPage"));
const CompaniesPage = lazy(() => import("@/pages/CompaniesPage"));
const InterviewJournalPage = lazy(() => import("@/pages/InterviewJournalPage"));
const MockInterviewsPage = lazy(() => import("@/pages/MockInterviewsPage"));
const CalendarPage = lazy(() => import("@/pages/CalendarPage"));
const HeatmapPage = lazy(() => import("@/pages/HeatmapPage"));
const StatisticsPage = lazy(() => import("@/pages/StatisticsPage"));
const AchievementsPage = lazy(() => import("@/pages/AchievementsPage"));
const ProfilePage = lazy(() => import("@/pages/ProfilePage"));
const SettingsPage = lazy(() => import("@/pages/SettingsPage"));
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
            <Route path="calendar" element={<CalendarPage />} />
            <Route path="pomodoro" element={<PomodoroPage />} />
            <Route path="java" element={<JavaTrackerPage />} />
            <Route path="dsa" element={<DsaTrackerPage />} />
            <Route path="aptitude" element={<AptitudeTrackerPage />} />
            <Route path="projects" element={<ProjectsPage />} />
            <Route path="journal" element={<InterviewJournalPage />} />
            <Route path="mocks" element={<MockInterviewsPage />} />
            <Route path="companies" element={<CompaniesPage />} />
            <Route path="resources" element={<ResourcesPage />} />
            <Route path="notes" element={<NotesPage />} />
            <Route path="bookmarks" element={<BookmarksPage />} />
            <Route path="heatmap" element={<HeatmapPage />} />
            <Route path="stats" element={<StatisticsPage />} />
            <Route path="achievements" element={<AchievementsPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}
