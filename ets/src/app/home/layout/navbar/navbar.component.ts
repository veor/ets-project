import { CommonModule } from '@angular/common';
import { Component, EventEmitter, HostListener, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { ChangePasswordDialogComponent } from '../../change-password-dialog/change-password-dialog.component';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule
  ],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit{
  @Output() menuToggle = new EventEmitter<void>();

  userInfo: any = {
    name: '',
    permissions: [] 
  };

  isLoading: boolean = false;
  isLoggingOut: boolean = false; 

  isUserMenuOpen = false;
  isMenuOpen = false;
  isDarkMode = false;

  showSettings: boolean = false;
  showChangePassword: boolean = false;
  showDashboard: boolean = false;
  showRegisterDevice: boolean = false;
  // showIncomingTask: boolean = false;
  showPM: boolean = false;
  showDeviceRecord: boolean = false;
  showMaintenanceLog: boolean = false;

  showOfficeRequest: boolean = false;
  showSupportRequest: boolean = false;
  showMonitor: boolean = false;
  showTask: boolean = false;

  constructor(private authService: AuthService, 
    private dialog: MatDialog, 
    private router: Router
  ) {}

  ngOnInit(): void {
    this.isLoading = true;

    this.isDarkMode = localStorage.getItem('theme') === 'dark';
    this.applyTheme();

    this.authService.getUserPerms().subscribe(
      (response: any) => {
        if (response.status === 'success') {
          this.isLoading = false;
          this.userInfo = response.data;
          this.userInfo.permissions = response.data.permissions || [];
          // Evaluate permissions
          this.showChangePassword = this.authService.hasPermission('1.1');
          this.showSettings = this.authService.hasPermission('2.1');
          this.showDashboard = this.authService.hasPermission('3.4');
          this.showRegisterDevice = this.authService.hasPermission('3.6'),
          // this.showIncomingTask = this.authService.hasPermission('3.5');
          this.showPM = this.authService.hasPermission('4.1');
          this.showDeviceRecord = this.authService.hasPermission('4.2');
          this.showMaintenanceLog = this.authService.hasPermission('4.3');

          this.showOfficeRequest = this.authService.hasPermission('5.1');
          this.showSupportRequest = this.authService.hasPermission('5.2');
          this.showMonitor = this.authService.hasPermission('5.3');
          this.showTask = this.authService.hasPermission('3.5');


        } else {
          console.error('Failed to retrieve user info');
        }
      },
      (error) => {
        console.error('Error fetching user info', error);
      }
    );
  }

  // toggleMenu(): void {
  //   this.isMenuOpen = !this.isMenuOpen;
  // }
toggleMenu(): void {
  this.menuToggle.emit();
}

  toggleUserMenu(): void {
    this.isUserMenuOpen = !this.isUserMenuOpen;
  }

  toggleTheme(): void {
    this.isDarkMode = !this.isDarkMode;
    localStorage.setItem('theme', this.isDarkMode ? 'dark' : 'light');
    this.applyTheme();
  }

  private applyTheme(): void {
    document.body.classList.toggle('dark-mode', this.isDarkMode);
  }

  logout(): void {
    this.isLoggingOut = true; 
    this.authService.logout().subscribe(
      (response) => {
        if (response.status === 'success') {
          this.isLoggingOut = false; 
          this.userInfo = null; 

          // Redirect to login page
          /* --- SSL --- */ 
          window.location.href = 'ets/client';
          /* --- PRODUCTION --- */
          // window.location.replace('/');
        } else {
          this.isLoggingOut = false; 
          console.error('Failed to log out:', response.message);
        }
      },
      (error) => {
        this.isLoggingOut = false; 
        console.error('Error logging out:', error);
      }
    );
  }

  // Close dropdown when clicking outside
  @HostListener('document:click', ['$event'])
  closeOnOutsideClick(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.user-menu')) {
      this.isUserMenuOpen = false;
    }
  }

  hasChangePasswordPermission(): boolean {
    return this.userInfo.permissions.includes('1') || 
    this.userInfo.permissions.includes('3.2') || 
    this.userInfo.permissions.includes('3.3')|| 
    this.userInfo.permissions.includes('5') || 
    this.userInfo.permissions.includes('5.1') || 
    this.userInfo.permissions.includes('5.2') || 
    this.userInfo.permissions.includes('5.3');
  }

  changePassword(): void {
    const dialogRef = this.dialog.open(ChangePasswordDialogComponent, {
      width: '400px',
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('Password changed successfully');
      }
    });
  }
}
