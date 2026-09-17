# NEXORA · Casino virtual y administración

Modelo full-stack de casino con saldo virtual. No procesa dinero real ni incluye juegos o apuestas: las tarjetas son espacios de catálogo para una futura integración API.

## Inicio

Node 24.14.1 (configuración existente de Render), `npm install`, `npm start`.

- `/`: pantalla de acceso única. La sesión dirige a jugadores a `/player.html` y al personal a `/master.html`.
- `/player.html`: casino adaptable a celular, categorías, búsqueda, banners, saldo e historial. Requiere sesión; el personal puede previsualizarlo desde el panel.
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

## Versión visual NEXORA

Portada de acceso, lobby con 14 categorías ilustradas originales, navegación inferior móvil y diseño adaptable a 360 px, 390 px, tablet y escritorio. Las tarjetas informan “Próximamente”; no lanzan juegos, aceptan apuestas ni simulan cuotas. Se mantienen los datos y ajustes existentes, incluido el nombre personalizado; NEXORA es el valor inicial de una base nueva.

El servidor verifica la sesión antes de entregar las páginas del casino y administración. Los jugadores no acceden al panel; las APIs conservan sus controles de rol. El saldo se actualiza al volver a la pestaña y cada 30 segundos. No se realizó despliegue de producción.

## Verificación

Con servidor local iniciado, `node integration-test.mjs` comprueba permisos, publicación de banners, ajustes, mantenimiento, cargas/retiros e insuficiencia de saldo. Ejecutar únicamente contra una base demo, ya que registra movimientos de prueba.

Prueba de navegador: instalar Playwright en el entorno de pruebas (`npm install --no-save playwright` y `npx playwright install chromium`) y ejecutar `TEST_BASE_URL=http://localhost:3100 node tests/browser.mjs` contra un servidor iniciado con `DATA_DIR` temporal y `PORT=3100`. Opcional: `CHROMIUM_PATH` para un navegador ya instalado. Prueba accesos por rol, permisos de páginas, búsqueda, móvil, creación de usuarios, cargas/retiros, banners y configuración. Genera capturas en `/tmp/nexora-*.png`. Usa solamente una base demo: crea un usuario, registra movimientos y elimina los banners de prueba.
