import React, { useState, useEffect } from 'react';
import { Bot, Users, BookOpen, ShieldCheck, Play, Award, LogOut, ChevronDown, ChevronUp, UserCheck } from 'lucide-react';
import LoginPage from './components/LoginPage';
import CandidateSelector from './components/CandidateSelector';
import InterviewArena from './components/InterviewArena';
import FeedbackDashboard from './components/FeedbackDashboard';
import ApiContractTester from './components/ApiContractTester';
import CurriculumBrowser from './components/CurriculumBrowser';

export default function App() {
  const [activeTab, setActiveTab] = useState('login'); // login | roster | interview | feedback | contract | curriculum
  const [candidates, setCandidates] = useState([]);
  const [loadingCandidates, setLoadingCandidates] = useState(true);
  const [isSlideDownBarOpen, setIsSlideDownBarOpen] = useState(false);

  // Active Session State
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [sessionId, setSessionId] = useState('');
  const [turnHistory, setTurnHistory] = useState([]);
  const [coveredDays, setCoveredDays] = useState([]);
  const [questionCount, setQuestionCount] = useState(0);
  const [currentTopicDay, setCurrentTopicDay] = useState(7);
  const [isComplete, setIsComplete] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [isThinking, setIsThinking] = useState(false);

  // Fetch candidates on load
  useEffect(() => {
    fetch('/api/candidates')
      .then(res => res.json())
      .then(data => {
        setCandidates(data.candidates || []);
        setLoadingCandidates(false);
      })
      .catch(err => {
        console.error('Failed to load candidates:', err);
        setLoadingCandidates(false);
      });
  }, []);

  // Initiate new technical interview session
  const handleSelectCandidate = async (candidate) => {
    setSelectedCandidate(candidate);
    setIsSlideDownBarOpen(false);
    const newSessionId = `session-${candidate.member?.id || 'CAND'}-${Date.now()}`;
    setSessionId(newSessionId);
    setTurnHistory([]);
    setCoveredDays([]);
    setQuestionCount(0);
    setIsComplete(false);
    setFeedback(null);
    setIsThinking(true);
    setActiveTab('interview');

    try {
      const response = await fetch('/api/interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: newSessionId,
          candidate
        })
      });
      const data = await response.json();

      setTurnHistory([
        { role: 'interviewer', content: data.reply, timestamp: new Date(), topicDay: 7 }
      ]);
      setQuestionCount(1);
      setCoveredDays([7]);
    } catch (err) {
      console.error('Failed to start interview:', err);
    } finally {
      setIsThinking(false);
    }
  };

  // Send candidate turn message
  const handleSendMessage = async (userMessage) => {
    if (!sessionId || isThinking || isComplete) return;

    const updatedHistory = [
      ...turnHistory,
      { role: 'candidate', content: userMessage, timestamp: new Date() }
    ];
    setTurnHistory(updatedHistory);
    setIsThinking(true);

    try {
      const response = await fetch('/api/interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          message: userMessage
        })
      });
      const data = await response.json();

      const sessionRes = await fetch(`/api/interview/${sessionId}`);
      const sessionData = await sessionRes.json();
      const session = sessionData.session || {};

      setTurnHistory(session.turnHistory || updatedHistory);
      setCoveredDays(session.coveredDays || []);
      setQuestionCount(session.questionCount || questionCount + 1);
      setCurrentTopicDay(session.currentTopicDay || 7);

      if (data.done) {
        setIsComplete(true);
        setFeedback(data.feedback);
        setTimeout(() => {
          setActiveTab('feedback');
        }, 1500);
      }
    } catch (err) {
      console.error('Failed to process message:', err);
    } finally {
      setIsThinking(false);
    }
  };

  const handleLogout = () => {
    setSelectedCandidate(null);
    setSessionId('');
    setTurnHistory([]);
    setFeedback(null);
    setActiveTab('login');
  };

  return (
    <div className="app-container">
      {/* Header Navigation with Slide Down Bar */}
      <header className="header">
        <div className="brand" style={{ cursor: 'pointer' }} onClick={() => setActiveTab('login')}>
          ⚡ IntervAI <span className="brand-badge">The Interview Agent</span>
        </div>

        {/* Slide-Down Candidate Quick Switcher in Header */}
        {activeTab !== 'login' && (
          <div style={{ position: 'relative' }}>
            <button 
              onClick={() => setIsSlideDownBarOpen(!isSlideDownBarOpen)}
              className="nav-btn"
              style={{ background: 'rgba(99, 102, 241, 0.15)', border: '1px solid rgba(99, 102, 241, 0.3)', color: '#a5b4fc' }}
            >
              <UserCheck size={16} /> 
              <span>{selectedCandidate ? selectedCandidate.member?.name : 'Select Candidate'}</span>
              {isSlideDownBarOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>

            {/* Slide Down Bar Menu */}
            {isSlideDownBarOpen && (
              <div 
                style={{
                  position: 'absolute',
                  top: '110%',
                  right: 0,
                  width: '320px',
                  background: 'rgba(15, 23, 42, 0.95)',
                  border: '1px solid rgba(99, 102, 241, 0.3)',
                  borderRadius: '14px',
                  padding: '0.75rem',
                  boxShadow: '0 15px 40px rgba(0, 0, 0, 0.6)',
                  backdropFilter: 'blur(16px)',
                  zIndex: 100
                }}
              >
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.5rem', padding: '0 0.5rem' }}>
                  SLIDE-DOWN CANDIDATE SELECTOR
                </div>
                {candidates.map(candidate => (
                  <div
                    key={candidate.member?.id}
                    onClick={() => handleSelectCandidate(candidate)}
                    style={{
                      padding: '0.6rem 0.8rem',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: selectedCandidate?.member?.id === candidate.member?.id ? 'rgba(99, 102, 241, 0.25)' : 'transparent',
                      color: '#fff',
                      marginBottom: '0.2rem'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600 }}>{candidate.member?.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{candidate.member?.jobRole}</div>
                    </div>
                    <span className="badge badge-indigo" style={{ fontSize: '0.68rem' }}>{candidate.member?.id}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <nav className="nav-links">
          {activeTab !== 'login' && (
            <>
              <button 
                className={`nav-btn ${activeTab === 'roster' ? 'active' : ''}`}
                onClick={() => setActiveTab('roster')}
              >
                <Users size={16} /> Roster
              </button>

              {selectedCandidate && (
                <button 
                  className={`nav-btn ${activeTab === 'interview' ? 'active' : ''}`}
                  onClick={() => setActiveTab('interview')}
                >
                  <Bot size={16} /> Interview Arena
                </button>
              )}

              {feedback && (
                <button 
                  className={`nav-btn ${activeTab === 'feedback' ? 'active' : ''}`}
                  onClick={() => setActiveTab('feedback')}
                >
                  <Award size={16} /> Scorecard
                </button>
              )}

              <button 
                className={`nav-btn ${activeTab === 'contract' ? 'active' : ''}`}
                onClick={() => setActiveTab('contract')}
              >
                <ShieldCheck size={16} /> Spec Tester
              </button>

              <button 
                className={`nav-btn ${activeTab === 'curriculum' ? 'active' : ''}`}
                onClick={() => setActiveTab('curriculum')}
              >
                <BookOpen size={16} /> Curriculum
              </button>

              <button 
                className="nav-btn"
                onClick={handleLogout}
                style={{ color: '#f87171' }}
              >
                <LogOut size={16} /> Logout
              </button>
            </>
          )}

          {activeTab === 'login' && (
            <button 
              className={`nav-btn ${activeTab === 'contract' ? 'active' : ''}`}
              onClick={() => setActiveTab('contract')}
            >
              <ShieldCheck size={16} /> API Spec Tester
            </button>
          )}
        </nav>
      </header>

      {/* Main View Area */}
      <main className="main-content">
        {activeTab === 'login' && (
          <LoginPage 
            candidates={candidates}
            onLoginCandidate={handleSelectCandidate}
            loading={loadingCandidates}
          />
        )}

        {activeTab === 'roster' && (
          <CandidateSelector 
            candidates={candidates}
            onSelectCandidate={handleSelectCandidate}
            loading={loadingCandidates}
          />
        )}

        {activeTab === 'interview' && selectedCandidate && (
          <InterviewArena 
            candidate={selectedCandidate}
            sessionId={sessionId}
            turnHistory={turnHistory}
            coveredDays={coveredDays}
            questionCount={questionCount}
            currentTopicDay={currentTopicDay}
            isComplete={isComplete}
            isThinking={isThinking}
            onSendMessage={handleSendMessage}
            onViewFeedback={() => setActiveTab('feedback')}
          />
        )}

        {activeTab === 'feedback' && selectedCandidate && (
          <FeedbackDashboard 
            candidate={selectedCandidate}
            feedback={feedback}
            coveredDays={coveredDays}
            questionCount={questionCount}
            onRestart={() => setActiveTab('roster')}
          />
        )}

        {activeTab === 'contract' && (
          <ApiContractTester />
        )}

        {activeTab === 'curriculum' && (
          <CurriculumBrowser />
        )}
      </main>
    </div>
  );
}
