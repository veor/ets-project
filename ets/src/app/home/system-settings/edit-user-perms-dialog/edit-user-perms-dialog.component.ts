import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { SystemSettingsService } from '../../../services/system-settings.service';
import { CommonModule } from '@angular/common';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { SnackBarService } from '../../../services/snackbar.service';

@Component({
  selector: 'app-edit-user-perms-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatCheckboxModule,
    MatButtonModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './edit-user-perms-dialog.component.html',
  styleUrl: './edit-user-perms-dialog.component.css'
})
export class EditUserPermsDialogComponent implements OnInit {

  private fb = inject(FormBuilder);
  private sysService = inject(SystemSettingsService);
  private dialogRef = inject(MatDialogRef<EditUserPermsDialogComponent>);
  private data = inject(MAT_DIALOG_DATA);
  private toast = inject(SnackBarService);

  loading = true;
  permForm!: FormGroup;

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

  ngOnInit(): void {
    this.loadPermissions();
  }

  loadPermissions() {
    const id = this.data.user.id_number;

    this.sysService.getSelUserPerms(id).subscribe({
      next: (res) => {
        const saved = res.data || [];
        this.buildForm(saved);
        this.setupChangeListeners();
        this.loading = false;
      },
      error: () => {
        console.error("Failed to load user permissions");
        this.loading = false;
      }
    });
  }

  buildForm(saved: any[]) {
    this.permForm = this.fb.group({
      perms: this.fb.array(
        this.allPermissions.map(parent => 
          this.fb.group({
            id: [parent.id],
            label: [parent.label],
            allowed: [saved.includes(parent.id)],
            children: parent.children ? this.fb.array(
              parent.children.map(c =>
                this.fb.group({
                  id: [c.id],
                  label: [c.label],
                  allowed: [saved.includes(c.id)]
                })
              )
            ) : this.fb.array([])
          })
        )
      )
    });
  }

  setupChangeListeners() {
    this.permsArray.controls.forEach((parentGroup, parentIndex) => {
      const childrenArray = this.getChildrenArray(parentIndex);
      
      // Listen to parent checkbox changes
      parentGroup.get('allowed')?.valueChanges.subscribe((isChecked) => {
        this.onParentChange(parentIndex, isChecked);
      });

      // Listen to each child checkbox change
      childrenArray.controls.forEach((childGroup, childIndex) => {
        childGroup.get('allowed')?.valueChanges.subscribe(() => {
          this.onChildChange(parentIndex);
        });
      });
    });
  }

  onParentChange(parentIndex: number, isChecked: boolean) {
    const childrenArray = this.getChildrenArray(parentIndex);
    
    // When parent is checked/unchecked, update all children
    childrenArray.controls.forEach(child => {
      child.get('allowed')?.setValue(isChecked, { emitEvent: false });
    });
  }

  onChildChange(parentIndex: number) {
    const parentGroup = this.permsArray.at(parentIndex);
    const childrenArray = this.getChildrenArray(parentIndex);
    
    // Check if any child is checked
    const anyChildChecked = childrenArray.controls.some(
      child => child.get('allowed')?.value === true
    );
    
    // If any child is checked, automatically check the parent
    // If no children are checked, uncheck the parent
    parentGroup.get('allowed')?.setValue(anyChildChecked, { emitEvent: false });
  }

  get permsArray(): FormArray {
    return this.permForm.get('perms') as FormArray;
  }

  // Helper method to get children FormArray with proper typing
  getChildrenArray(parentIndex: number): FormArray {
    return this.permsArray.at(parentIndex).get('children') as FormArray;
  }

  save() {
    const selected: string[] = [];

    this.permsArray.controls.forEach((parent, i) => {
      if (parent.value.allowed) selected.push(parent.value.id);

      const childrenArray = this.getChildrenArray(i);
      childrenArray.controls.forEach(child => {
        if (child.value.allowed) selected.push(child.value.id);
      });
    });

    this.sysService.updateSelUserPerms({
      id_number: this.data.user.id_number,
      permissions: selected
    }).subscribe({
      next: () => {
        this.toast.show('User permissions updated successfully', 'success');
        this.dialogRef.close(true);
      },
      error: (err) => {
        console.error('Failed to update permissions', err);
        this.toast.show('Failed to update permissions', 'error');
      }
    });
  }

  close() {
    this.dialogRef.close();
  }
}