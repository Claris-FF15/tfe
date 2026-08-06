import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface UserBadge {
  id: number;
  uid: string;
  user_id: number;
  active: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class BadgeService {

  private badgesUrl = 'http://localhost:8000/badges';

  constructor(private http: HttpClient) {}

  getMyBadge(): Observable<UserBadge> {
    return this.http.get<UserBadge>(`${this.badgesUrl}/me`);
  }
}