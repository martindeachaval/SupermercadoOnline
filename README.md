# Proyecto Final: SuperOnline
Integrantes: Martin de Achaval.

    "superOnline" es una app web que permite tanto a usuarios como administradores realizar distintas tareas dentro del supermercado. Se diseñó para que el usuario disfrute de una experiencia intuitiva de navegación, selección y compra de productos y en forma simultánea, los administradores puedan hacer una gestión apropiada de su stock.

# Funcionalidades principales del sistema en general

    - Gestión de productos: Creación, edición, eliminación y visualización de productos.

    - Filtrado por categorías: Navegación por categorías específicas para poder encontrar de forma más sencilla los productos.

    - Lista general de productos: Visualización sin filtros desde la página principal.

    - Realización de una compra: Selección de un producto y una cantidad específica para poder agregar al carrito.

    - Finalización de una compra: Carga de datos personales para poder realizar el pago de dicha compra con validación de los datos. 

    - Roles de usuario y administrador: Gestión de accesos y funcionalidades específicas según el rol. 

# Herramientas utilizadas

    - Framework: Angular
    - Base de datos: json-server
    - IDE: Visual Studio Code
    - Lenguajes: TypeScript, HTML, CSS

# Instrucciones para levantar y ejecutar el entorno de desarrollo en VS Code

### Instalaciones
        - Descargar e instalar Node.js y Angular CLI.
        - Instalar dependencias: npm install


### Ejecución del servidor
        - Ejecutar el comando: ng serve

### Inicializar base de datos
        - Para contar con acceso a los productos guardados en el archivo: json-server productos/productos.json

# Próximamente..
        - Filtrado de productos mediante la barra de búsqueda (actualmente NO funcional). LISTO
        - Registro y login según el rol que se vaya a utilizar. LISTO
        - Consumo de API Cloudinary para insertar las imágenes correspondientes a cada producto. LISTO
        - Mejorar interfaces para ser responsivas en cualquier tipo de dispositivo. LISTO
        - Generador de estadísticas de venta. LISTO
        - Historial de compra. LISTO
        - Generador de informes y/o recibos. LISTO 
