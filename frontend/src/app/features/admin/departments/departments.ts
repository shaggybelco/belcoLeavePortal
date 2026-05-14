import { Component, OnInit, inject } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { DepartmentService } from '../../../core/services/department.service';
import { Department } from '../../../core/models/department.model';
import { DepartmentFormDialogComponent, DepartmentFormData } from './department-form-dialog';
import { ConfirmDialogComponent, ConfirmDialogData } from '../../../shared/components/confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-admin-departments',
  standalone: true,
  imports: [MatTableModule, MatButtonModule, MatCardModule, MatIconModule],
  templateUrl: './departments.html'
})
export class AdminDepartmentsComponent implements OnInit {
  private deptService = inject(DepartmentService);
  private dialog      = inject(MatDialog);

  departments: Department[] = [];
  columns = ['name', 'actions'];

  ngOnInit() { this.load(); }

  load() { this.deptService.getAll().subscribe(d => this.departments = d); }

  openAdd() {
    this.dialog.open<DepartmentFormDialogComponent, DepartmentFormData>(DepartmentFormDialogComponent, {
      data: {}
    }).afterClosed().subscribe(result => {
      if (!result) return;
      this.deptService.create({ name: result.name }).subscribe(() => this.load());
    });
  }

  openEdit(dept: Department) {
    this.dialog.open<DepartmentFormDialogComponent, DepartmentFormData>(DepartmentFormDialogComponent, {
      data: { department: dept }
    }).afterClosed().subscribe(result => {
      if (!result) return;
      this.deptService.update(dept.id, { name: result.name }).subscribe(() => this.load());
    });
  }

  confirmDelete(dept: Department) {
    this.dialog.open<ConfirmDialogComponent, ConfirmDialogData>(ConfirmDialogComponent, {
      data: {
        title:        'Delete Department',
        message:      `Are you sure you want to delete "${dept.name}"? This action cannot be undone.`,
        confirmLabel: 'Delete',
        confirmColor: 'warn',
        icon:         'delete_outline',
      }
    }).afterClosed().subscribe(confirmed => {
      if (!confirmed) return;
      this.deptService.delete(dept.id).subscribe(() => this.load());
    });
  }
}
