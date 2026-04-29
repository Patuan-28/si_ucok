import React from 'react';
import ChessGame from '../components/ChessGame';

export default function ChessGamePage() {
  return (
    <main className="container fade-in" style={{ paddingTop: '100px', minHeight: '80vh' }}>
      <ChessGame />
    </main>
  );
}
