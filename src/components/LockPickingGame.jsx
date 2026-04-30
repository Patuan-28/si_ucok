import React, { useRef, useEffect, useState, useCallback } from 'react';
import './LockPickingGame.css';

const TOTAL_PINS = 8;
const HIT_MARGIN = 22;

function getRandomAngle() {
  return Math.floor(Math.random() * 360);
}

export default function LockPickingGame() {
  const [gameState, setGameState] = useState('playing');
  const [pinsLeft, setPinsLeft] = useState(TOTAL_PINS);
  const [targetAngle, setTargetAngle] = useState(getRandomAngle);
  const [hitFlash, setHitFlash] = useState(false);
  const [missShake, setMissShake] = useState(false);
  const [speedLevel, setSpeedLevel] = useState(1);
  const [pinHistory, setPinHistory] = useState([]);

  const pointerAngleRef = useRef(0);
  const directionRef = useRef(1);
  const rafRef = useRef(null);
  const canvasRef = useRef(null);
  const lastTimeRef = useRef(null);
  const gameStateRef = useRef('playing');

  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  const drawLock = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width;
    const H = canvas.height;
    const cx = W / 2;
    const cy = H / 2;
    const R = W * 0.38;
    const pointerAngle = pointerAngleRef.current;

    ctx.clearRect(0, 0, W, H);

    // --- Outer ring glow ---
    const grad = ctx.createRadialGradient(cx, cy, R - 4, cx, cy, R + 12);
    grad.addColorStop(0, 'rgba(124,58,237,0.5)');
    grad.addColorStop(1, 'rgba(124,58,237,0)');
    ctx.beginPath();
    ctx.arc(cx, cy, R + 6, 0, Math.PI * 2);
    ctx.strokeStyle = grad;
    ctx.lineWidth = 14;
    ctx.stroke();

    // --- Outer ring ---
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(200,200,220,0.25)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // --- Target arc (sweet spot) ---
    const tRad = (targetAngle - 90) * (Math.PI / 180);
    const margin = HIT_MARGIN * (Math.PI / 180);
    ctx.beginPath();
    ctx.arc(cx, cy, R, tRad - margin, tRad + margin);
    ctx.strokeStyle = 'rgba(46,204,113,0.9)';
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.stroke();

    // --- Target dot ---
    const tx = cx + R * Math.cos(tRad);
    const ty = cy + R * Math.sin(tRad);
    const pulse = 0.5 + 0.5 * Math.sin(Date.now() / 300);
    ctx.beginPath();
    ctx.arc(tx, ty, 8 + pulse * 4, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(46,204,113,${0.5 + 0.5 * pulse})`;
    ctx.fill();
    ctx.beginPath();
    ctx.arc(tx, ty, 7, 0, Math.PI * 2);
    ctx.fillStyle = '#2ecc71';
    ctx.fill();

    // --- Pin history dots ---
    pinHistory.forEach(angle => {
      const pr = (angle - 90) * (Math.PI / 180);
      const px = cx + (R - 18) * Math.cos(pr);
      const py = cy + (R - 18) * Math.sin(pr);
      ctx.beginPath();
      ctx.arc(px, py, 5, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(46,204,113,0.7)';
      ctx.fill();
    });

    // --- Inner circle ---
    ctx.beginPath();
    ctx.arc(cx, cy, R * 0.45, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(200,200,220,0.15)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // --- Spinning pointer ---
    const pRad = (pointerAngle - 90) * (Math.PI / 180);
    const pInner = R * 0.12;
    const pOuter = R * 0.92;
    const px1 = cx + pInner * Math.cos(pRad);
    const py1 = cy + pInner * Math.sin(pRad);
    const px2 = cx + pOuter * Math.cos(pRad);
    const py2 = cy + pOuter * Math.sin(pRad);

    // Pointer glow trail
    ctx.beginPath();
    ctx.moveTo(px1, py1);
    ctx.lineTo(px2, py2);
    ctx.strokeStyle = 'rgba(124,58,237,0.4)';
    ctx.lineWidth = 8;
    ctx.lineCap = 'round';
    ctx.stroke();

    // Pointer line
    ctx.beginPath();
    ctx.moveTo(px1, py1);
    ctx.lineTo(px2, py2);
    ctx.strokeStyle = '#a78bfa';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Pointer tip dot
    ctx.beginPath();
    ctx.arc(px2, py2, 5, 0, Math.PI * 2);
    ctx.fillStyle = '#7c3aed';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(px2, py2, 3, 0, Math.PI * 2);
    ctx.fillStyle = '#c4b5fd';
    ctx.fill();

    // Center hub
    ctx.beginPath();
    ctx.arc(cx, cy, 10, 0, Math.PI * 2);
    ctx.fillStyle = '#1e1b4b';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx, cy, 6, 0, Math.PI * 2);
    ctx.fillStyle = '#7c3aed';
    ctx.fill();

  }, [targetAngle, pinHistory]);

  // Animation loop
  useEffect(() => {
    if (gameState !== 'playing') return;
    lastTimeRef.current = null;

    const baseSpeed = 2 + speedLevel * 0.55;

    const loop = (timestamp) => {
      if (!lastTimeRef.current) lastTimeRef.current = timestamp;
      const delta = timestamp - lastTimeRef.current;
      lastTimeRef.current = timestamp;

      pointerAngleRef.current = (pointerAngleRef.current + directionRef.current * baseSpeed * (delta / 16)) % 360;
      if (pointerAngleRef.current < 0) pointerAngleRef.current += 360;

      drawLock();
      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [gameState, speedLevel, drawLock]);

  // Redraw when state changes (for win/lose)
  useEffect(() => {
    if (gameState !== 'playing') drawLock();
  }, [gameState, drawLock]);

  const handleClick = useCallback(() => {
    if (gameState !== 'playing') return;

    const current = ((pointerAngleRef.current % 360) + 360) % 360;
    const target = ((targetAngle % 360) + 360) % 360;

    let diff = Math.abs(current - target);
    if (diff > 180) diff = 360 - diff;

    if (diff <= HIT_MARGIN) {
      // HIT
      setHitFlash(true);
      setTimeout(() => setHitFlash(false), 300);

      const newPinsLeft = pinsLeft - 1;
      setPinHistory(prev => [...prev, targetAngle]);

      if (newPinsLeft <= 0) {
        setGameState('win');
        cancelAnimationFrame(rafRef.current);
      } else {
        const newTarget = getRandomAngle();
        setPinsLeft(newPinsLeft);
        setTargetAngle(newTarget);
        setSpeedLevel(prev => prev + 1);
        // Reverse direction on each pin for tension
        directionRef.current *= -1;
      }
    } else {
      // MISS
      setMissShake(true);
      setTimeout(() => setMissShake(false), 500);
      setGameState('lose');
      cancelAnimationFrame(rafRef.current);
    }
  }, [gameState, pinsLeft, targetAngle]);

  const handleRestart = useCallback(() => {
    pointerAngleRef.current = 0;
    directionRef.current = 1;
    setPinsLeft(TOTAL_PINS);
    setTargetAngle(getRandomAngle());
    setSpeedLevel(1);
    setPinHistory([]);
    setGameState('playing');
  }, []);

  return (
    <div className="lp-wrapper">
      <h1 className="lp-title">Lock Picking</h1>
      <p className="lp-subtitle">
        {gameState === 'playing' && `Pin ${TOTAL_PINS - pinsLeft + 1} of ${TOTAL_PINS} — Click when the pointer hits the green zone`}
        {gameState === 'win' && 'Lock cracked. You\'re in.'}
        {gameState === 'lose' && 'Too slow. Lock jammed.'}
      </p>

      <div className={`lp-canvas-wrap ${hitFlash ? 'lp-hit' : ''} ${missShake ? 'lp-miss' : ''}`}
        onClick={handleClick}
        style={{ cursor: gameState === 'playing' ? 'pointer' : 'default' }}
      >
        <canvas ref={canvasRef} width={320} height={320} className="lp-canvas" />

        {/* Pin indicators */}
        <div className="lp-pins">
          {Array.from({ length: TOTAL_PINS }).map((_, i) => (
            <div
              key={i}
              className={`lp-pin ${i < (TOTAL_PINS - pinsLeft) ? 'lp-pin-done' : ''}`}
            />
          ))}
        </div>
      </div>

      {gameState === 'win' && (
        <div className="lp-result lp-result-win">
          <div className="lp-result-icon">🔓</div>
          <h2>Access Granted</h2>
          <p>You picked the lock in {TOTAL_PINS} pins.</p>
          <button className="btn btn-primary lp-btn" onClick={handleRestart}>Play Again</button>
        </div>
      )}

      {gameState === 'lose' && (
        <div className="lp-result lp-result-lose">
          <div className="lp-result-icon">🔒</div>
          <h2>Alarm Triggered</h2>
          <p>The lock detected tampering.</p>
          <button className="btn btn-outline lp-btn" onClick={handleRestart}>Try Again</button>
        </div>
      )}

      {gameState === 'playing' && (
        <p className="lp-hint">
          Speed increases with each pin. Stay sharp.
        </p>
      )}
    </div>
  );
}
