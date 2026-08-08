import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ZoneService, ZoneWithDoors } from '../services/zone.service';

@Component({
  selector: 'app-zones',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './zones.component.html',
  styleUrls: ['./zones.component.sass']
})
export class ZonesComponent implements OnInit {

  zones: ZoneWithDoors[] = [];
  loading = true;

  constructor(
    private zoneService: ZoneService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.zoneService.getAllZones().subscribe({
      next: (zones) => {
        this.zones = zones;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  goToDoor(doorId: number): void {
    this.router.navigate(['/doors', doorId]);
  }

  goToCreate(): void {
    this.router.navigate(['/zones/new']);
  }
}