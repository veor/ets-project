import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.development';

/* --- PRODUCTION --- */
// const API_URL = environment.apiUrl+'/etsbackend/';
/* --- www --- */
// const API_URL = environment.apiUrl;
/* --- SSL --- */
const API_URL = '/api/ets/etsbackend';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable({
  providedIn: 'root'
})
export class SupervisorService {
  constructor(private http: HttpClient) {}

  /*
    Incoming Request - Office Request
  */
  deleteJobRequest(requestId: number): Observable<any> {
    return this.http.delete(API_URL + `/users/deleteJobRequest/${requestId}`, httpOptions);
    /* --- PRODUCTION --- */
    // return this.http.delete(API_URL + `users/deleteJobRequest/${requestId}`, httpOptions);
  }

  cancelJobRequest(reportId: number): Observable<any> {
    return this.http.delete<any>(API_URL + `/users/cancelRequest/${reportId}`, httpOptions);
    /* --- PRODUCTION --- */
    // return this.http.delete<any>(API_URL + `users/cancelRequest/${reportId}`, httpOptions);
  }

  // acceptService(controlNo: string, personnelId: string): Observable<any> {
    acceptService(id: number, personnelId: string): Observable<any> {
    return this.http.post(API_URL + '/users/assignAndAcceptJobRequest', {
    /* --- PRODUCTION --- */
    // return this.http.post(API_URL + 'users/assignAndAcceptJobRequest', {
    id: id,
    personnel_id: personnelId
    }, httpOptions);
  }

  // fetch approved reports from itrm_service_report with approval_status of "1" 
  getApprovedReports(): Observable<any> {
    return this.http.get<any>(API_URL + '/users/getApprovedReports', httpOptions); 
    /* --- PRODUCTION --- */
    // return this.http.get<any>(API_URL + 'users/getApprovedReports', httpOptions); 
  }

  // update column from itrm_service_report approval_status to "1" 
  updateApprovalStatus(requestId: number): Observable<any> {
    return this.http.post<any>(API_URL + '/users/updateApprovalStatus', { id: requestId, approval_status: 1 }, httpOptions);
    /* --- PRODUCTION --- */
    // return this.http.post<any>(API_URL + 'users/updateApprovalStatus', { id: requestId, approval_status: 1 }, httpOptions);
  }

  // fetch job request according to user's office_id service
  getJobRequests(): Observable<any> {
    return this.http.get(API_URL + '/users/getJobRequests', httpOptions);
    /* --- PRODUCTION --- */
    // return this.http.get(API_URL + 'users/getJobRequests', httpOptions);
  }

cancelServiceRequest(reportId: number): Observable<any> {
  return this.http.delete<any>(API_URL + `/users/cancelServiceRequest/${reportId}`, httpOptions);
  /* --- PRODUCTION --- */
  // return this.http.delete<any>(API_URL + `users/cancelServiceRequest/${reportId}`, httpOptions);
}
  






}
