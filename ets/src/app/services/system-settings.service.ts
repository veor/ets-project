import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.development';

/* --- PRODUCTION --- */
// const API_URL = environment.apiUrl+'/etsbackend/';
/* --- SSL --- */
const API_URL = '/api/ets/etsbackend';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable({
  providedIn: 'root'
})
export class SystemSettingsService {

  constructor(
    private http: HttpClient
) {}

//================ AUTHENTICATED USER SERVICES 
  getUserInfo(): Observable<any> {
    return this.http.get(API_URL + '/system/getUserInfo', httpOptions);
    /* --- PRODUCTION --- */
    // return this.http.get(API_URL + 'system/getUserInfo', httpOptions);
  }

  getAuthUserPerms(): Observable<any> {
    return this.http.get(API_URL + '/system/getAuthUserPerms', httpOptions);
    /* --- PRODUCTION --- */
    // return this.http.get(API_URL + 'system/getAuthUserPerms', httpOptions);
  }

  checkAuthUserPerms(): Observable<any> {
    return this.http.get(API_URL + '/system/checkAuthUserPerms', httpOptions);
    /* --- PRODUCTION --- */
    // return this.http.get(API_URL + 'system/checkAuthUserPerms', httpOptions);
  }

  getUsers(): Observable<any> {
    return this.http.get(API_URL + `/system/getUsers`, httpOptions);
    /* --- PRODUCTION --- */
    // return this.http.get(API_URL + `system/getUsers`, httpOptions);
  }

  getOffices(): Observable<any> {
    return this.http.get(API_URL + `/system/getOffice`, httpOptions);
    /* --- PRODUCTION --- */
    // return this.http.get(API_URL + `system/getOffice`, httpOptions);
  }

  getDivisionsByOffice(officeId: number): Observable<any> {
    return this.http.get(API_URL + `/system/getDivisionsByOffice/${officeId}`, httpOptions); 
    /* --- PRODUCTION --- */
    // return this.http.get(API_URL + `system/getDivisionsByOffice/${officeId}`, httpOptions); 
  }

  updateUserInfo(payload: any): Observable<any> {
    return this.http.put(API_URL + `/system/updateUserInfo`, payload, httpOptions);
    /* --- PRODUCTION --- */
    // return this.http.put(API_URL + `system/updateUserInfo`, payload, httpOptions);
  }

  // Change user password service
  changePassword(passwordData: any): Observable<any> {
    return this.http.post(API_URL + '/system/changePassword', passwordData, httpOptions);
    /* --- PRODUCTION --- */
    // return this.http.post(API_URL + 'system/changePassword', passwordData, httpOptions);
  }
  // fetch your permissions 
  getUserPermissions(): Observable<any> {
    return this.http.get(API_URL + `/system/getUserPermissions`, httpOptions);
    /* --- PRODUCTION --- */
    // return this.http.get(API_URL + `system/getUserPermissions`, httpOptions);
  }
  // update your permission 
  updateUserPermissions(payload: any): Observable<any> {
    return this.http.post(API_URL + `/system/updateUserPermissions`, payload, httpOptions);
    /* --- PRODUCTION --- */
    // return this.http.post(API_URL + `system/updateUserPermissions`, payload, httpOptions);
  }

//================ ALL USER SERVICES 
  updateUserByAdmin(payload: any): Observable<any> {
    return this.http.put(API_URL + `/system/updateUserByAdmin`, payload, httpOptions);
    /* --- PRODUCTION --- */
    // return this.http.put(API_URL + `system/updateUserByAdmin`, payload, httpOptions);
  }
  // fetch selected user permission 
  getSelUserPerms(userId: string): Observable<any> {
    return this.http.get(API_URL + `/system/getSelUserPerms/${userId}`, httpOptions);
    /* --- PRODUCTION --- */
    // return this.http.get(API_URL + `system/getSelUserPerms/${userId}`, httpOptions);
  }
  // update selected user permission 
  updateSelUserPerms(payload: any): Observable<any> {
    return this.http.post(API_URL + `/system/updateSelUserPerms`, payload, httpOptions);
    /* --- PRODUCTION --- */
    // return this.http.post(API_URL + `system/updateSelUserPerms`, payload, httpOptions);
  }

  adminChangeUserPassword(payload: any): Observable<any> {
    return this.http.post(API_URL + `/system/adminChangeUserPassword`, payload, httpOptions);
    /* --- PRODUCTION --- */
    // return this.http.post(API_URL + `system/adminChangeUserPassword`, payload, httpOptions);
  }

  updateUserStatus(idNumber: string, isActive: number): Observable<any> {
    return this.http.post(API_URL + `/system/updateUserStatus`, { 
    /* --- PRODUCTION --- */
    // return this.http.post(API_URL + `system/updateUserStatus`, { 
      id_number: idNumber, 
      is_active: isActive ,
      httpOptions
    });
  }

//================ DEPARTMENT/DIVISION SERVICES 

  getAllOffices(): Observable<any> {
    return this.http.get(API_URL + `/system/getAllOffices`, httpOptions);
    /* --- PRODUCTION --- */
    // return this.http.get(API_URL + `system/getAllOffices`, httpOptions);
  }
  updateDepartment(payload: any): Observable<any> {
    return this.http.put(API_URL + `/system/updateDepartment`, payload, httpOptions);
    /* --- PRODUCTION --- */
    // return this.http.put(API_URL + `system/updateDepartment`, payload, httpOptions);
  }
  getDivisionsByDept(officeId: number): Observable<any> {
    return this.http.get(API_URL + `/system/getDivisionsByDept/${officeId}`, httpOptions);
    /* --- PRODUCTION --- */
    // return this.http.get(API_URL + `system/getDivisionsByDept/${officeId}`, httpOptions);
  }
  addDivision(data: any): Observable<any> {
    return this.http.post(API_URL + '/system/addDivision', data, httpOptions);
    /* --- PRODUCTION --- */
    // return this.http.post(API_URL + 'system/addDivision', data, httpOptions);
  }
  updateDivision(data: any): Observable<any> {
    return this.http.post<any>(API_URL + `/system/updateDivision`, data, httpOptions);
    /* --- PRODUCTION --- */
    // return this.http.post<any>(API_URL + `system/updateDivision`, data, httpOptions);
  }
  addOffice(data: any): Observable<any> {
    return this.http.post(API_URL + '/system/addOffice', data, httpOptions);
    /* --- PRODUCTION --- */
    // return this.http.post(API_URL + 'system/addOffice', data, httpOptions);
  }
  addUser(data: any): Observable<any> {
    return this.http.post(API_URL + `/system/addUser`, data, httpOptions);
    /* --- PRODUCTION --- */
    // return this.http.post(API_URL + `system/addUser`, data, httpOptions);
  }

  getAllDivisions(): Observable<any> {
    return this.http.get(API_URL + `/system/getAllDivisions`, httpOptions);
    /* --- PRODUCTION --- */
    // return this.http.get(API_URL + `system/getAllDivisions`, httpOptions);
  }

  // Add personnel
  addPersonnel(data: any): Observable<any> {
    return this.http.post(API_URL + `/system/addPersonnel`, data, httpOptions);
    /* --- PRODUCTION --- */
    // return this.http.post(API_URL + `system/addPersonnel`, data, httpOptions);
  }

  // Get user by ID number
  getUserById(idNumber: string): Observable<any> {
    return this.http.get(API_URL + `/system/getUserById/${idNumber}`, httpOptions);
    /* --- PRODUCTION --- */
    // return this.http.get(API_URL + `system/getUserById/${idNumber}`, httpOptions);
  }
}
