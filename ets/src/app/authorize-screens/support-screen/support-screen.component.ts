import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { SupervisorService } from '../../services/supervisor.service';
import { ConfirmDialogComponent } from './confirm-dialog/confirm-dialog.component';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { FormsModule } from '@angular/forms';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { CancelDialogComponent } from './cancel-dialog/cancel-dialog.component';
import { SnackBarService } from '../../services/snackbar.service';
import { LoaderComponent } from '../../shared/loader/loader.component';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';

@Component({
  selector: 'app-support-screen',
  templateUrl: './support-screen.component.html',
  styleUrls: ['./support-screen.component.css'],
  imports: [
    CommonModule, 
    MatTableModule, 
    MatPaginatorModule, 
    FormsModule, 
    MatProgressBarModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatChipsModule,
    LoaderComponent
  ],
  standalone: true,
})
export class SupportScreenComponent implements OnInit {
  jobRequests: any[] = [];
  filteredJobRequests: any[] = []; 
  selectedRequestType: string = 'pending';
  displayedColumns: string[] = [];

  isLoading: boolean = true;
  loadingRequests: { [key: number]: boolean } = {};

  paginatedJobRequests: any[] = [];
  currentPage: number = 0;
  pageSize: number = 10;

  searchFilters = { name: '' };
  sortOption = 'date_of_request';
  sortOrder = 'ASC';

  constructor(
    private supervisorService: SupervisorService,
    private dialog: MatDialog,
    private toast: SnackBarService
  ) {}

  ngOnInit(): void {
    this.fetchJobRequests();
  }

  applyFilters(): void {
    this.filteredJobRequests = this.jobRequests.filter((request) => {
      const matchesName = this.searchFilters.name
        ? request.name.toLowerCase().includes(this.searchFilters.name.toLowerCase())
        : true;
  
    const matchesApproval =
      this.selectedRequestType === 'approved'
        ? request.approval_status === '1'
        : request.approval_status !== '1';

    return matchesName && matchesApproval;
  });
  
  this.displayedColumns =
    this.selectedRequestType === 'approved'
      ? ['control_no', 'date_of_request', 'name', 'issue_request', 'status']
      : ['date_of_request', 'name', 'issue_request', 'status', 'actions'];

  this.applySorting();
  this.updatePaginatedRequests();
}

  shouldDisplayRequest(request: any): boolean {
    return this.selectedRequestType === 'approved'
      ? request.approval_status === '1'
      : request.approval_status !== '1';
  }
    
  
  applySorting(): void {
    this.filteredJobRequests.sort((a, b) => {
      const fieldA = a[this.sortOption]?.toString().toLowerCase() || '';
      const fieldB = b[this.sortOption]?.toString().toLowerCase() || '';
      return this.sortOrder === 'ASC'
        ? fieldA.localeCompare(fieldB)
        : fieldB.localeCompare(fieldA);
    });
    this.updatePaginatedRequests();
  }
  
  fetchJobRequests(): void {
    const params = {
      filters: this.searchFilters,
      sort: this.sortOption,
      order: this.sortOrder,
    };
  
    this.supervisorService.getJobRequests().subscribe(
      (response) => {
        if (response.status === 'success') {
          this.jobRequests = response.data;
          this.applyFilters(); 
          this.applySorting(); 
          this.filteredJobRequests = this.jobRequests.filter(
            (request) => request.approval_status !== '1'
          );
          this.updatePaginatedRequests();
          this.isLoading = false;
        } else {
          console.error('Failed to fetch job requests');
          this.isLoading = false;
        }
      },
      (error) => {
        console.error('API error: ', error);
        this.isLoading = false;
      }
    );
  }

  updatePaginatedRequests(): void {
    const startIndex = this.currentPage * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedJobRequests = this.filteredJobRequests.slice(startIndex, endIndex);
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.updatePaginatedRequests();
  }

  openConfirmationDialog(request: any): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent);

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.updateApprovalStatus(request.id);
      }
    });
  }

  updateApprovalStatus(requestId: number): void {
    this.loadingRequests[requestId] = true; 
    this.supervisorService.updateApprovalStatus(requestId).subscribe(
      (response) => {
        if (response.status === 'success') {
          this.toast.show('Request has been approved!', 'success');
          this.fetchJobRequests(); 
        } else {
          this.toast.show(response.message, 'error');
          console.error('Failed to approve the request.');
        }
        this.loadingRequests[requestId] = false; 
      },
      (error) => {
        this.toast.show('An error occurred. Please try again later.', 'error');
        console.error('API error: ', error);
        this.loadingRequests[requestId] = false; 
      }
    );
  }

  openCancelConfirmationDialog(request: any): void {
    const dialogRef = this.dialog.open(CancelDialogComponent);

    dialogRef.afterClosed().subscribe((confirmed) => {
      if(confirmed) {
        this.deleteRequest(request.id); 
      }
    });
  }
  deleteRequest(requestId: number): void {
    this.loadingRequests[requestId] = true; 

    this.supervisorService.deleteJobRequest(requestId).subscribe(
      (response) => {
        if (response.status === 'success') {
          this.toast.show('Request cancelled and deleted successfully!', 'success');
          this.fetchJobRequests(); 
        } else {
          this.toast.show(response.message, 'error');
          console.error('Failed to delete the request.');
        }
        this.loadingRequests[requestId] = false; 
      },
      (error) => {
        this.toast.show('An error occcured. Please try again later.', 'error');
        console.error('API error:', 'error');
        this.loadingRequests[requestId] = false; 
      }
    );
  }
}