import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GroupFormPage } from './group-form-page';

describe('GroupFormPage', () => {
  let component: GroupFormPage;
  let fixture: ComponentFixture<GroupFormPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GroupFormPage],
    }).compileComponents();

    fixture = TestBed.createComponent(GroupFormPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
