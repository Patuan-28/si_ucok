import React from 'react';
import LockPickingGame from '../components/LockPickingGame';

export default function LockPickingPage() {
  return (
    <main className="container fade-in" style={{ paddingTop: '100px', minHeight: '80vh' }}>
      <LockPickingGame />
    </main>
  );
}
