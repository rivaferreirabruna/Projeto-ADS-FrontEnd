import { Component, computed, effect, input, output, OnInit, signal } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormControl, FormGroup, Validators } from '@angular/forms';
import { CategoriaService } from '../../../core/services/categoria.service';
import { Categoria } from '../../../models/categoria.model';
import { LancamentoService } from '../../../core/services/lancamento.service';
import { LancamentoRequest, LancamentoResponse } from '../../../models/lancamento.model';

@Component({
  selector: 'app-lancamento-form',
  imports: [FormsModule, ReactiveFormsModule],
  templateUrl: './lancamento-form.html'
})
export class LancamentoForm implements OnInit {
  lancamento = input<LancamentoResponse | null>(null);
  salvou = output<void>();
  cancelou = output<void>();
  categorias = signal<Categoria[]>([]);
  erro = signal('');
  salvando = signal(false);

  categoriasDisponiveis = computed(() => {
    const ativas = this.categorias().filter(categoria => categoria.ativa);
    const lancamento = this.lancamento();

    if (lancamento?.categoriaId && !ativas.some(categoria => categoria.id === lancamento.categoriaId)) {
      const historica = this.categorias().find(categoria => categoria.id === lancamento.categoriaId);
      if (historica) ativas.push(historica);
    }

    return ativas;
  });

  formulario = new FormGroup({
    descricao: new FormControl('', {nonNullable:true,
      validators:[Validators.required, Validators.minLength(3), Validators.maxLength(200)]}),
    valor: new FormControl<number | null>(null, [Validators.required, Validators.min(0.01)]),
    dataLancamento: new FormControl('', {nonNullable:true, validators:[Validators.required]}),
    observacao: new FormControl(''),
    categoriaId: new FormControl<number | null>(null, [Validators.required])
  });

  constructor(private categoriasService: CategoriaService,
              private lancamentosService: LancamentoService) {
    effect(() => {
      const lancamento = this.lancamento();
      this.erro.set('');

      if (lancamento) {
        this.formulario.patchValue({
          descricao: lancamento.descricao,
          valor: lancamento.valor,
          dataLancamento: lancamento.dataLancamento,
          observacao: lancamento.observacao,
          categoriaId: lancamento.categoriaId
        });
      } else {
        this.formulario.reset();
      }
    });
  }

  ngOnInit(): void {
    this.categoriasService.listar().subscribe({
      next: dados => this.categorias.set(dados),
      error: err => this.erro.set(
        err.status === 403
          ? 'Acesso negado: você não tem permissão para usar este recurso.'
          : 'Falha ao carregar categorias.'
      )
    });
  }

  cancelar(): void {
    if (this.salvando()) return;
    this.formulario.reset();
    this.erro.set('');
    this.cancelou.emit();
  }

  salvar(): void {
    if (this.salvando()) return;
    if (this.formulario.invalid) { this.formulario.markAllAsTouched(); return; }

    const v = this.formulario.getRawValue();
    const dados: LancamentoRequest = {
      descricao: v.descricao.trim(), valor: v.valor!,
      dataLancamento: v.dataLancamento,
      observacao: v.observacao || null, categoriaId: v.categoriaId!
    };

    this.salvando.set(true);
    this.erro.set('');
    const lancamento = this.lancamento();
    const requisicao = lancamento
      ? this.lancamentosService.atualizar(lancamento.id, dados)
      : this.lancamentosService.cadastrar(dados);

    requisicao.subscribe({
      next: () => {
        this.salvando.set(false);
        this.formulario.reset();
        this.salvou.emit();
      },
      error: err => {
        this.salvando.set(false);

        if (err.status === 400) {
          this.erro.set(err.error?.erro || 'Dados inválidos. Revise os campos do lançamento.');
        } else if (err.status === 403) {
          this.erro.set('Acesso negado: você não tem permissão para realizar esta operação.');
        } else if (err.status === 404) {
          this.erro.set('Usuário, lançamento ou categoria não encontrado.');
        } else if (err.status === 415) {
          this.erro.set('Formato da requisição incorreto (Content-Type).');
        } else {
          this.erro.set(err.error?.erro || 'Não foi possível salvar. Verifique a conexão e o servidor.');
        }
      }
    });
  }
}
