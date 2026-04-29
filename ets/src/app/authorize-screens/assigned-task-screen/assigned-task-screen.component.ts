import { Component, ElementRef, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { TaskService } from '../../services/task.service';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { PdfService } from '../../services/pdf.service';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { SnackBarService } from '../../services/snackbar.service';
import { LoaderComponent } from '../../shared/loader/loader.component';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from './confirm-dialog/confirm-dialog.component';
import { ReleasedViewDialogComponent } from './released-view-dialog/released-view-dialog.component';
import { AccomplishDialogComponent } from './accomplish-dialog/accomplish-dialog.component';
import { ForReleaseDialogComponent } from './for-release-dialog/for-release-dialog.component';

@Component({
  selector: 'app-assigned-task-screen',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    MatPaginatorModule, 
    MatProgressBarModule,
    ReleasedViewDialogComponent,
    LoaderComponent
  ],
  templateUrl: './assigned-task-screen.component.html',
  styleUrl: './assigned-task-screen.component.css'
})
export class AssignedTaskScreenComponent implements OnInit {
  currentUser: any;
  isLoading: boolean = true;
  isViewDialogOpen: boolean = false;
  selectedStatus: string = 'Ongoing';
  filteredReports: any[] = [];
  paginatedReports: any[] = [];
  dateSortOrder: string = "";
  searchQuery: string = '';
  currentPage: number = 0;
  pageSize: number = 5;
  selectedReport: any = {};
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
  reports: any[] = [];
  errorMessage: string = '';
  offices: any[] = [];

  constructor(
    private taskService: TaskService,
    private toast: SnackBarService,
    private authService: AuthService,
    private pdfService: PdfService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.fetchReportsForCurrentUser();
    this.fetchUserName();
  }

  fetchUserName(): void {
    this.authService.getUserPerms().subscribe(
      (response: any) => {
        if (response.status === 'success') {
          this.currentUser = response.data;
        } else {
          console.error('Failed to fetch user info:', response.message);
        }
      },
      (error) => {
        console.error('Error fetching user info:', error);
      }
    );
  }

  fetchReportsForCurrentUser(): void {
    this.isLoading = true;

    forkJoin({
      reports: this.taskService.fetchReportsForCurrentUser(),
      offices: this.taskService.fetchAllOffices()
    }).subscribe(
      ({ reports, offices }) => {
        this.isLoading = false;

        if (reports.status === 'success' && offices.status === 'success') {
          const officeMap = new Map(
            offices.data.map((office: { office_id: number; office_name: string }) => [office.office_id, office.office_name])
          );
          this.reports = reports.data.map((report:any) => ({
            ...report,
            office_name: officeMap.get(report.office_id) || 'Unknown'
          }));
          this.updatePaginatedRequests();
          this.applyDefaultFilter();
        } else {
          this.reports = [];
          this.errorMessage = reports.message || 'Failed to fetch data.';
        }
      },
      (error) => {
        this.isLoading = false;
        this.errorMessage = 'An error occurred while fetching data.';
      }
    );
  }

  getServiceName(serviceId: number): string {
    const service = this.serviceTypes.find(service => service.id === serviceId);
    return service ? service.service_type : 'Unknown Service';
  }

  openEditDialog(report: any): void {
    const dialogRef = this.dialog.open(AccomplishDialogComponent, {
      width: '700px',
      maxWidth: '95%',
      data: { report }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result?.refresh) {
        this.fetchReportsForCurrentUser();
      }
    });
  }

  openForReleaseDialog(report: any): void {
    const dialogRef = this.dialog.open(ForReleaseDialogComponent, {
      width: '700px',
      maxWidth: '95%',
      data: { report }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result?.refresh) {
        this.fetchReportsForCurrentUser();
      }
    });
  }

  openViewDialog(report: any): void {
    const office = this.offices.find(o => o.office_id === report.office_id);
    const office_value = office ? office.office_value : report.office_name || '';

    this.selectedReport = {
      ...report,
      selectedServices: report.services ? JSON.parse(report.services) : [],
      service_level_id: report.service_level_id ? JSON.parse(report.service_level_id) : {},
      service_quantity_id: report.service_quantity_id ? JSON.parse(report.service_quantity_id) : {},
      signature: report.signature,
      remarks: report.remarks || '',
      office_value: office_value,
    };

    this.selectedReport.selectedServiceNames = this.selectedReport.selectedServices.map((serviceId: number) => {
      const service = this.serviceTypes.find(s => s.id === serviceId);
      return service ? service.service_type : 'Unknown Service';
    });

    this.isViewDialogOpen = true;
  }

  closeViewDialog(event?: MouseEvent): void {
    this.isViewDialogOpen = false;
  }

  applyDefaultFilter(): void {
    this.filterReports();
  }

  filterReports(): void {
    const query = this.searchQuery.toLowerCase();

    this.filteredReports = this.reports.filter((report) => {
      const matchesStatus = this.selectedStatus === "" || report.request_status === this.selectedStatus;
      const matchesSearch =
        !query ||
        report.control_no.toLowerCase().includes(query) ||
        report.name.toLowerCase().includes(query);
      return matchesStatus && matchesSearch;
    });

    if (this.dateSortOrder) {
      this.filteredReports.sort((a, b) => {
        const dateA = new Date(a.date_of_request).getTime();
        const dateB = new Date(b.date_of_request).getTime();
        return this.dateSortOrder === "asc" ? dateA - dateB : dateB - dateA;
      });
    }

    this.currentPage = 0;
    this.updatePaginatedRequests();
  }

  updatePaginatedRequests(): void {
    const startIndex = this.currentPage * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedReports = this.filteredReports.slice(startIndex, endIndex);
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.updatePaginatedRequests();
  }

  generatePdf() {
    console.log('Selected Report Data:', this.selectedReport);
    this.pdfService.generatePdf(this.selectedReport, this.currentUser).subscribe({
      next: (pdfBlob: Blob) => {
        const fileURL = URL.createObjectURL(pdfBlob);
        const newTab = window.open(fileURL, '_blank');

        if (newTab) {
          const downloadLink = newTab.document.createElement('a');
          downloadLink.href = fileURL;
          downloadLink.download = 'report.pdf';
          downloadLink.textContent = 'Click here to download the PDF';
          newTab.document.body.appendChild(downloadLink);
        }
      },
      error: (err) => {
        console.error('Error generating PDF:', err);
      }
    });
  }

  acceptReport(report: any): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: { currentDate: new Date().toISOString().split('T')[0] }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this.startReport(report);
      }
    });
  }

  private formatDateTime(dateTime: string): string | null {
    if (!dateTime) return null;
    const date = new Date(dateTime);
    const offset = date.getTimezoneOffset();
    const adjustedDate = new Date(date.getTime() - offset * 60 * 1000);
    return adjustedDate.toISOString().slice(0, 19).replace('T', ' ');
  }

  private startReport(report: any): void {
    const now = new Date();
    const formattedNow = this.formatDateTime(now.toISOString());

    report.date_started = formattedNow;
    report.start_time = now.toTimeString().split(' ')[0];

    const payload = {
      control_no: report.control_no,
      date_started: formattedNow,
      start_time: report.start_time
    };

    this.taskService.updateStartTime(payload).subscribe(
      (response) => {
        if (response.status === 'success') {
          this.toast.show('Job Request has been started', 'success');
          this.fetchReportsForCurrentUser();
        } else {
          this.toast.show('Failed to start the task', 'error');
        }
      },
      () => this.toast.show('An error occurred while starting the task', 'error')
    );
  }
}










