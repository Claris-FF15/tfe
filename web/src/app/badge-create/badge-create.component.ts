import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { BadgeService } from '../services/badge.service';
import { UserService, UserRow } from '../services/user.service';

@Component({
  selector: 'app-badge-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './badge-create.component.html',
  styleUrls: ['./badge-create.component.sass']
})
export class BadgeCreateComponent implements OnInit {

  errorMessage = '';
  users: UserRow[] = [];

  createForm;

  constructor(
    private fb: FormBuilder,
    private badgeService: BadgeService,
    private userService: UserService,
    private router: Router
  ) {
    this.createForm = this.fb.group({
      uid: ['', Validators.required],
      user_id: this.fb.control<number | null>(null),
      active: [true]
    });
  }

  ngOnInit(): void {
    this.userService.getAllUsers().subscribe({
      next: (users) => {
        this.users = [...users].sort((a, b) =>
          `${a.first_name} ${a.last_name}`.localeCompare(`${b.first_name} ${b.last_name}`)
        );
      },
      error: (err) => console.log('Erreur chargement utilisateurs:', err)
    });
  }

  onSubmit(): void {
    if (this.createForm.invalid) {
      return;
    }

    this.badgeService.createBadge({
      uid: this.createForm.value.uid!,
      user_id: this.createForm.value.user_id ?? null,
      active: this.createForm.value.active!
    }).subscribe({
      next: () => {
        this.router.navigate(['/badges']);
      },
      error: (err) => {
        this.errorMessage = err.error?.detail ?? 'Erreur lors de la création';
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/badges']);
  }
}