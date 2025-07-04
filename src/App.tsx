import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import HomePage from './pages/HomePage';
import TemplateSelectionPage from './pages/TemplateSelectionPage';
import EstimateEditorPage from './pages/EstimateEditorPage';
import EstimateViewPage from './pages/EstimateViewPage';
import CompanySettingsPage from './pages/CompanySettingsPage';
import CustomerListPage from './pages/CustomerListPage';
import AIEstimatePage from './pages/AIEstimatePage';
import LoginPage from './pages/LoginPage';
import { supabase } from './supabaseClient';
import './App.css';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
});

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<any>(undefined);
  React.useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => { listener?.subscription.unsubscribe(); };
  }, []);
  if (user === undefined) return null; // 로딩 중
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <div className="App">
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
            <Route path="/templates" element={<ProtectedRoute><TemplateSelectionPage /></ProtectedRoute>} />
            <Route path="/editor/:templateId?" element={<ProtectedRoute><EstimateEditorPage /></ProtectedRoute>} />
            <Route path="/estimate/:estimateId" element={<ProtectedRoute><EstimateViewPage /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><CompanySettingsPage /></ProtectedRoute>} />
            <Route path="/customers" element={<ProtectedRoute><CustomerListPage /></ProtectedRoute>} />
            <Route path="/ai-estimate" element={<ProtectedRoute><AIEstimatePage /></ProtectedRoute>} />
          </Routes>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
