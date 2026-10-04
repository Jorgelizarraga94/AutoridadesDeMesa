# Prueba de concepto: autoridades de mesa

Sitio con inscripción de voluntarios, consulta de charlas con ubicación en mapa y panel de administración.

## Acceso de administrador
Usuario: `admin` - Contraseña: `admin` (botón Login del navbar). Desde el panel se agregan, editan y eliminan charlas.

## Páginas
| Página | Qué hace |
|---|---|
| `index.html` | Inicio |
| `inscripcion.html` | Formulario de postulación (un registro por DNI) |
| `charlas.html` | Tarjetas de charlas; cada una abre el mapa con esa charla destacada |
| `mapa.html` | Mapa (Leaflet + OpenStreetMap) con todas las sedes; la elegida se centra y se destaca |
| `login.html` | Ingreso del administrador |
| `dashboardAdmin.html` | ABM de charlas (requiere sesión) |

Cada página tiene su CSS en `css/<pagina>.css`; `css/base.css` guarda lo compartido (colores, navbar, botones, formularios).

## Persistencia (localStorage)
| Clave | Contenido |
|---|---|
| `registros` | Inscripciones |
| `charlas` | Charlas (se precargan de `datos/charlasIniciales.js` la primera vez) |
| `administradores` | Administrador inicial |

La sesión usa `sessionStorage` y se cierra al cerrar la pestaña. Para reiniciar los datos: DevTools > Application > Local Storage > Clear.

## Estructura
- `src/modelo/`: una clase por archivo.
- `src/datos/`: repositorios, los únicos que conocen el almacenamiento.
- `src/logica/`: validaciones y reglas (inscripción, charlas, autenticación, servicio de mapa).
- `src/presentacion/`: vistas y navbar; manipulan el DOM y llaman a la lógica.

## Limitaciones
Los datos quedan en el navegador donde se usan. La contraseña se guarda sin cifrar: alcanza para una prueba de concepto, no para producción.
