import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import JsBarcode from 'jsbarcode';

@Component({
  selector: 'app-pdf-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule
  ],
  templateUrl: './pdf-dialog.component.html',
  styleUrl: './pdf-dialog.component.css'
})
export class PdfDialogComponent implements AfterViewInit{
  constructor(
    public dialogRef: MatDialogRef<PdfDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
        // Get personnel names from the passed data
    this.personnelNames = this.data.personnelNames || [];
  }

// Service types configuration
  serviceTypes = [
    { id: 1, service_type: 'Basic Troubleshooting', quantity: 0 },
    { id: 2, service_type: 'Installation of OS', quantity: 0 },
    { id: 3, service_type: 'Installation of Applications', quantity: 0 },
    { id: 4, service_type: 'Data Backup', quantity: 0, levels: ['LC', 'HC'] },
    { id: 5, service_type: 'Data Retrieval', quantity: 0, levels: ['LC', 'HC'] },
    { id: 6, service_type: 'Printer', quantity: 0, levels: ['Moderate', 'Complex'] },
    { id: 7, service_type: 'Hardware Repair', quantity: 0, levels: ['Simple', 'Moderate', 'Complex'] },
    { id: 8, service_type: 'Network Repair', quantity: 0, levels: ['Moderate', 'Complex'] },
    { id: 9, service_type: 'Network', quantity: 0, levels: ['Wired', 'Wireless', 'Cabling'] },
    { id: 10, service_type: 'Virus', quantity: 0, levels: ['Simple', 'Moderate'] },
    { id: 11, service_type: 'Inspection', quantity: 0, levels: ['Delivery', 'Disposal'] },
    { id: 12, service_type: 'Registration to Biometrics', quantity: 0 }
  ];
  personnelNames: any[] = [];

  ngAfterViewInit(): void {
    // Generate barcode after view initialization
    setTimeout(() => {
      if (this.data.control_no) {
        JsBarcode("#barcode", this.data.control_no, {
          format: "CODE128",
          lineColor: "#000",
          width: 2,
          height: 50,
          displayValue: true
        });
      }
    }, 100);
  }

  closeDialog(): void {
    this.dialogRef.close();
  }

  getServiceName(serviceId: number): string {
    const service = this.serviceTypes.find(service => service.id === serviceId);
    return service ? service.service_type : 'Unknown Service';
  }

  // Prevent dialog from closing when clicking inside the dialog content
  onDialogContentClick(event: MouseEvent): void {
    event.stopPropagation();
  }

  getPersonnelName(personnelId: string): string {
    if (!personnelId) return 'Not Assigned';
    const personnel = this.personnelNames.find(p => p.personnel_id === personnelId);
    return personnel ? personnel.personnel_name : 'Not Assigned'; 
  }

  getDetailedServiceInfo(serviceId: number): any {
    const service = this.serviceTypes.find(s => s.id === serviceId);
    const quantity = this.data.service_quantity_id[serviceId] || 0;
    const level = this.data.service_level_id[serviceId] || '';
    
    return {
      name: service ? service.service_type : 'Unknown Service',
      quantity: quantity,
      level: level && level.trim() !== '' ? level : null,
      hasLevel: level && level.trim() !== ''
    };
  }
}
