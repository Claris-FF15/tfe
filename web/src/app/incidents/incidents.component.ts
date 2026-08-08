import { Component, Inject, PLATFORM_ID, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, GridApi, GridReadyEvent, RowClickedEvent, themeQuartz } from 'ag-grid-community';
import { AccessLogService } from '../services/access-log.service';

interface IncidentRow {
  id: number;
  utilisateur: string;
  porte: string;
  date: string;
}

@Component({
  selector: 'app-incidents',
  standalone: true,
  imports: [
    CommonModule,
    AgGridAngular
  ],
  templateUrl: './incidents.component.html',
  styleUrl: './incidents.component.sass'
})
export class IncidentsComponent implements OnInit {

  isBrowser = false;
  theme = themeQuartz;

  rowData: IncidentRow[] = [];
  private gridApi!: GridApi;

  columnDefs: ColDef[] = [
    { field: 'id', headerName: 'ID', width: 80 },
    { field: 'utilisateur', headerName: 'Utilisateur', flex: 1 },
    { field: 'porte', headerName: 'Porte', flex: 1 },
    { field: 'date', headerName: 'Date', flex: 1 }
  ];

  getRowStyle = () => {
    return { background: 'rgba(231, 76, 60, 0.12)' };
  };

  constructor(
    @Inject(PLATFORM_ID) platformId: Object,
    private accessLogService: AccessLogService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit(): void {}

  onGridReady(event: GridReadyEvent): void {
    this.gridApi = event.api;
    this.loadIncidents();
  }

  onRowClicked(event: RowClickedEvent): void {
    const incident = event.data as IncidentRow;
    this.router.navigate(['/activities', incident.id]);
  }

  private loadIncidents(): void {
    this.accessLogService.getAllLogs(false).subscribe({
      next: (logs) => {
        const mapped: IncidentRow[] = logs.map(log => ({
          id: log.id,
          utilisateur: log.user ? `${log.user.first_name} ${log.user.last_name}` : 'Inconnu',
          porte: log.door?.name ?? 'Porte inconnue',
          date: new Date(log.timestamp).toLocaleString('fr-FR')
        }));
        this.rowData = mapped;
        this.gridApi.setGridOption('rowData', mapped);
        this.cdr.detectChanges();
      },
      error: (err) => console.log('ERREUR:', err)
    });
  }
}