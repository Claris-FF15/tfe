import { Component, OnInit } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Inject, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, GridApi, GridReadyEvent, RowClickedEvent, themeQuartz } from 'ag-grid-community';
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
      valueFormatter: (params) => params.value ? 'Actif' : 'Inactif'
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