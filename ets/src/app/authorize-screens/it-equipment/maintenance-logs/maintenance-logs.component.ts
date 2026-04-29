import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MaintenanceChecklistDialogComponent } from '../maintenance-checklist-dialog/maintenance-checklist-dialog.component';

export interface MaintenanceLog {
  date: string;
  refNumber: string;
  issue: string;
  services: string;
  assignedStaff: string;
  actionTaken: string;
  remarks: string;
}

@Component({
  selector: 'app-maintenance-logs',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DatePipe,
  ],
  templateUrl: './maintenance-logs.component.html',
  styleUrl: './maintenance-logs.component.css'
})
export class MaintenanceLogsComponent implements OnInit {

  logs: MaintenanceLog[] = [
    {
      date: '2025-04-10',
      refNumber: 'ITRM-2025-001',
      issue: 'System optimization required',
      services: 'Basic Troubleshooting (1), Data Backup (1)',
      assignedStaff: 'Juan Dela Cruz',
      actionTaken: 'Full desktop maintenance',
      remarks: 'Completed successfully'
    },
    {
      date: '2026-04-11',
      refNumber: 'APM-2026-002',
      issue: 'Printer not printing properly',
      services: 'Basic Troubleshooting (1)',
      assignedStaff: 'Maria Santos',
      actionTaken: 'Printer cleaning & calibration',
      remarks: 'Resolved after nozzle cleaning'
    },
    {
      date: '2026-04-12',
      refNumber: 'ITRM-2026-003',
      issue: 'Network downtime in office',
      services: 'Basic Troubleshooting (1)',
      assignedStaff: 'Pedro Reyes',
      actionTaken: 'Switch inspection & cable fix',
      remarks: 'Loose cable replaced'
    },
    {
      date: '2027-04-13',
      refNumber: 'APM-2027-004',
      issue: 'Power backup failure',
      services: 'Basic Troubleshooting (1), Data Backup (1)',
      assignedStaff: 'John Cruz',
      actionTaken: 'UPS inspection',
      remarks: 'Battery replaced'
    }
  ];

  filteredLogs: MaintenanceLog[] = [];
  pagedLogs: MaintenanceLog[] = [];

  filters = { dateFrom: '', dateTo: '', search: '', staff: '' };

  sortColumn: keyof MaintenanceLog | '' = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  currentPage = 1;
  pageSize = 10;
  totalPages = 1;

  constructor(private dialog: MatDialog) {}

  get uniqueStaff(): string[] {
    return [...new Set(this.logs.map(l => l.assignedStaff).filter(Boolean))].sort();
  }

  get paginationInfo(): string {
    if (this.filteredLogs.length === 0) return 'No records';
    const start = (this.currentPage - 1) * this.pageSize + 1;
    const end = Math.min(this.currentPage * this.pageSize, this.filteredLogs.length);
    return `${start}–${end} of ${this.filteredLogs.length}`;
  }

  get visiblePages(): number[] {
    const pages: number[] = [];
    const range = 2;
    const start = Math.max(1, this.currentPage - range);
    const end = Math.min(this.totalPages, this.currentPage + range);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  }

  ngOnInit(): void {
    this.applyFilters();
  }

  openChecklist(log: MaintenanceLog): void {
    this.dialog.open(MaintenanceChecklistDialogComponent, {
      width: '1100px',
      maxWidth: '98vw',
      maxHeight: '90vh',
      data: { ...log, year: new Date(log.date).getFullYear() },
      panelClass: 'checklist-dialog',
    });
  }

  applyFilters(): void {
    let result = [...this.logs];

    if (this.filters.dateFrom) result = result.filter(l => l.date >= this.filters.dateFrom);
    if (this.filters.dateTo)   result = result.filter(l => l.date <= this.filters.dateTo);

    if (this.filters.search.trim()) {
      const term = this.filters.search.toLowerCase();
      result = result.filter(l =>
        l.refNumber.toLowerCase().includes(term)    ||
        l.issue.toLowerCase().includes(term)        ||
        l.services.toLowerCase().includes(term)     ||
        l.assignedStaff.toLowerCase().includes(term)||
        l.actionTaken.toLowerCase().includes(term)  ||
        l.remarks.toLowerCase().includes(term)
      );
    }

    if (this.filters.staff) result = result.filter(l => l.assignedStaff === this.filters.staff);

    if (this.sortColumn) {
      const col = this.sortColumn;
      const dir = this.sortDirection === 'asc' ? 1 : -1;
      result.sort((a, b) => {
        const av = (a[col] ?? '').toString().toLowerCase();
        const bv = (b[col] ?? '').toString().toLowerCase();
        return av < bv ? -dir : av > bv ? dir : 0;
      });
    }

    this.filteredLogs = result;
    this.totalPages = Math.max(1, Math.ceil(result.length / this.pageSize));
    if (this.currentPage > this.totalPages) this.currentPage = 1;
    this.updatePage();
  }

  updatePage(): void {
    const start = (this.currentPage - 1) * this.pageSize;
    this.pagedLogs = this.filteredLogs.slice(start, start + this.pageSize);
  }

  sort(column: keyof MaintenanceLog): void {
    this.sortDirection = this.sortColumn === column && this.sortDirection === 'asc' ? 'desc' : 'asc';
    this.sortColumn = column;
    this.applyFilters();
  }

  getSortIcon(column: string): string {
    if (this.sortColumn !== column) return '↕';
    return this.sortDirection === 'asc' ? '↑' : '↓';
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.updatePage();
  }

  onPageSizeChange(): void {
    this.currentPage = 1;
    this.applyFilters();
  }

  clearFilters(): void {
    this.filters = { dateFrom: '', dateTo: '', search: '', staff: '' };
    this.sortColumn = '';
    this.sortDirection = 'asc';
    this.currentPage = 1;
    this.applyFilters();
  }
}