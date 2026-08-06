import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap, filter, take } from 'rxjs';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export interface Role {
  id: number;
  name: string;
}

export interface CurrentUser {
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
export class AuthService {

  private authUrl = 'http://localhost:8000/auth';
  private usersUrl = 'http://localhost:8000/users';

  private currentUserSubject = new BehaviorSubject<CurrentUser | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  private userLoadedSubject = new BehaviorSubject<boolean>(false);
  userLoaded$ = this.userLoadedSubject.asObservable();

  constructor(private http: HttpClient) {}

  login(data: LoginRequest): Observable<TokenResponse> {
    return this.http.post<TokenResponse>(`${this.authUrl}/login`, data);
  }

  fetchCurrentUser(): Observable<CurrentUser> {
    return this.http.get<CurrentUser>(`${this.usersUrl}/me`).pipe(
      tap(user => {
        this.currentUserSubject.next(user);
        this.userLoadedSubject.next(true);
      })
    );
  }

  updateName(userId: number, firstName: string, lastName: string): Observable<CurrentUser> {
    return this.http.put<CurrentUser>(`${this.usersUrl}/${userId}/name`, {
      first_name: firstName,
      last_name: lastName
    }).pipe(
      tap(user => this.currentUserSubject.next(user))
    );
  }

  saveToken(token: string) {
    localStorage.setItem('access_token', token);
  }

  getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  logout() {
    localStorage.removeItem('access_token');
    this.currentUserSubject.next(null);
    this.userLoadedSubject.next(true); // "chargé" même si déconnecté, pour débloquer les guards
  }

  /** Utilisé par les guards : attend que le premier chargement (ou logout) soit terminé */
  waitUntilLoaded(): Observable<boolean> {
    return this.userLoaded$.pipe(
      filter(loaded => loaded === true),
      take(1)
    );
  }
}