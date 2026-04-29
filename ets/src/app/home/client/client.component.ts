import { Component } from '@angular/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { RequestDialogComponent } from './request-dialog/request-dialog.component';
import { CommonModule } from '@angular/common';
import { FormsModule, FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { RouterOutlet, Router, ActivatedRoute } from '@angular/router';
import { ClientService } from '../../services/client.service';
import JsBarcode from 'jsbarcode';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { HttpEvent, HttpHandler, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SnackBarService } from '../../services/snackbar.service';
import { PreviewTicketStatusDialogComponent } from './preview-ticket-status-dialog/preview-ticket-status-dialog.component';

@Component({
  selector: 'app-client',
  standalone: true,
  imports: [
    FormsModule, 
    RouterOutlet, 
    ReactiveFormsModule, 
    CommonModule, 
    MatProgressBarModule, 
    MatDialogModule,
  ],
  templateUrl: './client.component.html',
  styleUrl: './client.component.css'
})
export class ClientComponent {
  showPassword: boolean = false;
  loginForm: FormGroup;
  errorMessage: string = '';

  search_box!: string
  searchResults: any[] = []; // Store fetched data

  isViewDialogOpen: boolean = false;
  selectedReport: any = null;

  isLoginLoading: boolean = false; // loading state for login
  isSearchLoading: boolean = false; // loading state for search
  error: string = '';
  
  showLoginOnMobile = false;
  isMobile = false;

  constructor(
    public dialog: MatDialog,
    private fb: FormBuilder,
    private authService: AuthService,
    private clientService: ClientService,
    private toast: SnackBarService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      id_number: ['', Validators.required],
      password: ['', Validators.required],
    });
    
  }

  ngOnInit(): void {
    this.isMobile = window.innerWidth <= 480;
    // 🔹 Read search from URL
    this.route.queryParams.subscribe(params => {
      const search = params['search'];

      if (search) {
        this.search_box = search;   
        this.onSearch(false);      
      }
    });
  }

  toggleLoginSection(): void {
    this.showLoginOnMobile = !this.showLoginOnMobile;
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }
  onLogin(): void {
    if (this.loginForm.invalid) {
      this.toast.show('Please fill out all required fields.', 'error');
      return;
    }

    this.isLoginLoading = true;

    this.authService.login(this.loginForm.value).subscribe(
      (response: any) => {
        this.isLoginLoading = false;

        if (response.status === 'success') {
          this.toast.show('Login Successful!', 'success');

          this.authService.getPermissionsAndRedirect().subscribe(() => {
          });
        } else {
          this.toast.show(response.message, 'error');
        }
      },
      (error) => {
        this.isLoginLoading = false;
        this.toast.show('An error occurred. Please try again later.', 'error');
      }
    );
  }
 
  openRequestDialog(): void {
    this.dialog.open(RequestDialogComponent, {
      width: '800px',
      height: '810px' 
    });
  }

  onSearch(updateUrl: boolean = true): void {
    const trimmed = (this.search_box || '').trim();

    if (!trimmed) {
      this.searchResults = [];
      this.error = '';
      this.router.navigate([], { queryParams: {} });
      return;
    }

    // 🔹 Update URL (only when user triggers search)
    if (updateUrl) {
      this.router.navigate([], {
        queryParams: { search: trimmed },
        queryParamsHandling: 'merge'
      });
    }

    this.isSearchLoading = true;
    this.error = '';

    this.clientService.getServiceReport(trimmed).subscribe(
      (response: any) => {
        this.isSearchLoading = false;

        if (response.status === 'success') {
          this.searchResults = response.data;
        } else {
          this.searchResults = [];
          this.error = response.message;
        }
      },
      () => {
        this.isSearchLoading = false;
        this.error = 'An error occurred while fetching data.';
      }
    );
  }

  // openViewDialog(report: any): void {
  //   this.selectedReport = report;
  //   this.isViewDialogOpen = true;

  //   setTimeout(() => {
  //     if (this.selectedReport.control_no) {
  //       JsBarcode("#barcode", this.selectedReport.control_no, {
  //         format: "CODE128",
  //         lineColor: "#000",
  //         width: 2,
  //         height: 50,
  //         displayValue: true
  //       });
  //     }
  //   });
  // }
  openViewDialog(report: any): void {
    this.dialog.open(PreviewTicketStatusDialogComponent, {
      data: report,
      width: '1200px',
      maxWidth: '95vw',
      maxHeight: '90vh',
    });
  }

  closeViewDialog(): void {
    this.isViewDialogOpen = false;
    this.selectedReport = null;
  }
  // HTTP interceptor to attach the token to each request
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.authService.getAuthToken();
    if (token) {
      req = req.clone({
        headers: req.headers.set('Authorization', `Bearer ${token}`)
      });
    }
    return next.handle(req);
  }

}
