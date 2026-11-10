import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DemoStore } from '../../../../core/demo-store';
import { inject } from '@angular/core';

@Component({
  imports: [RouterLink],
  selector: 'app-groups-page',
  styleUrl: './groups-page.css',
  templateUrl: './groups-page.html',
})
export class GroupsPage {
  private readonly store = inject(DemoStore);

  protected readonly groups = this.store.groups;
  protected readonly sessions = this.store.sessions;

  protected weekdayName(day: number): string {
    return ['—', 'Hétfő', 'Kedd', 'Szerda', 'Csütörtök', 'Péntek', 'Szombat', 'Vasárnap'][day] ?? '—';
  }
}
