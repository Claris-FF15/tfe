import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ZoneService, Zone } from '../services/zone.service';

@Component({
  selector: 'app-zone-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './zone-create.component.html',
  styleUrls: ['./zone-create.component.sass']
})
export class ZoneCreateComponent implements OnInit {

  errorMessage = '';
  zones: Zone[] = [];
  creatingNewZone = false;

  form;

  constructor(
    private fb: FormBuilder,
    private zoneService: ZoneService,
    private router: Router
  ) {
    this.form = this.fb.group({
      door_name: ['', Validators.required],
      zone_id: this.fb.control<number | null>(null),
      new_zone_name: [''],
      new_zone_description: ['']
    });
  }

  ngOnInit(): void {
    this.zoneService.getAllZones().subscribe({
      next: (zones) => {
        this.zones = zones;
      },
      error: () => {
        this.errorMessage = 'Impossible de charger les zones';
      }
    });
  }

  toggleNewZone(): void {
    this.creatingNewZone = !this.creatingNewZone;
    if (this.creatingNewZone) {
      this.form.patchValue({ zone_id: null });
    } else {
      this.form.patchValue({ new_zone_name: '', new_zone_description: '' });
    }
  }

  get canSubmit(): boolean {
    if (this.form.get('door_name')?.invalid) {
      return false;
    }
    if (this.creatingNewZone) {
      return !!this.form.value.new_zone_name;
    }
    return !!this.form.value.zone_id;
  }

  onSubmit(): void {
    if (!this.canSubmit) {
      return;
    }

    const doorName = this.form.value.door_name!;

    if (this.creatingNewZone) {
      this.zoneService.createZone({
        name: this.form.value.new_zone_name!,
        description: this.form.value.new_zone_description || null
      }).subscribe({
        next: (zone) => this.createDoor(doorName, zone.id),
        error: (err) => {
          this.errorMessage = err.error?.detail ?? 'Erreur lors de la création de la zone';
        }
      });
    } else {
      this.createDoor(doorName, this.form.value.zone_id!);
    }
  }

  private createDoor(name: string, zoneId: number): void {
    this.zoneService.createDoor({
      name,
      active: true,
      zone_id: zoneId
    }).subscribe({
      next: () => {
        this.router.navigate(['/zones']);
      },
      error: (err) => {
        this.errorMessage = err.error?.detail ?? 'Erreur lors de la création de la porte';
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/zones']);
  }
}