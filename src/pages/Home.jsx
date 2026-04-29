import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { createTimeline, stagger, splitText } from 'animejs';
import { Parallax, ParallaxLayer } from '@react-spring/parallax';
import steveGif from '../assets/bare-bones-steve-wave.gif';
import memeGif from '../assets/minecraft-minecraft-meme.gif';

export default function Home() {
  const badgeRef = useRef(null);
  const subtitleRef = useRef(null);
  const animatedRef = useRef(false);
  const titleRef = useRef(null);
  const parallaxRef = useRef(null);

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
    <main className="fade-in" style={{ width: '100%', height: 'calc(100vh - 70px)', position: 'relative' }}>
      <Parallax pages={3} ref={parallaxRef}>

        {/* Intro Content */}
        <ParallaxLayer
          offset={0}
          speed={0.5}
          style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: '3rem' }}
        >
          <img src={memeGif} alt="Minecraft Meme" style={{ width: '200px' }} />
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ fontSize: '3rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Hello, Welcome to my Website.</h2>
            <button
              onClick={() => parallaxRef.current.scrollTo(1)}
              className="btn btn-outline"
            >
              Go Down! :D
            </button>
          </div>
          <img src={steveGif} alt="Steve Wave" style={{ width: '200px' }} />
        </ParallaxLayer>

        {/* Hero Content */}
        <ParallaxLayer
          offset={1}
          speed={1}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
        >
          <div className="container">
            <section className="hero" style={{ minHeight: 'auto', paddingTop: '10vh' }}>
              <div className="hero-badge" ref={badgeRef}>Still seeking </div>
              <h1 className="hero-title" ref={titleRef}>
                <span>Crafting Digital</span> <br />
                <span>Experiences</span>
              </h1>
              <p className="hero-subtitle" ref={subtitleRef}>
                My name is Patuan Garcia Situmorang, Nice to meet You!
              </p>
              <div className="hero-buttons">
                <Link to="/contact" className="btn btn-primary">
                  Get in Touch
                </Link>
                <button
                  onClick={() => parallaxRef.current.scrollTo(2)}
                  className="btn btn-outline"
                >
                  Explore Features
                </button>
              </div>
            </section>
          </div>
        </ParallaxLayer>

        {/* Projects Content */}
        <ParallaxLayer
          offset={2}
          speed={1.5}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
        >
          <div className="container">
            <section id="projects" className="projects-section" style={{ padding: 0 }}>
              <h2 className="section-title">My Stuffs</h2>
              <div className="grid">
                <Link to="/backend" className="card" style={{ textDecoration: 'none' }}>
                  <div className="icon" style={{ fontSize: '2rem' }}>⚙️</div>
                  <h3 className="card-title">Interactive</h3>
                  <p className="card-desc">
                    Some interactive stuffs who created by my imaginations
                  </p>
                </Link>
              </div>
              <div style={{ textAlign: 'center', marginTop: '3rem' }}>
                <button
                  onClick={() => parallaxRef.current.scrollTo(0)}
                  className="btn btn-outline"
                >
                  Back to Top!
                </button>
              </div>
            </section>
          </div>
        </ParallaxLayer>

      </Parallax>
    </main>
  );
}
