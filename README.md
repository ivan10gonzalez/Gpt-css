# BRAVO · Casino virtual y administración

Nueva versión visual sobre el trabajo existente de PRISMA/NEXORA. Casino, casino en vivo y deportes son categorías ilustradas, sin juegos, proveedores, cuotas ni apuestas. Todos los saldos son fichas virtuales.

## Estado de entrega

El código de revisión se entrega en el PR #1, rama `feat/nexora-role-lobby`. Mientras ese PR siga abierto, `main` conserva la versión anterior. No se realizó un despliegue a Render ni se cambió su configuración. Tener el nombre NEXORA en el sitio anterior no significa que ese PR esté publicado.

Después de fusionar el PR, un servicio configurado para desplegar automáticamente `main` podrá tomarlo; hay que comprobar su rama configurada y el commit desplegado. Para revisión sin tocar producción, usar un servicio demo separado con la rama del PR. No se conoce una URL de Render verificada: no se proporciona un enlace inventado.

## Entrada y roles reales

| Ruta | Comportamiento |
| --- | --- |
| `/`, `/index.html`, `/login`, `/login.html` | Siempre formulario de usuario y contraseña, incluso con sesión anterior. La sesión actual se informa y puede cerrarse. No hay redirección automática desde la portada. |
| `/casino`, `/player`, `/player.html` | Requiere jugador autenticado; el personal es dirigido al panel. |
| `/admin`, `/master`, `/master.html` | Requiere personal autenticado; un jugador es devuelto al casino. |
| `/preview` | Vista del casino exclusiva para personal, con aviso y regreso al panel. |

El servidor autentica contraseña mediante bcrypt y usa el rol guardado en SQLite, no un selector del navegador. Las rutas y las APIs tienen controles de sesión/rol. Se conserva el login regenerando la sesión, se evita almacenar páginas de cuenta en caché y se invalida la sesión al salir. Los usuarios bloqueados pierden acceso. Las sesiones de este modelo siguen en memoria y expiran al reiniciar el proceso.

## Dos cuentas exclusivamente de demostración

Estas cuentas se crean solo con el arranque demo explícito y en una base nueva:

| Acceso | Usuario | Contraseña | Destino |
| --- | --- | --- | --- |
| Jugador | `demo_jugador` | `BravoJuega!26` | `/casino` |
| Administrador | `demo_admin` | `BravoPanel!26` | `/admin` |

Verificadas localmente con pruebas de navegador y servidor. No verificadas ni activadas en Render. Son credenciales públicas de demostración: usar únicamente en un entorno separado para fichas virtuales, nunca sobre una base real.

### Arranque demo local

Node 24.14.1 o compatible con las dependencias existentes:

```sh
npm install
DEMO_MODE=true NODE_ENV=development DATA_DIR=./demo-data npm run demo
```

Abrir `http://localhost:3000/`. Elegir una carpeta DATA_DIR nueva. El primer inicio crea exactamente las dos cuentas anteriores; los siguientes conservan sus datos. Si la base ya existe y no fue creada por este inicializador de demo, el comando se detiene sin modificarla. No se admite `NODE_ENV=production` para este modo.

### Revisar en un servicio Render separado

Sin tocar el servicio ni disco existentes:

- Repositorio: `ivan10gonzalez/Gpt-css`.
- Rama de revisión: `feat/nexora-role-lobby`.
- Build Command: `npm install`.
- Start Command: `npm run demo`.
- Variables: `DEMO_MODE=true`, `NODE_ENV=development`, `DATA_DIR` apuntando a una carpeta nueva de demostración y `SESSION_SECRET` con un valor propio.
- Si se monta un disco persistente nuevo, puede usarse `DATA_DIR=/var/data/bravo-demo`. Sin disco, las fichas y usuarios de la demo pueden perderse al reiniciar.

Una vez desplegado ese servicio, abrir su enlace principal con ruta `/`: debe verse el login. El nombre real del enlace lo proporciona Render. No usar las credenciales de demo hasta activar este modo en ese servicio.

### Continuar con una base existente

```sh
npm install
DATA_DIR=/ruta/de/la/base/existente SESSION_SECRET=valor-propio npm start
```

`npm start` no crea ni cambia cuentas demo. Se mantienen `universe.db`, usuarios, contraseñas, saldos, historial y banners. Las tablas faltantes se crean sin borrar las existentes. Los nombres predeterminados heredados PRISMA/NEXORA/VANTA/UNIVERSE GAME se presentan como BRAVO sin reescribir el valor almacenado; cualquier nombre personalizado se conserva. No se cambian permisos ni se resetean contraseñas existentes.

## Panel y casino

- Crear jugadores y personal según permisos; activar/bloquear usuarios.
- Cargar/retirar fichas con validación de saldo e historial. Un jugador no puede llamar a las APIs administrativas.
- Publicar, ordenar, ocultar y borrar banners PNG/JPG/WEBP/GIF hasta 1,5 MB. La portada incluye navegación manual entre banners.
- Nombre, frase, anuncio, color de acento, categorías y mantenimiento guardados en SQLite.
- Lobby de ancho completo con destacados asimétricos, 14 escenas SVG originales y formatos propios para slots, mesas y deportes.
- Búsqueda de categorías, navegación inferior móvil, saldo, movimientos y salida visible. Las tarjetas informan que el catálogo está pendiente.

El color configurable se aplica a indicadores y controles; las ilustraciones y campañas conservan su paleta. El catálogo y el saldo se refrescan al volver a la pestaña y cada 30 segundos.

## Verificación reproducible

```sh
npm install --no-save playwright
npx playwright install chromium
npm test
```

Opcional: `CHROMIUM_PATH` para Chromium ya instalado, `TEST_PORT` para otro puerto y `EVIDENCE_DIR` para capturas. Las pruebas crean una base temporal aislada y levantan/cerran su propio servidor. No usan la base configurada del usuario.

Cubren: portada con y sin sesión de ambos roles, login incorrecto/correcto, rutas protegidas y alias HTML codificados, cierre de sesión y bloqueo, protección del inicializador demo, creación de usuarios, cargas/retiros/saldo insuficiente, movimientos, banners, personalización, mantenimiento y vistas 360/390/768/1440 px sin errores JavaScript ni desbordes horizontales.
