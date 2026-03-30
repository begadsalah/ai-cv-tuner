import Link from 'next/link';
import { FileText, Wand2, TrendingUp } from 'lucide-react';

export default function Home() {
  return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header style={{ padding: '1.5rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontWeight: 'bold', fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ background: 'linear-gradient(135deg, var(--primary), var(--secondary))', padding: '8px', borderRadius: '8px', display: 'flex' }}>
            <Wand2 size={24} color="white" />
          </div>
          <span className="text-gradient">CVTuner</span>
        </div>
        <nav>
          <Link href="/dashboard" className="btn btn-glass">Go to App</Link>
        </nav>
      </header>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div className="glass-panel animate-fade-in" style={{ padding: '4rem', textAlign: 'center', maxWidth: '800px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(14, 165, 233, 0.1)', border: '1px solid rgba(14, 165, 233, 0.2)', padding: '6px 12px', borderRadius: '20px', marginBottom: '2rem', color: 'var(--secondary)', fontSize: '0.875rem', fontWeight: 500 }}>
            <TrendingUp size={16} /> <span>Powered by Google Gemini AI</span>
          </div>

          <h1 style={{ fontSize: '4rem', marginBottom: '1.5rem', fontWeight: 800, lineHeight: 1.1 }}>
            <span className="text-gradient">AI-Powered</span> <br /> CV Optimizer
          </h1>
          
          <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', marginBottom: '3rem', lineHeight: 1.6, maxWidth: '600px' }}>
            Upload your resume and the job description. Our advanced AI will analyze, rewrite, and optimize your CV to pass ATS systems, and generate a tailored cover letter.
          </p>
          
          <Link href="/dashboard" className="btn btn-primary" style={{ fontSize: '1.25rem', padding: '16px 36px', borderRadius: '30px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FileText size={20} /> Start Optimizing Now
          </Link>

          <div style={{ display: 'flex', gap: '2rem', marginTop: '4rem', color: 'var(--text-secondary)' }}>
            <div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'white', marginBottom: '0.5rem' }}>95%</div>
              <div style={{ fontSize: '0.875rem' }}>ATS Pass Rate</div>
            </div>
            <div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'white', marginBottom: '0.5rem' }}>10x</div>
              <div style={{ fontSize: '0.875rem' }}>Faster Writing</div>
            </div>
            <div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'white', marginBottom: '0.5rem' }}>100%</div>
              <div style={{ fontSize: '0.875rem' }}>Tailored output</div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
