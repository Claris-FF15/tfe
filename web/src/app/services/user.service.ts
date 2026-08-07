import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Role } from './auth.service';

export interface UserRow {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  active: boolean;
  role: Role;
}

export interface UserCreatePayload {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  role_id: number;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private usersUrl = 'http://localhost:8000/users';

  constructor(private http: HttpClient) {}

  getAllUsers(): Observable<UserRow[]> {
    return this.http.get<UserRow[]>(this.usersUrl);
  }

  getUserById(id: number): Observable<UserRow> {
    return this.http.get<UserRow>(`${this.usersUrl}/${id}`);
  }

  createUser(data: UserCreatePayload): Observable<UserRow> {
    return this.http.post<UserRow>(this.usersUrl, data);
  }

  updateName(id: number, firstName: string, lastName: string): Observable<UserRow> {
    return this.http.put<UserRow>(`${this.usersUrl}/${id}/name`, {
      first_name: firstName,
      last_name: lastName
    });
  }

  updateRole(id: number, roleId: number): Observable<UserRow> {
    return this.http.put<UserRow>(`${this.usersUrl}/${id}/role`, {
      role_id: roleId
    });
  }

  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.usersUrl}/${id}`);
  }
}