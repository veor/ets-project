import { Component, Inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule, MatDialog } from '@angular/material/dialog';
import { PmService } from '../../../../services/pm.service';
import { CommonModule } from '@angular/common';
import { MaintenanceChecklistDialogComponent } from '../maintenance-checklist-dialog/maintenance-checklist-dialog.component';

@Component({
  selector: 'app-generate-checklist-dialog',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    MatDialogModule
  ],
  templateUrl: './generate-checklist-dialog.component.html',
  styleUrl: './generate-checklist-dialog.component.css'
})
export class GenerateChecklistDialogComponent implements OnInit {

  templateOptions: any = {};

  equipmentTypes: string[] = [];
  checklistYears: any[] = [];

  selectedEquipmentType: string = '';
  selectedYear: string = '';

  isLoading = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<GenerateChecklistDialogComponent>,
    private pmService: PmService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadTemplateOptions();
  }

  loadTemplateOptions(): void {
    this.pmService.getChecklistTemplateOptions().subscribe({
      next: (res: any) => {
        if (res.status === 'success') {
          this.templateOptions = res.data || {};
          this.equipmentTypes = Object.keys(this.templateOptions);
        }
      },
      error: (err) => console.error(err)
    });

  }

  onEquipmentTypeChange(): void {

    this.selectedYear = '';

    this.checklistYears =
      this.templateOptions[this.selectedEquipmentType] || [];

  }

  generateChecklist(): void {

    if (!this.selectedEquipmentType || !this.selectedYear) {
      return;
    }

    this.isLoading = true;

    this.pmService.getChecklistTasks(
      this.selectedEquipmentType,
      this.selectedYear
    ).subscribe({

      next: (res: any) => {

        this.isLoading = false;

        if (res.status === 'success') {

          this.dialogRef.close();

          this.dialog.open(MaintenanceChecklistDialogComponent, {
            width: '1100px',
            maxWidth: '98vw',
            maxHeight: '90vh',
            panelClass: 'checklist-dialog',
            data: {
              ...this.data.log,

              equipment: this.data.equipment,
              templateId: res.template.id,
              templateName: res.template.template_name,
              equipmentType: res.template.equipment_type,
              versionYear: res.template.version_year,
              tasks: res.data || []
            }
          });

        }

      },

      error: (err) => {
        this.isLoading = false;
        console.error(err);
      }

    });

  }

  close(): void {
    this.dialogRef.close();
  }

}