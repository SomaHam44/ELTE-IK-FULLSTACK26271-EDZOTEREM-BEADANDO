import { Service, signal } from '@angular/core';
import {
  AttendanceRecord,
  AttendanceStatus,
  TrainingGroup,
  TrainingSession,
  UserSummary,
} from '../shared/models/gym.models';

const START_GROUP: TrainingGroup = {
  id: 1,
  name: 'Kezdő csoport',
  startDate: '2026-11-04',
  durationWeeks: 8,
  status: 'active',
  leadCoach: { id: 10, name: 'Teszt Edző' },
  coaches: [
    { id: 10, name: 'Teszt Edző' },
    { id: 11, name: 'Helyettes edző' },
  ],
  athletes: [
    { id: 20, name: 'Teszt Sportoló' },
    { id: 21, name: 'Sportoló 2' },
  ],
  weeklySchedule: [
    { id: 1, weekday: 1, startTime: '17:30', durationMinutes: 60 },
    { id: 2, weekday: 3, startTime: '17:30', durationMinutes: 60 },
  ],
};

@Service()
export class DemoStore {
  private nextGroupId = 2;
  private nextScheduleIdValue = 3;
  private nextSessionId = 100;

  readonly coaches = signal<UserSummary[]>([
    { id: 10, name: 'Teszt Edző' },
    { id: 11, name: 'Helyettes edző' },
    { id: 12, name: 'Edző 3' },
  ]);

  readonly athletes = signal<UserSummary[]>([
    { id: 20, name: 'Teszt Sportoló' },
    { id: 21, name: 'Sportoló 2' },
    { id: 22, name: 'Sportoló 3' },
    { id: 23, name: 'Sportoló 4' },
  ]);

  readonly groups = signal<TrainingGroup[]>([START_GROUP]);
  readonly sessions = signal<TrainingSession[]>(this.createSessions(START_GROUP));
  readonly attendance = signal<AttendanceRecord[]>([]);

  createGroup(input: Omit<TrainingGroup, 'id' | 'status'>): TrainingGroup {
    const group: TrainingGroup = {
      ...input,
      id: this.nextGroupId++,
      status: 'active',
    };

    this.groups.update(groups => [...groups, group]);
    this.sessions.update(sessions => [...sessions, ...this.createSessions(group)]);
    return group;
  }

  findGroup(groupId: number): TrainingGroup | undefined {
    return this.groups().find(group => group.id === groupId);
  }

  findSession(sessionId: number): TrainingSession | undefined {
    return this.sessions().find(session => session.id === sessionId);
  }

  cancelSession(sessionId: number, reason: string): void {
    this.sessions.update(sessions =>
      sessions.map(session =>
        session.id === sessionId
          ? { ...session, status: 'cancelled', cancellationReason: reason }
          : session
      )
    );
  }

  markAttendance(
    sessionId: number,
    athleteId: number,
    status: AttendanceStatus,
  ): void {
    this.attendance.update(records => {
      const existing = records.some(
        record => record.sessionId === sessionId && record.athleteId === athleteId
      );

      if (!existing) {
        return [
          ...records,
          { sessionId, athleteId, status, coachNote: '', rating: null },
        ];
      }

      return records.map(record =>
        record.sessionId === sessionId && record.athleteId === athleteId
          ? { ...record, status }
          : record
      );
    });
  }

  saveFeedback(
    sessionId: number,
    athleteId: number,
    coachNote: string,
    rating: number | null,
  ): void {
    this.attendance.update(records => {
      const existing = records.find(
        record => record.sessionId === sessionId && record.athleteId === athleteId
      );

      if (!existing) {
        return [
          ...records,
          {
            sessionId,
            athleteId,
            status: 'present',
            coachNote,
            rating,
          },
        ];
      }

      return records.map(record =>
        record.sessionId === sessionId && record.athleteId === athleteId
          ? { ...record, coachNote, rating }
          : record
      );
    });
  }

  nextScheduleId(): number {
    return this.nextScheduleIdValue++;
  }

  private createSessions(group: TrainingGroup): TrainingSession[] {
    const sessions: TrainingSession[] = [];
    const firstDay = Date.parse(`${group.startDate}T00:00:00.000Z`);

    for (let dayIndex = 0; dayIndex < group.durationWeeks * 7; dayIndex++) {
      const day = new Date(firstDay + dayIndex * 24 * 60 * 60 * 1000);
      const weekday = day.getUTCDay() === 0 ? 7 : day.getUTCDay();
      const matchingRules = group.weeklySchedule.filter(rule => rule.weekday === weekday);
      const date = day.toISOString().slice(0, 10);

      for (const rule of matchingRules) {
        const startsAt = this.budapestLocalTimeToIso(date, rule.startTime);
        const endsAt = new Date(
          Date.parse(startsAt) + rule.durationMinutes * 60 * 1000
        ).toISOString();

        sessions.push({
          id: this.nextSessionId++,
          groupId: group.id,
          startsAt,
          endsAt,
          status: 'scheduled',
          cancellationReason: null,
          coaches: group.coaches,
        });
      }
    }

    return sessions;
  }

  private budapestLocalTimeToIso(date: string, time: string): string {
    const [year, month, day] = date.split('-').map(Number);
    const [hour, minute] = time.split(':').map(Number);
    const targetWallClock = Date.UTC(year, month - 1, day, hour, minute);
    const formatter = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Europe/Budapest',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    });

    let instant = targetWallClock;
    for (let attempt = 0; attempt < 2; attempt++) {
      const parts = formatter.formatToParts(new Date(instant));
      const read = (type: Intl.DateTimeFormatPartTypes) =>
        Number(parts.find(part => part.type === type)?.value ?? 0);
      const displayedAsUtc = Date.UTC(
        read('year'),
        read('month') - 1,
        read('day'),
        read('hour'),
        read('minute')
      );
      instant += targetWallClock - displayedAsUtc;
    }

    return new Date(instant).toISOString();
  }
}
