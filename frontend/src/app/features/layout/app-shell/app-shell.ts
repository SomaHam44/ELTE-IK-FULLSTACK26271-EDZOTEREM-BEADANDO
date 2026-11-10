import { Component, computed, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../../core/auth.service';

@Component({
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  selector: 'app-app-shell',
  styleUrl: './app-shell.css',
  templateUrl: './app-shell.html',
})
export class AppShell {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly user = this.auth.activeUser;
  protected readonly roleLabel = computed(() => {
    const role = this.user()?.role;
    if (role === 'admin') return 'Adminisztrátor';
    if (role === 'coach') return 'Edző';
    if (role === 'athlete') return 'Sportoló';
    return '';
  });
  protected readonly initials = computed(() =>
    this.user()?.name.split(' ').map(part => part[0]).slice(0, 2).join('') ?? 'PF'
  );
  protected readonly navigation = computed(() => {
    const role = this.user()?.role;
    if (role === 'admin') {
      return [
        { label: 'Dashboard', path: '/admin/dashboard' },
        { label: 'Edzéscsoportok', path: '/admin/groups' },
      ];
    }
    if (role === 'coach') {
      return [{ label: 'Edzéseim', path: '/coach/dashboard' }];
    }
    if (role === 'athlete') {
      return [
        { label: 'Kezdőlap', path: '/athlete/dashboard' },
    //    { label: 'Saját órarend', path: '/athlete/schedule' },
      ];
    }
    return [];
  });

  protected homeLink(): string {
    const role = this.user()?.role;
    return role === 'admin'
      ? '/admin/dashboard'
      : role === 'coach'
        ? '/coach/dashboard'
        : role === 'athlete'
          ? '/athlete/dashboard'
          : '/login';
  }

  protected async signOut(): Promise<void> {
    await this.auth.signOut();
    await this.router.navigateByUrl('/login', { replaceUrl: true });
  }
}
