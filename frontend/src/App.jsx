import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Toaster } from '@/components/ui/sonner';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Login from './pages/Login';
import Register from './pages/Register';
import Events from './pages/Events';
import EventDetail from './pages/EventDetail';
import './App.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen flex flex-col bg-background text-foreground">
          <Navbar />
          <Routes>
            <Route path="/" element={<Events />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/events/:id" element={<EventDetail />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
          <Footer />
          <Toaster position="top-right" />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
