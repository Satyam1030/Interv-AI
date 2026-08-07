import React from 'react';
import { Award, CheckCircle, AlertTriangle, ArrowRight, RefreshCw, Download, Layers } from 'lucide-react';

export default function FeedbackDashboard({ candidate, feedback, coveredDays, questionCount, onRestart }) {
  if (!feedback) return null;

  const downloadJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ candidate: candidate.member, feedback, coveredDays, questionCount }, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `IntervAI_Feedback_${candidate.member?.id || 'candidate'}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
      {/* Header Banner */}
      <div className="glass-card" style={{ marginBottom: '1.5rem', background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(16, 185, 129, 0.15) 100%)', border: '1px solid rgba(99, 102, 241, 0.3)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
              <Award size={28} color="#10b981" />
              <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Technical Interview Complete</h2>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
              Structured Evaluation Report for <strong>{candidate.member?.name}</strong> ({candidate.member?.jobRole})
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button className="nav-btn" onClick={downloadJson} style={{ border: '1px solid var(--border-color)' }}>
              <Download size={16} /> Export Feedback JSON
            </button>
            <button className="send-btn" onClick={onRestart}>
              <RefreshCw size={16} /> New Interview
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <div className="glass-card" style={{ textAlign: 'center', padding: '1.2rem' }}>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-primary)' }}>{questionCount}</div>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Total Turns Assessed</div>
        </div>

        <div className="glass-card" style={{ textAlign: 'center', padding: '1.2rem' }}>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-success)' }}>{coveredDays.length}</div>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Cohort Days Evaluated</div>
        </div>

        <div className="glass-card" style={{ textAlign: 'center', padding: '1.2rem' }}>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-secondary)' }}>
            {feedback.strengths?.length || 3}
          </div>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Key Strengths Identified</div>
        </div>
      </div>

      {/* Summary Box */}
      <div className="glass-card" style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--accent-secondary)' }}>
          📋 Executive Assessment Summary
        </h3>
        <p style={{ fontSize: '1.02rem', lineHeight: '1.7', color: '#e2e8f0' }}>
          {feedback.summary}
        </p>
      </div>

      {/* 3 Feedback Columns */}
      <div className="feedback-grid">
        {/* Strengths */}
        <div className="feedback-card strengths">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, color: '#34d399', fontSize: '1.1rem' }}>
            <CheckCircle size={20} /> Key Strengths
          </div>
          <ul className="feedback-list">
            {feedback.strengths?.map((item, idx) => (
              <li key={idx} className="feedback-item">
                <span style={{ color: '#34d399' }}>✓</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Knowledge Gaps */}
        <div className="feedback-card gaps">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, color: '#fbbf24', fontSize: '1.1rem' }}>
            <AlertTriangle size={20} /> Areas for Growth
          </div>
          <ul className="feedback-list">
            {feedback.gaps?.map((item, idx) => (
              <li key={idx} className="feedback-item">
                <span style={{ color: '#fbbf24' }}>!</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Recommended Next Steps */}
        <div className="feedback-card next">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, color: '#818cf8', fontSize: '1.1rem' }}>
            <ArrowRight size={20} /> Actionable Next Steps
          </div>
          <ul className="feedback-list">
            {feedback.next?.map((item, idx) => (
              <li key={idx} className="feedback-item">
                <span style={{ color: '#818cf8' }}>→</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
