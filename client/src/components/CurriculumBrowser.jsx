import React, { useState, useEffect } from 'react';
import { BookOpen, Wrench, CheckCircle } from 'lucide-react';

export default function CurriculumBrowser() {
  const [curriculum, setCurriculum] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/curriculum')
      .then(res => res.json())
      .then(data => {
        setCurriculum(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="glass-card" style={{ textAlign: 'center', padding: '4rem' }}>
        <p style={{ color: 'var(--text-muted)' }}>Loading AI Cohort Curriculum...</p>
      </div>
    );
  }

  if (!curriculum) return null;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div className="glass-card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
          <BookOpen size={24} color="#6366f1" />
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800 }}>31-Day Enterprise AI Cohort Curriculum</h2>
        </div>
        <p style={{ color: 'var(--text-muted)' }}>
          {curriculum.cohort} • 8 Core Engineering Modules
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.25rem' }}>
        {curriculum.days?.map((dayObj) => (
          <div key={dayObj.day} className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                <span className="badge badge-indigo">Day {dayObj.day}</span>
                <span className="tag" style={{ fontSize: '0.7rem' }}>{dayObj.type}</span>
              </div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.75rem' }}>{dayObj.title}</h3>

              <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                {dayObj.tools?.map((tool, idx) => (
                  <span key={idx} className="tag" style={{ fontSize: '0.72rem', background: 'rgba(99, 102, 241, 0.1)', color: '#a5b4fc' }}>
                    <Wrench size={10} style={{ display: 'inline', marginRight: '3px' }} /> {tool}
                  </span>
                ))}
              </div>

              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                <strong style={{ color: 'var(--text-main)' }}>Key Objectives:</strong>
                <ul style={{ paddingLeft: '1.1rem', marginTop: '0.3rem' }}>
                  {dayObj.objectives?.slice(0, 3).map((obj, i) => (
                    <li key={i} style={{ marginBottom: '0.2rem' }}>{obj}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
