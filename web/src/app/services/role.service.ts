import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Role } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class RoleService {

  private rolesUrl = 'http://localhost:8000/roles';

  constructor(private http: HttpClient) {}

  getAllRoles(): Observable<Role[]> {
    return this.http.get<Role[]>(this.rolesUrl);
  }
}