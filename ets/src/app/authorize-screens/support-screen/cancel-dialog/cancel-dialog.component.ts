import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-cancel-dialog',
  standalone: true,
  imports: [],
  templateUrl: './cancel-dialog.component.html',
  styleUrl: './cancel-dialog.component.css'
})
export class CancelDialogComponent {
constructor(private dialogRef: MatDialogRef<CancelDialogComponent>) {}

  onCancel(): void {
    this.dialogRef.close(false);
  }

  onConfirm(): void {
    this.dialogRef.close(true);
  }

}
