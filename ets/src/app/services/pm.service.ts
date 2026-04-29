import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.development';

/* --- PRODUCTION --- */
// const API_URL = environment.apiUrl+'/etsbackend/';
/* --- WWW --- */
// const API_URL = environment.apiUrl;
/* --- SSSL --- */
const API_URL = '/api/ets/etsbackend';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable({
  providedIn: 'root'
})

export class PmService {

  constructor(
    private http: HttpClient
  ) { }

  // save device information 
  saveNewDevice(data: any): Observable<any> {
    return this.http.post(API_URL + `/pms/saveNewDevice`, data, httpOptions);
    /* --- PRODUCTION --- */
    // return this.http.post(API_URL + `pms/saveNewDevice`, data, httpOptions);
  }

  getOffices(): Observable<any> {
    return this.http.get<any>(API_URL + `/pms/getOffices`);
    /* --- PRODUCTION --- */
    // return this.http.get<any>(API_URL + `pms/getOffices`);
  }

  getDivisions(): Observable<any> {
    return this.http.get(API_URL + '/pms/getDivisions', httpOptions);
    /* --- PRODUCTION --- */
    // return this.http.get(API_URL + 'pms/getDivisions', httpOptions);
  }

  getAccountableInfo(): Observable<any> {
    return this.http.get<any>(API_URL + '/pms/getAccountableInfo', httpOptions);
    /* --- PRODUCTION --- */
    // return this.http.get<any>(API_URL + 'pms/getAccountableInfo', httpOptions);

  }






  savePreventiveMaintenance(data: any): Observable<any> {
    return this.http.post(API_URL + `/pms/savePreventiveMaintenance`, data, httpOptions);
    /* --- PRODUCTION --- */
    // return this.http.post(API_URL + `pms/savePreventiveMaintenance`, data, httpOptions);
  }

  getControlNumbers(): Observable<any> {
    return this.http.get<any>(API_URL + '/pms/getControlNumbers', httpOptions);
    /* --- PRODUCTION --- */
    // return this.http.get<any>(API_URL + 'pms/getControlNumbers', httpOptions);
  }

  getPersonnelList(): Observable<any> {
    return this.http.get(API_URL + '/pms/getPersonnels', httpOptions);
    /* --- PRODUCTION --- */
    // return this.http.get(API_URL + 'pms/getPersonnels', httpOptions);
  }

  saveNewRecord(data: any): Observable<any> {
    return this.http.post(API_URL + '/pms/saveNewRecord', data, httpOptions);
    /* --- PRODUCTION --- */
    // return this.http.post(API_URL + 'pms/saveNewRecord', data, httpOptions);
  }

  getMaintenanceRecords(): Observable<any> {
    return this.http.get<any>(API_URL + '/pms/getMaintenanceRecords', httpOptions);
    /* --- PRODUCTION --- */
    // return this.http.get<any>(API_URL + 'pms/getMaintenanceRecords', httpOptions);
  }

  getSummaryReport(): Observable<any> {
    return this.http.get<any>(API_URL + '/pms/getSummaryReport', httpOptions);
    /* --- PRODUCTION --- */
    // return this.http.get<any>(API_URL + 'pms/getSummaryReport', httpOptions);
  }
}
