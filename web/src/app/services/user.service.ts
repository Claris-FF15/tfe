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

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private usersUrl = 'http://localhost:8000/users';

  constructor(private http: HttpClient) {}

  getAllUsers(): Observable<UserRow[]> {
    return this.http.get<UserRow[]>(this.usersUrl);
  }
}