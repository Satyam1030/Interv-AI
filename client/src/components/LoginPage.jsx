import React, { useState } from 'react';
import { UserCheck, ChevronDown, ChevronUp, Sparkles, CheckCircle, AlertTriangle, Flame, Shield, ArrowRight, Search } from 'lucide-react';

export default function LoginPage({ candidates, onLoginCandidate, loading }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCandidates = candidates.filter(c =>
    c.member?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.member?.jobRole?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (candidate) => {
    setSelectedCandidate(candidate);
    setIsDropdownOpen(false);
  };

  const handleProceedLogin = () => {
    if (selectedCandidate) {
      onLoginCandidate(selectedCandidate);
    }
  };

  return (
    <div style={{ maxWidth: '850px', margin: '2rem auto', minHeight: '80vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      {/* Login Hero Box */}
      <div className="glass-card" style={{ padding: '2.5rem', background: 'linear-gradient(135deg, rgba(18, 26, 43, 0.85) 0%, rgba(30, 41, 59, 0.85) 100%)', border: '1px solid rgba(99, 102, 241, 0.3)', boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)' }}>
        
        {/* Portal Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '18px', background: 'linear-gradient(135deg, #6366f1, #38bdf8)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 24px rgba(99, 102, 241, 0.4)', marginBottom: '1rem' }}>
            <UserCheck size={32} color="#ffffff" />
          </div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800, background: 'linear-gradient(135deg, #ffffff 0%, #cbd5e1 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-0.02em' }}>
            Candidate Portal Authentication
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem', marginTop: '0.5rem' }}>
            Select a candidate from the slide-down menu to begin their personalized AI Cohort technical interview.
          </p>
        </div>

        {/* Slide-Down Candidate Selection Bar */}
        <div style={{ marginBottom: '2rem', position: 'relative' }}>
          <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.6rem' }}>
            Select Candidate Profile
          </label>

          {/* Trigger Bar */}
          <div 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            style={{
              background: 'rgba(9, 13, 22, 0.85)',
              border: '2px solid ' + (isDropdownOpen ? 'var(--accent-primary)' : 'var(--border-color)'),
              borderRadius: '14px',
              padding: '1rem 1.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              transition: 'all 0.25s ease',
              boxShadow: isDropdownOpen ? '0 0 0 4px rgba(99, 102, 241, 0.2)' : 'none'
            }}
          >
            {selectedCandidate ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'linear-gradient(135deg, #6366f1, #38bdf8)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#fff' }}>
                  {selectedCandidate.member?.name?.charAt(0)}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '1rem', color: '#fff' }}>{selectedCandidate.member?.name}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{selectedCandidate.member?.jobRole} • {selectedCandidate.member?.yearsExperience} yrs exp</div>
                </div>
              </div>
            ) : (
              <span style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                -- Click to slide down candidate list --
              </span>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-primary)' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{isDropdownOpen ? 'Close Menu' : 'Slide Down'}</span>
              {isDropdownOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </div>
          </div>

          {/* Animated Slide-Down Bar Panel */}
          {isDropdownOpen && (
            <div 
              style={{
                marginTop: '0.5rem',
                background: 'rgba(15, 23, 42, 0.95)',
                border: '1px solid rgba(99, 102, 241, 0.3)',
                borderRadius: '16px',
                padding: '1.25rem',
                maxHeight: '380px',
                overflowY: 'auto',
                boxShadow: '0 15px 40px rgba(0, 0, 0, 0.6)',
                backdropFilter: 'blur(16px)',
                animation: 'slideDown 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
              }}
            >
              {/* Filter search */}
              <div style={{ position: 'relative', marginBottom: '1rem' }}>
                <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
                <input
                  type="text"
                  placeholder="Filter candidate by name or role..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="chat-input"
                  style={{ paddingLeft: '2.3rem', width: '100%', height: '38px', minHeight: '38px', fontSize: '0.85rem' }}
                />
              </div>

              {loading ? (
                <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '1rem' }}>Loading candidates...</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  {filteredCandidates.map((candidate) => {
                    const member = candidate.member || {};
                    const isSelected = selectedCandidate?.member?.id === member.id;
                    const skipped = (candidate.missions || []).filter(m => m.skipped).length;

                    return (
                      <div
                        key={member.id}
                        onClick={() => handleSelect(candidate)}
                        style={{
                          padding: '0.85rem 1rem',
                          borderRadius: '12px',
                          background: isSelected ? 'rgba(99, 102, 241, 0.25)' : 'rgba(255, 255, 255, 0.03)',
                          border: '1px solid ' + (isSelected ? 'var(--accent-primary)' : 'transparent'),
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: 'rgba(99, 102, 241, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#a5b4fc' }}>
                            {member.name?.charAt(0)}
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: '0.92rem', color: '#fff' }}>{member.name}</div>
                            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{member.jobRole} • {member.education}</div>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          {skipped > 0 && (
                            <span className="tag skipped" style={{ fontSize: '0.7rem' }}>
                              {skipped} Skipped
                            </span>
                          )}
                          <span className="badge badge-indigo" style={{ fontSize: '0.7rem' }}>{member.id}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Selected Candidate Quick Overview */}
        {selectedCandidate && (
          <div style={{ background: 'rgba(9, 13, 22, 0.6)', borderRadius: '14px', padding: '1.25rem', border: '1px solid var(--border-color)', marginBottom: '2rem' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent-secondary)', marginBottom: '0.5rem' }}>
              🎯 Learning Curriculum Profile Loaded
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem', fontSize: '0.85rem' }}>
              <div>
                <span style={{ color: 'var(--text-dim)' }}>Completed Missions: </span>
                <strong style={{ color: '#34d399' }}>{selectedCandidate.signals?.missionsCompleted || 28} / 31 Days</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-dim)' }}>Commit Days: </span>
                <strong style={{ color: '#a5b4fc' }}>{selectedCandidate.signals?.commitDays || 25} Days</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-dim)' }}>First-Try Passes: </span>
                <strong style={{ color: '#fbbf24' }}>{selectedCandidate.signals?.missionsFirstTry || 15} Missions</strong>
              </div>
            </div>
          </div>
        )}

        {/* Action Button */}
        <button
          className="send-btn"
          onClick={handleProceedLogin}
          disabled={!selectedCandidate}
          style={{
            width: '100%',
            height: '56px',
            fontSize: '1.05rem',
            justifyContent: 'center',
            background: selectedCandidate ? 'linear-gradient(135deg, #6366f1 0%, #38bdf8 100%)' : 'rgba(255, 255, 255, 0.1)'
          }}
        >
          {selectedCandidate ? (
            <>
              Login as {selectedCandidate.member?.name} & Start Technical Interview <ArrowRight size={18} />
            </>
          ) : (
            'Select a candidate above to unlock interview'
          )}
        </button>
      </div>

      {/* Animation styling inline */}
      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
