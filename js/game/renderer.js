import { CONFIG } from '../config.js';

/**
 * Renderer for drawing the game on canvas
 */
export class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    
    if (!this.ctx) {
      throw new Error('Could not get 2D context');
    }
  }

  /**
   * Clear the canvas
   */
  clear() {
    this.ctx.fillStyle = CONFIG.COLOR_BACKGROUND;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  /**
   * Draw the game field (center line)
   */
  drawField() {
    // Draw center line (dashed)
    this.ctx.strokeStyle = CONFIG.COLOR_FOREGROUND;
    this.ctx.lineWidth = 2;
    this.ctx.setLineDash([10, 10]);
    
    const centerX = this.canvas.width / 2;
    this.ctx.beginPath();
    this.ctx.moveTo(centerX, 0);
    this.ctx.lineTo(centerX, this.canvas.height);
    this.ctx.stroke();
    
    this.ctx.setLineDash([]); // Reset dash
  }

  /**
   * Draw a paddle
   */
  drawPaddle(paddle, isPlayer) {
    const scaleX = this.canvas.width / CONFIG.FIELD_WIDTH;
    const scaleY = this.canvas.height / CONFIG.FIELD_HEIGHT;
    
    const x = paddle.x * scaleX;
    const y = paddle.y * scaleY;
    const width = paddle.width * scaleX;
    const height = paddle.height * scaleY;
    
    this.ctx.fillStyle = isPlayer ? CONFIG.COLOR_PLAYER : CONFIG.COLOR_AI;
    this.ctx.fillRect(x, y, width, height);
  }

  /**
   * Draw the ball
   */
  drawBall(ball) {
    const scaleX = this.canvas.width / CONFIG.FIELD_WIDTH;
    const scaleY = this.canvas.height / CONFIG.FIELD_HEIGHT;
    
    const x = ball.x * scaleX;
    const y = ball.y * scaleY;
    const radius = ball.radius * Math.min(scaleX, scaleY);
    
    this.ctx.fillStyle = CONFIG.COLOR_BALL;
    this.ctx.beginPath();
    this.ctx.arc(x, y, radius, 0, Math.PI * 2);
    this.ctx.fill();
  }

  /**
   * Draw the score
   */
  drawScore(playerScore, aiScore) {
    this.ctx.fillStyle = CONFIG.COLOR_FOREGROUND;
    this.ctx.font = '48px monospace';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'top';
    
    const centerX = this.canvas.width / 2;
    const scoreText = `${playerScore} - ${aiScore}`;
    
    this.ctx.fillText(scoreText, centerX, 20);
  }

  /**
   * Draw waiting message
   */
  drawWaitingMessage(playerCount) {
    this.ctx.fillStyle = CONFIG.COLOR_UI;
    this.ctx.font = '32px monospace';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    
    const centerX = this.canvas.width / 2;
    const centerY = this.canvas.height / 2;
    
    if (playerCount < 2) {
      this.ctx.fillText(`Waiting for players... (${playerCount}/2)`, centerX, centerY - 20);
      this.ctx.font = '24px monospace';
      this.ctx.fillStyle = CONFIG.COLOR_FOREGROUND;
      this.ctx.fillText('Need 2 players to start', centerX, centerY + 30);
    } else {
      this.ctx.fillText('Press SPACE to start', centerX, centerY);
      
      // Draw controls
      this.ctx.font = '20px monospace';
      this.ctx.fillStyle = CONFIG.COLOR_FOREGROUND;
      this.ctx.fillText('Player 1 (Green): W/S', centerX - 150, centerY + 50);
      this.ctx.fillText('Player 2 (Red): Arrow Keys', centerX + 150, centerY + 50);
    }
  }

  /**
   * Draw game over message
   */
  drawGameOver(winner) {
    // Semi-transparent overlay
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Winner text
    const text = winner === 'player1' ? 'PLAYER 1 WINS!' : 'PLAYER 2 WINS!';
    const color = winner === 'player1' ? CONFIG.COLOR_PLAYER : CONFIG.COLOR_AI;
    
    this.ctx.fillStyle = color;
    this.ctx.font = '64px monospace';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    
    const centerX = this.canvas.width / 2;
    const centerY = this.canvas.height / 2;
    
    this.ctx.fillText(text, centerX, centerY - 40);
    
    // Restart message
    this.ctx.fillStyle = CONFIG.COLOR_UI;
    this.ctx.font = '24px monospace';
    this.ctx.fillText('Press SPACE to play again', centerX, centerY + 40);
  }

  /**
   * Draw connection status
   */
  drawConnectionStatus(status, color) {
    this.ctx.fillStyle = color;
    this.ctx.font = '16px monospace';
    this.ctx.textAlign = 'left';
    this.ctx.textBaseline = 'top';
    this.ctx.fillText(`Server: ${status}`, 10, 10);
  }

  /**
   * Render the entire game state
   */
  render(gameState, connectionStatus) {
    this.clear();
    
    if (!gameState) {
      // No game state yet
      this.drawConnectionStatus(connectionStatus, '#ff0000');
      this.ctx.fillStyle = CONFIG.COLOR_UI;
      this.ctx.font = '32px monospace';
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText('Waiting for server...', this.canvas.width / 2, this.canvas.height / 2);
      return;
    }

    this.drawField();
    
    // Draw paddles
    if (gameState.player1) {
      this.drawPaddle(gameState.player1, true);
    }
    if (gameState.player2) {
      this.drawPaddle(gameState.player2, false);
    }
    
    // Draw ball
    if (gameState.ball) {
      this.drawBall(gameState.ball);
    }
    
    // Draw score
    this.drawScore(gameState.player1Score || 0, gameState.player2Score || 0);
    
    // Draw state-specific overlays
    if (gameState.state === 'waiting') {
      this.drawWaitingMessage(gameState.playerCount || 0);
    } else if (gameState.state === 'gameover') {
      this.drawGameOver(gameState.winner);
    }
  }
}
