import { Component, OnInit } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Inject, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, GridApi, GridReadyEvent, RowClickedEvent, themeQuartz, ICellRendererParams } from 'ag-grid-community';
import { BadgeService, UserBadge } from '../services/badge.service';

@Component({
  selector: 'app-badges',
  standalone: true,
  imports: [CommonModule, AgGridAngular],
  templateUrl: './badges.component.html',
  styleUrls: ['./badges.component.sass']
})
export class BadgesComponent implements OnInit {

  isBrowser: boolean;
  theme = themeQuartz;

  rowData: UserBadge[] = [];
  private gridApi!: GridApi;

  columnDefs: ColDef[] = [
    { field: 'id', headerName: 'ID', width: 80 },
    { field: 'uid', headerName: 'ID Badge', flex: 1 },
    { field: 'user_id', headerName: 'ID Utilisateur', flex: 1 },
    {
      field: 'active',
      headerName: 'Statut',
      flex: 1,
      cellRenderer: (params: ICellRendererParams) => {
        const isActive = params.value;
        const span = document.createElement('span');
        span.textContent = isActive ? 'Actif' : 'Inactif';
        span.style.cursor = 'pointer';
        span.style.fontWeight = '600';
        span.style.padding = '3px 10px';
        span.style.borderRadius = '20px';
        span.style.fontSize = '0.8rem';
        if (isActive) {
          span.style.background = 'rgba(46, 125, 50, 0.12)';
          span.style.color = '#2e7d32';
        } else {
          span.style.background = 'rgba(231, 76, 60, 0.12)';
          span.style.color = '#e74c3c';
        }
        span.addEventListener('click', (e) => {
          e.stopPropagation();
          this.toggleStatus(params.data as UserBadge);
        });
        return span;
      }
    },
    {
      field: 'last_activity',
      headerName: 'Dernière activité',
      flex: 1.2,
      valueFormatter: (params) => {
        if (!params.value) {
          return 'Aucune activité';
        }
        return new Date(params.value).toLocaleString('fr-FR');
      }
    }
  ];

  constructor(
    private badgeService: BadgeService,
    private router: Router,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  onGridReady(event: GridReadyEvent): void {
    this.gridApi = event.api;
    this.loadBadges();
  }

  onRowClicked(event: RowClickedEvent): void {
    const badge = event.data as UserBadge;
    this.router.navigate(['/badges', badge.id]);
  }

  goToCreate(): void {
    this.router.navigate(['/badges/new']);
  }

  ngOnInit(): void {}

  toggleStatus(badge: UserBadge): void {
    this.badgeService.updateBadge(badge.id, !badge.active).subscribe({
      next: () => this.loadBadges(),
      error: (err) => console.log('Erreur mise à jour statut:', err)
    });
  }

  private loadBadges(): void {
    this.badgeService.getAllBadges().subscribe({
      next: (badges) => {
        this.rowData = badges;
        this.gridApi.setGridOption('rowData', badges);
      },
      error: (err) => console.log('ERREUR:', err)
    });
  }
}