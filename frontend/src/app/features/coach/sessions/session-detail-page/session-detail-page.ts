import { DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DemoStore } from '../../../../core/demo-store';
import { AttendanceStatus, UserSummary } from '../../../../shared/models/gym.models';

interface FeedbackDraft {
  note: string;
  rating: number;
}

@Component({
	imports: [DatePipe, RouterLink],
  selector: 'app-session-detail-page',
  templateUrl: './session-detail-page.html',
  styleUrl: './session-detail-page.css',
})
export class SessionDetailPage {
  private readonly store = inject(DemoStore);
  private readonly route = inject(ActivatedRoute);
  private readonly routeParams = toSignal(this.route.paramMap, {
    initialValue: this.route.snapshot.paramMap,
  });

  protected readonly session = computed(() => {
    const id = Number(this.routeParams().get('id'));
    return Number.isInteger(id) ? this.store.findSession(id) : undefined;
  });
  protected readonly group = computed(() => {
    const session = this.session();
    return session ? this.store.findGroup(session.groupId) : undefined;
  });
  protected readonly attendance = this.store.attendance;
  protected readonly message = signal('');
  protected readonly statusOptions: { value: AttendanceStatus; label: string }[] = [
    { value: 'present', label: 'Jelen' },
    { value: 'absent', label: 'Hiányzik' },
    { value: 'late', label: 'Késik' },
    { value: 'excused', label: 'Igazolt' },
  ];

  protected readonly feedbackDrafts = signal<Record<number, FeedbackDraft>>({});

  protected feedbackDraft(athleteId: number): FeedbackDraft {
    return this.feedbackDrafts()[athleteId] ?? { note: '', rating: 5 };
  }

  protected attendanceStatus(athleteId: number): AttendanceStatus | '' {
    const sessionId = this.session()?.id;
    if (!sessionId) return '';
    return this.attendance().find(
      record => record.sessionId === sessionId && record.athleteId === athleteId
    )?.status ?? '';
  }

  protected feedbackFor(athleteId: number): { note: string; rating: number | null } {
    const sessionId = this.session()?.id;
    const record = this.attendance().find(
      item => item.sessionId === sessionId && item.athleteId === athleteId
    );
    return { note: record?.coachNote ?? '', rating: record?.rating ?? null };
  }

  protected coachNames(coaches: UserSummary[]): string {
    return coaches.map(coach => coach.name).join(', ');
  }

  protected markAttendance(athleteId: number, event: Event): void {
    const status = (event.currentTarget as HTMLSelectElement).value;
    if (!this.isAttendanceStatus(status)) return;
    const sessionId = this.session()?.id;
    if (!sessionId) return;

    this.store.markAttendance(sessionId, athleteId, status);
    this.message.set('Jelenlét elmentve.');
  }

  protected saveFeedback(athleteId: number): void {
    const sessionId = this.session()?.id;
    const draft = this.feedbackDraft(athleteId);
    if (!sessionId || !Number.isInteger(draft.rating) || draft.rating < 1 || draft.rating > 5) {
      this.message.set('Az értékelés 1 és 5 közötti egész szám legyen.');
      return;
    }

    this.store.saveFeedback(sessionId, athleteId, draft.note.trim(), draft.rating);
    this.feedbackDrafts.update(drafts => ({
      ...drafts,
      [athleteId]: { note: '', rating: 5 },
    }));
    this.message.set('Edzői visszajelzés elmentve.');
  }

  protected updateNote(athleteId: number, event: Event): void {
    const note = (event.currentTarget as HTMLTextAreaElement).value;
    this.updateFeedbackDraft(athleteId, { note });
  }

  protected updateRating(athleteId: number, event: Event): void {
    const value = Number((event.currentTarget as HTMLInputElement).value);
    this.updateFeedbackDraft(athleteId, { rating: value });
  }

  private updateFeedbackDraft(athleteId: number, update: Partial<FeedbackDraft>): void {
    this.feedbackDrafts.update(drafts => ({
      ...drafts,
      [athleteId]: { ...this.feedbackDraft(athleteId), ...update },
    }));
  }

  private isAttendanceStatus(value: string): value is AttendanceStatus {
    return this.statusOptions.some(option => option.value === value);
  }
}
