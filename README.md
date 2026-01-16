# Game FE - Frontend Client

Cliente web del juego Pong construido con HTML5 Canvas y JavaScript vanilla. Proporciona una experiencia visual fluida y responsiva con comunicación en tiempo real al servidor.

## Stack Tecnológico

- **HTML5 Canvas API** - Renderizado 2D
- **JavaScript ES6+** - Sin frameworks, código puro
- **WebSocket API** - Comunicación en tiempo real
- **CSS3** - Estilos y animaciones

## Características

### Renderizado
- 60 FPS mediante RequestAnimationFrame
- Interpolación de estados para movimiento suave
- Sistema de partículas para efectos visuales
- Canvas responsive que se adapta al viewport
- Renderizado optimizado (dirty rectangles)

### Networking
- Client-side prediction para mejor sensación
- Reconciliación de estado servidor-cliente
- Manejo de lag y packet loss
- Reconexión automática

### UX/UI
- Menú principal intuitivo
- HUD con información en tiempo real
- Efectos visuales y sonoros
- Controles responsivos (teclado/ratón)
- Pantalla de game over con estadísticas

## Instalación y Ejecución

### Desarrollo Local

```bash
# Clonar repositorio
git clone https://github.com/tu-usuario/game-fe.git
cd game-fe

# Opción 1: Python
python -m http.server 3000

# Opción 2: Node.js
npx serve -p 3000

# Opción 3: PHP
php -S localhost:3000

# Abrir en navegador
open http://localhost:3000
```

### Configurar Backend

Editar `js/config.js`:

```javascript
export const CONFIG = {
  SERVER_URL: 'ws://localhost:8080/ws/game', // URL del backend
  // ...
};
```