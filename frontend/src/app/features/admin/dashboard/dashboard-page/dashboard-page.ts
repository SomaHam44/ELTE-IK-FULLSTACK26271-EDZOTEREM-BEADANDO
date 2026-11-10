import { DatePipe } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DemoStore } from '../../../../core/demo-store';

@Component({
  imports: [DatePipe, RouterLink],
  selector: 'app-admin-dashboard-page',
  templateUrl: './dashboard-page.html',
  styleUrl: './dashboard-page.css',
})
export class DashboardPage {
  private readonly store = inject(DemoStore);

  protected readonly groups = this.store.groups;
  protected readonly athleteCount = computed(() =>
    this.store.groups().reduce((sum, group) => sum + group.athletes.length, 0)
  );
  protected readonly upcomingSessions = computed(() =>
    this.store.sessions()
      .filter(session => session.status === 'scheduled')
      .sort((left, right) => left.startsAt.localeCompare(right.startsAt))
      .slice(0, 4)
  );

  protected groupName(groupId: number): string {
    return this.store.findGroup(groupId)?.name ?? 'Ismeretlen csoport';
  }
}
