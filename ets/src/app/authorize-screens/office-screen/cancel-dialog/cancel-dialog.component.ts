import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-cancel-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule],
  templateUrl: './cancel-dialog.component.html',
  styleUrl: './cancel-dialog.component.css'
})
export class CancelDialogComponent {
  constructor(public dialogRef: MatDialogRef<CancelDialogComponent>) {}
}