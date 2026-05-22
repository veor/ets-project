import { Component, OnInit } from '@angular/core';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { SystemSettingsService } from '../../../services/system-settings.service';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { SnackBarService } from '../../../services/snackbar.service';

interface Permission {
  id: string;
  label: string;
  children?: { id: string; label: string }[];
}

@Component({
  selector: 'app-change-permissions-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatCheckboxModule,
    MatIconModule
  ],
  templateUrl: './change-permissions-dialog.component.html',
  styleUrl: './change-permissions-dialog.component.css'
})
export class ChangePermissionsDialogComponent implements OnInit {
  allPermissions: Permission[] = [
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
    // { id: '3.6', label: 'Register Device'},
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
  isAddingPerms = false;
  loading = true;

  constructor(
    private dialogRef: MatDialogRef<ChangePermissionsDialogComponent>,
    private systemSettingsService: SystemSettingsService,
    private toast: SnackBarService,
  ) {}

  ngOnInit(): void {
    this.loadUserPermissions();
  }

  loadUserPermissions(): void {
    this.systemSettingsService.getUserPermissions().subscribe({
      next: (response) => {
        if (response.status === 'success') {
          this.selectedPermissions = response.permissions || [];
        }
        this.loading = false;
      },
      error: () => {
        console.error('Failed to load user permissions');
        this.loading = false;
      }
    });
  }

  togglePermission(permission: string, children?: { id: string }[]): void {
    const index = this.selectedPermissions.indexOf(permission);

    if (index > -1) {
      // Remove permission
      this.selectedPermissions.splice(index, 1);

      // Remove all children if parent is unchecked
      if (children) {
        children.forEach(child => {
          const childIndex = this.selectedPermissions.indexOf(child.id);
          if (childIndex > -1) {
            this.selectedPermissions.splice(childIndex, 1);
          }
        });
      }
    } else {
      // Add permission
      this.selectedPermissions.push(permission);

      // Add all children if parent is checked
      if (children) {
        children.forEach(child => {
          if (!this.selectedPermissions.includes(child.id)) {
            this.selectedPermissions.push(child.id);
          }
        });
      }

      // Check if this is a child permission
      const parent = this.allPermissions.find(p => 
        p.children?.some(child => child.id === permission)
      );
      if (parent && !this.selectedPermissions.includes(parent.id)) {
        this.selectedPermissions.push(parent.id);
      }
    }
  }

  isChecked(permissionId: string): boolean {
    return this.selectedPermissions.includes(permissionId);
  }

  savePermissions(): void {
    this.isAddingPerms = true;

    const payload = { permissions: this.selectedPermissions };

    this.systemSettingsService.updateUserPermissions(payload).subscribe({
      next: (response) => {
        if (response.status === 'success') {
          this.toast.show('Permissions updated successfully.', 'success');
          this.toast.show('Re-login, to see your changes.', 'info');
          this.dialogRef.close(true);
        } else {
          this.toast.show('Failed to permissions update successfully.', 'error');
          this.isAddingPerms = false;
        }
      },
      error: () => {
        this.toast.show('Error updating permissions.', 'error');
        this.isAddingPerms = false;
      }
    });
  }

  closeDialog(): void {
    this.dialogRef.close();
  }
}