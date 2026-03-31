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
          <button className="btn btn-primary" onClick={() => alert("Contact feature coming soon!")}>
            Get in Touch
          </button>
          <a href="#projects" className="btn btn-outline">
            View My Work
          </a>
        </div>
      </section>

      <section id="projects" className="projects-section">
        <h2 className="section-title">Explore My Playground</h2>
        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))' }}>

          <Link to="/frontend" className="card" style={{ textDecoration: 'none' }}>
            <div className="card-icon">🎨</div>
            <h3 className="card-title">Frontend UI Components</h3>
            <p className="card-desc">
              A collection of unique, interactive interfaces, animations, and sleek design elements.
            </p>
          </Link>

          <Link to="/backend" className="card" style={{ textDecoration: 'none' }}>
            <div className="card-icon">⚙️</div>
            <h3 className="card-title">Backend Logic & Games</h3>
            <p className="card-desc">
              Lightweight tools, calculation functions, and interactive mini-games built with logic.
            </p>
          </Link>

        </div>
      </section>
    </main>
  );
}
