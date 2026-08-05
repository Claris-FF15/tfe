import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';


export interface LoginRequest {
  email: string;
  password: string;
}


export interface TokenResponse {
  access_token: string;
  token_type: string;
}


@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = 'http://localhost:8000/auth/login';


  constructor(private http: HttpClient) {}


  login(data: LoginRequest): Observable<TokenResponse> {

    return this.http.post<TokenResponse>(
      this.apiUrl,
      data
    );

  }


  saveToken(token: string) {

    localStorage.setItem(
      'access_token',
      token
    );

  }


  getToken(): string | null {

    return localStorage.getItem(
      'access_token'
    );

  }


  logout() {

    localStorage.removeItem(
      'access_token'
    );

  }

}