import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.development';

const API_URL = environment.apiUrl+'/etsbackend/';

@Injectable({
  providedIn: 'root',
})
export class PdfService {
  constructor(private http: HttpClient) {}

    generatePdf(selectedReport: any, currentUser: any): Observable<Blob> {
    /* --- SSL --- */
        const url = '/api/ets/etsbackend/users/generatePdf';
    /* --- WWW --- */
        // const url = '/ets/etsbackend/users/generatePdf';
    /* --- PRODUCTION --- */
        // const url = API_URL + 'users/generatePdf'
        return this.http.post(url, { selectedReport, currentUser }, {
            headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
            responseType: 'blob'
          });
    }

    generateChecklistPdf(record: any): Observable<Blob> {
    /* --- SSL --- */
      return this.http.post('/api/ets/etsbackend/pms/generateChecklistPdf', record, {
    /* --- WWW --- */
    // return this.http.post('/ets/etsbackend/pms/generateChecklistPdf', record, {
    /* --- PRODUCTION --- */
    // return this.http.post(API_URL + 'pms/generateChecklistPdf', record, {
        headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
        responseType: 'blob'
      });
    }

    generateSummaryPdf(data: any): Observable<Blob> {
    /* --- SSL --- */
      return this.http.post('/api/ets/etsbackend/pms/generateSummaryPdf', data, {
    /* --- WWW --- */
      // return this.http.post(API_URL + '/ets/etsbackend/pms/generateSummaryPdf', data, {
    /* --- PRODUCTION --- */
        // return this.http.post('pms/generateSummaryPdf', data, {
        headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
        responseType: 'blob'
      });
    }

}
