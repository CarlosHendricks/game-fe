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
    this.prevGameState = null;
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
        this.prevGameState = this.gameState;
        this.gameState = data.data;
        this.detectCollisions();
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

  detectCollisions() {
    if (!this.prevGameState || !this.gameState) {
      return;
    }

    const prevBall = this.prevGameState.ball;
    const currBall = this.gameState.ball;

    if (!prevBall || !currBall) {
      return;
    }

    // Detect velocity change (collision with paddle)
    const prevVx = prevBall.vx;
    const currVx = currBall.vx;

    // If velocity direction changed significantly, there was a collision
    if (Math.sign(prevVx) !== Math.sign(currVx) && Math.abs(currVx) > 0) {
      // Scale coordinates to canvas
      const scaleX = this.canvas.width / CONFIG.FIELD_WIDTH;
      const scaleY = this.canvas.height / CONFIG.FIELD_HEIGHT;
      
      const x = currBall.x * scaleX;
      const y = currBall.y * scaleY;

      // Determine color based on which side
      const color = currVx > 0 ? CONFIG.COLOR_PLAYER : CONFIG.COLOR_AI;
      
      // Trigger explosion effect
      this.renderer.triggerExplosion(x, y, color);
    }

    // Detect score change (goal)
    if (this.prevGameState.player1Score !== this.gameState.player1Score ||
        this.prevGameState.player2Score !== this.gameState.player2Score) {
      
      const scaleX = this.canvas.width / CONFIG.FIELD_WIDTH;
      const scaleY = this.canvas.height / CONFIG.FIELD_HEIGHT;
      
      const x = currBall.x * scaleX;
      const y = currBall.y * scaleY;

      // Big explosion on goal
      const color = CONFIG.COLOR_BALL;
      this.renderer.triggerExplosion(x, y, color);
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
