import { Component, inject, signal, ViewChild, ElementRef, OnInit, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { environment } from '../../../environments/environment';
import { MarkdownPipe } from '../../shared/pipes/markdown.pipe';

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  sources?: string[];
}

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, MarkdownPipe],
  template: `
    <div class="chat-wrapper">

      <!-- Sidebar -->
      <aside class="sidebar">
        <div class="sidebar-header">
          <div class="logo-box">■</div>
          <span class="brand">AcmeCorp</span>
        </div>

        <div class="sidebar-content">
          <div class="session-label">ARIA SESSIONS</div>
          <div class="session-item active">
            <div class="session-title">Current Analysis</div>
            <div class="session-date">Today</div>
          </div>
          <div class="session-item" *ngFor="let chat of pastSessions()">
            <div class="session-title">{{ chat.query | slice:0:28 }}...</div>
            <div class="session-date">{{ chat.createdAt | date:'MMM d' }}</div>
          </div>
        </div>

        <div class="sidebar-footer">
          <button class="btn-new" (click)="clearChat()">+ New session</button>
        </div>
      </aside>

      <!-- Main -->
      <main class="chat-main">

        <!-- Header -->
        <header class="chat-header">
          <div class="header-left">
            <div class="header-title">Aria — Policy Assistant</div>
            <div class="header-sub">AcmeCorp · HR Knowledge Base</div>
          </div>
          <div class="header-right">
            <span class="live-badge"><span class="live-dot"></span> Live · Enterprise Knowledge Base</span>
            <div class="user-avatar" *ngIf="userInitial()">{{ userInitial() }}</div>
          </div>
        </header>

        <!-- Messages -->
        <div class="messages-container" #scrollContainer>

          <div class="welcome-msg" *ngIf="messages().length === 0">
            <div class="aria-circle">★</div>
            <div class="assistant-name">ARIA</div>
            <h2>Your AI policy assistant</h2>
            <p>I'm Aria, AcmeCorp's intelligent knowledge assistant. Ask me anything about company policies, leave, benefits, or HR procedures.</p>
            <div class="starter-chips">
              <button class="chip" (click)="askStarter('What is the leave policy?')">🗓 Leave policy</button>
              <button class="chip" (click)="askStarter('How do I apply for remote work?')">🏠 Remote work</button>
              <button class="chip" (click)="askStarter('What is the code of conduct?')">📋 Code of conduct</button>
              <button class="chip" (click)="askStarter('What are my benefits?')">💼 Benefits</button>
            </div>
          </div>

          <div *ngFor="let msg of messages()" [class]="'msg-bubble ' + msg.role">
            <div *ngIf="msg.role === 'assistant'" class="aria-avatar-sm">★</div>
            <div *ngIf="msg.role === 'user'" class="user-avatar-sm">{{ userInitial() }}</div>
            <div class="msg-content">
              <div class="msg-role">{{ msg.role === 'user' ? 'You' : 'Aria' }}</div>
              <div class="text" [innerHTML]="msg.content | markdown | async"></div>
              <div class="sources" *ngIf="msg.sources && msg.sources.length > 0">
                <span class="source-label">Sources:</span>
                <span class="source-tag" *ngFor="let s of msg.sources">{{ s }}</span>
              </div>
            </div>
          </div>

          <div class="msg-bubble assistant" *ngIf="loading()">
            <div class="aria-avatar-sm">★</div>
            <div class="typing-indicator"><span></span><span></span><span></span></div>
          </div>
        </div>

        <!-- Input -->
        <div class="input-area">
          <div class="input-container">
            <input type="text" [ngModel]="currentQuery()" (ngModelChange)="currentQuery.set($event)" (keyup.enter)="sendMessage()"
              placeholder="Ask Aria anything about company policies..." [disabled]="loading()">
            <button class="send-btn" (click)="sendMessage()" [disabled]="!currentQuery() || loading()">→</button>
          </div>
        </div>
      </main>
    </div>
  `,
  styles: [`
    /* Layout */
    .chat-wrapper { height: 100vh; display: flex; overflow: hidden; font-family: 'Inter', sans-serif; background: #f0f4ff; }

    /* ── Sidebar ── */
    .sidebar { width: 260px; min-width: 260px; background: #1a56a4; color: white; display: flex; flex-direction: column; padding: 24px 16px; }

    .sidebar-header { display: flex; align-items: center; gap: 10px; margin-bottom: 32px; padding: 0 8px; }
    .logo-box { width: 32px; height: 32px; background: rgba(255,255,255,0.2); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 14px; color: white; font-weight: 900; }
    .brand { font-size: 16px; font-weight: 800; color: white; letter-spacing: -0.01em; }

    .session-label { font-size: 10px; font-weight: 700; letter-spacing: 0.12em; color: rgba(255,255,255,0.45); text-transform: uppercase; padding: 0 12px; margin-bottom: 10px; }

    .sidebar-content { flex: 1; overflow-y: auto; }

    .session-item { padding: 10px 12px; border-radius: 10px; cursor: pointer; margin-bottom: 4px; transition: background 0.15s; }
    .session-item:hover { background: rgba(255,255,255,0.08); }
    .session-item.active { background: white; }
    .session-item.active .session-title { color: #1a56a4; font-weight: 700; }
    .session-item.active .session-date { color: #1a56a4; opacity: 0.6; }
    .session-title { font-size: 14px; font-weight: 500; color: rgba(255,255,255,0.85); margin-bottom: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .session-date { font-size: 12px; color: rgba(255,255,255,0.45); }

    .sidebar-footer { padding-top: 16px; border-top: 1px solid rgba(255,255,255,0.1); }
    .btn-new { width: 100%; padding: 11px; background: transparent; border: 1.5px solid rgba(255,255,255,0.25); color: white; border-radius: 10px; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.15s; }
    .btn-new:hover { background: rgba(255,255,255,0.1); border-color: rgba(255,255,255,0.4); }

    /* ── Main ── */
    .chat-main { flex: 1; display: flex; flex-direction: column; background: #f0f4ff; overflow: hidden; }

    /* Header */
    .chat-header { display: flex; align-items: center; justify-content: space-between; padding: 16px 28px; background: white; border-bottom: 1px solid #e4eaf5; flex-shrink: 0; }
    .header-title { font-size: 15px; font-weight: 700; color: #0f172a; }
    .header-sub { font-size: 12px; color: #64748b; margin-top: 2px; }
    .header-right { display: flex; align-items: center; gap: 14px; }
    .live-badge { display: flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 600; color: #1a56a4; background: #e8f0fe; padding: 5px 12px; border-radius: 99px; }
    .live-dot { width: 7px; height: 7px; background: #22c55e; border-radius: 50%; animation: pulse 2s infinite; }
    @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.6;transform:scale(1.3)} }
    .user-avatar { width: 32px; height: 32px; background: #dbeafe; color: #1a56a4; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 13px; }

    /* Messages */
    .messages-container { flex: 1; overflow-y: auto; padding: 40px 32px; display: flex; flex-direction: column; gap: 28px; }

    /* Welcome */
    .welcome-msg { text-align: center; max-width: 520px; margin: 60px auto 0; }
    .aria-circle { width: 72px; height: 72px; background: #1a56a4; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 30px; color: white; margin: 0 auto 14px; box-shadow: 0 8px 24px rgba(26,86,164,0.3); }
    .assistant-name { font-size: 11px; font-weight: 800; letter-spacing: 0.15em; color: #1a56a4; margin-bottom: 10px; }
    .welcome-msg h2 { font-size: 22px; font-weight: 800; color: #0f172a; margin-bottom: 12px; }
    .welcome-msg p { font-size: 14px; color: #1a56a4; line-height: 1.6; margin-bottom: 28px; }

    .starter-chips { display: flex; flex-wrap: wrap; gap: 10px; justify-content: center; }
    .chip { background: white; border: 1.5px solid #d1ddf0; color: #1e3a8a; padding: 9px 18px; border-radius: 99px; font-size: 13px; font-weight: 600; cursor: pointer; box-shadow: 0 2px 6px rgba(0,0,0,0.04); transition: all 0.15s; }
    .chip:hover { background: #1a56a4; color: white; border-color: #1a56a4; transform: translateY(-2px); box-shadow: 0 6px 14px rgba(26,86,164,0.2); }

    /* Bubbles */
    .msg-bubble { display: flex; gap: 14px; max-width: 820px; width: 100%; margin: 0 auto; align-items: flex-start; }
    .msg-bubble.user { flex-direction: row-reverse; }
    .aria-avatar-sm { width: 34px; height: 34px; min-width: 34px; background: #1a56a4; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 900; flex-shrink: 0; }
    .user-avatar-sm { width: 34px; height: 34px; min-width: 34px; background: #dbeafe; color: #1a56a4; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 800; flex-shrink: 0; }

    .msg-content { flex: 1; }
    .msg-role { font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 6px; }
    .msg-bubble.user .msg-role { text-align: right; }
    .text { font-size: 15px; line-height: 1.7; color: #1e293b; background: white; padding: 14px 18px; border-radius: 14px; border: 1px solid #e4eaf5; box-shadow: 0 2px 8px rgba(0,0,0,0.03); }
    .text p { margin-bottom: 8px; }
    .text p:last-child { margin-bottom: 0; }
    .text strong { color: #0f172a; font-weight: 700; }
    .text ul, .text ol { margin: 8px 0 8px 20px; padding: 0; }
    .text li { margin-bottom: 4px; }
    .text code { background: #f1f5f9; padding: 2px 5px; border-radius: 4px; font-family: monospace; font-size: 13px; }
    .msg-bubble.user .text { background: #1a56a4; color: white; border-color: transparent; border-radius: 14px 4px 14px 14px; }
    .msg-bubble.assistant .text { border-radius: 4px 14px 14px 14px; }

    .sources { margin-top: 10px; display: flex; flex-wrap: wrap; gap: 6px; align-items: center; }
    .source-label { font-size: 10px; font-weight: 700; color: #94a3b8; text-transform: uppercase; }
    .source-tag { font-size: 11px; font-weight: 600; color: #1a56a4; background: #e8f0fe; padding: 3px 10px; border-radius: 6px; }

    .typing-indicator { display: flex; gap: 4px; padding: 14px 18px; background: white; border-radius: 4px 14px 14px 14px; border: 1px solid #e4eaf5; }
    .typing-indicator span { width: 7px; height: 7px; background: #1a56a4; border-radius: 50%; opacity: 0.4; animation: bounce 1.4s infinite ease-in-out both; }
    .typing-indicator span:nth-child(1) { animation-delay: -0.32s; }
    .typing-indicator span:nth-child(2) { animation-delay: -0.16s; }
    @keyframes bounce { 0%,80%,100%{transform:scale(0.6);opacity:0.3} 40%{transform:scale(1);opacity:1} }

    /* Input */
    .input-area { padding: 16px 32px 24px; background: #f0f4ff; flex-shrink: 0; }
    .input-container { max-width: 820px; margin: 0 auto; background: white; border: 1.5px solid #d1ddf0; border-radius: 99px; padding: 6px 6px 6px 20px; display: flex; align-items: center; gap: 10px; box-shadow: 0 4px 20px rgba(26,86,164,0.08); transition: border-color 0.2s; }
    .input-container:focus-within { border-color: #1a56a4; box-shadow: 0 4px 20px rgba(26,86,164,0.15); }
    input { flex: 1; border: none; font-size: 15px; outline: none; background: transparent; color: #0f172a; font-family: 'Inter', sans-serif; padding: 8px 0; }
    input::placeholder { color: #94a3b8; }
    .send-btn { width: 40px; height: 40px; background: #1a56a4; color: white; border: none; border-radius: 50%; font-size: 18px; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; flex-shrink: 0; transition: all 0.15s; }
    .send-btn:hover:not(:disabled) { background: #1e3a8a; transform: scale(1.05); }
    .send-btn:disabled { background: #cbd5e1; cursor: not-allowed; }
  `]
})
export class ChatComponent implements OnInit, AfterViewChecked {
  private http = inject(HttpClient);
  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;

  currentQuery = signal('');
  messages = signal<Message[]>([]);
  loading = signal(false);
  pastSessions = signal<any[]>([]);

  userInitial(): string {
    const name = localStorage.getItem('userName') || '';
    return name ? name.charAt(0).toUpperCase() : 'U';
  }

  ngOnInit() { this.fetchHistory(); }

  fetchHistory() {
    this.http.get<any[]>(`${environment.apiUrl}/policies/chat/history`).subscribe({
      next: (res) => {
        // Show last 4 sessions in sidebar for reference
        this.pastSessions.set(res.slice(0, 4));
        // We no longer populate the main chat area with history, 
        // ensuring the user always starts with a 'New Chat' welcome screen.
        this.messages.set([]);
      }
    });
  }

  ngAfterViewChecked() { this.scrollToBottom(); }

  scrollToBottom(): void {
    try { this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight; } catch(err) {}
  }

  sendMessage(query?: string) {
    const q = query || this.currentQuery().trim();
    if (!q || this.loading()) return;

    this.messages.update(msgs => [...msgs, { role: 'user', content: q }]);
    this.currentQuery.set('');
    this.loading.set(true);

    this.http.post<any>(`${environment.apiUrl}/policies/chat`, { query: q }).subscribe({
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

  askStarter(question: string) {
    this.currentQuery.set(question);
    this.sendMessage(question);
  }

  clearChat() { this.messages.set([]); }
}
