import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';

import { SupervisorService } from '../../services/supervisor.service';
import { AuthService } from '../../services/auth.service';
import { UsersService } from '../../services/users.service';
import { SnackBarService } from '../../services/snackbar.service';
import { LoaderComponent } from '../../shared/loader/loader.component';

import { ReviewDialogComponent } from './review-dialog/review-dialog.component';
import { CancelDialogComponent } from './cancel-dialog/cancel-dialog.component';
import { ConfirmDialogComponent } from './confirm-dialog/confirm-dialog.component';
import { CancelRequestDialogComponent } from './cancel-request-dialog/cancel-request-dialog.component';
import { SystemSettingsService } from '../../services/system-settings.service';
@Component({
  selector: 'app-office-screen',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,

    // Angular Material
    MatDialogModule,
    MatButtonModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatPaginatorModule,
    MatProgressBarModule,
    MatFormFieldModule,
    MatSelectModule,
    MatIconModule,
    MatInputModule,
    MatTableModule,

    // Shared
    LoaderComponent,
  ],
  templateUrl: './office-screen.component.html',
  styleUrls: ['./office-screen.component.css'],
})
export class OfficeScreenComponent implements OnInit {
  isLoading: boolean = false;
  loadingReports: { [key: number]: boolean } = {};

  selectedPermissions: string[] = [];
  allowedToAcceptRequest: boolean = false;

  approvedReports: any[] = [];
  selectedReport: any = null;
  filteredReports: any[] = [];
  paginatedReports: any[] = [];
  pageSize: number = 10;
  pageIndex: number = 0;

  searchTerm: string = '';
  sortOrder: string = 'dateDesc';
  requestType: string = 'warrant';
  personnelNames: any[] = [];

  displayedColumns: string[] = [];

  @ViewChild('reviewDialog', { static: false }) reviewDialog!: TemplateRef<any>;
  @ViewChild('confirmDialog', { static: false }) confirmDialog!: TemplateRef<any>;
  @ViewChild('cancelDialog', { static: false }) cancelDialog!: TemplateRef<any>;

  constructor(
    private authService: AuthService,
    private usersService: UsersService,
    private supervisorService: SupervisorService,
    private systemSettingsService: SystemSettingsService,
    private dialog: MatDialog,
    private toast: SnackBarService
  ) {}

  ngOnInit(): void {
    this.fetchApprovedReports();
    this.fetchPermissions();
    this.loadPersonnelNames();
  }

  fetchPermissions(): void {
    this.systemSettingsService.getAuthUserPerms().subscribe(
      (response: any) => {
        if (response.status === 'success') {
          this.selectedPermissions = response.permissions || [];
          this.allowedToAcceptRequest = this.selectedPermissions.includes('5.6');

        } else {
          alert('Failed to fetch permissions.');
        }
      },
      (error) => {
        console.error('Error fetching permissions', error);
      }
    );
  }

  // Format idle duration (seconds) -> readable
  formatDuration(durationInSeconds: number): string {
    const days = Math.floor(durationInSeconds / (3600 * 24));
    const hours = Math.floor((durationInSeconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((durationInSeconds % 3600) / 60);
    const seconds = durationInSeconds % 60;

    let result = '';
    if (days > 0) result += `${days}d `;
    if (hours > 0) result += `${hours}h `;
    if (minutes > 0) result += `${minutes}m `;
    if (seconds > 0 || result === '') result += `${seconds}s`;
    return result.trim();
  }

  // Used to display process_time like "1h 05m 10s"
  formatTimeString(timeStr: string): string {
    if (!timeStr) return 'N/A';
    const [hours = 0, minutes = 0, seconds = 0] = timeStr.split(':').map(Number);
    let result = '';
    if (hours > 0) result += `${hours}h `;
    if (minutes > 0) result += `${minutes}m `;
    if (seconds > 0 || result === '') result += `${seconds}s`;
    return result.trim();
  }

  fetchApprovedReports(): void {
    this.isLoading = true;
    this.supervisorService.getApprovedReports().subscribe(
      (response) => {
        if (response.status === 'success') {
          this.approvedReports = response.data.map((report: any) => ({
            ...report,
            formatted_idle_time: this.formatDuration(report.idle_time || 0),
            selectedPersonnelId: report.personnel_id || null
          }));
          this.filterReports();
        } else {
          console.error('Failed to fetch approved reports');
        }
        this.isLoading = false;
      },
      (error) => {
        console.error('API error: ', error);
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

  filterReports(): void {
    this.filteredReports = this.approvedReports.filter((report) => {
      const matchesSearch =
        this.searchTerm.trim() === '' ||
        report.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        (report.issue_request || '').toLowerCase().includes(this.searchTerm.toLowerCase());

      if (this.requestType === 'warrant') return matchesSearch && report.accept !== '1';

      if (this.requestType === 'openTicket') {
        return (
          matchesSearch &&
          report.accept === '1' &&
          report.time_assigned != null &&
          (report.date_released == null || report.released_to == null)
        );
      }

      if (this.requestType === 'closedTicket') {
        return (
          matchesSearch &&
          report.accept === '1' &&
          report.time_assigned != null &&
          report.date_released != null &&
          report.released_to != null
        );
      }

      return false;
    });

    this.sortReports();

    // update visible columns based on filter
    if (this.requestType === 'warrant') {
      this.displayedColumns = ['name', 'date', 'actions'];
    } else if (this.requestType === 'openTicket') {
      // show control_no for openTicket
      this.displayedColumns = ['control_no', 'name', 'date', 'office', 'actions'];
    } else if (this.requestType === 'closedTicket') {
      // include idle_time, action_taken, process_time
      this.displayedColumns = [
        'control_no',
        'name',
        'date',
        'office',
        'assigned',
        'idle_time',
        'action_taken',
        'process_time',
      ];
    }
  }

  sortReports(): void {
    this.filteredReports.sort((a, b) => {
      if (this.sortOrder === 'nameAsc') return a.name.localeCompare(b.name);
      if (this.sortOrder === 'nameDesc') return b.name.localeCompare(a.name);
      if (this.sortOrder === 'dateAsc')
        return new Date(a.date_of_request).getTime() - new Date(b.date_of_request).getTime();
      if (this.sortOrder === 'dateDesc')
        return new Date(b.date_of_request).getTime() - new Date(a.date_of_request).getTime();
      return 0;
    });

    this.updatePagination();
  }

  updatePagination(): void {
    const startIndex = this.pageIndex * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedReports = this.filteredReports.slice(startIndex, endIndex);
  }

  onPageChange(event: PageEvent): void {
    this.pageSize = event.pageSize;
    this.pageIndex = event.pageIndex;
    this.updatePagination();
  }

  openReviewDialog(report: any): void {
    this.dialog.open(ReviewDialogComponent, {
      width: '500px',
      data: report
    });
  }

  openConfirmDialog(report: any): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '500px',
      data: {
        ...report,
        personnelNames: this.personnelNames
      }
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result?.confirm && result.personnelId) {
        this.selectedReport = { ...report, selectedPersonnelId: result.personnelId };
        this.acceptService();
      }
    });
  }

  openCancelDialog(report: any): void {
    const dialogRef = this.dialog.open(CancelDialogComponent, { width: '400px' });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.selectedReport = report;
        this.cancelJobRequest();
      }
    });
  }

  closeDialog(): void {
    this.dialog.closeAll();
  }

  cancelJobRequest(): void {
    const reportId = this.selectedReport?.id;
    if (!reportId) return;

    this.supervisorService.cancelJobRequest(reportId).subscribe(
      (response) => {
        if (response.status === 'success') {
          this.toast.show('Job request cancelled successfully.', 'success');
          this.fetchApprovedReports();
        } else {
          this.toast.show('Failed to cancel the request.', 'error');
        }
        this.dialog.closeAll();
      },
      (error) => {
        this.toast.show('An error occurred. Please try again.', 'error');
        console.error('API error:', error);
        this.dialog.closeAll();
      }
    );
  }

  private padNumber(num: number): string {
    return num < 10 ? `0${num}` : `${num}`;
  }

  assignPersonnel(report: any): void {
    if (!report.selectedPersonnelId) {
      this.toast.show('Please select a personnel', 'warning');
      return;
    }
    report.isAssigning = true;

    const dateOfRequest = new Date(report.date_of_request);
    const currentTime = new Date();
    const timeDifference = currentTime.getTime() - dateOfRequest.getTime();
    const hours = Math.floor(timeDifference / (1000 * 60 * 60));
    const minutes = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60));
    const formattedDuration = `${this.padNumber(hours)}:${this.padNumber(minutes)}`;

    this.usersService.assignPersonnelToReport(report.control_no, report.selectedPersonnelId, formattedDuration).subscribe(
      (response) => {
        if (response.status === 'success') {
          this.toast.show('Technical has been assigned', 'success');
          report.personnel_id = report.selectedPersonnelId;
          // update local fields so UI updates quickly
          report.personnel_name = this.personnelNames.find(p => p.personnel_id === report.selectedPersonnelId)?.personnel_name || report.personnel_name;
        } else {
          this.toast.show('Failed to assign technical', 'error');
        }
        report.isAssigning = false;
      },
      (error) => {
        console.error('Error assigning technical:', error);
        this.toast.show('An error has occurred while trying to assign technical', 'error');
        report.isAssigning = false;
      }
    );
  }

  acceptService(): void {
    this.dialog.closeAll();
    if (this.selectedReport) {
      const reportId = this.selectedReport.id;
      const selectedPersonnelId = this.selectedReport.selectedPersonnelId;

      if (!selectedPersonnelId) {
        this.toast.show('Please select a technical staff before proceeding.', 'warning');
        return;
      }

      this.loadingReports[reportId] = true;

      this.supervisorService.acceptService(reportId, selectedPersonnelId).subscribe(
        (response) => {
          if (response.status === 'success') {
            this.toast.show('Job request has been accepted and technical staff assigned.', 'success');
            this.fetchApprovedReports();
          } else {
            this.toast.show(response.message, 'error');
          }
          this.loadingReports[reportId] = false;
        },
        (error) => {
          this.toast.show('An error occurred during assignment/acceptance.', 'error');
          this.loadingReports[reportId] = false;
        }
      );
    }
  }

  openCancelServiceRequestDialog(report: any): void {
    const dialogRef = this.dialog.open(CancelRequestDialogComponent, { 
      width: '400px',
      data: report  
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.cancelServiceRequest(report);
      }
    });
  }

  cancelServiceRequest(report: any): void {
    const reportId = report?.id;
    if (!reportId) {
      this.toast.show('Invalid report ID', 'error');
      return;
    }

    this.supervisorService.cancelServiceRequest(reportId).subscribe(
      (response) => {
        if (response.status === 'success') {
          this.toast.show('Service request cancelled and removed successfully.', 'success');
          this.fetchApprovedReports(); 
        } else {
          this.toast.show(response.message || 'Failed to cancel the service request.', 'error');
        }
      },
      (error) => {
        this.toast.show('An error occurred while cancelling the request.', 'error');
        console.error('API error:', error);
      }
    );
  }
}
