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
import { LeaveBalanceService } from '../../../core/services/leave-balance.service';
import { LeaveType } from '../../../core/models/leave-type.model';
import { LeaveBalance } from '../../../core/models/leave-balance.model';

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
  private fb                  = inject(FormBuilder);
  private leaveTypeService    = inject(LeaveTypeService);
  private requestService      = inject(LeaveRequestService);
  private balanceService      = inject(LeaveBalanceService);
  private router              = inject(Router);

  leaveTypes: LeaveType[]   = [];
  balances:   LeaveBalance[] = [];
  error   = '';
  today   = new Date();

  /** ISO date strings (YYYY-MM-DD) that are already booked (Pending or Approved). */
  private bookedDates = new Set<string>();

  form = this.fb.group({
    leaveTypeId:     ['', Validators.required],
    startDate:       [null as Date | null, Validators.required],
    endDate:         [null as Date | null, Validators.required],
    employeeComment: ['']
  });

  /**
   * Passed directly to [dateFilter] on both datepickers.
   * Must be an arrow function so `this` stays bound after Angular calls it.
   */
  dateFilter = (d: Date | null): boolean => {
    if (!d) return false;
    return !this.bookedDates.has(this.fmt(d));
  };

  ngOnInit() {
    this.leaveTypeService.getAll().subscribe(types =>
      this.leaveTypes = types.filter(t => t.isActive)
    );
    this.balanceService.getMine().subscribe(b => this.balances = b);
    this.requestService.getMine().subscribe(requests => {
      this.bookedDates.clear();
      requests
        .filter(r => r.status === 'Pending' || r.status === 'Approved')
        .forEach(r => {
          const cur = new Date(r.startDate);
          const end = new Date(r.endDate);
          while (cur <= end) {
            this.bookedDates.add(this.fmt(cur));
            cur.setDate(cur.getDate() + 1);
          }
        });
    });
  }

  get selectedType(): LeaveType | undefined {
    return this.leaveTypes.find(t => t.id === this.form.value.leaveTypeId);
  }

  get selectedBalance(): LeaveBalance | undefined {
    if (!this.selectedType) return undefined;
    return this.balances.find(b => b.leaveTypeName === this.selectedType!.name);
  }

  get dayCount(): number {
    const { startDate, endDate } = this.form.value;
    if (!startDate || !endDate) return 0;
    const diff = (endDate as Date).getTime() - (startDate as Date).getTime();
    return Math.max(0, Math.round(diff / 86_400_000) + 1);
  }

  get remainingAfter(): number | null {
    if (!this.selectedBalance || this.dayCount === 0) return null;
    return this.selectedBalance.remainingDays - this.dayCount;
  }

  /** True when the chosen date range overlaps at least one already-booked day. */
  get hasDateConflict(): boolean {
    const { startDate, endDate } = this.form.value;
    if (!startDate || !endDate) return false;
    const cur = new Date(startDate);
    const end = new Date(endDate);
    while (cur <= end) {
      if (this.bookedDates.has(this.fmt(cur))) return true;
      cur.setDate(cur.getDate() + 1);
    }
    return false;
  }

  submit() {
    if (this.form.invalid || this.hasDateConflict) return;
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
