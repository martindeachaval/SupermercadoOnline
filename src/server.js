const express = require('express');
const fs = require('fs');
const cors = require('cors');
const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

const productosPath = './superOnline/productos/productos.json';

// Leer productos
app.get('/productos', (req, res) => {
  try {
    const data = fs.readFileSync(productosPath, 'utf-8');
    res.json(JSON.parse(data));
  } catch (error) {
    res.status(500).json({ error: 'Error al leer el archivo de productos' });
  }
});

// Actualizar stock
app.post('/actualizar-stock', (req, res) => {
  const { id, cantidad } = req.body;

  try {
    const data = JSON.parse(fs.readFileSync(productosPath, 'utf-8'));
    const producto = data.productos.find((p) => p.id === id);

    if (producto) {
      if (producto.stock >= cantidad) {
        producto.stock -= cantidad;
        fs.writeFileSync(productosPath, JSON.stringify(data, null, 2));
        res.json({ message: 'Stock actualizado con éxito' });
      } else {
        res.status(400).json({ error: 'Stock insuficiente' });
      }
    } else {
      res.status(404).json({ error: 'Producto no encontrado' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar el archivo de productos' });
  }
});

app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
