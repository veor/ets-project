import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-update-division-dialog',
  standalone: true,
  imports: [
    FormsModule,
    MatButtonModule,
    MatInputModule,
    CommonModule,
    MatDialogModule
  ],
  templateUrl: './update-division-dialog.component.html',
  styleUrl: './update-division-dialog.component.css'
})
export class UpdateDivisionDialogComponent {

  constructor(
    public dialogRef: MatDialogRef<UpdateDivisionDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public division: any
  ) {}

  save() {
    this.dialogRef.close(this.division);
  }
}
