import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { BottomNav } from "./components/BottomNav.tsx";
import { ErrorBoundary } from "./components/ErrorBoundary.tsx";
import { ExerciseViewProvider } from "./components/ExerciseView.tsx";
import { ModalProvider } from "./components/Modals.tsx";
import { CalendarPage } from "./pages/CalendarPage.tsx";
import { ClassesPage } from "./pages/ClassesPage.tsx";
import { MealsPage } from "./pages/MealsPage.tsx";
import { TrainingPage } from "./pages/TrainingPage.tsx";
import { WeekPage } from "./pages/WeekPage.tsx";

function pageKey(pathname: string): string {
  if (pathname.startsWith("/clases")) return "clases";
  if (pathname.startsWith("/semana")) return "semana";
  if (pathname.startsWith("/entreno")) return "entreno";
  if (pathname.startsWith("/comidas")) return "comidas";
  return "cal";
}

function Frame() {
  const { pathname } = useLocation();
  return (
    <div data-page={pageKey(pathname)} className="page-root">
      <div className="mx-auto min-h-dvh w-full max-w-6xl px-4 pb-32 pt-5 sm:px-6">
        <Routes>
          <Route path="/" element={<CalendarPage />} />
          <Route path="/clases" element={<ClassesPage />} />
          <Route path="/semana" element={<WeekPage />} />
          <Route path="/entreno" element={<TrainingPage />} />
          <Route path="/comidas" element={<MealsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
      <BottomNav />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <ExerciseViewProvider>
          <ModalProvider>
            <Frame />
          </ModalProvider>
        </ExerciseViewProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
