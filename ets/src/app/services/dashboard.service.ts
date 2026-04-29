import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map, Observable } from 'rxjs';

/* --- PRODUCTION --- */
// const API_URL = environment.apiUrl+'/etsbackend/';
/* --- WWW --- */ 
// const API_URL = environment.apiUrl;
/* --- SSL --- */
const API_URL = '/api/ets/etsbackend';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  constructor(
    private http: HttpClient
  ) { }

// Request status cards such as Unaasigned, Unapproved, In-Process, For Release
  getApprovalStats(filter: 'all' | 'self' = 'all'): Observable<{ unapproved: number; unassigned: number; in_process: number; for_release: number }> {
    return this.http.get<{ status: string, data: { unapproved: number; unassigned: number; in_process: number; for_release: number } }>(
      `${API_URL}/users/getApprovalStats?filter=${filter}`,
      /* --- PRODUCTION --- */
      // `${API_URL}users/getApprovalStats?filter=${filter}`,
      httpOptions
    ).pipe(map(res => res.data));
  }
  // Bottom card monthly tickets 
  getMonthlyRequests(filter: 'all' | 'self' = 'all'): Observable<{status: string, data: Record<string, number>}> {
    return this.http.get<any>(
      `${API_URL}/users/getMonthlyRequests?filter=${filter}`,
      /* --- PRODUCTION --- */
      // `${API_URL}users/getMonthlyRequests?filter=${filter}`,
      httpOptions
    );
  }
  // Bottom card services rendered
  getRequestsByType(filter: 'all' | 'self'): Observable<any> {
    return this.http.get<{ status: string, data: any }>(
      `${API_URL}/users/getRequestsByType?filter=${filter}`,
      /* --- PRODUCTION --- */
      // `${API_URL}users/getRequestsByType?filter=${filter}`,
      httpOptions
    );
  }

  getTechnicalSupportUsers(): Observable<{ status: string, data: { id: number, name: string }[] }> {
    return this.http.get<{ status: string, data: any[] }>(
      `${API_URL}/users/getTechnicalSupportUsers`,
      // `${API_URL}users/getTechnicalSupportUsers`,
      httpOptions
    );
  }

}
