const { Carrito, CarritoItem, Producto } = require("../models");

const CarritoController = {

  // 1️⃣ Crear carrito
  crearCarrito: async (req, res) => {
    try {
      const id_cliente = req.user.id; // Asumiendo que el token contiene el id del cliente

      // Verificar si ya tiene un carrito abierto
      const carritoExistente = await Carrito.findOne({
        where: { id_cliente, estado: "abierto" },
      });

      if (carritoExistente)
        return res.status(400).json({ message: "Ya existe un carrito activo" });

      const carrito = await Carrito.create({ id_cliente });

      res.status(201).json({ message: "Carrito creado", carrito });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // 2️⃣ Obtener carrito activo del cliente
  obtenerCarritoActivo: async (req, res) => {
    try {
      const id_cliente = req.user.id;

      const carrito = await Carrito.findOne({
  where: { id_cliente, estado: "abierto" },
  include: [{
    model: CarritoItem,
    as: "items",          
    include: [{ 
      model: Producto,
      as: "producto"  
    }]
  }]
});

      if (!carrito) return res.status(404).json({ message: "No hay carrito activo" });

      res.json(carrito);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // 3️⃣ Agregar producto al carrito
  agregarProducto: async (req, res) => {
    try {
      const id_cliente = req.user.id;
      const { id_producto, cantidad } = req.body;

      const carrito = await Carrito.findOne({
        where: { id_cliente, estado: "abierto" },
      });
      if (!carrito) return res.status(404).json({ message: "No hay carrito activo" });

      const producto = await Producto.findByPk(id_producto);
      if (!producto) return res.status(404).json({ message: "Producto no encontrado" });


      const item = await CarritoItem.findOne({
        where: { id_carrito: carrito.id, id_producto },
      });

      if (item) {
  item.cantidad += cantidad;
  await item.save();
} else {
  await CarritoItem.create({
    id_carrito: carrito.id,
    id_producto,
    cantidad,
    precio_unitario: producto.precio
  });
}

      res.json({ message: "Producto agregado al carrito" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // 4️⃣ Actualizar cantidad de un producto
  actualizarCantidad: async (req, res) => {
    try {
      const id_cliente = req.user.id;
      const { id_producto, cantidad } = req.body;

      const carrito = await Carrito.findOne({
        where: { id_cliente, estado: "abierto" },
      });

      const item = await CarritoItem.findOne({
        where: { id_carrito: carrito.id, id_producto },
      });

      if (!item) return res.status(404).json({ message: "Producto no está en el carrito" });

      item.cantidad = cantidad;
      await item.save();

      res.json({ message: "Cantidad actualizada" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // 5️⃣ Eliminar producto del carrito
  eliminarProducto: async (req, res) => {
    try {
      const id_cliente = req.user.id;
      const { id_producto } = req.params;

      const carrito = await Carrito.findOne({ where: { id_cliente, estado: "abierto" } });

      await CarritoItem.destroy({
        where: { id_carrito: carrito.id, id_producto },
      });

      res.json({ message: "Producto eliminado" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // 6️⃣ Obtener resumen y total de carrito cerrado (previo a compra)
obtenerResumenCarrito: async (req, res) => {
  try {
    const id_cliente = req.user.id;

    const carrito = await Carrito.findOne({
      where: { id_cliente, estado: "cerrado" },
      include: [
        {
          model: CarritoItem,
          as: "items", // 👈 alias obligatorio
          include: [
            { model: Producto, as: "producto" } // 👈 alias obligatorio
          ]
        }
      ]
    });

    if (!carrito) return res.status(404).json({ message: "No hay carrito cerrado" });

    // 👇 Calcular total usando alias (producto)
    const total = carrito.items.reduce((sum, item) => {
      return sum + (item.cantidad * item.producto.precio);
    }, 0);

    res.json({ carrito, total });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
},

  // 7️⃣ Cerrar carrito
  cerrarCarrito: async (req, res) => {
    try {
      const id_cliente = req.user.id;

      const carrito = await Carrito.findOne({
        where: { id_cliente, estado: "abierto" },
      });

      if (!carrito) return res.status(404).json({ message: "No hay carrito activo" });

      carrito.estado = "cerrado";
      carrito.fecha_cierre = new Date();
      await carrito.save();

      res.json({ message: "Carrito cerrado" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
};

module.exports = CarritoController;
