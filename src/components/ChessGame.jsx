import React, { useState, useEffect, useRef, useCallback } from 'react';
import './ChessGame.css';

// ─── Constants ────────────────────────────────────────────────────────────────
const SYMBOLS = {
  wK: '♔', wQ: '♕', wR: '♖', wB: '♗', wN: '♘', wP: '♙',
  bK: '♚', bQ: '♛', bR: '♜', bB: '♝', bN: '♞', bP: '♟',
};
const PIECE_VALUES = { P: 1, N: 3, B: 3, R: 5, Q: 9, K: 100 };
const INIT_CASTLING = { wK: true, wQ: true, bK: true, bQ: true };
const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
const RANKS = ['8', '7', '6', '5', '4', '3', '2', '1'];

// ─── Board Setup ──────────────────────────────────────────────────────────────
function initialBoard() {
  const b = Array(8).fill(null).map(() => Array(8).fill(null));
  const back = ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R'];
  b[0] = back.map(t => ({ t, c: 'b' }));
  b[1] = Array(8).fill(null).map(() => ({ t: 'P', c: 'b' }));
  b[6] = Array(8).fill(null).map(() => ({ t: 'P', c: 'w' }));
  b[7] = back.map(t => ({ t, c: 'w' }));
  return b;
}

// ─── Chess Logic (pure functions) ─────────────────────────────────────────────
const inBounds = (r, c) => r >= 0 && r < 8 && c >= 0 && c < 8;

function getPseudoMoves(board, r, c, ep, castling) {
  const piece = board[r][c];
  if (!piece) return [];
  const { t, c: color } = piece;
  const opp = color === 'w' ? 'b' : 'w';
  const moves = [];
  const push = (tr, tc, sp = null) =>
    moves.push({ from: [r, c], to: [tr, tc], special: sp });

  if (t === 'P') {
    const dir = color === 'w' ? -1 : 1;
    const startRow = color === 'w' ? 6 : 1;
    if (inBounds(r + dir, c) && !board[r + dir][c]) {
      push(r + dir, c);
      if (r === startRow && !board[r + 2 * dir][c]) push(r + 2 * dir, c, 'double');
    }
    for (const dc of [-1, 1]) {
      const nr = r + dir, nc = c + dc;
      if (!inBounds(nr, nc)) continue;
      if (board[nr][nc]?.c === opp) push(nr, nc);
      else if (ep && ep[0] === nr && ep[1] === nc) push(nr, nc, 'enpassant');
    }
  } else if (t === 'N') {
    for (const [dr, dc] of [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]]) {
      const nr = r + dr, nc = c + dc;
      if (inBounds(nr, nc) && board[nr][nc]?.c !== color) push(nr, nc);
    }
  } else if (t === 'K') {
    for (const [dr, dc] of [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]]) {
      const nr = r + dr, nc = c + dc;
      if (inBounds(nr, nc) && board[nr][nc]?.c !== color) push(nr, nc);
    }
    // Castling
    if (castling) {
      const rank = color === 'w' ? 7 : 0;
      if (r === rank && c === 4) {
        if (castling[`${color}K`] && !board[rank][5] && !board[rank][6]
          && board[rank][7]?.t === 'R' && board[rank][7]?.c === color)
          push(rank, 6, 'castle-k');
        if (castling[`${color}Q`] && !board[rank][1] && !board[rank][2] && !board[rank][3]
          && board[rank][0]?.t === 'R' && board[rank][0]?.c === color)
          push(rank, 2, 'castle-q');
      }
    }
  } else {
    const dirs = [];
    if (t === 'R' || t === 'Q') dirs.push([-1, 0], [1, 0], [0, -1], [0, 1]);
    if (t === 'B' || t === 'Q') dirs.push([-1, -1], [-1, 1], [1, -1], [1, 1]);
    for (const [dr, dc] of dirs) {
      let nr = r + dr, nc = c + dc;
      while (inBounds(nr, nc)) {
        if (board[nr][nc]) { if (board[nr][nc].c === opp) push(nr, nc); break; }
        push(nr, nc);
        nr += dr; nc += dc;
      }
    }
  }
  return moves;
}

function doMove(board, move) {
  const { from, to, special } = move;
  const piece = board[from[0]][from[1]];
  const nb = board.map(row => [...row]);
  nb[to[0]][to[1]] = piece;
  nb[from[0]][from[1]] = null;
  // Auto-promotion to queen
  if (piece.t === 'P' && (to[0] === 0 || to[0] === 7))
    nb[to[0]][to[1]] = { t: 'Q', c: piece.c };
  // En passant: remove captured pawn
  if (special === 'enpassant') {
    nb[piece.c === 'w' ? to[0] + 1 : to[0] - 1][to[1]] = null;
  }
  // Castling: move rook
  if (special === 'castle-k') { nb[from[0]][5] = nb[from[0]][7]; nb[from[0]][7] = null; }
  if (special === 'castle-q') { nb[from[0]][3] = nb[from[0]][0]; nb[from[0]][0] = null; }
  return nb;
}

function findKing(board, color) {
  for (let r = 0; r < 8; r++)
    for (let c = 0; c < 8; c++)
      if (board[r][c]?.t === 'K' && board[r][c]?.c === color) return [r, c];
  return null;
}

function inCheck(board, color) {
  const king = findKing(board, color);
  if (!king) return false;
  const opp = color === 'w' ? 'b' : 'w';
  for (let r = 0; r < 8; r++)
    for (let c = 0; c < 8; c++)
      if (board[r][c]?.c === opp) {
        const ms = getPseudoMoves(board, r, c, null, null);
        if (ms.some(m => m.to[0] === king[0] && m.to[1] === king[1])) return true;
      }
  return false;
}

function getLegal(board, r, c, ep, castling) {
  const piece = board[r][c];
  if (!piece) return [];
  return getPseudoMoves(board, r, c, ep, castling).filter(move => {
    // Castling: can't castle through or out of check
    if (move.special === 'castle-k' || move.special === 'castle-q') {
      if (inCheck(board, piece.c)) return false;
      const midCol = move.special === 'castle-k' ? 5 : 3;
      const mb = board.map(row => [...row]);
      mb[move.to[0]][midCol] = piece; mb[r][c] = null;
      if (inCheck(mb, piece.c)) return false;
    }
    return !inCheck(doMove(board, move), piece.c);
  });
}

function allLegal(board, color, ep, castling) {
  const moves = [];
  for (let r = 0; r < 8; r++)
    for (let c = 0; c < 8; c++)
      if (board[r][c]?.c === color)
        moves.push(...getLegal(board, r, c, ep, castling));
  return moves;
}

function computeStatus(b, color, ep, castling) {
  const moves = allLegal(b, color, ep, castling);
  if (!moves.length) return inCheck(b, color) ? 'checkmate' : 'stalemate';
  return inCheck(b, color) ? 'check' : 'playing';
}

function updateCastling(castling, move, board) {
  const piece = board[move.from[0]][move.from[1]];
  const nc = { ...castling };
  if (piece.t === 'K') { nc[`${piece.c}K`] = false; nc[`${piece.c}Q`] = false; }
  if (piece.t === 'R' && move.from[0] === (piece.c === 'w' ? 7 : 0)) {
    if (move.from[1] === 7) nc[`${piece.c}K`] = false;
    if (move.from[1] === 0) nc[`${piece.c}Q`] = false;
  }
  const cap = board[move.to[0]][move.to[1]];
  if (cap?.t === 'R' && move.to[0] === (cap.c === 'w' ? 7 : 0)) {
    if (move.to[1] === 7) nc[`${cap.c}K`] = false;
    if (move.to[1] === 0) nc[`${cap.c}Q`] = false;
  }
  return nc;
}

function getAIMove(board, ep, castling) {
  const moves = allLegal(board, 'b', ep, castling);
  if (!moves.length) return null;
  const scored = moves.map(m => {
    let s = Math.random();
    const target = board[m.to[0]][m.to[1]];
    if (target) s += PIECE_VALUES[target.t] * 2;
    const [tr, tc] = m.to;
    if (tr >= 2 && tr <= 5 && tc >= 2 && tc <= 5) s += 0.4;
    if (inCheck(doMove(board, m), 'w')) s += 1.5;
    return { m, s };
  });
  scored.sort((a, b) => b.s - a.s);
  return scored[0].m;
}

export default function ChessGame() {
  const [board, setBoard] = useState(initialBoard);
  const [selected, setSelected] = useState(null);
  const [highlights, setHighlights] = useState([]);
  const [turn, setTurn] = useState('w');
  const [ep, setEp] = useState(null);
  const [castling, setCastling] = useState(INIT_CASTLING);
  const [status, setStatus] = useState('playing');
  const [capturedW, setCapturedW] = useState([]);
  const [capturedB, setCapturedB] = useState([]);
  const [lastMove, setLastMove] = useState(null);
  const [aiThinking, setAiThinking] = useState(false);

  // Refs so AI timer always reads latest state
  const boardRef = useRef(board);
  const epRef = useRef(ep);
  const castRef = useRef(castling);
  useEffect(() => { boardRef.current = board; }, [board]);
  useEffect(() => { epRef.current = ep; }, [ep]);
  useEffect(() => { castRef.current = castling; }, [castling]);

  const applyMoveState = useCallback((move, actingColor, b, e, cast) => {
    // Track capture
    if (move.special === 'enpassant') {
      const pr = actingColor === 'w' ? move.to[0] + 1 : move.to[0] - 1;
      const pawn = b[pr][move.to[1]];
      if (pawn) {
        actingColor === 'w'
          ? setCapturedB(p => [...p, pawn])
          : setCapturedW(p => [...p, pawn]);
      }
    } else {
      const cap = b[move.to[0]][move.to[1]];
      if (cap) {
        actingColor === 'w'
          ? setCapturedB(p => [...p, cap])
          : setCapturedW(p => [...p, cap]);
      }
    }

    const nb = doMove(b, move);
    const newEp = move.special === 'double'
      ? [move.to[0] - (actingColor === 'w' ? -1 : 1), move.to[1]]
      : null;
    const newCast = updateCastling(cast, move, b);
    const nextTurn = actingColor === 'w' ? 'b' : 'w';

    setBoard(nb);
    setEp(newEp);
    setCastling(newCast);
    setLastMove(move);
    setSelected(null);
    setHighlights([]);
    setTurn(nextTurn);
    setStatus(computeStatus(nb, nextTurn, newEp, newCast));
  }, []);

  // AI effect — triggers after white's move
  useEffect(() => {
    if (turn !== 'b' || status === 'checkmate' || status === 'stalemate') return;
    setAiThinking(true);
    const timer = setTimeout(() => {
      const move = getAIMove(boardRef.current, epRef.current, castRef.current);
      if (move) applyMoveState(move, 'b', boardRef.current, epRef.current, castRef.current);
      setAiThinking(false);
    }, 500 + Math.random() * 600);
    return () => clearTimeout(timer);
  }, [turn, status, applyMoveState]);

  const handleClick = (r, c) => {
    if (turn !== 'w' || aiThinking || status === 'checkmate' || status === 'stalemate') return;
    const piece = board[r][c];

    if (selected) {
      const mv = highlights.find(m => m.to[0] === r && m.to[1] === c);
      if (mv) { applyMoveState(mv, 'w', board, ep, castling); return; }
      if (piece?.c === 'w') {
        setSelected([r, c]);
        setHighlights(getLegal(board, r, c, ep, castling));
        return;
      }
      setSelected(null); setHighlights([]);
      return;
    }
    if (piece?.c === 'w') {
      setSelected([r, c]);
      setHighlights(getLegal(board, r, c, ep, castling));
    }
  };

  const restart = () => {
    setBoard(initialBoard()); setSelected(null); setHighlights([]);
    setTurn('w'); setEp(null); setCastling(INIT_CASTLING);
    setStatus('playing'); setCapturedW([]); setCapturedB([]);
    setLastMove(null); setAiThinking(false);
  };

  const isSel = (r, c) => selected?.[0] === r && selected?.[1] === c;
  const isHl = (r, c) => highlights.some(m => m.to[0] === r && m.to[1] === c);
  const isLm = (r, c) => lastMove && (
    (lastMove.from[0] === r && lastMove.from[1] === c) ||
    (lastMove.to[0] === r && lastMove.to[1] === c));
  const isChk = (r, c) => {
    if (status !== 'check' && status !== 'checkmate') return false;
    const k = findKing(board, turn);
    return k?.[0] === r && k?.[1] === c;
  };

  // ── Status badge config
  const si = ({
    playing: aiThinking
      ? { text: '🤖 AI is thinking…', cls: 'thinking' }
      : { text: '♟ Your turn (White)', cls: 'your-turn' },
    check: { text: '⚠️ Check! Protect your king', cls: 'check' },
    checkmate: turn === 'b'
      ? { text: '🏆 Checkmate — You win!', cls: 'win' }
      : { text: '💀 Checkmate — AI wins', cls: 'lose' },
    stalemate: { text: '🤝 Stalemate — Draw', cls: 'stalemate' },
  })[status];

  return (
    <div className="chess-wrapper">
      {/* Header */}
      <div className="chess-header">
        <div>
          <h2 className="chess-title">♟ Ucok's Mini Chess</h2>
          <p className="chess-sub">
            Turn-based · Full rules · Auto-queen promotion · Castling · En passant
          </p>
        </div>
        <div className={`chess-badge chess-badge--${si.cls}`}>{si.text}</div>
      </div>

      {/* Captured pieces */}
      <div className="chess-caps">
        <div className="chess-cap-row">
          <span className="chess-cap-label">AI captured</span>
          <span className="chess-cap-icons">
            {capturedW.map((p, i) => <span key={i}>{SYMBOLS[`w${p.t}`]}</span>)}
          </span>
        </div>
        <div className="chess-cap-row">
          <span className="chess-cap-label">You captured</span>
          <span className="chess-cap-icons">
            {capturedB.map((p, i) => <span key={i}>{SYMBOLS[`b${p.t}`]}</span>)}
          </span>
        </div>
      </div>

      {/* Board + coordinate labels */}
      <div className="chess-board-wrap">
        {/* Left rank labels */}
        <div className="chess-coords chess-coords--rank">
          {RANKS.map(r => <span key={r}>{r}</span>)}
        </div>

        <div className="chess-board-col">
          {/* Top file labels */}
          <div className="chess-coords chess-coords--file">
            {FILES.map(f => <span key={f}>{f}</span>)}
          </div>

          {/* The 8×8 board */}
          <div className="chess-board">
            {board.map((row, ri) => row.map((piece, ci) => {
              const light = (ri + ci) % 2 === 0;
              const sel = isSel(ri, ci);
              const hl = isHl(ri, ci);
              const lm = isLm(ri, ci);
              const chk = isChk(ri, ci);
              const isCap = hl && board[ri][ci] !== null;

              return (
                <div
                  key={`${ri}-${ci}`}
                  className={[
                    'chess-sq',
                    light ? 'sq-l' : 'sq-d',
                    sel ? 'sq-sel' : '',
                    lm ? 'sq-lm' : '',
                    chk ? 'sq-chk' : '',
                  ].filter(Boolean).join(' ')}
                  onClick={() => handleClick(ri, ci)}
                >
                  {hl && !isCap && <span className="move-dot" />}
                  {isCap && <span className="cap-ring" />}
                  {piece && (
                    <span
                      className={[
                        'chess-piece',
                        piece.c === 'b' ? 'p-black' : 'p-white',
                        sel ? 'p-lift' : '',
                      ].filter(Boolean).join(' ')}
                    >
                      {SYMBOLS[`${piece.c}${piece.t}`]}
                    </span>
                  )}
                </div>
              );
            }))}
          </div>

          {/* Bottom file labels */}
          <div className="chess-coords chess-coords--file">
            {FILES.map(f => <span key={f}>{f}</span>)}
          </div>
        </div>

        {/* Right rank labels */}
        <div className="chess-coords chess-coords--rank">
          {RANKS.map(r => <span key={r}>{r}</span>)}
        </div>
      </div>

      {/* Controls */}
      <div className="chess-footer">
        <button className="battle-btn battle-btn--outline" onClick={restart}>
          🔄 New Game
        </button>
        <span className="chess-hint">Click a piece, then click its destination</span>
      </div>
    </div>
  );
}
