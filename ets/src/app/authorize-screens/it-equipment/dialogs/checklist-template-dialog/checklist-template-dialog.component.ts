import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { PmService } from '../../../../services/pm.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-checklist-template-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule
  ],
  templateUrl: './checklist-template-dialog.component.html',
  styleUrl: './checklist-template-dialog.component.css'
})
export class ChecklistTemplateDialogComponent implements OnInit {

  isLoading = false;

  templateData: any = null;

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: any,

    private dialogRef:
      MatDialogRef<ChecklistTemplateDialogComponent>,

    private pmService: PmService
  ) {}

  ngOnInit(): void {

    this.loadChecklistDetails();
  }

  loadChecklistDetails(): void {

    this.isLoading = true;

    this.pmService
      .getChecklistTemplateDetails(this.data.id)
      .subscribe({

        next: (res: any) => {

          this.templateData = res.data;

          this.isLoading = false;
        },

        error: (err) => {

          console.error(err);

          this.isLoading = false;
        }
      });
  }

  close(): void {

    this.dialogRef.close();
  }
}
