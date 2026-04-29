import { Component, Inject, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { SnackBarService } from '../../../services/snackbar.service';
import { SystemSettingsService } from '../../../services/system-settings.service';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';

@Component({
  selector: 'app-add-new-user-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,

    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatCheckboxModule
  ],
  templateUrl: './add-new-user-dialog.component.html',
  styleUrl: './add-new-user-dialog.component.css'
})
export class AddNewUserDialogComponent implements OnInit {
 userForm: FormGroup;
  divisions: any[] = [];
  loading = false;

  allPermissions: { id: string; label: string; children?: { id: string; label: string }[] }[] = [
    { id: '1.1', label: 'Administrator', children: [
      { id: '1.2', label: 'Change Password' },
      { id: '2.1', label: 'Manage System' },
      { id: '2.2', label: 'Enable Account Section' },
      { id: '2.3', label: 'Edit Current User' },
      { id: '2.4', label: 'Change Current User Password' },
      { id: '2.5', label: 'Edit Current User Permissions' },
      { id: '2.6', label: 'Enable User Section' },
      { id: '2.7', label: 'Add New User' },
      { id: '2.8', label: 'Add New Technical Staff' },
      { id: '2.9', label: 'Edit User' },
      { id: '3.1', label: 'Enable Department Section' },
      { id: '3.2', label: 'Add New Department' },
      { id: '3.3', label: 'Edit Department' },
    ]},
    { id: '3.4', label: 'Dashboard', children: [
      { id: '5.4', label: 'My Data' },
      { id: '5.5', label: 'All Data' },
    ]},
    { id: '3.6', label: 'Register Device'},
    { id: '4.1', label: 'Preventive Maintenance', children: [
      { id: '4.3', label: 'Maintenance Log' },
      { id: '4.2', label: 'Device Record' },
    ]},
    { id: '5.1', label: 'Office Request' },
    { id: '5.6', label: 'Accept & Assign Technical Staff' },
    { id: '5.2', label: 'Support Request' },
    { id: '5.3', label: 'Monitoring' },
    { id: '3.5', label: 'Task' },
  ];

  selectedPermissions: string[] = [];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AddNewUserDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private systemSettingsService: SystemSettingsService,
    private toast: SnackBarService
  ) {
    this.userForm = this.fb.group({
      id_number: ['', Validators.required],
      name: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
      designation: ['', Validators.required],
      office_id: ['', Validators.required],
      division_id: ['']
    });
  }

  ngOnInit(): void {
    this.userForm.get('office_id')?.valueChanges.subscribe(officeId => {
      if (officeId) {
        this.loadDivisions(officeId);
      } else {
        this.divisions = [];
        this.userForm.patchValue({ division_id: null });
      }
    });
  }

  loadDivisions(officeId: number): void {
    this.systemSettingsService.getDivisionsByOffice(officeId).subscribe({
      next: (response) => {
        if (response.status === 'success') {
          this.divisions = response.data;
        }
      },
      error: () => {
        this.toast.show('Failed to load divisions', 'error');
        this.divisions = [];
      }
    });
  }

  togglePermission(id: string, children: any[] = []): void {
    const index = this.selectedPermissions.indexOf(id);

    if (index > -1) {
      // Uncheck: remove parent and all children
      this.selectedPermissions.splice(index, 1);

      if (children.length) {
        children.forEach(child => {
          const childIndex = this.selectedPermissions.indexOf(child.id);
          if (childIndex > -1) {
            this.selectedPermissions.splice(childIndex, 1);
          }
        });
      }
    } else {
      // Check: add parent and all children
      this.selectedPermissions.push(id);

      if (children.length) {
        children.forEach(child => {
          if (!this.selectedPermissions.includes(child.id)) {
            this.selectedPermissions.push(child.id);
          }
        });
      }

      // Auto-check parent if child is checked
      const parent = this.allPermissions.find(p =>
        p.children?.some(child => child.id === id)
      );
      if (parent && !this.selectedPermissions.includes(parent.id)) {
        this.selectedPermissions.push(parent.id);
      }
    }
  }

  isPermissionSelected(id: string): boolean {
    return this.selectedPermissions.includes(id);
  }

onSubmit(): void {
  if (this.userForm.invalid) {
    this.userForm.markAllAsTouched();
    this.toast.show('Please fill in all required fields', 'error');
    return;
  }

  this.loading = true;

  // Transform designation to title case (first letter of each word uppercase)
  const designation = this.userForm.value.designation
    ? this.userForm.value.designation
        .toLowerCase()
        .split(' ')
        .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
    : '';

  const payload = {
    ...this.userForm.value,
    designation: designation,
    permissions: JSON.stringify(this.selectedPermissions)
  };

  this.systemSettingsService.addUser(payload).subscribe({
    next: (response) => {
      this.loading = false;
      if (response.status === 'success') {
        this.toast.show('User added successfully!', 'success');
        this.dialogRef.close(true);
      } else {
        this.toast.show(response.message || 'Failed to add user', 'error');
      }
    },
    error: (err) => {
      this.loading = false;
      this.toast.show('Error adding user', 'error');
      console.error('Error:', err);
    }
  });
}

  onCancel(): void {
    this.dialogRef.close(false);
  }
}