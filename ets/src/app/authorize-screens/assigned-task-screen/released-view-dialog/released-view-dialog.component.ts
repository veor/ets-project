import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import JsBarcode from 'jsbarcode';

@Component({
  selector: 'app-released-view-dialog',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './released-view-dialog.component.html',
  styleUrl: './released-view-dialog.component.css'
})
export class ReleasedViewDialogComponent implements OnChanges, AfterViewInit {
  @Input() isOpen: boolean = false;
  @Input() selectedReport: any = null;
  @Input() currentUser: any = null;
  @Input() serviceTypes: any[] = [];
  
  @Output() closeDialog = new EventEmitter<void>();
  @Output() generatePdf = new EventEmitter<void>();

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isOpen'] && this.isOpen && this.selectedReport) {
      this.generateBarcode();
    }
  }

  ngAfterViewInit(): void {
    if (this.isOpen && this.selectedReport) {
      this.generateBarcode();
    }
  }

  private generateBarcode(): void {
    setTimeout(() => {
      if (this.selectedReport?.control_no) {
        const barcodeElement = document.getElementById('barcode');
        if (barcodeElement) {
          JsBarcode(barcodeElement, this.selectedReport.control_no, {
            format: "CODE128",
            lineColor: "#000",
            width: 2,
            height: 50,
            displayValue: true
          });
        }
      }
    }, 100);
  }

  getServiceName(serviceId: number): string {
    const service = this.serviceTypes.find(service => service.id === serviceId);
    return service ? service.service_type : 'Unknown Service';
  }

  onCloseDialog(event?: MouseEvent): void {
    if (event) {
      event.stopPropagation();
    }
    this.closeDialog.emit();
  }

  onOverlayClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('view-dialog-overlay')) {
      this.onCloseDialog();
    }
  }

  onGeneratePdf(): void {
    this.generatePdf.emit();
  }
}