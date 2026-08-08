import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { AccessLogService, AccessLogEntry } from '../services/access-log.service';

@Component({
  selector: 'app-activity-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './activity-detail.component.html',
  styleUrls: ['./activity-detail.component.sass']
})
export class ActivityDetailComponent implements OnInit {

  log: AccessLogEntry | null = null;
  loading = true;
  errorMessage = '';

  constructor(
    private route: ActivatedRoute,
    private location: Location,
    private accessLogService: AccessLogService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    const logId = Number(idParam);

    if (!idParam || isNaN(logId)) {
      this.errorMessage = 'Identifiant invalide';
      this.loading = false;
      this.cdr.detectChanges();
      return;
    }

    this.accessLogService.getLogById(logId).subscribe({
      next: (log) => {
        this.log = log;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.errorMessage = 'Log introuvable';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  goBack(): void {
    this.location.back();
  }
}