import { Component, Inject, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SystemSettingsService } from '../../../services/system-settings.service';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { SnackBarService } from '../../../services/snackbar.service';

@Component({
  selector: 'app-edit-user-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './edit-user-dialog.component.html',
  styleUrl: './edit-user-dialog.component.css'
})
export class EditUserDialogComponent implements OnInit {

  editForm!: FormGroup;
  offices: any[] = [];
  divisions: any[] = [];

  loadingOffices = true;
  loadingDivisions = false; 
  loadingData = true;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<EditUserDialogComponent>,
    private settingsService: SystemSettingsService,
    private toast: SnackBarService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {
    this.editForm = this.fb.group({
      id_number: [{ value: this.data.user.id_number, disabled: true }],
      name: [this.data.user.name, Validators.required],
      designation: [this.data.user.designation],
      office_id: [this.data.user.office_id],
      division_id: [this.data.user.division_id]
    });

    this.loadOffices();

    if (this.data.user.office_id) {
      this.loadDivisions(this.data.user.office_id);
    } else {
      this.loadingData = false; 
    }
  }

  loadOffices() {
    this.loadingOffices = true;
    this.settingsService.getOffices().subscribe(res => {
      if (res.status === 'success') {
        this.offices = res.data;
      }
      this.loadingOffices = false;
      this.checkIfDoneLoading();
    });
  }

  loadDivisions(officeId: number) {
    this.loadingDivisions = true;
    this.settingsService.getDivisionsByOffice(officeId).subscribe(res => {
      if (res.status === 'success') {
        this.divisions = res.data;
      }
      this.loadingDivisions = false;
      this.checkIfDoneLoading();
    });
  }

  checkIfDoneLoading() {
    if (!this.loadingOffices && !this.loadingDivisions) {
      this.loadingData = false;
    }
  }

  onOfficeChange(officeId: number) {
    this.editForm.patchValue({ division_id: null });
    this.loadDivisions(officeId);
  }

  save() {
    const payload = {
      id_number: this.data.user.id_number,
      name: this.editForm.get('name')?.value,
      designation: this.editForm.get('designation')?.value,
      office_id: this.editForm.get('office_id')?.value,
      division_id: this.editForm.get('division_id')?.value
    };

    this.settingsService.updateUserByAdmin(payload).subscribe(res => {
      if (res.status === 'success') {
        this.toast.show(res.message, 'success');
        this.dialogRef.close(true);
      } else {
        this.toast.show(res.message || 'Something went wrong', 'error');
      }
    });
  }

  close() {
    this.dialogRef.close(false);
  }
}