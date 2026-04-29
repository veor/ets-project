import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

export interface UserStatusDialogData {
  userName: string;
  action: string; // 'activate' or 'deactivate'
}
@Component({
  selector: 'app-update-user-status-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './update-user-status-dialog.component.html',
  styleUrl: './update-user-status-dialog.component.css'
})
export class UpdateUserStatusDialogComponent {
constructor(
    public dialogRef: MatDialogRef<UpdateUserStatusDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: UserStatusDialogData
  ) {}

  onCancel(): void {
    this.dialogRef.close(false);
  }

  onConfirm(): void {
    this.dialogRef.close(true);
  }
}
