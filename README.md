# Puzzle Club San Juan

## Optimizar imágenes

Ejecutá un único comando para convertir los `.jpg`, `.jpeg` y `.png` de `public/images` y `public/gallery` a WebP:

```bash
npm run optimize-images
```

El proceso conserva los originales, mantiene el nombre base de cada archivo y genera los resultados en `public/optimized/images` y `public/optimized/gallery`. Cada imagen se limita a 1600 px de ancho sin deformarse y se codifica en WebP con calidad 80.
