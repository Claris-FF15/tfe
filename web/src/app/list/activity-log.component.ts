import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, themeQuartz } from 'ag-grid-community';


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
export class ActivityLogComponent {

  isBrowser = false;


  theme = themeQuartz;


  rowData = [
    {
      id: 1,
      utilisateur: 'Admin',
      action: 'Connexion',
      date: '05/08/2026'
    },
    {
      id: 2,
      utilisateur: 'Clarisse',
      action: 'Création badge',
      date: '05/08/2026'
    },
    {
      id: 3,
      utilisateur: 'User',
      action: 'Modification profil',
      date: '05/08/2026'
    }
  ];


  columnDefs: ColDef[] = [
    {
      field: 'id',
      headerName: 'ID',
      width: 80
    },
    {
      field: 'utilisateur',
      headerName: 'Utilisateur',
      flex: 1
    },
    {
      field: 'action',
      headerName: 'Action',
      flex: 1
    },
    {
      field: 'date',
      headerName: 'Date',
      flex: 1
    }
  ];


  constructor(
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

}