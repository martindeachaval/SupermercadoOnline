import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { SuperService } from '../../../service/super.service';
import { Router, RouterModule } from '@angular/router';
import { Productos } from '../../../types/productos';
import { CategoriasObject } from '../../../types/categorias-object';
import { CommonModule } from '@angular/common';
import { CloudinaryService, CloudinaryUploadResponse } from '../../../service/cloudinary.service';
import { finalize, map, switchMap } from 'rxjs';

@Component({
  selector: 'app-add-productos',
  standalone: true,
  imports: [ReactiveFormsModule, RouterModule, CommonModule],
  templateUrl: './add-productos.component.html',
  styleUrl: './add-productos.component.css'
})
export class AddProductosComponent {
  private fb = inject(FormBuilder)

  categoriasObject: CategoriasObject = {

    "congelados": {
      "Hamburguesa": ["Paty Express", "Swift", "Paty"],
      "Papas fritas": ["Mc Cain"],
      "Milanesas": ["Lucchetti", "Granja del Sol", "Vegetalex", "NOT"],
      "Patitas de pollo": ["Swift", "Granja del Sol"]
    },

    "panificados": {
      "Prepizza": ["Parliamo", "Coco's"],
      "Pan lactal": ["Panacity", "Bimbo", "Fargo"]
    },

    "limpieza": {
      "Papel higienico": ["Higienol", "Elite", "Campanita"],
      "Rollo de cocina": ["Sussex", "Campanita", "Elite"],
      "Limpiador": ["MrMusculo", "Ayudin", "Pato", "Cif"],
      "Lavandina": ["Ayudin", "Vim"]
    },

    "bebidas-S-A": {
      "Agua": ["Villavicencio", "Villa del Sur", "Glaciar", "Benedictino"],
      "Gaseosa": ["Coca Cola", "7up", "Sprite", "Schweppes", "Fanta", "Pepsi"],
      "Agua saborizada": ["Levite", "Brio", "Aquarius"],
      "Jugos": ["Citric", "Clight", "Tang", "Cepita", "Baggio"],
      "Soda": ["Saldan", "Ivess"],
    },

    "lacteos-y-frescos": {
      "Yogur": ["Yogurisimo", "Milkaut", "La Serenisima", "Ser", "Actimel"],
      "Leche": ["La Serenisima", "Tregar", "Verónica", "iLolay", "Silk", "Milkaut"],
      "Tapa para empanadas": ["La Salteña", "La negra Simona", "Tapamar"],
      "Manteca": ["La Serenisima", "La Paulina", "SanCor", "Milkaut", "Verónica"]
    },

    "verduleria": {
      "Banana": ["-"],
      "Papa": ["-"],
      "Palta": ["-"],
      "Tomate": ["-"],
      "Cebolla": ["-"],
      "Zanahoria": ["-"],
      "Limón": ["-"],
      "Naranja": ["-"],
      "Manzana": ["-"],
      "Berenjena": ["-"],
      "Frutilla": ["-"],
    },

    "almacen": {
      "Aceite": ["Natura", "Cañuelas", "Cocinero",],
      "Arroz": ["Gallo Oro", "Amanda", "Lucchetti", "San Giorgio", "Molinos Ala"],
      "Cafe": ["Nescafe Dolca", "Cabrales", "Arlistán", "La Virginia", "Nescafe Gold"],
      "Mermelada": ["BC", "La Campagnola", "Noel", "Arcor", "Patagonia"],
      "Galletita": ["Oreo", "Pepitos", "Sonrisas", "Surtido Bagley", "Cerealitas", "Frutigran", "Rumba", "Hogareñas", "Maná", "Limbo"],
      "Yerba": ["Playadito", "Amanda", "Mañanita", "La Merced", "CBSé", "Canarias", "Rosamonte"],
      "Harina": ["Pureza", "Blancaflor", "Cañuelas", "Favorita", "Morixe"],
      "Azucar y endulzantes": ["Ledesma", "Cabrales Liv", "Cabrales", "Chuker", "Equal-Sweet"],
      "Dulce de leche": ["La Serenisima", "Milkaut", "Ser", "SanCor"],
      "Cacao": ["Nesquik", "Toddy", "Chocolino"],
      "Te": ["Green Hills", "La Virginia", "Taragui", "Big Ben"],
      "Mayonesa": ["Natura", "Hellmann's", "Heinz", "Mayoliva"],
    }
  }

  categorias: string[] = Object.keys(this.categoriasObject); //Object.keys -->  devuelve una matriz de nombres de categorias en este caso, con una clave
  productos: string[] = [];
  marcas: string[] = [];

  //IMAGEN
  selectedFile: File | null = null;
  previewUrl: string | null = null;
  imgError = '';
  subiendo = false;

  formMsg = ''; ///Mensaje general (reemplaza alerts)

  constructor(private superService: SuperService, private route: Router, private cloudinary: CloudinaryService) { }

  form = this.fb.group({
    categoria: ['', [Validators.required]],
    producto: ['', [Validators.required]],
    marca: ['', [Validators.required]],
    peso: [null, [Validators.required, Validators.min(1)]],
    precio: [null, [Validators.required, Validators.min(1)]],
    stock: [null, [Validators.required, Validators.min(1)]],
    imagenUrl: [''],
    publicId: [''],
    descripcion: [null, [Validators.maxLength(200)]],
  })

  //Reinicia los productos y marcas si se modifica la categoría
  onCategoriaChange(): void {
    const categoria = this.form.get('categoria')?.value;
    if (categoria) {
      this.productos = Object.keys(this.categoriasObject[categoria]);
      this.marcas = [];
      this.form.get('producto')?.reset(); // Reinicia producto seleccionado
      this.form.get('marca')?.reset(); // Reinicia marca seleccionada, ? porque puede ser null el valor
    } else {
      this.productos = [];
      this.marcas = [];
    }
  }

  //Una vez elegida la categoría, si se cambia el producto va cambiando la marca.
  onProductoChange(): void {
    const categoria = this.form.get('categoria')?.value;
    const producto = this.form.get('producto')?.value;
    if (categoria && producto) {
      this.marcas = this.categoriasObject[categoria][producto];
      this.form.get('marca')?.reset(); // Reinicia marca seleccionada
    } else {
      this.marcas = [];
    }
  }

  onFileSelected(event: Event) {
    this.formMsg = ''; ///Limpio mensaje general
    this.imgError = ''; ///Resetea en caso de algun error previo
    const input = event.target as HTMLInputElement; ///Casteo el evento como HTMLInputElement
    const file = input.files?.[0] ?? null; ///Si no existeel file agarra el pri, pero si no hay archi pone null

    if (!file) { ///Por si el usuario cancela la seleccion el selected file se vacia
      this.selectedFile = null;
      this.previewUrl = null; ///En el preview se elimina
      return;
    }

    if (!file.type.startsWith('image/')) { ///Valido que sea una imagen real y acepto cualquier fornato
      this.imgError = 'El archivo debe ser una imagen.'; ///Control de error
      this.selectedFile = null;
      return;
    }

    if (file.size > 5 * 1024 * 1024) { ///Que no supere los 5 MB
      this.imgError = 'La imagen supera 5MB.';
      this.selectedFile = null;
      return;
    }

    this.selectedFile = file; ///Si paso las verificaciones guardo

    const reader = new FileReader(); ///Me permite leer archivos locales
    reader.onload = () => (this.previewUrl = String(reader.result)); ///El FileReader me deja hacer el preview de la imagen, convierto la imagen a texto
    reader.readAsDataURL(file); ///Transforma el archivo en una URL
  }

  onSubmit() {
    this.formMsg = ''; ///Limpia mensaje previo
    if (this.form.invalid) return;

    const base = this.form.getRawValue() as Productos;

    ///Sin imagen: upsert directo
    if (!this.selectedFile) {
      this.upsertProducto(base).subscribe({
        next: (accion) => {
          this.formMsg = (accion === 'update')
            ? 'El producto ya existía: se sumó el stock y se actualizó.'
            : 'Producto agregado correctamente.';

          setTimeout(() => this.route.navigate(['/admin']), 3000);
        },
        error: (error) => console.error(error),
      });
      return;
    }

    ///Con imagen: subo a Cloudinary y despues upsert
    this.subiendo = true;

    this.cloudinary.uploadImage(this.selectedFile) ///El upload devuelve un observable de la imagen en formato de URL
      .pipe(finalize(() => (this.subiendo = false))) ///El finalizar de va a ejecutar siempre(si sale bien o  mal) entonces subiendo = false
      .subscribe({
        next: (res: CloudinaryUploadResponse) => { ///Si se sube bien, el res almacena "secure_url = URL de la img" y public_Id =id interno de cloudinary
          const conImg: Productos = {  ///Se crea un obj nuevo en base al form pero con img 
            ...base,  ///Copiamos todo lo de base al nuevo(categoria, marca, etc)
            imagenUrl: res.secure_url,
            publicId: res.public_id,
          };

          this.upsertProducto(conImg).subscribe({ ///Volvemos al upsert pero con imagen
            next: (accion) => {
              this.formMsg = (accion === 'update')
              ? 'El producto ya existía: se sumó el stock y se actualizó.'
              : 'Producto agregado correctamente.';

            this.route.navigate(['/admin']);
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
    fileInput.value = ''; ///Importante para poder re-seleccionar el mismo archivo
  }

  private upsertProducto(producto: Productos) {
    const categoria = producto.categoria!; ///Traigo los campos del producto
    const nombre = producto.producto!; ///El ! es porque se que los campos no son null, los productos estan validados desde el form
    const marca = producto.marca!;

    return this.superService.buscarProductoExistente(categoria, nombre, marca).pipe( ///Buscamos a ver si existe el producto(solo quiero trabajar con esos valores para verificar)
      switchMap((found) => {
        const existente = found[0];

        ///Si existe: sumo stock y actualizo (sin pisar imagen si no subiste una nueva)
        if (existente) {
          const actualizado: Productos = {
            ...existente,
            ...producto,
            id: existente.id,
            stock: (existente.stock ?? 0) + (producto.stock ?? 0),

            ///Si no subo imagen, mantiene la actual
            imagenUrl: producto.imagenUrl ? producto.imagenUrl : existente.imagenUrl,
            publicId: producto.publicId ? producto.publicId : existente.publicId,

            ///Si descripción viene vacía, mantiene la actual
            descripcion: producto.descripcion ? producto.descripcion : existente.descripcion,
          };

          return this.superService.updateProducto(actualizado, existente.id).pipe(map(() => 'update' as const));
        }

        ///Si no existe: creo nuevo
        return this.superService.addProducto(producto).pipe(map(() => 'create' as const));
      })
    );
  }

}
