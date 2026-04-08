import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs';
import { environment } from '../../environments/environment';

export interface User {
  id: string;
  name: string;
  email: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private apiUrl = `${environment.apiUrl}/auth`;

  currentUser = signal<User | null>(null);
  isLoggedIn = computed(() => !!this.currentUser());

  constructor() {
    this.restoreSession();
  }

  private restoreSession() {
    const token = localStorage.getItem('token');
    if (token) {
      this.http.get<{user: User}>(`${this.apiUrl}/me`, {
        headers: { Authorization: `Bearer ${token}` }
      }).subscribe({
        next: (res) => this.currentUser.set(res.user),
        error: () => this.logout()
      });
    }
  }

  login(credentials: any) {
    return this.http.post<{token: string, user: User}>(`${this.apiUrl}/login`, credentials).pipe(
      tap(res => {
        localStorage.setItem('token', res.token);
        this.currentUser.set(res.user);
        this.router.navigate(['/dashboard']);
      })
    );
  }

  signup(userData: any) {
    return this.http.post<{token: string, user: User}>(`${this.apiUrl}/signup`, userData);
  }

  logout() {
    localStorage.removeItem('token');
    this.currentUser.set(null);
    this.router.navigate(['/login']);
  }
}
