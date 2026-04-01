import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import EmojiPicker from './components/EmojiPicker';
import Home from './pages/Home';
import FrontendProjects from './pages/FrontendProjects';
import BackendProjects from './pages/BackendProjects';

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
          </Routes>
        </div>

        <Footer />
        <EmojiPicker />
        <Analytics />
      </div>
    </Router>
  );
}

export default App;
