export type UserRole = 'admin' | 'coach' | 'athlete';

export type SessionStatus =
  | 'scheduled'
  | 'cancelled'
  | 'completed';

export type AttendanceStatus =
  | 'present'
  | 'absent'
  | 'late'
  | 'excused';

export interface UserSummary {
  id: number;
  name: string;
}

export interface WeeklySchedule {
  id: number;
  weekday: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  startTime: string;
  durationMinutes: number;
}

export interface TrainingGroup {
  id: number;
  name: string;
  startDate: string;
  durationWeeks: number;
  status: 'planned' | 'active' | 'finished';
  leadCoach: UserSummary;
  coaches: UserSummary[];
  athletes: UserSummary[];
  weeklySchedule: WeeklySchedule[];
}

export interface TrainingSession {
  id: number;
  groupId: number;
  startsAt: string;
  endsAt: string;
  status: SessionStatus;
  cancellationReason: string | null;
  coaches: UserSummary[];
}

export interface AttendanceRecord {
  sessionId: number;
  athleteId: number;
  status: AttendanceStatus;
  coachNote: string;
  rating: number | null;
}
