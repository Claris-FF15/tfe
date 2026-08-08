import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ZoneService, DoorAuthorizedUser, DoorLog } from '../services/zone.service';

@Component({
  selector: 'app-door-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './door-detail.component.html',
  styleUrls: ['./door-detail.component.sass']
})
export class DoorDetailComponent implements OnInit {

  doorId!: number;
  authorizedUsers: DoorAuthorizedUser[] = [];
  allowedLogs: DoorLog[] = [];
  deniedLogs: DoorLog[] = [];
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private zoneService: ZoneService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.doorId = Number(this.route.snapshot.paramMap.get('id'));

    this.zoneService.getDoorAuthorizedUsers(this.doorId).subscribe({
      next: (users) => {
        this.authorizedUsers = users;
        this.cdr.detectChanges();
      },
      error: () => this.cdr.detectChanges()
    });

    this.zoneService.getDoorLogs(this.doorId, true).subscribe({
      next: (logs) => {
        this.allowedLogs = logs;
        this.cdr.detectChanges();
      },
      error: () => this.cdr.detectChanges()
    });

    this.zoneService.getDoorLogs(this.doorId, false).subscribe({
      next: (logs) => {
        this.deniedLogs = logs;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/zones']);
  }
}