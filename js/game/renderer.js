import { CONFIG } from '../config.js';
import { ParticleSystem } from '../rendering/particles.js';

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
    
    // Particle system for visual effects
    this.particles = new ParticleSystem();
    
    // Trail positions for ball
    this.ballTrail = [];
    this.maxTrailLength = 15;
    
    // Track previous ball position for collision detection
    this.prevBallX = 0;
    this.prevBallY = 0;
    
    // Animation time for effects
    this.time = 0;
    
    // Last update time for delta
    this.lastTime = performance.now();
  }

  /**
   * Clear the canvas with a gradient background
   */
  clear() {
    // Create radial gradient for background
    const gradient = this.ctx.createRadialGradient(
      this.canvas.width / 2, this.canvas.height / 2, 0,
      this.canvas.width / 2, this.canvas.height / 2, this.canvas.width / 2
    );
    gradient.addColorStop(0, '#1a1f3a');
    gradient.addColorStop(1, CONFIG.COLOR_BACKGROUND);
    
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Add subtle grid pattern
    this.drawGrid();
  }
  
  /**
   * Draw a subtle grid pattern
   */
  drawGrid() {
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.02)';
    this.ctx.lineWidth = 1;
    
    const gridSize = 50;
    
    // Vertical lines
    for (let x = 0; x < this.canvas.width; x += gridSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, this.canvas.height);
      this.ctx.stroke();
    }
    
    // Horizontal lines
    for (let y = 0; y < this.canvas.height; y += gridSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(this.canvas.width, y);
      this.ctx.stroke();
    }
  }

  /**
   * Draw the game field (center line with glow effect)
   */
  drawField() {
    const centerX = this.canvas.width / 2;
    
    // Draw glowing center line
    this.ctx.save();
    this.ctx.strokeStyle = CONFIG.COLOR_UI;
    this.ctx.lineWidth = 3;
    this.ctx.setLineDash([15, 10]);
    
    if (CONFIG.ENABLE_GLOW) {
      this.ctx.shadowBlur = 15;
      this.ctx.shadowColor = CONFIG.COLOR_UI;
    }
    
    this.ctx.beginPath();
    this.ctx.moveTo(centerX, 0);
    this.ctx.lineTo(centerX, this.canvas.height);
    this.ctx.stroke();
    
    this.ctx.restore();
    this.ctx.setLineDash([]); // Reset dash
    
    // Draw corner accents
    this.drawCornerAccents();
  }
  
  /**
   * Draw decorative corner accents
   */
  drawCornerAccents() {
    const size = 30;
    const offset = 20;
    const corners = [
      [offset, offset], // Top-left
      [this.canvas.width - offset, offset], // Top-right
      [offset, this.canvas.height - offset], // Bottom-left
      [this.canvas.width - offset, this.canvas.height - offset] // Bottom-right
    ];
    
    this.ctx.strokeStyle = CONFIG.COLOR_ACCENT;
    this.ctx.lineWidth = 2;
    
    if (CONFIG.ENABLE_GLOW) {
      this.ctx.shadowBlur = 10;
      this.ctx.shadowColor = CONFIG.COLOR_ACCENT;
    }
    
    corners.forEach(([x, y]) => {
      // Horizontal line
      this.ctx.beginPath();
      this.ctx.moveTo(x < this.canvas.width / 2 ? x : x - size, y);
      this.ctx.lineTo(x < this.canvas.width / 2 ? x + size : x, y);
      this.ctx.stroke();
      
      // Vertical line
      this.ctx.beginPath();
      this.ctx.moveTo(x, y < this.canvas.height / 2 ? y : y - size);
      this.ctx.lineTo(x, y < this.canvas.height / 2 ? y + size : y);
      this.ctx.stroke();
    });
    
    this.ctx.shadowBlur = 0;
  }

  /**
   * Draw a paddle with gradient and glow effect
   */
  drawPaddle(paddle, isPlayer) {
    const scaleX = this.canvas.width / CONFIG.FIELD_WIDTH;
    const scaleY = this.canvas.height / CONFIG.FIELD_HEIGHT;
    
    const x = paddle.x * scaleX;
    const y = paddle.y * scaleY;
    const width = paddle.width * scaleX;
    const height = paddle.height * scaleY;
    
    const color = isPlayer ? CONFIG.COLOR_PLAYER : CONFIG.COLOR_AI;
    
    this.ctx.save();
    
    // Outer glow
    if (CONFIG.ENABLE_GLOW) {
      this.ctx.shadowBlur = CONFIG.GLOW_INTENSITY;
      this.ctx.shadowColor = color;
    }
    
    // Create vertical gradient
    const gradient = this.ctx.createLinearGradient(x, y, x, y + height);
    gradient.addColorStop(0, this.adjustColorBrightness(color, 1.3));
    gradient.addColorStop(0.5, color);
    gradient.addColorStop(1, this.adjustColorBrightness(color, 0.7));
    
    this.ctx.fillStyle = gradient;
    
    // Draw rounded rectangle
    this.roundRect(x, y, width, height, 3);
    this.ctx.fill();
    
    // Inner highlight
    const highlightGradient = this.ctx.createLinearGradient(x, y, x + width / 3, y);
    highlightGradient.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
    highlightGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    
    this.ctx.fillStyle = highlightGradient;
    this.roundRect(x, y, width / 3, height, 3);
    this.ctx.fill();
    
    this.ctx.restore();
  }
  
  /**
   * Helper to draw rounded rectangle
   */
  roundRect(x, y, width, height, radius) {
    this.ctx.beginPath();
    this.ctx.moveTo(x + radius, y);
    this.ctx.lineTo(x + width - radius, y);
    this.ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    this.ctx.lineTo(x + width, y + height - radius);
    this.ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    this.ctx.lineTo(x + radius, y + height);
    this.ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    this.ctx.lineTo(x, y + radius);
    this.ctx.quadraticCurveTo(x, y, x + radius, y);
    this.ctx.closePath();
  }
  
  /**
   * Adjust color brightness
   */
  adjustColorBrightness(color, factor) {
    // Simple brightness adjustment for hex colors
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    
    const newR = Math.min(255, Math.floor(r * factor));
    const newG = Math.min(255, Math.floor(g * factor));
    const newB = Math.min(255, Math.floor(b * factor));
    
    return `rgb(${newR}, ${newG}, ${newB})`;
  }

  /**
   * Draw the ball with trail and glow effects
   */
  drawBall(ball) {
    const scaleX = this.canvas.width / CONFIG.FIELD_WIDTH;
    const scaleY = this.canvas.height / CONFIG.FIELD_HEIGHT;
    
    const x = ball.x * scaleX;
    const y = ball.y * scaleY;
    const radius = ball.radius * Math.min(scaleX, scaleY);
    
    // Update ball trail
    if (CONFIG.ENABLE_BALL_TRAIL) {
      this.ballTrail.push({ x, y, alpha: 1 });
      if (this.ballTrail.length > this.maxTrailLength) {
        this.ballTrail.shift();
      }
      
      // Draw trail
      this.drawBallTrail();
    }
    
    // Check for significant position change (collision) for particle effects
    const dx = x - this.prevBallX;
    const dy = y - this.prevBallY;
    const speed = Math.sqrt(dx * dx + dy * dy);
    
    if (CONFIG.ENABLE_PARTICLES && speed > 10) {
      this.particles.createTrail(x, y, CONFIG.COLOR_BALL, 2);
    }
    
    this.prevBallX = x;
    this.prevBallY = y;
    
    this.ctx.save();
    
    // Outer glow (multiple layers for intensity)
    if (CONFIG.ENABLE_GLOW) {
      const glowGradient = this.ctx.createRadialGradient(x, y, 0, x, y, radius * 3);
      glowGradient.addColorStop(0, CONFIG.COLOR_BALL + '60');
      glowGradient.addColorStop(0.5, CONFIG.COLOR_BALL + '20');
      glowGradient.addColorStop(1, 'transparent');
      
      this.ctx.fillStyle = glowGradient;
      this.ctx.beginPath();
      this.ctx.arc(x, y, radius * 3, 0, Math.PI * 2);
      this.ctx.fill();
    }
    
    // Main ball with radial gradient
    const gradient = this.ctx.createRadialGradient(
      x - radius / 3, y - radius / 3, 0,
      x, y, radius
    );
    gradient.addColorStop(0, '#ffffff');
    gradient.addColorStop(0.3, CONFIG.COLOR_BALL);
    gradient.addColorStop(1, this.adjustColorBrightness(CONFIG.COLOR_BALL, 0.6));
    
    this.ctx.fillStyle = gradient;
    this.ctx.shadowBlur = CONFIG.GLOW_INTENSITY * 1.5;
    this.ctx.shadowColor = CONFIG.COLOR_BALL;
    
    this.ctx.beginPath();
    this.ctx.arc(x, y, radius, 0, Math.PI * 2);
    this.ctx.fill();
    
    // Shine effect
    const shineGradient = this.ctx.createRadialGradient(
      x - radius / 2, y - radius / 2, 0,
      x - radius / 2, y - radius / 2, radius / 2
    );
    shineGradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
    shineGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    
    this.ctx.fillStyle = shineGradient;
    this.ctx.beginPath();
    this.ctx.arc(x - radius / 3, y - radius / 3, radius / 2, 0, Math.PI * 2);
    this.ctx.fill();
    
    this.ctx.restore();
  }
  
  /**
   * Draw ball trail effect
   */
  drawBallTrail() {
    this.ctx.save();
    
    this.ballTrail.forEach((pos, index) => {
      const alpha = (index / this.ballTrail.length) * 0.5;
      const size = (index / this.ballTrail.length) * 6;
      
      const gradient = this.ctx.createRadialGradient(
        pos.x, pos.y, 0,
        pos.x, pos.y, size
      );
      gradient.addColorStop(0, CONFIG.COLOR_BALL + Math.floor(alpha * 255).toString(16).padStart(2, '0'));
      gradient.addColorStop(1, 'transparent');
      
      this.ctx.fillStyle = gradient;
      this.ctx.beginPath();
      this.ctx.arc(pos.x, pos.y, size, 0, Math.PI * 2);
      this.ctx.fill();
    });
    
    this.ctx.restore();
  }

  /**
   * Draw the score with glow effect
   */
  drawScore(playerScore, aiScore) {
    this.ctx.save();
    this.ctx.font = 'bold 64px monospace';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'top';
    
    const centerX = this.canvas.width / 2;
    const y = 30;
    const spacing = 60;
    
    // Player 1 score
    this.ctx.fillStyle = CONFIG.COLOR_PLAYER;
    if (CONFIG.ENABLE_GLOW) {
      this.ctx.shadowBlur = 20;
      this.ctx.shadowColor = CONFIG.COLOR_PLAYER;
    }
    this.ctx.fillText(playerScore, centerX - spacing, y);
    
    // Separator
    this.ctx.fillStyle = CONFIG.COLOR_UI;
    this.ctx.shadowBlur = 10;
    this.ctx.shadowColor = CONFIG.COLOR_UI;
    this.ctx.fillText('-', centerX, y);
    
    // Player 2 score
    this.ctx.fillStyle = CONFIG.COLOR_AI;
    this.ctx.shadowBlur = 20;
    this.ctx.shadowColor = CONFIG.COLOR_AI;
    this.ctx.fillText(aiScore, centerX + spacing, y);
    
    this.ctx.restore();
  }

  /**
   * Draw waiting message with animations
   */
  drawWaitingMessage(playerCount) {
    this.ctx.save();
    
    const centerX = this.canvas.width / 2;
    const centerY = this.canvas.height / 2;
    
    // Animated pulse effect
    const pulse = Math.sin(this.time * 3) * 0.2 + 1;
    
    if (playerCount < 2) {
      // Title
      this.ctx.font = 'bold 48px monospace';
      this.ctx.fillStyle = CONFIG.COLOR_UI;
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      
      if (CONFIG.ENABLE_GLOW) {
        this.ctx.shadowBlur = 20 * pulse;
        this.ctx.shadowColor = CONFIG.COLOR_UI;
      }
      
      this.ctx.fillText(`Esperando jugadores...`, centerX, centerY - 40);
      
      // Player count
      this.ctx.font = 'bold 36px monospace';
      this.ctx.fillStyle = CONFIG.COLOR_ACCENT;
      this.ctx.shadowBlur = 15;
      this.ctx.shadowColor = CONFIG.COLOR_ACCENT;
      this.ctx.fillText(`${playerCount}/2`, centerX, centerY + 20);
      
      // Animated dots
      const dots = '.'.repeat(Math.floor(this.time * 2) % 4);
      this.ctx.font = '32px monospace';
      this.ctx.fillStyle = CONFIG.COLOR_FOREGROUND;
      this.ctx.shadowBlur = 0;
      this.ctx.fillText(dots, centerX, centerY + 70);
    } else {
      // Ready to start
      this.ctx.font = 'bold 56px monospace';
      this.ctx.fillStyle = CONFIG.COLOR_PLAYER;
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      
      const scale = pulse;
      this.ctx.save();
      this.ctx.translate(centerX, centerY - 40);
      this.ctx.scale(scale, scale);
      
      if (CONFIG.ENABLE_GLOW) {
        this.ctx.shadowBlur = 30;
        this.ctx.shadowColor = CONFIG.COLOR_PLAYER;
      }
      
      this.ctx.fillText('¡LISTO!', 0, 0);
      this.ctx.restore();
      
      // Instructions
      this.ctx.font = '28px monospace';
      this.ctx.fillStyle = CONFIG.COLOR_UI;
      this.ctx.shadowBlur = 15;
      this.ctx.shadowColor = CONFIG.COLOR_UI;
      this.ctx.fillText('Presiona ESPACIO para comenzar', centerX, centerY + 40);
      
      // Controls
      this.ctx.font = '20px monospace';
      this.ctx.shadowBlur = 0;
      
      this.ctx.fillStyle = CONFIG.COLOR_PLAYER;
      this.ctx.fillText('Jugador 1: W/S', centerX - 180, centerY + 100);
      
      this.ctx.fillStyle = CONFIG.COLOR_AI;
      this.ctx.fillText('Jugador 2: ↑/↓', centerX + 180, centerY + 100);
    }
    
    this.ctx.restore();
  }

  /**
   * Draw game over message with celebration effects
   */
  drawGameOver(winner) {
    this.ctx.save();
    
    // Animated overlay
    const overlayAlpha = 0.85;
    this.ctx.fillStyle = `rgba(10, 14, 39, ${overlayAlpha})`;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    const centerX = this.canvas.width / 2;
    const centerY = this.canvas.height / 2;
    
    // Winner text
    const text = winner === 'player1' ? '¡JUGADOR 1 GANA!' : '¡JUGADOR 2 GANA!';
    const color = winner === 'player1' ? CONFIG.COLOR_PLAYER : CONFIG.COLOR_AI;
    
    // Animated scale
    const pulse = Math.sin(this.time * 4) * 0.1 + 1;
    
    this.ctx.save();
    this.ctx.translate(centerX, centerY - 60);
    this.ctx.scale(pulse, pulse);
    
    this.ctx.font = 'bold 72px monospace';
    this.ctx.fillStyle = color;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    
    if (CONFIG.ENABLE_GLOW) {
      this.ctx.shadowBlur = 40;
      this.ctx.shadowColor = color;
    }
    
    this.ctx.fillText(text, 0, 0);
    this.ctx.restore();
    
    // Trophy/crown emoji effect
    this.ctx.font = '64px monospace';
    const trophy = '👑';
    this.ctx.fillText(trophy, centerX, centerY - 150);
    
    // Restart message with pulse
    const messagePulse = Math.sin(this.time * 5) * 0.5 + 0.5;
    this.ctx.globalAlpha = 0.5 + messagePulse * 0.5;
    
    this.ctx.font = 'bold 32px monospace';
    this.ctx.fillStyle = CONFIG.COLOR_UI;
    this.ctx.shadowBlur = 20;
    this.ctx.shadowColor = CONFIG.COLOR_UI;
    this.ctx.fillText('Presiona ESPACIO para jugar de nuevo', centerX, centerY + 80);
    
    this.ctx.restore();
  }

  /**
   * Draw connection status with indicator
   */
  drawConnectionStatus(status, isConnected) {
    this.ctx.save();
    
    const x = 20;
    const y = this.canvas.height - 30;
    
    // Status dot
    const dotRadius = 6;
    const dotX = x;
    const dotY = y;
    
    this.ctx.fillStyle = isConnected ? '#00ff88' : '#ff006e';
    
    if (CONFIG.ENABLE_GLOW) {
      this.ctx.shadowBlur = 10;
      this.ctx.shadowColor = isConnected ? '#00ff88' : '#ff006e';
    }
    
    this.ctx.beginPath();
    this.ctx.arc(dotX, dotY, dotRadius, 0, Math.PI * 2);
    this.ctx.fill();
    
    // Status text
    this.ctx.shadowBlur = 0;
    this.ctx.fillStyle = CONFIG.COLOR_FOREGROUND;
    this.ctx.font = '16px monospace';
    this.ctx.textAlign = 'left';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(status, dotX + 15, dotY);
    
    this.ctx.restore();
  }

  /**
   * Render the entire game state
   */
  render(gameState, connectionStatus) {
    // Update time for animations
    const currentTime = performance.now();
    const deltaTime = (currentTime - this.lastTime) / 1000;
    this.lastTime = currentTime;
    this.time += deltaTime;
    
    // Update particles
    if (CONFIG.ENABLE_PARTICLES) {
      this.particles.update(deltaTime);
    }
    
    this.clear();
    
    const isConnected = connectionStatus === 'Connected';
    
    if (!gameState) {
      // No game state yet
      this.drawConnectionStatus(connectionStatus, isConnected);
      
      const pulse = Math.sin(this.time * 3) * 0.2 + 1;
      
      this.ctx.save();
      this.ctx.fillStyle = CONFIG.COLOR_UI;
      this.ctx.font = '32px monospace';
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      
      if (CONFIG.ENABLE_GLOW) {
        this.ctx.shadowBlur = 20 * pulse;
        this.ctx.shadowColor = CONFIG.COLOR_UI;
      }
      
      const dots = '.'.repeat(Math.floor(this.time * 2) % 4);
      this.ctx.fillText(`Conectando al servidor${dots}`, this.canvas.width / 2, this.canvas.height / 2);
      this.ctx.restore();
      return;
    }

    this.drawField();
    
    // Draw particles behind game elements
    if (CONFIG.ENABLE_PARTICLES) {
      this.particles.draw(this.ctx);
    }
    
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
    
    // Draw connection status
    this.drawConnectionStatus(connectionStatus, isConnected);
  }
  
  /**
   * Trigger explosion effect at position
   */
  triggerExplosion(x, y, color) {
    if (CONFIG.ENABLE_PARTICLES) {
      this.particles.createExplosion(x, y, color, 30);
    }
  }
}
