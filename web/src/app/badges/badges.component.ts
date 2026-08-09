import { Component, OnInit, HostListener, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Inject, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, GridApi, GridReadyEvent, RowClickedEvent, themeQuartz, ICellRendererParams } from 'ag-grid-community';
import { BadgeService, UserBadge } from '../services/badge.service';
import { UserService, UserRow } from '../services/user.service';

interface BadgeRow extends UserBadge {
  user_name: string;
}

@Component({
  selector: 'app-badges',
  standalone: true,
  imports: [CommonModule, AgGridAngular],
  templateUrl: './badges.component.html',
  styleUrls: ['./badges.component.sass']
})
export class BadgesComponent implements OnInit {

  isBrowser: boolean;
  errorMessage = '';

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

  rowData: BadgeRow[] = [];
  private gridApi!: GridApi;
  private avatarPalette = ['#3fd0c9', '#3a6ea5', '#f2a73b', '#9b7fd4'];

  columnDefs: ColDef[] = [
    {
      field: 'id',
      headerName: 'ID',
      width: 100,
      minWidth: 100,
      sort: 'asc',
      sortIndex: 0,
      cellStyle: {
        fontFamily: "'IBM Plex Mono', monospace",
        color: '#6e7c8c',
        fontSize: '12.5px',
      },
      valueFormatter: (p) => '#' + String(p.value).padStart(3, '0'),
    },
    {
      field: 'uid',
      headerName: 'ID Badge',
      flex: 1.3,
      minWidth: 170,
      cellRenderer: (p: any) => {
        return `
          <div style="display:flex;align-items:center;gap:8px;height:100%;color:#cfd8e0;font-family:'IBM Plex Mono',monospace;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="flex-shrink:0;opacity:.7;">
              <rect x="3" y="6" width="18" height="12" rx="2"/>
              <circle cx="9" cy="12" r="2"/>
              <path d="M14 10h4M14 14h3"/>
            </svg>
            <span>${p.value}</span>
          </div>`;
      },
    },
    {
      field: 'user_name',
      headerName: 'Utilisateur',
      flex: 1.6,
      minWidth: 200,
      cellRenderer: (p: any) => {
        const hasUser = p.data.user_id != null;
        if (!hasUser) {
          return `<span style="color:#4a525c;font-style:italic;font-family:'IBM Plex Mono',monospace;font-size:12.5px;">Aucun utilisateur</span>`;
        }
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
          this.toggleStatus(params.data as UserBadge);
        });

        wrapper.appendChild(span);
        return wrapper;
      }
    },
    {
      field: 'last_activity',
      headerName: 'Dernière activité',
      flex: 1.6,
      minWidth: 200,
      valueFormatter: (params) => {
        if (!params.value) {
          return 'Aucune activité';
        }
        return new Date(params.value).toLocaleString('fr-FR');
      },
      cellStyle: {
        fontFamily: "'IBM Plex Mono', monospace",
        color: '#6e7c8c',
        fontSize: '12px',
      },
    }
  ];

  constructor(
    private badgeService: BadgeService,
    private userService: UserService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  onGridReady(event: GridReadyEvent): void {
    this.gridApi = event.api;
    this.loadBadges();
    event.api.sizeColumnsToFit();
  }

  @HostListener('window:resize')
  onResize(): void {
    this.gridApi?.sizeColumnsToFit();
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
    this.errorMessage = '';

    this.badgeService.updateBadge(badge.id, { active: !badge.active }).subscribe({
      next: () => this.loadBadges(),
      error: (err) => {
        this.errorMessage = err.error?.detail ?? 'Erreur lors de la mise à jour du statut';
        this.cdr.detectChanges();
      }
    });
  }

  private getAvatarColor(name: string): string {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return this.avatarPalette[Math.abs(hash) % this.avatarPalette.length];
  }

  private loadBadges(): void {
    forkJoin({
      badges: this.badgeService.getAllBadges(),
      users: this.userService.getAllUsers()
    }).subscribe({
      next: ({ badges, users }) => {
        const userMap = new Map<number, UserRow>(users.map(u => [u.id, u]));

        const mapped: BadgeRow[] = badges
          .map(b => {
            const user = b.user_id != null ? userMap.get(b.user_id) : undefined;
            return {
              ...b,
              user_name: user ? `${user.first_name} ${user.last_name}` : 'Aucun utilisateur'
            };
          })
          .sort((a, b) => a.id - b.id);

        this.rowData = mapped;
        this.gridApi.setGridOption('rowData', mapped);
        this.cdr.detectChanges();
      },
      error: (err) => console.log('ERREUR:', err)
    });
  }
}