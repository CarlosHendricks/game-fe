import { GameWebSocket } from '../network/websocket.js';

/**
 * Initialize the game
 * @param {HTMLCanvasElement} canvas 
 */
export function initGame(canvas) {
  const ctx = canvas.getContext('2d');
  
  if (!ctx) {
    console.error('Could not get 2D context');
    return;
  }

  // Set canvas size
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  // Create WebSocket connection
  const ws = new GameWebSocket();
  let connectionStatus = 'Connecting...';
  let clientCount = 0;

  // Listen to messages
  ws.onMessage((data) => {
    console.log('Game received:', data);
    
    // Handle client count updates
    if (data.type === 'client_count') {
      clientCount = data.data.count;
      draw();
    }
  });

  // Listen to connection open
  ws.onOpen(() => {
    connectionStatus = 'Connected';
    draw();
  });

  // Listen to connection close
  ws.onClose((event) => {
    connectionStatus = 'Disconnected';
    clientCount = 0;
    draw();
  });

  // Connect to server
  ws.connect();

  // Draw function
  function draw() {
    // Clear canvas with black background
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw "Hola Mundo" text
    ctx.fillStyle = '#0f0';
    ctx.font = '48px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('¡Hola Mundo!', canvas.width / 2, canvas.height / 2);
    
    // Draw subtitle
    ctx.fillStyle = '#fff';
    ctx.font = '24px monospace';
    ctx.fillText('Game Frontend funcionando correctamente', canvas.width / 2, canvas.height / 2 + 60);
    
    // Draw connection status
    const statusColor = ws.isConnected ? '#0f0' : '#f00';
    ctx.fillStyle = statusColor;
    ctx.font = '20px monospace';
    ctx.fillText(`Server: ${connectionStatus}`, canvas.width / 2, canvas.height / 2 + 100);
    
    // Draw client count
    if (ws.isConnected) {
      ctx.fillStyle = '#00ccff';
      ctx.font = '24px monospace';
      const plural = clientCount === 1 ? 'cliente' : 'clientes';
      ctx.fillText(`${clientCount} ${plural} conectado${clientCount === 1 ? '' : 's'}`, canvas.width / 2, canvas.height / 2 + 140);
    }
  }

  // Initial draw
  draw();

  // Handle window resize
  window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    draw();
  });

  console.log('Game initialized');
}
