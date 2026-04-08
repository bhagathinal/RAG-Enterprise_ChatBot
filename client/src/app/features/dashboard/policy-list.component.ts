import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export interface Policy {
  title: string;
}

@Component({
  selector: 'app-policy-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="policy-page">
      <header class="page-header">
        <a routerLink="/dashboard" class="back-link">← Back to Dashboard</a>
        <h1>Company Policies</h1>
        <p class="subtitle">Access and consult all enterprise-wide policy documentation.</p>
      </header>

      <div class="policy-grid">
        <div class="policy-card" *ngFor="let p of policies()">
          <div class="card-icon">📄</div>
          <div class="card-body">
            <h3>{{ p.title }}</h3>
            <p>Indexed and verified policy documentation ready for AI-driven consultation.</p>
          </div>
          <div class="card-footer">
            <a routerLink="/chat" class="action-btn">Ask Assistant →</a>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .policy-page { 
      padding: var(--acme-padding); max-width: 1200px; margin: 0 auto; 
      min-height: 100vh; background: var(--acme-bg); 
    }
    .page-header { margin-bottom: 48px; }
    .back-link { color: var(--acme-primary); text-decoration: none; font-weight: 600; font-size: 14px; display: block; margin-bottom: 16px; }
    .page-header h1 { font-size: 36px; font-weight: 800; color: var(--acme-text); margin-bottom: 8px; letter-spacing: -0.02em; }
    .subtitle { color: var(--acme-text-muted); font-size: 16px; }

    .policy-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 24px; }
    .policy-card { 
       background: var(--acme-card); border: 1px solid var(--acme-border); 
       border-radius: var(--acme-radius-lg); padding: 32px; 
       display: flex; flex-direction: column;
       box-shadow: var(--acme-shadow-sm);
    }
    .policy-card:hover { transform: translateY(-4px); box-shadow: var(--acme-shadow-hover); }
    .card-icon { font-size: 32px; margin-bottom: 20px; }
    .policy-card h3 { font-size: 18px; font-weight: 700; margin-bottom: 12px; text-transform: capitalize; color: var(--acme-text); }
    .policy-card p { font-size: 14px; color: var(--acme-text-muted); line-height: 1.6; margin-bottom: 32px; flex: 1; }
    
    .card-footer { border-top: 1px solid var(--acme-border); padding-top: 20px; }
    .action-btn { 
      display: inline-block; color: var(--acme-primary); 
      text-decoration: none; font-size: 14px; font-weight: 700;
    }
    .action-btn:hover { text-decoration: underline; }
  `]
})
export class PolicyListComponent implements OnInit {
  private http = inject(HttpClient);
  policies = signal<Policy[]>([]);

  ngOnInit() {
    this.http.get<Policy[]>(`${environment.apiUrl}/policies/list`).subscribe({
      next: (res) => this.policies.set(res)
    });
  }
}
