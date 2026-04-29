import { Component, OnInit } from '@angular/core';
import { PmService } from '../../services/pm.service';
import { SnackBarService } from '../../services/snackbar.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

export interface MemorySlot {
  brand: string;
  serial: string;
}

export interface StorageSlot {
  brand: string;
  serial: string;
}

@Component({
  selector: 'app-add-device-screen',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatOptionModule,
    MatSelectModule,
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './add-device-screen.component.html',
  styleUrl: './add-device-screen.component.css'
})
export class AddDeviceScreenComponent implements OnInit {

  isSavingDevice = false;

  departments: any[] = [];
  divisions: any[] = [];
  filteredDivisions: any[] = [];

  equipmentTypes: string[] = [
    'Desktop',
    'Laptop',
    'Printer',
    'UPS',
    'Network Equipment'
  ];

  readonly maxMemorySlots = 4;
  readonly maxStorageSlots = 6;

  // ───────────────────────── FORM DATA ─────────────────────────
  formData: any = {
    deviceCategory: '',
      brandInfo: {
      brand: '',
      model: '',
      serial: ''
    },
    accountablePerson: '',
    endUser: '',
    designation: '',
    equipmentType: [],
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
    private pmService: PmService,
    private toast: SnackBarService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadOffices();
    this.loadDivisions();
  }

  get isBranded(): boolean {
    return this.formData.deviceCategory === 'Branded';
  }

  get isClone(): boolean {
    return this.formData.deviceCategory === 'Clone';
  }

  // ───────────────────────── TYPE HELPERS ─────────────────────────
  get isComputer(): boolean {
    return this.formData.equipmentType?.includes('Desktop') ||
           this.formData.equipmentType?.includes('Laptop');
  }

  get isPrinter(): boolean {
    return this.formData.equipmentType?.includes('Printer');
  }

  get isUPS(): boolean {
    return this.formData.equipmentType?.includes('UPS');
  }

  get isNetworkEquipment(): boolean {
    return this.formData.equipmentType?.includes('Network Equipment');
  }

  // ───────────────────────── MEMORY SLOTS ─────────────────────────
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

  // ───────────────────────── HDD ─────────────────────────
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

  // ───────────────────────── SSD ─────────────────────────
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

  // ───────────────────────── API LOADERS ─────────────────────────
  loadOffices(): void {
    this.pmService.getOffices().subscribe({
      next: (res) => {
        if (res?.data) this.departments = res.data;
      },
      error: (err) => console.error('Offices error', err)
    });
  }

  loadDivisions(): void {
    this.pmService.getDivisions().subscribe({
      next: (res) => {
        if (res?.status === 'success') this.divisions = res.data;
      },
      error: (err) => console.error('Divisions error', err)
    });
  }

  onDepartmentChange(): void {
    this.filteredDivisions = this.divisions.filter(
      div => div.office_id === this.formData.department
    );
    this.formData.division = '';
  }

  // ───────────────────────── SAVE DEVICE ─────────────────────────
  saveData(): void {
    this.isSavingDevice = true;

    this.pmService.saveNewDevice(this.formData).subscribe({
      next: (res) => {
        this.isSavingDevice = false;

        if (res?.status === 'success') {
          this.toast.show('Device successfully registered!', 'success');
          this.resetForm();
        } else {
          this.toast.show('Failed to save device.', 'error');
        }
      },
      error: (err) => {
        console.error(err);
        this.isSavingDevice = false;
        this.toast.show('Server error occurred.', 'error');
      }
    });
  }

  // ───────────────────────── RESET FORM ─────────────────────────
  resetForm(): void {
    this.formData = {
      accountablePerson: '',
      endUser: '',
      designation: '',
      equipmentType: [],
      par: '',
      computerName: '',
      department: '',
      division: '',
      status: '',

      hardwareInformation: {
        motherboard: { brand: '', serial: '' },
        processor: { brand: '', serial: '' },
        memorySlots: [{ brand: '', serial: '' }],
        hddSlots: [{ brand: '', serial: '' }],
        ssdSlots: [{ brand: '', serial: '' }],
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
  }

  // ───────────────────────── OPTIONAL HELPERS ─────────────────────────
  onEquipmentChange(): void {
    if (!this.isComputer) {
      this.formData.hardwareInformation.memorySlots = [{ brand: '', serial: '' }];
    }
  }
}
