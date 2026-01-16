// js/config.js
// ===========================================
// CONFIGURACIÓN DEL JUEGO
// Edita estos valores según tu entorno
// ===========================================

export const CONFIG = {
  // URL del servidor WebSocket
  // Desarrollo: 'ws://localhost:8080/ws/game'
  // Producción: 'wss://tu-dominio.com/ws/game'
  SERVER_URL: 'ws://localhost:8080/ws/game',
  
  // Configuración del juego
  CANVAS_WIDTH: 800,
  CANVAS_HEIGHT: 600,
  FPS: 60,
  
  // Configuración de red
  RECONNECT_DELAY: 3000,
  MAX_RECONNECT_ATTEMPTS: 2,
};