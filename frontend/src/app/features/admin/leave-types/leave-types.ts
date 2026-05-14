import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatChipsModule } from '@angular/material/chips';
import { LeaveTypeService } from '../../../core/services/leave-type.service';
import { LeaveType } from '../../../core/models/leave-type.model';

@Component({
  selector: 'app-admin-leave-types',
  standalone: true,
  imports: [ReactiveFormsModule, MatTableModule, MatButtonModule, MatCardModule,
    MatFormFieldModule, MatInputModule, MatChipsModule],
  templateUrl: './leave-types.html'
})
export class AdminLeaveTypesComponent implements OnInit {
  private fb = inject(FormBuilder);
  private leaveTypeService = inject(LeaveTypeService);

  leaveTypes: LeaveType[] = [];
  columns = ['name', 'days', 'status', 'actions'];
  form = this.fb.group({
    name: ['', Validators.required],
    defaultDays: [0, [Validators.required, Validators.min(1)]]
  });
  editingId: string | null = null;

  ngOnInit() { this.load(); }
  load() { this.leaveTypeService.getAll().subscribe(t => this.leaveTypes = t); }

  save() {
    if (this.form.invalid) return;
    const { name, defaultDays } = this.form.value;
    const op = this.editingId
      ? this.leaveTypeService.update(this.editingId, { name: name!, defaultDays: defaultDays!, isActive: true })
      : this.leaveTypeService.create({ name: name!, defaultDays: defaultDays! });
    op.subscribe(() => { this.form.reset(); this.editingId = null; this.load(); });
  }

  edit(lt: LeaveType) { this.editingId = lt.id; this.form.setValue({ name: lt.name, defaultDays: lt.defaultDays }); }
  deactivate(id: string) { this.leaveTypeService.deactivate(id).subscribe(() => this.load()); }
}
