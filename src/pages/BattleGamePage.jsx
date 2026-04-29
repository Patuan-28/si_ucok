import React from 'react';
import BattleGame from '../components/BattleGame';

export default function BattleGamePage() {
  return (
    <main className="container fade-in" style={{ paddingTop: '100px', minHeight: '80vh' }}>
      <BattleGame />
    </main>
  );
}
