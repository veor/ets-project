import { Component } from '@angular/core';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { SnackBarService } from '../../../services/snackbar.service';
import { SystemSettingsService } from '../../../services/system-settings.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-add-new-dept-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './add-new-dept-dialog.component.html',
  styleUrl: './add-new-dept-dialog.component.css'
})
export class AddNewDeptDialogComponent {

 officeName = '';
  officeValue = '';
  saving = false;

  constructor(
    private dialogRef: MatDialogRef<AddNewDeptDialogComponent>,
    private systemSettingsService: SystemSettingsService,
    private toast: SnackBarService
  ) {}

  addDepartment(): void {
    if (!this.officeName.trim() || !this.officeValue.trim()) {
      this.toast.show('Please fill in both Office Name and Acronym', 'error');
      return;
    }

    this.saving = true;

    // Convert to Title Case (first letter of each word uppercase)
    const formattedOfficeName = this.officeName
      .trim()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');

    // Acronym stays uppercase
    const formattedOfficeValue = this.officeValue.charAt(0).toUpperCase() + this.officeValue.slice(1);

    const payload = {
      office_name: formattedOfficeName,
      office_value: formattedOfficeValue
    };

    this.systemSettingsService.addOffice(payload).subscribe({
      next: (res: any) => {
        if (res.status === 'success') {
          this.toast.show('Department added successfully!', 'success');
          this.dialogRef.close(true);
        } else {
          this.toast.show(res.message || 'Failed to add department', 'error');
        }
        this.saving = false;
      },
      error: () => {
        this.toast.show('Error adding department', 'error');
        this.saving = false;
      }
    });
  }

  close(): void {
    this.dialogRef.close();
  }
}