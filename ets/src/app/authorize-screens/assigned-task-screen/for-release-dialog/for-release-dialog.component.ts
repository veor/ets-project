import { Component, ElementRef, Inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TaskService } from '../../../services/task.service';
import { SnackBarService } from '../../../services/snackbar.service';

@Component({
  selector: 'app-for-release-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './for-release-dialog.component.html',
  styleUrl: './for-release-dialog.component.css'
})
export class ForReleaseDialogComponent {
  @ViewChild('signaturePad', { static: false }) signaturePad!: ElementRef<HTMLCanvasElement>;
  
  isButtonLoading = false;
  isSaveButtonLoading = false;
  isSignaturePadVisible = false;
  signatureDataUrl: string | null = null;
  selectedReport: any;

  constructor(
    private dialogRef: MatDialogRef<ForReleaseDialogComponent>,
    private taskService: TaskService,
    private toast: SnackBarService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.selectedReport = {
      ...data.report,
      selectedServices: data.report.services ? JSON.parse(data.report.services) : [],
      service_level_id: data.report.service_level_id ? JSON.parse(data.report.service_level_id) : {},
      date_released: this.getCurrentDateTimeLocal()
    };
  }

  getCurrentDateTimeLocal(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

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

  getEventCoordinates(event: MouseEvent | TouchEvent): { offsetX: number, offsetY: number } {
    if (event instanceof MouseEvent) {
      return { offsetX: event.offsetX, offsetY: event.offsetY };
    } else if (event instanceof TouchEvent) {
      const touch = event.touches[0];
      const rect = (event.target as HTMLElement).getBoundingClientRect();
      return {
        offsetX: touch.clientX - rect.left,
        offsetY: touch.clientY - rect.top,
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
  }
  
  saveSignature(): void {
    this.isSaveButtonLoading = true;

    setTimeout(() => {
      this.isSaveButtonLoading = false;
    }, 2000);

    const canvas = this.signaturePad.nativeElement;
    this.signatureDataUrl = canvas.toDataURL('image/png');
  
    const signatureData = {
      reportId: this.selectedReport.id,
      signature: this.signatureDataUrl,
    };
  
    this.taskService.saveSignature(signatureData).subscribe(
      (response: any) => {
        if (response.status === 'success') {
          this.toast.show('Signature has been Added!', 'success');
          this.isSignaturePadVisible = false;
          this.selectedReport.signature = this.signatureDataUrl;
        } else {
          this.toast.show('Failed to save signature: ' + response.message, 'error');
        }
      },
      () => {
        this.toast.show('Oops, Looks like we ran into a problem.', 'error');
      }
    );
  }

  submitForReleaseForm(): void {
    this.isButtonLoading = true;
    const releasedTo = this.selectedReport.released_to || this.selectedReport.name;
    const updatedData = {
      ...this.selectedReport,
      released: true,
      released_to: releasedTo,
      request_status: 'Released',
    };
  
    this.taskService.updateForReleaseForm(updatedData).subscribe(
      (response) => {
        this.isButtonLoading = false;
        if (response.status === 'success') {
          this.toast.show('Job Request has been released', 'success');
          this.dialogRef.close({ refresh: true });
        } else {
          this.toast.show('Failed to update the request', 'error');
        }
      },
      () => {
        this.isButtonLoading = false;
        this.toast.show('An error occurred while saving changes', 'error');
      }
    );
  }

  closeDialog(): void {
    if (this.isSignaturePadVisible) {
      const canvas = this.signaturePad.nativeElement;
      const context = canvas.getContext('2d');
      if (canvas && context) {
        context.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
    this.isSignaturePadVisible = false;
    this.dialogRef.close();
  }
}