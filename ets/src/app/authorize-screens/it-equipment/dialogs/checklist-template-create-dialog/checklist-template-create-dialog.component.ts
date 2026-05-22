import { Component } from '@angular/core';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { PmService } from '../../../../services/pm.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-checklist-template-create-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule
  ],
  templateUrl: './checklist-template-create-dialog.component.html',
  styleUrl: './checklist-template-create-dialog.component.css'
})
export class ChecklistTemplateCreateDialogComponent {

  template = {
    template_name: '',
    equipment_type: '',
    version_year: '',
    tasks: [
      { task_description: '' }
    ]
  };

  constructor(
    private dialogRef: MatDialogRef<ChecklistTemplateCreateDialogComponent>,
    private pmService: PmService
  ) {}

  addTask(): void {

    this.template.tasks.push({
      task_description: ''
    });
  }

  removeTask(index: number): void {

    this.template.tasks.splice(index, 1);
  }

  save(): void {

    this.pmService
      .createChecklistTemplate(this.template)
      .subscribe({

        next: () => {

          this.dialogRef.close('saved');
        },

        error: (err) => {
          console.error(err);
        }
      });
  }

  close(): void {

    this.dialogRef.close();
  }
}