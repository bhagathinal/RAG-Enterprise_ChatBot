import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="auth-wrapper">
      <!-- Left Side: Branding & Features -->
      <div class="brand-sidebar">
        <div class="brand-header">
          <div class="logo-box"></div>
          <span class="brand-name">AcmeCorp</span>
        </div>

        <div class="hero-section">
          <h1>Your workplace, <span class="highlight">always</span> with you.</h1>
          <p class="tagline">Everything you need in one place</p>
          
          <ul class="feature-list">
            <li><span class="bullet"></span> Check leaves, payslips & policies instantly</li>
            <li><span class="bullet"></span> Raise requests without chasing emails</li>
            <li><span class="bullet"></span> Your HR assistant, available 24/7</li>
          </ul>
        </div>

        <div class="stats-row">
          <div class="stat-item">
            <div class="stat-value">12 TB</div>
            <div class="stat-label">indexed docs</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">98.4%</div>
            <div class="stat-label">retrieval accuracy</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">4,200+</div>
            <div class="stat-label">enterprise users</div>
          </div>
        </div>

        <div class="scroll-indicator">
          <div class="arrow-down">↓</div>
        </div>
      </div>

      <!-- Right Side: Auth Form -->
      <div class="auth-content">
        <div class="auth-container">
          <div class="auth-toggle">
            <button [class.active]="isLogin()" (click)="isLogin.set(true)">Sign in</button>
            <button [class.active]="!isLogin()" (click)="isLogin.set(false)">Create account</button>
          </div>

          <div class="form-header">
            <h2>{{ isLogin() ? 'Welcome back' : 'Get started' }}</h2>
            <p>{{ isLogin() ? 'Sign in to your workspace' : 'Create your enterprise workspace' }}</p>
          </div>

          <form (ngSubmit)="onSubmit()">
            <div class="form-group" *ngIf="!isLogin()">
              <label>Full Name</label>
              <input type="text" name="name" [(ngModel)]="formData.name" placeholder="John Doe" required>
            </div>

            <div class="form-group">
              <label>Work email</label>
              <input type="email" name="email" [(ngModel)]="formData.email" placeholder="you@company.com" required>
            </div>

            <div class="form-group">
              <div class="label-row">
                <label>Password</label>
                <a href="#" class="forgot-link" *ngIf="isLogin()">Forgot password?</a>
              </div>
              <input type="password" name="password" [(ngModel)]="formData.password" placeholder="••••••••" required>
            </div>

            <div class="error-msg" *ngIf="error()">{{ error() }}</div>
            <div class="success-msg" *ngIf="success()">{{ success() }}</div>

            <button type="submit" class="btn-submit" [disabled]="loading()">
              {{ loading() ? 'Processing...' : (isLogin() ? 'Sign in →' : 'Create account →') }}
            </button>
          </form>

          <div class="auth-footer">
            <p *ngIf="isLogin()">No account? <a (click)="isLogin.set(false)">Create one →</a></p>
            <p *ngIf="!isLogin()">Already have an account? <a (click)="isLogin.set(true)">Sign in →</a></p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-wrapper { height: 100vh; display: flex; overflow: hidden; background: var(--acme-bg); }

    /* Side Bar */
    .brand-sidebar {
      width: 45%;
      background: var(--acme-sidebar-light);
      padding: var(--acme-padding);
      display: flex;
      flex-direction: column;
      position: relative;
      color: var(--acme-accent);
    }
    .brand-header { display: flex; align-items: center; gap: 12px; margin-bottom: 80px; }
    .logo-box { width: 44px; height: 44px; background: var(--acme-primary); border-radius: var(--acme-radius-md); }
    .brand-name { font-size: 20px; font-weight: 700; }

    .hero-section h1 { font-size: 40px; font-weight: 800; line-height: 1.2; margin-bottom: 24px; max-width: 400px; color: var(--acme-primary); }
    .highlight { color: var(--acme-accent); font-weight: 900; }
    .tagline { font-size: 18px; color: rgba(30, 58, 138, 0.7); margin-bottom: 40px; font-weight: 500; }

    .feature-list { list-style: none; padding: 0; margin-bottom: 80px; }
    .feature-list li {
      display: flex; align-items: center; gap: 12px; margin-bottom: 16px; 
      font-size: 16px; color: rgba(30, 58, 138, 0.9);
    }
    .bullet { width: 6px; height: 6px; background: var(--acme-accent); border-radius: 50%; }

    .stats-row { display: flex; gap: 40px; margin-top: auto; }
    .stat-value { font-size: 24px; font-weight: 800; margin-bottom: 4px; color: var(--acme-accent); }
    .stat-label { font-size: 12px; color: rgba(30, 58, 138, 0.7); text-transform: uppercase; letter-spacing: 0.1em; }

    .scroll-indicator {
      position: absolute; bottom: 40px; right: -24px; width: 48px; height: 48px;
      background: white; border-radius: 50%; display: flex; align-items: center; justify-content: center;
      color: var(--acme-text); box-shadow: var(--acme-shadow); border: 1px solid var(--acme-border);
    }

    /* Auth Content */
    .auth-content { flex: 1; display: flex; align-items: center; justify-content: center; background: var(--acme-bg); }
    .auth-container { width: 100%; max-width: 420px; padding: 20px; }

    .auth-toggle { display: flex; background: #f1f5f9; padding: 4px; border-radius: var(--acme-radius-md); margin-bottom: 48px; }
    .auth-toggle button {
      flex: 1; padding: 10px; border: none; border-radius: 12px; font-size: 14px; font-weight: 600;
      background: transparent; color: var(--acme-text-muted); transition: all 0.2s;
    }
    .auth-toggle button.active { background: white; color: var(--acme-text); box-shadow: var(--acme-shadow-sm); }

    .form-header h2 { font-size: 28px; font-weight: 800; margin-bottom: 8px; color: var(--acme-text); }
    .form-header p { color: var(--acme-text-muted); font-size: 14px; margin-bottom: 32px; }

    .form-group { margin-bottom: 24px; }
    .label-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
    label { display: block; font-size: 13px; font-weight: 600; color: var(--acme-text-secondary); margin-bottom: 8px; }
    .forgot-link { font-size: 12px; color: var(--acme-primary); font-weight: 600; text-decoration: none; }

    input {
      width: 100%; padding: 12px 16px; border: 1px solid var(--acme-border); border-radius: var(--acme-radius-md);
      font-size: 15px; transition: all 0.2s; background: white;
    }
    input:focus { outline: none; border-color: var(--acme-primary); box-shadow: 0 0 0 4px rgba(55, 48, 163, 0.1); }

    .btn-submit {
      width: 100%; padding: 14px; background: white; border: 1px solid var(--acme-border); border-radius: var(--acme-radius-md);
      font-size: 16px; font-weight: 700; color: var(--acme-text); cursor: pointer; transition: all 0.2s;
      margin-top: 8px;
    }
    .btn-submit:hover { border-color: var(--acme-primary); background: #f8fafc; }

    .auth-footer { text-align: center; margin-top: 32px; }
    .auth-footer p { color: var(--acme-text-muted); font-size: 14px; }
    .auth-footer a { color: var(--acme-primary); font-weight: 600; cursor: pointer; text-decoration: none; }

    .error-msg { color: #dc2626; font-size: 13px; margin-bottom: 16px; text-align: center; }
    .success-msg { color: #166534; font-size: 13px; margin-bottom: 16px; text-align: center; background: #f0fdf4; padding: 8px; border-radius: var(--acme-radius-sm); }
  `]
})
export class AuthComponent {
  authService = inject(AuthService);
  isLogin = signal(true);
  loading = signal(false);
  error = signal('');
  success = signal('');
  formData = { name: '', email: '', password: '' };

  onSubmit() {
    this.loading.set(true);
    this.error.set('');
    this.success.set('');
    
    if (this.isLogin()) {
      this.authService.login({ email: this.formData.email, password: this.formData.password }).subscribe({
        next: () => this.loading.set(false),
        error: (err) => {
          this.error.set(err.error?.message || 'Login failed');
          this.loading.set(false);
        }
      });
    } else {
      this.authService.signup(this.formData).subscribe({
        next: () => {
          this.loading.set(false);
          this.success.set('Account created! Please sign in.');
          this.isLogin.set(true);
          this.formData = { name: '', email: '', password: '' };
        },
        error: (err) => {
          this.error.set(err.error?.message || 'Signup failed');
          this.loading.set(false);
        }
      });
    }
  }
}
