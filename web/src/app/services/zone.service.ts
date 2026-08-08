import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Zone {
  id: number;
  name: string;
  description: string | null;
}

export interface DoorInZone {
  id: number;
  name: string;
  location: string;
  active: boolean;
  zone: Zone | null;
}

export interface DoorAuthorizedUser {
  id: number;
  user: { id: number; first_name: string; last_name: string };
  created_at: string;
}

export interface DoorLog {
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
export class ZoneService {

  private zonesUrl = 'http://localhost:8000/zones';
  private doorsUrl = 'http://localhost:8000/doors';

  constructor(private http: HttpClient) {}

  getAllZones(): Observable<Zone[]> {
    return this.http.get<Zone[]>(this.zonesUrl);
  }

  getZoneById(id: number): Observable<Zone> {
    return this.http.get<Zone>(`${this.zonesUrl}/${id}`);
  }

  getAllDoors(): Observable<DoorInZone[]> {
    return this.http.get<DoorInZone[]>(this.doorsUrl);
  }

  getDoorAuthorizedUsers(doorId: number): Observable<DoorAuthorizedUser[]> {
    return this.http.get<DoorAuthorizedUser[]>(`${this.doorsUrl}/${doorId}/authorized-users`);
  }

  getDoorLogs(doorId: number, allowed?: boolean): Observable<DoorLog[]> {
    let params = new HttpParams();
    if (allowed !== undefined) {
      params = params.set('allowed', allowed.toString());
    }
    return this.http.get<DoorLog[]>(`${this.doorsUrl}/${doorId}/logs`, { params });
  }
}