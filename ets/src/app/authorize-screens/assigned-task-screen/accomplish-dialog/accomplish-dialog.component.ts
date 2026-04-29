import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TaskService } from '../../../services/task.service';
import { SnackBarService } from '../../../services/snackbar.service';

@Component({
  selector: 'app-accomplish-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './accomplish-dialog.component.html',
  styleUrl: './accomplish-dialog.component.css'
})
export class AccomplishDialogComponent {
  isButtonLoading = false;
  selectedReport: any;
  serviceTypes = [
    { id: 1, service_type: 'Basic Troubleshooting', quantity: 0 },
    { id: 2, service_type: 'Installation of OS', quantity: 0 },
    { id: 3, service_type: 'Installation of Applications', quantity: 0 },
    { id: 4, service_type: 'Data Backup', quantity: 0, levels: ['LC', 'HC'] },
    { id: 5, service_type: 'Data Retrieval', quantity: 0, levels: ['LC', 'HC'] },
    { id: 6, service_type: 'Printer', quantity: 0, levels: ['Moderate', 'Complex'] },
    { id: 7, service_type: 'Hardware Repair', quantity: 0, levels: ['Simple', 'Moderate', 'Complex'] },
    { id: 8, service_type: 'Network Repair', quantity: 0, levels: ['Moderate', 'Complex'] },
    { id: 9, service_type: 'Network', quantity: 0, levels: ['Wired', 'Wireless', 'Cabling'] },
    { id: 10, service_type: 'Virus', quantity: 0, levels: ['Simple', 'Moderate'] },
    { id: 11, service_type: 'Inspection', quantity: 0, levels: ['Delivery', 'Disposal'] },
    { id: 12, service_type: 'Registration to Biometrics', quantity: 0 }
  ];

  constructor(
    private dialogRef: MatDialogRef<AccomplishDialogComponent>,
    private taskService: TaskService,
    private toast: SnackBarService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.selectedReport = {
      ...data.report,
      selectedServices: data.report.services ? JSON.parse(data.report.services) : [],
      service_level_id: data.report.service_level_id ? JSON.parse(data.report.service_level_id) : {},
      service_quantity_id: data.report.service_quantity_id ? JSON.parse(data.report.service_quantity_id) : {},
      datetime_accomplished: data.report.datetime_accomplished || this.getCurrentDateTimeLocal()
    };
  }

  getCurrentDateTimeLocal(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  onServiceChange(serviceId: number, event: any): void {
    if (event.target.checked) {
      this.selectedReport.selectedServices.push(serviceId);
      if (!this.selectedReport.service_quantity_id[serviceId]) {
        this.selectedReport.service_quantity_id[serviceId] = 1;
      }
      if (!this.selectedReport.service_level_id[serviceId]) {
        this.selectedReport.service_level_id[serviceId] = '';
      }
    } else {
      this.selectedReport.selectedServices = this.selectedReport.selectedServices.filter(
        (id: number) => id !== serviceId
      );
      delete this.selectedReport.service_quantity_id[serviceId];
      delete this.selectedReport.service_level_id[serviceId];
    }
  }

  formatDateTime(dateTime: string): string | null {
    if (!dateTime) return null;
    const date = new Date(dateTime);
    const offset = date.getTimezoneOffset();
    const adjustedDate = new Date(date.getTime() - offset * 60 * 1000);
    return adjustedDate.toISOString().slice(0, 19).replace('T', ' ');
  }

  submitEditForm(): void {
    this.isButtonLoading = true;

    const now = new Date();
    const endTime = now.toTimeString().split(' ')[0];

    const updatedData = {
      ...this.selectedReport,
      datetime_accomplished: this.formatDateTime(this.selectedReport.datetime_accomplished),
      services: this.selectedReport.selectedServices,
      service_level_id: this.selectedReport.service_level_id,
      service_quantity_id: this.selectedReport.service_quantity_id,
      request_status: 'For Release',
      start_time: this.selectedReport.start_time || null,
      end_time: endTime
    };

    this.taskService.updateReport(updatedData).subscribe(
      (response) => {
        this.isButtonLoading = false;
        if (response.status === 'success') {
          this.toast.show('Job Request has been accomplished', 'success');
          this.dialogRef.close({ refresh: true });
        } else {
          this.toast.show('Failed to update the request', 'error');
        }
      },
      () => {
        this.isButtonLoading = false;
        this.toast.show('An error occurred while saving changes', 'error');
      }
    );
  }

  closeDialog(): void {
    this.dialogRef.close();
  }
}