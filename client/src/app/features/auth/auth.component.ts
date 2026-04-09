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
    :host { --aria-dark: #1e3a8a; --aria-blue: #3b82f6; --aria-bg: #f8fbff; }

    .auth-wrapper { height: 100vh; display: flex; overflow: hidden; background: white; }

    /* Left Side: Brand Sidebar */
    .brand-sidebar {
      width: 42%;
      background: linear-gradient(135deg, var(--aria-dark) 0%, #1e40af 100%);
      padding: 60px;
      display: flex;
      flex-direction: column;
      position: relative;
      color: white;
      overflow: hidden;
    }
    .brand-sidebar::before { 
      content: ''; position: absolute; top: -100px; right: -100px; width: 300px; height: 300px; 
      background: rgba(255,255,255,0.03); border-radius: 50%; 
    }

    .brand-header { display: flex; align-items: center; gap: 14px; margin-bottom: 80px; position: relative; z-index: 1; }
    .logo-box { 
      width: 40px; height: 40px; background: white; color: var(--aria-dark); 
      border-radius: 10px; display: flex; align-items: center; justify-content: center;
      font-weight: 900; box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }
    .logo-box::after { content: '■'; font-size: 16px; }
    .brand-name { font-size: 20px; font-weight: 800; letter-spacing: -0.02em; }

    .hero-section { position: relative; z-index: 1; }
    .hero-section h1 { font-size: 44px; font-weight: 900; line-height: 1.1; margin-bottom: 24px; letter-spacing: -0.03em; }
    .highlight { color: var(--aria-blue); }
    .tagline { font-size: 17px; opacity: 0.7; margin-bottom: 48px; font-weight: 500; }

    .feature-list { list-style: none; padding: 0; margin-bottom: 80px; }
    .feature-list li {
      display: flex; align-items: center; gap: 16px; margin-bottom: 20px; 
      font-size: 15px; font-weight: 500; opacity: 0.9;
    }
    .bullet { width: 8px; height: 8px; background: var(--aria-blue); border-radius: 50%; box-shadow: 0 0 10px var(--aria-blue); }

    .stats-row { display: flex; gap: 48px; margin-top: auto; position: relative; z-index: 1; }
    .stat-value { font-size: 26px; font-weight: 800; margin-bottom: 4px; }
    .stat-label { font-size: 11px; opacity: 0.6; text-transform: uppercase; letter-spacing: 0.1em; font-weight: 700; }

    /* Right Side: Auth Content */
    .auth-content { flex: 1; display: flex; align-items: center; justify-content: center; background: var(--aria-bg); }
    .auth-container { width: 100%; max-width: 440px; padding: 40px; background: white; border-radius: 32px; box-shadow: 0 20px 60px rgba(0,0,0,0.03); border: 1.5px solid #edf2f7; }

    .auth-toggle { display: flex; background: #f1f5f9; padding: 6px; border-radius: 16px; margin-bottom: 40px; }
    .auth-toggle button {
      flex: 1; padding: 12px; border: none; border-radius: 12px; font-size: 14px; font-weight: 700;
      background: transparent; color: #64748b; transition: all 0.2s; cursor: pointer;
    }
    .auth-toggle button.active { background: white; color: var(--aria-dark); box-shadow: 0 4px 12px rgba(0,0,0,0.05); }

    .form-header h2 { font-size: 28px; font-weight: 900; margin-bottom: 8px; color: #0f172a; letter-spacing: -0.02em; }
    .form-header p { color: #64748b; font-size: 15px; margin-bottom: 32px; font-weight: 500; }

    .form-group { margin-bottom: 24px; }
    .label-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
    label { display: block; font-size: 14px; font-weight: 700; color: #1e293b; margin-bottom: 8px; }
    .forgot-link { font-size: 12px; color: var(--aria-blue); font-weight: 700; text-decoration: none; }

    input {
      width: 100%; padding: 14px 18px; border: 1.5px solid #e2e8f0; border-radius: 14px;
      font-size: 15px; transition: all 0.2s; background: #f8fafc; font-family: 'Inter', sans-serif;
    }
    input:focus { outline: none; border-color: var(--aria-blue); background: white; box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1); }

    .btn-submit {
      width: 100%; padding: 16px; background: var(--aria-dark); border: none; border-radius: 14px;
      font-size: 16px; font-weight: 800; color: white; cursor: pointer; transition: all 0.2s;
      margin-top: 12px; box-shadow: 0 10px 20px rgba(30, 58, 138, 0.2);
    }
    .btn-submit:hover { background: var(--aria-blue); transform: translateY(-2px); box-shadow: 0 15px 30px rgba(59, 130, 246, 0.3); }
    .btn-submit:disabled { opacity: 0.7; transform: none; box-shadow: none; cursor: not-allowed; }

    .auth-footer { text-align: center; margin-top: 32px; }
    .auth-footer p { color: #64748b; font-size: 14px; font-weight: 500; }
    .auth-footer a { color: var(--aria-blue); font-weight: 700; cursor: pointer; text-decoration: none; margin-left: 4px; }
    .auth-footer a:hover { text-decoration: underline; }

    .error-msg { color: #dc2626; font-size: 14px; font-weight: 600; margin-bottom: 20px; text-align: center; background: #fef2f2; padding: 10px; border-radius: 10px; border: 1px solid #fee2e2; }
    .success-msg { color: #166534; font-size: 14px; font-weight: 600; margin-bottom: 20px; text-align: center; background: #f0fdf4; padding: 10px; border-radius: 10px; border: 1px solid #dcfce7; }
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
