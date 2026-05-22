import { CommonModule } from '@angular/common';
import { Component, ElementRef, Inject, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { PmService } from '../../../../services/pm.service';
import { SnackBarService } from '../../../../services/snackbar.service';

export interface ChecklistTask {
  task: string;
  done: boolean;
}
export type ChecklistMode = 'current' | 'archived';

@Component({
  selector: 'app-maintenance-checklist-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './maintenance-checklist-dialog.component.html',
  styleUrl: './maintenance-checklist-dialog.component.css'
})
export class MaintenanceChecklistDialogComponent {
  @ViewChild('signaturePad', { static: false }) signaturePad!: ElementRef<HTMLCanvasElement>;

  versionYear: number | string = '';
  globalFindings: string = '';
  globalRecommendation: string = '';
  isSaving: boolean = false;
  mode: ChecklistMode = 'current';
  isReadOnly = false;

  // Signature
  isSignaturePadVisible = false;
  signatureDataUrl: string | null = null;

  // Sign-off
  approvedBy: string = '';
  verifiedBy: string = '';
  notedBy: string = '';

  itStaff: { id: number; name: string }[] = [];
  isLoadingStaff = false;

  checklistTasks: any[] = [];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<MaintenanceChecklistDialogComponent>,
    private pmService: PmService,
    private toast: SnackBarService
  ) {}

  ngOnInit(): void {
    this.versionYear = this.data.versionYear || '';
    this.checklistTasks = (this.data.tasks || []).map((task: any) => ({
      id: task.id,
      task: task.task_description || task.task,
      done: task.done || false
    }));

    this.globalFindings = this.data.findings || '';
    this.globalRecommendation = this.data.recommendation || '';
    this.signatureDataUrl = this.data.signature || null;
    this.approvedBy = this.data.approved_by || '';
    this.verifiedBy = this.data.verified_by || '';
    this.notedBy = this.data.noted_by || '';

    if (this.data.isReadOnly) {
      this.isReadOnly = true;
    }

    this.loadITStaff();
  }

  loadITStaff(): void {
    this.isLoadingStaff = true;
    this.pmService.getITStaff().subscribe({
      next: (res: any) => {
        this.isLoadingStaff = false;
        if (res.status === 'success') {
          this.itStaff = res.data;
        }
      },
      error: () => {
        this.isLoadingStaff = false;
      }
    });
  }

  get doneTasks(): number {
    return this.checklistTasks.filter(t => t.done).length;
  }

  get progressPercent(): number {
    return Math.round((this.doneTasks / this.checklistTasks.length) * 100);
  }

  onTaskChange(): void {
    if (this.isReadOnly) return;
  }

  // ─── Signature Pad ───

  showSignaturePad(): void {
    this.isSignaturePadVisible = true;
    setTimeout(() => {
      const canvas = this.signaturePad.nativeElement;
      const context = canvas.getContext('2d');
      if (canvas && context) {
        const ratio = window.devicePixelRatio || 1;
        canvas.width = 400 * ratio;
        canvas.height = 200 * ratio;
        canvas.style.width = '400px';
        canvas.style.height = '200px';
        context.scale(ratio, ratio);
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.lineCap = 'round';
        context.lineJoin = 'round';
        context.lineWidth = 2;
        context.strokeStyle = '#000';
        this.enableDrawing(canvas, context);
      }
    });
  }

  enableDrawing(canvas: HTMLCanvasElement, context: CanvasRenderingContext2D): void {
    let drawing = false;

    const startDrawing = (event: MouseEvent | TouchEvent) => {
      event.preventDefault();
      drawing = true;
      const { offsetX, offsetY } = this.getEventCoordinates(event);
      context.beginPath();
      context.moveTo(offsetX, offsetY);
    };

    const draw = (event: MouseEvent | TouchEvent) => {
      event.preventDefault();
      if (!drawing) return;
      const { offsetX, offsetY } = this.getEventCoordinates(event);
      context.lineTo(offsetX, offsetY);
      context.stroke();
    };

    const stopDrawing = () => (drawing = false);

    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);
    canvas.addEventListener('touchstart', startDrawing);
    canvas.addEventListener('touchmove', draw);
    canvas.addEventListener('touchend', stopDrawing);
    canvas.addEventListener('touchcancel', stopDrawing);
  }

  getEventCoordinates(event: MouseEvent | TouchEvent): { offsetX: number; offsetY: number } {
    if (event instanceof MouseEvent) {
      return { offsetX: event.offsetX, offsetY: event.offsetY };
    } else if (event instanceof TouchEvent) {
      const touch = event.touches[0];
      const rect = (event.target as HTMLElement).getBoundingClientRect();
      return {
        offsetX: touch.clientX - rect.left,
        offsetY: touch.clientY - rect.top
      };
    }
    return { offsetX: 0, offsetY: 0 };
  }

  clearSignature(): void {
    const canvas = this.signaturePad.nativeElement;
    const context = canvas.getContext('2d');
    if (canvas && context) {
      context.clearRect(0, 0, canvas.width, canvas.height);
    }
    this.signatureDataUrl = null;
  }

  captureSignature(): void {
    if (this.isSignaturePadVisible && this.signaturePad?.nativeElement) {
      const canvas = this.signaturePad.nativeElement;
      this.signatureDataUrl = canvas.toDataURL('image/png');
      this.isSignaturePadVisible = false;
    }
  }

  // ─── Save All (checklist + signature + signoffs) ───

  onSave(): void {
    if (this.isReadOnly) return;

    // Capture signature from canvas if pad is still open
    if (this.isSignaturePadVisible && this.signaturePad?.nativeElement) {
      const canvas = this.signaturePad.nativeElement;
      this.signatureDataUrl = canvas.toDataURL('image/png');
    }

    this.isSaving = true;

    const payload = {
      template_id: this.data.templateId,
      equipment_id: this.data.equipment?.id,
      device_name: this.data.equipment?.computerName || '',
      accountable_person: this.data.equipment?.accountablePerson || '',
      par_ics: this.data.equipment?.par || '',
      equipment_type: this.data.equipmentType || '',
      findings: this.globalFindings,
      recommendation: this.globalRecommendation,
      tasks: this.checklistTasks,
      signature: this.signatureDataUrl || '',
      approved_by: this.approvedBy || '',
      verified_by: this.verifiedBy || '',
      noted_by: this.notedBy || ''
    };

    this.pmService.saveMaintenanceChecklist(payload).subscribe({
      next: (response: any) => {
        this.isSaving = false;
        if (response.status === 'success') {
          this.toast.show('Checklist saved successfully!', 'success');
          this.dialogRef.close(true);
        } else {
          this.toast.show('Failed to save checklist.', 'error');
        }
      },
      error: () => {
        this.isSaving = false;
        this.toast.show('An error occurred while saving.', 'error');
      }
    });
  }

  onClose(): void {
    this.dialogRef.close();
  }
}