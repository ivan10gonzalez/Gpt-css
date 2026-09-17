# BRAVO · Casino virtual y administración

Nueva versión visual sobre el trabajo existente de PRISMA/NEXORA. Casino, casino en vivo y deportes son categorías ilustradas, sin juegos, proveedores, cuotas ni apuestas. Todos los saldos son fichas virtuales.

## Corrección de acceso en el modelo actual

El inicio normal (`npm start`) ahora crea automáticamente las dos cuentas de prueba que falten en la misma base que usa el servicio. Esta provisión está autorizada para este modelo con fichas virtuales. Funciona también con `NODE_ENV=production` (modo de ejecución de Node que suele usar Render). No requiere otro servicio, otra base ni variables nuevas.

Después de desplegar la corrección de `main`, abrir `/` e iniciar sesión con las cuentas de abajo. No se ha verificado una URL ni una base de Render: las pruebas de provisión y login se realizaron localmente.

## Entrada y roles reales

| Ruta | Comportamiento |
| --- | --- |
| `/`, `/index.html`, `/login`, `/login.html` | Siempre formulario de usuario y contraseña, incluso con sesión anterior. La sesión actual se informa y puede cerrarse. No hay redirección automática desde la portada. |
| `/casino`, `/player`, `/player.html` | Requiere jugador autenticado; el personal es dirigido al panel. |
| `/admin`, `/master`, `/master.html` | Requiere personal autenticado; un jugador es devuelto al casino. |
| `/preview` | Vista del casino exclusiva para personal, con aviso y regreso al panel. |

El servidor autentica contraseña mediante bcrypt y usa el rol guardado en SQLite, no un selector del navegador. Las rutas y las APIs tienen controles de sesión/rol. Se conserva el login regenerando la sesión, se evita almacenar páginas de cuenta en caché y se invalida la sesión al salir. Los usuarios bloqueados pierden acceso. Las sesiones de este modelo siguen en memoria y expiran al reiniciar el proceso.

## Cuentas de prueba y activación

| Acceso | Usuario | Contraseña | Destino |
| --- | --- | --- | --- |
| Jugador | `demo_jugador` | `BravoJuega!26` | `/casino` |
| Administrador | `demo_admin` | `BravoPanel!26` | `/admin` |

Son credenciales públicas exclusivamente para recorrer este modelo de fichas virtuales. Están verificadas localmente en bases vacías y existentes; no se afirma que estén creadas en Render antes de verificar el despliegue.

**Paso para el servicio actual:** desplegar el último commit de `main` y dejar que arranque con el comando habitual `npm start`. No cambiar `DATA_DIR` ni borrar archivos. Si auto-deploy está habilitado, comprobar que se desplegó el commit de la corrección.

### Cómo se conservan los datos

- Solo se insertan nombres de cuenta ausentes. No se borran ni modifican filas existentes.
- Los reinicios no restablecen contraseñas, saldos, roles o bloqueos. El crédito inicial del jugador nuevo se registra una sola vez en el historial.
- Si `demo_jugador` o `demo_admin` ya existe con otra contraseña, rol o bloqueo, se conserva íntegramente y el log muestra `CONFLICTO`. Las credenciales publicadas no sustituyen las de esa cuenta. No probar contraseñas al azar: ese caso requiere revisar el conflicto concreto.
- La provisión ocurre dentro del proceso de arranque, en una transacción, sin endpoint HTTP para crear administradores.
- Usuarios, fichas, ledger, banners y ajustes de `universe.db` se conservan. `DATA_DIR` mantiene su significado y su valor predeterminado `data/` dentro del proyecto.

Los logs solo informan `creada`, `ya disponible, sin cambios` o `CONFLICTO`, nunca contraseñas. Si en el futuro se quiere desactivar esta provisión de prueba, configurar `BRAVO_DEMO_ACCOUNTS=false`; esto no elimina las cuentas ya creadas. Esta variable no hace falta para probar el modelo.

### Comandos

```sh
npm install
npm start
```

`npm run seed:demo` permite provisionar las cuentas que falten en la misma base, de forma idempotente. `npm run demo` sigue disponible como alias de arranque. Ya no exigen DEMO_MODE, carpeta vacía ni cambiar NODE_ENV.

Usar un disco persistente en Render para conservar datos entre despliegues y un `SESSION_SECRET` propio. La corrección no cambia esa configuración ni mueve bases.

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
npm run test:provision
npm test
```

Opcional: `CHROMIUM_PATH` para Chromium ya instalado, `TEST_PORT` para otro puerto y `EVIDENCE_DIR` para capturas. Las pruebas crean una base temporal aislada y levantan/cerran su propio servidor. No usan la base configurada del usuario.

Cubren: portada con y sin sesión de ambos roles, login incorrecto/correcto, rutas protegidas y alias HTML codificados, cierre de sesión y bloqueo, provisión aditiva idempotente, creación de usuarios, cargas/retiros/saldo insuficiente, movimientos, banners, personalización, mantenimiento y vistas 360/390/768/1440 px sin errores JavaScript ni desbordes horizontales.

`npm run test:provision` valida el arranque en NODE_ENV=production, ambas cuentas y sus destinos, bases vacías/existentes, reinicios, historial y saldo preservados, conflictos sin sobrescritura y desactivación explícita.
