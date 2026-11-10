import { DatePipe } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/auth.service';
import { DemoStore } from '../../../../core/demo-store';

@Component({
  imports: [DatePipe, RouterLink],
  selector: 'app-coach-dashboard-page',
  templateUrl: './coach-dashboard-page.html',
  styleUrl: './coach-dashboard-page.css',
})
export class CoachDashboardPage {
  private readonly store = inject(DemoStore);
  private readonly auth = inject(AuthService);

  protected readonly user = this.auth.activeUser;
  protected readonly sessions = computed(() => {
    const coachId = this.user()?.id;
    return this.store.sessions()
      .filter(session => session.coaches.some(coach => coach.id === coachId))
      .sort((left, right) => left.startsAt.localeCompare(right.startsAt))
      .slice(0, 8);
  });
  protected readonly attendanceCount = computed(() =>
    this.store.attendance().length
  );

  protected groupName(groupId: number): string {
    return this.store.findGroup(groupId)?.name ?? 'Ismeretlen csoport';
  }
}
