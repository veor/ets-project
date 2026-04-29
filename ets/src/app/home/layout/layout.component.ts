import { Component, HostListener } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { NavbarComponent } from './navbar/navbar.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    NavbarComponent,
    SidebarComponent,
    CommonModule
  ],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.css'
})
export class LayoutComponent {
  isSidebarOpen = true;
  isLoading: boolean = false;
  userInfo: any = {
    name: '',
    permissions: [] 
  };

  // Permission flags
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

  private previousWidth: number = window.innerWidth;

  constructor(
    private authService: AuthService, 
    private router: Router
  ) {}

  ngOnInit(): void {
    this.checkScreenSize();

    this.isLoading = true;
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

  @HostListener('window:resize')
  onResize() {
    this.checkScreenSize();
  }

  private checkScreenSize() {
    const currentWidth = window.innerWidth;
    const wasMobile = this.previousWidth <= 768;
    const isNowDesktop = currentWidth > 768;
    
    // If transitioning from mobile to desktop, always open the sidebar
    if (wasMobile && isNowDesktop) {
      this.isSidebarOpen = true;
    }
    // If on desktop/tablet, ensure sidebar is open by default
    else if (currentWidth > 768 && !this.isSidebarOpen) {
      this.isSidebarOpen = true;
    }
    
    this.previousWidth = currentWidth;
  }
}
