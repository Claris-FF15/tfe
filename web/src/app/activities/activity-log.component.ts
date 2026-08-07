import { Component, Inject, PLATFORM_ID, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, GridApi, GridReadyEvent, RowClickedEvent, themeQuartz } from 'ag-grid-community';
import { AccessLogService } from '../services/access-log.service';

interface ActivityRow {
  id: number;
  utilisateur: string;
  action: string;
  date: string;
  allowed: boolean;
}

@Component({
  selector: 'app-activity-log',
  standalone: true,
  imports: [
    CommonModule,
    AgGridAngular
  ],
  templateUrl: './activity-log.component.html',
  styleUrl: './activity-log.component.sass'
})
export class ActivityLogComponent implements OnInit {

  isBrowser = false;
  theme = themeQuartz;

  rowData: ActivityRow[] = [];
  private gridApi!: GridApi;

  columnDefs: ColDef[] = [
    { field: 'id', headerName: 'ID', width: 80 },
    { field: 'utilisateur', headerName: 'Utilisateur', flex: 1 },
    { field: 'action', headerName: 'Action', flex: 1.5 },
    { field: 'date', headerName: 'Date', flex: 1 }
  ];

  getRowStyle = (params: any) => {
    if (params.data && params.data.allowed === false) {
      return { background: 'rgba(231, 76, 60, 0.12)' };
    }
    return undefined;
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
    this.loadLogs();
  }

  onRowClicked(event: RowClickedEvent): void {
    const activity = event.data as ActivityRow;
    this.router.navigate(['/activities', activity.id]);
  }

  private loadLogs(): void {
    this.accessLogService.getAllLogs().subscribe({
      next: (logs) => {
        const mapped: ActivityRow[] = logs.map(log => ({
          id: log.id,
          utilisateur: log.user ? `${log.user.first_name} ${log.user.last_name}` : 'Inconnu',
          action: this.formatAction(log),
          date: new Date(log.timestamp).toLocaleString('fr-FR'),
          allowed: log.allowed
        }));
        this.rowData = mapped;
        this.gridApi.setGridOption('rowData', mapped);
        this.cdr.detectChanges();
      },
      error: (err) => console.log('ERREUR:', err)
    });
  }

  private formatAction(log: any): string {
    const doorName = log.door?.name ?? 'porte inconnue';
    return log.allowed
      ? `Accès autorisé - ${doorName}`
      : `Accès refusé - ${doorName}`;
  }
}