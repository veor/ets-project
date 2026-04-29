import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.development';

/* --- PRODUCTION --- */
// const API_URL = environment.apiUrl+'/etsbackend/';
/* --- SSL --- */
const API_URL = '/api/ets/etsbackend';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
}

@Injectable({
  providedIn: 'root'
})
export class ClientService {

  constructor(private http: HttpClient) { }

  getDivisions(): Observable<any> {
    return this.http.get(API_URL + '/client/getDivisions', httpOptions);
    /* --- PRODUCTION --- */
    // return this.http.get(API_URL + 'client/getDivisions', httpOptions);

  }

  getRequestDivisions(): Observable<any> {
    return this.http.get(API_URL + '/client/getRequestDivision', httpOptions);
    /* --- PRODUCTION --- */
    // return this.http.get(API_URL + 'client/getRequestDivision', httpOptions);
  }

  getOffices(): Observable<any> {
    return this.http.get(API_URL + '/client/getOffices', httpOptions);
    /* --- PRODUCTION --- */
    // return this.http.get(API_URL + 'client/getOffices', httpOptions);

  }

  submitRequest(requestData: any): Observable<any> {
    return this.http.post(API_URL + '/client/createServiceReport', requestData, httpOptions);
    /* --- PRODUCTION --- */
    // return this.http.post(API_URL + 'client/createServiceReport', requestData, httpOptions);
  }

  getServiceReport(searchTerm: string): Observable<any> {
    return this.http.get(`${API_URL}/client/getServiceReport?q=${searchTerm}`, httpOptions);
    /* --- PRODUCTION --- */
    // return this.http.get(`${API_URL}client/getServiceReport?q=${searchTerm}`, httpOptions);
  }

  saveSignature(signatureData: { reportId: number; signature: string }): Observable<any> {
    return this.http.post(`${API_URL}/client/saveSignature`, signatureData, httpOptions);
    /* --- PRODUCTION --- */
    // return this.http.post(`${API_URL}client/saveSignature`, signatureData, httpOptions);
}

}
