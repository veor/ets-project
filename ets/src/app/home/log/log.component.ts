import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { CommonModule } from '@angular/common';
import { PmService } from '../../services/pm.service';
import { MatDialog } from '@angular/material/dialog';
import { SnackBarService } from '../../services/snackbar.service';
import { RecordDialogComponent } from './record-dialog/record-dialog.component';
// import { NotificationService } from '../../shared/notification.service';

@Component({
  selector: 'app-log',
  standalone: true,
  imports: [
    MatFormFieldModule, 
    MatSelectModule, 
    MatButtonModule, 
    MatInputModule,
    MatTableModule, 
    MatSortModule, 
    MatPaginatorModule,
    FormsModule, 
    CommonModule, 
    MatCheckboxModule
  ],
  templateUrl: './log.component.html',
  styleUrl: './log.component.css'
})
export class LogComponent {
  isSaving: boolean = false;
  divisions: any[] = [];
  filteredDivisions: any[] = [];
  formData = {
    date: '',
    accountablePerson: '',
    department: '',
    designation: '',
    division: '',
    equipmentType: [],
    location: '',
    par: '',
    status: '',
    operatingSystem: '',
    computerName: '',
    productivitySuite: '',
    endpointPoint: '',
    ipAddress: '',
    macAddress: '',
    withInternet: false,
    withoutInternet: false,
    wired: false,
    wireless: false,
    recommendation: '',
    technicalStaff: null,
    assistedBy: '',
    confirmedBy: '',
  };
  departments: any[] = [];
  techStaffList: { personnel_id: number, personnel_name: string }[] = [];
  data = { staff: null };
  maintenanceTasks = [
    { name: 'Change computer name according to DeptID & Property Number (e.g. Acctg15667)', completed: false, remarks: '' },
    { name: 'Delete .tmp files', completed: false, remarks: '' },
    { name: 'Install essential applications and uninstall unnecessary programs', completed: false, remarks: '' },
    { name: 'Run the System Information for Windows', completed: false, remarks: '' },
    { name: 'Check the Health Status of the HDD or SSD', completed: false, remarks: '' },
    { name: 'Update and run antivirus software', completed: false, remarks: '' },
    { name: 'Change admin password (if applicable)', completed: false, remarks: '' },
    { name: 'Set official PGQ Wallpaper', completed: false, remarks: '' },
    { name: 'Clean the exterior/interior part of the system unit', completed: false, remarks: '' },
    { name: 'Check printer connection', completed: false, remarks: '' },
    { name: 'Check network/internet connection', completed: false, remarks: '' },
    { name: 'Affix/Update Maintenance Sticker', completed: false, remarks: '' },
    { name: 'Update Maintenance Monitoring Log', completed: false, remarks: '' }
  ];

  equipmentTypes = ['Printer', 'UPS', 'Desktop', 'Laptop'];
  locations = ['OLD CAPITOL'];
  statuses = ['Servicable', 'Unservicable'];
  statusMessage: string = 'I hereby acknowledge that this IT equipment has undergone Annual Preventive Maintenance and is currently working properly.';
  designations = [
    'Administrative Aide I',
    'Administrative Aide II',
    'Administrative Aide III',
    'Administrative Aide IV',
    'Administrative Aide V',
    'Administrative Aide VI'
  ];
  displayedColumns: string[] = ['hardware', 'brand', 'serial'];
  hardwareData = [
    { hardware: 'Printer', brand: '', serial: '' },
    { hardware: 'Motherboard', brand: '', serial: '' },
    { hardware: 'Processor', brand: '', serial: '' },
    { hardware: 'Memory', slot1: '', slot2: '', Serialslot1: '', Serialslot2: '' },
    { hardware: 'Storage', storageType: '', hddSlot: '', ssdSlot: '', hddSerial: '', ssdSerial: '' },
    { hardware: 'Display', displayType: '', monitorSlot: '', gpuSlot: '', monitorSerial: '', gpuSerial: '' },
    { hardware: 'UPS', brand: '', serial: '' }
  ];
  operatingSystems: string[] = ['Windows 7', 'Windows 8', 'Windows 10 Pro', 'Windows 11 Pro', 'Windows 10 Pro (L)', 'Windows 11 Pro (L)'];
  productivitySuites: string[] = ['MS Office 2010','MS Office 2013','MS Office 2016','MS Office 2019','MS Office 2021'];
  endpointOptions: string[] = ['Sophos', 'SMADAV', 'Windows Security'];

  constructor(
    private pmService: PmService, 
    private dialog: MatDialog, 
    private toast: SnackBarService
    // private notificationService: NotificationService
  ) {}

  ngOnInit() {
    this.loadOffices();
    this.loadDivisions();
    this.fetchTechStaffList();
  }

  onStatusChange(status: string): void {
    if (status === 'Servicable') {
      this.statusMessage = 'I hereby acknowledge that this IT equipment has undergone Annual Preventive Maintenance and is currently working properly.';
    } else if (status === 'Unservicable') {
      this.statusMessage = 'I hereby acknowledge that this IT equipment has undergone Annual Preventive Maintenance and has been recommended for disposal.';
    }
  }

  loadOffices() {
    this.pmService.getOffices().subscribe(response => {
      if (response && response.data) {
        this.departments = response.data;
      }
    }, error => {
      console.error('Error fetching offices', error);
    });
  }

  loadDivisions(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.pmService.getDivisions().subscribe(
        (response: any) => {
          if (response.status === 'success') {
            this.divisions = response.data;
            resolve();
          } else {
            console.error('Failed to fetch divisions');
            reject();
          }
        },
        (error) => {
          console.error('Error fetching divisions', error);
          reject();
        }
      );
    });
  }

  onDepartmentChange(): void {
    if (this.formData.department) {
      this.filteredDivisions = this.divisions.filter(division => 
        division.office_id === this.formData.department); 
    } else {
      this.filteredDivisions = [];
    }
  }

  fetchTechStaffList(): void {
    this.pmService.getPersonnelList().subscribe((response: any) => {
      if (response.status === 'success' && Array.isArray(response.data)) {
        this.techStaffList = response.data;
      } else {
        console.error('Failed to fetch technical staff list');
      }
    }, error => {
      console.error('Error fetching technical staff list', error);
    });
  }

  saveData() {
    const formattedData = {
      date: this.formData.date,
      accountablePerson: this.formData.accountablePerson,
      department: this.formData.department,
      division: this.formData.division,
      designation: { "1": this.formData.designation },
      equipmentType: this.formData.equipmentType.reduce<{ [key: number]: string }>((acc, val, index) => {
        acc[index + 1] = val;
        return acc;
      }, {}),
      location: { "1": this.formData.location },
      par: this.formData.par,
      status: { "0": this.formData.status },
      hardwareDetails: this.hardwareData.map(element => ({
        hardware: element.hardware,
        brand: element.brand,
        serial: element.serial,
        storageType: element.storageType,
        displayType: element.displayType,
        slot1: element.slot1,
        slot2: element.slot2,
        Serialslot1: element.Serialslot1,
        Serialslot2: element.Serialslot2,
        hddSlot: element.hddSlot,
        ssdSlot: element.ssdSlot,
        hddSerial: element.hddSerial,
        ssdSerial: element.ssdSerial,
        monitorSlot: element.monitorSlot,
        gpuSlot: element.gpuSlot,
        monitorSerial: element.monitorSerial,
        gpuSerial: element.gpuSerial
      })),
      operatingSystem: this.formData.operatingSystem,
      computerName: this.formData.computerName,
      productivitySuite: this.formData.productivitySuite,
      endpointPoint: this.formData.endpointPoint,
      ipAddress: this.formData.ipAddress,
      macAddress: this.formData.macAddress,
      withInternet: this.formData.withInternet,
      withoutInternet: this.formData.withoutInternet,
      wired: this.formData.wired,
      wireless: this.formData.wireless,
      maintenanceChecklist: this.maintenanceTasks.map(task => ({
        task: task.name,
        completed: task.completed,
        remarks: task.remarks
      })),
      recommendation: this.formData.recommendation,
      technicalStaff: this.formData.technicalStaff,
      assistedBy: this.formData.assistedBy,
      confirmedBy: this.formData.confirmedBy,
      statusMessage: this.statusMessage,
    };
    this.isSaving = true;
    this.pmService.savePreventiveMaintenance(formattedData).subscribe(response => {
      console.log('Data saved successfully', response);
      // this.notificationService.showNotification('Saved Successfully!', 'success');
      this.toast.show('Saved Successfully!', 'success');
      this.clearForm();
      this.isSaving = false;
    }, error => {
      console.error('Error saving data', error);
      // this.notificationService.showNotification('An error has occured, while saving', 'error');
      this.toast.show('An error has occured, while saving', 'error');
      this.isSaving = false;
    });
}

clearForm() {
    this.formData = {
      date: '',
      accountablePerson: '',
      department: '',
      designation: '',
      division: '',
      equipmentType: [],
      location: '',
      par: '',
      status: '',
      operatingSystem: '',
      computerName: '',
      productivitySuite: '',
      endpointPoint: '',
      ipAddress: '',
      macAddress: '',
      withInternet: false,
      withoutInternet: false,
      wired: false,
      wireless: false,
      recommendation: '',
      technicalStaff: null,
      assistedBy: '',
      confirmedBy: '',
    };

    this.maintenanceTasks.forEach(task => {
      task.completed = false;
      task.remarks = '';
    });

    this.hardwareData.forEach(element => {
      element.brand = '';
      element.serial = '';
      element.storageType = '';
      element.displayType = '';
      element.slot1 = '';
      element.slot2 = '';
      element.Serialslot1 = '';
      element.Serialslot2 = '';
      element.hddSlot = '';
      element.ssdSlot = '';
      element.hddSerial = '';
      element.ssdSerial = '';
      element.monitorSlot = '';
      element.gpuSlot = '';
      element.monitorSerial = '';
      element.gpuSerial = '';
    });
}


openDialog(): void {
  const dialogRef = this.dialog.open(RecordDialogComponent, {
    width: '400px',
    data: this.formData  
  });

  dialogRef.afterClosed().subscribe(result => {
    console.log('Dialog closed');
  });
}
}
