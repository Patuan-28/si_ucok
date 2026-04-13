import React, { useState, useEffect, useRef, useCallback } from 'react';
import './BattleGame.css';

// ─── Static Game Data ────────────────────────────────────────────────────────
const PLAYER_STATS = {
  name: 'Hero',
  emoji: '🧙‍♂️',
  maxHp: 120,
  attack: 18,
  defense: 5,
  critChance: 0.2,     // 20% crit
  missChance: 0.12,    // 12% miss
};

const ENEMIES = [
  { name: 'Goblin', emoji: '👺', maxHp: 80,  attack: 12, defense: 2, critChance: 0.1, missChance: 0.18, reward: 'You vanquished the Goblin!' },
  { name: 'Orc',    emoji: '👹', maxHp: 110, attack: 16, defense: 4, critChance: 0.15, missChance: 0.12, reward: 'The Orc falls before you!' },
  { name: 'Dragon', emoji: '🐉', maxHp: 180, attack: 25, defense: 8, critChance: 0.25, missChance: 0.08, reward: 'The Dragon is defeated — glory is yours!' },
];

// ─── Utility ─────────────────────────────────────────────────────────────────
function calcDamage(attacker, defender) {
  const isMiss = Math.random() < attacker.missChance;
  if (isMiss) return { dmg: 0, isMiss: true, isCrit: false };
  const isCrit = Math.random() < attacker.critChance;
  const base = Math.max(1, attacker.attack - defender.defense + Math.floor(Math.random() * 6));
  return { dmg: isCrit ? base * 2 : base, isMiss: false, isCrit };
}

// ─── Sub-components ──────────────────────────────────────────────────────────
function HpBar({ current, max, color }) {
  const pct = Math.max(0, Math.min(100, (current / max) * 100));
  const barColor =
    pct > 60 ? (color || 'var(--battle-hp-green)') :
    pct > 30 ? 'var(--battle-hp-yellow)' :
               'var(--battle-hp-red)';

  return (
    <div className="battle-hp-track">
      <div
        className="battle-hp-fill"
        style={{ width: `${pct}%`, background: barColor }}
      />
    </div>
  );
}

function Fighter({ stats, currentHp, shaking, side }) {
  return (
    <div className={`battle-fighter battle-fighter--${side} ${shaking ? 'shake' : ''}`}>
      <div className="fighter-avatar">{stats.emoji}</div>
      <div className="fighter-info">
        <span className="fighter-name">{stats.name}</span>
        <span className="fighter-hp">{Math.max(0, currentHp)} / {stats.maxHp} HP</span>
      </div>
      <HpBar current={currentHp} max={stats.maxHp} />
    </div>
  );
}

function LogEntry({ entry }) {
  const cls = entry.type === 'crit'    ? 'log-crit'
            : entry.type === 'miss'   ? 'log-miss'
            : entry.type === 'enemy'  ? 'log-enemy'
            : entry.type === 'system' ? 'log-system'
            : 'log-player';
  return <div className={`log-entry ${cls}`}>{entry.text}</div>;
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function BattleGame() {
  const [enemyIndex, setEnemyIndex]       = useState(0);
  const [playerHp, setPlayerHp]           = useState(PLAYER_STATS.maxHp);
  const [enemyHp, setEnemyHp]             = useState(ENEMIES[0].maxHp);
  const [log, setLog]                     = useState([{ text: '⚔️ Battle started! Your move, Hero.', type: 'system' }]);
  const [playerTurn, setPlayerTurn]       = useState(true);
  const [gameOver, setGameOver]           = useState(null); // 'win' | 'lose'
  const [playerShake, setPlayerShake]     = useState(false);
  const [enemyShake, setEnemyShake]       = useState(false);
  const [isAnimating, setIsAnimating]     = useState(false);
  const [floatingText, setFloatingText]   = useState(null); // { text, side, key }
  const logRef = useRef(null);

  const enemy = ENEMIES[enemyIndex];

  // Auto-scroll log
  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [log]);

  const addLog = (text, type) =>
    setLog(prev => [...prev, { text, type }]);

  const showFloat = (text, side) => {
    setFloatingText({ text, side, key: Date.now() });
    setTimeout(() => setFloatingText(null), 900);
  };

  const triggerShake = (target) => {
    if (target === 'player') {
      setPlayerShake(true);
      setTimeout(() => setPlayerShake(false), 500);
    } else {
      setEnemyShake(true);
      setTimeout(() => setEnemyShake(false), 500);
    }
  };

  // Player attacks
  const handleAttack = useCallback(() => {
    if (!playerTurn || gameOver || isAnimating) return;
    setIsAnimating(true);
    setPlayerTurn(false);

    const { dmg, isMiss, isCrit } = calcDamage(PLAYER_STATS, enemy);

    if (isMiss) {
      addLog(`🌀 You swing but miss the ${enemy.name}!`, 'miss');
      showFloat('MISS!', 'enemy');
    } else if (isCrit) {
      addLog(`💥 CRITICAL HIT! You deal ${dmg} damage to ${enemy.name}!`, 'crit');
      showFloat(`⚡ ${dmg}!`, 'enemy');
      triggerShake('enemy');
    } else {
      addLog(`⚔️ You attack ${enemy.name} for ${dmg} damage.`, 'player');
      showFloat(`-${dmg}`, 'enemy');
      triggerShake('enemy');
    }

    const newEnemyHp = Math.max(0, enemyHp - dmg);
    setEnemyHp(newEnemyHp);

    if (newEnemyHp <= 0) {
      addLog(`🏆 ${enemy.reward}`, 'system');
      setGameOver('win');
      setIsAnimating(false);
      return;
    }

    // Enemy turn after delay
    setTimeout(() => {
      const { dmg: eDmg, isMiss: eMiss, isCrit: eCrit } = calcDamage(enemy, PLAYER_STATS);

      if (eMiss) {
        addLog(`💨 ${enemy.name} attacks but misses you!`, 'miss');
        showFloat('MISS!', 'player');
      } else if (eCrit) {
        addLog(`💀 CRITICAL! ${enemy.name} hits you for ${eDmg} damage!`, 'crit');
        showFloat(`⚡ ${eDmg}!`, 'player');
        triggerShake('player');
      } else {
        addLog(`👹 ${enemy.name} attacks you for ${eDmg} damage.`, 'enemy');
        showFloat(`-${eDmg}`, 'player');
        triggerShake('player');
      }

      const newPlayerHp = Math.max(0, playerHp - eDmg);
      setPlayerHp(newPlayerHp);

      if (newPlayerHp <= 0) {
        addLog(`💀 You have been defeated by ${enemy.name}...`, 'system');
        setGameOver('lose');
      } else {
        setPlayerTurn(true);
      }
      setIsAnimating(false);
    }, 900);
  }, [playerTurn, gameOver, isAnimating, enemy, enemyHp, playerHp]);

  // Heal action
  const handleHeal = useCallback(() => {
    if (!playerTurn || gameOver || isAnimating) return;
    setIsAnimating(true);
    setPlayerTurn(false);

    const healAmt = Math.floor(Math.random() * 10) + 12;
    const newHp = Math.min(PLAYER_STATS.maxHp, playerHp + healAmt);
    setPlayerHp(newHp);
    addLog(`✨ You use a potion and restore ${healAmt} HP!`, 'system');
    showFloat(`+${healAmt}`, 'player');

    setTimeout(() => {
      const { dmg: eDmg, isMiss: eMiss, isCrit: eCrit } = calcDamage(enemy, PLAYER_STATS);

      if (eMiss) {
        addLog(`💨 ${enemy.name} attacks but misses you!`, 'miss');
      } else if (eCrit) {
        addLog(`💀 CRITICAL! ${enemy.name} hits you for ${eDmg} damage!`, 'crit');
        triggerShake('player');
      } else {
        addLog(`👹 ${enemy.name} attacks you for ${eDmg} damage.`, 'enemy');
        triggerShake('player');
      }

      const newPlayerHp2 = Math.max(0, newHp - (eMiss ? 0 : eDmg));
      setPlayerHp(newPlayerHp2);

      if (newPlayerHp2 <= 0) {
        addLog(`💀 You have been defeated by ${enemy.name}...`, 'system');
        setGameOver('lose');
      } else {
        setPlayerTurn(true);
      }
      setIsAnimating(false);
    }, 900);
  }, [playerTurn, gameOver, isAnimating, enemy, playerHp]);

  const restart = (nextEnemyIndex) => {
    const idx = nextEnemyIndex ?? 0;
    setEnemyIndex(idx);
    setPlayerHp(PLAYER_STATS.maxHp);
    setEnemyHp(ENEMIES[idx].maxHp);
    setLog([{ text: `⚔️ A new challenger: ${ENEMIES[idx].name}! Your move.`, type: 'system' }]);
    setPlayerTurn(true);
    setGameOver(null);
    setIsAnimating(false);
  };

  const nextEnemy = () => {
    const next = (enemyIndex + 1) % ENEMIES.length;
    restart(next);
  };

  return (
    <div className="battle-wrapper">
      {/* Header */}
      <div className="battle-header">
        <h2 className="battle-title">⚔️ PvE Battle Arena</h2>
        <div className="battle-enemy-badge">
          {ENEMIES.map((e, i) => (
            <span key={i} className={`enemy-dot ${i === enemyIndex ? 'active' : i < enemyIndex ? 'done' : ''}`}>
              {e.emoji}
            </span>
          ))}
        </div>
      </div>

      {/* Arena */}
      <div className="battle-arena">
        {/* Floating damage text */}
        {floatingText && (
          <div
            key={floatingText.key}
            className={`floating-dmg floating-dmg--${floatingText.side}`}
          >
            {floatingText.text}
          </div>
        )}

        <Fighter stats={PLAYER_STATS} currentHp={playerHp} shaking={playerShake} side="left" />
        <div className="battle-vs">VS</div>
        <Fighter stats={enemy} currentHp={enemyHp} shaking={enemyShake} side="right" />
      </div>

      {/* Turn indicator */}
      {!gameOver && (
        <div className={`turn-indicator ${playerTurn && !isAnimating ? 'your-turn' : 'enemy-turn'}`}>
          {isAnimating ? '⏳ Processing...' : playerTurn ? '🟢 Your Turn' : '🔴 Enemy Turn'}
        </div>
      )}

      {/* Game Over banner */}
      {gameOver && (
        <div className={`gameover-banner ${gameOver === 'win' ? 'win' : 'lose'}`}>
          {gameOver === 'win' ? '🏆 Victory!' : '💀 Defeated!'}
          <div className="gameover-actions">
            {gameOver === 'win' && enemyIndex < ENEMIES.length - 1 && (
              <button className="battle-btn battle-btn--primary" onClick={nextEnemy}>
                Next Enemy ➡️
              </button>
            )}
            <button className="battle-btn battle-btn--outline" onClick={() => restart()}>
              🔄 Restart
            </button>
          </div>
        </div>
      )}

      {/* Action buttons */}
      {!gameOver && (
        <div className="battle-actions">
          <button
            className="battle-btn battle-btn--primary"
            onClick={handleAttack}
            disabled={!playerTurn || isAnimating}
          >
            ⚔️ Attack
          </button>
          <button
            className="battle-btn battle-btn--heal"
            onClick={handleHeal}
            disabled={!playerTurn || isAnimating || playerHp >= PLAYER_STATS.maxHp}
          >
            🧪 Potion
          </button>
        </div>
      )}

      {/* Battle Log */}
      <div className="battle-log" ref={logRef}>
        <div className="log-header">📜 Battle Log</div>
        {log.map((entry, i) => (
          <LogEntry key={i} entry={entry} />
        ))}
      </div>

      {/* Stats info */}
      <div className="battle-stats-row">
        <div className="stat-chip">⚡ Crit: {(PLAYER_STATS.critChance * 100).toFixed(0)}%</div>
        <div className="stat-chip">🌀 Miss: {(PLAYER_STATS.missChance * 100).toFixed(0)}%</div>
        <div className="stat-chip">🗡️ ATK: {PLAYER_STATS.attack}</div>
        <div className="stat-chip">🛡️ DEF: {PLAYER_STATS.defense}</div>
      </div>
    </div>
  );
}
