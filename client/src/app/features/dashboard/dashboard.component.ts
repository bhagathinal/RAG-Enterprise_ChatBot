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
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="dashboard-wrapper">
      <div class="dashboard-container">

        <!-- Top Nav -->
        <header class="top-nav">
          <div class="brand">
            <div class="logo-box"></div>
            <span class="brand-name">AcmeCorp</span>
          </div>

          <nav class="nav-links">
            <a routerLink="/dashboard" class="active">Dashboard</a>
            <a routerLink="/about">About</a>
            <a routerLink="/policies">Policies</a>
            <a routerLink="/chat">AI Assistant</a>
          </nav>

          <div class="nav-right">
            <!-- Notification Bell -->
            <div class="notif-bell" *ngIf="stats() as s" [title]="s.pendingApprovals + ' pending approvals'">
              <span class="bell-icon">🔔</span>
              <span class="notif-badge" *ngIf="s.pendingApprovals > 0">{{ s.pendingApprovals }}</span>
            </div>

            <div class="user-profile" *ngIf="auth.currentUser() as user">
              <div class="avatar-circle">{{ getInitials(user.name) }}</div>
              <span class="user-name">{{ user.name }}</span>
              <button class="logout-minimal" (click)="auth.logout()" title="Sign out">×</button>
            </div>
          </div>
        </header>

        <!-- Welcome Banner -->
        <div class="welcome-banner" *ngIf="auth.currentUser() as user">
          <div class="welcome-text">
            <h1 class="greeting">{{ getGreeting() }}, {{ user.name.split(' ')[0] }}! 👋</h1>
            <p class="greeting-sub">Here's your HR overview for today.</p>
          </div>
          <div class="banner-date">{{ today | date:'EEEE, MMMM d' }}</div>
        </div>

        <!-- KPI Metrics Row -->
        <div class="metrics-row" *ngIf="stats() as s">

          <!-- Leaves Card -->
          <div class="metric-card card-blue">
            <div class="card-icon">🗓️</div>
            <div class="metric-value">{{ s.leavesRemaining.sick + s.leavesRemaining.casual }}</div>
            <div class="metric-label">Leaves remaining</div>
            <div class="leave-breakdown">{{ s.leavesRemaining.sick }} sick · {{ s.leavesRemaining.casual }} casual</div>
            <div class="progress-bar-wrap">
              <div class="progress-bar" [style.width]="getLeavePercent(s) + '%'"></div>
            </div>
            <div class="progress-label">{{ getLeavePercent(s) }}% of annual allowance</div>
          </div>

          <!-- Tenure Card -->
          <div class="metric-card card-purple">
            <div class="card-icon">🏢</div>
            <div class="metric-value">{{ s.tenure }} yrs</div>
            <div class="metric-label">Tenure</div>
            <div class="badge-pill purple">{{ s.jobTitle }}</div>
          </div>

          <!-- Approvals Card -->
          <div class="metric-card card-amber">
            <div class="card-icon">✅</div>
            <div class="metric-value">{{ s.pendingApprovals }}</div>
            <div class="metric-label">Pending approvals</div>
            <div class="badge-pill amber">Action needed</div>
          </div>

          <!-- Attendance Card -->
          <div class="metric-card card-green">
            <div class="card-icon">📊</div>
            <div class="metric-value">{{ s.attendanceRate }}%</div>
            <div class="metric-label">Attendance this month</div>
            <div class="progress-bar-wrap green">
              <div class="progress-bar green" [style.width]="s.attendanceRate + '%'"></div>
            </div>
            <div class="badge-pill green">On track</div>
          </div>
        </div>

        <!-- Loading skeleton for stats -->
        <div class="metrics-row" *ngIf="!stats()">
          <div class="metric-card skeleton" *ngFor="let i of [1,2,3,4]">
            <div class="skeleton-line short"></div>
            <div class="skeleton-line long"></div>
            <div class="skeleton-line mid"></div>
          </div>
        </div>

        <div class="info-grid">
          <!-- Announcements -->
          <section class="info-section">
            <h2 class="section-title">
              <span class="section-icon">📣</span>
              Company announcements
            </h2>
            <div class="announcement-list">
              <div class="empty-state" *ngIf="!loadingAnnouncements() && announcements().length === 0">No announcements available.</div>
              <div class="loading-state" *ngIf="loadingAnnouncements()">Fetching updates...</div>
              <div class="announcement-item" *ngFor="let ann of announcements()">
                <span [class]="'status-dot ' + ann.indicator"></span>
                <div class="ann-content">
                  <div class="ann-title">{{ ann.title }}</div>
                  <div class="ann-date">{{ ann.date | date:'MMM d, yyyy' }}</div>
                </div>
              </div>
            </div>
          </section>

          <!-- Recent Consultations -->
          <section class="info-section">
            <h2 class="section-title">
              <span class="section-icon">💬</span>
              Recent Consultations
            </h2>
            <div class="history-list">
              <div class="loading-state" *ngIf="loadingHistory()">Fetching conversations...</div>

              <!-- Empty state with CTA -->
              <div class="chat-cta" *ngIf="!loadingHistory() && chatHistory().length === 0">
                <div class="cta-icon">🤖</div>
                <p class="cta-text">No recent chats with Aria yet.</p>
                <a routerLink="/chat" class="cta-btn">Ask Aria →</a>
                <div class="suggested-chips">
                  <a routerLink="/chat" class="chip">What's my leave balance?</a>
                  <a routerLink="/chat" class="chip">WFH policy?</a>
                  <a routerLink="/chat" class="chip">How to apply for leave?</a>
                </div>
              </div>

              <a routerLink="/chat" class="history-item" *ngFor="let chat of chatHistory()">
                <div class="icon-box gray">💬</div>
                <div class="history-content">
                  <div class="history-title">{{ chat.query }}</div>
                  <div class="history-date">{{ chat.createdAt | date:'shortDate' }}</div>
                </div>
                <span class="chevron">›</span>
              </a>
            </div>
          </section>

          <!-- Quick Actions -->
          <section class="info-section">
            <h2 class="section-title">
              <span class="section-icon">⚡</span>
              Quick actions
            </h2>
            <div class="quick-links">
              <a routerLink="/chat" class="quick-link-item">
                <div class="icon-box blue">📄</div>
                <span>Apply for leave</span>
                <span class="chevron">›</span>
              </a>
              <a href="#" class="quick-link-item">
                <div class="icon-box green">👤</div>
                <span>My payslips</span>
                <span class="chevron">›</span>
              </a>
              <a href="#" class="quick-link-item">
                <div class="icon-box amber">⊕</div>
                <span>Raise a support ticket</span>
                <span class="chevron">›</span>
              </a>
              <a routerLink="/policies" class="quick-link-item">
                <div class="icon-box purple">💼</div>
                <span>Company policies</span>
                <span class="chevron">›</span>
              </a>
            </div>
          </section>
        </div>
      </div>

      <div class="global-footer">
        <div class="ai-button" routerLink="/chat" title="Ask HR AI">✨</div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-wrapper { min-height: 100vh; padding: var(--acme-padding); display: flex; flex-direction: column; align-items: center; background: var(--acme-bg); }
    .dashboard-container {
      width: 100%; max-width: 1200px;
    }

    /* ── Top Nav ── */
    .top-nav { display: flex; align-items: center; justify-content: space-between; margin-bottom: 36px; background: white; padding: 14px 28px; border-radius: var(--acme-radius-lg); border: 1px solid var(--acme-border); box-shadow: var(--acme-shadow-sm); }
    .brand { display: flex; align-items: center; gap: 12px; }
    .logo-box { width: 38px; height: 38px; background: var(--acme-primary); border-radius: var(--acme-radius-sm); }
    .brand-name { font-size: 20px; font-weight: 800; color: var(--acme-accent); }

    .nav-links { display: flex; gap: 28px; }
    .nav-links a { text-decoration: none; font-size: 14px; font-weight: 600; color: var(--acme-text-muted); padding-bottom: 2px; border-bottom: 2px solid transparent; }
    .nav-links a.active { color: var(--acme-primary); border-bottom: 2px solid var(--acme-primary); }
    .nav-links a:hover { color: var(--acme-primary); }

    .nav-right { display: flex; align-items: center; gap: 16px; }
    .notif-bell { position: relative; cursor: pointer; width: 38px; height: 38px; display: flex; align-items: center; justify-content: center; background: #f8fafc; border-radius: 50%; border: 1px solid var(--acme-border); }
    .notif-bell:hover { background: #eff6ff; }
    .bell-icon { font-size: 16px; }
    .notif-badge { position: absolute; top: -2px; right: -2px; background: #ef4444; color: white; font-size: 10px; font-weight: 700; width: 16px; height: 16px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid white; }

    .user-profile { display: flex; align-items: center; gap: 10px; }
    .avatar-circle { width: 36px; height: 36px; background: var(--acme-sidebar-light); color: var(--acme-accent); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 13px; }
    .user-name { font-weight: 600; font-size: 14px; color: var(--acme-text); }
    .logout-minimal { background: transparent; border: none; font-size: 20px; color: var(--acme-text-muted); cursor: pointer; line-height: 1; }
    .logout-minimal:hover { color: #ef4444; }

    /* ── Welcome Banner ── */
    .welcome-banner {
      background: linear-gradient(135deg, var(--acme-accent) 0%, var(--acme-primary) 100%);
      border-radius: var(--acme-radius-lg); padding: 32px 40px; margin-bottom: 32px;
      display: flex; align-items: center; justify-content: space-between;
      color: white;
    }
    .greeting { font-size: 28px; font-weight: 800; margin: 0 0 6px; }
    .greeting-sub { margin: 0; font-size: 15px; opacity: 0.8; }
    .banner-date { font-size: 14px; font-weight: 600; opacity: 0.75; background: rgba(255,255,255,0.15); padding: 8px 18px; border-radius: 99px; }

    /* ── Metric Cards ── */
    .metrics-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 28px; }

    .metric-card {
      padding: 24px; border-radius: var(--acme-radius-lg); border: 1px solid transparent;
      position: relative; overflow: hidden; transition: all 0.25s ease;
    }
    .metric-card:hover { transform: translateY(-4px); box-shadow: 0 12px 32px rgba(0,0,0,0.08); }

    .card-blue { background: #eff6ff; border-color: #bfdbfe; }
    .card-purple { background: #f5f3ff; border-color: #ddd6fe; }
    .card-amber { background: #fffbeb; border-color: #fde68a; }
    .card-green { background: #f0fdf4; border-color: #bbf7d0; }

    .card-icon { font-size: 22px; margin-bottom: 12px; }
    .metric-value { font-size: 30px; font-weight: 800; color: var(--acme-accent); margin-bottom: 4px; }
    .metric-label { font-size: 13px; color: var(--acme-text-muted); font-weight: 500; margin-bottom: 14px; }
    .leave-breakdown { font-size: 12px; color: var(--acme-text-secondary); margin-bottom: 10px; }

    .progress-bar-wrap { background: rgba(0,0,0,0.06); border-radius: 99px; height: 6px; margin-bottom: 6px; overflow: hidden; }
    .progress-bar { height: 100%; border-radius: 99px; background: var(--acme-primary); transition: width 1s ease; }
    .progress-bar.green { background: #22c55e; }
    .progress-label { font-size: 11px; color: var(--acme-text-muted); }

    .badge-pill { display: inline-block; padding: 4px 12px; border-radius: 99px; font-size: 11px; font-weight: 700; margin-top: 4px; }
    .badge-pill.purple { background: #ede9fe; color: #5b21b6; }
    .badge-pill.amber { background: #fef3c7; color: #92400e; }
    .badge-pill.green { background: #dcfce7; color: #166534; }

    /* Skeleton */
    .skeleton { background: #f1f5f9; border-color: #e2e8f0; }
    .skeleton-line { background: #e2e8f0; border-radius: 6px; margin-bottom: 10px; height: 14px; }
    .skeleton-line.short { width: 40%; }
    .skeleton-line.long { width: 70%; height: 24px; }
    .skeleton-line.mid { width: 55%; }

    /* ── Info Grid ── */
    .info-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }
    .info-section {
      background: white; padding: 28px; border-radius: var(--acme-radius-lg); border: 1px solid var(--acme-border);
      transition: all 0.25s ease;
    }
    .info-section:hover { box-shadow: 0 8px 24px rgba(0,0,0,0.05); }

    .section-title { font-size: 16px; font-weight: 800; margin-bottom: 20px; color: var(--acme-accent); display: flex; align-items: center; gap: 8px; }
    .section-icon { font-size: 16px; }

    /* Announcements */
    .announcement-item { display: flex; gap: 14px; margin-bottom: 20px; align-items: flex-start; }
    .status-dot { width: 10px; height: 10px; border-radius: 50%; margin-top: 5px; flex-shrink: 0; }
    .status-dot.primary { background: var(--acme-primary); }
    .status-dot.green { background: #22c55e; }
    .status-dot.orange { background: #f59e0b; }
    .status-dot.blue { background: #4f46e5; }
    .ann-title { font-size: 14px; font-weight: 600; color: var(--acme-text); margin-bottom: 3px; }
    .ann-date { font-size: 12px; color: var(--acme-text-muted); }

    /* Chat CTA */
    .chat-cta { text-align: center; padding: 24px 16px; }
    .cta-icon { font-size: 36px; margin-bottom: 12px; }
    .cta-text { color: var(--acme-text-muted); font-size: 14px; margin-bottom: 16px; }
    .cta-btn { display: inline-block; background: var(--acme-primary); color: white; padding: 10px 24px; border-radius: 99px; font-size: 14px; font-weight: 700; text-decoration: none; }
    .cta-btn:hover { background: var(--acme-accent); transform: translateY(-2px); }
    .suggested-chips { display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; margin-top: 16px; }
    .chip { background: var(--acme-sidebar-light); color: var(--acme-accent); padding: 6px 14px; border-radius: 99px; font-size: 12px; font-weight: 600; text-decoration: none; }
    .chip:hover { background: #bfdbfe; }

    /* History */
    .quick-links, .history-list { display: flex; flex-direction: column; }
    .quick-link-item, .history-item {
      display: flex; align-items: center; padding: 14px 10px; border-bottom: 1px solid var(--acme-border);
      text-decoration: none; color: var(--acme-text); font-size: 14px; font-weight: 600;
      border-radius: var(--acme-radius-sm); transition: all 0.15s ease;
    }
    .quick-link-item:last-child, .history-item:last-child { border-bottom: none; }
    .quick-link-item:hover, .history-item:hover { background: #f8fafc; padding-left: 16px; }

    .icon-box { width: 38px; height: 38px; border-radius: var(--acme-radius-sm); display: flex; align-items: center; justify-content: center; margin-right: 14px; font-size: 16px; flex-shrink: 0; }
    .icon-box.gray { background: #f1f5f9; }
    .icon-box.blue { background: #eff6ff; }
    .icon-box.green { background: #f0fdf4; }
    .icon-box.amber { background: #fffbeb; }
    .icon-box.purple { background: #f5f3ff; }

    .chevron { margin-left: auto; color: #cbd5e1; font-size: 20px; font-weight: 400; }
    .history-content { flex: 1; }
    .history-title { font-size: 13px; margin-bottom: 2px; }
    .history-date { font-size: 11px; color: var(--acme-text-muted); }

    .loading-state, .empty-state { padding: 32px; text-align: center; font-size: 14px; color: var(--acme-text-muted); }

    /* ── Footer FAB ── */
    .global-footer { margin-top: 32px; display: flex; justify-content: center; }
    .ai-button {
      width: 52px; height: 52px; background: var(--acme-primary); color: white;
      border-radius: 50%; display: flex; align-items: center; justify-content: center;
      font-size: 22px; box-shadow: 0 4px 20px rgba(59,130,246,0.4); cursor: pointer;
    }
    .ai-button:hover { background: var(--acme-accent); transform: translateY(-4px) scale(1.05); box-shadow: 0 8px 28px rgba(30,58,138,0.4); }
  `]
})
export class DashboardComponent implements OnInit {
  auth = inject(AuthService);
  http = inject(HttpClient);

  stats = signal<HRStats | null>(null);
  announcements = signal<Announcement[]>([]);
  chatHistory = signal<ChatSession[]>([]);
  loadingAnnouncements = signal(true);
  loadingHistory = signal(true);
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
      next: (res) => { this.announcements.set(res); this.loadingAnnouncements.set(false); },
      error: () => this.loadingAnnouncements.set(false)
    });
  }

  fetchChatHistory() {
    this.http.get<ChatSession[]>(`${environment.apiUrl}/policies/chat/history`).subscribe({
      next: (res) => { this.chatHistory.set(res); this.loadingHistory.set(false); },
      error: () => this.loadingHistory.set(false)
    });
  }

  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  }

  getGreeting(): string {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  }

  getLeavePercent(s: HRStats): number {
    const total = s.leavesRemaining.sick + s.leavesRemaining.casual;
    const annual = 24;
    return Math.min(Math.round((total / annual) * 100), 100);
  }
}
