import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { UserService, UserRow } from '../services/user.service';
import { AuthService } from '../services/auth.service';
import { BadgeService, UserBadge } from '../services/badge.service';

@Component({
  selector: 'app-user-detail',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './user-detail.component.html',
  styleUrls: ['./user-detail.component.sass']
})
export class UserDetailComponent implements OnInit, OnDestroy {

  user: UserRow | null = null;
  loading = true;
  errorMessage = '';
  successMessage = '';

  canEdit = false;
  canEditRole = false;

  badge: UserBadge | null = null;
  badgeLoading = true;
  badgeError = false;

  roles = [
    { id: 2, name: 'user' },
    { id: 1, name: 'admin' },
    { id: 3, name: 'responsable_securite' }
  ];

  nameForm;
  roleForm;
  statusControl;

  private permissionSub?: Subscription;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService,
    private authService: AuthService,
    private badgeService: BadgeService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {
    this.nameForm = this.fb.group({
      first_name: ['', Validators.required],
      last_name: ['', Validators.required]
    });

    this.roleForm = this.fb.group({
      role_id: this.fb.control<number | null>(null, Validators.required)
    });

    this.statusControl = this.fb.control<boolean>(true);
  }

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    const userId = Number(idParam);

    if (!idParam || isNaN(userId)) {
      this.errorMessage = 'Identifiant invalide';
      this.loading = false;
      this.cdr.detectChanges();
      return;
    }

    this.userService.getUserById(userId).subscribe({
      next: (user) => {
        this.user = user;
        this.nameForm.patchValue({
          first_name: user.first_name,
          last_name: user.last_name
        });
        this.roleForm.patchValue({ role_id: user.role.id });
        this.statusControl.setValue(user.active);
        this.evaluatePermissions(user);
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.errorMessage = 'Utilisateur introuvable';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });

    this.badgeService.getBadgeByUserId(userId).subscribe({
      next: (badge) => {
        this.badge = badge;
        this.badgeLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.badgeLoading = false;
        this.badgeError = true;
        this.cdr.detectChanges();
      }
    });
  }

  ngOnDestroy(): void {
    this.permissionSub?.unsubscribe();
  }

  private evaluatePermissions(targetUser: UserRow): void {
    this.permissionSub = this.authService.currentUser$.subscribe(currentUser => {
      if (!currentUser || !currentUser.role || !targetUser.role) {
        this.canEdit = false;
        this.canEditRole = false;
        this.cdr.detectChanges();
        return;
      }

      const myRole = currentUser.role.name.toLowerCase();
      const targetRole = targetUser.role.name.toLowerCase();

      if (myRole === 'responsable_securite') {
        this.canEdit = true;
        this.canEditRole = true;
      } else if (myRole === 'admin') {
        this.canEdit = currentUser.id === targetUser.id || targetRole === 'user';
        this.canEditRole = false;
      } else {
        this.canEdit = false;
        this.canEditRole = false;
      }

      this.cdr.detectChanges();
    });
  }

  onSave(): void {
    if (!this.user || this.nameForm.invalid) {
      return;
    }

    this.userService.updateName(
      this.user.id,
      this.nameForm.value.first_name!,
      this.nameForm.value.last_name!
    ).subscribe({
      next: (updated) => {
        this.user = updated;
        this.successMessage = 'Utilisateur mis à jour avec succès';
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorMessage = err.error?.detail ?? 'Erreur lors de la mise à jour';
        this.cdr.detectChanges();
      }
    });
  }

  onSaveRole(): void {
    if (!this.user || this.roleForm.invalid) {
      return;
    }

    this.userService.updateRole(
      this.user.id,
      this.roleForm.value.role_id!
    ).subscribe({
      next: (updated) => {
        this.user = updated;
        this.successMessage = 'Rôle mis à jour avec succès';
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorMessage = err.error?.detail ?? 'Erreur lors de la mise à jour du rôle';
        this.cdr.detectChanges();
      }
    });
  }

  onUpdateStatus(): void {
    if (!this.user) {
      return;
    }

    this.userService.updateActive(
      this.user.id,
      this.statusControl.value!
    ).subscribe({
      next: (updated) => {
        this.user = updated;
        this.successMessage = 'Statut mis à jour avec succès';
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorMessage = err.error?.detail ?? 'Erreur lors de la mise à jour du statut';
        this.cdr.detectChanges();
      }
    });
  }

  goToBadge(): void {
    if (this.badge) {
      this.router.navigate(['/badges', this.badge.id]);
    }
  }

  goBack(): void {
    this.router.navigate(['/users']);
  }
}