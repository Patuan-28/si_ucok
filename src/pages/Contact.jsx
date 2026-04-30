import React, { useState, useEffect, useRef } from 'react';

import iconGithub from '../assets/icon-github.png';
import iconCodewars from '../assets/icon-codewars.png';
import iconInstagram from '../assets/icon-instagram.png';
import iconLinkedin from '../assets/icon-linkedin.png';
import iconSteam from '../assets/icon-steam.png';
import iconEpicgames from '../assets/icon-epicgames.png';
import iconRoblox from '../assets/icon-roblox.png';
import iconSpotify from '../assets/icon-spotify.png';
import iconYoutube from '../assets/icon-youtube.png';
import iconXbox from '../assets/icon-xbox.png';
import iconBattlenet from '../assets/icon-battlenet.png';

const socialIcons = [
  { name: 'GitHub', link: 'https://github.com/Patuan-28', img: iconGithub },
  { name: 'CodeWars', link: 'https://www.codewars.com/users/Patuan-28', img: iconCodewars },
  { name: 'Instagram', link: 'https://www.instagram.com/patuangs/', img: iconInstagram },
  // { name: 'LinkedIn', link: 'https://www.linkedin.com/in/patuan-situmorang-5848a6274/', img: iconLinkedin },
  { name: 'Steam', link: 'https://steamcommunity.com/', img: iconSteam },
  { name: 'Epic Games', link: 'https://store.epicgames.com/', img: iconEpicgames },
  { name: 'Roblox', link: 'https://www.roblox.com/', img: iconRoblox },
  { name: 'Spotify', link: 'https://open.spotify.com/user/217fmp2sareo6bnyi2nq43h4q?si=439b4fc8ed8d40b2', img: iconSpotify },
  { name: 'YouTube', link: 'https://www.youtube.com/', img: iconYoutube },
  { name: 'Xbox', link: 'https://www.xbox.com/', img: iconXbox },
  { name: 'Battle.net', link: 'https://battle.net/', img: iconBattlenet }
];

const ITEM_WIDTH = 160;
const ITEM_GAP = 24;
const ITEM_TOTAL_WIDTH = ITEM_WIDTH + ITEM_GAP;
const SET_WIDTH = socialIcons.length * ITEM_TOTAL_WIDTH;
const displayIcons = Array(15).fill(socialIcons).flat();

function SocialSlider() {
  const [renderX, setRenderX] = useState(0);
  const [isGrabbed, setIsGrabbed] = useState(false);

  const requestRef = useRef();
  const xRef = useRef(-SET_WIDTH * 5);
  const isDragging = useRef(false);
  const startMouseX = useRef(0);
  const startX = useRef(0);

  useEffect(() => {
    const animate = () => {
      if (!isDragging.current) {
        xRef.current -= 0.5;

        if (xRef.current <= -SET_WIDTH * 6) {
          xRef.current += SET_WIDTH;
        }
        setRenderX(xRef.current);
      }
      requestRef.current = requestAnimationFrame(animate);
    };
    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current);
  }, []);

  const handlePointerDown = (e) => {
    isDragging.current = true;
    setIsGrabbed(true);
    startMouseX.current = e.clientX || (e.touches && e.touches[0].clientX);
    startX.current = xRef.current;
  };

  const handlePointerMove = (e) => {
    if (!isDragging.current) return;
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const diff = clientX - startMouseX.current;

    xRef.current = startX.current + diff;

    if (xRef.current <= -SET_WIDTH * 6) {
      xRef.current += SET_WIDTH;
      startX.current += SET_WIDTH;
    } else if (xRef.current > -SET_WIDTH * 4) {
      xRef.current -= SET_WIDTH;
      startX.current -= SET_WIDTH;
    }

    setRenderX(xRef.current);
  };

  const handlePointerUp = () => {
    isDragging.current = false;
    setIsGrabbed(false);
  };

  const handleClick = (e) => {
    if (Math.abs(xRef.current - startX.current) > 3) {
      e.preventDefault();
    }
  };

  return (
    <div
      style={{
        width: '100%',
        height: '160px',
        overflow: 'hidden',
        cursor: isGrabbed ? 'grabbing' : 'grab',
        marginTop: '4rem',
        position: 'relative',
        touchAction: 'pan-y',
        maskImage: 'linear-gradient(to right, transparent, black 15%, black 85%, transparent)',
        WebkitMaskImage: 'linear-gradient(to right, transparent, black 15%, black 85%, transparent)'
      }}
      onMouseDown={handlePointerDown}
      onMouseMove={handlePointerMove}
      onMouseUp={handlePointerUp}
      onMouseLeave={handlePointerUp}
      onTouchStart={handlePointerDown}
      onTouchMove={handlePointerMove}
      onTouchEnd={handlePointerUp}
      onDragStart={(e) => e.preventDefault()}
    >
      <div style={{
        display: 'flex',
        gap: `${ITEM_GAP}px`,
        transform: `translate3d(${renderX}px, 0, 0)`,
        width: 'max-content',
        padding: '20px 0'
      }}>
        {displayIcons.map((icon, i) => (
          <a
            href={icon.link}
            target="_blank"
            rel="noreferrer"
            key={i}
            onClick={handleClick}
            style={{
              width: `${ITEM_WIDTH}px`,
              height: '120px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              background: 'var(--surface2)',
              border: '1px solid var(--border)',
              borderRadius: '16px',
              flexDirection: 'column',
              gap: '8px',
              textDecoration: 'none',
              userSelect: 'none',
              WebkitUserDrag: 'none',
              flexShrink: 0,
              boxShadow: '0 4px 15px rgba(124, 58, 237, 3)',
              transition: 'transform 0.2s, box-shadow 0.2s, border-color 0.2s'
            }}
            onMouseEnter={e => {
              if (!isDragging.current) {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.boxShadow = '0 10px 25px rgba(124, 58, 237, 4)';
                e.currentTarget.style.borderColor = 'var(--aura-hex)';
              }
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 15px rgba(124, 58, 237, 3)';
              e.currentTarget.style.borderColor = 'var(--border)';
            }}
          >
            {icon.img ? (
              <img src={icon.img} alt={icon.name} style={{ width: '40px', height: '40px', pointerEvents: 'none', objectFit: 'contain' }} />
            ) : (
              <svg viewBox="0 0 24 24" fill="var(--primary)" style={{ width: '40px', height: '40px', pointerEvents: 'none' }} dangerouslySetInnerHTML={{ __html: icon.svg }} />
            )}
            <span style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text)', pointerEvents: 'none' }}>{icon.name}</span>
          </a>
        ))}
      </div>
    </div>
  );
}

export default function Contact() {
  return (
    <main className="container fade-in">
      <section className="projects-section" style={{ paddingBottom: '100px', paddingTop: '100px' }}>
        <h2 className="section-title">Contact Us</h2>
        <div className="card" style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
            Contact me if you want to sharing or build something. And also I am open for a collaboration project.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
            <a href="mailto:patuangarcia@gmail.com" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 600, fontSize: '1.2rem' }}>
              📧 patuangarcia@gmail.com
            </a>
            <p style={{ margin: 0 }}>📍Indonesia</p>
          </div>
        </div>

        {/* 3D Social Slider */}
        <SocialSlider />

      </section>
    </main>
  );
}
