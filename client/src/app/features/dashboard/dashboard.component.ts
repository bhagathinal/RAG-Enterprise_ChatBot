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
        <header class="top-nav">
          <div class="brand">
            <div class="logo-box"></div>
            <span class="brand-name">AcmeCorp</span>
          </div>
          
          <nav class="nav-links">
            <a routerLink="/dashboard" class="active">Dashboard</a>
            <a routerLink="/about">About</a>
            <a routerLink="/policies">Policies</a>
            <a routerLink="/chat">HR Chat</a>
          </nav>

          <div class="user-profile" *ngIf="auth.currentUser() as user">
            <div class="avatar-circle">{{ getInitials(user.name) }}</div>
            <span class="user-name">{{ user.name }}</span>
            <button class="logout-minimal" (click)="auth.logout()" title="Sign out">×</button>
          </div>
        </header>

        <!-- KPI Metrics Row -->
        <div class="metrics-row" *ngIf="stats() as s">
          <div class="metric-card">
            <div class="metric-value">{{ s.leavesRemaining.sick + s.leavesRemaining.casual }}</div>
            <div class="metric-label">Leaves remaining</div>
            <div class="badge green">{{ s.leavesRemaining.sick }} sick · {{ s.leavesRemaining.casual }} casual</div>
          </div>
          
          <div class="metric-card">
            <div class="metric-value">{{ s.tenure }} yrs</div>
            <div class="metric-label">Tenure</div>
            <div class="badge blue">{{ s.jobTitle }}</div>
          </div>
          
          <div class="metric-card">
            <div class="metric-value">{{ s.pendingApprovals }}</div>
            <div class="metric-label">Pending approvals</div>
            <div class="badge orange">Action needed</div>
          </div>
          
          <div class="metric-card">
            <div class="metric-value">{{ s.attendanceRate }}%</div>
            <div class="metric-label">Attendance this month</div>
            <div class="badge green">On track</div>
          </div>
        </div>

        <div class="info-grid">
          <!-- Announcements -->
          <section class="info-section">
            <h2 class="section-title">Company announcements</h2>
            <div class="announcement-list">
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

          <!-- Recent Activity / Chat History -->
          <section class="info-section">
            <h2 class="section-title">Recent Consultations</h2>
            <div class="history-list">
               <div class="loading-state" *ngIf="loadingHistory()">Fetching conversations...</div>
               <div class="empty-state" *ngIf="!loadingHistory() && chatHistory().length === 0">No recent AI queries</div>
               
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

          <!-- Quick Links -->
          <section class="info-section">
            <h2 class="section-title">Quick links</h2>
            <div class="quick-links">
              <a routerLink="/chat" class="quick-link-item">
                <div class="icon-box">📄</div>
                <span>Apply for leave</span>
                <span class="chevron">›</span>
              </a>
              <a href="#" class="quick-link-item">
                <div class="icon-box">👤</div>
                <span>My payslips</span>
                <span class="chevron">›</span>
              </a>
              <a href="#" class="quick-link-item">
                <div class="icon-box">⊕</div>
                <span>Raise a support ticket</span>
                <span class="chevron">›</span>
              </a>
              <a routerLink="/policies" class="quick-link-item">
                <div class="icon-box">💼</div>
                <span>Company policies</span>
                <span class="chevron">›</span>
              </a>
            </div>
          </section>
        </div>
      </div>
      
      <div class="global-footer">
        <div class="ai-button" routerLink="/chat">✨</div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-wrapper { min-height: 100vh; padding: var(--acme-padding); display: flex; flex-direction: column; align-items: center; }
    .dashboard-container { 
      background: var(--acme-card); width: 100%; max-width: 1200px; border-radius: var(--acme-radius-xl); 
      padding: var(--acme-padding); box-shadow: var(--acme-shadow); border: 1px solid var(--acme-border);
    }

    .top-nav { display: flex; align-items: center; justify-content: space-between; margin-bottom: 48px; }
    .brand { display: flex; align-items: center; gap: 12px; }
    .logo-box { width: 44px; height: 44px; background: var(--acme-primary); border-radius: var(--acme-radius-md); }
    .brand-name { font-size: 24px; font-weight: 800; color: var(--acme-text); }

    .nav-links { display: flex; gap: 32px; background: rgba(0,0,0,0.02); padding: 6px 24px; border-radius: 99px; }
    .nav-links a { text-decoration: none; font-size: 15px; font-weight: 600; color: var(--acme-text-muted); }
    .nav-links a.active { color: var(--acme-primary); }
    .nav-links a:hover { color: var(--acme-primary); }

    .user-profile { display: flex; align-items: center; gap: 10px; }
    .avatar-circle { 
       width: 40px; height: 40px; background: #e0e7ff; color: var(--acme-primary); border-radius: 50%;
       display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 14px;
    }
    .user-name { font-weight: 600; font-size: 14px; color: var(--acme-text); }
    .logout-minimal { background: transparent; border: none; font-size: 20px; color: var(--acme-text-muted); cursor: pointer; }

    .metrics-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px; margin-bottom: 48px; }
    .metric-card { 
      background: white; padding: 24px; border-radius: var(--acme-radius-lg); border: 1px solid var(--acme-border);
      box-shadow: var(--acme-shadow-sm);
    }
    .metric-value { font-size: 32px; font-weight: 800; margin-bottom: 4px; color: var(--acme-text); }
    .metric-label { font-size: 14px; color: var(--acme-text-muted); font-weight: 500; margin-bottom: 16px; }
    
    .badge { display: inline-block; padding: 4px 12px; border-radius: var(--acme-radius-sm); font-size: 12px; font-weight: 700; }
    .badge.green { background: #f0fdf4; color: #166534; }
    .badge.blue { background: #eff6ff; color: #1e40af; }
    .badge.orange { background: #fffaf0; color: #9a3412; }

    .info-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 24px; }
    .info-section { 
      background: white; padding: 32px; border-radius: var(--acme-radius-lg); border: 1px solid var(--acme-border);
    }
    .section-title { font-size: 18px; font-weight: 800; margin-bottom: 24px; color: var(--acme-text); }

    .announcement-item { display: flex; gap: 16px; margin-bottom: 24px; }
    .status-dot { width: 10px; height: 10px; border-radius: 50%; margin-top: 6px; flex-shrink: 0; }
    .status-dot.primary { background: var(--acme-primary); }
    .status-dot.green { background: #10b981; }
    .status-dot.orange { background: #f59e0b; }
    .status-dot.blue { background: #4f46e5; }

    .ann-title { font-size: 15px; font-weight: 700; color: var(--acme-text); margin-bottom: 4px; }
    .ann-date { font-size: 13px; color: var(--acme-text-muted); font-weight: 500; }

    .quick-links, .history-list { display: flex; flex-direction: column; }
    .quick-link-item, .history-item { 
      display: flex; align-items: center; padding: 16px; border-bottom: 1px solid var(--acme-border); 
      text-decoration: none; color: var(--acme-text); font-weight: 600; 
    }
    .quick-link-item:hover, .history-item:hover { background: #f8fafc; border-radius: var(--acme-radius-md); }
    .icon-box { 
      width: 40px; height: 40px; background: #f8fafc; border-radius: var(--acme-radius-md); 
      display: flex; align-items: center; justify-content: center; margin-right: 16px; font-size: 18px;
    }
    .icon-box.gray { background: #f1f5f9; }
    .chevron { margin-left: auto; color: #cbd5e1; font-size: 20px; }

    .history-content { flex: 1; }
    .history-title { font-size: 14px; margin-bottom: 2px; }
    .history-date { font-size: 11px; color: var(--acme-text-muted); font-weight: 500; }

    .loading-state, .empty-state { padding: 40px; text-align: center; font-size: 14px; color: var(--acme-text-muted); }

    .global-footer { margin-top: 40px; }
    .ai-button {
      width: 50px; height: 50px; background: white; border: 1px solid var(--acme-border);
      border-radius: 50%; display: flex; align-items: center; justify-content: center;
      font-size: 24px; box-shadow: var(--acme-shadow); cursor: pointer;
    }
    .ai-button:hover { transform: translateY(-4px); box-shadow: var(--acme-shadow-hover); }
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
      next: (res) => {
        this.announcements.set(res);
        this.loadingAnnouncements.set(false);
      },
      error: () => this.loadingAnnouncements.set(false)
    });
  }

  fetchChatHistory() {
    this.http.get<ChatSession[]>(`${environment.apiUrl}/policies/chat/history`).subscribe({
      next: (res) => {
        this.chatHistory.set(res);
        this.loadingHistory.set(false);
      },
      error: () => this.loadingHistory.set(false)
    });
  }

  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  }
}
