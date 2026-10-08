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
| `dashboardAdmin.html` | ABM de charlas y auditoría de inscripciones (requiere sesión) |

Cada página tiene su CSS en `css/<pagina>.css`; `css/base.css` guarda lo compartido (colores, navbar, botones, formularios).

Al cargar o editar una charla se guarda la dirección de la sede, sin coordenadas. Al abrir el mapa, cada dirección se consulta en la API de normalización de direcciones [USIG](https://servicios.usig.buenosaires.gob.ar/normalizar/); las coordenadas devueltas por la API se usan para ubicar los marcadores y no se precargan ni se guardan. La búsqueda requiere conexión a internet y una dirección reconocida por USIG en la localidad indicada. Los mapas y datos deben atribuirse a [OpenStreetMap](https://www.openstreetmap.org/copyright).

## Persistencia (localStorage)
| Clave | Contenido |
|---|---|
| `registros` | Inscripciones |
| `auditorias` | Estado, descripción y fecha de revisión por inscripción |
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
