import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { SnackBarService } from '../../../services/snackbar.service';
import { PmService } from '../../../services/pm.service';

export interface MemorySlot {
  brand: string;
  serial: string;
}
export interface StorageSlot {
  brand: string;
  serial: string;
}
@Component({
  selector: 'app-register-device',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatOptionModule,
    MatSelectModule,
    MatIconModule,
    MatButtonModule,
    MatDialogModule
  ],
  templateUrl: './register-device.component.html',
  styleUrl: './register-device.component.css'
})
export class RegisterDeviceComponent implements OnInit {
  isSavingDevice = false;
  departments: any[] = [];
  divisions: any[] = [];
  filteredDivisions: any[] = [];

  equipmentTypes: string[] = ['Desktop', 'Laptop', 'Printer', 'Server', 'Network Equipment'];
  brandTypes: string[] = ['Branded', 'Clone'];

  readonly maxMemorySlots = 4;
  readonly maxStorageSlots = 6;

  formData: any = {
    accountablePerson: '',
    endUser: '',
    designation: '',
    equipmentType: [],  
    brandType: '',
    par: '',
    computerName: '',
    department: '',
    division: '',
    status: '',
    hardwareInformation: {
      motherboard: { brand: '', serial: '' },
      processor: { brand: '', serial: '' },
      memorySlots: [{ brand: '', serial: '' }] as MemorySlot[],
      hddSlots: [{ brand: '', serial: '' }] as StorageSlot[],
      ssdSlots: [{ brand: '', serial: '' }] as StorageSlot[],
      monitor: { brand: '', serial: '' },
      gpu: { brand: '', serial: '' },
      ups: { brand: '', serial: '' },
      printer: { brand: '', serial: '' },
      dataCabinet: { brand: '', serial: '' },
      networkSwitch: { brand: '', serial: '' }
    },
    softwareInformation: {
      computerName: '',
      operatingSystem: '',
      osLicenseKey: '',
      productivitySuite: '',
      productivityLicenseKey: '',
      endpointProtection: '',
      bitLockerKey: '',
      deviceName: ''
    },
    networkInformation: {
      ipAddress: '',
      macAddress: '',
      internetAccess: '',
      connectionType: '',
      internetPermission: ''
    }
  };

  constructor(
    private dialogRef: MatDialogRef<RegisterDeviceComponent>,
    private pmService: PmService,
    private toast: SnackBarService
  ) {}

  ngOnInit(): void {
    this.loadOffices();
    this.loadDivisions();
  }

  // ── Equipment type helpers ──────────────────────────────
  get showBrandType(): boolean {
    return this.formData.equipmentType?.length > 0;
  }
  
  get isBranded(): boolean {
    return this.formData.brandType === 'Branded';
  }

  get isClone(): boolean {
    return this.formData.brandType === 'Clone';
  }

  get isComputer(): boolean {
    return this.formData.equipmentType?.includes('Desktop') ||
           this.formData.equipmentType?.includes('Laptop');
  }
  get isPrinter(): boolean {
    return this.formData.equipmentType?.includes('Printer');
  }
  get isNetworkEquipment(): boolean {
    return this.formData.equipmentType?.includes('Network Equipment');
  }

  // ── Equipment change — reset brandType if cleared ───────
  onEquipmentChange(): void {
    if (!this.formData.equipmentType?.length) {
      this.formData.brandType = '';
    }
    if (!this.isComputer) {
      this.formData.hardwareInformation.memorySlots = [{ brand: '', serial: '' }];
    }
  }

  // ── Memory slot management ──────────────────────────────
  addMemorySlot(): void {
    if (this.formData.hardwareInformation.memorySlots.length < this.maxMemorySlots) {
      this.formData.hardwareInformation.memorySlots.push({ brand: '', serial: '' });
    }
  }

  removeMemorySlot(index: number): void {
    if (this.formData.hardwareInformation.memorySlots.length > 1) {
      this.formData.hardwareInformation.memorySlots.splice(index, 1);
    }
  }

  // HDD
  addHddSlot(): void {
    if (this.formData.hardwareInformation.hddSlots.length < this.maxStorageSlots) {
      this.formData.hardwareInformation.hddSlots.push({ brand: '', serial: '' });
    }
  }

  removeHddSlot(index: number): void {
    if (this.formData.hardwareInformation.hddSlots.length > 1) {
      this.formData.hardwareInformation.hddSlots.splice(index, 1);
    }
  }

  // SSD
  addSsdSlot(): void {
    if (this.formData.hardwareInformation.ssdSlots.length < this.maxStorageSlots) {
      this.formData.hardwareInformation.ssdSlots.push({ brand: '', serial: '' });
    }
  }

  removeSsdSlot(index: number): void {
    if (this.formData.hardwareInformation.ssdSlots.length > 1) {
      this.formData.hardwareInformation.ssdSlots.splice(index, 1);
    }
  }

  // ── Office / division loaders ───────────────────────────
  loadOffices(): void {
    this.pmService.getOffices().subscribe(
      (response) => { if (response?.data) this.departments = response.data; },
      (error) => console.error('Error fetching offices', error)
    );
  }

  loadDivisions(): void {
    this.pmService.getDivisions().subscribe(
      (response) => { if (response?.status === 'success') this.divisions = response.data; },
      (error) => console.error('Error fetching divisions', error)
    );
  }

  onDepartmentChange(): void {
    this.filteredDivisions = this.divisions.filter(
      div => div.office_id === this.formData.department
    );
    this.formData.division = '';
  }

  // ── Save ────────────────────────────────────────────────
  saveData(): void {
    this.isSavingDevice = true;
    this.pmService.saveNewDevice(this.formData).subscribe(
      (res) => {
        this.isSavingDevice = false;
        if (res.status === 'success') {
          this.toast.show('Device has been registered!', 'success');
          this.dialogRef.close('saved');
        } else {
          this.toast.show('An error occurred while saving.', 'error');
        }
      },
      (err) => {
        console.error(err);
        this.isSavingDevice = false;
        this.toast.show('Error has occurred.', 'error');
      }
    );
  }

  onClose(): void {
    this.dialogRef.close();
  }
}