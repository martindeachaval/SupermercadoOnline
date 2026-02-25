export interface CategoriasObject {
    [categoria: string]: { 
        [producto: string]: string[]; 
      };
}
//Sería para que en base a cada categoría, elijan un producto y una marca específica