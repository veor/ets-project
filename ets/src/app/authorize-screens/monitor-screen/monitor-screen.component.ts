import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ConfirmDialogComponent } from './confirm-dialog/confirm-dialog.component';
import { PreviewDialogComponent } from './preview-dialog/preview-dialog.component';
import * as XLSX from 'xlsx';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, MatOptionModule } from '@angular/material/core';
import { PdfDialogComponent } from './pdf-dialog/pdf-dialog.component';
import { UsersService } from '../../services/users.service';
import { SnackBarService } from '../../services/snackbar.service';
import { LoaderComponent } from '../../shared/loader/loader.component';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';


@Component({
  selector: 'app-monitor-screen',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    MatPaginatorModule, 
    MatProgressBarModule,
    MatExpansionModule,
    MatIconModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSelectModule,
    MatOptionModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    LoaderComponent
  ],
  templateUrl: './monitor-screen.component.html',
  styleUrl: './monitor-screen.component.css'
})

export class MonitorComponent implements OnInit {
  reports: any[] = [];
  personnelNames: any[] = []; 
  selectedFilter: string = 'openTicket';
  filteredReports: any[] = [];

  paginatedJobRequests: any[] = [];
  currentPage: number = 0;
  pageSize: number = 10;
  searchQuery: string = "";
  sortOption: string = "";

  // Date range properties
  startDate: Date | null = null;
  endDate: Date | null = null;

  isLoading: boolean = true;
  approvingReports: Set<number> = new Set();
  // For collapsible panels
  expandedRows: Set<string> = new Set();
  reportDetails: { [key: string]: any } = {};
  loadingDetails: Set<string> = new Set();

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

  constructor(
    private authService: AuthService, 
    private usersService: UsersService,
    private toast: SnackBarService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.fetchAcceptedReports();
    this.loadPersonnelNames();
  }

 // Date range methods
  onDateRangeChange(): void {
    if (this.startDate && this.endDate && this.startDate > this.endDate) {
      this.toast.show('Start date cannot be after end date', 'error');
      return;
    }
    this.filterReports();
  }

  clearDateRange(): void {
    this.startDate = null;
    this.endDate = null;
    this.filterReports();
  }

  setQuickDateRange(range: string): void {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    switch (range) {
      case 'thisMonth':
        this.startDate = new Date(currentYear, currentMonth, 1);
        this.endDate = new Date(currentYear, currentMonth + 1, 0);
        break;
      case 'lastMonth':
        const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
        const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
        this.startDate = new Date(lastMonthYear, lastMonth, 1);
        this.endDate = new Date(lastMonthYear, lastMonth + 1, 0);
        break;
    }
    this.filterReports();
  }

  getFilteredReportsByDateRange(): any[] {
    if (!this.startDate && !this.endDate) {
      return this.filteredReports;
    }

    return this.filteredReports.filter(report => {
      const reportDate = new Date(report.date_of_request);
      
      if (this.startDate && this.endDate) {
        return reportDate >= this.startDate && reportDate <= this.endDate;
      } else if (this.startDate) {
        return reportDate >= this.startDate;
      } else if (this.endDate) {
        return reportDate <= this.endDate;
      }
      
      return true;
    });
  }

  // Helper function to format IDLE TIME
  formatDuration(durationInSeconds: number): string {
    const days = Math.floor(durationInSeconds / (3600 * 24));
    const hours = Math.floor((durationInSeconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((durationInSeconds % 3600) / 60);
    const seconds = durationInSeconds % 60;

    let formattedDuration = '';
    if (days > 0) {
      formattedDuration += `${days}d `;
    }
    if (hours > 0) {
      formattedDuration += `${hours}h `;
    }
    if (minutes > 0) {
      formattedDuration += `${minutes}m `;
    }
    if (seconds > 0 || formattedDuration === '') {
      formattedDuration += `${seconds}s`;
    }

    return formattedDuration.trim();
  }

  // Used in process time 
  formatTimeString(timeStr: string): string {
    if (!timeStr) return 'N/A';
    const [hours, minutes, seconds] = timeStr.split(':').map(Number);
    let result = '';
    if (hours > 0) result += `${hours}h `;
    if (minutes > 0) result += `${minutes}m `;
    if (seconds > 0 || result === '') result += `${seconds}s`;
    return result.trim();
  }

  // method to get service type name by ID
  getServiceTypeName(serviceId: number): string {
    const serviceType = this.serviceTypes.find(s => s.id === serviceId);
    return serviceType ? serviceType.service_type : 'Unknown Service';
  }

  // method to get formatted services list
  getFormattedServices(reportDetails: any): any[] {
    if (!reportDetails || !reportDetails.services) return [];
    
    const services = Array.isArray(reportDetails.services) ? reportDetails.services : [];
    const serviceLevels = reportDetails.service_level_id || {};
    const serviceQuantities = reportDetails.service_quantity_id || {};
    
    return services.map((serviceId: number) => {
      const serviceType = this.serviceTypes.find(s => s.id === serviceId);
      return {
        id: serviceId,
        name: serviceType ? serviceType.service_type : 'Unknown Service',
        level: serviceLevels[serviceId] || 'N/A',
        quantity: serviceQuantities[serviceId] || 0
      };
    });
  }

formatStartedAccomplishedDates(dateStarted: string, dateTimeAccomplished: string): string {
  const startedText = dateStarted 
    ? new Date(dateStarted).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }) 
    : 'N/A';
    
  const accomplishedText = dateTimeAccomplished 
    ? new Date(dateTimeAccomplished).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }) 
    : 'N/A';
    
  return `${startedText} - ${accomplishedText}`;
}

  fetchAcceptedReports(): void {
    this.isLoading = true; 
    this.usersService.fetchAcceptedReports(this.selectedFilter).subscribe(
      (response: any) => {
        if (response.status === 'success') {
          this.reports = response.data.map((report: any) => ({
            ...report,
            selectedPersonnelId: report.personnel_id || null,
            time_assigned_duration: report.time_assigned_duration || 0,
            formatted_duration: this.formatDuration(report.time_assigned_duration),
            formatted_idle_time: this.formatDuration(report.idle_time || 0),
          }));
          this.updatePaginatedRequests();
          this.filterReports(); 
        } else {
          console.error('Error fetching reports:', response.message);
        }
        this.isLoading = false; 
      },
      (error) => {
        console.error('Error fetching reports:', error);
        this.isLoading = false;
      }
    );
  }
  
  loadPersonnelNames(): void {
    this.usersService.getPersonnelByDivision().subscribe(
      (response) => {
        if (response.status === 'success') {
          this.personnelNames = response.data || [];
        } else {
          console.log(response.message || 'Failed to fetch personnel names.');
        }
      },
      (error) => {
        console.error('Error fetching personnel names:', error);
      }
    );
  }

  getPersonnelName(personnelId: string): string | null {
    const personnel = this.personnelNames.find(p => p.personnel_id === personnelId);
    return personnel ? personnel.personnel_name : null; 
  }

  onFilterChange(): void {
    this.fetchAcceptedReports();   
  }

filterReports(): void {
    let filtered = [...this.reports];

    if (this.searchQuery.trim() !== "") {
      filtered = filtered.filter(report => 
        report.name.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    }
  
    if (this.selectedFilter === 'openTicket') {
      filtered = filtered.filter(report => report.released === null && report.time_assigned !== null);
    } else if (this.selectedFilter === 'closedTicket') {
      filtered = filtered.filter(report => report.released !== null && report.time_assigned !== null);
    } else if (this.selectedFilter === 'review') {
      filtered = filtered.filter(report => report.request_status === 'Released' && report.datetime_noted_by === null);
    }

    if (this.startDate || this.endDate) {
      filtered = filtered.filter(report => {
        const reportDate = new Date(report.date_of_request);
        
        if (this.startDate && this.endDate) {
          return reportDate >= this.startDate && reportDate <= this.endDate;
        } else if (this.startDate) {
          return reportDate >= this.startDate;
        } else if (this.endDate) {
          return reportDate <= this.endDate;
        }
        
        return true;
      });
    }
  
    this.filteredReports = filtered;
    this.sortReports();
    this.currentPage = 0;
    this.updatePaginatedRequests();
  }

  sortReports(): void {
    if (!this.sortOption) return;
  
    this.filteredReports.sort((a, b) => {
      if (this.sortOption === "nameAsc") {
        return a.name.localeCompare(b.name);
      } else if (this.sortOption === "nameDesc") {
        return b.name.localeCompare(a.name);
      } else if (this.sortOption === "dateAsc") {
        return new Date(a.date_of_request).getTime() - new Date(b.date_of_request).getTime();
      } else if (this.sortOption === "dateDesc") {
        return new Date(b.date_of_request).getTime() - new Date(a.date_of_request).getTime();
      }
      return 0;
    });
  
    this.updatePaginatedRequests();
  }

  // Check whether a row should be displayed based on filter conditions
  shouldDisplayRow(report: any): boolean {
    if (this.selectedFilter === 'openTicket') {
      return report.time_assigned !== null && report.released === null;
    } else if (this.selectedFilter === 'closedTicket') {
      return report.time_assigned !== null && report.released !== null;
    } else if (this.selectedFilter === 'review') {
      return report.request_status === 'Released' && report.datetime_noted_by === null;
    }
    return true; 
  } 

  updatePaginatedRequests(): void {
    const startIndex = this.currentPage * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedJobRequests = this.filteredReports.slice(startIndex, endIndex);
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.updatePaginatedRequests();
  }

  // Collapsible panel methods
  toggleRowExpansion(controlNo: string): void {
    if (this.expandedRows.has(controlNo)) {
      this.expandedRows.delete(controlNo);
    } else {
      this.expandedRows.add(controlNo);
      if (!this.reportDetails[controlNo]) {
        this.fetchReportDetails(controlNo);
      }
    }
  }

  isRowExpanded(controlNo: string): boolean {
    return this.expandedRows.has(controlNo);
  }

  fetchReportDetails(controlNo: string): void {
    this.loadingDetails.add(controlNo);
    this.usersService.getServiceReportDetailsPost(controlNo).subscribe(
      (response: any) => {
        if (response.status === 'success') {
          this.reportDetails[controlNo] = response.data;
        } else {
          console.error('Error fetching report details:', response.message);
          this.toast.show('Failed to fetch report details', 'error');
        }
        this.loadingDetails.delete(controlNo);
      },
      (error) => {
        console.error('Error fetching report details:', error);
        this.toast.show('Error loading report details', 'error');
        this.loadingDetails.delete(controlNo);
      }
    );
  }

  isLoadingDetails(controlNo: string): boolean {
    return this.loadingDetails.has(controlNo);
  }

  getReportDetails(controlNo: string): any {
    return this.reportDetails[controlNo];
  }

  isApprovingReport(id: number): boolean {
    return this.approvingReports.has(id);
  }

  approveReport(id: number, control_no: string): void {
      console.log('Approving report with ID:', id);
      
      const dialogRef = this.dialog.open(ConfirmDialogComponent, {
        width: '350px',
        data: {
          title: 'Confirm Approval',
          message: `Are you sure you want to approve ticket #${control_no}?`
        }
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.approvingReports.add(id);
          
          console.log('Sending approval request for ID:', id);
          this.usersService.approveServiceReport(id).subscribe(
            (response: any) => {
              this.approvingReports.delete(id);
              
              if (response.status === 'success') {
                this.toast.show('Ticket approved successfully!', 'success');
                const report = this.reports.find(r => r.id === id);
                if (report) {
                  report.datetime_noted_by = response.datetime_noted_by;
                }
                this.fetchAcceptedReports();
              } else {
                this.toast.show(response.message || 'Approval failed', 'error');
              }
            },
            (error) => {
              this.approvingReports.delete(id);
              console.error('Error approving report:', error);
              this.toast.show('Error approving report', 'error');
            }
          );
        }
      });
    }

  openPreviewDialog(report: any): void {
    if (!this.getReportDetails(report.control_no)) {
      this.fetchReportDetails(report.control_no);
    }

    const details = this.getReportDetails(report.control_no) || report;

    const formattedData = {
      ...details,
      services: this.getFormattedServices(details)
    };

    this.dialog.open(PreviewDialogComponent, {
      width: '1200px',
      height: '800px',
      data: formattedData
    });
  }

  generateExcel(): void {
      try {
        // Prepare data based on current filter
        const dataToExport = this.prepareExcelData();
        
        // Create workbook and worksheet
        const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(dataToExport);
        this.styleExcelHeaders(ws, dataToExport);
        const wb: XLSX.WorkBook = XLSX.utils.book_new();
        
        // Add worksheet to workbook
        XLSX.utils.book_append_sheet(wb, ws, this.getSheetName());
        
        // Generate filename with timestamp
        const fileName = this.generateFileName();
        
        // Save file
        XLSX.writeFile(wb, fileName);
        
        this.toast.show(`Excel file "${fileName}" downloaded successfully!`, 
          'success');
        
      } catch (error) {
        console.error('Error generating Excel file:', error);
        this.toast.show(          'Error generating Excel file', 
          'error');
      }
    }

  private styleExcelHeaders(ws: XLSX.WorkSheet, data: any[]): void {
    if (!data || data.length === 0) return;
    
    // Get the header keys
    const headers = Object.keys(data[0]);
    
    // Style each header cell
    headers.forEach((header, index) => {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: index });
      
      // Ensure the cell exists
      if (!ws[cellAddress]) {
        ws[cellAddress] = { v: header, t: 's' };
      }
      
      // Apply bold styling and other formatting
      ws[cellAddress].s = {
        font: {
          bold: true,
          sz: 12,
          color: { rgb: "FFFFFF" }
        },
        fill: {
          fgColor: { rgb: "366092" }
        },
        alignment: {
          horizontal: "center",
          vertical: "center"
        },
        border: {
          top: { style: "thin", color: { rgb: "000000" } },
          bottom: { style: "thin", color: { rgb: "000000" } },
          left: { style: "thin", color: { rgb: "000000" } },
          right: { style: "thin", color: { rgb: "000000" } }
        }
      };
    });
    
    // Auto-size columns
    const colWidths = headers.map(header => {
      const maxLength = Math.max(
        header.length,
        ...data.map(row => String(row[header] || '').length)
      );
      return { wch: Math.min(Math.max(maxLength + 2, 10), 50) };
    });
    
    ws['!cols'] = colWidths;
    
    // Set row height for header
    ws['!rows'] = [{ hpt: 25 }];
  }    
  
 private prepareExcelData(): any[] {
    return this.filteredReports.map((report, index) => {
     const servicesInfo = this.formatServicesForExcel(report);
      const baseData: any = {
        'No.': index + 1,
        'Ref. #': report.control_no,
        'Date of Request': this.formatDate(report.date_of_request),
        'Department': report.office_value,
        'Name of Client': report.name,
        'Technical Staff': this.getPersonnelName(report.personnel_id) || 'Not Assigned',  
        'Problem Reported': report.issue_request || 'N/A',
        'Services': servicesInfo,
        'Date & Time Started': this.formatDateTime(report.date_started) || 'N/A',
        'Date & Time Accomplished': this.formatDateTime(report.datetime_accomplished) || 'N/A'      
      };
      return baseData;
    });
  }

private formatServicesForExcel(report: any): string {
  try {
    // Parse services data
    let services = report.services;
    let serviceLevels = report.service_level_id;
    let serviceQuantities = report.service_quantity_id;

    // Handle JSON string parsing
    if (typeof services === 'string') {
      services = JSON.parse(services);
    }
    if (typeof serviceLevels === 'string') {
      serviceLevels = JSON.parse(serviceLevels);
    }
    if (typeof serviceQuantities === 'string') {
      serviceQuantities = JSON.parse(serviceQuantities);
    }

    // Ensure arrays and objects exist
    services = Array.isArray(services) ? services : [];
    serviceLevels = serviceLevels || {};
    serviceQuantities = serviceQuantities || {};

    if (services.length === 0) {
      return 'No services';
    }

    // Format services in the requested format: "Service Name: Level (Quantity)"
    const serviceDetails: string[] = [];

    services.forEach((serviceId: number) => {
      const serviceType = this.serviceTypes.find(s => s.id === serviceId);
      const serviceName = serviceType ? serviceType.service_type : `Unknown Service (${serviceId})`;
      const level = serviceLevels[serviceId] || 'N/A';
      const quantity = serviceQuantities[serviceId] || 1; // Default to 1 if not specified

      serviceDetails.push(`${serviceName}: ${level} (${quantity})`);
    });

    return serviceDetails.join(', ');

  } catch (error) {
    console.error('Error formatting services for Excel:', error);
    return 'Error parsing services';
  }
}

  private getSheetName(): string {
    const sheetNames = {
      'closedTicket': 'Closed Tickets',
    } as const;
    return sheetNames[this.selectedFilter as keyof typeof sheetNames] || 'Reports';
  }

  private generateFileName(): string {
    const now = new Date();
    const timestamp = now.toISOString().slice(0, 19).replace(/[:-]/g, '');
    const filterName = this.getSheetName().replace(/\s+/g, '_');
    return `${filterName}_${timestamp}.xlsx`;
  }

  private formatDate(dateStr: string): string {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US');
  }

  // private formatDateTime(dateTimeStr: string): string {
  //   if (!dateTimeStr) return 'N/A';
  //   const date = new Date(dateTimeStr);
  //   return date.toLocaleString('en-US');
  // }
private formatDateTime(dateTimeStr: string): string {
  if (!dateTimeStr) return 'N/A';
  const date = new Date(dateTimeStr);

  const datePart = date.toLocaleDateString('en-GB'); 
  const timePart = date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });

  return `${datePart} ${timePart}`;
}


  canExportData(): boolean {
    return this.filteredReports && this.filteredReports.length > 0;
  }

  getExportButtonText(): string {
    const count = this.filteredReports?.length || 0;
    return `Export to Excel (${count} records)`;
  }
  
openViewDialog(report: any): void {
  const dialogData = { 
    ...report,
    selectedServices: Array.isArray(report.services) 
      ? report.services 
      : (report.services ? JSON.parse(report.services) : []),
    service_level_id: typeof report.service_level_id === 'object' 
      ? report.service_level_id 
      : (report.service_level_id ? JSON.parse(report.service_level_id) : {}),
    service_quantity_id: typeof report.service_quantity_id === 'object' 
      ? report.service_quantity_id 
      : (report.service_quantity_id ? JSON.parse(report.service_quantity_id) : {}),
    signature: report.signature,
    personnelNames: this.personnelNames 
  };

  dialogData.selectedServiceNames = dialogData.selectedServices.map((serviceId: number) => {
    const service = this.serviceTypes.find(s => s.id === serviceId);
    return service ? service.service_type : 'Unknown Service'; 
  });

  this.dialog.open(PdfDialogComponent, {
    width: '1200px',
    height: '800px',
    maxWidth: '95vw',
    maxHeight: '95vh',
    data: dialogData,
    panelClass: 'pdf-dialog'
  });
}


}