import { DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DemoStore } from '../../../../core/demo-store';
import { UserSummary } from '../../../../shared/models/gym.models';

@Component({
  imports: [DatePipe, RouterLink],
  selector: 'app-group-detail-page',
  styleUrl: './group-detail-page.css',
  templateUrl: './group-detail-page.html',
})
export class GroupDetailPage {
  private readonly store = inject(DemoStore);
  private readonly route = inject(ActivatedRoute);
  private readonly routeParams = toSignal(this.route.paramMap, {
    initialValue: this.route.snapshot.paramMap,
  });

  protected readonly group = computed(() => {
    const id = Number(this.routeParams().get('id'));
    return Number.isInteger(id) ? this.store.findGroup(id) : undefined;
  });
  protected readonly sessions = computed(() =>
    this.store.sessions()
      .filter(session => session.groupId === this.group()?.id)
      .sort((left, right) => left.startsAt.localeCompare(right.startsAt))
  );
  protected readonly cancelingSessionId = signal<number | null>(null);
  protected readonly cancelReason = signal('');
  protected readonly cancelError = signal('');
  protected readonly actionMessage = signal('');

  protected weekdayName(day: number): string {
    return ['—', 'Hétfő', 'Kedd', 'Szerda', 'Csütörtök', 'Péntek', 'Szombat', 'Vasárnap'][day] ?? '—';
  }

  protected coachNames(coaches: UserSummary[]): string {
    return coaches.map(coach => coach.name).join(', ');
  }

  protected beginCancel(sessionId: number): void {
    this.cancelingSessionId.set(sessionId);
    this.cancelReason.set('');
    this.cancelError.set('');
    this.actionMessage.set('');
  }

  protected updateCancelReason(event: Event): void {
    this.cancelReason.set((event.currentTarget as HTMLInputElement).value);
  }

  protected confirmCancel(sessionId: number): void {
    const reason = this.cancelReason().trim();
    if (!reason) {
      this.cancelError.set('A lemondás okát add meg.');
      return;
    }

    this.store.cancelSession(sessionId, reason);
    this.cancelingSessionId.set(null);
    this.cancelError.set('');
    this.actionMessage.set('A kiválasztott alkalom lemondva. A heti edzésrend változatlan maradt.');
  }

  protected cancelCancel(): void {
    this.cancelingSessionId.set(null);
    this.cancelError.set('');
  }
}
