import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export interface ChatSession {
  query: string;
  createdAt: string;
}

export interface Announcement {
  title: string;
  indicator: string;
  date: string;
}

export interface HRStats {
  leavesRemaining: { sick: number; casual: number };
  tenure: number;
  attendanceRate: number;
  pendingApprovals: number;
  jobTitle: string;
  profileCompletion: number;
  joinedAt: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="dashboard-wrapper">
      <div class="dashboard-container">

        <!-- ── Top Navigation ── -->
        <header class="top-nav">
          <div class="nav-left">
            <div class="logo-box">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="9" y1="3" x2="9" y2="21"/></svg>
            </div>
            <span class="brand-name">AcmeCorp</span>
          </div>

          <nav class="nav-middle">
            <a routerLink="/dashboard" class="nav-link active">Dashboard</a>
            <a routerLink="/about" class="nav-link">About</a>
            <a routerLink="/policies" class="nav-link">Policies</a>
            <a routerLink="/chat" class="nav-link">AI Assistant</a>
          </nav>

          <div class="nav-right">
            <button class="icon-btn notif-btn">
              <span class="bell-icon">🔔</span>
              <span class="dot-badge"></span>
            </button>
            <div class="user-chip" *ngIf="auth.currentUser() as user">
              <div class="chip-avatar">{{ getInitials(user.name) }}</div>
              <span class="chip-name">{{ user.name }}</span>
            </div>
          </div>
        </header>

        <!-- ── Hero Profile Section ── -->
        <section class="hero-section" *ngIf="auth.currentUser() as user">
          <div class="hero-content">
            <div class="profile-main">
              <div class="profile-avatar">{{ getInitials(user.name) }}</div>
              <div class="profile-info">
                <h1 class="user-name">{{ user.name }}</h1>
                <p class="user-meta" *ngIf="stats() as s">
                  {{ s.jobTitle }} · AcmeCorp · Joined {{ s.joinedAt | date:'MMM yyyy' }}
                </p>
                
                <!-- Profile Progress -->
                <div class="profile-progress" *ngIf="stats() as s">
                  <div class="progress-track">
                    <div class="progress-fill" [style.width]="s.profileCompletion + '%'"></div>
                  </div>
                  <span class="progress-text">{{ s.profileCompletion }}% profile complete — add emergency contact & bank details</span>
                </div>
              </div>
            </div>
            
            <div class="hero-actions">
              <button class="btn btn-white">Complete profile</button>
              <button class="btn btn-outline" routerLink="/chat">Apply leave</button>
              <button class="btn btn-outline">View payslip</button>
            </div>
          </div>
        </section>

        <!-- ── KPI Cards Row ── -->
        <div class="metrics-grid" *ngIf="stats() as s">
          <!-- Leaves -->
          <div class="kpi-card">
            <div class="kpi-icon blue">🗓️</div>
            <div class="kpi-value">{{ s.leavesRemaining.sick + s.leavesRemaining.casual }}</div>
            <div class="kpi-label">Leaves remaining</div>
            <div class="kpi-sub">{{ s.leavesRemaining.sick }} sick · {{ s.leavesRemaining.casual }} casual</div>
            <div class="kpi-progress">
              <div class="kpi-progress-track">
                <div class="kpi-progress-fill" [style.width]="getLeavePercent(s) + '%'"></div>
              </div>
              <span class="kpi-progress-label">{{ getLeavePercent(s) }}% of annual allowance</span>
            </div>
          </div>

          <!-- Tenure -->
          <div class="kpi-card">
            <div class="kpi-icon purple">🏢</div>
            <div class="kpi-value">{{ s.tenure }} yrs</div>
            <div class="kpi-label">Tenure</div>
            <div class="kpi-sub">Joined {{ s.joinedAt | date:'MMM yyyy' }}</div>
            <div class="kpi-tag purple">{{ s.jobTitle }}</div>
          </div>

          <!-- Approvals -->
          <div class="kpi-card">
            <div class="kpi-icon amber">✅</div>
            <div class="kpi-value">{{ s.pendingApprovals }}</div>
            <div class="kpi-label">Pending approvals</div>
            <div class="kpi-sub">Nothing waiting on you</div>
            <div class="kpi-tag amber">Action needed</div>
          </div>

          <!-- Attendance -->
          <div class="kpi-card">
            <div class="kpi-icon green">📊</div>
            <div class="kpi-value">{{ s.attendanceRate }}%</div>
            <div class="kpi-label">Attendance this month</div>
            <div class="kpi-health-track">
              <div class="health-fill" [style.width]="s.attendanceRate + '%'"></div>
            </div>
            <div class="kpi-tag green">On track</div>
          </div>
        </div>

        <!-- ── Bottom Widgets Grid ── -->
        <div class="widgets-grid">
          
          <!-- Announcements -->
          <div class="widget-card">
            <div class="widget-header">
              <span class="widget-title">📢 Announcements</span>
              <span class="widget-badge blue">3 new</span>
            </div>
            <div class="widget-list">
              <div class="list-item" *ngFor="let ann of announcements()">
                <div [class]="'marker ' + ann.indicator"></div>
                <div class="item-body">
                  <div class="item-title">{{ ann.title }}</div>
                  <div class="item-meta">{{ ann.date | date:'MMM d, yyyy' }}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Recent Activity -->
          <div class="widget-card">
            <div class="widget-header">
              <span class="widget-title">⏱️ Recent activity</span>
            </div>
            <div class="widget-list timeline">
              <div class="timeline-item" *ngFor="let chat of chatHistory() | slice:0:4">
                <div class="timeline-marker"></div>
                <div class="item-body">
                  <div class="item-title">Asked Aria about {{ chat.query | slice:0:20 }}...</div>
                  <p class="item-sub">AI Assistant · {{ chat.createdAt | date:'shortTime' }}</p>
                </div>
                <div class="item-time">{{ chat.createdAt | date:'MMM d' }}</div>
              </div>
              <div class="timeline-item" *ngIf="stats()">
                <div class="timeline-marker light"></div>
                <div class="item-body">
                  <div class="item-title">Account created</div>
                  <p class="item-sub">Welcome to AcmeCorp!</p>
                </div>
                <div class="item-time">Apr 1</div>
              </div>
            </div>
          </div>

          <!-- Ask Aria Widget -->
          <div class="widget-card aria-widget">
             <div class="widget-header">
              <span class="widget-title">🤖 Ask Aria</span>
              <span class="widget-badge green">Live</span>
            </div>
            <div class="mini-chat-card">
              <div class="mini-chat-header">
                <div class="mini-avatar">★</div>
                <div class="mini-info">
                  <div class="mini-name">Aria — HR Assistant</div>
                  <div class="mini-docs">4,200+ docs</div>
                </div>
              </div>
              <div class="mini-chips">
                <button class="mini-chip" routerLink="/chat">How many leaves do I have left?</button>
                <button class="mini-chip" routerLink="/chat">What is the WFH policy?</button>
                <button class="mini-chip" routerLink="/chat">When does Q2 appraisal start?</button>
              </div>
              <div class="mini-input-box" routerLink="/chat">
                <span>Ask a policy question...</span>
                <span class="mini-arrow">→</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { --aria-dark: #1e3a8a; --aria-blue: #3b82f6; --aria-bg: #f8fbff; }

    .dashboard-wrapper { min-height: 100vh; background: var(--aria-bg); font-family: 'Inter', sans-serif; display: flex; flex-direction: column; align-items: center; padding: 20px; }
    .dashboard-container { width: 100%; max-width: 1100px; display: flex; flex-direction: column; gap: 24px; }

    /* ── Top Nav ── */
    .top-nav { background: white; border-radius: 16px; padding: 12px 24px; display: flex; align-items: center; justify-content: space-between; box-shadow: 0 4px 20px rgba(0,0,0,0.03); border: 1px solid #edf2f7; }
    .nav-left { display: flex; align-items: center; gap: 12px; }
    .logo-box { width: 32px; height: 32px; background: var(--aria-dark); border-radius: 8px; display: flex; align-items: center; justify-content: center; color: white; }
    .brand-name { font-size: 18px; font-weight: 800; color: #0f172a; }

    .nav-middle { display: flex; gap: 24px; }
    .nav-link { text-decoration: none; font-size: 14px; font-weight: 600; color: #64748b; padding: 4px 0; border-bottom: 2px solid transparent; transition: all 0.2s; }
    .nav-link:hover { color: var(--aria-blue); }
    .nav-link.active { color: var(--aria-dark); border-bottom-color: var(--aria-dark); }

    .nav-right { display: flex; align-items: center; gap: 16px; }
    .icon-btn { background: #f8fafc; border: 1px solid #e2e8f0; width: 40px; height: 40px; border-radius: 12px; display: flex; align-items: center; justify-content: center; cursor: pointer; position: relative; }
    .dot-badge { position: absolute; top: 10px; right: 10px; width: 8px; height: 8px; background: #f59e0b; border-radius: 50%; border: 2px solid white; }
    .user-chip { background: white; border: 1.5px solid #e2e8f0; padding: 4px 14px 4px 4px; border-radius: 99px; display: flex; align-items: center; gap: 10px; }
    .chip-avatar { width: 32px; height: 32px; background: var(--aria-dark); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 800; }
    .chip-name { font-size: 13px; font-weight: 700; color: #0f172a; }

    /* ── Hero Section ── */
    .hero-section { background: var(--aria-dark); border-radius: 20px; padding: 40px; color: white; position: relative; overflow: hidden; }
    .hero-section::before { content: ''; position: absolute; top: 0; right: 0; width: 300px; height: 100%; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.03)); transform: skewX(-20deg); }
    
    .hero-content { display: flex; align-items: center; justify-content: space-between; position: relative; z-index: 1; }
    .profile-main { display: flex; align-items: center; gap: 24px; }
    .profile-avatar { width: 84px; height: 84px; background: white; color: var(--aria-dark); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 32px; font-weight: 800; border: 4px solid rgba(255,255,255,0.2); }
    .user-name { font-size: 26px; font-weight: 800; margin: 0 0 6px; }
    .user-meta { margin: 0 0 16px; font-size: 14px; opacity: 0.7; font-weight: 500; }

    .profile-progress { max-width: 400px; }
    .progress-track { background: rgba(255,255,255,0.15); height: 8px; border-radius: 99px; margin-bottom: 8px; overflow: hidden; }
    .progress-fill { height: 100%; background: #22c55e; border-radius: 99px; box-shadow: 0 0 10px rgba(34,197,94,0.4); }
    .progress-text { font-size: 12px; opacity: 0.8; font-weight: 500; }

    .hero-actions { display: flex; gap: 12px; }
    .btn { padding: 10px 20px; border-radius: 10px; font-size: 14px; font-weight: 700; cursor: pointer; transition: all 0.2s; border: none; }
    .btn-white { background: white; color: var(--aria-dark); }
    .btn-white:hover { background: #f8fafc; transform: translateY(-2px); }
    .btn-outline { background: rgba(255,255,255,0.1); border: 1.5px solid rgba(255,255,255,0.3); color: white; }
    .btn-outline:hover { background: rgba(255,255,255,0.2); transform: translateY(-2px); }

    /* ── KPI Cards ── */
    .metrics-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
    .kpi-card { background: white; padding: 24px; border-radius: 20px; border: 1.5px solid #edf2f7; transition: all 0.2s; }
    .kpi-card:hover { transform: translateY(-4px); box-shadow: 0 12px 24px rgba(0,0,0,0.05); border-color: var(--aria-blue); }
    
    .kpi-icon { width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 20px; margin-bottom: 20px; }
    .kpi-icon.blue { background: #eff6ff; }
    .kpi-icon.purple { background: #f5f3ff; }
    .kpi-icon.amber { background: #fffbeb; }
    .kpi-icon.green { background: #f0fdf4; }

    .kpi-value { font-size: 28px; font-weight: 800; color: #0f172a; margin-bottom: 4px; }
    .kpi-label { font-size: 13px; font-weight: 600; color: #64748b; margin-bottom: 12px; }
    .kpi-sub { font-size: 11px; color: #94a3b8; font-weight: 500; margin-bottom: 12px; }

    .kpi-progress-track, .kpi-health-track { background: #f1f5f9; height: 6px; border-radius: 99px; margin-bottom: 6px; }
    .kpi-progress-fill { height: 100%; background: var(--aria-blue); border-radius: 99px; }
    .kpi-progress-label { font-size: 10px; color: #94a3b8; font-weight: 600; }
    .health-fill { height: 100%; background: #22c55e; border-radius: 99px; }

    .kpi-tag { display: inline-block; padding: 4px 10px; border-radius: 99px; font-size: 11px; font-weight: 700; margin-top: 4px; }
    .kpi-tag.purple { background: #f5f3ff; color: #7c3aed; }
    .kpi-tag.amber { background: #fffbeb; color: #d97706; }
    .kpi-tag.green { background: #f0fdf4; color: #166534; }

    /* ── Widgets Grid ── */
    .widgets-grid { display: grid; grid-template-columns: 1fr 1fr 0.8fr; gap: 16px; margin-top: 4px; }
    .widget-card { background: white; border-radius: 20px; border: 1.5px solid #edf2f7; padding: 24px; }
    .widget-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; }
    .widget-title { font-size: 15px; font-weight: 800; color: #0f172a; display: flex; align-items: center; gap: 8px; }
    .widget-badge { padding: 4px 10px; border-radius: 99px; font-size: 11px; font-weight: 700; }
    .widget-badge.blue { background: #eff6ff; color: #1e40af; }
    .widget-badge.green { background: #f0fdf4; color: #166534; }

    .widget-list { display: flex; flex-direction: column; gap: 18px; }
    .list-item { display: flex; gap: 16px; align-items: flex-start; }
    .marker { width: 10px; height: 10px; border-radius: 50%; margin-top: 4px; flex-shrink: 0; }
    .marker.blue { background: var(--aria-blue); }
    .marker.green { background: #22c55e; }
    .marker.orange { background: #f59e0b; }
    .item-title { font-size: 14px; font-weight: 700; color: #1e293b; margin-bottom: 2px; }
    .item-meta { font-size: 12px; color: #94a3b8; font-weight: 500; }

    /* Timeline */
    .timeline { gap: 24px; position: relative; }
    .timeline::before { content: ''; position: absolute; left: 4px; top: 10px; height: calc(100% - 20px); width: 1.5px; background: #f1f5f9; }
    .timeline-item { display: flex; gap: 16px; position: relative; }
    .timeline-marker { width: 10px; height: 10px; border-radius: 50%; background: var(--aria-blue); border: 2px solid white; z-index: 1; margin-top: 4px; box-shadow: 0 0 0 4px white; }
    .timeline-marker.light { background: #cbd5e1; }
    .item-sub { font-size: 12px; color: #64748b; margin: 2px 0 0; font-weight: 500; }
    .item-time { font-size: 11px; color: #94a3b8; font-weight: 600; text-align: right; min-width: 40px; }

    /* Mini Chat Aria */
    .aria-widget { background: white; }
    .mini-chat-card { background: var(--aria-dark); border-radius: 16px; padding: 20px; color: white; display: flex; flex-direction: column; gap: 14px; cursor: pointer; transition: transform 0.2s; }
    .mini-chat-card:hover { transform: scale(1.02); }
    .mini-chat-header { display: flex; align-items: center; gap: 12px; }
    .mini-avatar { width: 34px; height: 34px; background: rgba(255,255,255,0.15); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 14px; }
    .mini-name { font-size: 13px; font-weight: 800; }
    .mini-docs { font-size: 11px; opacity: 0.6; font-weight: 500; }
    
    .mini-chips { display: flex; flex-direction: column; gap: 8px; }
    .mini-chip { background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.1); color: white; padding: 10px 14px; border-radius: 10px; font-size: 12px; font-weight: 600; text-align: left; transition: all 0.2s; }
    .mini-chip:hover { background: rgba(255,255,255,0.15); }
    
    .mini-input-box { border-top: 1px solid rgba(255,255,255,0.1); padding-top: 14px; display: flex; align-items: center; justify-content: space-between; font-size: 13px; opacity: 0.8; font-weight: 500; }
    .mini-arrow { background: white; color: var(--aria-dark); width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 900; }
  `]
})
export class DashboardComponent implements OnInit {
  auth = inject(AuthService);
  http = inject(HttpClient);

  stats = signal<HRStats | null>(null);
  announcements = signal<Announcement[]>([]);
  chatHistory = signal<ChatSession[]>([]);
  today = new Date();

  ngOnInit() {
    this.fetchHRStats();
    this.fetchAnnouncements();
    this.fetchChatHistory();
  }

  fetchHRStats() {
    this.http.get<HRStats>(`${environment.apiUrl}/hr/stats`).subscribe({
      next: (res) => this.stats.set(res)
    });
  }

  fetchAnnouncements() {
    this.http.get<Announcement[]>(`${environment.apiUrl}/hr/announcements`).subscribe({
      next: (res) => this.announcements.set(res)
    });
  }

  fetchChatHistory() {
    this.http.get<ChatSession[]>(`${environment.apiUrl}/policies/chat/history`).subscribe({
      next: (res) => this.chatHistory.set(res)
    });
  }

  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  }

  getLeavePercent(s: HRStats): number {
    const total = s.leavesRemaining.sick + s.leavesRemaining.casual;
    const annual = 24;
    return Math.min(Math.round((total / annual) * 100), 100);
  }
}
