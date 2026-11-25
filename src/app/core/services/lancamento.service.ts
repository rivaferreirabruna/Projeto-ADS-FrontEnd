import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { LancamentoRequest, LancamentoResponse }
  from '../../models/lancamento.model';

@Injectable({ providedIn: 'root' })
export class LancamentoService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/lancamentos`;
  listar() {
    return this.http.get<LancamentoResponse[]>(this.baseUrl);
  }
  cadastrar(dados: LancamentoRequest) {
    return this.http.post<LancamentoResponse>(this.baseUrl, dados);
  }
  atualizar(id: number, dados: LancamentoRequest) {
    return this.http.put<LancamentoResponse>(`${this.baseUrl}/${id}`, dados);
  }
  buscarPorId(id: number) {
    return this.http.get<LancamentoResponse>(`${this.baseUrl}/${id}`);
  }
}
