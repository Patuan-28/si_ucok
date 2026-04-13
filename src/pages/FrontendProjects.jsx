import React from 'react';

const FRONTEND_PROJECTS = [
  {
    id: 1,
    title: 'Glassmorphism Sidebar',
    description: 'A modern, translucent sidebar with frosted glass effects and smooth hover states.',
    icon: '🏢',
    tech: ['React', 'CSS Variables', 'Glassmorphism']
  },
  {
    id: 2,
    title: 'Neumorphic Buttons',
    description: 'Interactive buttons with realistic shadow effects that mimic physical push actions.',
    icon: '🔘',
    tech: ['CSS Shadows', 'Micro-interactions']
  },
  {
    id: 3,
    title: 'Anime.js Hero Reveal',
    description: 'A sophisticated landing page entrance with staggered text and element animations.',
    icon: '✨',
    tech: ['Anime.js', 'Web Animations API']
  },
  {
    id: 4,
    title: 'Dynamic Theme Toggle',
    description: 'A smooth transition system between light and dark modes with color interpolation.',
    icon: '🌗',
    tech: ['React Context', 'Local Storage']
  }
];

export default function FrontendProjects() {
  return (
    <main className="container fade-in" style={{ paddingTop: '100px', minHeight: '80vh' }}>
      <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <h1 className="section-title">🎨 Frontend UI Showcase</h1>
        <p style={{ color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto' }}>
          Eksplorasi desain antarmuka modern, animasi halus, dan komponen UI yang interaktif.
        </p>
      </div>

      <div className="grid">
        {FRONTEND_PROJECTS.map(project => (
          <div key={project.id} className="card" style={{ transition: 'transform 0.3s ease' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1.5rem' }}>{project.icon}</div>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
              {project.tech.map(t => (
                <span key={t} style={{ fontSize: '0.7rem', padding: '2px 10px', background: 'var(--primary)', color: 'white', borderRadius: '10px' }}>
                  {t}
                </span>
              ))}
            </div>
            <h3 className="card-title">{project.title}</h3>
            <p className="card-desc">{project.description}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
