import { DatePipe } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { AuthService } from '../../../../core/auth.service';
import { DemoStore } from '../../../../core/demo-store';
import { TrainingSession, UserSummary } from '../../../../shared/models/gym.models';

@Component({
  imports: [DatePipe],
  selector: 'app-athlete-schedule-page',
  templateUrl: './athlete-schedule-page.html',
  styleUrl: './athlete-schedule-page.css',
})
export class AthleteSchedulePage {
  private readonly store = inject(DemoStore);
  private readonly auth = inject(AuthService);

  protected readonly user = this.auth.activeUser;
  protected readonly sessions = computed(() => {
    const athleteId = this.user()?.id;
    if (athleteId === undefined) return [];

    const memberGroupIds = this.store.groups()
      .filter(group => group.athletes.some(athlete => athlete.id === athleteId))
      .map(group => group.id);

    return this.store.sessions()
      .filter(session => memberGroupIds.includes(session.groupId))
      .sort((left, right) => left.startsAt.localeCompare(right.startsAt));
  });

  protected groupName(groupId: number): string {
    return this.store.findGroup(groupId)?.name ?? 'Ismeretlen csoport';
  }

  protected coachNames(coaches: UserSummary[]): string {
    return coaches.map(coach => coach.name).join(', ');
  }

  protected feedbackFor(session: TrainingSession): { note: string; rating: number | null } | undefined {
    const athleteId = this.user()?.id;
    const record = this.store.attendance().find(
      item => item.sessionId === session.id && item.athleteId === athleteId
    );
    return record ? { note: record.coachNote, rating: record.rating } : undefined;
  }
}
