import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import EmojiPicker from './components/EmojiPicker';
import Home from './pages/Home';
import FrontendProjects from './pages/FrontendProjects';
import BackendProjects from './pages/BackendProjects';
import GameGuides from './pages/GameGuides';
import TopUps from './pages/TopUps';
import Login from './pages/Login';
import AdminLayout from './layouts/AdminLayout';
import AdminHome from './pages/admin/AdminHome';
import AdminGuides from './pages/admin/AdminGuides';
import AdminTopUps from './pages/admin/AdminTopUps';

function App() {
  return (
    <Router>
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Navbar />

        <div style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/frontend" element={<FrontendProjects />} />
            <Route path="/backend" element={<BackendProjects />} />
            <Route path="/game" element={<GameGuides />} />
            <Route path="/topups" element={<TopUps />} />
            <Route path="/login" element={<Login />} />
        
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminHome />} />
          <Route path="guides" element={<AdminGuides />} />
          <Route path="topups" element={<AdminTopUps />} />
        </Route>
          </Routes>
        </div>

        <Footer />
        <EmojiPicker />
      </div>
    </Router>
  );
}

export default App;
