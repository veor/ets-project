import { Component, OnInit, ViewChild } from '@angular/core';
import { SystemSettingsService } from '../../services/system-settings.service';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatDialog } from '@angular/material/dialog';
import { ChangePasswordDialogComponent } from '../system-settings/change-password-dialog/change-password-dialog.component';
import { ChangePermissionsDialogComponent } from '../system-settings/change-permissions-dialog/change-permissions-dialog.component';
import { EditUserDialogComponent } from './edit-user-dialog/edit-user-dialog.component';
import { EditUserPermsDialogComponent } from './edit-user-perms-dialog/edit-user-perms-dialog.component';
import { UpdateUserPasswordDialogComponent } from './update-user-password-dialog/update-user-password-dialog.component';
import { SnackBarService } from '../../services/snackbar.service';
import { MatDividerModule } from '@angular/material/divider';
import { AddNewDivisionDialogComponent } from './add-new-division-dialog/add-new-division-dialog.component';
import { UpdateDivisionDialogComponent } from './update-division-dialog/update-division-dialog.component';
import { AddNewDeptDialogComponent } from './add-new-dept-dialog/add-new-dept-dialog.component';
import { AddNewUserDialogComponent } from './add-new-user-dialog/add-new-user-dialog.component';
import { AddNewPersonnelDialogComponent } from './add-new-personnel-dialog/add-new-personnel-dialog.component';
import { UpdateUserStatusDialogComponent } from './update-user-status-dialog/update-user-status-dialog.component';

@Component({
  selector: 'app-system-settings',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    FormsModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatDividerModule
  ],
  templateUrl: './system-settings.component.html',
  styleUrl: './system-settings.component.css'
})
export class SystemSettingsComponent implements OnInit {
  user: any;
  users: any[] = [];
  offices: any[] = [];
  divisions: any[] = [];
  departments: any[] = [];
  loadingDepartments = true;
  
  dataSource = new MatTableDataSource<any>([]);
  displayedColumns: string[] = ['id_number', 'name', 'office', 'division', 'isActive', 'actions'];
  departmentDataSource = new MatTableDataSource<any>([]);
  departmentDisplayedColumns: string[] = ['office_id', 'office_name', 'office_value', 'division', 'actions'];
  departmentFilter = '';

  loading = true;
  errorMessage: string | null = null;
  filterValue = '';
  saving = false;

  isChangingStatus = false; 

  // Flag for showing the appropriate section based on permissions
  selectedPermissions: string[] = [];
  showAccountSection: boolean = true;
  showCurrUserSaveBtn: boolean = true;
  showCurrUserChangePassBtn: boolean = true;
  showCurrUserManagePermsBtn: boolean = true;

  showUserSection: boolean = true;
  showAddUserBtn: boolean = true;
  showAddTechnicalStaffBtn: boolean = true;
  showEditUserBtn: boolean = true;

  showDepartmentSection: boolean = true;
  showAddDepartmentBtn: boolean = true;
  showActivateUserBtn: boolean = true;
  showChangeUserPassBtn: boolean = true;
  showChangeUserPermsBtn: boolean = true;

  pageSize = 10;
  pageIndex = 0;
  filteredUsers: any[] = [];
  pagedUsers: any[] = [];
  
  @ViewChild(MatPaginator, { static: false }) paginator!: MatPaginator;
  @ViewChild('departmentPaginator', { static: false }) departmentPaginator!: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort!: MatSort;
  constructor(
    private systemSettingsService: SystemSettingsService,
    private dialog: MatDialog,
    private toast: SnackBarService

  ) {}

  ngOnInit(): void {
    this.loadUserInfo();
    this.fetchPermissions();
    this.loadUsers();
    this.loadOffices();
    this.loadDepartments();
  }

  fetchPermissions(): void {
    this.systemSettingsService.getAuthUserPerms().subscribe(
      (response: any) => {
        if (response.status === 'success') {
          this.selectedPermissions = response.permissions || [];
          this.showAccountSection = this.selectedPermissions.includes('2.2');
          this.showCurrUserSaveBtn = this.selectedPermissions.includes('2.3');
          this.showCurrUserChangePassBtn = this.selectedPermissions.includes('2.4');
          this.showCurrUserManagePermsBtn = this.selectedPermissions.includes('2.5');
        
          this.showUserSection = this.selectedPermissions.includes('2.6');
          this.showAddUserBtn = this.selectedPermissions.includes('2.7');
          this.showAddTechnicalStaffBtn = this.selectedPermissions.includes('2.8');
          this.showEditUserBtn = this.selectedPermissions.includes('2.9');
        
          this.showDepartmentSection = this.selectedPermissions.includes('3.1');
          this.showAddDepartmentBtn = this.selectedPermissions.includes('3.2');

        } else {
          alert('Failed to fetch permissions.');
        }
      },
      (error) => {
        console.error('Error fetching permissions', error);
      }
    );
  }

  loadUserInfo(): void {
    this.systemSettingsService.getUserInfo().subscribe({
      next: (response) => {
        if (response.status === 'success') {
          this.user = response.data;
          if (this.user.office_id) {
            this.loadDivisions(this.user.office_id);
          }
        }
      },
      error: () => console.error('Failed to load user info')
    });
  }

  loadOffices(): void {
    this.systemSettingsService.getOffices().subscribe({
      next: (response) => {
        if (response.status === 'success') {
          this.offices = response.data;
        }
      },
      error: () => console.error('Failed to load offices')
    });
  }

  loadDivisions(officeId: number): void {
    if (!officeId) {
      this.divisions = [];
      return;
    }
    this.systemSettingsService.getDivisionsByOffice(officeId).subscribe({
      next: (response) => {
        if (response.status === 'success') {
          this.divisions = response.data;
        }
      },
      error: () => console.error('Failed to load divisions')
    });
  }

  onOfficeChange(officeId: number): void {
    this.user.division_id = null;
    this.loadDivisions(officeId);
  }

  updateUserInfo(): void {
    this.saving = true;

    const payload = {
      designation: this.user.designation,
      office: this.user.office_id,
      division: this.user.division_id
    };

    this.systemSettingsService.updateUserInfo(payload).subscribe({
      next: (response) => {
        this.toast.show('User info updated successfully!', 'success');
        this.saving = false;
      },
      error: () => {
        this.toast.show('Failed to update user info', 'error');        
        this.saving = false;
      }
    });
  }

  loadUsers(): void {
    this.systemSettingsService.getUsers().subscribe({
      next: (response) => {
        if (response.status === 'success') {
          this.users = response.data;
          this.filteredUsers = [...this.users];
          this.updatePagedUsers();
        } else {
          this.errorMessage = response.message;
        }
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'Unable to load users.';
        this.loading = false;
      }
    });
  }

  applyFilter(): void {
    const filter = this.filterValue.trim().toLowerCase();

    this.filteredUsers = this.users.filter(user =>
      user.name?.toLowerCase().includes(filter) ||
      user.id_number?.toString().includes(filter) ||
      user.office?.toLowerCase().includes(filter) ||
      user.division?.toLowerCase().includes(filter)
    );

    this.pageIndex = 0; 
    this.updatePagedUsers();
  }


  openChangePasswordDialog(): void {
    const dialogRef = this.dialog.open(ChangePasswordDialogComponent, {
      width: '500px',
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        console.log('Password changed successfully');
      }
    });
  }

  openEditPermissionsDialog(): void {
    const dialogRef = this.dialog.open(ChangePermissionsDialogComponent, {
      width: '600px',
      maxHeight: '80vh',
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        console.log('Permissions updated successfully');
      }
    });
  }
 
  openEditUserDialog(selectedUser: any) {
    const dialogRef = this.dialog.open(EditUserDialogComponent, {
      width: '550px',
      data: { user: selectedUser },
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this.loadUsers(); 
      }
    });
  }

  openEditUserPermissionsDialog(selectedUser: any) {
    const dialogRef = this.dialog.open(EditUserPermsDialogComponent, {
      width: '650px',
      maxHeight: '85vh',
      disableClose: true,
      data: { user: selectedUser }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        console.log('User permissions updated');
        this.loadUsers(); 
      }
    });
  }

  openChangeUserPasswordDialog(selectedUser: any) {
    const dialogRef = this.dialog.open(UpdateUserPasswordDialogComponent, {
      width: '500px',
      disableClose: true,
      data: { user: selectedUser }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        console.log('Selected user password updated');
      }
    });
  }

  updateUserStatus(user: any, newStatus: number): void {
    const action = newStatus === 1 ? 'activate' : 'deactivate';

    // Open the confirmation dialog
    const dialogRef = this.dialog.open(UpdateUserStatusDialogComponent, {
      width: '450px',
      disableClose: true,
      data: {
        userName: user.name,
        action: action
      }
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (!confirmed) {
        return; // User clicked cancel
      }

      // Proceed with status update
      this.isChangingStatus = true;

      this.systemSettingsService.updateUserStatus(user.id_number, newStatus).subscribe({
        next: (response: any) => {
          this.isChangingStatus = false;
          if (response.status === 'success') {
            user.isActive = newStatus;
            this.toast.show(`User ${action}d successfully!`, 'success');
          } else {
            this.toast.show(`Failed to ${action} user: ${response.message}`, 'error');
          }
        },
        error: (err) => {
          this.isChangingStatus = false;
          console.error(`Error ${action}ing user:`, err);
          this.toast.show(`An error occurred while ${action}ing user`, 'error');
        }
      });
    });
  }

  onPageChange(event: any): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.updatePagedUsers();
  }
  updatePagedUsers(): void {
    const startIndex = this.pageIndex * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.pagedUsers = this.filteredUsers.slice(startIndex, endIndex);
  }


//==================== DEPARTMENT/DIVISION 
  loadDepartments(): void {
    this.systemSettingsService.getAllOffices().subscribe({
      next: (res) => {
        if (res.status === 'success') {
          this.departments = res.data;
          this.departmentDataSource = new MatTableDataSource(this.departments);
          this.departmentDataSource.paginator = this.departmentPaginator;
        }
        this.loadingDepartments = false;
      },
      error: () => {
        console.error('Failed to load departments');
        this.loadingDepartments = false;
      }
    });
  }

  applyDepartmentFilter(): void {
    this.departmentDataSource.filter = this.departmentFilter.trim().toLowerCase();
  }

  saveDepartment(dept: any) {
    const payload = {
      office_id: dept.office_id,
      office_name: dept.office_name,
      office_value: dept.office_value,
      division_id: dept.selectedDivisionId || null
    };

    this.systemSettingsService.updateDepartment(payload).subscribe({
      next: (res) => {
        if (res.status === 'success') {
          this.toast.show('Department updated successfully!', 'success');
          this.loadDepartments();
        } else {
          this.toast.show('Failed to update department: ' + res.message, 'error');
        }
      },
      error: (err) => {
        console.error('Error updating department:', err);
        this.toast.show('Error updating department', 'error');
      }
    });
  }
  loadDivisionsForOffice(dept: any) {
    if (dept.divisionsLoaded) return; // avoid reloading

    dept.divisionsLoaded = false;

    this.systemSettingsService.getDivisionsByOffice(dept.office_id).subscribe({
      next: (res) => {
        dept.divisions = res.data || [];
        dept.divisionsLoaded = true;

        // Auto-select division if one already exists
        if (!dept.selectedDivisionId && dept.divisions.length > 0) {
          dept.selectedDivisionId = dept.divisions[0].division_id;
        }
      },
      error: () => {
        dept.divisions = [];
        dept.divisionsLoaded = true;
        this.toast.show('Failed to load divisions', 'error');
      }
    });
  }
  reloadDivisions(dept: any) {
    dept.divisionsLoaded = false;

    this.systemSettingsService.getDivisionsByOffice(dept.office_id).subscribe({
      next: (res) => {
        dept.divisions = res.data || [];
        dept.divisionsLoaded = true;

        if (dept.divisions.length > 0) {
          dept.selectedDivisionId = dept.divisions[0].division_id;
        }
      },
      error: () => {
        dept.divisionsLoaded = true;
        this.toast.show('Error loading divisions.', 'error');
      }
    });
  }
  openAddDivisionDialog(dept: any, select: any) {
    const dialogRef = this.dialog.open(AddNewDivisionDialogComponent, {
      width: '350px',
      disableClose: true,
      data: { office: dept }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this.toast.show('Division added successfully!', 'success');

        // Reload divisions after adding
        this.reloadDivisions(dept);

        // Refresh dropdown visually
        select.close();
        setTimeout(() => select.open(), 200);
      }
    });
  }
  openUpdateDivisionDialog(div: any, dept: any, event: Event) {
    event.stopPropagation(); 
    
    const dialogRef = this.dialog.open(UpdateDivisionDialogComponent, {
      width: '400px',
      data: { ...div }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (!result) return;

      const payload = {
        division_id: result.division_id,
        division_name: result.division_name
      };

    this.systemSettingsService.updateDivision(payload).subscribe((res: any) => {
        if (res.status === 'success') {
          this.toast.show('Division updated successfully', 'success');
          this.loadDivisionsForOffice(dept); // reload division list
        } else {
          this.toast.show(res.message, 'error');
        }
      });
    });
  }
  openAddDepartmentDialog(): void {
    const dialogRef = this.dialog.open(AddNewDeptDialogComponent, {
      width: '400px',
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadDepartments(); // refresh table after adding
      }
    });
  }
  openAddUserDialog() {
    const dialogRef = this.dialog.open(AddNewUserDialogComponent, {
      width: '550px',
      disableClose: true,
      data: { offices: this.offices } 
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this.toast.show('User added successfully!', 'success');
        this.loadUsers(); 
      }
    });
  }

openAddPersonnelDialog(): void {
  const dialogRef = this.dialog.open(AddNewPersonnelDialogComponent, {
    width: '500px',
    disableClose: true
  });

  dialogRef.afterClosed().subscribe(result => {
    if (result === true) {
      this.toast.show('Technical staff added successfully!', 'success');
    }
  });
}

}