import { initGame } from './game/game.js';

// Initialize the game when DOM is ready
window.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('gameCanvas');
  
  if (!canvas) {
    console.error('Canvas element not found');
    return;
  }

  initGame(canvas);
});
