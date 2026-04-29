import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { SystemSettingsService } from '../../../services/system-settings.service';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { SnackBarService } from '../../../services/snackbar.service';

@Component({
  selector: 'app-change-password-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './change-password-dialog.component.html',
  styleUrl: './change-password-dialog.component.css'
})
export class ChangePasswordDialogComponent {
  passwordForm: FormGroup;
  showCurrentPassword = false;
  showNewPassword = false;
  showConfirmPassword = false;
  isChangingPassword = false;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<ChangePasswordDialogComponent>,
    private systemSettingsService: SystemSettingsService,
    private toast: SnackBarService,
  ) {
    this.passwordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(form: FormGroup) {
    const newPassword = form.get('newPassword');
    const confirmPassword = form.get('confirmPassword');
    
    if (newPassword && confirmPassword && newPassword.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    return null;
  }

  changePassword(): void {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    this.isChangingPassword = true;

    const payload = {
      current_password: this.passwordForm.value.currentPassword,
      new_password: this.passwordForm.value.newPassword
    };

    this.systemSettingsService.changePassword(payload).subscribe({
      next: (response) => {
        if (response.status === 'success') {
          this.toast.show('Password updated successfully.', 'success');
          this.dialogRef.close(true);
        } else {
          this.toast.show('Failed to update user password: ', 'error', + response.message);
          this.isChangingPassword = false;
        }
      },
      error: (error) => {
        alert('Failed to change password. Please try again.');
        this.toast.show('Failed to change password. Please try again', 'error');
        this.isChangingPassword = false;
      }
    });
  }

  closeDialog(): void {
    this.dialogRef.close();
  }
}