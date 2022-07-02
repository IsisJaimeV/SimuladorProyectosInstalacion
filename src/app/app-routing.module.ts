import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './views/dashboard/dashboard.component';
import { LoadingComponent } from './views/loading/loading.component';
import { NotFoundComponent } from './views/not-found/not-found.component';

const routes: Routes = [
  {path: '', component: LoadingComponent},
  {path: 'dashboard', component: DashboardComponent},
  {path: 'not-found', component: NotFoundComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
