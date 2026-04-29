import { Component, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { Inject } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { PmService } from '../../../services/pm.service';
import { MatSelectModule } from '@angular/material/select';
import { CommonModule } from '@angular/common';
import { SnackBarService } from '../../../services/snackbar.service';
// import { NotificationService } from '../../../shared/notification.service';

@Component({
  selector: 'app-record-dialog',
  standalone: true,
  imports: [
    MatFormFieldModule, 
    FormsModule, 
    MatDialogModule, 
    MatInputModule,
    MatSelectModule, 
    CommonModule
  ],
  templateUrl: './record-dialog.component.html',
  styleUrls: ['./record-dialog.component.css']
})
export class RecordDialogComponent implements OnInit {
  isSaving: boolean = false;
  controlNumbers: string[] = [];
  techStaffList: { personnel_id: number, personnel_name: string }[] = [];

  constructor(@Inject(MAT_DIALOG_DATA) public data: any,
   private dialogRef: MatDialogRef<RecordDialogComponent>,
  private pmService: PmService,
  private toast: SnackBarService
  // private notificationService: NotificationService
) {}

ngOnInit(): void {
  this.fetchControlNumbers();  
  this.fetchTechStaffList();  
}

fetchControlNumbers(): void {
  this.pmService.getControlNumbers().subscribe((response: any) => {
    if (response.status === 'success' && Array.isArray(response.data)) {
      this.controlNumbers = response.data;
    } else {
      console.error('Failed to fetch control numbers');
    }
  }, error => {
    console.error('Error fetching control numbers', error);
  });
}

fetchTechStaffList(): void {
  this.pmService.getPersonnelList().subscribe((response: any) => {
    if (response.status === 'success' && Array.isArray(response.data)) {
      this.techStaffList = response.data;
    } else {
      console.error('Failed to fetch technical staff list');
    }
  }, error => {
    console.error('Error fetching technical staff list', error);
  });
}

saveData(): void {
  const recordData = {
    control_no: this.data.controlNo,
    date_recorded: this.data.date,
    issues: this.data.issue,
    personnel_id: this.data.staff,
    repair_maintenance_performed: this.data.repair,
    remarks: this.data.remarks,
    record_status: this.data.record_status,
  };
  this.isSaving = true;
  this.pmService.saveNewRecord(recordData).subscribe(
    (response) => {
      if (response.status === 'success') {
        console.log('Record saved successfully');
        // this.notificationService.showNotification('Record has been saved!', 'success');
        this.toast.show('Record has been saved!', 'success');
        this.isSaving = false;
        this.closeDialog();  
      } else {
        console.error('Failed to save record');
        this.isSaving = false;
      }
    },
    (error) => {
      console.error('Error saving record', error);
      // this.notificationService.showNotification('An error occurred. Please try again later.', 'error');
      this.toast.show('An error occurred. Please try again later.', 'error');
    }
  );
}


  closeDialog(): void {
    this.dialogRef.close();
  }
}