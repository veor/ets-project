import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { PmService } from '../../../../services/pm.service';
import { CommonModule, DatePipe } from '@angular/common';

@Component({
  selector: 'app-maintenance-log-detail-dialog',
  standalone: true,
  imports: [
    CommonModule,
    DatePipe
  ],
  templateUrl: './maintenance-log-detail-dialog.component.html',
  styleUrl: './maintenance-log-detail-dialog.component.css'
})
export class MaintenanceLogDetailDialogComponent {

  isLoading = true;
  detail: any = null;
  source: string = '';

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { id: string; source: string },
    private dialogRef: MatDialogRef<MaintenanceLogDetailDialogComponent>,
    private pmService: PmService
  ) {}

  ngOnInit(): void {
    this.source = this.data.source;
    this.pmService.getMaintenanceLogDetail(this.data.source, this.data.id).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        if (res.status === 'success') {
          this.detail = res.data;
        }
      },
      error: () => { this.isLoading = false; }
    });
  }

  getHardwareItems(): { label: string; brand: string; serial: string }[] {
    if (!this.detail?.hardware) return [];
    const map: Record<string, string> = {
      motherboard: 'Motherboard', processor: 'Processor', monitor: 'Monitor',
      gpu: 'GPU', ups: 'UPS', printer: 'Printer',
      dataCabinet: 'Data Cabinet', networkSwitch: 'Network Switch'
    };
    return Object.entries(this.detail.hardware)
      .filter(([, v]: any) => v?.brand || v?.serial)
      .map(([k, v]: any) => ({ label: map[k] || k, brand: v.brand || '—', serial: v.serial || '—' }));
  }

  onClose(): void {
    this.dialogRef.close();
  }

  getDoneTasks(): number {
    return (this.detail?.tasks || []).filter((t: any) => t.done).length;
  }

  getTaskProgress(): number {
    if (!this.detail?.tasks?.length) return 0;
    return Math.round((this.getDoneTasks() / this.detail.tasks.length) * 100);
  }

onPrint(): void {
  const rawId = String(this.data.id);
  this.pmService.printMaintenanceChecklist(rawId);
}
}
