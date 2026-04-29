import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-review-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatDividerModule],
  templateUrl: './review-dialog.component.html',
  styleUrl: './review-dialog.component.css'
})
export class ReviewDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ReviewDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}
}

