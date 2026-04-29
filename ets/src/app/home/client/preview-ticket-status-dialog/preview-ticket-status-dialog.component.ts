import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import JsBarcode from 'jsbarcode';

@Component({
  selector: 'app-preview-ticket-status-dialog',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './preview-ticket-status-dialog.component.html',
  styleUrl: './preview-ticket-status-dialog.component.css'
})
export class PreviewTicketStatusDialogComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<PreviewTicketStatusDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {
    setTimeout(() => {
      if (this.data?.control_no) {
        JsBarcode('#barcode', this.data.control_no, {
          format: 'CODE128',
          lineColor: '#000',
          width: 2,
          height: 50,
          displayValue: true
        });
      }
    });
  }

  close(): void {
    this.dialogRef.close();
  }
}