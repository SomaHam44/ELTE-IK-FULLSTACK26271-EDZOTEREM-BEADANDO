import { HttpClient } from '@angular/common/http';
import { Service, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';

export type UserRole = 'admin' | 'coach' | 'athlete';

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  is_active: boolean;
}

@Service()
export class AuthService {
  private readonly http = inject(HttpClient);

  readonly activeUser = signal<AuthUser | null>(null);

  async signIn(email: string, password: string): Promise<AuthUser> {
    await firstValueFrom(
      this.http.get('/sanctum/csrf-cookie', {
        responseType: 'text',
        withCredentials: true,
      }),
    );

    await firstValueFrom(
      this.http.post('/auth/login', { email, password }, {
        responseType: 'text',
        withCredentials: true,
      }),
    );

    const user = await firstValueFrom(
      this.http.get<AuthUser>('/api/user', {
        withCredentials: true,
      }),
    );

    this.activeUser.set(user);
    return user;
  }

  async restoreSession(): Promise<AuthUser | null> {
    try {
      const user = await firstValueFrom(
        this.http.get<AuthUser>('/api/user', {
          withCredentials: true,
        }),
      );

      this.activeUser.set(user);
      return user;
    } catch {
      this.activeUser.set(null);
      return null;
    }
  }

  async signOut(): Promise<void> {
    await firstValueFrom(
      this.http.get('/sanctum/csrf-cookie', {
        responseType: 'text',
        withCredentials: true,
      }),
    );

    await firstValueFrom(
      this.http.post('/auth/logout', {}, {
        responseType: 'text',
        withCredentials: true,
      }),
    );

    this.activeUser.set(null);
  }
}
