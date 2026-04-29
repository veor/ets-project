import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { SystemSettingsService } from '../../../services/system-settings.service';
import { SnackBarService } from '../../../services/snackbar.service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-add-new-personnel-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './add-new-personnel-dialog.component.html',
  styleUrl: './add-new-personnel-dialog.component.css'
})
export class AddNewPersonnelDialogComponent implements OnInit {
  personnelForm: FormGroup;
  allDivisions: any[] = [];
  loading = false;
  loadingUserInfo = false;
  userFound = false;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AddNewPersonnelDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private systemSettingsService: SystemSettingsService,
    private toast: SnackBarService
  ) {
    this.personnelForm = this.fb.group({
      personnel_id: ['', Validators.required],
      personnel_name: ['', Validators.required],
      division_id: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadAllDivisions();
    this.setupIdNumberListener();
  }

  loadAllDivisions(): void {
    this.systemSettingsService.getAllDivisions().subscribe({
      next: (response) => {
        if (response.status === 'success') {
          this.allDivisions = response.data;
        }
      },
      error: () => {
        this.toast.show('Failed to load divisions', 'error');
      }
    });
  }

  setupIdNumberListener(): void {
    this.personnelForm.get('personnel_id')?.valueChanges
      .pipe(
        debounceTime(500),
        distinctUntilChanged()
      )
      .subscribe(idNumber => {
        if (idNumber && idNumber.trim().length > 0) {
          this.fetchUserInfo(idNumber.trim());
        } else {
          // Clear fields and enable them if ID is empty
          this.userFound = false;
          this.personnelForm.patchValue({
            personnel_name: '',
            division_id: ''
          });
          // Enable fields for manual entry
          this.personnelForm.get('personnel_name')?.enable();
          this.personnelForm.get('division_id')?.enable();
        }
      });
  }

  fetchUserInfo(idNumber: string): void {
    this.loadingUserInfo = true;
    this.userFound = false;

    this.systemSettingsService.getUserById(idNumber).subscribe({
      next: (response) => {
        this.loadingUserInfo = false;
        if (response.status === 'success' && response.data) {
          const user = response.data;
          this.userFound = true;
          
          // Auto-fill the form with user data
          this.personnelForm.patchValue({
            personnel_name: user.name,
            division_id: user.division_id
          });

          // Disable name and division fields since user exists
          this.personnelForm.get('personnel_name')?.disable();
          this.personnelForm.get('division_id')?.disable();

          this.toast.show('User information loaded!', 'success');
        } else {
          // User not found - enable fields for manual entry
          this.userFound = false;
          this.personnelForm.patchValue({
            personnel_name: '',
            division_id: ''
          });
          this.personnelForm.get('personnel_name')?.enable();
          this.personnelForm.get('division_id')?.enable();
          this.toast.show('User not found. You can enter details manually.', 'info');
        }
      },
      error: (err) => {
        this.loadingUserInfo = false;
        this.userFound = false;
        console.error('Error fetching user:', err);
        this.personnelForm.patchValue({
          personnel_name: '',
          division_id: ''
        });
        this.personnelForm.get('personnel_name')?.enable();
        this.personnelForm.get('division_id')?.enable();
      }
    });
  }

  onSubmit(): void {
    if (this.personnelForm.invalid) {
      this.personnelForm.markAllAsTouched();
      this.toast.show('Please fill in all required fields', 'error');
      return;
    }

    this.loading = true;

    const formData = this.personnelForm.value;
    
    const personnelName = this.personnelForm.get('personnel_name')?.value || formData.personnel_name;
    const divisionId = this.personnelForm.get('division_id')?.value || formData.division_id;
    
    const formattedName = personnelName
      .toLowerCase()
      .split(' ')
      .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    const selectedDivision = this.allDivisions.find(
      div => div.division_id === divisionId
    );

    const payload = {
      personnel_id: formData.personnel_id,
      personnel_name: formattedName,
      division_id: divisionId,
      division_name: selectedDivision?.division_name || ''
    };

    this.systemSettingsService.addPersonnel(payload).subscribe({
      next: (response) => {
        this.loading = false;
        if (response.status === 'success') {
          this.toast.show('Technical staff added successfully!', 'success');
          this.dialogRef.close(true);
        } else {
          this.toast.show(response.message || 'Failed to add technical staff', 'error');
        }
      },
      error: (err) => {
        this.loading = false;
        this.toast.show('Error adding technical staff', 'error');
        console.error('Error:', err);
      }
    });
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}