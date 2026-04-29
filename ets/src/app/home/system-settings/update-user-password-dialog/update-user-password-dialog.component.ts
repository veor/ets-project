import { Component, Inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { SystemSettingsService } from '../../../services/system-settings.service';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { SnackBarService } from '../../../services/snackbar.service';

@Component({
  selector: 'app-update-user-password-dialog',
  standalone: true,
  imports: [
    MatIconModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    ReactiveFormsModule
  ],
  templateUrl: './update-user-password-dialog.component.html',
  styleUrl: './update-user-password-dialog.component.css'
})
export class UpdateUserPasswordDialogComponent {
 form: FormGroup;
  saving = false;

  constructor(
    private fb: FormBuilder,
    private systemSettingsService: SystemSettingsService,
    private dialogRef: MatDialogRef<UpdateUserPasswordDialogComponent>,
    private toast: SnackBarService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.form = this.fb.group({
      new_password: ['', [Validators.required, Validators.minLength(6)]],
      confirm_password: ['', [Validators.required]],
    });
  }

  close() {
    this.dialogRef.close(false);
  }

  save() {
    if (this.form.invalid) {
      this.toast.show('Please fill out all required fields.', 'error');
      return;
    }

    if (this.form.value.new_password !== this.form.value.confirm_password) {
      this.toast.show('Passwords do not match!', 'error');
      return;
    }

    this.saving = true;

    const payload = {
      user_id: this.data.user.id_number,
      new_password: this.form.value.new_password
    };

    this.systemSettingsService.adminChangeUserPassword(payload).subscribe({
      next: (response) => {
        this.toast.show(response.message, response.status === 'success' ? 'success' : 'error');
        this.saving = false;
        if (response.status === 'success') {
          this.dialogRef.close(true);
        }
      },
      error: () => {
        this.toast.show('Failed to update password.', 'error');
        this.saving = false;
      }
    });
  }
}
