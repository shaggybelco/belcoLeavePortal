import { Component, OnInit, inject } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog } from '@angular/material/dialog';
import { LeaveTypeService } from '../../../core/services/leave-type.service';
import { LeaveType } from '../../../core/models/leave-type.model';
import { LeaveTypeFormDialogComponent, LeaveTypeFormData } from './leave-type-form-dialog';
import { ConfirmDialogComponent, ConfirmDialogData } from '../../../shared/components/confirm-dialog/confirm-dialog';
import { LoadingComponent } from '../../../shared/components/loading/loading';

@Component({
  selector: 'app-admin-leave-types',
  standalone: true,
  imports: [MatTableModule, MatButtonModule, MatCardModule,
    MatIconModule, MatChipsModule, LoadingComponent],
  templateUrl: './leave-types.html'
})
export class AdminLeaveTypesComponent implements OnInit {
  private leaveTypeService = inject(LeaveTypeService);
  private dialog           = inject(MatDialog);

  leaveTypes: LeaveType[] = [];
  columns = ['name', 'days', 'status', 'actions'];
  loading = true;

  ngOnInit() { this.load(); }

  load() {
    this.loading = true;
    this.leaveTypeService.getAll().subscribe(t => {
      this.leaveTypes = t;
      this.loading = false;
    });
  }

  openAdd() {
    this.dialog.open<LeaveTypeFormDialogComponent, LeaveTypeFormData>(LeaveTypeFormDialogComponent, {
      data: {}
    }).afterClosed().subscribe(result => {
      if (!result) return;
      this.leaveTypeService.create({
        name:        result.name,
        defaultDays: result.defaultDays,
      }).subscribe(() => this.load());
    });
  }

  openEdit(lt: LeaveType) {
    this.dialog.open<LeaveTypeFormDialogComponent, LeaveTypeFormData>(LeaveTypeFormDialogComponent, {
      data: { leaveType: lt }
    }).afterClosed().subscribe(result => {
      if (!result) return;
      this.leaveTypeService.update(lt.id, {
        name:        result.name,
        defaultDays: result.defaultDays,
        isActive:    lt.isActive,
      }).subscribe(() => this.load());
    });
  }

  deactivate(lt: LeaveType) {
    this.dialog.open<ConfirmDialogComponent, ConfirmDialogData>(ConfirmDialogComponent, {
      data: {
        title:        'Deactivate Leave Type',
        message:      `Are you sure you want to deactivate "${lt.name}"? Employees won't be able to apply for this leave type.`,
        confirmLabel: 'Deactivate',
        confirmColor: 'warn',
        icon:         'block',
      }
    }).afterClosed().subscribe(confirmed => {
      if (!confirmed) return;
      this.leaveTypeService.deactivate(lt.id).subscribe(() => this.load());
    });
  }
}
