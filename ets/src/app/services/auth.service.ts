import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { catchError, map, Observable, of, tap, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment.development';

// --- PRODUCTION ---
// const API_URL = environment.apiUrl+'/etsbackend/';
// --- SSL ---
const API_URL = environment.apiUrl;

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly AUTH_TOKEN_KEY = 'authToken'; 
  private readonly USER_PERMISSIONS_KEY = 'permissions'; 
  private readonly USER_DATA_KEY = 'userData';
  private readonly TOKEN_EXPIRY_KEY = 'tokenExpiry';
  private userInfo: any = null;

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
      this.checkTokenExpiry();
  }
  setUserInfo(user: any) {
    this.userInfo = user;
  }
  getUserInfo() {
    return this.userInfo;
  }

  private getHttpOptions(): { headers: HttpHeaders } {
    const token = this.getAuthToken();
    return {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      })
    };
  }

  private handleError(error: HttpErrorResponse): Observable<any> {
    let errorMessage = 'An error occurred';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = error.error.message;
    } else {
      // Server-side error
      if (error.error && error.error.message) {
        errorMessage = error.error.message;
      } else if (error.status === 0) {
        errorMessage = 'Unable to connect to server';
      } else {
        errorMessage = `Server error: ${error.status}`;
      }
    }

    console.error('Auth Service Error:', errorMessage);
    return throwError(() => ({ status: 'error', message: errorMessage }));
  }

  isTokenExpired(token?: string): boolean {
    try {
      const tokenToCheck = token || this.getAuthToken();
      if (!tokenToCheck) return true;

      const payload = JSON.parse(atob(tokenToCheck.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      
      // 5 minute buffer before expiry
      return payload.exp < (currentTime + 300);
    } catch (error) {
      console.error('Error checking token expiry:', error);
      return true;
    }
  }

  private checkTokenExpiry(): void {
    const token = this.getAuthToken();
    if (token && this.isTokenExpired(token)) {
      console.log('Token expired, clearing auth data');
      this.clearAuthToken();
      this.router.navigate(['/login']);
    }
  }

  setAuthToken(token: string): void {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      localStorage.setItem(this.AUTH_TOKEN_KEY, token);
      localStorage.setItem(this.TOKEN_EXPIRY_KEY, payload.exp.toString());
    } catch (error) {
      console.error('Error storing auth token:', error);
    }
  }

  getAuthToken(): string | null {
    const token = localStorage.getItem(this.AUTH_TOKEN_KEY);
    if (token && this.isTokenExpired(token)) {
      this.clearAuthToken();
      return null;
    }
    return token;
  }

  setUserPermissions(permissions: string[]): void {
    localStorage.setItem(this.USER_PERMISSIONS_KEY, JSON.stringify(permissions));
  }

  setUserData(userData: any): void {
    localStorage.setItem(this.USER_DATA_KEY, JSON.stringify(userData));
  }

  getUserData(): any {
    const userData = localStorage.getItem(this.USER_DATA_KEY);
    return userData ? JSON.parse(userData) : null;
  }

  getCurrentUserPermissions(): Observable<string[]> {
    const permissions = JSON.parse(localStorage.getItem(this.USER_PERMISSIONS_KEY) || '[]');
    return of(permissions);
  }

  hasPermission(permission: string): boolean {
    const permissions = JSON.parse(localStorage.getItem(this.USER_PERMISSIONS_KEY) || '[]');
    return permissions.includes(permission);
  }

  isLoggedIn(): boolean {
    const token = this.getAuthToken();
    return !!token && !this.isTokenExpired(token);
  }

  isAuthenticated(): boolean {
    return this.isLoggedIn();
  }

  clearAuthToken(): void {
    localStorage.removeItem(this.AUTH_TOKEN_KEY);
    localStorage.removeItem(this.USER_PERMISSIONS_KEY);
    localStorage.removeItem(this.USER_DATA_KEY);
    localStorage.removeItem(this.TOKEN_EXPIRY_KEY);
  }

 login(userData: { id_number: string; password: string }): Observable<any> {
    // Validate input before sending
    if (!userData.id_number || !userData.password) {
      return throwError(() => ({ 
        status: 'fail', 
        message: 'ID number and password are required' 
      }));
    }

    return this.http.post(API_URL + '/auth/login', userData, this.getHttpOptions()).pipe(
    /* --- PRODUCTION --- */
    // return this.http.post(API_URL + 'auth/login', userData, this.getHttpOptions()).pipe(
      tap((response: any) => {
        if (response.status === 'success') {
          this.setAuthToken(response.token);
          this.setUserPermissions(response.permissions || []);
          this.setUserData(response.user || {});
          console.log('Login successful for user:', response.user?.id_number);
        }
      }),
      catchError(this.handleError.bind(this))
    );
  }

  logout(): Observable<any> {
    return this.http.post(API_URL + '/auth/logout', {}, this.getHttpOptions()).pipe(
    /* --- PRODUCTION */
    // return this.http.post(API_URL + 'auth/logout', {}, this.getHttpOptions()).pipe(
      tap(() => {
        console.log('Logout successful');
        this.clearAuthToken();
      }),
      catchError((error) => {
        // Clear token even if logout request fails
        this.clearAuthToken();
        return this.handleError(error);
      })
    );
  }

  validateToken(): Observable<any> {
    const token = this.getAuthToken();
    if (!token) {
      return throwError(() => ({ status: 'fail', message: 'No token available' }));
    }

    return this.http.post(API_URL + '/auth/validateToken', {}, this.getHttpOptions()).pipe(
    /* --- PRODUCTION --- */
    // return this.http.post(API_URL + 'auth/validateToken', {}, this.getHttpOptions()).pipe(
      catchError((error) => {
        if (error.status === 401 || error.status === 403) {
          this.clearAuthToken();
          this.router.navigate(['/login']);
        }
        return this.handleError(error);
      })
    );
  }

  changeUserPassword(currentPassword: string, newPassword: string): Observable<any> {
    const payload = { current_password: currentPassword, new_password: newPassword };
    return this.http.post<any>(API_URL + '/users/changePassword', payload, httpOptions);
    /* --- PRODUCTION --- */
    // return this.http.post<any>(API_URL + 'users/changePassword', payload, httpOptions);
  }

  // Get User Permissions service
  getUserPerms(): Observable<any> {
    return this.http.get(API_URL + '/auth/getUserPerms', httpOptions);
    /* --- PRODUCTION --- */
    // return this.http.get(API_URL + 'auth/getUserPerms', httpOptions);
  }

  // check user permission if supervisor then direct them accordingly 
  getPermissionsAndRedirect(): Observable<void> {
    return this.getUserPerms().pipe(
      map(response => {
        if (response.status === 'success') {
          const permissions = response.data.permissions;

          // if (permissions.includes('5.1')) {  User has permission, redirect to 'Office Request for Technicals'
          //   this.router.navigate(['authorize/office-request']);
          if (permissions.includes('3.4')) {  // User has permission, redirect to 'Dashboard for Technicals'
            this.router.navigate(['/dashboard']);
          } else if (permissions.includes('5.2')) { // User has permission, redirect to 'Support Request for All Office Reps or Heads'
            this.router.navigate(['authorize/support-request']);
          } else {
            // Default route, default page
            this.router.navigate(['/dashboard']);
          }
        }
      }),
      catchError((error) => {
        console.error('Error fetching user permissions', error);
        return of(undefined); 
      })
    );
  }

  refreshTokenIfNeeded(): Observable<boolean> {
    const token = this.getAuthToken();
    if (!token) {
      return of(false);
    }

    // Refresh if token expires in less than 10 minutes
    if (this.isTokenExpired(token)) {
      return this.validateToken().pipe(
        map(() => true),
        catchError(() => of(false))
      );
    }

    return of(true);
  }

}
