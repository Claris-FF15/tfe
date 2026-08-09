import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface SecurityAlert {
  id: number;
  user_id: number | null;
  message: string;
  created_at: string;
}

@Injectable({
  providedIn: 'root'
})
export class SecurityAlertService {

  private alertsUrl = 'http://localhost:8000/security-alerts';

  constructor(private http: HttpClient) {}

  getUnacknowledged(): Observable<SecurityAlert[]> {
    return this.http.get<SecurityAlert[]>(`${this.alertsUrl}/unacknowledged`);
  }

  acknowledge(id: number): Observable<{ ok: boolean }> {
    return this.http.put<{ ok: boolean }>(`${this.alertsUrl}/${id}/acknowledge`, {});
  }
}