import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AccessLogEntry {
  id: number;
  timestamp: string;
  allowed: boolean;
  reason: string | null;
  user: { id: number; first_name: string; last_name: string } | null;
  door: { id: number; name: string } | null;
}

@Injectable({
  providedIn: 'root'
})
export class AccessLogService {

  private logsUrl = 'http://localhost:8000/access-logs';

  constructor(private http: HttpClient) {}

  getAllLogs(allowed?: boolean): Observable<AccessLogEntry[]> {
    let params = new HttpParams();
    if (allowed !== undefined) {
      params = params.set('allowed', allowed.toString());
    }
    return this.http.get<AccessLogEntry[]>(this.logsUrl, { params });
  }

  getLogById(id: number): Observable<AccessLogEntry> {
    return this.http.get<AccessLogEntry>(`${this.logsUrl}/${id}`);
  }
}