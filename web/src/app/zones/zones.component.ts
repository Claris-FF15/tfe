import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { ZoneService, Zone, DoorInZone } from '../services/zone.service';

@Component({
  selector: 'app-zones',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './zones.component.html',
  styleUrls: ['./zones.component.sass']
})
export class ZonesComponent implements OnInit {

  zones: Zone[] = [];
  doorsByZone: Record<number, DoorInZone[]> = {};
  unassignedDoors: DoorInZone[] = [];
  loading = true;

  constructor(
    private zoneService: ZoneService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    forkJoin({
      zones: this.zoneService.getAllZones(),
      doors: this.zoneService.getAllDoors()
    }).subscribe({
      next: ({ zones, doors }) => {
        this.zones = zones;
        this.doorsByZone = {};
        this.unassignedDoors = [];

        for (const door of doors) {
          if (door.zone) {
            if (!this.doorsByZone[door.zone.id]) {
              this.doorsByZone[door.zone.id] = [];
            }
            this.doorsByZone[door.zone.id].push(door);
          } else {
            this.unassignedDoors.push(door);
          }
        }

        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  doorsFor(zone: Zone): DoorInZone[] {
    return this.doorsByZone[zone.id] ?? [];
  }

  goToDoor(doorId: number): void {
    this.router.navigate(['/doors', doorId]);
  }
}