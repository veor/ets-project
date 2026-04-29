import { CommonModule, DatePipe } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MaintenanceLog } from '../maintenance-logs/maintenance-logs.component';

export interface ChecklistTask {
  task: string;
  done: boolean;
}
export type ChecklistMode = 'current' | 'archived';

@Component({
  selector: 'app-maintenance-checklist-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe],
  templateUrl: './maintenance-checklist-dialog.component.html',
  styleUrl: './maintenance-checklist-dialog.component.css'
})
export class MaintenanceChecklistDialogComponent {

  globalFindings: string = '';
  globalRecommendation: string = '';
  isSaving: boolean = false;
  mode: ChecklistMode = 'current';
  isReadOnly = false;

  desktopTasks: ChecklistTask[] = [
    { task: 'Create PICTO account', done: false },
    { task: 'Change computer name according to Dept. ID & Property # (e.g. Acctg-12345)', done: false },
    { task: 'Run Windows System Information for Windows', done: false },
    { task: 'Set official PGQ wallpaper', done: false },
    { task: 'Install essential applications and uninstall unnecessary programs to optimize startup performance', done: false },
    { task: 'Check for any changes in specification and update Hardware/Software/Network Information', done: false },
    { task: 'Check health status of HDD or SSD', done: false },
    { task: 'Check if CMOS battery needs replacing', done: false },
    { task: 'Check CPU temperature', done: false },
    { task: 'Clean the exterior/interior part of the system unit, replace damaged cables', done: false },
    { task: 'Check connection to printer and network/internet access', done: false },
    { task: 'Affix/Update Maintenance Sticker', done: false },
    { task: 'Update Maintenance Monitoring Log', done: false }
  ];

  private currentTasks: ChecklistTask[] = [
    { task: 'Create PICTO account', done: false },
    { task: 'Change computer name according to Dept. ID & Property # (e.g. Acctg-12345)', done: false },
    { task: 'Run Windows System Information for Windows', done: false },
    { task: 'Set official PGQ wallpaper', done: false },
    { task: 'Install essential applications and uninstall unnecessary programs to optimize startup performance', done: false },
    { task: 'Check for any changes in specification and update Hardware/Software/Network Information', done: false },
    { task: 'Check health status of HDD or SSD', done: false },
    { task: 'Check if CMOS battery needs replacing', done: false },
    { task: 'Check CPU temperature', done: false },
    { task: 'Clean the exterior/interior part of the system unit, replace damaged cables', done: false },
    { task: 'Check connection to printer and network/internet access', done: false },
    { task: 'Affix/Update Maintenance Sticker', done: false },
    { task: 'Update Maintenance Monitoring Log', done: false }
  ];

  private archivedTasks2025: ChecklistTask[] = [
    { task: 'Manual OS activation check', done: true },
    { task: 'Legacy antivirus update verification', done: true },
    { task: 'BIOS version documentation', done: true },
    { task: 'Physical dust cleaning inspection', done: true },
    { task: 'Network cable continuity test', done: true }
  ];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: MaintenanceLog & { year?: number },
    private dialogRef: MatDialogRef<MaintenanceChecklistDialogComponent>
  ) {}

ngOnInit(): void {
  this.initializeChecklist();
}

  private initializeChecklist(): void {
    const year = this.data.year ?? new Date(this.data.date).getFullYear();

    if (year === 2025) {
      this.mode = 'archived';
      this.isReadOnly = true;
      this.desktopTasks = this.archivedTasks2025;
    } else {
      this.mode = 'current';
      this.isReadOnly = false;
      this.desktopTasks = this.currentTasks;
    }
  }

  get doneTasks(): number {
    return this.desktopTasks.filter(t => t.done).length;
  }

 get progressPercent(): number {
    return Math.round((this.doneTasks / this.desktopTasks.length) * 100);
  }

  onTaskChange(): void {
    if (this.isReadOnly) return; // safety guard
  }

  onSave(): void {
    if (this.isReadOnly) return; // prevent saving archived

    this.isSaving = true;

    setTimeout(() => {
      this.isSaving = false;
      this.dialogRef.close({
        ...this.data,
        checklist: this.desktopTasks,
        findings: this.globalFindings,
        recommendation: this.globalRecommendation
      });
    }, 800);
  }

  onClose(): void {
    this.dialogRef.close();
  }
}