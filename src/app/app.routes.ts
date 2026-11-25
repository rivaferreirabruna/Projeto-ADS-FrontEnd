import { Routes } from '@angular/router';
import { MainLayout } from './layout/main-layout/main-layout';
import { Login } from './features/auth/login/login';
import { CategoriaLista } from './features/categorias/categoria-lista/categoria-lista';
import { LancamentoLista } from './features/lancamentos/lancamento-lista/lancamento-lista';
import { PaginaEmBreve } from './shared/pagina-em-breve/pagina-em-breve';
import { authGuard } from './core/guards/auth-guard';

export const routes: Routes = [
  { path: 'login', component: Login },
  { path: '', component: MainLayout,
    canActivate: [authGuard], canActivateChild: [authGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'lancamentos' },
      { path: 'categorias', component: CategoriaLista },
      { path: 'lancamentos', component: LancamentoLista },
      { path: 'dashboard', component: PaginaEmBreve,
        data: { titulo: 'Dashboard' } },
      { path: 'usuarios', component: PaginaEmBreve,
        data: { titulo: 'Usuários' } }
    ] },
  { path: '**', redirectTo: 'lancamentos' }
];
