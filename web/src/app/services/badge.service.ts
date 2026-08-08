import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface UserBadge {
  id: number;
  uid: string;
  user_id: number | null;
  active: boolean;
  last_activity: string | null;
}

export interface BadgeCreatePayload {
  uid: string;
  user_id: number | null;
  active: boolean;
}

export interface BadgeUpdatePayload {
  active?: boolean;
  user_id?: number | null;
}

export interface AccessLog {
  id: number;
  door_id: number | null;
  timestamp: string;
  allowed: boolean;
  reason: string | null;
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

  getBadgeByUserId(userId: number): Observable<UserBadge> {
    return this.http.get<UserBadge>(`${this.badgesUrl}/user/${userId}`);
  }

  getAllBadges(): Observable<UserBadge[]> {
    return this.http.get<UserBadge[]>(this.badgesUrl);
  }

  getBadgeById(id: number): Observable<UserBadge> {
    return this.http.get<UserBadge>(`${this.badgesUrl}/${id}`);
  }

  getBadgeLogs(id: number): Observable<AccessLog[]> {
    return this.http.get<AccessLog[]>(`${this.badgesUrl}/${id}/logs`);
  }

  createBadge(data: BadgeCreatePayload): Observable<UserBadge> {
    return this.http.post<UserBadge>(this.badgesUrl, data);
  }

  updateBadge(id: number, data: BadgeUpdatePayload): Observable<UserBadge> {
    return this.http.put<UserBadge>(`${this.badgesUrl}/${id}`, data);
  }

  deleteBadge(id: number): Observable<void> {
    return this.http.delete<void>(`${this.badgesUrl}/${id}`);
  }
}