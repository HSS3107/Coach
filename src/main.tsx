import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { DatabaseProvider } from './contexts/DatabaseContext';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Onboarding from './pages/Onboarding';
import './index.css';
import Dashboard from './pages/Dashboard';
import LogEvent from './pages/LogEvent';
import Chat from './pages/Chat';
import AllLogs from './pages/AllLogs';
import Goals from './pages/Goals';
import Profile from './pages/Profile';

// Pages loaded via imports

ReactDOM.createRoot(document.getElementById('root')!).render(
  <DatabaseProvider>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="log" element={<LogEvent />} />
            <Route path="log/:logId/chat" element={<Chat />} />
            <Route path="logs" element={<AllLogs />} />
            <Route path="goals" element={<Goals />} />
            <Route path="profile" element={<Profile />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </DatabaseProvider>
);
