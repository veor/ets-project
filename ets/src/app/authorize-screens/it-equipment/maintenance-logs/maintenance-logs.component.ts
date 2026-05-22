import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PmService } from '../../../services/pm.service';
import { LoaderComponent } from '../../../shared/loader/loader.component';
import { MatDialog } from '@angular/material/dialog';
import { MaintenanceLogDetailDialogComponent } from '../dialogs/maintenance-log-detail-dialog/maintenance-log-detail-dialog.component';

export interface MaintenanceLog {
  id: number;
  date: string;
  refNumber: string;
  issue: string;
  assignedStaff: string;
  actionTaken: string;
  remarks: string;
  servicesRendered?: string;
  source?: string;
}

@Component({
  selector: 'app-maintenance-logs',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DatePipe,
    LoaderComponent
  ],
  templateUrl: './maintenance-logs.component.html',
  styleUrl: './maintenance-logs.component.css'
})
export class MaintenanceLogsComponent implements OnInit {

  isLoadingLogs = false;
  logs: MaintenanceLog[] = [];
  staffList: any[] = [];
  
  filters = {
    dateFrom: '',
    dateTo: '',
    search: '',
    staff: ''
  };

  sortColumn: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  currentPage = 1;
  pageSize = 10;
  totalPages = 1;
  totalRecords = 0;

  constructor(
    private pmService: PmService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadITStaff();
    this.loadMaintenanceLogs();
  }

  loadMaintenanceLogs(): void {

    this.isLoadingLogs = true;

    const params: any = {
      page: this.currentPage,
      limit: this.pageSize
    };

    if (this.filters.dateFrom) params.dateFrom = this.filters.dateFrom;
    if (this.filters.dateTo) params.dateTo = this.filters.dateTo;
    if (this.filters.search?.trim()) params.search = this.filters.search.trim();
    if (this.filters.staff) params.staff = this.filters.staff;

    if (this.sortColumn) {
      params.sortColumn = this.sortColumn;
      params.sortDirection = this.sortDirection;
    }

    this.pmService.getMaintenanceLogs(params).subscribe({
      next: (res: any) => {

        if (res.status === 'success') {
          this.logs = res.data || [];
          this.totalRecords = res.pagination?.totalRecords || 0;
          this.totalPages = res.pagination?.totalPages || 1;
          this.currentPage = res.pagination?.currentPage || 1;
        }

        this.isLoadingLogs = false;
      },

      error: (err) => {
        console.error(err);
        this.isLoadingLogs = false;
      }
    });
  }

  applyFilters(): void {
    const hasFilters =
      this.filters.dateFrom ||
      this.filters.dateTo ||
      this.filters.search?.trim() ||
      this.filters.staff;

    if (!hasFilters) {
      this.logs = [];
      this.totalRecords = 0;
      this.totalPages = 1;
      return;
    }

    this.currentPage = 1;
    this.loadMaintenanceLogs();
  }

  clearFilters(): void {

    this.filters = {
      dateFrom: '',
      dateTo: '',
      search: '',
      staff: ''
    };

    this.currentPage = 1;
    this.sortColumn = '';
    this.sortDirection = 'asc';

    this.loadMaintenanceLogs();
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;

    this.currentPage = page;
    this.loadMaintenanceLogs();
  }

  onPageSizeChange(): void {
    this.currentPage = 1;
    this.loadMaintenanceLogs();
  }

  sort(column: string): void {

    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }

    this.currentPage = 1;
    this.loadMaintenanceLogs();
  }

  getSortIcon(column: string): string {
    if (this.sortColumn !== column) return '↕';
    return this.sortDirection === 'asc' ? '↑' : '↓';
  }

  get paginationInfo(): string {

    if (this.totalRecords === 0) return 'No records';

    const start = (this.currentPage - 1) * this.pageSize + 1;
    const end = Math.min(this.currentPage * this.pageSize, this.totalRecords);

    return `${start}–${end} of ${this.totalRecords}`;
  }

  get visiblePages(): number[] {

    const pages: number[] = [];
    const range = 2;

    const start = Math.max(1, this.currentPage - range);
    const end = Math.min(this.totalPages, this.currentPage + range);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  }

  loadITStaff(): void {

    this.pmService.getITStaff().subscribe({
      next: (res: any) => {

        if (res.status === 'success') {
          this.staffList = res.data || [];
        }

      },
      error: (err) => console.error(err)
    });

  }

  openDetail(log: MaintenanceLog): void {
    const rawId = String(log.id).replace('sr_', '').replace('cl_', '');
    this.dialog.open(MaintenanceLogDetailDialogComponent, {
      data: { id: rawId, source: log.source },
      maxWidth: '95vw',
      maxHeight: '90vh'
    });
  }
}