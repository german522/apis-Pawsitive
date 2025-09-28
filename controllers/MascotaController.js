  const { MascotaRepository, ClienteRepository } = require('../repositories');
  const ApiResponse = require('../utils/ApiResponse');
  const { ValidationError, DatabaseError } = require('sequelize');

  // Obtener todas las mascotas
  exports.getAll = async (req, res) => {
    try {
      const mascotas = await MascotaRepository.getAll();
      return ApiResponse.success("Mascotas obtenidas exitosamente.", { mascotas }, res);
    } catch (error) {
      console.error("❌ Error en GET /mascotas:", error);
      return ApiResponse.error("Error interno del servidor.", res);
    }
  };

  // Obtener mascota por ID
  exports.getById = async (req, res) => {
    try {
      const { id } = req.params;
      
      const mascota = await MascotaRepository.getById(id);
      if (!mascota) {
        return ApiResponse.notFound("Mascota no encontrada.", res);
      }

      return ApiResponse.success("Mascota obtenida exitosamente.", { mascota }, res);

    } catch (error) {
      console.error("❌ Error en GET /mascotas/:id:", error);
      return ApiResponse.error("Error interno del servidor.", res);
    }
  };

  // Crear nueva mascota (solo para clientes)
  exports.create = async (req, res) => {
    try {
      const { nombre, especie, raza, sexo, color, fecha_nacimiento, peso, historial_medico } = req.body;
      const clienteId = req.user.tipoId; // ID del cliente desde el token

      // Validaciones básicas
      if (!nombre || !especie || !sexo) {
        return ApiResponse.validation("Faltan campos obligatorios: nombre, especie, sexo.", null, res);
      }

      // Verificar que el cliente existe
      const cliente = await ClienteRepository.getById(clienteId);
      if (!cliente) {
        return ApiResponse.notFound("Cliente no encontrado.", res);
      }

      // Normalización mínima para comparación consistente
      const _trim = v => (typeof v === 'string' ? v.trim() : v);
      const mascotaData = {
        id_cliente: clienteId,
        nombre: _trim(nombre),
        especie, // valor catalogado
        raza: _trim(raza) || null,
        sexo,
        color: _trim(color) || null,
        fecha_nacimiento: fecha_nacimiento || null,
        peso: peso || null,
        historial_medico: _trim(historial_medico) || "",
        URL_imagen: null
      };

      // ✅ Validación de duplicado exacto vía repositorio
      const duplicada = await MascotaRepository.findDuplicateExact({
        id_cliente: mascotaData.id_cliente,
        nombre: mascotaData.nombre,
        especie: mascotaData.especie,
        raza: mascotaData.raza,
        sexo: mascotaData.sexo,
        color: mascotaData.color,
        fecha_nacimiento: mascotaData.fecha_nacimiento,
        peso: mascotaData.peso
      });

      if (duplicada) {
        return ApiResponse.validation(
          "Ya existe una mascota registrada con exactamente los mismos datos. Revisa los campos que se ingresaron.",
          null,
          res
        );
      }

      // Crear
      const mascota = await MascotaRepository.create(mascotaData);
      return ApiResponse.success("Mascota creada exitosamente.", { mascota }, res, 201);

    } catch (error) {
      console.error("❌ Error en POST /mascotas:", error);

      if (error instanceof ValidationError) {
        return ApiResponse.validation(error.errors.map(e => e.message), null, res);
      }
      if (error instanceof DatabaseError) {
        return ApiResponse.error("Error en la base de datos.", res);
      }
      return ApiResponse.error("Error interno del servidor.", res);
    }
  };


  // Actualizar mascota
  exports.update = async (req, res) => {
    try {
      const { id } = req.params;
      const { nombre, especie, raza, sexo, color, fecha_nacimiento, peso } = req.body;

      if (!nombre && !especie && !raza && !sexo && !color && !fecha_nacimiento && !peso) {
        return ApiResponse.validation("Debe proporcionar al menos un campo para actualizar.", null, res);
      }

      // Verificar que la mascota existe
      const existingMascota = await MascotaRepository.getById(id);
      if (!existingMascota) {
        return ApiResponse.notFound("Mascota no encontrada.", res);
      }

      // Verificar que la mascota pertenece al cliente (si es cliente quien hace la request)
      if (req.user.tipo === 'cliente' && existingMascota.id_cliente !== req.user.tipoId) {
        return ApiResponse.forbidden("No tienes permiso para actualizar esta mascota.", res);
      }

      const updatedData = {
        ...(nombre && { nombre: nombre.trim() }),
        ...(especie && { especie }),
        ...(raza !== undefined && { raza: raza?.trim() || null }),
        ...(sexo && { sexo }),
        ...(color !== undefined && { color: color?.trim() || null }),
        ...(fecha_nacimiento !== undefined && { fecha_nacimiento }),
        ...(peso !== undefined && { peso })
      };

      const updatedMascota = await MascotaRepository.update(id, updatedData);
      return ApiResponse.success("Mascota actualizada exitosamente.", { mascota: updatedMascota }, res);

    } catch (error) {
      console.error("❌ Error en PUT /mascotas/:id:", error);
      
      if (error instanceof ValidationError) {
        return ApiResponse.validation(error.errors.map(e => e.message), null, res);
      }

      if (error instanceof DatabaseError) {
        return ApiResponse.error("Error en la base de datos.", res);
      }

      return ApiResponse.error("Error interno del servidor.", res);
    }
  };

  // Eliminar mascota
  exports.delete = async (req, res) => {
    try {
      const { id } = req.params;
      
      // Verificar que la mascota existe
      const existingMascota = await MascotaRepository.getById(id);
      if (!existingMascota) {
        return ApiResponse.notFound("Mascota no encontrada.", res);
      }

      // Verificar que la mascota pertenece al cliente (si es cliente quien hace la request)
      if (req.user.tipo === 'cliente' && existingMascota.id_cliente !== req.user.tipoId) {
        return ApiResponse.forbidden("No tienes permiso para eliminar esta mascota.", res);
      }

      await MascotaRepository.deleteMascota(id);
      return ApiResponse.success("Mascota eliminada exitosamente.", null, res);

    } catch (error) {
      console.error("❌ Error en DELETE /mascotas/:id:", error);
      
      if (error instanceof DatabaseError) {
        return ApiResponse.error("Error en la base de datos.", res);
      }

      return ApiResponse.error("Error interno del servidor.", res);
    }
  };

  // Obtener mascotas del cliente autenticado
exports.getMascotasCliente = async (req, res) => {
  try {
    const clienteId = req.user.tipoId; // viene del JWT
    const mascotas = await MascotaRepository.getByClienteId(clienteId);
    return ApiResponse.success("Mascotas del cliente obtenidas exitosamente.", { mascotas }, res);
  } catch (error) {
    console.error("❌ Error en GET /mascotas/mis-mascotas:", error);
    return ApiResponse.error("Error interno del servidor.", res);
  }
};

  // Obtener mascotas por especie
  exports.getByEspecie = async (req, res) => {
    try {
      const { especie } = req.params;
      
      const mascotas = await MascotaRepository.getByEspecie(especie);
      return ApiResponse.success(`Mascotas de especie ${especie} obtenidas exitosamente.`, { mascotas }, res);

    } catch (error) {
      console.error("❌ Error en GET /mascotas/especie/:especie:", error);
      return ApiResponse.error("Error interno del servidor.", res);
    }
  };

  // Obtener historial de vacunas de una mascota
  exports.getHistorialVacunas = async (req, res) => {
    try {
      const { id } = req.params;
      
      // Verificar que la mascota existe
      const mascota = await MascotaRepository.getById(id);
      if (!mascota) {
        return ApiResponse.notFound("Mascota no encontrada.", res);
      }

      // Verificar permisos (cliente solo puede ver sus mascotas)
      if (req.user.tipo === 'cliente' && mascota.id_cliente !== req.user.tipoId) {
        return ApiResponse.forbidden("No tienes permiso para ver el historial de esta mascota.", res);
      }

      const historial = await MascotaRepository.getHistorialVacunas(id);
      return ApiResponse.success("Historial de vacunas obtenido exitosamente.", { historial }, res);

    } catch (error) {
      console.error("❌ Error en GET /mascotas/:id/vacunas:", error);
      return ApiResponse.error("Error interno del servidor.", res);
    }
  };