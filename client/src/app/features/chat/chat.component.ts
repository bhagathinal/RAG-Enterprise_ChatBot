import { Component, inject, signal, ViewChild, ElementRef, OnInit, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { environment } from '../../../environments/environment';

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  sources?: string[];
}

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="chat-wrapper">
      <aside class="sidebar">
        <div class="sidebar-header">
          <div class="logo-box"></div>
          <span>AcmeCorp</span>
        </div>
        <div class="sidebar-content">
          <button class="btn-new" (click)="clearChat()">+ New Consultation</button>
          <div class="history-label">Session Intelligence</div>
          <div class="history-item active">Current Policy Analysis</div>
        </div>
        <div class="sidebar-footer">
          <a routerLink="/dashboard" class="nav-back">← Back to Dashboard</a>
        </div>
      </aside>

      <main class="chat-main">
        <div class="messages-container" #scrollContainer>
          <div class="welcome-msg" *ngIf="messages().length === 0">
            <div class="bot-avatar">✨</div>
            <h2>How can I assist you with enterprise policies today?</h2>
            <p>I have indexed all current policy documents. Try asking about leave, code of conduct, or IT security.</p>
          </div>

          <div *ngFor="let msg of messages()" [class]="'msg-bubble ' + msg.role">
            <div class="avatar">{{ msg.role === 'user' ? '👤' : '🤖' }}</div>
            <div class="msg-content">
              <div class="text">{{ msg.content }}</div>
              <div class="sources" *ngIf="msg.sources && msg.sources.length > 0">
                <span class="source-label">Sources:</span>
                <span class="source-tag" *ngFor="let s of msg.sources">{{ s }}</span>
              </div>
            </div>
          </div>

          <div class="msg-bubble assistant typing" *ngIf="loading()">
            <div class="avatar">🤖</div>
            <div class="typing-indicator"><span></span><span></span><span></span></div>
          </div>
        </div>

        <div class="input-area">
          <div class="input-container">
            <input 
              type="text" 
              [(ngModel)]="currentQuery" 
              (keyup.enter)="sendMessage()" 
              placeholder="Ask anything about enterprise policies..."
              [disabled]="loading()"
            >
            <button class="send-btn" (click)="sendMessage()" [disabled]="!currentQuery() || loading()">
              <span>↑</span>
            </button>
          </div>
          <p class="disclaimer">AI-generated answers are grounded in verified policy documents.</p>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .chat-wrapper { height: 100vh; display: flex; background: var(--acme-bg); color: var(--acme-text); }
    
    .sidebar {
      width: 280px; background: var(--acme-sidebar-dark); color: white; display: flex; flex-direction: column; padding: 24px;
    }
    .sidebar-header { display: flex; align-items: center; gap: 12px; font-weight: 800; font-size: 18px; margin-bottom: 40px; }
    .logo-box { width: 24px; height: 24px; background: var(--acme-primary); border-radius: 4px; }
    
    .btn-new {
      width: 100%; padding: 12px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
      color: white; border-radius: var(--acme-radius-sm); font-weight: 600; cursor: pointer;
    }
    .btn-new:hover { background: rgba(255,255,255,0.1); }

    .history-label { font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; margin: 32px 0 16px; letter-spacing: 0.1em; }
    .history-item { 
      padding: 10px 12px; border-radius: 6px; font-size: 14px; color: #94a3b8; cursor: pointer; margin-bottom: 4px;
    }
    .history-item.active { background: #1e293b; color: white; font-weight: 600; }

    .sidebar-footer { margin-top: auto; }
    .nav-back { color: #94a3b8; text-decoration: none; font-size: 14px; font-weight: 600; }
    .nav-back:hover { color: white; }

    .chat-main { flex: 1; display: flex; flex-direction: column; background: var(--acme-bg); }
    
    .messages-container { flex: 1; overflow-y: auto; padding: 40px var(--acme-padding); display: flex; flex-direction: column; gap: 32px; }
    .welcome-msg { text-align: center; max-width: 500px; margin: 100px auto; }
    .bot-avatar { font-size: 48px; margin-bottom: 24px; }
    .welcome-msg h2 { font-size: 24px; font-weight: 800; margin-bottom: 12px; }
    .welcome-msg p { color: var(--acme-text-muted); font-size: 16px; }

    .msg-bubble { display: flex; gap: 16px; max-width: 900px; margin: 0 auto; width: 100%; }
    .avatar { width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; font-size: 20px; }
    .msg-content { flex: 1; }
    .text { font-size: 15px; line-height: 1.6; color: var(--acme-text); }
    
    .msg-bubble.user .text { font-weight: 600; color: var(--acme-primary); }

    .sources { margin-top: 16px; display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
    .source-label { font-size: 11px; font-weight: 700; color: var(--acme-text-muted); text-transform: uppercase; }
    .source-tag { font-size: 12px; font-weight: 600; color: var(--acme-primary); background: #e0e7ff; padding: 4px 10px; border-radius: 6px; }

    .typing-indicator { display: flex; gap: 4px; padding: 12px 0; }
    .typing-indicator span { width: 8px; height: 8px; background: #cbd5e1; border-radius: 50%; animation: bounce 1.4s infinite ease-in-out both; }
    .typing-indicator span:nth-child(1) { animation-delay: -0.32s; }
    .typing-indicator span:nth-child(2) { animation-delay: -0.16s; }
    @keyframes bounce { 0%, 80%, 100% { transform: scale(0); } 40% { transform: scale(1); } }

    .input-area { padding: 24px; background: var(--acme-bg); border-top: 1px solid var(--acme-border); }
    .input-container { 
      max-width: 900px; margin: 0 auto; background: var(--acme-card); border: 1px solid var(--acme-border); 
      border-radius: var(--acme-radius-md); padding: 8px 12px; display: flex; align-items: center; gap: 12px; 
      box-shadow: var(--acme-shadow);
    }
    .input-container:focus-within { border-color: var(--acme-primary); }
    
    input { flex: 1; border: none; padding: 12px; font-size: 16px; outline: none; background: transparent; }
    .send-btn { 
      width: 40px; height: 40px; background: var(--acme-sidebar-dark); color: white; border: none; 
      border-radius: var(--acme-radius-sm); font-size: 20px; font-weight: 800; cursor: pointer;
    }
    .send-btn:disabled { background: #e2e8f0; color: #94a3b8; }

    .disclaimer { text-align: center; color: var(--acme-text-muted); font-size: 12px; margin-top: 16px; }
  `]
})
export class ChatComponent implements OnInit, AfterViewChecked {
  private http = inject(HttpClient);
  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;

  currentQuery = signal('');
  messages = signal<Message[]>([]);
  loading = signal(false);

  ngOnInit() { this.fetchHistory(); }

  fetchHistory() {
    this.http.get<any[]>(`${environment.apiUrl}/policies/chat/history`).subscribe({
      next: (res) => {
        const historicalMsgs: Message[] = [];
        res.reverse().forEach(session => {
          historicalMsgs.push({ role: 'user', content: session.query });
          historicalMsgs.push({ role: 'assistant', content: session.answer, sources: session.sources });
        });
        this.messages.set(historicalMsgs);
      }
    });
  }

  ngAfterViewChecked() { this.scrollToBottom(); }

  scrollToBottom(): void {
    try { this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight; } catch(err) {}
  }

  sendMessage() {
    const query = this.currentQuery().trim();
    if (!query || this.loading()) return;

    this.messages.update(msgs => [...msgs, { role: 'user', content: query }]);
    this.currentQuery.set('');
    this.loading.set(true);

    this.http.post<any>(`${environment.apiUrl}/policies/chat`, { query }).subscribe({
      next: (res) => {
        this.messages.update(msgs => [...msgs, { role: 'assistant', content: res.answer, sources: res.sources }]);
        this.loading.set(false);
      },
      error: () => {
        this.messages.update(msgs => [...msgs, { role: 'assistant', content: 'I apologize, something went wrong. Please try again later.' }]);
        this.loading.set(false);
      }
    });
  }

  clearChat() { this.messages.set([]); }
}
