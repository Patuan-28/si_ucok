import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { SpeedInsights } from '@vercel/speed-insights/react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Stuffs from './pages/Stuffs';
import BattleGamePage from './pages/BattleGamePage';
import ChessGamePage from './pages/ChessGamePage';
import PrimeCheckerPage from './pages/PrimeCheckerPage';
import Contact from './pages/Contact';

function App() {
  return (
    <Router>
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Navbar />

        <div style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/stuffs" element={<Stuffs />} />
            <Route path="/stuffs/battle" element={<BattleGamePage />} />
            <Route path="/stuffs/chess" element={<ChessGamePage />} />
            <Route path="/stuffs/prime-checker" element={<PrimeCheckerPage />} />
            <Route path="/contact" element={<Contact />} />
          </Routes>
        </div>

        <Footer />
        <SpeedInsights />
      </div>
    </Router>
  );
}

export default App;
