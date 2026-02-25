import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService, Rol } from '../auth.service';
import { RolService } from '../../rol-selection/service/rol.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
  rol: Rol = 'User';

  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private auth = inject(AuthService);

  ///Mensaje general (reemplaza alert de credenciales)
  formMsg = '';

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });



  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const rolParam = (params.get('rol') ?? '').toLowerCase();
      this.rol = rolParam === 'admin' ? 'Admin' : 'User';
    });
  }

  ingresar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { email, password } = this.form.getRawValue();

    this.auth.login(email!, password!, this.rol).subscribe((ok) => {
      if (!ok) {
        this.formMsg = 'Correo o contraseña incorrecta.';
        return;
      }
      this.router.navigate([this.rol === 'Admin' ? '/admin' : '/user']);
    });
  }
}