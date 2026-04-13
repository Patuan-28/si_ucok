import React, { useState, useEffect, useRef, useCallback } from 'react';
import './BattleGame.css';

// ─── Static Game Data ─────────────────────────────────────────────────────────
const PLAYER_STATS = {
  name: 'Hero',
  emoji: '🧙‍♂️',
  maxHp: 130,
  attack: 24,
  defense: 5,
  critChance: 0.2,
  missChance: 0.1,
};

// ─── Skill Definitions ────────────────────────────────────────────────────────
// cooldown = turns player must wait before reusing (0 = no cooldown)
const PLAYER_SKILLS = [
  {
    id: 'basic',
    label: '⚔️ Attack',
    desc: 'Serangan dasar',
    cooldown: 0,
    type: 'damage',
    color: 'primary',
  },
  {
    id: 'slash',
    label: '🌪️ Slash',
    desc: 'Damage tinggi (CD: 3 turn)',
    cooldown: 3,
    type: 'damage',
    multiplier: 1.8,
    color: 'slash',
  },
  {
    id: 'burn',
    label: '🔥 Burn',
    desc: 'Bakar musuh (3 turn)',
    cooldown: 2,
    type: 'effect',
    color: 'burn',
  },
  {
    id: 'heal',
    label: '💚 Heal',
    desc: 'Pulihkan 25–35 HP',
    cooldown: 0,
    type: 'heal',
    color: 'heal',
  },
  {
    id: 'shield',
    label: '🛡️ Shield',
    desc: 'Kurangi damage (3 turn)',
    cooldown: 2,
    type: 'effect',
    color: 'shield',
  },
];

// ─── Enemy Definitions ────────────────────────────────────────────────────────
const ENEMIES = [
  {
    name: 'Goblin',
    emoji: '👺',
    maxHp: 90,
    attack: 13,
    defense: 2,
    critChance: 0.1,
    missChance: 0.18,
    personality: 'aggressive',   // always attacks
    reward: 'You vanquished the Goblin!',
  },
  {
    name: 'Stone Golem',
    emoji: '🗿',
    maxHp: 130,
    attack: 14,
    defense: 7,
    critChance: 0.08,
    missChance: 0.1,
    personality: 'defensive',    // often shields
    reward: 'The Golem crumbles before you!',
  },
  {
    name: 'Shadow Witch',
    emoji: '🧙',
    maxHp: 110,
    attack: 18,
    defense: 3,
    critChance: 0.2,
    missChance: 0.08,
    personality: 'trickster',    // random skills
    reward: 'The Witch vanishes in smoke!',
  },
  {
    name: 'Dragon',
    emoji: '🐉',
    maxHp: 200,
    attack: 28,
    defense: 8,
    critChance: 0.25,
    missChance: 0.06,
    personality: 'aggressive',
    reward: 'The Dragon is defeated — glory is yours!',
  },
];

// ─── Utilities ────────────────────────────────────────────────────────────────
function calcDamage(attacker, defender, multiplier = 1, shielded = false) {
  const isMiss = Math.random() < attacker.missChance;
  if (isMiss) return { dmg: 0, isMiss: true, isCrit: false };
  const isCrit = Math.random() < attacker.critChance;
  let base = Math.max(1, attacker.attack - defender.defense + Math.floor(Math.random() * 6));
  base = Math.round(base * multiplier);
  if (shielded) base = Math.max(1, Math.floor(base * 0.45)); // shield cuts 55% damage
  return { dmg: isCrit ? base * 2 : base, isMiss: false, isCrit };
}

// AI decides enemy action based on personality + HP context
function enemyDecide(enemy, enemyHp, playerHp) {
  const enemyHpPct = enemyHp / enemy.maxHp;
  const playerHpPct = playerHp / PLAYER_STATS.maxHp;

  // Universal survival logic: if very low hp, try to heal
  if (enemyHpPct < 0.28 && Math.random() < 0.6) return 'heal';
  // Finisher logic: if player is low, go all in
  if (playerHpPct < 0.25 && Math.random() < 0.7) return 'slash';

  switch (enemy.personality) {
    case 'aggressive':
      // Always prefers to attack; occasionally slashes
      return Math.random() < 0.35 ? 'slash' : 'basic';

    case 'defensive': {
      const roll = Math.random();
      if (roll < 0.3) return 'shield';
      if (roll < 0.55) return 'basic';
      return 'slash';
    }

    case 'trickster': {
      // Completely random from available enemy skills
      const pool = ['basic', 'slash', 'burn', 'shield'];
      return pool[Math.floor(Math.random() * pool.length)];
    }

    default:
      return 'basic';
  }
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function HpBar({ current, max }) {
  const pct = Math.max(0, Math.min(100, (current / max) * 100));
  const color =
    pct > 60 ? 'var(--battle-hp-green)' :
      pct > 30 ? 'var(--battle-hp-yellow)' :
        'var(--battle-hp-red)';
  return (
    <div className="battle-hp-track">
      <div className="battle-hp-fill" style={{ width: `${pct}%`, background: color }} />
    </div>
  );
}

// Status effect badges displayed under a fighter
function StatusBadges({ effects }) {
  return (
    <div className="status-badges">
      {effects.burn > 0 && <span className="sbadge sbadge--burn">🔥 Burn ×{effects.burn}</span>}
      {effects.freeze > 0 && <span className="sbadge sbadge--freeze">❄️ Frozen</span>}
      {effects.shield > 0 && <span className="sbadge sbadge--shield">🛡️ Shield ×{effects.shield}</span>}
    </div>
  );
}

function Fighter({ stats, currentHp, shaking, side, effects }) {
  return (
    <div className={`battle-fighter battle-fighter--${side} ${shaking ? 'shake' : ''}`}>
      <div className="fighter-avatar">{stats.emoji}</div>
      <div className="fighter-info">
        <span className="fighter-name">{stats.name}</span>
        <span className="fighter-hp">{Math.max(0, currentHp)} / {stats.maxHp} HP</span>
      </div>
      <HpBar current={currentHp} max={stats.maxHp} />
      <StatusBadges effects={effects} />
    </div>
  );
}

function LogEntry({ entry }) {
  const typeMap = {
    crit: 'log-crit',
    miss: 'log-miss',
    enemy: 'log-enemy',
    system: 'log-system',
    burn: 'log-burn',
    freeze: 'log-freeze',
    shield: 'log-shield',
    heal: 'log-heal',
  };
  return (
    <div className={`log-entry ${typeMap[entry.type] || 'log-player'}`}>
      {entry.text}
    </div>
  );
}

// Skill button with cooldown overlay
function SkillBtn({ skill, onUse, disabled, cdLeft }) {
  const colorMap = {
    primary: 'battle-btn--primary',
    slash: 'battle-btn--slash',
    burn: 'battle-btn--burn',
    heal: 'battle-btn--heal',
    shield: 'battle-btn--shield',
  };
  return (
    <button
      className={`battle-btn ${colorMap[skill.color]} ${cdLeft > 0 ? 'on-cooldown' : ''}`}
      onClick={() => onUse(skill)}
      disabled={disabled || cdLeft > 0}
      title={skill.desc}
    >
      <span className="skill-label">{skill.label}</span>
      {cdLeft > 0 && <span className="skill-cd">CD {cdLeft}</span>}
    </button>
  );
}

// ─── Initial Effect State ─────────────────────────────────────────────────────
const NO_EFFECTS = { burn: 0, freeze: 0, shield: 0 };

// ─── Main Component ───────────────────────────────────────────────────────────
export default function BattleGame() {
  const [enemyIndex, setEnemyIndex] = useState(0);
  const [playerHp, setPlayerHp] = useState(PLAYER_STATS.maxHp);
  const [enemyHp, setEnemyHp] = useState(ENEMIES[0].maxHp);

  // Status effects: { burn, freeze, shield } — each is a turn counter
  const [playerFx, setPlayerFx] = useState({ ...NO_EFFECTS });
  const [enemyFx, setEnemyFx] = useState({ ...NO_EFFECTS });

  // Skill cooldowns: { skillId: turnsLeft }
  const [cooldowns, setCooldowns] = useState({});

  const [log, setLog] = useState([{ text: '⚔️ Battle started! Your move, Hero.', type: 'system' }]);
  const [playerTurn, setPlayerTurn] = useState(true);
  const [gameOver, setGameOver] = useState(null);
  const [playerShake, setPlayerShake] = useState(false);
  const [enemyShake, setEnemyShake] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [floatingText, setFloatingText] = useState(null);

  const logRef = useRef(null);
  const enemy = ENEMIES[enemyIndex];

  // Auto-scroll log
  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [log]);

  // ── Helpers ────────────────────────────────────────────────────────────────
  const addLog = (text, type) => setLog(prev => [...prev, { text, type }]);

  const showFloat = (text, side) => {
    setFloatingText({ text, side, key: Date.now() });
    setTimeout(() => setFloatingText(null), 900);
  };

  const shake = (target) => {
    if (target === 'player') {
      setPlayerShake(true);
      setTimeout(() => setPlayerShake(false), 500);
    } else {
      setEnemyShake(true);
      setTimeout(() => setEnemyShake(false), 500);
    }
  };

  // Tick down a set of effects; apply burn damage; returns { newEffects, burnDmg }
  const tickEffects = (effects, targetHp, targetStats) => {
    let burnDmg = 0;
    const next = { ...effects };
    if (next.burn > 0) {
      burnDmg = Math.floor(targetStats.maxHp * 0.05); // 5% max HP per turn
      next.burn--;
    }
    if (next.freeze > 0) next.freeze--;
    if (next.shield > 0) next.shield--;
    return { newEffects: next, burnDmg };
  };

  // Tick down all cooldowns by 1
  const tickCooldowns = (cds) => {
    const next = {};
    for (const [id, left] of Object.entries(cds)) {
      if (left > 1) next[id] = left - 1;
    }
    return next;
  };

  // ── Apply Enemy Turn ───────────────────────────────────────────────────────
  const doEnemyTurn = useCallback((currentPlayerHp, currentEnemyHp, currentPlayerFx, currentEnemyFx) => {
    // Check if frozen
    if (currentEnemyFx.freeze > 0) {
      addLog(`❄️ ${enemy.name} is frozen and skips their turn!`, 'freeze');
      setPlayerTurn(true);
      setIsAnimating(false);
      return;
    }

    const action = enemyDecide(enemy, currentEnemyHp, currentPlayerHp);
    let newPlayerHp = currentPlayerHp;
    let newEnemyHp = currentEnemyHp;
    let newPlayerFx = { ...currentPlayerFx };
    let newEnemyFx = { ...currentEnemyFx };

    switch (action) {
      case 'basic':
      case 'slash': {
        const multi = action === 'slash' ? 1.8 : 1;
        const { dmg, isMiss, isCrit } = calcDamage(enemy, PLAYER_STATS, multi, currentPlayerFx.shield > 0);
        if (isMiss) {
          addLog(`💨 ${enemy.name} attacks but misses!`, 'miss');
          showFloat('MISS!', 'player');
        } else if (isCrit) {
          addLog(`💀 CRITICAL! ${enemy.name} ${action === 'slash' ? 'Slashes' : 'hits'} you for ${dmg} damage!`, 'crit');
          showFloat(`⚡ ${dmg}!`, 'player');
          shake('player');
        } else {
          const label = action === 'slash' ? `🌪️ ${enemy.name} uses Slash on you for ${dmg} damage!` : `👹 ${enemy.name} attacks you for ${dmg} damage.`;
          addLog(label, 'enemy');
          showFloat(`-${dmg}`, 'player');
          if (dmg > 0) shake('player');
        }
        newPlayerHp = Math.max(0, currentPlayerHp - dmg);
        break;
      }
      case 'burn': {
        newPlayerFx = { ...newPlayerFx, burn: 3 };
        addLog(`🔥 ${enemy.name} sets you ablaze! You'll burn for 3 turns.`, 'burn');
        showFloat('🔥 BURN!', 'player');
        break;
      }
      case 'shield': {
        newEnemyFx = { ...newEnemyFx, shield: 3 };
        addLog(`🗿 ${enemy.name} raises a magical barrier!`, 'shield');
        showFloat('🛡️ SHIELD!', 'enemy');
        break;
      }
      case 'heal': {
        const healAmt = Math.floor(enemy.maxHp * 0.18);
        newEnemyHp = Math.min(enemy.maxHp, currentEnemyHp + healAmt);
        addLog(`💚 ${enemy.name} regenerates ${healAmt} HP!`, 'heal');
        showFloat(`+${healAmt}`, 'enemy');
        break;
      }
      default:
        break;
    }

    setPlayerHp(newPlayerHp);
    setEnemyHp(newEnemyHp);
    setPlayerFx(newPlayerFx);
    setEnemyFx(newEnemyFx);

    if (newPlayerHp <= 0) {
      addLog(`💀 You have been defeated by ${enemy.name}...`, 'system');
      setGameOver('lose');
      setIsAnimating(false);
    } else {
      setPlayerTurn(true);
      setIsAnimating(false);
    }
  }, [enemy]);

  // ── Player Uses a Skill ────────────────────────────────────────────────────
  const handleSkill = useCallback((skill) => {
    if (!playerTurn || gameOver || isAnimating) return;
    if (cooldowns[skill.id] > 0) return;

    setIsAnimating(true);
    setPlayerTurn(false);

    // Set cooldown for non-zero skills
    if (skill.cooldown > 0) {
      setCooldowns(prev => ({ ...prev, [skill.id]: skill.cooldown }));
    }

    let newEnemyHp = enemyHp;
    let newPlayerHp = playerHp;
    let newEnemyFx = { ...enemyFx };
    let newPlayerFx = { ...playerFx };

    // ── Player action ──
    switch (skill.type) {
      case 'damage': {
        const multi = skill.multiplier || 1;
        const { dmg, isMiss, isCrit } = calcDamage(PLAYER_STATS, enemy, multi, enemyFx.shield > 0);
        if (isMiss) {
          addLog(`🌀 You swing but miss the ${enemy.name}!`, 'miss');
          showFloat('MISS!', 'enemy');
        } else if (isCrit) {
          addLog(`💥 CRITICAL HIT! ${skill.id === 'slash' ? 'Slash' : 'Attack'} deals ${dmg} to ${enemy.name}!`, 'crit');
          showFloat(`⚡ ${dmg}!`, 'enemy');
          shake('enemy');
        } else {
          const label = skill.id === 'slash'
            ? `🌪️ You Slash ${enemy.name} for ${dmg} damage!`
            : `⚔️ You attack ${enemy.name} for ${dmg} damage.`;
          addLog(label, 'player');
          showFloat(`-${dmg}`, 'enemy');
          if (dmg > 0) shake('enemy');
        }
        newEnemyHp = Math.max(0, enemyHp - dmg);
        break;
      }
      case 'effect': {
        if (skill.id === 'burn') {
          newEnemyFx = { ...newEnemyFx, burn: 3 };
          addLog(`🔥 You ignite ${enemy.name}! They'll burn for 3 turns.`, 'burn');
          showFloat('🔥 BURN!', 'enemy');
        } else if (skill.id === 'shield') {
          newPlayerFx = { ...newPlayerFx, shield: 3 };
          addLog(`🛡️ You raise a shield — damage reduced for 3 turns!`, 'shield');
          showFloat('🛡️ SHIELD!', 'player');
        }
        break;
      }
      case 'heal': {
        const healAmt = Math.floor(Math.random() * 11) + 25;
        newPlayerHp = Math.min(PLAYER_STATS.maxHp, playerHp + healAmt);
        addLog(`💚 You channel healing energy and restore ${healAmt} HP!`, 'heal');
        showFloat(`+${healAmt}`, 'player');
        break;
      }
      default:
        break;
    }

    setEnemyHp(newEnemyHp);
    setPlayerHp(newPlayerHp);
    setEnemyFx(newEnemyFx);
    setPlayerFx(newPlayerFx);

    if (newEnemyHp <= 0) {
      addLog(`🏆 ${enemy.reward}`, 'system');
      setGameOver('win');
      setIsAnimating(false);
      return;
    }

    // ── Tick effects at start of enemy turn & then enemy acts ──
    setTimeout(() => {
      let postPlayerHp = newPlayerHp;
      let postEnemyHp = newEnemyHp;
      let postPlayerFx = { ...newPlayerFx };
      let postEnemyFx = { ...newEnemyFx };

      // Tick player burn
      const pTick = tickEffects(postPlayerFx, postPlayerHp, PLAYER_STATS);
      postPlayerFx = pTick.newEffects;
      if (pTick.burnDmg > 0) {
        postPlayerHp = Math.max(0, postPlayerHp - pTick.burnDmg);
        addLog(`🔥 Burn deals ${pTick.burnDmg} damage to you!`, 'burn');
        showFloat(`🔥-${pTick.burnDmg}`, 'player');
        shake('player');
      }

      // Tick enemy burn
      const eTick = tickEffects(postEnemyFx, postEnemyHp, enemy);
      postEnemyFx = eTick.newEffects;
      if (eTick.burnDmg > 0) {
        postEnemyHp = Math.max(0, postEnemyHp - eTick.burnDmg);
        addLog(`🔥 Burn deals ${eTick.burnDmg} damage to ${enemy.name}!`, 'burn');
        showFloat(`🔥-${eTick.burnDmg}`, 'enemy');
        shake('enemy');
      }

      // Tick cooldowns
      setCooldowns(prev => tickCooldowns(prev));

      setPlayerHp(postPlayerHp);
      setEnemyHp(postEnemyHp);
      setPlayerFx(postPlayerFx);
      setEnemyFx(postEnemyFx);

      if (postPlayerHp <= 0) {
        addLog(`🔥 You succumbed to burn damage!`, 'system');
        setGameOver('lose');
        setIsAnimating(false);
        return;
      }
      if (postEnemyHp <= 0) {
        addLog(`🏆 ${enemy.reward}`, 'system');
        setGameOver('win');
        setIsAnimating(false);
        return;
      }

      // Enemy takes their turn
      doEnemyTurn(postPlayerHp, postEnemyHp, postPlayerFx, postEnemyFx);
    }, 900);
  }, [playerTurn, gameOver, isAnimating, enemy, enemyHp, playerHp, enemyFx, playerFx, cooldowns, doEnemyTurn]);

  // ── Restart ────────────────────────────────────────────────────────────────
  const restart = (idx = 0) => {
    setEnemyIndex(idx);
    setPlayerHp(PLAYER_STATS.maxHp);
    setEnemyHp(ENEMIES[idx].maxHp);
    setPlayerFx({ ...NO_EFFECTS });
    setEnemyFx({ ...NO_EFFECTS });
    setCooldowns({});
    setLog([{ text: `⚔️ A new challenger: ${ENEMIES[idx].name}! Your move.`, type: 'system' }]);
    setPlayerTurn(true);
    setGameOver(null);
    setIsAnimating(false);
  };

  const nextEnemy = () => restart((enemyIndex + 1) % ENEMIES.length);

  // ── Personality label ──────────────────────────────────────────────────────
  const personalityLabel = {
    aggressive: '⚔️ Aggressive',
    defensive: '🛡️ Defensive',
    trickster: '🎲 Trickster',
  }[enemy.personality];

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="battle-wrapper">
      {/* Header */}
      <div className="battle-header">
        <h2 className="battle-title">⚔️ Ucok's PvE Battle Arena</h2>
        <div className="battle-enemy-badge">
          {ENEMIES.map((e, i) => (
            <span
              key={i}
              className={`enemy-dot ${i === enemyIndex ? 'active' : i < enemyIndex ? 'done' : ''}`}
            >
              {e.emoji}
            </span>
          ))}
        </div>
      </div>

      {/* Enemy personality info */}
      <div className="personality-row">
        <span className="personality-chip">{personalityLabel}</span>
        <span className="personality-desc">
          {enemy.personality === 'aggressive' && 'Selalu menyerang. Waspada!'}
          {enemy.personality === 'defensive' && 'Sering pasang shield. Sabar & tekan terus.'}
          {enemy.personality === 'trickster' && 'Skill acak. Tidak bisa diprediksi!'}
        </span>
      </div>

      {/* Arena */}
      <div className="battle-arena">
        {floatingText && (
          <div
            key={floatingText.key}
            className={`floating-dmg floating-dmg--${floatingText.side}`}
          >
            {floatingText.text}
          </div>
        )}
        <Fighter
          stats={PLAYER_STATS}
          currentHp={playerHp}
          shaking={playerShake}
          side="left"
          effects={playerFx}
        />
        <div className="battle-vs">VS</div>
        <Fighter
          stats={enemy}
          currentHp={enemyHp}
          shaking={enemyShake}
          side="right"
          effects={enemyFx}
        />
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

      {/* Skill buttons */}
      {!gameOver && (
        <div className="battle-skills">
          {PLAYER_SKILLS.map(skill => (
            <SkillBtn
              key={skill.id}
              skill={skill}
              onUse={handleSkill}
              disabled={!playerTurn || isAnimating}
              cdLeft={cooldowns[skill.id] || 0}
            />
          ))}
        </div>
      )}

      {/* Battle Log */}
      <div className="battle-log" ref={logRef}>
        <div className="log-header">📜 Battle Log</div>
        {log.map((entry, i) => (
          <LogEntry key={i} entry={entry} />
        ))}
      </div>

      {/* Player stat chips */}
      <div className="battle-stats-row">
        <div className="stat-chip">⚡ Crit: {(PLAYER_STATS.critChance * 100).toFixed(0)}%</div>
        <div className="stat-chip">🌀 Miss: {(PLAYER_STATS.missChance * 100).toFixed(0)}%</div>
        <div className="stat-chip">🗡️ ATK: {PLAYER_STATS.attack}</div>
        <div className="stat-chip">🛡️ DEF: {PLAYER_STATS.defense}</div>
      </div>
    </div>
  );
}
