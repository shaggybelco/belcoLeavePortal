import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { LeaveTypeService } from '../../../core/services/leave-type.service';
import { LeaveRequestService } from '../../../core/services/leave-request.service';
import { LeaveType } from '../../../core/models/leave-type.model';

@Component({
  selector: 'app-apply-leave',
  standalone: true,
  imports: [
    ReactiveFormsModule, DatePipe, MatCardModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatButtonModule, MatDatepickerModule, MatNativeDateModule,
    MatIconModule
  ],
  templateUrl: './apply.html'
})
export class ApplyLeaveComponent implements OnInit {
  private fb                = inject(FormBuilder);
  private leaveTypeService  = inject(LeaveTypeService);
  private requestService    = inject(LeaveRequestService);
  private router            = inject(Router);

  leaveTypes: LeaveType[] = [];
  error   = '';
  success = false;
  today   = new Date();

  form = this.fb.group({
    leaveTypeId:     ['', Validators.required],
    startDate:       [null as Date | null, Validators.required],
    endDate:         [null as Date | null, Validators.required],
    employeeComment: ['']
  });

  ngOnInit() {
    this.leaveTypeService.getAll().subscribe(types =>
      this.leaveTypes = types.filter(t => t.isActive)
    );
  }

  get selectedType(): LeaveType | undefined {
    return this.leaveTypes.find(t => t.id === this.form.value.leaveTypeId);
  }

  get dayCount(): number {
    const { startDate, endDate } = this.form.value;
    if (!startDate || !endDate) return 0;
    const diff = (endDate as Date).getTime() - (startDate as Date).getTime();
    return Math.max(0, Math.round(diff / 86_400_000) + 1);
  }

  submit() {
    if (this.form.invalid) return;
    this.error = '';
    const { leaveTypeId, startDate, endDate, employeeComment } = this.form.value;
    this.requestService.create({
      leaveTypeId: leaveTypeId!,
      startDate:   this.fmt(startDate!),
      endDate:     this.fmt(endDate!),
      employeeComment: employeeComment || undefined
    }).subscribe({
      next: () => this.router.navigate(['/employee/history']),
      error: err => this.error = err.error?.message ?? 'Failed to submit request.'
    });
  }

  private fmt(d: Date): string {
    return d.toISOString().split('T')[0];
  }
}
