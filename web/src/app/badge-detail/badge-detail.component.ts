import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { BadgeService, UserBadge, AccessLog } from '../services/badge.service';
import { UserService, UserRow, AccessPermission } from '../services/user.service';
import { ZoneService, DoorInZone } from '../services/zone.service';

@Component({
  selector: 'app-badge-detail',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './badge-detail.component.html',
  styleUrls: ['./badge-detail.component.sass']
})
export class BadgeDetailComponent implements OnInit {

  badge: UserBadge | null = null;
  linkedUser: UserRow | null = null;
  permissions: AccessPermission[] = [];
  logs: AccessLog[] = [];
  allDoors: DoorInZone[] = [];

  allUsers: UserRow[] = [];
  allBadges: UserBadge[] = [];

  loading = true;
  errorMessage = '';
  successMessage = '';

  showDeleteConfirm = false;
  showReassignForm = false;

  statusForm;
  accessForm;
  reassignForm;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private badgeService: BadgeService,
    private userService: UserService,
    private zoneService: ZoneService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {
    this.statusForm = this.fb.group({
      active: [true]
    });

    this.accessForm = this.fb.group({
      door_id: this.fb.control<number | null>(null)
    });

    this.reassignForm = this.fb.group({
      user_id: this.fb.control<number | null>(null)
    });
  }

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    const badgeId = Number(idParam);

    if (!idParam || isNaN(badgeId)) {
      this.errorMessage = 'Identifiant invalide';
      this.loading = false;
      this.cdr.detectChanges();
      return;
    }

    this.badgeService.getBadgeById(badgeId).subscribe({
      next: (badge) => {
        this.badge = badge;
        this.statusForm.patchValue({ active: badge.active });
        this.loading = false;

        if (badge.user_id != null) {
          this.userService.getUserById(badge.user_id).subscribe({
            next: (user) => {
              this.linkedUser = user;
              this.cdr.detectChanges();
            },
            error: () => this.cdr.detectChanges()
          });

          this.loadPermissions(badge.user_id);
        }

        this.badgeService.getBadgeLogs(badge.id).subscribe({
          next: (logs) => {
            this.logs = logs;
            this.cdr.detectChanges();
          },
          error: () => this.cdr.detectChanges()
        });

        this.cdr.detectChanges();
      },
      error: () => {
        this.errorMessage = 'Badge introuvable';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });

    this.zoneService.getAllDoors().subscribe({
      next: (doors) => {
        this.allDoors = doors;
        this.cdr.detectChanges();
      },
      error: () => this.cdr.detectChanges()
    });

    forkJoin({
      users: this.userService.getAllUsers(),
      badges: this.badgeService.getAllBadges()
    }).subscribe({
      next: ({ users, badges }) => {
        this.allUsers = users;
        this.allBadges = badges;
        this.cdr.detectChanges();
      },
      error: () => this.cdr.detectChanges()
    });
  }

  private loadPermissions(userId: number): void {
    this.userService.getUserPermissions(userId).subscribe({
      next: (permissions) => {
        this.permissions = permissions;
        this.cdr.detectChanges();
      },
      error: () => this.cdr.detectChanges()
    });
  }

  get availableDoors(): DoorInZone[] {
    const grantedIds = this.permissions.map(p => p.door.id);
    return this.allDoors.filter(d => !grantedIds.includes(d.id));
  }

  get availableUsersForReassign(): UserRow[] {
    const assignedUserIds = new Set(
      this.allBadges
        .filter(b => this.badge && b.id !== this.badge.id && b.user_id != null)
        .map(b => b.user_id as number)
    );
    return this.allUsers
      .filter(u => !assignedUserIds.has(u.id))
      .sort((a, b) => `${a.first_name} ${a.last_name}`.localeCompare(`${b.first_name} ${b.last_name}`));
  }

  get hasNoUser(): boolean {
    return this.badge != null && this.badge.user_id == null;
  }

  isServeurZone(door: DoorInZone): boolean {
    return door.zone?.name.toLowerCase() === 'salle serveur';
  }

  onToggleStatus(): void {
    if (!this.badge) {
      return;
    }

    const newStatus = this.statusForm.value.active!;

    this.badgeService.updateBadge(this.badge.id, { active: newStatus }).subscribe({
      next: (updated) => {
        this.badge = updated;
        this.successMessage = 'Statut mis à jour avec succès';
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorMessage = err.error?.detail ?? 'Erreur lors de la mise à jour';
        this.cdr.detectChanges();
      }
    });
  }

  toggleReassignForm(): void {
    this.showReassignForm = !this.showReassignForm;
    this.reassignForm.reset();
    this.successMessage = '';
    this.errorMessage = '';
  }

  onReassignUser(): void {
    if (!this.badge || !this.reassignForm.value.user_id) {
      return;
    }

    const newUserId = this.reassignForm.value.user_id;

    this.badgeService.updateBadge(this.badge.id, { user_id: newUserId }).subscribe({
      next: (updated) => {
        this.badge = updated;
        this.successMessage = 'Utilisateur réassigné avec succès';
        this.showReassignForm = false;

        this.userService.getUserById(updated.user_id!).subscribe({
          next: (user) => {
            this.linkedUser = user;
            this.loadPermissions(user.id);
            this.cdr.detectChanges();
          },
          error: () => this.cdr.detectChanges()
        });

        this.badgeService.getAllBadges().subscribe({
          next: (badges) => {
            this.allBadges = badges;
            this.cdr.detectChanges();
          }
        });

        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorMessage = err.error?.detail ?? 'Erreur lors de la réassignation';
        this.cdr.detectChanges();
      }
    });
  }

  onRemoveUser(): void {
    if (!this.badge) {
      return;
    }

    this.badgeService.updateBadge(this.badge.id, { user_id: null }).subscribe({
      next: (updated) => {
        this.badge = updated;
        this.linkedUser = null;
        this.permissions = [];
        this.successMessage = 'Utilisateur retiré avec succès';
        this.showReassignForm = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorMessage = err.error?.detail ?? 'Erreur lors du retrait de l\'utilisateur';
        this.cdr.detectChanges();
      }
    });
  }

  confirmDelete(): void {
    this.showDeleteConfirm = true;
  }

  cancelDelete(): void {
    this.showDeleteConfirm = false;
  }

  onDeleteBadge(): void {
    if (!this.badge) {
      return;
    }

    this.badgeService.deleteBadge(this.badge.id).subscribe({
      next: () => {
        this.router.navigate(['/badges']);
      },
      error: (err) => {
        this.errorMessage = err.error?.detail ?? 'Erreur lors de la suppression';
        this.showDeleteConfirm = false;
        this.cdr.detectChanges();
      }
    });
  }

  onGrantAccess(): void {
    if (!this.linkedUser || !this.accessForm.value.door_id) {
      return;
    }

    this.userService.grantPermission(this.linkedUser.id, this.accessForm.value.door_id).subscribe({
      next: () => {
        this.successMessage = 'Accès accordé avec succès';
        this.accessForm.reset();
        this.loadPermissions(this.linkedUser!.id);
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorMessage = err.error?.detail ?? 'Erreur lors de l\'ajout de l\'accès';
        this.cdr.detectChanges();
      }
    });
  }

  onRevokeAccess(permission: AccessPermission): void {
    if (!this.linkedUser) {
      return;
    }

    this.userService.revokePermission(this.linkedUser.id, permission.id).subscribe({
      next: () => {
        this.successMessage = 'Accès retiré avec succès';
        this.loadPermissions(this.linkedUser!.id);
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorMessage = err.error?.detail ?? 'Erreur lors du retrait de l\'accès';
        this.cdr.detectChanges();
      }
    });
  }

  goToUser(): void {
    if (this.linkedUser) {
      this.router.navigate(['/users', this.linkedUser.id]);
    }
  }

  goBack(): void {
    this.location.back();
  }
}