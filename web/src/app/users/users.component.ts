import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Inject, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, GridApi, GridReadyEvent, RowClickedEvent, themeQuartz, ICellRendererParams } from 'ag-grid-community';
import { UserService, UserRow } from '../services/user.service';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, AgGridAngular],
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.sass']
})
export class UsersComponent implements OnInit {

  isBrowser: boolean;

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

  rowData: UserRow[] = [];
  private gridApi!: GridApi;
  private avatarPalette = ['#3fd0c9', '#3a6ea5', '#f2a73b', '#9b7fd4'];

  columnDefs: ColDef[] = [
    {
      field: 'id',
      headerName: 'ID',
      width: 100,
      minWidth: 100,
      sort: 'asc',        // <- tri visuel par défaut sur cette colonne
      sortIndex: 0,
      cellStyle: {
        fontFamily: "'IBM Plex Mono', monospace",
        color: '#6e7c8c',
        fontSize: '12.5px',
      },
      valueFormatter: (p) => '#' + String(p.value).padStart(3, '0'),
    },
    {
      field: 'first_name',
      headerName: 'Prénom',
      flex: 1.3,
      minWidth: 160,
      cellRenderer: (p: any) => {
        const initial = (p.value?.charAt(0) || '?').toUpperCase();
        const color = this.getAvatarColor(p.value || '');
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
      field: 'last_name',
      headerName: 'Nom',
      flex: 1.3,
      minWidth: 160,
      cellStyle: { fontFamily: "'IBM Plex Mono', monospace" },
    },
    {
      field: 'email',
      headerName: 'Email',
      flex: 1.8,
      minWidth: 220,
      cellStyle: {
        fontFamily: "'IBM Plex Mono', monospace",
        color: '#cfd8e0',
        fontSize: '12.5px',
      },
    },
    {
      field: 'role_name',
      headerName: 'Rôle',
      flex: 1.2,
      minWidth: 170,
      cellRenderer: (p: any) => {
        return `<span style="
          font-family:'IBM Plex Mono',monospace;
          font-size:11.5px;
          color:#6e7c8c;
          text-transform:uppercase;
          letter-spacing:.04em;">
          ${p.value}
        </span>`;
      },
    },
    {
      field: 'active',
      headerName: 'Statut',
      flex: 1,
      minWidth: 140,
      cellRenderer: (params: ICellRendererParams) => {
        const isActive = params.value;
        const bg = isActive ? 'rgba(63,208,201,0.12)' : 'rgba(229,72,77,0.14)';
        const fg = isActive ? '#3fd0c9' : '#e5484d';
        const border = isActive ? 'rgba(63,208,201,0.35)' : 'rgba(229,72,77,0.4)';

        const wrapper = document.createElement('div');
        wrapper.style.display = 'flex';
        wrapper.style.alignItems = 'center';
        wrapper.style.height = '100%';

        const span = document.createElement('span');
        span.textContent = isActive ? 'ACTIF' : 'INACTIF';
        span.style.cursor = 'pointer';
        span.style.display = 'inline-flex';
        span.style.alignItems = 'center';
        span.style.gap = '6px';
        span.style.height = '26px';
        span.style.padding = '0 10px';
        span.style.borderRadius = '6px';
        span.style.border = `1px solid ${border}`;
        span.style.boxSizing = 'border-box';
        span.style.fontFamily = "'IBM Plex Mono', monospace";
        span.style.fontSize = '11.5px';
        span.style.fontWeight = '600';
        span.style.letterSpacing = '.03em';
        span.style.lineHeight = '1';
        span.style.background = bg;
        span.style.color = fg;

        const dot = document.createElement('span');
        dot.style.width = '6px';
        dot.style.height = '6px';
        dot.style.minWidth = '6px';
        dot.style.borderRadius = '50%';
        dot.style.background = fg;
        span.prepend(dot);

        span.addEventListener('click', (e) => {
          e.stopPropagation();
          this.toggleStatus(params.data as UserRow);
        });

        wrapper.appendChild(span);
        return wrapper;
      }
    }
  ];

  constructor(
    private userService: UserService,
    private router: Router,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  onGridReady(event: GridReadyEvent): void {
    this.gridApi = event.api;
    this.loadUsers();
    event.api.sizeColumnsToFit();
  }

  @HostListener('window:resize')
  onResize(): void {
    this.gridApi?.sizeColumnsToFit();
  }

  onRowClicked(event: RowClickedEvent): void {
    const user = event.data as UserRow;
    this.router.navigate(['/users', user.id]);
  }

  goToCreate(): void {
    this.router.navigate(['/users/new']);
  }

  ngOnInit(): void {}

  toggleStatus(user: UserRow): void {
    this.userService.updateActive(user.id, !user.active).subscribe({
      next: () => this.loadUsers(),
      error: (err) => console.log('Erreur mise à jour statut:', err)
    });
  }

  private getAvatarColor(name: string): string {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return this.avatarPalette[Math.abs(hash) % this.avatarPalette.length];
  }

  private loadUsers(): void {
    this.userService.getAllUsers().subscribe({
      next: (users) => {
        const mapped = users
          .map(u => ({
            ...u,
            role_name: u.role.name
          }))
          .sort((a, b) => a.id - b.id);   // <- tri croissant par ID, garanti côté données

        this.rowData = mapped;
        this.gridApi.setGridOption('rowData', mapped);
      },
      error: (err) => console.log('ERREUR:', err)
    });
  }
}