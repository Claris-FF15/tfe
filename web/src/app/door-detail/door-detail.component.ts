import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ZoneService, DoorAuthorizedUser, DoorLog, DoorInZone } from '../services/zone.service';
import { UserService, UserRow } from '../services/user.service';

@Component({
  selector: 'app-door-detail',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './door-detail.component.html',
  styleUrls: ['./door-detail.component.sass']
})
export class DoorDetailComponent implements OnInit {

  doorId!: number;
  door: DoorInZone | null = null;
  authorizedUsers: DoorAuthorizedUser[] = [];
  allUsers: UserRow[] = [];
  allowedLogs: DoorLog[] = [];
  deniedLogs: DoorLog[] = [];
  loading = true;

  errorMessage = '';
  successMessage = '';

  accessForm;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private zoneService: ZoneService,
    private userService: UserService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {
    this.accessForm = this.fb.group({
      user_id: this.fb.control<number | null>(null)
    });
  }

  ngOnInit(): void {
    this.doorId = Number(this.route.snapshot.paramMap.get('id'));

    this.zoneService.getAllDoors().subscribe({
      next: (doors) => {
        this.door = doors.find(d => d.id === this.doorId) ?? null;
        this.cdr.detectChanges();
      },
      error: () => this.cdr.detectChanges()
    });

    this.loadAuthorizedUsers();

    this.userService.getAllUsers().subscribe({
      next: (users) => {
        this.allUsers = users;
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

  private loadAuthorizedUsers(): void {
    this.zoneService.getDoorAuthorizedUsers(this.doorId).subscribe({
      next: (users) => {
        this.authorizedUsers = users;
        this.cdr.detectChanges();
      },
      error: () => this.cdr.detectChanges()
    });
  }

  get availableUsers(): UserRow[] {
    const authorizedIds = this.authorizedUsers.map(a => a.user.id);
    return this.allUsers.filter(u => !authorizedIds.includes(u.id));
  }

  isServeurZone(): boolean {
    return this.door?.zone?.name.toLowerCase() === 'salle serveur';
  }

  onGrantAccess(): void {
    const userId = this.accessForm.value.user_id;
    if (!userId) {
      return;
    }

    this.userService.grantPermission(userId, this.doorId).subscribe({
      next: () => {
        this.successMessage = 'Accès accordé avec succès';
        this.accessForm.reset();
        this.loadAuthorizedUsers();
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorMessage = err.error?.detail ?? 'Erreur lors de l\'ajout de l\'accès';
        this.cdr.detectChanges();
      }
    });
  }

  onRevokeAccess(permission: DoorAuthorizedUser): void {
    this.userService.revokePermission(permission.user.id, permission.id).subscribe({
      next: () => {
        this.successMessage = 'Accès retiré avec succès';
        this.loadAuthorizedUsers();
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorMessage = err.error?.detail ?? 'Erreur lors du retrait de l\'accès';
        this.cdr.detectChanges();
      }
    });
  }

  goToActivity(logId: number): void {
    this.router.navigate(['/activities', logId]);
  }

  goBack(): void {
    this.router.navigate(['/zones']);
  }
}