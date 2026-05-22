import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MaintenanceLogsComponent } from '../it-equipment/maintenance-logs/maintenance-logs.component';
import { MatDialog } from '@angular/material/dialog';
import { RegisterDeviceComponent } from './register-device/register-device.component';
import { FormsModule } from '@angular/forms';
import { PmService } from '../../services/pm.service';
import { ChecklistRecordsComponent } from './checklist-records/checklist-records.component';
import { MaintenanceChecklistDialogComponent } from './dialogs/maintenance-checklist-dialog/maintenance-checklist-dialog.component';
import { GenerateChecklistDialogComponent } from './dialogs/generate-checklist-dialog/generate-checklist-dialog.component';
import { LoaderComponent } from '../../shared/loader/loader.component';

export interface EquipmentRecord {
  id?: number;
  computerName: string;
  endUser: string;
  accountablePerson: string;
  department: string;
  division: string;
  equipmentType: string[];
  par: string;
  status: string;
  hasChecklist?: boolean;
}

@Component({
  selector: 'app-it-equipment',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MaintenanceLogsComponent,
    ChecklistRecordsComponent,
    LoaderComponent
  ],
  templateUrl: './it-equipment.component.html',
  styleUrl: './it-equipment.component.css'
})
export class ItEquipmentComponent {
  isLoadingChecklist = false;
  activeTab: 'equipment' | 'logs' | 'checklists' = 'equipment';
  hasActiveFilter = false;

  equipmentTypesList: string[] = [];
  equipment: EquipmentRecord[] = []; 
  filteredEquipment: EquipmentRecord[] = [];
  pagedEquipment: EquipmentRecord[] = [];

  filters = { search: '', department: '', equipmentType: '', status: '' };

  sortColumn: keyof EquipmentRecord | '' = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  currentPage = 1;
  pageSize = 10;
  totalPages = 1;
  
  constructor(private dialog: MatDialog, private pmService: PmService) {}

  ngOnInit(): void {
    this.loadEquipmentTypes();
    this.hasActiveFilter = false;
    this.equipment = [];
    this.filteredEquipment = [];
    this.pagedEquipment = [];
  }

  loadEquipment(): void {
    const params = {
      search: this.filters.search,
      equipmentType: this.filters.equipmentType,
      status: this.filters.status,
      page: this.currentPage,
      limit: this.pageSize,
      sortColumn: this.sortColumn,
      sortDirection: this.sortDirection
    };

    this.pmService.getEquipmentList(params).subscribe({
      next: (res: any) => {
        this.equipment = res.data || [];
        this.filteredEquipment = res.data || [];
        this.totalPages = res.pagination?.totalPages || 1;
        this.pagedEquipment = res.data || [];
      }
    });
  }

  loadEquipmentTypes(): void {
    this.pmService.getEquipmentTypes().subscribe({
      next: (res: any) => {
        this.equipmentTypesList = res.data || [];
      }
    });
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
    this.isLoadingChecklist = true
    this.hasActiveFilter =
      !!this.filters.search.trim() ||
      !!this.filters.equipmentType ||
      !!this.filters.status;

    if (!this.hasActiveFilter) {
      this.equipment = [];
      this.filteredEquipment = [];
      this.pagedEquipment = [];
      this.totalPages = 1;
      this.isLoadingChecklist = false;
      return;
    }

    const params = {
      search: this.filters.search,
      equipmentType: this.filters.equipmentType,
      status: this.filters.status,
      page: this.currentPage,
      limit: this.pageSize,
      sortColumn: this.sortColumn,
      sortDirection: this.sortDirection
    };

    this.pmService.getEquipmentList(params).subscribe({
      next: (res: any) => {
        this.isLoadingChecklist = false;
        this.equipment = res.data || [];
        this.filteredEquipment = res.data || [];
        this.totalPages = res.pagination?.totalPages || 1;
        this.currentPage = 1;
        this.updatePage();
      },

      error: (err) => {
        console.error(err);
        this.isLoadingChecklist = false;
      }
    });
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

  openGenerateChecklist(row: EquipmentRecord): void {
    this.isLoadingChecklist = true;
    const dialogRef = this.dialog.open(GenerateChecklistDialogComponent, {
      width: '900px',
      maxWidth: '98vw',
      maxHeight: '90vh',
      panelClass: 'checklist-dialog',
      data: {
        equipment: row
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      this.isLoadingChecklist = false;

      if (result?.status === 'success') {
        // reopen final checklist dialog (from equipment context)
        this.dialog.open(MaintenanceChecklistDialogComponent, {
          width: '1100px',
          maxWidth: '98vw',
          maxHeight: '90vh',
          panelClass: 'checklist-dialog',
          data: {
            equipment: row,
            templateId: result.template.id,
            templateName: result.template.template_name,
            equipmentType: result.template.equipment_type,
            versionYear: result.template.version_year,
            tasks: result.data
          }
        });
      }
    });
  }

  openChecklist(row: EquipmentRecord): void {
    if (row.hasChecklist) {
      this.isLoadingChecklist = true;
      this.pmService
        .getSavedChecklist(row.id!)
        .subscribe({
          next: (res: any) => {
            this.isLoadingChecklist = false;
            if (res.status !== 'success') {
              return;
            }
            this.dialog.open(
              MaintenanceChecklistDialogComponent,
              {
                width: '1100px',
                maxWidth: '98vw',
                maxHeight: '90vh',
                panelClass: 'checklist-dialog',
                data: {
                  isReadOnly: true,
                  equipment: {
                    id: res.data.equipment_id,
                    computerName:
                      res.data.device_name,
                    accountablePerson:
                      res.data.accountable_person,
                    par:
                      res.data.par_ics
                  },
                  templateId:
                    res.data.template_id,
                  templateName:
                    res.data.template_name,
                  equipmentType:
                    res.data.equipment_type,
                  versionYear:
                    res.data.version_year,
                  findings:
                    res.data.findings,
                  recommendation:
                    res.data.recommendation,
                  tasks:
                    res.data.tasks,
                      signature: res.data.signature,
  approved_by: res.data.approved_by,
  verified_by: res.data.verified_by,
  noted_by: res.data.noted_by,
  checklistLogId: res.data.id,
                }
              });
          },
          error: () => {
            this.isLoadingChecklist = false;
          }
        });
      return;
    }

    const dialogRef = this.dialog.open(
      GenerateChecklistDialogComponent,
      {
        width: '900px',
        maxWidth: '98vw',
        maxHeight: '90vh',
        panelClass: 'checklist-dialog',
        data: {
          equipment: row
        }
      }
    );

    dialogRef.afterClosed().subscribe((saved) => {
      if (saved) {
        this.applyFilters();
      }
    });

  }
}

