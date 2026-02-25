import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService, Rol } from '../auth.service';
import { EMPTY, switchMap } from 'rxjs';
import { RolService } from '../../rol-selection/service/rol.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent implements OnInit {
  rol: Rol = 'User';

  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private auth = inject(AuthService);
  private rolService = inject(RolService);

  ///Mensaje general (reemplaza alerts)
  formMsg = '';

  form = this.fb.group({
    nombre: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(4)]],
    confirmPassword: ['', [Validators.required]],
  },
  {validators: this.passwordsMatch}
);



  ngOnInit(): void {
    const rolParam = (this.route.snapshot.paramMap.get('rol') ?? '').toLowerCase();
    this.rol = rolParam === 'admin' ? 'Admin' : 'User';
    ///Para que navbar tenga rolActual
    this.rolService.setRol(this.rol);
  }

  registrar(): void {
    this.formMsg = ''; ///Limpia mensaje previo
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { nombre, email, password } = this.form.getRawValue();

    this.auth.existsEmailForRole(email!, this.rol).pipe(
      switchMap((exists) => {
        if (exists) {
          this.formMsg = 'Ese email ya está registrado para este rol.';
          return EMPTY; ///Corta el flujo, no registra
        }

        return this.auth.register({
          nombre: nombre!,
          email: email!,
          password: password!,
          rol: this.rol,
        });
      })
    ).subscribe({
      next: () => {
        this.formMsg = 'Registrado Correcatamente. Ahora iniciá sesión.';
        setTimeout(() => {
          this.router.navigate(['/login', this.rol.toLowerCase()]);
        }, 3000);
      },
      error: (e) => {
        console.error(e);
        this.formMsg = 'Ocurrió un error al registrar.';
      },
    });
  }

  private passwordsMatch(group: any){
    const contra = group.get('password')?.value;
    const confirmado = group.get('confirmPassword')?.value;

    if(contra !== confirmado){
      group.get('confirmPassword')?.setErrors({noCoincide: true});
    }else{
      group.get('confirmPassword')?.setErrors(null);
    }
  }
}
