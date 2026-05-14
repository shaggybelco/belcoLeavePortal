import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { LeaveTypeService } from '../../../core/services/leave-type.service';
import { LeaveRequestService } from '../../../core/services/leave-request.service';
import { LeaveType } from '../../../core/models/leave-type.model';

@Component({
  selector: 'app-apply-leave',
  standalone: true,
  imports: [ReactiveFormsModule, MatCardModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatButtonModule, MatDatepickerModule, MatNativeDateModule],
  templateUrl: './apply.html'
})
export class ApplyLeaveComponent implements OnInit {
  private fb = inject(FormBuilder);
  private leaveTypeService = inject(LeaveTypeService);
  private requestService = inject(LeaveRequestService);
  private router = inject(Router);

  leaveTypes: LeaveType[] = [];
  error = '';

  form = this.fb.group({
    leaveTypeId: ['', Validators.required],
    startDate: [null as Date | null, Validators.required],
    endDate: [null as Date | null, Validators.required],
    employeeComment: ['']
  });

  ngOnInit() {
    this.leaveTypeService.getAll().subscribe(types => this.leaveTypes = types.filter(t => t.isActive));
  }

  submit() {
    if (this.form.invalid) return;
    const { leaveTypeId, startDate, endDate, employeeComment } = this.form.value;
    this.requestService.create({
      leaveTypeId: leaveTypeId!,
      startDate: this.formatDate(startDate!),
      endDate: this.formatDate(endDate!),
      employeeComment: employeeComment || undefined
    }).subscribe({
      next: () => this.router.navigate(['/employee/history']),
      error: err => this.error = err.error?.message ?? 'Failed to submit request.'
    });
  }

  private formatDate(d: Date): string {
    return d.toISOString().split('T')[0];
  }
}
