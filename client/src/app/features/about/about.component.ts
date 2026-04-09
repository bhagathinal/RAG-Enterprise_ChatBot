import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="about-wrapper">
      <!-- ── Header ── -->
      <header class="top-nav">
        <div class="nav-left" routerLink="/dashboard">
          <div class="logo-box">
             <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="9" y1="3" x2="9" y2="21"/></svg>
          </div>
          <span class="brand-name">AcmeCorp</span>
        </div>
        <nav class="nav-middle">
          <a routerLink="/dashboard" class="nav-link">Dashboard</a>
          <a routerLink="/about" class="nav-link active">About</a>
          <a routerLink="/policies" class="nav-link">Policies</a>
          <a routerLink="/chat" class="nav-link">AI Assistant</a>
        </nav>
        <div class="nav-right">
           <button class="btn-primary" routerLink="/chat">Ask Aria</button>
        </div>
      </header>

      <!-- ── Hero Section ── -->
      <section class="hero-section">
        <div class="hero-container">
          <div class="hero-content">
            <span class="badge">OUR VISION</span>
            <h1>The Future of Workplace <span class="gradient-text">Intelligence.</span></h1>
            <p>AcmeCorp is dedicated to building a horizontal HR ecosystem where technology empowers people, not replaces them. Through Aria, we're redefining how knowledge is shared within the enterprise.</p>
          </div>
          <div class="hero-visual">
            <div class="visual-blob"></div>
            <div class="visual-card">
              <div class="aria-orb">★</div>
              <div class="card-line"></div>
              <div class="card-line short"></div>
            </div>
          </div>
        </div>
      </section>

      <!-- ── Meet Aria ── -->
      <section class="aria-section">
        <div class="container">
          <div class="section-header">
            <h2>Meet your AI partner: <span class="blue-text">Aria</span></h2>
            <p>Aria isn't just a chatbot. She's a sophisticated Retrieval-Augmented Generation (RAG) engine built to understand the nuances of AcmeCorp's organizational culture and policies.</p>
          </div>
          
          <div class="feature-grid">
            <div class="feature-card rose">
              <div class="feat-icon">🎯</div>
              <h3>Context-Aware</h3>
              <p>Aria indexes thousands of document segments to provide answers tailored to our specific company policies.</p>
            </div>
            <div class="feature-card amber">
              <div class="feat-icon">🔒</div>
              <h3>Secure & Private</h3>
              <p>All interactions are encrypted and kept within the AcmeCorp ecosystem. Your data never leaves our secure perimeter.</p>
            </div>
            <div class="feature-card blue">
              <div class="feat-icon">⚡</div>
              <h3>Instant Clarity</h3>
              <p>No more digging through PDFs. Get the exact information you need in seconds with clear source citations.</p>
            </div>
          </div>
        </div>
      </section>

      <!-- ── Values ── -->
      <section class="values-section">
        <div class="container">
          <div class="values-grid">
            <div class="value-text">
              <span class="badge">CORE PRINCIPLES</span>
              <h2>What drives us at AcmeCorp</h2>
              <p>We believe that a well-informed workforce is a happy workforce. Our mission is to eliminate information silos and create a transparent, accessible work environment for everyone.</p>
            </div>
            <div class="value-items">
               <div class="value-item blue">
                 <span class="v-num">01</span>
                 <div class="v-content">
                   <h4>Radical Transparency</h4>
                   <p>Every policy, goal, and strategy is accessible to every employee.</p>
                 </div>
               </div>
               <div class="value-item green">
                 <span class="v-num">02</span>
                 <div class="v-content">
                   <h4>Human-Centered AI</h4>
                   <p>We use technology to solve human problems, keeping the 'H' in HR.</p>
                 </div>
               </div>
               <div class="value-item purple">
                 <span class="v-num">03</span>
                 <div class="v-content">
                   <h4>Agile Innovation</h4>
                   <p>Constantly evolving our tools to match the speed of the modern world.</p>
                 </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ── CTA ── -->
      <section class="cta-section">
        <div class="cta-inner">
          <h2>Ready to explore our policies?</h2>
          <p>Start a conversation with Aria today and experience the difference.</p>
          <button class="btn-main" routerLink="/chat">Get Started with Aria →</button>
        </div>
      </section>

      <footer class="footer">
        <p>© 2026 AcmeCorp · All Rights Reserved · <a href="#">Privacy Policy</a></p>
      </footer>
    </div>
  `,
  styles: [`
    :host { --aria-dark: #1e3a8a; --aria-blue: #3b82f6; --aria-bg: #f8fbff; }
    
    .about-wrapper { background: var(--aria-bg); color: #0f172a; font-family: 'Inter', sans-serif; overflow-x: hidden; min-height: 100vh; }
    .container { max-width: 1100px; margin: 0 auto; padding: 0 20px; }

    /* Nav */
    .top-nav { background: white; border-radius: 16px; padding: 12px 24px; display: flex; align-items: center; justify-content: space-between; box-shadow: 0 4px 20px rgba(0,0,0,0.03); border: 1px solid #edf2f7; margin: 20px auto; max-width: 1100px; width: calc(100% - 40px); }
    .nav-left { display: flex; align-items: center; gap: 12px; cursor: pointer; }
    .logo-box { width: 32px; height: 32px; background: var(--aria-dark); border-radius: 8px; display: flex; align-items: center; justify-content: center; color: white; }
    .brand-name { font-size: 18px; font-weight: 800; color: #0f172a; }
    .nav-middle { display: flex; gap: 24px; }
    .nav-link { text-decoration: none; font-size: 14px; font-weight: 600; color: #64748b; padding: 4px 0; border-bottom: 2px solid transparent; transition: all 0.2s; }
    .nav-link:hover { color: var(--aria-blue); }
    .nav-link.active { color: var(--aria-dark); border-bottom-color: var(--aria-dark); }
    .btn-primary { background: var(--aria-dark); color: white; border: none; padding: 8px 20px; border-radius: 8px; font-weight: 700; cursor: pointer; font-size: 14px; transition: all 0.2s; }
    .btn-primary:hover { background: var(--aria-blue); transform: translateY(-2px); }

    /* Hero */
    .hero-section { padding: 100px 0; background: var(--aria-dark); color: white; position: relative; overflow: hidden; border-radius: 32px; margin: 0 20px 40px; box-shadow: 0 20px 60px rgba(30,58,138,0.15); }
    .hero-container { max-width: 1000px; margin: 0 auto; padding: 0 20px; display: grid; grid-template-columns: 1.2fr 1fr; gap: 60px; align-items: center; }
    .badge { display: inline-block; padding: 6px 14px; border-radius: 99px; background: rgba(255,255,255,0.1); color: white; border: 1.5px solid rgba(255,255,255,0.2); font-size: 11px; font-weight: 800; letter-spacing: 0.1em; margin-bottom: 24px; }
    .hero-content h1 { font-size: 52px; font-weight: 900; line-height: 1.1; margin-bottom: 24px; letter-spacing: -0.02em; color: white; }
    .gradient-text { color: var(--aria-blue); }
    .hero-content p { font-size: 17px; line-height: 1.6; color: rgba(255,255,255,0.7); max-width: 500px; }

    .hero-visual { position: relative; display: flex; justify-content: center; }
    .visual-blob { width: 300px; height: 300px; background: radial-gradient(circle, rgba(59,130,246,0.15) 0%, rgba(255,255,255,0) 70%); border-radius: 50%; position: absolute; animation: float 6s infinite ease-in-out; }
    @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-15px); } }
    .visual-card { background: white; border: 1.5px solid #edf2f7; width: 260px; height: 340px; border-radius: 20px; padding: 32px; box-shadow: 0 40px 100px rgba(15, 23, 42, 0.08); position: relative; z-index: 1; transform: rotate(3deg); transition: transform 0.5s; }
    .visual-card:hover { transform: rotate(0deg) scale(1.05); }
    .aria-orb { width: 64px; height: 64px; background: var(--aria-dark); border-radius: 50%; margin: 0 auto 40px; display: flex; align-items: center; justify-content: center; font-size: 24px; color: white; box-shadow: 0 0 30px rgba(30,58,138,0.3); }
    .card-line { height: 12px; background: #f1f5f9; border-radius: 6px; margin-bottom: 20px; width: 100%; }
    .card-line.short { width: 60%; }

    /* Aria Section */
    .aria-section { padding: 40px 0 60px; }
    .section-header { text-align: center; max-width: 700px; margin: 0 auto 40px; }
    .section-header h2 { font-size: 32px; font-weight: 800; margin-bottom: 20px; color: #1e293b; }
    .blue-text { color: var(--aria-blue); }
    .section-header p { font-size: 16px; color: #64748b; line-height: 1.6; }

    .feature-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
    .feature-card { padding: 40px; border-radius: 28px; border: 1.5px solid transparent; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); cursor: default; }
    .feature-card:hover { transform: translateY(-12px); box-shadow: 0 30px 60px rgba(0,0,0,0.06); }
    
    .feature-card.rose { background: #fff1f2; border-color: #fecdd3; }
    .feature-card.amber { background: #fffbeb; border-color: #fde68a; }
    .feature-card.blue { background: #eff6ff; border-color: #bfdbfe; }

    .feat-icon { font-size: 40px; margin-bottom: 28px; display: inline-flex; width: 64px; height: 64px; background: white; border-radius: 16px; align-items: center; justify-content: center; box-shadow: 0 8px 16px rgba(0,0,0,0.03); }
    
    .feature-card h3 { font-size: 20px; font-weight: 800; margin-bottom: 14px; }
    .feature-card.rose h3 { color: #9f1239; }
    .feature-card.amber h3 { color: #92400e; }
    .feature-card.blue h3 { color: #1e40af; }
    
    .feature-card p { font-size: 15px; color: #475569; line-height: 1.7; font-weight: 500; }

    /* Values Section */
    .values-section { padding: 60px 0; background: white; border-radius: 32px; margin: 0 20px 40px; }
    .values-grid { display: grid; grid-template-columns: 1fr 1.2fr; gap: 80px; align-items: center; max-width: 1000px; margin: 0 auto; }
    .value-text h2 { font-size: 32px; font-weight: 800; margin-bottom: 24px; color: #0f172a; }
    .value-text p { font-size: 16px; color: #64748b; line-height: 1.7; }

    .value-items { display: flex; flex-direction: column; gap: 40px; }
    .value-item { display: flex; gap: 32px; align-items: flex-start; padding: 24px; border-radius: 24px; transition: all 0.3s; border: 1.5px solid transparent; }
    .value-item:hover { transform: translateX(12px); box-shadow: 0 10px 30px rgba(0,0,0,0.04); }
    
    .value-item.blue { background: #eff6ff; border-color: #dbeafe; }
    .value-item.green { background: #f0fdf4; border-color: #dcfce7; }
    .value-item.purple { background: #f5f3ff; border-color: #ede9fe; }

    .v-num { font-size: 20px; font-weight: 900; width: 60px; height: 60px; border-radius: 18px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; box-shadow: 0 10px 20px rgba(0,0,0,0.05); }
    
    .value-item.blue .v-num { background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); color: white; }
    .value-item.green .v-num { background: linear-gradient(135deg, #065f46 0%, #10b981 100%); color: white; }
    .value-item.purple .v-num { background: linear-gradient(135deg, #5b21b6 0%, #8b5cf6 100%); color: white; }

    .v-content h4 { font-size: 20px; font-weight: 800; margin-bottom: 10px; }
    .value-item.blue h4 { color: #1e3a8a; }
    .value-item.green h4 { color: #064e3b; }
    .value-item.purple h4 { color: #4c1d95; }
    
    .v-content p { font-size: 15px; color: #475569; line-height: 1.6; font-weight: 500; }

    /* CTA Section */
    .cta-section { padding: 20px 20px 80px; }
    .cta-inner { background: var(--aria-dark); padding: 60px; border-radius: 32px; text-align: center; color: white; max-width: 1000px; margin: 0 auto; box-shadow: 0 20px 60px rgba(30,58,138,0.2); }
    .cta-inner h2 { font-size: 36px; font-weight: 900; margin-bottom: 20px; }
    .cta-inner p { font-size: 16px; opacity: 0.7; margin-bottom: 40px; font-weight: 500; }
    .btn-main { background: white; color: var(--aria-dark); border: none; padding: 14px 32px; border-radius: 12px; font-size: 15px; font-weight: 800; cursor: pointer; transition: all 0.2s; }
    .btn-main:hover { transform: scale(1.05); background: #f8fafc; }

    .footer { text-align: center; padding: 40px; border-top: 1px solid #edf2f7; }
    .footer p { font-size: 13px; color: #94a3b8; }
    .footer a { color: var(--aria-blue); text-decoration: none; font-weight: 600; }
  `]
})
export class AboutComponent {}
