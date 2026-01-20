import { GameWebSocket } from '../network/websocket.js';
import { Renderer } from './renderer.js';
import { InputManager } from './input.js';
import { CONFIG } from '../config.js';

/**
 * Game class - manages the game state and rendering
 */
class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.renderer = new Renderer(canvas);
    this.ws = new GameWebSocket();
    this.inputManager = null;
    
    this.gameState = null;
    this.connectionStatus = 'Connecting...';
    this.isRunning = false;
    
    this.setupCanvas();
    this.setupWebSocket();
    this.setupKeyboardHandlers();
  }

  setupCanvas() {
    // Set canvas size to match game field with some padding
    const maxWidth = window.innerWidth * 0.95;
    const maxHeight = window.innerHeight * 0.95;
    
    const aspectRatio = CONFIG.FIELD_WIDTH / CONFIG.FIELD_HEIGHT;
    
    if (maxWidth / aspectRatio <= maxHeight) {
      this.canvas.width = maxWidth;
      this.canvas.height = maxWidth / aspectRatio;
    } else {
      this.canvas.height = maxHeight;
      this.canvas.width = maxHeight * aspectRatio;
    }

    // Handle window resize
    window.addEventListener('resize', () => {
      this.setupCanvas();
      this.render();
    });
  }

  setupWebSocket() {
    // Listen to messages
    this.ws.onMessage((data) => {
      if (data.type === 'game_state') {
        this.gameState = data.data;
      }
    });

    // Listen to connection open
    this.ws.onOpen(() => {
      this.connectionStatus = 'Connected';
      console.log('Connected to game server');
      
      // Create input manager after connection
      if (!this.inputManager) {
        this.inputManager = new InputManager(this.ws);
      }
    });

    // Listen to connection close
    this.ws.onClose((event) => {
      this.connectionStatus = 'Disconnected';
      this.gameState = null;
      console.log('Disconnected from game server');
    });

    // Connect to server
    this.ws.connect();
  }

  setupKeyboardHandlers() {
    // Handle spacebar for start/restart
    window.addEventListener('keydown', (e) => {
      if (e.code === 'Space') {
        e.preventDefault();
        
        if (!this.gameState) {
          return;
        }

        if (this.gameState.state === 'waiting') {
          this.startGame();
        } else if (this.gameState.state === 'gameover') {
          this.resetGame();
        }
      }
    });
  }

  startGame() {
    if (this.ws.isConnected) {
      console.log('Starting game');
      this.ws.send({
        type: 'start_game',
        data: {}
      });
    }
  }

  resetGame() {
    if (this.ws.isConnected) {
      console.log('Resetting game');
      this.ws.send({
        type: 'reset_game',
        data: {}
      });
    }
  }

  render() {
    const statusColor = this.ws.isConnected ? '#00ff00' : '#ff0000';
    this.renderer.render(this.gameState, this.connectionStatus);
  }

  start() {
    if (this.isRunning) {
      return;
    }
    
    this.isRunning = true;
    console.log('Game loop started');
    
    // Start render loop
    const renderLoop = () => {
      if (!this.isRunning) {
        return;
      }
      
      this.render();
      requestAnimationFrame(renderLoop);
    };
    
    renderLoop();
  }

  stop() {
    this.isRunning = false;
    this.ws.disconnect();
    console.log('Game stopped');
  }
}

/**
 * Initialize the game
 * @param {HTMLCanvasElement} canvas 
 */
export function initGame(canvas) {
  const game = new Game(canvas);
  game.start();
  
  console.log('Game initialized');
  
  // Return game instance for debugging
  return game;
}
