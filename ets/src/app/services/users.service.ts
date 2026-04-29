import { HttpHeaders, HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment.development';
import { Observable } from 'rxjs';


/* --- PRODUCTION --- */
// const API_URL = environment.apiUrl+'/etsbackend/';
/* --- SSL --- */
const API_URL = environment.apiUrl;

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable({
  providedIn: 'root'
})
export class UsersService {

  constructor(
    private http: HttpClient, private router: Router
  ) { }


  // Fetch Divisions by Office ID
  getDivisionsByOffice(officeId: number): Observable<any[]> {
    return this.http.get<any[]>(API_URL + `/users/getDivisions/${officeId}`, httpOptions);
    /* --- PRODUCTION --- */
    // return this.http.get<any[]>(API_URL + `users/getDivisions/${officeId}`, httpOptions);
  }

  // filter option: Review Ticket in monitoring
  fetchAcceptedReports(filter?: string): Observable<any> {
    const options = {
      ...httpOptions,
      ...(filter && { params: { filter } })
    };
    return this.http.get<any>(API_URL + '/users/fetchAcceptedReports', options);
    /* --- PRODUCTION --- */
    // return this.http.get<any>(API_URL + 'users/fetchAcceptedReports', options);
  }

  // fetch data for collapsible panel in filter Review Ticket in monitoring 
  getServiceReportDetailsPost(controlNo: string): Observable<any> {
    return this.http.post<any>(API_URL + `/users/getServiceReportDetails`, { control_no: controlNo }, httpOptions);
    /* --- PRODUCTION --- */
    // return this.http.post<any>(API_URL + `users/getServiceReportDetails`, { control_no: controlNo }, httpOptions);
  }

  // method for monitoring to approve released tickets 
  approveServiceReport(id: number) {
    return this.http.post<any>(API_URL + `/users/approveServiceReport`, { id: id }, httpOptions);
    /* --- PRODUCTION --- */
    // return this.http.post<any>(API_URL + `users/approveServiceReport`, { id: id }, httpOptions);
  }

  // fetch logged in users division id and display personnel names on dropdown in monitor 
  getPersonnelByDivision() {
    return this.http.get<{status: string, data?: any[], message?: string}>(API_URL + '/users/getPersonnelByDivision', httpOptions);
    /* --- PRODUCTION --- */
    // return this.http.get<{status: string, data?: any[], message?: string}>(API_URL + 'users/getPersonnelByDivision', httpOptions);
  }

  // store the personnel name to their specified table 
  assignPersonnelToReport(controlNo: string, personnelId: string, timeAssigned: string) {
    return this.http.post<{personnel_name: any; status: string, message?: string }>(API_URL + '/users/assignPersonnelToReport', {
      /* --- PRODUCTION --- */
    // return this.http.post<{personnel_name: any; status: string, message?: string }>(API_URL + 'users/assignPersonnelToReport', {
    control_no: controlNo,
      personnel_id: personnelId,
      time_assigned: timeAssigned,
    }, httpOptions);
  }




















  
  // Submit issue from client to suspervisor service
  // submitIssue(issueData: any): Observable<any> {
  //   return this.http.post(API_URL + '/users/submitIssue', issueData, httpOptions);
  //   return this.http.post(API_URL + 'users/submitIssue', issueData, httpOptions);
  // }  
}
