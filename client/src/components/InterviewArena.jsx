import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Award, CheckCircle, HelpCircle, Layers, Sparkles, Terminal, ArrowRight } from 'lucide-react';

export default function InterviewArena({
  candidate,
  sessionId,
  turnHistory,
  coveredDays,
  questionCount,
  currentTopicDay,
  isComplete,
  isThinking,
  onSendMessage,
  onViewFeedback
}) {
  const [inputMessage, setInputMessage] = useState('');
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [turnHistory, isThinking]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || isThinking || isComplete) return;
    onSendMessage(inputMessage);
    setInputMessage('');
  };

  // Sample quick answers for fast demo testing
  const handleQuickAnswer = (text) => {
    setInputMessage(text);
  };

  const progressPercent = Math.min(Math.round((questionCount / 8) * 100), 100);

  return (
    <div className="arena-container">
      {/* Sidebar Info */}
      <div className="sidebar-panel">
        <div className="glass-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'linear-gradient(135deg, #6366f1, #38bdf8)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>
              {candidate.member?.name?.charAt(0) || 'C'}
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '1.05rem' }}>{candidate.member?.name}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{candidate.member?.jobRole}</div>
            </div>
          </div>

          <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '1rem' }}>
            Session ID: <span className="badge badge-indigo" style={{ fontFamily: 'var(--font-mono)' }}>{sessionId}</span>
          </div>

          {/* Metrics */}
          <div style={{ background: 'rgba(9, 13, 22, 0.6)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-color)', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.4rem', fontWeight: 600 }}>
              <span>Interview Progress</span>
              <span style={{ color: 'var(--accent-secondary)' }}>{questionCount} / 8+ Questions</span>
            </div>
            <div className="progress-track" style={{ marginBottom: '1rem' }}>
              <div className="progress-fill" style={{ width: `${progressPercent}%` }}></div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 600 }}>
              <span>Curriculum Coverage</span>
              <span style={{ color: 'var(--accent-success)' }}>{coveredDays.length} / 4+ Modules</span>
            </div>
          </div>

          <div style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-muted)' }}>
            Modules Covered in Session:
          </div>
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            {coveredDays.map(day => (
              <span key={day} className="tag passed" style={{ fontSize: '0.75rem' }}>
                Day {day}
              </span>
            ))}
            {coveredDays.length === 0 && <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Session initialized...</span>}
          </div>
        </div>

        {/* Dynamic Focus Area Card */}
        <div className="glass-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-secondary)', fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.75rem' }}>
            <Layers size={16} /> Current Focus Topic
          </div>
          <div style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.25rem' }}>
            Day {currentTopicDay || 7}
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            IntervAI is evaluating technical decision-making, code architecture choices, and edge-case resilience for this cohort mission.
          </p>
        </div>

        {isComplete && (
          <button className="send-btn" style={{ width: '100%', background: 'linear-gradient(135deg, #10b981, #059669)' }} onClick={onViewFeedback}>
            View Final Scorecard <Award size={18} />
          </button>
        )}
      </div>

      {/* Main Chat Panel */}
      <div className="glass-card chat-panel" style={{ padding: 0 }}>
        <div className="chat-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(99, 102, 241, 0.2)', border: '1px solid rgba(99, 102, 241, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Bot size={20} color="#a5b4fc" />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                IntervAI <span className="brand-badge">Gemini Orchestrator</span>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {isThinking ? 'Analyzing response & adapting...' : 'Live Technical Interviewer'}
              </div>
            </div>
          </div>

          {isThinking && (
            <div className="wave-container">
              <div className="wave-bar"></div>
              <div className="wave-bar"></div>
              <div className="wave-bar"></div>
              <div className="wave-bar"></div>
            </div>
          )}
        </div>

        {/* Message Feed */}
        <div className="chat-messages">
          {turnHistory.map((msg, index) => {
            const isInterviewer = msg.role === 'interviewer';
            return (
              <div key={index} className={`message-bubble ${msg.role}`}>
                <div className="message-meta">
                  {isInterviewer ? (
                    <>
                      <Bot size={14} color="#a5b4fc" />
                      <span>IntervAI</span>
                      {msg.topicDay && <span className="badge badge-indigo">Day {msg.topicDay}</span>}
                    </>
                  ) : (
                    <>
                      <User size={14} />
                      <span>{candidate.member?.name || 'Candidate'}</span>
                    </>
                  )}
                </div>
                <div>{msg.content}</div>
              </div>
            );
          })}

          {isThinking && (
            <div className="message-bubble interviewer" style={{ opacity: 0.7 }}>
              <div className="message-meta">
                <Bot size={14} color="#a5b4fc" />
                <span>IntervAI</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
                <span>IntervAI is formulating follow-up question...</span>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Quick Answer suggestions for testing/demo */}
        {!isComplete && (
          <div style={{ padding: '0.5rem 1.5rem', display: 'flex', gap: '0.5rem', overflowX: 'auto', borderTop: '1px solid var(--border-color)', background: 'rgba(9, 13, 22, 0.4)' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', alignSelf: 'center', whiteSpace: 'nowrap' }}>
              💡 Preset Responses:
            </span>
            <button 
              className="tag" 
              style={{ cursor: 'pointer', whiteSpace: 'nowrap' }}
              onClick={() => handleQuickAnswer("I implemented SentenceTransformers embeddings with ChromaDB vector store, using 512-token chunks with 50-token overlap.")}
            >
              RAG & Embeddings Architecture
            </button>
            <button 
              className="tag" 
              style={{ cursor: 'pointer', whiteSpace: 'nowrap' }}
              onClick={() => handleQuickAnswer("We used OpenAI Function Calling with strict Pydantic schema validation to ensure structured JSON output for healthcare claims.")}
            >
              Function Calling & Schemas
            </button>
            <button 
              className="tag" 
              style={{ cursor: 'pointer', whiteSpace: 'nowrap' }}
              onClick={() => handleQuickAnswer("For deployment, we containerized with Docker and set up Kubernetes with Prometheus metrics to observe p95 latency.")}
            >
              K8s & Monitoring Setup
            </button>
          </div>
        )}

        {/* Chat Input */}
        <form onSubmit={handleSubmit} className="chat-input-area">
          <textarea
            className="chat-input"
            placeholder={isComplete ? "Interview concluded. Check scorecard above." : "Type your technical response..."}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            disabled={isThinking || isComplete}
          />
          <button type="submit" className="send-btn" disabled={!inputMessage.trim() || isThinking || isComplete}>
            Send <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}
