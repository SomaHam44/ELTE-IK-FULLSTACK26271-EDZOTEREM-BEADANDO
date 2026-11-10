import { isPlatformBrowser } from '@angular/common';
import {
  Component,
  OnInit,
  PLATFORM_ID,
  inject,
  signal,
} from '@angular/core';
import {
  FormField,
  form,
  pattern,
  required,
} from '@angular/forms/signals';
import { Router } from '@angular/router';
import { AuthService, UserRole } from '../../../core/auth.service';

interface LoginFormModel {
  email: string;
  password: string;
}

@Component({
  selector: 'app-login-page',
  imports: [FormField],
  templateUrl: './login-page.html',
  styleUrl: './login-page.css',
})
export class LoginPage implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  protected readonly model = signal<LoginFormModel>({
    email: '',
    password: '',
  });

  protected readonly loginForm = form(this.model, (path) => {
    required(path.email);
    pattern(path.email, /^[^\s@]+@[^\s@]+\.[^\s@]+$/);
    required(path.password);
  });

  protected readonly isSubmitting = signal(false);
  protected readonly errorMessage = signal('');

  ngOnInit(): void {
    if (this.isBrowser) {
      void this.restoreExistingSession();
    }
  }

  protected async submit(): Promise<void> {
    this.errorMessage.set('');

    if (!this.loginForm().valid()) {
      return;
    }

    this.isSubmitting.set(true);

    try {
      const user = await this.auth.signIn(
        this.model().email,
        this.model().password,
      );

      await this.goToRoleHome(user.role);
    } catch {
      this.errorMessage.set(
        'Nem megfelelő e-mail-cím vagy jelszó, vagy nem érhető el a szerver.',
      );
    } finally {
      this.isSubmitting.set(false);
    }
  }

  private async restoreExistingSession(): Promise<void> {
    const user = await this.auth.restoreSession();

    if (user) {
      await this.goToRoleHome(user.role);
    }
  }

  private async goToRoleHome(role: UserRole): Promise<void> {
    const destinations: Record<UserRole, string> = {
      admin: '/admin/dashboard',
      coach: '/coach/dashboard',
      athlete: '/athlete/dashboard',
    };

    await this.router.navigateByUrl(destinations[role]);
  }
}