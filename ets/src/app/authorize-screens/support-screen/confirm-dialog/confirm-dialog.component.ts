import { Component, OnDestroy } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [],
  templateUrl: './confirm-dialog.component.html',
  styleUrl: './confirm-dialog.component.css',
})
export class ConfirmDialogComponent implements OnDestroy {
  currentDateTime: string = ''; 
  private intervalId: any; 

  constructor(
    public dialogRef: MatDialogRef<ConfirmDialogComponent>) {
    this.updateDateTime(); 
    this.intervalId = setInterval(() => this.updateDateTime(), 1000); 
  }

  updateDateTime(): void {
    const now = new Date();
    this.currentDateTime = now.toLocaleString('en-US', {
      month: 'long',
      day: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  }

  onConfirm(): void {
    this.dialogRef.close(true);
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

  ngOnDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId); 
    }
  }
}
