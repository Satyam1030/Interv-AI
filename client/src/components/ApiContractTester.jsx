import React, { useState } from 'react';
import { Terminal, CheckCircle2, XCircle, Play, FileJson, ShieldCheck } from 'lucide-react';

export default function ApiContractTester() {
  const [isRunning, setIsRunning] = useState(false);
  const [testResult, setTestResult] = useState(null);

  const runContractTest = async () => {
    setIsRunning(true);
    setTestResult(null);
    try {
      const res = await fetch('/api/test-suite/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      setTestResult(data);
    } catch (err) {
      setTestResult({ status: 'ERROR', error: err.message });
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div className="glass-card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.3rem' }}>
              <ShieldCheck size={24} color="#6366f1" />
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Technical Spec API Contract Validator</h2>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Validates compliance against <code style={{ fontFamily: 'var(--font-mono)', color: '#38bdf8' }}>POST /api/interview</code> specification.
            </p>
          </div>

          <button 
            className="send-btn" 
            onClick={runContractTest}
            disabled={isRunning}
          >
            {isRunning ? (
              <>
                <div className="wave-container">
                  <div className="wave-bar"></div>
                  <div className="wave-bar"></div>
                  <div className="wave-bar"></div>
                </div>
                Testing Contract...
              </>
            ) : (
              <>
                <Play size={16} /> Run Automated 8-Turn Test
              </>
            )}
          </button>
        </div>
      </div>

      {testResult && (
        <div className="glass-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
            {testResult.passed ? (
              <CheckCircle2 size={24} color="#10b981" />
            ) : (
              <XCircle size={24} color="#ef4444" />
            )}
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>
              Test Status: <span style={{ color: testResult.passed ? '#34d399' : '#f87171' }}>{testResult.status}</span>
            </h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
            <div style={{ background: 'rgba(9, 13, 22, 0.5)', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Questions Assessed</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 700 }}>{testResult.totalQuestions || 0} / 8+</div>
            </div>
            <div style={{ background: 'rgba(9, 13, 22, 0.5)', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Curriculum Days Covered</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 700 }}>{testResult.coveredDays?.length || 0} / 4+</div>
            </div>
            <div style={{ background: 'rgba(9, 13, 22, 0.5)', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Feedback Schema Match</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 700, color: testResult.passed ? '#34d399' : '#f87171' }}>
                {testResult.passed ? 'VALID (100%)' : 'INVALID'}
              </div>
            </div>
          </div>

          <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>
            Turn Execution Trace:
          </div>
          <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
            <pre className="code-block">
              {JSON.stringify(testResult, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
