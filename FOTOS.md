# Guía de fotografías de jugadores

Todas las fotos deben parecer sacadas por el mismo fotógrafo. Sigue estas pautas.

| Aspecto | Recomendación |
|---|---|
| Tamaño | 800 × 1000 px |
| Relación de aspecto | 4:5 vertical (la web recorta a esa proporción sin deformar) |
| Formato | WebP (alternativa: JPG calidad 85) |
| Resolución | 72 ppp |
| Peso máximo | 200 KB por foto |
| Encuadre | Busto o medio cuerpo, cabeza centrada, algo de aire encima, mirando al frente o ligeramente girado |
| Fondo | Liso, gris claro (#E9ECEA) o blanco; el mismo para todos |
| Luz | Frontal y suave (junto a una ventana o con luz difusa), sin sombras duras |
| Estilo | Camiseta lisa u oscura, sin gafas de sol ni gorra, misma distancia a la cámara |

Nombre de archivo: nombre en minúsculas sin tildes ni espacios, por ejemplo `pablo-campos.webp`.

## Cómo subirlas (hasta que esté el panel de administración)
1. Supabase > Storage > bucket `fotos` > Upload file.
2. Pulsa sobre la foto subida > Get URL (URL pública) y cópiala.
3. Supabase > Table Editor > `jugadores` > pega la URL en la columna `foto_url` del jugador.

## Cómo sustituirlas
Sube la nueva foto con **otro nombre** (así se evita la caché del navegador) y cambia la URL en `foto_url`.
Con el panel de administración (bloque 5) todo esto se hará con un botón "Cambiar foto".
