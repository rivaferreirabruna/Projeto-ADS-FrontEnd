import { Component, computed, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  selector: 'app-main-layout',
  styleUrl: './main-layout.css',
  templateUrl: './main-layout.html',
})
export class MainLayout {
  private auth = inject(AuthService);
  private router = inject(Router);

  readonly nome = this.auth.nome;
  readonly podeVerUsuarios = computed(() => this.auth.perfil() !== 'OPERADOR');

  sair() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
