import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LoginRequest, LoginResponse } from '../../models/auth.model';

interface JwtPayload {
  exp?: number;
  nome?: string;
  perfil?: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private chave = 'financeiro.sessao';
  private sessao = signal<LoginResponse | null>(this.restaurar());

  readonly token = computed(() => {
    const token = this.sessao()?.token ?? null;
    return token && this.tokenValido(token) ? token : null;
  });
  readonly autenticado = computed(() => !!this.token());
  readonly payload = computed<JwtPayload | null>(() => {
    const token = this.token();
    return token ? this.decodificarPayload(token) : null;
  });
  readonly nome = computed(() => {
    const nome = this.payload()?.nome?.trim();
    return nome || 'Usuário autenticado';
  });
  readonly perfil = computed(() => this.payload()?.perfil?.trim().toUpperCase() ?? null);

  login(dados: LoginRequest) {
    return this.http.post<LoginResponse>(
      `${environment.apiUrl}/auth/login`, dados
    ).pipe(tap(res => {
      if (!res?.token || !this.tokenValido(res.token)) {
        throw new Error('Token ausente, malformado ou expirado');
      }
      sessionStorage.setItem(this.chave, JSON.stringify(res));
      this.sessao.set(res);
    }));
  }

  logout() {
    sessionStorage.removeItem(this.chave);
    this.sessao.set(null);
  }

  tokenValido(token: string): boolean {
    const payload = this.decodificarPayload(token);
    if (!payload || typeof payload.exp !== 'number' || !Number.isFinite(payload.exp)) return false;
    return Date.now() < payload.exp * 1000;
  }

  private decodificarPayload(token: string): JwtPayload | null {
    try {
      const partes = token?.split('.');
      if (!Array.isArray(partes) || partes.length !== 3 || !partes[1]) return null;

      const base64 = partes[1].replace(/-/g, '+').replace(/_/g, '/');
      const padding = '='.repeat((4 - (base64.length % 4)) % 4);
      const bytes = Uint8Array.from(atob(base64 + padding), caractere => caractere.charCodeAt(0));
      return JSON.parse(new TextDecoder('utf-8').decode(bytes)) as JwtPayload;
    } catch {
      return null;
    }
  }

  private restaurar(): LoginResponse | null {
    try {
      const salva = JSON.parse(sessionStorage.getItem(this.chave) ?? 'null') as LoginResponse | null;
      if (!salva?.token || !this.tokenValido(salva.token)) {
        sessionStorage.removeItem(this.chave);
        return null;
      }
      return salva;
    } catch {
      sessionStorage.removeItem(this.chave);
      return null;
    }
  }
}
