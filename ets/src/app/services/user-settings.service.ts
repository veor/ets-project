import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, Observable, of } from 'rxjs';
import { environment } from '../../environments/environment.development';

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
export class UserSettingsService {

  constructor(private http: HttpClient) { }

  // Get user data from the table 'users' service
  getUserInfo(): Observable<any> {
    return this.http.get(API_URL + '/users/getUserInfo', httpOptions);
    /* --- PRODUCTION --- */
    // return this.http.get(API_URL + 'users/getUserInfo', httpOptions);
  }

  // update logged in user's info service
  updateUserInfo(data: any): Observable<any> {
    return this.http.post(API_URL + '/users/updateUserInfo', data, httpOptions);
    /* --- PRODUCTION --- */
    // return this.http.post(API_URL + 'users/updateUserInfo', data, httpOptions);
  }

  // Change user password service
  changePassword(passwordData: any): Observable<any> {
    return this.http.post(API_URL + '/users/changePassword', passwordData, httpOptions);
    /* --- PRODUCTION --- */
    // return this.http.post(API_URL + 'users/changePassword', passwordData, httpOptions);
  }

// user-settings.service.ts
updatePassword(passwordData: any): Observable<any> {
  return this.http.post(`${API_URL}/users/updatePassword`, passwordData, httpOptions);
  /* --- PRODUCTION --- */
  // return this.http.post(`${API_URL}users/updatePassword`, passwordData, httpOptions);
}

  // fetch all the permissions for logged in users service
  getUserPermissions(): Observable<any> {
    return this.http.get(API_URL + '/users/getUserPermissions', httpOptions);
    /* --- PRODUCTION --- */
    // return this.http.get(API_URL + 'users/getUserPermissions', httpOptions);
  }

  // fetch selected user permissions for editing
  getUserPermissionsById(userId: string): Observable<any> {
    return this.http.get<any>(`${API_URL}/users/getUserPermissionsById/${userId}`, { withCredentials: true }).pipe(
      /* --- PRODUCTION --- */
      // return this.http.get<any>(`${API_URL}users/getUserPermissionsById/${userId}`, { withCredentials: true }).pipe(
      catchError(error => {
        console.error('Error fetching permissions for user', error);
        return of({ status: 'fail', message: 'Failed to fetch user permissions' }); // Return fallback response
      })
    );
  }

updateUserPermissions(permissions: string[]): Observable<any> {
  // Convert all numbers to strings explicitly before sending
  const stringifiedPermissions = permissions.map(p => p.toString());
  return this.http.post(API_URL + '/users/updateUserPermissions', { permissions: stringifiedPermissions }, httpOptions);
    /* --- PRODUCTION --- */
  // return this.http.post(API_URL + 'users/updateUserPermissions', { permissions: stringifiedPermissions }, httpOptions);

}

  fetchDivisions(): Observable<any> {
    return this.http.get(API_URL + '/users/fetchDivisions', httpOptions);
    /* --- PRODUCTION --- */
    // return this.http.get(API_URL + 'users/fetchDivisions', httpOptions);
  } 
  fetchEditDiv(officeId: number): Observable<any> {
    return this.http.get(API_URL + `/users/fetchDivisions/${officeId}`, httpOptions);
    /* --- PRODUCTION --- */
    // return this.http.get(API_URL + `users/fetchDivisions/${officeId}`, httpOptions);
  } 

  getDivisions(officeId: number): Observable<any> {
    return this.http.get<any>(API_URL + `/users/getDivisionsByOffice/${officeId}`, httpOptions);
    /* --- PRODUCTION --- */
    // return this.http.get<any>(API_URL + `users/getDivisionsByOffice/${officeId}`, httpOptions);
  }

  // fetch office service
  getOffices(): Observable<any[]> {
    return this.http.get<any[]>(API_URL + '/users/getOffice', httpOptions);
    /* --- PRODUCTION --- */
    // return this.http.get<any[]>(API_URL + 'users/getOffice', httpOptions);
  }

  getAddUserOffices(): Observable<any> {
    return this.http.get(API_URL + '/users/getAll', httpOptions); 
    /* --- PRODUCTION --- */
    // return this.http.get(API_URL + 'users/getAll', httpOptions); 
  }

  // fetch all users 
  getUsers(): Observable<any> {
    return this.http.post(API_URL + '/users/getUsers', {}, httpOptions);
    /* --- PRODUCTION --- */
    // return this.http.post(API_URL + 'users/getUsers', {}, httpOptions);
  }
  
  // Add a new user to table 'users' service
  register(userData: any): Observable<any> {
    return this.http.post(API_URL + '/users/register', userData, httpOptions);
    /* --- PRODUCTION --- */
    // return this.http.post(API_URL + 'users/register', userData, httpOptions);
  }

  savePersonnel(personnelData: any): Observable<any> {
    return this.http.post(API_URL + '/users/savePersonnel', personnelData, httpOptions);
    /* --- PRODUCTION --- */
    // return this.http.post(API_URL + 'users/savePersonnel', personnelData, httpOptions);
  }

  // update selected user on administrator 
  updateUser(users: any): Observable<any> {
    return this.http.post(API_URL + '/users/updateUser', users, httpOptions);
    /* --- PRODUCTION --- */
    // return this.http.post(API_URL + 'users/updateUser', users, httpOptions);
  }  

  getAllOffices(): Observable<any> {
    return this.http.post(API_URL + '/users/getAllOffices', {}, httpOptions);
    /* --- PRODUCTION --- */
    // return this.http.post(API_URL + 'users/getAllOffices', {}, httpOptions);
  }  
  
  // add office service
  addOffice(officeData: any): Observable<any> {
    return this.http.post(API_URL + '/users/addOffice', officeData, httpOptions);
    /* --- PRODUCTION --- */
    // return this.http.post(API_URL + 'users/addOffice', officeData, httpOptions);
  } 

  addDivision(divisionData: any): Observable<any> {
    return this.http.post(API_URL + '/users/addDivision', divisionData, httpOptions);
    /* --- PRODUCTION --- */
    // return this.http.post(API_URL + 'users/addDivision', divisionData, httpOptions);
  } 

  updateOffice(office: any): Observable<any> {
    return this.http.post(API_URL + '/users/updateOffice', office, httpOptions);
    /* --- PRODUCTION --- */
    // return this.http.post(API_URL + 'users/updateOffice', office, httpOptions);
  }  

  updateDivisionName(divisionId: number, divisionName: string): Observable<any> {
    return this.http.put(API_URL + `/users/updateDivision/${divisionId}`, { division_name: divisionName }, httpOptions);
    /* --- PRODUCTION --- */
    // return this.http.put(API_URL + `users/updateDivision/${divisionId}`, { division_name: divisionName }, httpOptions);
   }
  
  updateUserStatus(idNumber: string, isActive: number): Observable<any> {
    return this.http.post(API_URL + `/users/updateUserStatus`, { 
      id_number: idNumber, 
      is_active: isActive 
    });
  }
}
