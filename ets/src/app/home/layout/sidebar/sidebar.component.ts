import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule
  ],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})

export class SidebarComponent {
  isLoading: boolean = false;
  userInfo: any = {
    name: '',
    permissions: [] 
  };

  // Permission flags
  showDashboard: boolean = false;
  showRegisterDevice: boolean = false;
  showPM: boolean = false;
  showDeviceRecord: boolean = false;
  showMaintenanceLog: boolean = false;
  showOfficeRequest: boolean = false;
  allowedToAcceptRequest: boolean = false;
  showSupportRequest: boolean = false;
  showMonitor: boolean = false;
  showTask: boolean = false;

constructor(
  private router: Router,
  private authService: AuthService,
) {
  this.router.events.subscribe(() => {
    if (window.innerWidth <= 768) {
      this.isOpen = false;
    }
  });
}

  ngOnInit(): void {
    this.isLoading = true;
    this.authService.getUserPerms().subscribe(
      (response: any) => {
        if (response.status === 'success') {
          this.isLoading = false;
          this.userInfo = response.data;
          this.userInfo.permissions = response.data.permissions || [];
          // Evaluate permissions
          this.showDashboard = this.authService.hasPermission('3.4');
          this.showRegisterDevice = this.authService.hasPermission('3.6'),
          this.showPM = this.authService.hasPermission('4.1');
          this.showDeviceRecord = this.authService.hasPermission('4.2');
          this.showMaintenanceLog = this.authService.hasPermission('4.3');
          this.showOfficeRequest = this.authService.hasPermission('5.1');
          this.allowedToAcceptRequest = this.authService.hasPermission('5.6');
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

  @Input() isOpen: boolean = true;

  pmOpen = false;

  togglePM(): void {
    this.pmOpen = !this.pmOpen;
  }
}
