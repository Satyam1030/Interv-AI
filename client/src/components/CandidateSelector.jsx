import React, { useState } from 'react';
import { User, Award, AlertTriangle, Play, Search, CheckCircle, Flame } from 'lucide-react';

export default function CandidateSelector({ candidates, onSelectCandidate, loading }) {
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = candidates.filter(c => 
    c.member?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.member?.jobRole?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800 }}>Cohort Candidate Roster</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Select a graduate profile to initiate a personalized, multi-turn technical interview.
          </p>
        </div>

        <div style={{ position: 'relative', minWidth: '280px' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
          <input
            type="text"
            placeholder="Search candidate by name or role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="chat-input"
            style={{ paddingLeft: '2.5rem', width: '100%', height: '42px', minHeight: '42px' }}
          />
        </div>
      </div>

      {loading ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '4rem' }}>
          <div className="wave-container" style={{ justifyContent: 'center', marginBottom: '1rem' }}>
            <div className="wave-bar"></div>
            <div className="wave-bar"></div>
            <div className="wave-bar"></div>
            <div className="wave-bar"></div>
          </div>
          <p style={{ color: 'var(--text-muted)' }}>Loading AI Cohort candidates dataset...</p>
        </div>
      ) : (
        <div className="candidates-grid">
          {filtered.map((candidate) => {
            const member = candidate.member || {};
            const missions = candidate.missions || [];
            const signals = candidate.signals || {};

            const skippedCount = missions.filter(m => m.skipped).length;
            const highAttemptCount = missions.filter(m => m.attempts >= 3).length;

            return (
              <div 
                key={member.id} 
                className="glass-card candidate-card"
                onClick={() => onSelectCandidate(candidate)}
              >
                <div>
                  <div className="candidate-header">
                    <div>
                      <div className="candidate-name">{member.name}</div>
                      <div className="candidate-role">{member.jobRole} • {member.yearsExperience} yrs exp</div>
                    </div>
                    <span className="badge badge-indigo">{member.id}</span>
                  </div>

                  <div style={{ fontSize: '0.85rem', color: 'var(--text-dim)', marginBottom: '1rem' }}>
                    🎓 {member.education}
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                    <span className="tag passed">
                      <CheckCircle size={12} style={{ display: 'inline', marginRight: '4px' }} />
                      {signals.missionsCompleted || missions.length} Passed
                    </span>

                    {skippedCount > 0 && (
                      <span className="tag skipped">
                        <AlertTriangle size={12} style={{ display: 'inline', marginRight: '4px' }} />
                        {skippedCount} Skipped
                      </span>
                    )}

                    {highAttemptCount > 0 && (
                      <span className="tag attempts">
                        <Flame size={12} style={{ display: 'inline', marginRight: '4px' }} />
                        {highAttemptCount} Probed
                      </span>
                    )}
                  </div>
                </div>

                <div style={{ paddingTop: '1rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    🔥 {signals.commitDays || 25} Commit Days
                  </span>
                  <button className="send-btn" style={{ height: '36px', padding: '0 1rem', fontSize: '0.85rem' }}>
                    Start Interview <Play size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
