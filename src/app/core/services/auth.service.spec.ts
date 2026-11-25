import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';

function criarToken(payload: Record<string, unknown>, expirado = false): string {
  const header = btoa(JSON.stringify({ alg: 'none', typ: 'JWT' }))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  const body = btoa(JSON.stringify({
    exp: expirado ? Math.floor(Date.now() / 1000) - 60 : Math.floor(Date.now() / 1000) + 3600,
    ...payload
  })).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  return `${header}.${body}.assinatura-teste`;
}

describe('AuthService', () => {
  beforeEach(() => {
    sessionStorage.clear();
    TestBed.configureTestingModule({ providers: [provideHttpClient()] });
  });

  it('deve ser criado', () => {
    expect(TestBed.inject(AuthService)).toBeTruthy();
  });

  it('deve rejeitar token expirado', () => {
    const service = TestBed.inject(AuthService);
    expect(service.tokenValido(criarToken({ nome: 'Teste' }, true))).toBeFalsy();
  });

  it('deve rejeitar token malformado', () => {
    const service = TestBed.inject(AuthService);
    expect(service.tokenValido('token.invalido')).toBeFalsy();
  });

  it('deve restaurar claims quando o token é válido', () => {
    const token = criarToken({ nome: 'Maria Silva', perfil: 'OPERADOR' });
    sessionStorage.setItem('financeiro.sessao', JSON.stringify({ token, tipo: 'Bearer', expiraEmSegundos: 3600 }));

    const service = TestBed.inject(AuthService);

    expect(service.autenticado()).toBeTruthy();
    expect(service.nome()).toBe('Maria Silva');
    expect(service.perfil()).toBe('OPERADOR');
  });

  it('deve limpar sessão restaurada com token expirado', () => {
    sessionStorage.setItem('financeiro.sessao', JSON.stringify({
      token: criarToken({ nome: 'Expirada' }, true), tipo: 'Bearer', expiraEmSegundos: 0
    }));

    const service = TestBed.inject(AuthService);

    expect(service.autenticado()).toBeFalse();
    expect(sessionStorage.getItem('financeiro.sessao')).toBeNull();
  });
});
