import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
// import { NotificationService } from '../../shared/notification.service';
import { UserSettingsService } from '../../services/user-settings.service';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { SnackBarService } from '../../services/snackbar.service';
import { LoaderComponent } from '../../shared/loader/loader.component';

@Component({
  selector: 'app-user-settings',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    FormsModule, 
    MatProgressBarModule,
    LoaderComponent
  ],
  templateUrl: './user-settings.component.html',
  styleUrl: './user-settings.component.css'
})
export class UserSettingsComponent implements OnInit{
  getCurrentUserId() {
    throw new Error('Method not implemented.');
  }
  updatePassword(arg0: { id_number: any; currentPassword: any; newPassword: any; }) {
    throw new Error('Method not implemented.');
  }
  isLoading: boolean = false;
  isSaving: boolean = false;
  isChangingPassword: boolean = false;
  isAddingPerms: boolean = false;
  isLoadingFetch: boolean = false;
  isRegistering: boolean = false;
  isAddingPersonnel: boolean = false;
  isLoadingPermissions: boolean = false;

  // Flag for showing the appropriate section based on permissions
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
  showEditDepartmentBtn: boolean = true;
  showActivateUserBtn: boolean = true;

  isPasswordModalVisible: boolean = false;  
  isPermissionsModalVisible: boolean = false; 

  // ALL PERMS
  allPermissions: { id: string; label: string; children?: { id: string; label: string }[] }[] = [
    { id: '1.1', label: 'Administrator', children: [
      { id: '1.2', label: 'Change Password' },
      { id: '2.1', label: 'Manage System' },
      { id: '2.2', label: 'Enable Account Section' },
      { id: '2.3', label: 'Edit Current User' },
      { id: '2.4', label: 'Change Current User Password' },
      { id: '2.5', label: 'Edit Current User Permissions' },
      { id: '2.6', label: 'Enable User Section' },
      { id: '2.7', label: 'Add New User' },
      { id: '2.8', label: 'Add New Technical Staff' },
      { id: '2.9', label: 'Edit User' },
      { id: '3.1', label: 'Enable Department Section' },
      { id: '3.2', label: 'Add New Department' },
      { id: '3.3', label: 'Edit Department' },
    ]},
    { id: '3.4', label: 'Dashboard', children: [
      { id: '5.4', label: 'My Data' },
      { id: '5.5', label: 'All Data' },

    ]},
    // { id: '3.5', label: 'Incoming Task' },
    { id: '3.6', label: 'Register Device'},
    { id: '4.1', label: 'Preventive Maintenance', children: [
      { id: '4.3', label: 'Maintenance Log' },
      { id: '4.2', label: 'Device Record' },
    ]},
      { id: '5.1', label: 'Office Request' },
      { id: '5.2', label: 'Support Request' },
      { id: '5.3', label: 'Monitoring' },
      { id: '3.5', label: 'Task' },
  ];

  // CURRENT USER ACCOUNT INFORMATION
  myAccountForm: FormGroup;
  divisions: any[] = [];
  allDivs: any[] = [];
  offices: any[] = [];
  passwordForm: FormGroup;
  selectedPermissions: string[] = [];
  editableSelectedPerms: string[] =[];
  showCurrentPassword: boolean = false;
  showNewPassword: boolean = false;
  showConfirmPassword: boolean = false;

  // MANAGE ALL USER INFORMATION
  users: any[] = [];
  isAddUserModalOpen = false;
  isAddPersonnelModalOpen = false;
  addUserForm!: FormGroup;
  addPersonnelForm!: FormGroup;
  isUserEditModalOpen = false;
  selectedUser: any = null;
  selectedAddUserPermissions: string[] = [];

  // MANAGE OFFICE AND DIVISIONS
  isModalOpen = false; 
  departments: any[] = [];
  officeName: string = '';
  officeValue: string = '';
  divisionName: string = '';
  selectedDivision: any = null;
  selectedOfficeId: number | null = null;

  isEditModalOpen = false; 
  isDivisionModalOpen = false;
  selectedOffice: any = null; // SAVE EDIT OFFICE 

  currentDeptPage: number = 1; 
  rowsPerDeptPage: number = 5; 
  currentDivPage: number = 1; 
  rowsPerDivPage: number = 5;

  currentPage: number = 1; 
  rowsPerPage: number = 5; 

  constructor(
    private fb: FormBuilder, 
    private userSettingService: UserSettingsService, 
    private router: Router, 
    private toast: SnackBarService,
    // private notificationService: NotificationService
  ) {
    this.myAccountForm = this.fb.group({
      idNumber: [{ value: '', disabled: true }],
      name: ['', [Validators.required]],
      designation: ['', Validators.required],
      office: ['', Validators.required],
      division: ['', Validators.required],
    });
    this.addUserForm = this.fb.group({
      id_number: ['', Validators.required],
      name: ['', Validators.required],
      password: ['', Validators.required],
      designation: ['', Validators.required],
      division: ['', Validators.required],
      office: ['', Validators.required]
    });
    this.passwordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required, Validators.minLength(6)]],
    });
    this.addPersonnelForm = this.fb.group({
      personnel_id: ['', Validators.required],
      personnel_name: ['', Validators.required],
      division: ['', Validators.required],
    });
  }

  ngOnInit(): void {
      // CURRENT USER INFORMATION
      this.loadUserInfo();
      this.loadOffices();
      this.loadUsers();
      this.fetchPermissions();
      this.fetchDepartments();
      this.fetchDivisions();

      this.userSettingService.getUserInfo().subscribe((response: any) => {
        if (response.status === 'success') {
          this.myAccountForm.patchValue({
            idNumber: response.data.id_number,
            name: response.data.name,
            designation: response.data.designation,
            office: response.data.office_id,
            division: response.data.division_id,
          });

          // Disable the idNumber control after setting the value
          this.myAccountForm.get('idNumber')?.disable();
        } else {
          alert('Failed to fetch user details');
        }
      });
      this.addUserForm = this.fb.group({
        id_number: ['', Validators.required],
        name: ['', Validators.required],
        password: ['', [
          Validators.required, 
          Validators.minLength(8),
          Validators.pattern(/^(?=.*[A-Z]).*$/)  // password criteria
        ]],
        designation: ['', Validators.required],
        division: ['', Validators.required],
        office: ['', Validators.required],
      });
     this.addPersonnelForm = this.fb.group({
       personnel_id: ['', Validators.required],
       personnel_name: ['', Validators.required],
       division: ['', Validators.required],
      });

  }
  // LOAD CURRENT USER INFORMATION
  loadUserInfo(): void {
    this.userSettingService.getUserInfo().subscribe((response: any) => {
      if (response.status === 'success') {
        this.myAccountForm.patchValue({
          idNumber: response.data.id_number,
          name: response.data.name,
          designation: response.data.designation,
          office: response.data.office_id,
          division: response.data.division_id,
        });
      this.loadDivisions(response.data.office_id);
      } else {
        alert('Failed to fetch user details');
      }
    });
  }
  // LOAD CURRENT USER OFFICE
  loadOffices(): void {
    this.userSettingService.getOffices().subscribe(
      (response: any) => {
        if (response.status === 'success') {
          this.offices = response.data;
        } else {
          // this.notificationService.showNotification('Failed to fetch offices', 'error');
          this.toast.show('Failed to fetch offices', 'error');
        }
      },
      (error) => console.error('Error fetching offices', error)
    );
  }
  // LOAD CURRENT USER DIVISION BASED ON OFFICE
  loadDivisions(officeId: number): void {
    this.userSettingService.getDivisions(officeId).subscribe(
      (response: any) => {
        if (response.status === 'success') {
          this.divisions = response.data;
        } else {
          // this.notificationService.showNotification('Failed to fetch divisions', 'error');
          this.toast.show('Failed to fetch divisions', 'error');
        }
      },
      (error) => console.error('Error fetching divisions', error)
    );
  }
  // HANDLE CHANGE IN OFFICE SELECTION
  onOfficeChange(event: any): void {
    const officeId = this.myAccountForm.get('office')?.value;
    this.loadDivisions(officeId); 
  }
  onEditOfficeChange(officeId: number): void {
    if (officeId) {
      this.userSettingService.getDivisions(officeId).subscribe({
        next: (response) => {
          if (response.status === 'success') {
            this.divisions = response.data;
          }
        },
        error: (error) => {
          console.error('Error fetching divisions:', error);
          this.divisions = [];
        }
      });
    } else {
      this.divisions = [];
    }
  }
  openEditUserModal(user: any): void {
    this.selectedUser = { ...user }; 
    this.isUserEditModalOpen = false; 
  
    if (this.selectedUser.office_id) {
      this.userSettingService.getDivisions(this.selectedUser.office_id).subscribe({
        next: (response) => {
          if (response.status === 'success') {
            this.divisions = response.data;
  
            this.isUserEditModalOpen = true;
          }
        },
        error: (error) => {
          console.error('Failed to load divisions:', error);
          this.divisions = [];
          this.isUserEditModalOpen = true;
        }
      });
    } else {
      this.divisions = [];
      this.isUserEditModalOpen = true;
    }
  }
  // SAVE CURRENT USER INFORMATION
  saveChanges(): void {
    if (this.myAccountForm.invalid) {
      // this.notificationService.showNotification('Please fill out all required fields.', 'error');
      this.toast.show('Please fill out all required fields.', 'error');
      return;
    }

    this.isSaving = true;
    const updatedData = this.myAccountForm.getRawValue();
    this.userSettingService.updateUserInfo(updatedData).subscribe(
      (response: any) => {
        this.isSaving = false;
        if (response.status === 'success') {
          // this.notificationService.showNotification('User information updated successfully.', 'success');
          this.toast.show('User information updated successfully.', 'success');
        } else {
          // this.notificationService.showNotification('Failed to update user information: ' ,'error', + response.message);
          this.toast.show('Failed to update user information: ' ,'error', + response.message);
        }
      },
      (error) => {
        this.isSaving = false;
        console.error('Error updating user information', error);
        // this.notificationService.showNotification('An error occurred while updating your information.', 'error');
        this.toast.show('An error occurred while updating your information.', 'error');
      }
    );
  }
  // OPEN CURRENT USER CHANGE PASS DIALOG
  openChangePasswordDialog(): void {
    this.isPasswordModalVisible = true;
  }
  // CLOSE CURRENT USER CHANGE PASS DIALOG
  closeChangePasswordDialog(): void {
    this.isPasswordModalVisible = false;
  }
  // SAVE NEW PASS FOR CURRENT USER AND PERMISSION BASED USER
  changePassword(): void {
    const { currentPassword, newPassword, confirmPassword } = this.passwordForm.value;

    if (newPassword !== confirmPassword) {
      // this.notificationService.showNotification('Password do not match.', 'error');
      this.toast.show('Password do not match.', 'error');
      return;
    }

    this.isChangingPassword = true;
    this.userSettingService.changePassword({ current_password: currentPassword, new_password: newPassword }).subscribe(
      (response: any) => {
        this.isChangingPassword = false;
        if (response.status === 'success') {
          // this.notificationService.showNotification('Password updated successfully.', 'success');
          this.toast.show('Password updated successfully.', 'success');
          this.closeChangePasswordDialog();
          this.passwordForm.reset();
        } else {
          // this.notificationService.showNotification('Failed to update user password: ', 'error', + response.message);
          this.toast.show('Failed to update user password: ', 'error', + response.message);
        }
      },
      (error) => {
        this.isChangingPassword = false;
        console.error('Error changing password', error);
        // this.notificationService.showNotification('An error occurred while updating your password.', 'error');
        this.toast.show('An error occurred while updating your password.', 'error');
      }
    );
  }
  // FETCH CURRENT USER PERMS AND SHOW SETTING PERMS BASED
  fetchPermissions(): void {
    this.userSettingService.getUserPermissions().subscribe(
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
          this.showEditDepartmentBtn = this.selectedPermissions.includes('3.3');

        } else {
          alert('Failed to fetch permissions.');
        }
      },
      (error) => {
        console.error('Error fetching permissions', error);
      }
    );
  }
  // OPEN CURRENT USER PERMS DIALOG
  openPermissionsDialog(): void {
    this.isPermissionsModalVisible = true;
  }
  // CLOSE CURRENT USER PERMS DIALOG
  closePermissionsDialog(): void {
    this.isPermissionsModalVisible = false;
  }
  // CURRENT USER TOGGLE PERMS
  togglePermission(permission: string, children?: { id: string }[]): void {
    const index = this.selectedPermissions.indexOf(permission);

    if (index > -1) {
      this.selectedPermissions.splice(index, 1);

      if (children) {
        children.forEach(child => {
          const childIndex = this.selectedPermissions.indexOf(child.id);
          if (childIndex > -1) {
            this.selectedPermissions.splice(childIndex, 1);
          }
        });
      }
    } else {
      this.selectedPermissions.push(permission);

      if (children) {
        children.forEach(child => {
          if (!this.selectedPermissions.includes(child.id)) {
            this.selectedPermissions.push(child.id);
          }
        });
      }

      const parent = this.allPermissions.find(p => p.children?.some(child => child.id === permission));
      if (parent && !this.selectedPermissions.includes(parent.id)) {
        this.selectedPermissions.push(parent.id);
      }
    }
  }
  // SAVE CURRENT USER PERMS
  savePermissions(): void {
    this.isAddingPerms = true;
    this.userSettingService.updateUserPermissions(this.selectedPermissions).subscribe(
      (response: any) => {
        if (response.status === 'success') {
          this.isAddingPerms = false;
          // this.notificationService.showNotification('Permissions updated successfully.', 'success');
          // this.notificationService.showNotification('Re-login, to see your changes.', 'info');
          this.toast.show('Permissions updated successfully.', 'success');
          this.toast.show('Re-login, to see your changes.', 'info');
          this.closePermissionsDialog();
        } else {
          this.isAddingPerms = false;
          // this.notificationService.showNotification('Failed to permissions update successfully.', 'error');
          this.toast.show('Failed to permissions update successfully.', 'error');
        }
      },
      (error) => {
        this.isAddingPerms = false;
        // this.notificationService.showNotification('Error updating permissions.', 'error');
        this.toast.show('Error updating permissions.', 'error');
      }
    );
  }

//////////// FETCH ALL USER DATA
  loadUsers(): void {
    this.userSettingService.getUsers().subscribe(
      (response: any) => {
        if (response.status === 'success') {
          this.users = response.data;
        } else {
          // this.notificationService.showNotification('Failed to fetch users', 'error');
          this.toast.show('Failed to fetch users', 'error');
          console.error('Failed to fetch users');
        }
      },
      (error) => console.error('Error fetching users', error),
      () => {
      }
    );
  }
  // HANDLE CHANGE IN OFFICE SELECTION (For Add User Modal)
  onAddUserOfficeChange(event: any): void {
    const officeId = this.addUserForm.get('office')?.value;
    this.loadDivisionsForAddUser(officeId); 
  }

  loadDivisionsForAddUser(officeId: number): void {
    this.userSettingService.getDivisions(officeId).subscribe(
      (response: any) => {
        if (response.status === 'success') {
          this.divisions = response.data;
        } else {
          // this.notificationService.showNotification('Failed to fetch divisions', 'error');
          this.toast.show('Failed to fetch divisions', 'error');
        }
      },
      (error) => console.error('Error fetching divisions', error)
    );
  }

  toggleAddUserPermission(id: string, children: any[] = []) {
    const index = this.selectedAddUserPermissions.indexOf(id);
  
    if (index > -1) {
      this.selectedAddUserPermissions.splice(index, 1);
  
      if (children.length) {
        children.forEach(child => {
          const childIndex = this.selectedAddUserPermissions.indexOf(child.id);
          if (childIndex > -1) {
            this.selectedAddUserPermissions.splice(childIndex, 1);
          }
        });
      }
    } else {
      this.selectedAddUserPermissions.push(id);
  
      if (children.length) {
        children.forEach(child => {
          if (!this.selectedAddUserPermissions.includes(child.id)) {
            this.selectedAddUserPermissions.push(child.id);
          }
        });
      }
  
      const parent = this.allPermissions.find(p =>
        p.children?.some(child => child.id === id)
      );
      if (parent && !this.selectedAddUserPermissions.includes(parent.id)) {
        this.selectedAddUserPermissions.push(parent.id);
      }
    }
  }
  // FETCH SELECTED USER PERMS
  fetchPermissionsForSelectedUser(userId: string): void {
    this.isLoadingPermissions = true;
    this.userSettingService.getUserPermissionsById(userId).subscribe(
      (response: any) => {
        if (response.status === 'success') {
          this.editableSelectedPerms = response.permissions || [];
        } else {
          alert('Failed to fetch permissions.');
        }
        this.isLoadingPermissions = false;
      },
      (error) => {
        console.error('Error fetching permissions', error);
        this.isLoadingPermissions = false;
      }
    );
  }
  // TOGGLE SELECTED USER PERMS
  toggleSelectedUserPermission(permission: string, children?: { id: string }[]): void {
    const index = this.editableSelectedPerms.indexOf(permission);

    if (index > -1) {
      this.editableSelectedPerms.splice(index, 1);

      if (children) {
        children.forEach(child => {
          const childIndex = this.editableSelectedPerms.indexOf(child.id);
          if (childIndex > -1) {
            this.editableSelectedPerms.splice(childIndex, 1);
          }
        });
      }
    } else {
      this.editableSelectedPerms.push(permission);

      if (children) {
        children.forEach(child => {
          if (!this.editableSelectedPerms.includes(child.id)) {
            this.editableSelectedPerms.push(child.id);
          }
        });
      }

      const parent = this.allPermissions.find(p => p.children?.some(child => child.id === permission));
      if (parent && !this.editableSelectedPerms.includes(parent.id)) {
        this.editableSelectedPerms.push(parent.id);
      }
    }
  }
  // OPEN ADD USER DIALOG
  openAddUserModal() {
    this.isAddUserModalOpen = true;
  }
  // OPEN ADD TECHNICAL DIALOG
  openAddPersonnelModal() {
    this.isAddPersonnelModalOpen = true;
  }
  // CLOSE ADD USER DIALOG
  closeAddUserModal() {
    this.isAddUserModalOpen = false;
  }
  // CLOSE ADD TECHNICAL DIALOG
  closeAddPersonnelModal() {
    this.isAddPersonnelModalOpen = false;
  }
  // SAVE NEW USER
  registerUser(): void {
    if (this.addUserForm.invalid) {
      this.addUserForm.markAllAsTouched();
      return;
    }
    const formData = this.addUserForm.value;
    const userData = {
      id_number: formData.id_number,
      name: formData.name,
      password: formData.password,
      designation: formData.designation,
      division: formData.division,
      office: formData.office,
      permissions: JSON.stringify(this.selectedAddUserPermissions) 
    };
    this.isRegistering = true;
    this.userSettingService.register(userData).subscribe({
      next: (response) => {
        if (response.status === 'success') {
          this.isRegistering = false;
          // this.notificationService.showNotification('User registered successfully.', 'success');
          this.toast.show('User registered successfully.', 'success');
          this.selectedAddUserPermissions = [];
          this.addUserForm.reset();
          this.closeAddUserModal();
          setTimeout(() => {
            window.location.reload();
          }, 1500);
        } else {
          console.error('Failed to register user:', response.messages);
          this.isRegistering = false;
          // this.notificationService.showNotification('User registration failed. ' ,'error', + response.message);
          this.toast.show('User registration failed. ' ,'error', + response.message);
         }
      },
      error: (err) => {
        this.isRegistering = false;
        // this.notificationService.showNotification('Please fill out all required fields.', 'error');
        this.toast.show('Please fill out all required fields.', 'error');
       }
    });
  }
  // OPEN EDIT SELECTED USER DIALOG
  openUserEditModal(user: any) {
    this.selectedUser = { ...user };
    this.isUserEditModalOpen = true;
    this.fetchPermissionsForSelectedUser(user.id_number);  
  }
  // CLOSE EDIT SELECTED USER DIALOG
  closeUserEditModal() {
    this.isUserEditModalOpen = false;
  }
  // SAVE CHANGES FOR EDIT USER
  updateUser(): void {
    if (this.selectedUser && this.selectedUser.name.trim()) {
      this.selectedUser.permissions = this.editableSelectedPerms;
  
      this.isChangingPassword = true;
  
      const updatePayload = {
        id_number: this.selectedUser.id_number,
        name: this.selectedUser.name,
        designation: this.selectedUser.designation,
        office_id: this.selectedUser.office_id,
        division_id: this.selectedUser.division_id,
        permissions: this.editableSelectedPerms
      };
  
      this.userSettingService.updateUser(updatePayload).subscribe(
        (response: any) => {
          if (response.status === 'success') {
            // this.notificationService.showNotification('User information saved successfully', 'success');
            this.toast.show('User information saved successfully', 'success');
            this.closeUserEditModal();
          } else {
            // this.notificationService.showNotification(`Failed to update user: ${response.message}`, 'error');
            this.toast.show(`Failed to update user: ${response.message}`, 'error');
          }
        },
        (error) => {
          console.error('Error updating user:', error);
          // this.notificationService.showNotification('An error occurred while updating user', 'error');
          this.toast.show('An error occurred while updating user', 'error');
        },
        () => {
          this.isChangingPassword = false;
        }
      );
    } else {
      // this.notificationService.showNotification('Please enter a valid user', 'error');
      this.toast.show('Please enter a valid user', 'error');
    }
  }
  // SAVE NEW TECHNICAL SUPP
  saveAsPersonnel(): void {
    if (this.addPersonnelForm.valid) {
      const formData = this.addPersonnelForm.value;
      const selectedDivision = this.divisions.find(
        (division) => division.division_id === formData.division
      );

      if (!selectedDivision) {
        // this.notificationService.showNotification('Invalid division selected.', 'error');
        this.toast.show('Invalid division selected.', 'error');
        return;
      }

      this.isAddingPersonnel = true;
      const personnelData = {
        personnel_id: formData.personnel_id, 
        personnel_name: formData.personnel_name, 
        division_id: formData.division,  
        division_name: selectedDivision.division_name, 
      };

      this.userSettingService.savePersonnel(personnelData).subscribe(
        (response: any) => {
          if (response.status === 'success') {
            this.isAddingPersonnel = false;
            // this.notificationService.showNotification('Personnel has been added!', 'success');
            this.toast.show('Personnel has been added!', 'success');
            this.addPersonnelForm.reset();
            this.closeAddPersonnelModal();
            setTimeout(() => {
              window.location.reload();
            }, 1500);
          } else {
            this.isAddingPersonnel = false;
            // this.notificationService.showNotification('Failed to save personnel.', 'error');
            this.toast.show('Failed to save personnel.', 'error');
          }
        },
        (error) => {
          this.isAddingPersonnel = false;
          console.error('Error saving personnel:', error);
          // this.notificationService.showNotification('An error occured while saving personnel ' ,'error');
          this.toast.show('An error occured while saving personnel ' ,'error');
        }
      );
    } else {
      this.isAddingPersonnel = false;
      // this.notificationService.showNotification('Please fill out all required fields.', 'error');
      this.toast.show('Please fill out all required fields.', 'error');
    }
  }

  // Toggle user active/inactive status
  updateUserStatus(user: any, newStatus: number): void {
    const action = newStatus === 1 ? 'activate' : 'deactivate';

    if (confirm(`Are you sure you want to ${action} this user?`)) {
      this.isChangingPassword = true; 

      this.userSettingService.updateUserStatus(user.id_number, newStatus).subscribe(
        (response: any) => {
          this.isChangingPassword = false;
          if (response.status === 'success') {
            user.isActive = newStatus;
            this.toast.show(`User ${action}d successfully!`, 'success');
          } else {
            this.toast.show(`Failed to ${action} user: ${response.message}`, 'error');
          }
        },
        (error) => {
          this.isChangingPassword = false;
          console.error(`Error ${action}ing user:`, error);
          this.toast.show(`An error occurred while ${action}ing user`, 'error');
        }
      );
    }
  }

  //////////// FETCH ALL OFFICE AND DIVISIONS
  fetchDepartments(): void {
    this.isLoadingFetch = true;
    this.userSettingService.getAllOffices().subscribe(
      (response: any) => {
        if (response.status === 'success') {
          this.departments = response.data;
        } else {
          console.error('Failed to fetch office');
        }
      },
      (error) => {
        console.error('Error fetching offices:', error);
      },
      () => {
        this.isLoadingFetch = false;
      }
    );
  }
  fetchDivisions(): void {
    this.isLoadingFetch = true;
    this.userSettingService.fetchDivisions().subscribe(
      (response: any) => {
        if (response.status === 'success') {
          this.allDivs = response.data;
          console.log('Divisions fetched:', this.allDivs);
        } else {
          console.error('Failed to fetch division');
        }
      },
      (error) => {
        console.error('Error fetching divisions:', error);
      },
      () => {
        this.isLoadingFetch = false;
      }
    );
  }  
  // for editing division
  loadDivisionsForOffice(officeId: number): void {
    this.userSettingService.fetchEditDiv(officeId).subscribe(
      (response: any) => {
        if (response.status === 'success') {
          this.allDivs = response.data;
        } else {
          // this.notificationService.showNotification('Failed to fetch divisions', 'error');
          this.toast.show('Failed to fetch divisions', 'error');
        }
      },
      (error) => {
        console.error('Error fetching divisions', error);
        // this.notificationService.showNotification('Error loading divisions', 'error');
        this.toast.show('Error loading divisions', 'error');
      }
    );
  }
  // Filter divisions by office_id
  getDivisionsByOfficeId(officeId: number): any[] {
    return this.allDivs.filter(d => Number(d.office_id) === Number(officeId));
  }
  // OPEN ADD OFFICE DIALOG
  openModal() {
    this.isModalOpen = true;
  }
  // CLOSE ADD OFFICE DIALOG
  closeModal() {
    this.isModalOpen = false;
  }
  openAddDivisionModal() {
    this.isDivisionModalOpen = true;
  }
  // Method to close the "Add Division" modal
  closeAddDivisionModal() {
    this.isDivisionModalOpen = false;
  }
  // SAVE OFFICE
  addOffice(): void {
    if (this.officeName.trim() && this.officeValue.trim()) {
      this.isChangingPassword = true; 
      const officeData = {
        office_name: this.officeName.toUpperCase(),
        office_value: this.officeValue  
      };

      this.userSettingService.addOffice(officeData).subscribe(
        (response: any) => {
          if (response.status === 'success') {
            // this.notificationService.showNotification('Office has been added!', 'success');
            this.toast.show('Office has been added!', 'success');
            this.officeName = ''; 
            this.officeValue = ''; 
            this.fetchDepartments(); 
            this.closeModal();
          } else if (response.message === 'Office already exists.') {
            // this.notificationService.showNotification('Office already exists.', 'error');
            this.toast.show('Office already exists.', 'error');
          } else {
            // this.notificationService.showNotification(`Failed to add office: ${response.message}`, 'error');
            this.toast.show(`Failed to add office: ${response.message}`, 'error');
          }
        },
        (error) => {
          console.error('Error adding office:', error);
          // this.notificationService.showNotification('An error occurred while adding office', 'error');
          this.toast.show('An error occurred while adding office', 'error');
        },
        () => {
          this.isChangingPassword = false;
        }
      );
    } else {
      // this.notificationService.showNotification('Please fill in both office name and value', 'error');
      this.toast.show('Please fill in both office name and value', 'error');
    }
  }
  addDivision(): void {
    if (this.divisionName.trim() && this.selectedOfficeId) {
      this.isChangingPassword = true; 
      const divisionData = {
        division_name: this.divisionName.toUpperCase(), 
        office_id: this.selectedOfficeId,  
      };
  
      this.userSettingService.addDivision(divisionData).subscribe(
        (response: any) => {
          if (response.status === 'success') {
            // this.notificationService.showNotification('Division has been added!', 'success');
            this.toast.show('Division has been added!', 'success');
            this.divisionName = ''; 
            this.closeAddDivisionModal();
          } else if (response.message === 'Division already exists.') {
            // this.notificationService.showNotification('Division already exists.', 'error');
            this.toast.show('Division already exists.', 'error');
          } else {
            // this.notificationService.showNotification(`Failed to add division: ${response.message}`, 'error');
            this.toast.show(`Failed to add division: ${response.message}`, 'error');
          }
        },
        (error) => {
          console.error('Error adding division:', error);
          // this.notificationService.showNotification('An error occurred while adding division', 'error');
          this.toast.show('An error occurred while adding division', 'error');
        },
        () => {
          this.isChangingPassword = false; 
        }
      );
    } else {
      // this.notificationService.showNotification('Please fill in the division name and select an office', 'error');
      this.toast.show('Please fill in the division name and select an office', 'error');
    }
  }
  // edit office
  openEditModal(office: any) {
    this.selectedOffice = { ...office };
    
    this.loadDivisionsForOffice(office.office_id);
  
    const selectedDivision = this.allDivs.find(div => div.division_id === office.selectedDivisionId);
    if (selectedDivision) {
      this.selectedOffice.selectedDivisionName = selectedDivision.division_name;
    } else {
      this.selectedOffice.selectedDivisionName = ''; 
    }
  
    this.isEditModalOpen = true;
  }
  // close edit office
  closeEditModal() {
    this.selectedOffice = null;
    this.isEditModalOpen = false;
  }
  // save edit office
updateOffice(): void {
  const hasDivisionName = !!this.selectedOffice.selectedDivisionName?.trim();

  if (this.selectedOffice && this.selectedOffice.office_name.trim() && this.selectedOffice.office_value.trim()) {
    // Capitalize the first letter of each word (title case)
    this.selectedOffice.office_name = this.toTitleCase(this.selectedOffice.office_name);
    this.selectedOffice.office_value = this.toTitleCase(this.selectedOffice.office_value);

    this.isChangingPassword = true;

    const handleOfficeUpdate = () => {
      this.userSettingService.updateOffice(this.selectedOffice).subscribe(
        (response: any) => {
          if (response.status === 'success') {
            // this.notificationService.showNotification('Office updated successfully!', 'success');
            this.toast.show('Office updated successfully!', 'success');
            this.closeEditModal();
          } else {
            // this.notificationService.showNotification(`Failed to update office: ${response.message}`, 'error');
            this.toast.show(`Failed to update office: ${response.message}`, 'error');
          }
          this.isChangingPassword = false;
        },
        (error) => {
          console.error('Error updating office:', error);
          // this.notificationService.showNotification('Error updating office', 'error');
          this.toast.show('Error updating office', 'error');
          this.isChangingPassword = false;
        }
      );
    };

    if (hasDivisionName) {
      this.userSettingService.updateDivisionName(this.selectedOffice.selectedDivisionId, this.selectedOffice.selectedDivisionName).subscribe(
        divisionResponse => {
          handleOfficeUpdate(); 
        },
        (error) => {
          console.error('Error updating division:', error);
          // this.notificationService.showNotification('Error updating division', 'error');
          this.toast.show('Error updating division', 'error');
          this.isChangingPassword = false;
        }
      );
    } else {
      handleOfficeUpdate();
    }
  } else {
    // this.notificationService.showNotification('Please enter valid office name and acronym', 'error');
    this.toast.show('Please enter valid office name and acronym', 'error');
  }
}

// Helper method to convert to title case (capitalize first letter of each word)
private toTitleCase(str: string): string {
  if (!str) return str;
  return str.toLowerCase().split(' ').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
}
  // Method to handle pagination
  getPaginatedUsers(): any[] {
    const startIndex = (this.currentPage - 1) * this.rowsPerPage;
    return this.users.slice(startIndex, startIndex + this.rowsPerPage);
  }
  changePage(direction: string): void {
    if (direction === 'next' && (this.currentPage * this.rowsPerPage) < this.users.length) {
      this.currentPage++;
    } else if (direction === 'prev' && this.currentPage > 1) {
      this.currentPage--;
    }
  }
  // pagination office
  getPaginatedOffices(): any[] {
    const startIndex = (this.currentDeptPage - 1) * this.rowsPerDeptPage;
    return this.departments.slice(startIndex, startIndex + this.rowsPerDeptPage);
  }
  // pagination office
  changeDeptPage(direction: string): void {
    if (direction === 'next' && (this.currentDeptPage * this.rowsPerDeptPage) < this.departments.length) {
      this.currentDeptPage++;
    } else if (direction === 'prev' && this.currentDeptPage > 1) {
      this.currentDeptPage--;
    }
  }
  // pagination division
  getPaginatedDivisions(): any[] {
    const startIndex = (this.currentDivPage - 1) * this.rowsPerDivPage;
    return this.divisions.slice(startIndex, startIndex + this.rowsPerDivPage);
  }
  // pagination division
  changeDivPage(direction: string): void {
    if (direction === 'next' && (this.currentDivPage * this.rowsPerDivPage) < this.divisions.length) {
      this.currentDivPage++;
    } else if (direction === 'prev' && this.currentDivPage > 1) {
      this.currentDivPage--;
    }
  }
}
