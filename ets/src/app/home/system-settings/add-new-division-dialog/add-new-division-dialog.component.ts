import { Component, Inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { SystemSettingsService } from '../../../services/system-settings.service';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-add-new-division-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    CommonModule
  ],
  templateUrl: './add-new-division-dialog.component.html',
  styleUrl: './add-new-division-dialog.component.css'
})
export class AddNewDivisionDialogComponent {
  form: FormGroup;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private systemSettingsService: SystemSettingsService,
    private dialogRef: MatDialogRef<AddNewDivisionDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.form = this.fb.group({
      division_name: ['', Validators.required]
    });
  }

  close() {
    if (!this.loading) {
      this.dialogRef.close(false);
    }
  }

  save() {
    if (this.form.invalid || this.loading) return;

    this.loading = true;

    const payload = {
      office_id: this.data.office.office_id,
      division_name: this.form.value.division_name.trim()
    };

    this.systemSettingsService.addDivision(payload).subscribe({
      next: (res) => {
        this.loading = false;
        this.dialogRef.close(res.status === 'success');
      },
      error: () => {
        this.loading = false;
        this.dialogRef.close(false);
      }
    });
  }
}