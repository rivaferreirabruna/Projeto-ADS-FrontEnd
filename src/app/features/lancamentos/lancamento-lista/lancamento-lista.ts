import { Component, OnInit, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { LancamentoService } from '../../../core/services/lancamento.service';
import { LancamentoResponse } from '../../../models/lancamento.model';
import { LancamentoForm } from '../lancamento-form/lancamento-form';

@Component({
  selector: 'app-lancamento-lista',
  imports: [CurrencyPipe, DatePipe, LancamentoForm],
  templateUrl: './lancamento-lista.html'
})
export class LancamentoLista implements OnInit {
  readonly usuarioId = 1; // APENAS para laboratório, sem JWT
  lancamentos = signal<LancamentoResponse[]>([]);
  lancamentoSelecionado = signal<LancamentoResponse | null>(null);
  carregando = signal(false);
  erro = signal('');

  constructor(private lancamentoService: LancamentoService) {}
  ngOnInit(): void { this.carregar(); }

  editar(lancamento: LancamentoResponse): void {
    this.lancamentoSelecionado.set({ ...lancamento });
  }

  aoSalvar(): void {
    this.lancamentoSelecionado.set(null);
    this.carregar();
  }

  aoCancelar(): void {
    this.lancamentoSelecionado.set(null);
  }

  carregar(): void {
    this.carregando.set(true);
    this.erro.set('');
    this.lancamentoService.listar(this.usuarioId).subscribe({
      next: dados => {
        this.lancamentos.set(dados);
        this.carregando.set(false);
      },
      error: err => {
        this.erro.set('Não foi possível carregar os lançamentos.');
        this.carregando.set(false);
        console.error(err);
      }
    });
  }
}
