import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PmService } from '../../../services/pm.service';
import { MatDialog } from '@angular/material/dialog';
import { ChecklistTemplateDialogComponent } from '../dialogs/checklist-template-dialog/checklist-template-dialog.component';
import { ChecklistTemplateCreateDialogComponent } from '../dialogs/checklist-template-create-dialog/checklist-template-create-dialog.component';
import { LoaderComponent } from '../../../shared/loader/loader.component';

export interface ChecklistRecord {
  id: number;
  templateName: string;
  year: number;
  equipmentType: string;
}

@Component({
  selector: 'app-checklist-records',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LoaderComponent
  ],
  templateUrl: './checklist-records.component.html',
  styleUrl: './checklist-records.component.css'
})

export class ChecklistRecordsComponent {

  isLoadingChecklist = false;
  checklistRecords: ChecklistRecord[] = [];
  pagedChecklistRecords: ChecklistRecord[] = [];

  availableYears: number[] = [];
  uniqueChecklistEquipmentTypes: string[] = [];

  hasSearched = false;

  checklistFilters = {
    search: '',
    year: '',
    equipmentType: ''
  };

  totalRecords = 0;

  checklistCurrentPage = 1;
  checklistPageSize = 10;
  checklistTotalPages = 1;


  constructor(
    private pmService: PmService,
    private dialog: MatDialog
  ) {}
    ngOnInit(): void {

    this.loadChecklistFilters();
  }

  loadChecklistFilters(): void {
    this.pmService.getChecklistTemplateFilters().subscribe({
      next: (res: any) => {
        this.availableYears =
          res.filters?.years || [];
        this.uniqueChecklistEquipmentTypes =
          res.filters?.equipmentTypes || [];
      },
      error: (err) => {
        console.error(err);
      }
    });
  }
  loadChecklistRecords(): void {
    const hasFilter =
      !!this.checklistFilters.year ||
      !!this.checklistFilters.equipmentType ||
      !!this.checklistFilters.search?.trim();
    if (!hasFilter) {
      this.checklistRecords = [];
      this.pagedChecklistRecords = [];
      this.totalRecords = 0;
      this.checklistTotalPages = 1;
      this.checklistCurrentPage = 1;
      this.hasSearched = false;
      this.isLoadingChecklist = false;
      return;
    }

    this.hasSearched = true;

    const params: any = {
      page: this.checklistCurrentPage,
      limit: this.checklistPageSize
    };

    if (this.checklistFilters.year) {
      params.year = this.checklistFilters.year;
    }

    if (this.checklistFilters.equipmentType) {
      params.equipmentType = this.checklistFilters.equipmentType;
    }

    if (this.checklistFilters.search?.trim()) {
      params.search = this.checklistFilters.search.trim();
    }

    this.pmService.getChecklistTemplates(params).subscribe({
      next: (res: any) => {
        this.isLoadingChecklist = false;
        const data = res.data || [];
        this.checklistRecords = data.map((item: any) => ({
          id: item.id,
          templateName: item.template_name,
          year: item.version_year,
          equipmentType: item.equipment_type
        }));

        this.pagedChecklistRecords = this.checklistRecords;

        this.totalRecords =
          res.pagination?.totalRecords || 0;
        this.checklistTotalPages =
          res.pagination?.totalPages || 1;
        this.checklistCurrentPage =
          res.pagination?.currentPage || 1;
      },

      error: (err) => {
        console.error(err);
        this.isLoadingChecklist = false;

        this.checklistRecords = [];
        this.pagedChecklistRecords = [];

        this.totalRecords = 0;
        this.checklistTotalPages = 1;
      }
    });
  }

  get checklistPaginationInfo(): string {

    if (this.totalRecords === 0) {
      return 'No records';
    }

    const start =
      (this.checklistCurrentPage - 1) *
      this.checklistPageSize + 1;

    const end =
      start + this.checklistRecords.length - 1;

    return `${start}–${end} of ${this.totalRecords}`;
  }

  get visibleChecklistPages(): number[] {

    const pages: number[] = [];

    const range = 2;

    const start = Math.max(
      1,
      this.checklistCurrentPage - range
    );

    const end = Math.min(
      this.checklistTotalPages,
      this.checklistCurrentPage + range
    );

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  }

  onSearchChange(): void {

    this.checklistCurrentPage = 1;

    this.loadChecklistRecords();
  }

  onFilterChange(): void {

    this.checklistCurrentPage = 1;

    this.loadChecklistRecords();
  }

  applyChecklistFilters(): void {
    this.isLoadingChecklist = true
    this.checklistCurrentPage = 1;
    this.loadChecklistRecords();
  }

  openChecklistDialog(item: ChecklistRecord): void {

    this.dialog.open(
      ChecklistTemplateDialogComponent,
      {
        width: '900px',
        maxWidth: '95vw',
        data: item,
        autoFocus: false
      }
    );
  }

  openCreateChecklistDialog(): void {

    const dialogRef = this.dialog.open(
      ChecklistTemplateCreateDialogComponent,
      {
        width: '900px',
        maxWidth: '95vw',
        disableClose: true
      }
    );

    dialogRef.afterClosed().subscribe(result => {

      if (result === 'saved') {
        this.loadChecklistRecords();
      }
    });
  }

  goToChecklistPage(page: number): void {

    if (
      page < 1 ||
      page > this.checklistTotalPages
    ) {
      return;
    }

    this.checklistCurrentPage = page;

    // reload from backend
    this.loadChecklistRecords();
  }

  onChecklistPageSizeChange(): void {

    this.checklistCurrentPage = 1;

    this.loadChecklistRecords();
  }

  clearChecklistFilters(): void {

    this.checklistFilters = {
      search: '',
      year: '',
      equipmentType: ''
    };

    this.checklistCurrentPage = 1;

    this.loadChecklistRecords();
  }
}
