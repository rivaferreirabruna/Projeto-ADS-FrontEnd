import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators }
  from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login', 
  imports: [ReactiveFormsModule], 
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);
  erro = signal('');
  enviando = signal(false);
  form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    senha: ['', Validators.required]
  });
  entrar() {
    if (this.form.invalid || this.enviando()) return;
    this.erro.set(''); this.enviando.set(true);
    this.auth.login(this.form.getRawValue()).subscribe({
      next: () => {
        this.enviando.set(false);
        this.router.navigate(['/lancamentos']);
      },
      error: e => {
        this.enviando.set(false);
        this.erro.set(e.status === 401 ? 'Credenciais inválidas.' :
          'Não foi possível entrar. Verifique a API.');
      }
    });
  }
}
