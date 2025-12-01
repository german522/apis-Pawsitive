const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configuración de almacenamiento para imágenes de personas (clientes/veterinarios)
const storagePersonas = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'pawsitive/personas',
        allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
        transformation: [{ width: 500, height: 500, crop: 'limit' }],
        public_id: (req, file) => `persona-${Date.now()}-${file.originalname.split('.')[0]}`
    },
});

// Configuración de almacenamiento para imágenes de mascotas
const storageMascotas = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'pawsitive/mascotas',
        allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
        transformation: [{ width: 800, height: 800, crop: 'limit' }],
        public_id: (req, file) => `mascota-${Date.now()}-${file.originalname.split('.')[0]}`
    },
});

// Configuración de almacenamiento para documentos (cédulas, documentos)
const storageDocumentos = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'mi_app',
        allowed_formats: ['jpg', 'png', 'jpeg', 'pdf'],
        public_id: (req, file) => `documento-${Date.now()}-${file.originalname.split('.')[0]}`
    },
});

const storageProductos = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'pawsitive/productos',
        allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
        transformation: [{ width: 800, height: 800, crop: 'limit' }],
        public_id: (req, file) => `producto-${Date.now()}-${file.originalname.split('.')[0]}`
    },
});

const uploadPersona = multer({ 
    storage: storagePersonas,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB máximo
});

const uploadMascota = multer({ 
    storage: storageMascotas,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB máximo
});

const uploadDocumento = multer({ 
    storage: storageDocumentos,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB máximo
});

const uploadProducto = multer({
    storage: storageProductos,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

module.exports = {
    cloudinary,
    uploadPersona,
    uploadMascota,
    uploadDocumento,
    uploadProducto
};