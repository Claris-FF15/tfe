import { Component, OnInit } from '@angular/core';
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
  theme = themeQuartz;

  rowData: UserRow[] = [];
  private gridApi!: GridApi;

  columnDefs: ColDef[] = [
    { field: 'id', headerName: 'ID', width: 80 },
    { field: 'first_name', headerName: 'Prénom', flex: 1 },
    { field: 'last_name', headerName: 'Nom', flex: 1 },
    { field: 'email', headerName: 'Email', flex: 1.5 },
    { field: 'role_name', headerName: 'Rôle', flex: 1 },
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
          this.toggleStatus(params.data as UserRow);
        });
        return span;
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

  private loadUsers(): void {
    this.userService.getAllUsers().subscribe({
      next: (users) => {
        const mapped = users.map(u => ({
          ...u,
          role_name: u.role.name
        }));
        this.rowData = mapped;
        this.gridApi.setGridOption('rowData', mapped);
      },
      error: (err) => console.log('ERREUR:', err)
    });
  }
}