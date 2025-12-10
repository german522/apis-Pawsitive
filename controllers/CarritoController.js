const { Carrito, CarritoItem, Producto } = require("../models");

const CarritoController = {

  // 1️⃣ Crear carrito
  crearCarrito: async (req, res) => {
    try {
      const id_persona = req.user.id; // Asumiendo que req.user.id contiene el ID de la Persona

      // Verificar si ya tiene un carrito abierto
      const carritoExistente = await Carrito.findOne({
        where: { id_persona, estado: "abierto" }, // ⬅️ CAMBIO: id_persona
      });

      if (carritoExistente)
        return res.status(400).json({ message: "Ya existe un carrito activo" });

      const carrito = await Carrito.create({ id_persona }); // ⬅️ CAMBIO: id_persona

      res.status(201).json({ message: "Carrito creado", carrito });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // 2️⃣ Obtener carrito activo de la Persona (Cliente o Veterinario)
  obtenerCarritoActivo: async (req, res) => {
    try {
      const id_persona = req.user.id; // ⬅️ CAMBIO: id_persona

      const carrito = await Carrito.findOne({
  where: { id_persona, estado: "abierto" }, // ⬅️ CAMBIO: id_persona
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
      const id_persona = req.user.id; // ⬅️ CAMBIO: id_persona
      const { id_producto, cantidad } = req.body;

      const carrito = await Carrito.findOne({
        where: { id_persona, estado: "abierto" }, // ⬅️ CAMBIO: id_persona
      });
      if (!carrito) return res.status(404).json({ message: "No hay carrito activo" });
      
      // ... (Resto de la lógica de producto e item) ...

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
      const id_persona = req.user.id; // ⬅️ CAMBIO: id_persona
      const { id_producto, cantidad } = req.body;

      const carrito = await Carrito.findOne({
        where: { id_persona, estado: "abierto" }, // ⬅️ CAMBIO: id_persona
      });

      if (!carrito) return res.status(404).json({ message: "No hay carrito activo para esta persona" }); // Agregué validación de carrito

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
      const id_persona = req.user.id; // ⬅️ CAMBIO: id_persona
      const { id_producto } = req.params;

      const carrito = await Carrito.findOne({ where: { id_persona, estado: "abierto" } }); // ⬅️ CAMBIO: id_persona

      if (!carrito) return res.status(404).json({ message: "No hay carrito activo para esta persona" }); // Agregué validación de carrito

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
    const id_persona = req.user.id; // ⬅️ CAMBIO: id_persona

    const carrito = await Carrito.findOne({
      where: { id_persona, estado: "cerrado" }, // ⬅️ CAMBIO: id_persona
      include: [
        {
          model: CarritoItem,
          as: "items",
          include: [
            { model: Producto, as: "producto" }
          ]
        }
      ]
    });

    if (!carrito) return res.status(404).json({ message: "No hay carrito cerrado" });

    // Calcular total
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
      const id_persona = req.user.id; // ⬅️ CAMBIO: id_persona

      const carrito = await Carrito.findOne({
        where: { id_persona, estado: "abierto" }, // ⬅️ CAMBIO: id_persona
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