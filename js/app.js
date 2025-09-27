/**
 * Chess Game - Main Application
 * 
 * This file initializes the Chess game and connects the game logic with the UI.
 * It also handles game state persistence using localStorage.
 */

// Game state management
const GameStateManager = {
    // Save the current game state to localStorage
    saveGameState: (gameState) => {
        try {
            localStorage.setItem('chessGameState', JSON.stringify(gameState));
            console.log('Game state saved successfully');
        } catch (error) {
            console.error('Failed to save game state:', error);
        }
    },
    
    // Load the saved game state from localStorage
    loadGameState: () => {
        try {
            const savedState = localStorage.getItem('chessGameState');
            if (savedState) {
                return JSON.parse(savedState);
            }
        } catch (error) {
            console.error('Failed to load game state:', error);
        }
        return null;
    },
    
    // Clear the saved game state
    clearGameState: () => {
        try {
            localStorage.removeItem('chessGameState');
            console.log('Game state cleared');
        } catch (error) {
            console.error('Failed to clear game state:', error);
        }
    }
};

// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize the chess game
    const chessGame = new Chess();
    
    // Initialize the UI
    const ui = new ChessUI(chessGame);
    
    // Try to load saved game state
    const savedState = GameStateManager.loadGameState();
    if (savedState) {
        try {
            // Apply saved game state
            console.log('Restoring saved game state');
            chessGame.loadFromState(savedState);
            ui.renderBoard();
        } catch (error) {
            console.error('Failed to restore game state:', error);
            GameStateManager.clearGameState();
        }
    }
    
    // Setup auto-save functionality
    // Save game state after every move
    const originalMakeMove = chessGame.makeMove;
    chessGame.makeMove = function(...args) {
        const result = originalMakeMove.apply(this, args);
        if (result && result.success) {
            GameStateManager.saveGameState(chessGame.getGameState());
        }
        return result;
    };
    
    // Save game state after undoing a move
    const originalUndoMove = chessGame.undoMove;
    chessGame.undoMove = function() {
        const result = originalUndoMove.apply(this);
        if (result) {
            GameStateManager.saveGameState(chessGame.getGameState());
        }
        return result;
    };
    
    // Clear saved state when starting a new game
    const originalResetBoard = chessGame.resetBoard;
    chessGame.resetBoard = function() {
        originalResetBoard.apply(this);
        GameStateManager.clearGameState();
    };
    
    // Manual save event
    document.addEventListener('chessgame:save', () => {
        GameStateManager.saveGameState(chessGame.getGameState());
    });
    
    console.log('Chess game initialized and ready to play!');
});