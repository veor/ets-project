import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MaintenanceLogsComponent } from '../it-equipment/maintenance-logs/maintenance-logs.component';
import { MatDialog } from '@angular/material/dialog';
import { RegisterDeviceComponent } from './register-device/register-device.component';
import { FormsModule } from '@angular/forms';

export interface EquipmentRecord {
  computerName: string;
  endUser: string;
  accountablePerson: string;
  department: string;
  division: string;
  equipmentType: string[];
  par: string;
  status: string;
}

@Component({
  selector: 'app-it-equipment',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MaintenanceLogsComponent
  ],
  templateUrl: './it-equipment.component.html',
  styleUrl: './it-equipment.component.css'
})
export class ItEquipmentComponent {
  activeTab: 'equipment' | 'logs' = 'equipment';

  equipment: EquipmentRecord[] = []; 
  filteredEquipment: EquipmentRecord[] = [];
  pagedEquipment: EquipmentRecord[] = [];

  filters = { search: '', department: '', equipmentType: '', status: '' };

  sortColumn: keyof EquipmentRecord | '' = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  currentPage = 1;
  pageSize = 10;
  totalPages = 1;

  constructor(private dialog: MatDialog) {}

  ngOnInit(): void {
    this.applyFilters();
  }

  get uniqueEquipmentTypes(): string[] {
    const types = this.equipment.flatMap(e => e.equipmentType ?? []);
    return [...new Set(types)].sort();
  }

  get paginationInfo(): string {
    if (this.filteredEquipment.length === 0) return 'No records';
    const start = (this.currentPage - 1) * this.pageSize + 1;
    const end = Math.min(this.currentPage * this.pageSize, this.filteredEquipment.length);
    return `${start}–${end} of ${this.filteredEquipment.length}`;
  }

  get visiblePages(): number[] {
    const pages: number[] = [];
    const range = 2;
    const start = Math.max(1, this.currentPage - range);
    const end = Math.min(this.totalPages, this.currentPage + range);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  }

  applyFilters(): void {
    let result = [...this.equipment];

    if (this.filters.equipmentType)
      result = result.filter(e => e.equipmentType?.includes(this.filters.equipmentType));

    if (this.filters.status)
      result = result.filter(e => e.status === this.filters.status);

    if (this.filters.search.trim()) {
      const term = this.filters.search.toLowerCase();
      result = result.filter(e =>
        e.computerName?.toLowerCase().includes(term)       ||
        e.endUser?.toLowerCase().includes(term)            ||
        e.accountablePerson?.toLowerCase().includes(term)  ||
        e.par?.toLowerCase().includes(term)                ||
        e.department?.toLowerCase().includes(term)         ||
        e.equipmentType?.join(' ').toLowerCase().includes(term)
      );
    }

    if (this.sortColumn) {
      const col = this.sortColumn;
      const dir = this.sortDirection === 'asc' ? 1 : -1;
      result.sort((a, b) => {
        const av = (a[col] ?? '').toString().toLowerCase();
        const bv = (b[col] ?? '').toString().toLowerCase();
        return av < bv ? -dir : av > bv ? dir : 0;
      });
    }

    this.filteredEquipment = result;
    this.totalPages = Math.max(1, Math.ceil(result.length / this.pageSize));
    if (this.currentPage > this.totalPages) this.currentPage = 1;
    this.updatePage();
  }

  updatePage(): void {
    const start = (this.currentPage - 1) * this.pageSize;
    this.pagedEquipment = this.filteredEquipment.slice(start, start + this.pageSize);
  }

  sort(column: keyof EquipmentRecord): void {
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
    this.filters = { search: '', department: '', equipmentType: '', status: '' };
    this.sortColumn = '';
    this.sortDirection = 'asc';
    this.currentPage = 1;
    this.applyFilters();
  }

  openAddDeviceDialog(): void {
    const ref = this.dialog.open(RegisterDeviceComponent, {
      width: '900px',
      maxWidth: '98vw',
      maxHeight: '90vh',
      panelClass: 'register-device-dialog',
    });

    ref.afterClosed().subscribe(result => {
      if (result === 'saved') this.applyFilters(); 
    });
  }
}

