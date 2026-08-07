import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { BadgeService, UserBadge, AccessLog } from '../services/badge.service';
import { UserService, UserRow, AccessPermission } from '../services/user.service';

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

  loading = true;
  errorMessage = '';
  successMessage = '';

  statusForm;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private badgeService: BadgeService,
    private userService: UserService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {
    this.statusForm = this.fb.group({
      active: [true]
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

        this.userService.getUserById(badge.user_id).subscribe({
          next: (user) => {
            this.linkedUser = user;
            this.cdr.detectChanges();
          },
          error: () => this.cdr.detectChanges()
        });

        this.userService.getUserPermissions(badge.user_id).subscribe({
          next: (permissions) => {
            this.permissions = permissions;
            this.cdr.detectChanges();
          },
          error: () => this.cdr.detectChanges()
        });

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
  }

  onToggleStatus(): void {
    if (!this.badge) {
      return;
    }

    const newStatus = this.statusForm.value.active!;

    this.badgeService.updateBadge(this.badge.id, newStatus).subscribe({
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

  goToUser(): void {
    if (this.linkedUser) {
      this.router.navigate(['/users', this.linkedUser.id]);
    }
  }

  goBack(): void {
    this.router.navigate(['/badges']);
  }
}