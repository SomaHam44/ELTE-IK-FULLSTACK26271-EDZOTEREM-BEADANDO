import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GroupDetailPage } from './group-detail-page';

describe('GroupDetailPage', () => {
  let component: GroupDetailPage;
  let fixture: ComponentFixture<GroupDetailPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GroupDetailPage],
    }).compileComponents();

    fixture = TestBed.createComponent(GroupDetailPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
