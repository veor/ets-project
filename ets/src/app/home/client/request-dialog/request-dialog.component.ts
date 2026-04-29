import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ClientService } from '../../../services/client.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SnackBarService } from '../../../services/snackbar.service';
import { MatSelectModule } from '@angular/material/select';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';

@Component({
  selector: 'app-request-dialog',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatInputModule,
    CommonModule,
    FormsModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    NgxMatSelectSearchModule
  ],
  templateUrl: './request-dialog.component.html',
  styleUrls: ['./request-dialog.component.css']
})
export class RequestDialogComponent implements OnInit {
  isLoading: boolean = true;
  isSubmitting: boolean = false;

  privacyConsent: boolean = false;

  requestDivisions: any[] = [];
  divisions: any[] = [];
  offices: any[] = [];

  // selectedRequestDivision: string = '';
  selectedRequestDivision: any = '';
  selectedRequestDivisionName: string = '';  
  requestDivisionSearch: string = '';

  system_name: string = '';
  systemList: string[] = [
    'ETS',
    'DMS',
    'ATS',
    'AICS'
  ];

  name: string = '';
  property_no: string = '';
  contact_no: string = '';
  dept_head: string = '';
  office_name: string = '';
  division_name: string = '';
  issue_request: string = '';

  filteredDivisions: any[] = []; 

  officeSearch: string = '';
  divisionSearch: string = '';

  constructor(
    public dialogRef: MatDialogRef<RequestDialogComponent>, 
    private clientService: ClientService, 
    private toast: SnackBarService
    // private notificationService: NotificationService
  ) {
    this.dialogRef.disableClose = true;
  }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading = true;
    Promise.all([this.fetchRequestDivisions(), this.fetchDivisions(), this.fetchOffices()])
      //     .then(() => {
      //       const defaultDivision = this.requestDivisions.find(d => d.requestDiv_Id === "1");
      //       if (defaultDivision) {
      //         this.selectedRequestDivision = defaultDivision.requestDiv_Id.toString();
      //         this.selectedRequestDivisionName = defaultDivision.requestDiv_Name;
      //       }
      //       this.isLoading = false;
      //     })
      //     .catch(() => this.isLoading = false);
      // }
      .then(() => {

            const defaultDivision = this.requestDivisions.find(d => d.requestDiv_Id == 1);

            if (defaultDivision) {
              this.selectedRequestDivision = defaultDivision.requestDiv_Id;
            } else if (this.requestDivisions.length > 0) {
              this.selectedRequestDivision = this.requestDivisions[0].requestDiv_Id;
            }

            this.isLoading = false;
          })
          .catch(() => this.isLoading = false);
        }

  // fetchRequestDivisions(): Promise<void> {
  //   return new Promise((resolve, reject) => {
  //     this.clientService.getRequestDivisions().subscribe(
  //       (response: any) => {
  //         if (response.status === 'success') {
  //           this.requestDivisions = response.data.filter((division: any) => division.requestDiv_Id === "1");

  //         if (this.requestDivisions.length > 0) {
  //           this.selectedRequestDivision = this.requestDivisions[0].requestDiv_Name;
  //         }
  //           resolve();
  //         } else {
  //           console.error('Failed to fetch divisions');
  //           reject();
  //         }
  //       },
  //       (error) => {
  //         console.error('Error fetching divisions', error);
  //         reject();
  //       }
  //     );
  //   });
  // }
  fetchRequestDivisions(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.clientService.getRequestDivisions().subscribe(
        (response: any) => {
          if (response.status === 'success') {

            // REMOVE FILTER (important)
            this.requestDivisions = response.data;

            resolve();
          } else {
            reject();
          }
        },
        (error) => reject(error)
      );
    });
  }

  fetchOffices(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.clientService.getOffices().subscribe(
        (response: any) => {
          if (response.status === 'success') {
            this.offices = response.data;
            resolve();
          } else {
            console.error('Failed to fetch offices');
            reject();
          }
        },
        (error) => {
          console.error('Error fetching offices', error);
          reject();
        }
      );
    });
  }

  fetchDivisions(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.clientService.getDivisions().subscribe(
        (response: any) => {
          if (response.status === 'success') {
            this.divisions = response.data;
            resolve();
          } else {
            console.error('Failed to fetch divisions');
            reject();
          }
        },
        (error) => {
          console.error('Error fetching divisions', error);
          reject();
        }
      );
    });
  }

 filteredRequestDivisions(): any[] {
    if (!this.requestDivisionSearch) return this.requestDivisions;

    return this.requestDivisions.filter(rd =>
      rd.requestDiv_Name.toLowerCase().includes(this.requestDivisionSearch.toLowerCase())
    );
  }

  onRequestDivisionChange(): void {
    if (this.selectedRequestDivision != 2) {
      this.system_name = '';
    }
  }

  // for office dropdown
  onOfficeChange(): void {
    if (this.office_name) {
    this.filteredDivisions = this.divisions.filter(division => division.office_id.toString() === this.office_name.toString());
    } else {
      this.filteredDivisions = [];
    }

  }

  submitRequest(): void {
    if (!this.selectedRequestDivision) {
      this.toast.show('Please select a division before submitting the request.', 'error');
      return;
    }

    this.isSubmitting = true;
    const requestData = {
      name: this.name,
      property_no: this.property_no,
      contact: this.contact_no,
      dept_head: this.dept_head,
      requestDiv_Id: parseInt(this.selectedRequestDivision),
      office_id: parseInt(this.office_name),
      division_id: parseInt(this.division_name),
      issue_request: this.issue_request,
      system_name: this.system_name || null
    };

    this.clientService.submitRequest(requestData).subscribe(
      (response: any) => {
        this.isSubmitting = false;
        if (response.status === 'success') {
          this.toast.show('Request forwarded. Waiting for office approval', 'success');
          this.dialogRef.close();
        } else {
          this.toast.show('Failed to submit request, Please try again', 'error', + response.message);
        }
      },
      (error) => {
        this.isSubmitting = false;
        console.error('Error submitting request', error);
        this.toast.show('An error has occurred while submitting the request.', 'error');
      }
    );
  }

  closeDialog(): void {
    this.dialogRef.close();
  }

  filteredOffices(): any[] {
    if (!this.officeSearch) return this.offices;

    return this.offices.filter(o =>
      o.office_name.toLowerCase().includes(this.officeSearch.toLowerCase())
    );
  }
  filteredDivisionSearch(): any[] {
    if (!this.divisionSearch) return this.filteredDivisions;

    return this.filteredDivisions.filter(d =>
      d.division_name.toLowerCase().includes(this.divisionSearch.toLowerCase())
    );
  }
}
