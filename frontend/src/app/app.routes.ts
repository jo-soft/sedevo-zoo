import { Routes } from '@angular/router';
import {OverviewComponent} from './pages/overview/overview.component';
import {EditComponent} from './pages/edit/edit.component';

export const routes: Routes = [
  {
    path: '',
    component: OverviewComponent
  },
  {
    path: ':id',
    component: EditComponent
  }
];
