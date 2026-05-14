import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { DepartmentService } from '../../../core/services/department.service';
import { Department } from '../../../core/models/department.model';
import { LoadingComponent } from '../../../shared/components/loading/loading';

@Component({
  selector: 'app-admin-departments',
  standalone: true,
  imports: [ReactiveFormsModule, MatTableModule, MatButtonModule, MatCardModule,
    MatFormFieldModule, MatInputModule, LoadingComponent],
  templateUrl: './departments.html'
})
export class AdminDepartmentsComponent implements OnInit {
  private fb = inject(FormBuilder);
  private deptService = inject(DepartmentService);

  departments: Department[] = [];
  columns = ['name', 'actions'];
  form = this.fb.group({ name: ['', Validators.required] });
  editingId: string | null = null;
  loading = true;

  ngOnInit() { this.load(); }

  load() {
    this.loading = true;
    this.deptService.getAll().subscribe(d => { this.departments = d; this.loading = false; });
  }

  save() {
    if (this.form.invalid) return;
    const name = this.form.value.name!;
    const op = this.editingId
      ? this.deptService.update(this.editingId, { name })
      : this.deptService.create({ name });
    op.subscribe(() => { this.form.reset(); this.editingId = null; this.load(); });
  }

  edit(dept: Department) { this.editingId = dept.id; this.form.setValue({ name: dept.name }); }
}
