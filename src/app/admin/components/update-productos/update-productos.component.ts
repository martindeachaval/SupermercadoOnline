import { Component, inject, OnInit } from '@angular/core';
import { SuperService } from '../../../service/super.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Productos } from '../../../types/productos';
import { CloudinaryService, CloudinaryUploadResponse } from '../../../service/cloudinary.service';
import { finalize } from 'rxjs';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-update-productos',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf],
  templateUrl: './update-productos.component.html',
  styleUrl: './update-productos.component.css'
})
export class UpdateProductosComponent implements OnInit {

  private fb = inject(FormBuilder);

  selectedFile: File | null = null;
  previewUrl: string | null = null;
  imgError = '';
  subiendo = false;

  ///Mensaje general (reemplaza alerts)
  formMsg = '';

  activatedRoute = inject(ActivatedRoute);

  constructor(private superService: SuperService, private route: Router, private cloudinary: CloudinaryService) { }

  form = this.fb.group({
    id: [{ value: '', disabled: true }],
    categoria: [{ value: '', disabled: true }],
    producto: [{ value: '', disabled: true }],
    marca: [{ value: '', disabled: true }],
    peso: [1, [Validators.min(0)]],
    precio: [1, [Validators.min(0)]],
    stock: [1, [Validators.min(0)]],
    imagenUrl: [''],
    publicId: [''],
    descripcion: ['', [Validators.maxLength(200)]],
  });

  id: string | null = null;

  ngOnInit(): void {
    this.activatedRoute.paramMap.subscribe({
      next: (params) => {
        this.id = params.get('id');
        this.getProductoById(this.id);
      },
      error: (e: Error) => {
        console.log(e.message);
      }
    })
  }

  getProductoById(id: string | null) {
    this.superService.getProductoPorId(id).subscribe({
      next: (producto: Productos) => {
        this.form.patchValue({
          id: producto.id,
          categoria: producto.categoria,
          producto: producto.producto,
          marca: producto.marca,
          peso: producto.peso,
          precio: producto.precio,
          stock: producto.stock,
          descripcion: producto.descripcion,

          ///Clave para no pisar la imagen con ''
          imagenUrl: producto.imagenUrl ?? '',
          publicId: producto.publicId ?? '',
        });
        ///Preview inicial
        this.previewUrl = producto.imagenUrl ?? null;
      },
      error: () => {
        console.log("Error..");
      }
    })
  }

  onFileSelected(event: Event) {
    this.imgError = '';
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;

    if (!file) {
      this.selectedFile = null;
      this.previewUrl = this.form.get('imagenUrl')?.value || null; ///Vuelve a la actual
      return;
    }

    if (!file.type.startsWith('image/')) {
      this.imgError = 'El archivo debe ser una imagen.';
      this.selectedFile = null;
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      this.imgError = 'La imagen supera 5MB.';
      this.selectedFile = null;
      return;
    }

    this.selectedFile = file;

    const reader = new FileReader();
    reader.onload = () => (this.previewUrl = String(reader.result));
    reader.readAsDataURL(file);
  }

  update() {
    this.formMsg = ''; ///Limpia mensaje previo
    if (this.form.invalid) return;
    ///Si no elige imagen guarda vacio
    if (!this.selectedFile) {
      const producto = this.form.getRawValue() as Productos;
      this.superService.updateProducto(producto, this.id).subscribe({
        next: () => {
          this.formMsg = 'Producto actualizado correctamente.';
          setTimeout(() => this.route.navigate(['/admin']), 3000);
        },
        error: (error) => console.log(error),
      });
      return;
    }

    ///Si hay imagen sube a cloudinary y guarda url + publicId
    this.subiendo = true;

    this.cloudinary.uploadImage(this.selectedFile)
      .pipe(finalize(() => (this.subiendo = false)))
      .subscribe({
        next: (res: CloudinaryUploadResponse) => {
          this.form.patchValue({
            imagenUrl: res.secure_url,
            publicId: res.public_id
          });

          const producto = this.form.getRawValue() as Productos;

          this.superService.updateProducto(producto, this.id).subscribe({
            next: () => {
              this.formMsg = 'Producto actualizado correctamente.';
              setTimeout(() => this.route.navigate(['/admin']), 3000);
            },
            error: (error) => console.error(error),
          });
        },
        error: (err) => {
          console.error(err);
          this.imgError = 'Error subiendo la imagen a Cloudinary.';
        }
      });
  }

  clearImage(fileInput: HTMLInputElement) {
    this.selectedFile = null;
    this.previewUrl = null;
    this.imgError = '';
    this.form.patchValue({ imagenUrl: '', publicId: '' });
    fileInput.value = ''; ///Importante para poder reseleccionar el mismo archivo
  }
}
