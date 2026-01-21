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
  
  // Colors - Vibrant neon palette
  COLOR_BACKGROUND: '#0a0e27',
  COLOR_FOREGROUND: '#FFFFFF',
  COLOR_PLAYER: '#00ff88',     // Player 1 (left side, cyan-green)
  COLOR_AI: '#ff006e',          // Player 2 (right side, hot pink)
  COLOR_BALL: '#ffbe0b',        // Yellow/gold
  COLOR_UI: '#00d9ff',          // Bright cyan
  COLOR_ACCENT: '#8338ec',      // Purple accent
  
  // Visual effects
  ENABLE_PARTICLES: true,
  ENABLE_BALL_TRAIL: true,
  ENABLE_GLOW: true,
  GLOW_INTENSITY: 20,
};