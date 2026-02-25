export interface Productos {
    id: string ,
    categoria: string | null,
    producto: string | null,
    marca: string | null,
    peso: number | null,
    precio: number | null,
    stock: number | null,
    imagenUrl?: string,
    publicId?: string,
    descripcion: string | null,
    cantidad?: number,
}

