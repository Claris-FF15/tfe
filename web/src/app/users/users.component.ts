import { Component, OnInit } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Inject, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, GridApi, GridReadyEvent, RowClickedEvent, themeQuartz } from 'ag-grid-community';
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
      valueFormatter: (params) => params.value ? 'Actif' : 'Inactif'
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