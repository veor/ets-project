import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.development';
import { HttpParams } from '@angular/common/http';

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
  ////////////////////////
  /// IT Equipment 
  ////////////////////////

//---------- Store it equipment 
  saveEquipment(data: any): Observable<any> {
    return this.http.post(API_URL + `/pms/saveEquipment`, data, httpOptions);
    /* --- PRODUCTION --- */
    // return this.http.post(API_URL + `pms/saveEquipment`, data, httpOptions);
  }
//---------- Get it equipment list 
  getEquipmentList(params: any): Observable<any> {
    return this.http.get(API_URL + `/pms/getEquipmentList`, { params });
  }
//---------- Get offices for add it equipment dialog
  getOffices(): Observable<any> {
    return this.http.get<any>(API_URL + `/pms/getOffices`);
    /* --- PRODUCTION --- */
    // return this.http.get<any>(API_URL + `pms/getOffices`);
  }
//---------- Get divisions for add it equipment dialog
  getDivisions(): Observable<any> {
    return this.http.get(API_URL + '/pms/getDivisions', httpOptions);
    /* --- PRODUCTION --- */
    // return this.http.get(API_URL + 'pms/getDivisions', httpOptions);
  }
  getEquipmentTypes(): Observable<any> {
    return this.http.get(API_URL + `/pms/getEquipmentTypes`);
    /* --- PRODUCTION --- */
    // return this.http.get(API_URL + `pms/getEquipmentTypes`);
  }


  ////////////////////////
  /// Maintenance Logs 
  ////////////////////////

  //---------- Get maintenance logs
  getMaintenanceLogs(params: any): Observable<any> {
    return this.http.get(API_URL + '/pms/getMaintenanceLogs', {
    /* --- PRODUCTION --- */
    // return this.http.get(API_URL + 'pms/getMaintenanceLogs', {
      params
    });
  }
  //---------- Get all IT Staff 
  getITStaff(): Observable<any> {
    return this.http.get(API_URL + '/pms/getITStaff');
    /* --- PRODUCTION --- */
    // return this.http.get(API_URL + 'pms/getITStaff');
  }
  //---------- Get Checklist Template Options  
  getChecklistTemplateOptions() {
    return this.http.get(
      API_URL + `/pms/getChecklistTemplateOptions`
    /* --- PRODUCTION --- */
      // API_URL + `pms/getChecklistTemplateOptions`
    );
  }
  //---------- Get checklist tasks
  getChecklistTasks(
    equipmentType: string,
    versionYear: string
  ) {

    return this.http.get(
      API_URL + `/pms/getChecklistTasks`,
    /* --- PRODUCTION --- */
      // API_URL + `pms/getChecklistTasks`,
      {
        params: {
          equipmentType,
          versionYear
        }
      }
    );

  }
  //---------- Save maintenance checklist
  saveMaintenanceChecklist(data: any): Observable<any> {
    return this.http.post(
      API_URL + '/pms/saveMaintenanceChecklist',
    /* --- PRODUCTION --- */
      // API_URL + 'pms/saveMaintenanceChecklist',
      data
    );
  }
  //---------- Get Saved maintenance checklist
  getSavedChecklist(equipmentId: number): Observable<any> {
    return this.http.get(
      API_URL + '/pms/getSavedChecklist/' + equipmentId
    /* --- PRODUCTION --- */
      // API_URL + 'pms/getSavedChecklist/' + equipmentId
    );
  }

getMaintenanceLogDetail(source: string, id: string): Observable<any> {
  return this.http.get(API_URL + '/pms/getMaintenanceLogDetail', {
    params: { source, id }
  });
}
printMaintenanceChecklist(id: string | number): void {
  window.open(API_URL + '/pms/printMaintenanceChecklist/' + id, '_blank');
}

  ////////////////////////
  /// Checklist Records
  ////////////////////////

  //---------- Get Checklist Templates
  getChecklistTemplates(params?: any) {
    let httpParams = new HttpParams();
    if (params?.year) {
      httpParams = httpParams.set('year', params.year);
    }

    if (params?.equipmentType) {
      httpParams = httpParams.set('equipmentType', params.equipmentType);
    }

    if (params?.search) {
      httpParams = httpParams.set('search', params.search);
    }

    if (params?.page) {
      httpParams = httpParams.set('page', params.page);
    }

    if (params?.limit) {
      httpParams = httpParams.set('limit', params.limit);
    }

    return this.http.get(
      API_URL + '/pms/getChecklistTemplates',
    /* --- PRODUCTION --- */
      // API_URL + 'pms/getChecklistTemplates',
      { params: httpParams }
    );
  }
  //---------- Get Checklist Filters
  getChecklistTemplateFilters(): Observable<any> { return this.http.get(
    API_URL + '/pms/getChecklistTemplateFilters'
    /* --- PRODUCTION --- */
    // API_URL + 'pms/getChecklistTemplateFilters'
  );
  }
  //---------- Get Checklist Template Details
  getChecklistTemplateDetails(id: number): Observable<any> {
    return this.http.get(
      API_URL + '/pms/getChecklistTemplateDetails/' + id
    /* --- PRODUCTION --- */
      // API_URL + 'pms/getChecklistTemplateDetails/' + id
    );
  }
  //---------- Create New Checklist Template
  createChecklistTemplate(data: any): Observable<any> {
    return this.http.post(
      API_URL + '/pms/createChecklistTemplate',
    /* --- PRODUCTION --- */
      // API_URL + 'pms/createChecklistTemplate',
      data
    );
  }



}
