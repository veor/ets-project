import { CommonModule } from '@angular/common';
import { Component, Inject, AfterViewInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogActions, MatDialogModule } from '@angular/material/dialog';

@Component({
  selector: 'app-preview-dialog',
  standalone: true,
  imports: [
    MatDialogActions, 
    MatDialogModule, 
    MatButtonModule, 
    CommonModule
  ],
  templateUrl: './preview-dialog.component.html',
  styleUrls: ['./preview-dialog.component.css'] 
})
export class PreviewDialogComponent implements AfterViewInit {

  constructor(
    public dialogRef: MatDialogRef<PreviewDialogComponent>, 
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngAfterViewInit(): void {

  }


  closeDialog(): void {
    this.dialogRef.close();
  }
}