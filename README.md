# PRISMA · Casino virtual y administración

Modelo full-stack de casino con saldo virtual. No procesa dinero real ni incluye juegos o apuestas: las tarjetas son espacios de catálogo para una futura integración API.

## Inicio

Node 24.14.1 (configuración existente de Render), `npm install`, `npm start`.

- `/` y `/player.html`: casino adaptable a celular, categorías, búsqueda, banners, inicio de sesión, saldo e historial.
- `/master.html`: administración, usuarios, cargas/retiros, historial, banners y ajustes del casino.
- Usuarios demo existentes: `masteradmin`, `jugador01`, `agente01`, `cajero01`. Contraseña inicial de la base demo: `demo1234`.

## Panel

**Banners** permite subir PNG/JPG/WEBP/GIF de hasta 1,5 MB, con título, descripción, categoría y orden. Se pueden ocultar, publicar y eliminar. Se almacenan en SQLite y se muestran en la portada; varios banners tienen controles de navegación. Recomendación: 1600 × 600 px. El casino consulta los cambios al abrirse, al recuperar el foco y cada 30 segundos.

**Configuración** permite cambiar nombre, frase, anuncio, color de acento, visibilidad de categorías y mantenimiento. Solo el rol master puede modificar banners y ajustes. Agentes y cajeros solo pueden crear y modificar jugadores; no pueden editar personal ni acceder a configuración.

Se conserva el archivo `data/universe.db` para mantener usuarios y movimientos del prototipo anterior. Las tablas de contenido se crean automáticamente sin borrar datos.

## Render y persistencia

Root Directory vacío · Build `npm install` · Start `npm start`.

Para conservar usuarios, fichas y banners entre despliegues, montar un disco persistente y configurar `DATA_DIR` con su ruta (por ejemplo `/var/data`). Si ya hay una base existente, copiar `universe.db` a la nueva ruta antes de cambiar `DATA_DIR`. Sin disco persistente, Render puede perder datos al reiniciar o desplegar.

Configurar `SESSION_SECRET` con un valor propio. Las sesiones del prototipo se mantienen en memoria y se cierran al reiniciar. Los accesos iniciales son exclusivamente para demostración, no para un servicio público de producción.

## Integración futura

Las secciones casino, casino en vivo y deportes funcionan como navegación y presentación. No se conecta ningún proveedor ni se simulan partidos, cuotas o resultados. La integración futura requiere catálogo, autenticación del proveedor y sus endpoints de lanzamiento y wallet. Activar una categoría solo la hace visible, no conecta un proveedor.

## Verificación

Con servidor local iniciado, `node integration-test.mjs` comprueba permisos, publicación de banners, ajustes, mantenimiento, cargas/retiros e insuficiencia de saldo. Ejecutar únicamente contra una base demo, ya que registra movimientos de prueba.
