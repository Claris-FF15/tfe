import { Component, Inject, PLATFORM_ID, OnInit, ChangeDetectorRef, HostListener } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, GridApi, GridReadyEvent, RowClickedEvent, themeQuartz } from 'ag-grid-community';
import { AccessLogService } from '../services/access-log.service';
import { CheckboxSetFilterComponent } from '../checkbox-set-filter/checkbox-set-filter.component';

interface ActivityRow {
  id: number;
  utilisateur: string;
  action: string;
  porte: string;
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

  theme = themeQuartz.withParams({
    backgroundColor: '#11161c',
    foregroundColor: '#e7edf3',
    headerBackgroundColor: '#0e1319',
    headerTextColor: '#6e7c8c',
    headerFontWeight: 600,
    borderColor: '#1e2530',
    rowHoverColor: '#141a22',
    oddRowBackgroundColor: '#11161c',
    accentColor: '#3fd0c9',
    fontFamily: "'IBM Plex Mono', monospace",
    fontSize: 13.5,
    headerFontFamily: "'IBM Plex Mono', monospace",
    headerFontSize: 11,
    rowBorder: true,
    wrapperBorderRadius: 10,
    wrapperBorder: false,
  });

  rowData: ActivityRow[] = [];
  private gridApi!: GridApi;
  private avatarPalette = ['#3fd0c9', '#3a6ea5', '#f2a73b', '#9b7fd4'];

  pagination = true;
  paginationPageSize = 10;
  paginationPageSizeSelector = [10, 20, 50];

defaultColDef: ColDef = {
  filter: CheckboxSetFilterComponent,
  sortable: true,
  resizable: true,
};

  columnDefs: ColDef[] = [
    {
      field: 'id',
      headerName: 'ID',
      width: 100,
      minWidth: 100,
      filter: 'agNumberColumnFilter',
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
      field: 'action',
      headerName: 'Action',
      flex: 1.6,
      minWidth: 200,
      filterParams: {
        valueFormatter: (p: any) => p.value,
      },
      cellRenderer: (p: any) => {
        const ok = p.data.allowed === true;
        const bg = ok ? 'rgba(63,208,201,0.12)' : 'rgba(229,72,77,0.14)';
        const fg = ok ? '#3fd0c9' : '#e5484d';
        const border = ok ? 'rgba(63,208,201,0.35)' : 'rgba(229,72,77,0.4)';
        return `
          <div style="display:flex;align-items:center;height:100%;">
            <span style="
              display:inline-flex;align-items:center;gap:6px;
              height:26px;
              padding:0 10px;
              border-radius:6px;
              border:1px solid ${border};
              box-sizing:border-box;
              font-family:'IBM Plex Mono',monospace;
              font-size:11.5px;font-weight:600;
              text-transform:uppercase;letter-spacing:.03em;
              background:${bg};color:${fg};
              line-height:1;">
              <span style="width:6px;height:6px;min-width:6px;border-radius:50%;background:${fg};"></span>
              ${p.value}
            </span>
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

  getRowStyle = (params: any) => {
    if (params.data && params.data.allowed === false) {
      return { background: 'rgba(229, 72, 77, 0.06)' };
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
    event.api.sizeColumnsToFit();
  }

  @HostListener('window:resize')
  onResize(): void {
    this.gridApi?.sizeColumnsToFit();
  }

  onRowClicked(event: RowClickedEvent): void {
    const activity = event.data as ActivityRow;
    this.router.navigate(['/activities', activity.id]);
  }

  private getAvatarColor(name: string): string {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return this.avatarPalette[Math.abs(hash) % this.avatarPalette.length];
  }

  private loadLogs(): void {
    this.accessLogService.getAllLogs().subscribe({
      next: (logs) => {
        const mapped: ActivityRow[] = logs.map(log => ({
          id: log.id,
          utilisateur: log.user ? `${log.user.first_name} ${log.user.last_name}` : 'Inconnu',
          action: log.allowed ? 'Accès autorisé' : 'Accès refusé',
          porte: log.door?.name ?? 'Porte inconnue',
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
}