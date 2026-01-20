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
  MAX_RECONNECT_ATTEMPTS: 5,
  
  // Game dimensions (must match backend)
  FIELD_WIDTH: 800,
  FIELD_HEIGHT: 600,
  
  // Paddle dimensions
  PADDLE_WIDTH: 10,
  PADDLE_HEIGHT: 100,
  
  // Ball dimensions
  BALL_RADIUS: 8,
  
  // Colors
  COLOR_BACKGROUND: '#000000',
  COLOR_FOREGROUND: '#FFFFFF',
  COLOR_PLAYER: '#00FF00',     // Player 1 (left side, green)
  COLOR_AI: '#FF0000',          // Player 2 (right side, red)
  COLOR_BALL: '#FFFFFF',
  COLOR_UI: '#00CCFF',
};