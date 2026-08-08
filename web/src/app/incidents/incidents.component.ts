import { Component, Inject, PLATFORM_ID, OnInit, ChangeDetectorRef, HostListener } from '@angular/core';
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

  theme = themeQuartz.withParams({
    backgroundColor: '#11161c',
    foregroundColor: '#e7edf3',
    headerBackgroundColor: '#0e1319',
    headerTextColor: '#6e7c8c',
    headerFontWeight: 600,
    borderColor: '#1e2530',
    rowHoverColor: '#1c1418',
    oddRowBackgroundColor: '#11161c',
    accentColor: '#e5484d',
    fontFamily: "'IBM Plex Mono', monospace",
    fontSize: 13.5,
    headerFontFamily: "'IBM Plex Mono', monospace",
    headerFontSize: 11,
    rowBorder: true,
    wrapperBorderRadius: 10,
    wrapperBorder: false,
  });

  rowData: IncidentRow[] = [];
  private gridApi!: GridApi;
  private avatarPalette = ['#e5484d', '#c9455a', '#f2716b'];

  columnDefs: ColDef[] = [
    {
      field: 'id',
      headerName: 'ID',
      width: 100,
      minWidth: 100,
      cellStyle: {
        fontFamily: "'IBM Plex Mono', monospace",
        color: '#6e7c8c',
        fontSize: '12.5px',
      },
      valueFormatter: (p) => '#' + String(p.value).padStart(3, '0'),
    },
    {
      field: 'utilisateur',
      headerName: 'Utilisateur',
      flex: 2,
      minWidth: 220,
      cellRenderer: (p: any) => {
        const initial = p.value.charAt(0).toUpperCase();
        const color = this.getAvatarColor(p.value);
        return `
          <div style="display:flex;align-items:center;gap:10px;height:100%;font-family:'IBM Plex Mono',monospace;">
            <div style="
              width:26px;height:26px;min-width:26px;
              border-radius:50%;
              display:flex;align-items:center;justify-content:center;
              font-size:11px;font-weight:700;
              font-family:'IBM Plex Mono',monospace;
              color:#0b0f14;background:${color};">
              ${initial}
            </div>
            <span>${p.value}</span>
          </div>`;
      },
    },
    {
      field: 'porte',
      headerName: 'Porte',
      flex: 1.8,
      minWidth: 200,
      cellRenderer: (p: any) => {
        return `
          <div style="display:flex;align-items:center;gap:8px;height:100%;color:#cfd8e0;font-family:'IBM Plex Mono',monospace;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="flex-shrink:0;opacity:.7;">
              <rect x="5" y="11" width="14" height="9" rx="2"/>
              <path d="M8 11V8a4 4 0 0 1 8 0v3"/>
            </svg>
            <span>${p.value}</span>
          </div>`;
      },
    },
    {
      field: 'date',
      headerName: 'Date',
      flex: 1.6,
      minWidth: 190,
      cellRenderer: (p: any) =>
        `<span style="font-family:'IBM Plex Mono',monospace;font-size:12px;color:#6e7c8c;">${p.value}</span>`,
    },
  ];

  getRowStyle = () => {
    return { background: 'rgba(229, 72, 77, 0.06)' };
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
    event.api.sizeColumnsToFit();
  }

  @HostListener('window:resize')
  onResize(): void {
    this.gridApi?.sizeColumnsToFit();
  }

  onRowClicked(event: RowClickedEvent): void {
    const incident = event.data as IncidentRow;
    this.router.navigate(['/activities', incident.id]);
  }

  private getAvatarColor(name: string): string {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return this.avatarPalette[Math.abs(hash) % this.avatarPalette.length];
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