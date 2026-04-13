import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { createTimeline, stagger, splitText } from 'animejs';

export default function Home() {
  const badgeRef = useRef(null);
  const subtitleRef = useRef(null);
  const animatedRef = useRef(false);
  const titleRef = useRef(null);

  useEffect(() => {
    if (animatedRef.current || !badgeRef.current || !subtitleRef.current) return;
    animatedRef.current = true;

    const { words, chars } = splitText(
      [badgeRef.current, titleRef.current, subtitleRef.current],
      {
        words: { wrap: 'clip' },
        chars: true,
      }
    );

    createTimeline({
      defaults: { ease: 'inOut(3)', duration: 650 }
    })

      // Badge entrance
      .add(words, {
        y: [$el => +$el.dataset.line % 2 ? '100%' : '-100%', '0%'],
      }, stagger(100))

      // Title + subtitle reveal
      .add(chars, {
        y: ['100%', '0%'],
        opacity: [0, 1],
      }, stagger(8), '-=300')

      .init();
  }, []);

  return (
    <main className="container fade-in">
      <section className="hero">
        <div className="hero-badge" ref={badgeRef}>Still seeking </div>
        <h1 className="hero-title" ref={titleRef}>
          <span>Crafting Digital</span> <br />
          <span>Experiences</span>
        </h1>
        <p className="hero-subtitle" ref={subtitleRef}>
          Hello, I am Ucok. Welcome to my personal space.
        </p>
        <div className="hero-buttons">
          <a href="#contact" className="btn btn-primary">
            Get in Touch
          </a>
          <a href="#projects" className="btn btn-outline">
            Explore Features
          </a>
        </div>
      </section>

      <section id="projects" className="projects-section">
        <h2 className="section-title">My Portfolio Showcase</h2>
        <div className="grid">

          <Link to="/frontend" className="card" style={{ textDecoration: 'none' }}>
            <div className="card-icon">🎨</div>
            <h3 className="card-title">Frontend UI Components</h3>
            <p className="card-desc">
              Koleksi elemen antarmuka unik, animasi, dan desain sleek.
            </p>
          </Link>

          <Link to="/backend" className="card" style={{ textDecoration: 'none' }}>
            <div className="card-icon">⚙️</div>
            <h3 className="card-title">Backend Logic Showcase</h3>
            <p className="card-desc">
              Demonstrasi algoritma, utilitas data, dan logika cerdas.
            </p>
          </Link>

        </div>
      </section>

      <section id="contact" className="projects-section" style={{ paddingBottom: '100px' }}>
        <h2 className="section-title">Contact Us</h2>
        <div className="card" style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
            Hubungi kami untuk kolaborasi, saran, atau pertanyaan seputar konten kami.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
            <a href="mailto:patuangarcia@gmail.com" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 600, fontSize: '1.2rem' }}>
              📧 patuangarcia@gmail.com
            </a>
            <p style={{ margin: 0 }}>📍 Bekasi, Indonesia</p>
          </div>
        </div>
      </section>
    </main>
  );
}
