import { Component, inject, signal } from '@angular/core';
import { FormField, applyEach, form, max, min, pattern, required } from '@angular/forms/signals';
import { Router, RouterLink } from '@angular/router';
import { DemoStore } from '../../../../core/demo-store';
import { TrainingGroup, UserSummary, WeeklySchedule } from '../../../../shared/models/gym.models';

interface ScheduleDraft {
  weekday: string;
  startTime: string;
  durationMinutes: number;
}

interface GroupDraft {
  name: string;
  startDate: string;
  durationWeeks: number;
  leadCoachId: number;
  assistantCoachIds: number[];
  athleteIds: number[];
  weeklySchedule: ScheduleDraft[];
}

const WEEKDAY_BY_VALUE: Record<string, WeeklySchedule['weekday']> = {
  '1': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7,
};

@Component({
  imports: [FormField, RouterLink],
  selector: 'app-group-form-page',
  styleUrl: './group-form-page.css',
  templateUrl: './group-form-page.html',
})
export class GroupFormPage {
  private readonly store = inject(DemoStore);
  private readonly router = inject(Router);

  protected readonly submitted = signal(false);
  protected readonly selectionError = signal('');
  protected readonly coaches = this.store.coaches;
  protected readonly athletes = this.store.athletes;
  protected readonly weekdayOptions = [
    { value: '1', label: 'Hétfő' },
    { value: '2', label: 'Kedd' },
    { value: '3', label: 'Szerda' },
    { value: '4', label: 'Csütörtök' },
    { value: '5', label: 'Péntek' },
    { value: '6', label: 'Szombat' },
    { value: '7', label: 'Vasárnap' },
  ];

  protected readonly model = signal<GroupDraft>({
    name: '',
    startDate: '2026-11-04',
    durationWeeks: 8,
    leadCoachId: 10,
    assistantCoachIds: [11],
    athleteIds: [20, 21],
    weeklySchedule: [{ weekday: '1', startTime: '17:30', durationMinutes: 60 }],
  });

  protected readonly groupForm = form(this.model, path => {
    required(path.name, { message: 'A csoport neve kötelező.' });
    required(path.startDate, { message: 'Add meg a kezdődátumot.' });
    min(path.durationWeeks, 1, { message: 'A csoport legalább 1 hetes legyen.' });
    max(path.durationWeeks, 52, { message: 'A csoport legfeljebb 52 hetes lehet.' });
    applyEach(path.weeklySchedule, schedule => {
      required(schedule.weekday, { message: 'Válassz napot.' });
      pattern(schedule.weekday, /^[1-7]$/, { message: 'Válassz érvényes napot.' });
      required(schedule.startTime, { message: 'Add meg az edzés kezdetét.' });
      min(schedule.durationMinutes, 15, { message: 'Legalább 15 perc legyen.' });
      max(schedule.durationMinutes, 240, { message: 'Legfeljebb 240 perc lehet.' });
    });
  });

  protected addSchedule(): void {
    this.model.update(current => ({
      ...current,
      weeklySchedule: [
        ...current.weeklySchedule,
        { weekday: '3', startTime: '17:30', durationMinutes: 60 },
      ],
    }));
  }

  protected removeSchedule(index: number): void {
    this.model.update(current => ({
      ...current,
      weeklySchedule: current.weeklySchedule.filter((_, itemIndex) => itemIndex !== index),
    }));
  }

  protected changeLeadCoach(event: Event): void {
    const coachId = Number((event.currentTarget as HTMLSelectElement).value);
    this.model.update(current => ({ ...current, leadCoachId: coachId }));
  }

  protected toggleAssistantCoach(coachId: number, event: Event): void {
    const checked = (event.currentTarget as HTMLInputElement).checked;
    this.model.update(current => ({
      ...current,
      assistantCoachIds: checked
        ? [...new Set([...current.assistantCoachIds, coachId])]
        : current.assistantCoachIds.filter(id => id !== coachId),
    }));
  }

  protected toggleAthlete(athleteId: number, event: Event): void {
    const checked = (event.currentTarget as HTMLInputElement).checked;
    this.model.update(current => ({
      ...current,
      athleteIds: checked
        ? [...new Set([...current.athleteIds, athleteId])]
        : current.athleteIds.filter(id => id !== athleteId),
    }));
  }

  protected save(): void {
    this.submitted.set(true);
    this.selectionError.set('');

    if (!this.groupForm().valid()) return;

    const draft = this.model();
    if (draft.athleteIds.length === 0) {
      this.selectionError.set('Válassz legalább egy sportolót a csoporthoz.');
      return;
    }

    const leadCoach = this.store.coaches().find(coach => coach.id === draft.leadCoachId);
    if (!leadCoach) {
      this.selectionError.set('Válassz vezetőedzőt.');
      return;
    }

    const selectedCoachIds = new Set([leadCoach.id, ...draft.assistantCoachIds]);
    const selectedCoaches = this.store.coaches().filter(coach => selectedCoachIds.has(coach.id));
    const group: Omit<TrainingGroup, 'id' | 'status'> = {
      name: draft.name.trim(),
      startDate: draft.startDate,
      durationWeeks: draft.durationWeeks,
      leadCoach,
      coaches: selectedCoaches,
      athletes: this.store.athletes().filter(athlete => draft.athleteIds.includes(athlete.id)),
      weeklySchedule: draft.weeklySchedule.map(rule => ({
        id: this.store.nextScheduleId(),
        weekday: WEEKDAY_BY_VALUE[rule.weekday] ?? 1,
        startTime: rule.startTime,
        durationMinutes: rule.durationMinutes,
      })),
    };

    const created = this.store.createGroup(group);
    void this.router.navigate(['/admin/groups', created.id]);
  }
}
