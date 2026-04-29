import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { PmService } from '../../../services/pm.service';

interface AccountableInfo {
  id?: number;
  accountable_person: string;
  end_user: string;
  designation: string;
  equipment_type: string;
  par_ics: string;
  computer_name: string;
  office_id: number;
  division_id: number;
  division_name?: string;
  status: string;
  hardware_information?: string; 
  software_information?: string;
  network_information?: string;

}

interface Division {
  division_id: number;
  division_name: string;
  office_id: number;
}

@Component({
  selector: 'app-device-record',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatExpansionModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule
  ],
  templateUrl: './device-record.component.html',
  styleUrl: './device-record.component.css'
})
export class DeviceRecordComponent implements OnInit {
  
  accountableInfoList: AccountableInfo[] = [];
  filteredAccountableInfoList: AccountableInfo[] = [];
  divisions: Division[] = [];
  isLoading = false;
  error: string | null = null;
  panelOpenState = false;
  
  // Search properties
  searchQuery = '';
  searchType = '';
  hasSearched = false;
  
  searchOptions = [
    { value: '', label: 'Select search type...' },
    { value: 'accountable_person', label: 'Accountable Person' },
    { value: 'end_user', label: 'End User' },
    { value: 'computer_name', label: 'Computer Name' }
  ];

  constructor(private pmService: PmService) {}

  ngOnInit(): void {
    this.loadDivisions();
    // Don't load accountable info by default - only when searched
  }

  loadDivisions(): void {
    this.pmService.getDivisions().subscribe({
      next: (response) => {
        if (response.status === 'success') {
          this.divisions = response.data;
        }
      },
      error: (error) => {
        console.error('Error loading divisions:', error);
      }
    });
  }

  loadAccountableInfo(): void {
    if (!this.searchQuery.trim()) {
      return;
    }

    this.isLoading = true;
    this.error = null;
    this.hasSearched = true;
    
    this.pmService.getAccountableInfo().subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.status === 'success') {
          this.accountableInfoList = response.data.map((item: any) => ({
            ...item,
            designation: this.parseJsonField(item.designation),
            equipment_type: this.parseJsonField(item.equipment_type),
            status: this.parseJsonField(item.status),
            division_name: this.getDivisionName(item.division_id),
            hardware_information: this.formatHardwareInfo(item.hardware_information),
            software_information: this.formatSoftwareInfo(item.software_information),
            network_information: this.formatNetworkInfo(item.network_information),

          }));
          this.filterResults();
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.error = 'Failed to load accountable information';
        console.error('Error loading accountable info:', error);
      }
    });
  }

  filterResults(): void {
    if (!this.searchQuery.trim()) {
      this.filteredAccountableInfoList = [];
      return;
    }

    const query = this.searchQuery.toLowerCase().trim();
    this.filteredAccountableInfoList = this.accountableInfoList.filter(item => {
      if (this.searchType === 'accountable_person_or_computer') {
        // Search in both accountable_person and computer_name
        const accountablePerson = item.accountable_person?.toString().toLowerCase() || '';
        const computerName = item.computer_name?.toString().toLowerCase() || '';
        return accountablePerson.includes(query) || computerName.includes(query);
      } else {
        // Search in specific field
        const fieldValue = item[this.searchType as keyof AccountableInfo];
        if (fieldValue) {
          return fieldValue.toString().toLowerCase().includes(query);
        }
      }
      return false;
    });
  }

  getSelectedSearchLabel(): string {
    const option = this.searchOptions.find(opt => opt.value === this.searchType);
    return option ? option.label : 'Unknown';
  }

  onSearch(): void {
    if (!this.searchQuery.trim()) {
      this.filteredAccountableInfoList = [];
      this.hasSearched = false;
      return;
    }

    // If we already have data, just filter it
    if (this.accountableInfoList.length > 0) {
      this.filterResults();
    } else {
      // Load data from server
      this.loadAccountableInfo();
    }
  }

  onSearchTypeChange(): void {
    if (this.hasSearched && this.searchQuery.trim()) {
      this.filterResults();
    }
  }

  refreshData(): void {
    if (this.hasSearched) {
      this.onSearch();
    }
  }

  getStatusColor(status: string): string {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'primary';
      case 'maintenance':
        return 'accent';
      case 'inactive':
        return 'warn';
      default:
        return '';
    }
  }

  formatNetworkInfo(jsonString: string): string[] {
    try {
      const parsed = JSON.parse(jsonString);
      const formatted: string[] = [];

      for (const key in parsed) {
        if (parsed.hasOwnProperty(key)) {
          const value = parsed[key];
          formatted.push(`${this.capitalize(key)}: ${value}`);
        }
      }

      return formatted;
    } catch (error) {
      return ['Invalid network information'];
    }
  }

  private parseJsonField(field: string): string {
    try {
      return typeof field === 'string' ? JSON.parse(field) : field;
    } catch {
      return field;
    }
  }

  private getDivisionName(divisionId: number): string {
    const division = this.divisions.find(d => d.division_id === divisionId);
    return division ? division.division_name : 'Unknown Division';
  }

  private formatHardwareInfo(jsonString: string): string[] {
    try {
      const parsed = JSON.parse(jsonString);
      const formatted: string[] = [];

      for (const key in parsed) {
        if (parsed.hasOwnProperty(key)) {
          const item = parsed[key];
          if (item.brand || item.serial) {
            formatted.push(
              `${this.capitalize(key)}: Brand - ${item.brand || 'N/A'}, Serial - ${item.serial || 'N/A'}`
            );
          }
        }
      }

      return formatted;
    } catch (error) {
      return ['Invalid hardware information'];
    }
  }

  private formatSoftwareInfo(jsonString: string): string[] {
    try {
      const parsed = JSON.parse(jsonString);
      const formatted: string[] = [];

      for (const key in parsed) {
        if (parsed.hasOwnProperty(key)) {
          const value = parsed[key];
          formatted.push(`${this.capitalize(key)}: ${value}`);
        }
      }

      return formatted;
    } catch (error) {
      return ['Invalid software information'];
    }
  }

  private capitalize(text: string): string {
    // Insert space before each uppercase letter (excluding first character)
    const withSpaces = text.replace(/([A-Z])/g, ' $1');
    // Capitalize first letter of the whole string
    return withSpaces.charAt(0).toUpperCase() + withSpaces.slice(1).trim();
  }

}