import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

interface LoginRequest { email: string; password: string; }
interface LoginResponse { token: string; }
interface TokenPayload { sub: string; email: string; role: string; exp: number; }

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly TOKEN_KEY = 'leave_token';
  private _token = signal<string | null>(localStorage.getItem(this.TOKEN_KEY));

  readonly currentUser = computed(() => this.decodeToken(this._token()));
  readonly isLoggedIn = computed(() => !!this._token() && !this.isExpired());
  readonly role = computed(() => this.currentUser()?.role ?? null);

  constructor(private http: HttpClient, private router: Router) {}

  login(credentials: LoginRequest) {
    return this.http.post<LoginResponse>(`${environment.apiUrl}/auth/login`, credentials).pipe(
      tap(res => {
        localStorage.setItem(this.TOKEN_KEY, res.token);
        this._token.set(res.token);
      })
    );
  }

  logout() {
    localStorage.removeItem(this.TOKEN_KEY);
    this._token.set(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null { return this._token(); }

  private decodeToken(token: string | null): TokenPayload | null {
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return {
        sub: payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] ?? payload.sub,
        email: payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] ?? payload.email,
        role: payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ?? payload.role,
        exp: payload.exp
      };
    } catch { return null; }
  }

  private isExpired(): boolean {
    const user = this.decodeToken(this._token());
    return user ? user.exp * 1000 < Date.now() : true;
  }
}
