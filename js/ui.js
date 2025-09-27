/**
 * Chess Game - UI Components
 * 
 * This file contains the UI handling for the chess game:
 * - Board rendering
 * - Piece dragging and dropping
 * - Visual feedback (move highlighting, check indication)
 * - User interface controls
 */

class ChessUI {
    constructor(gameInstance) {
        this.game = gameInstance;
        this.board = document.getElementById('chessboard');
        this.boardSquares = [];
        this.selectedPiece = null;
        this.validMoves = [];
        this.playerColors = {white: 'White', black: 'Black'};
        
        // DOM Elements
        this.currentTurnElement = document.querySelector('.current-turn');
        this.gameMessageElement = document.querySelector('.game-message');
        this.newGameButton = document.getElementById('new-game-btn');
        this.undoButton = document.getElementById('undo-btn');
        this.saveButton = document.getElementById('save-btn');
        this.resetButton = document.getElementById('reset-btn');
        this.whiteCapturedElement = document.querySelector('.white-captured');
        this.blackCapturedElement = document.querySelector('.black-captured');
        this.promotionModal = document.getElementById('promotion-modal');
        this.promotionPieces = document.querySelectorAll('.promotion-piece');
        
        // Pending promotion info
        this.pendingPromotion = null;
        
        // Initialize the board
        this.initializeBoard();
        this.renderBoard();
        this.setupEventListeners();
        this.setupCoordinates();
    }
    
    // Initialize the chessboard grid
    initializeBoard() {
        this.board.innerHTML = '';
        this.boardSquares = [];
        
        for (let row = 0; row < 8; row++) {
            this.boardSquares[row] = [];
            for (let col = 0; col < 8; col++) {
                const square = document.createElement('div');
                square.className = `square ${(row + col) % 2 === 0 ? 'white' : 'black'}`;
                square.dataset.row = row;
                square.dataset.col = col;
                
                this.boardSquares[row][col] = square;
                this.board.appendChild(square);
            }
        }
    }
    
    // Set up board coordinates (a-h, 1-8)
    setupCoordinates() {
        const rankCoords = document.querySelector('.rank-coordinates');
        const fileCoords = document.querySelector('.file-coordinates');
        
        rankCoords.innerHTML = '';
        fileCoords.innerHTML = '';
        
        // Add rank numbers (8-1)
        for (let i = 0; i < 8; i++) {
            const rankLabel = document.createElement('div');
            rankLabel.textContent = 8 - i;
            rankCoords.appendChild(rankLabel);
        }
        
        // Add file letters (a-h)
        for (let i = 0; i < 8; i++) {
            const fileLabel = document.createElement('div');
            fileLabel.textContent = String.fromCharCode(97 + i); // 'a' is 97 in ASCII
            fileCoords.appendChild(fileLabel);
        }
    }
    
    // Render the current state of the board
    renderBoard() {
        const gameState = this.game.getGameState();
        
        // Update the board with pieces
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const square = this.boardSquares[row][col];
                const piece = gameState.board[row][col];
                
                // Clear previous content
                square.innerHTML = '';
                square.classList.remove('selected', 'valid-move', 'check', 'last-move');
                
                // Add piece if one exists at this position
                if (piece) {
                    const pieceElement = document.createElement('div');
                    pieceElement.className = `piece ${piece.color} ${piece.type}`;
                    square.appendChild(pieceElement);
                }
                
                // Highlight the king if in check
                if (gameState.checkState.inCheck && 
                    gameState.checkState.king && 
                    row === gameState.checkState.king.row && 
                    col === gameState.checkState.king.col) {
                    square.classList.add('check');
                }
                
                // Highlight the last move
                if (gameState.lastMove) {
                    if (row === gameState.lastMove.from.row && col === gameState.lastMove.from.col) {
                        square.classList.add('last-move');
                    }
                    if (row === gameState.lastMove.to.row && col === gameState.lastMove.to.col) {
                        square.classList.add('last-move');
                    }
                }
            }
        }
        
        // Update turn indicator
        this.currentTurnElement.textContent = `${this.playerColors[gameState.currentPlayer]}'s Turn`;
        
        // Update captured pieces
        this.renderCapturedPieces();
        
        // Update game message if game is over
        if (gameState.gameOver) {
            if (gameState.result === 'checkmate') {
                this.gameMessageElement.textContent = `Checkmate! ${this.playerColors[gameState.winner]} wins!`;
            } else if (gameState.result === 'stalemate') {
                this.gameMessageElement.textContent = 'Stalemate! The game is a draw.';
            }
        } else {
            // Clear game message if game is not over
            this.gameMessageElement.textContent = gameState.checkState.inCheck ? 'Check!' : '';
        }
    }
    
    // Render captured pieces
    renderCapturedPieces() {
        const gameState = this.game.getGameState();
        
        // Clear previous captured pieces
        this.whiteCapturedElement.innerHTML = '';
        this.blackCapturedElement.innerHTML = '';
        
        // Display captured white pieces
        gameState.capturedPieces.white.forEach(pieceType => {
            const pieceElement = document.createElement('div');
            pieceElement.className = `piece white ${pieceType} captured`;
            this.whiteCapturedElement.appendChild(pieceElement);
        });
        
        // Display captured black pieces
        gameState.capturedPieces.black.forEach(pieceType => {
            const pieceElement = document.createElement('div');
            pieceElement.className = `piece black ${pieceType} captured`;
            this.blackCapturedElement.appendChild(pieceElement);
        });
    }
    
    // Set up event listeners for user interactions
    setupEventListeners() {
        // Board click events for piece selection and movement
        this.board.addEventListener('click', (e) => {
            this.handleBoardClick(e);
        });
        
        // Drag and drop functionality
        this.board.addEventListener('mousedown', (e) => {
            this.handleDragStart(e);
        });
        
        document.addEventListener('mousemove', (e) => {
            this.handleDragMove(e);
        });
        
        document.addEventListener('mouseup', (e) => {
            this.handleDragEnd(e);
        });
        
        // Touch events for mobile
        this.board.addEventListener('touchstart', (e) => {
            const touch = e.touches[0];
            this.handleDragStart({ target: touch.target, clientX: touch.clientX, clientY: touch.clientY });
        });
        
        document.addEventListener('touchmove', (e) => {
            const touch = e.touches[0];
            this.handleDragMove({ clientX: touch.clientX, clientY: touch.clientY });
            e.preventDefault();
        });
        
        document.addEventListener('touchend', (e) => {
            this.handleDragEnd(e);
        });
        
        // Button event listeners
        this.newGameButton.addEventListener('click', () => {
            this.resetGame();
        });
        
        this.undoButton.addEventListener('click', () => {
            this.undoLastMove();
        });
        
        this.saveButton.addEventListener('click', () => {
            // Trigger manual save - this will display a notification to the user
            const event = new CustomEvent('chessgame:save');
            document.dispatchEvent(event);
            
            // Show feedback to the user
            this.displayTemporaryMessage('Game saved successfully!');
        });
        
        this.resetButton.addEventListener('click', () => {
            if (confirm('Are you sure you want to reset the game? All progress will be lost.')) {
                // Clear localStorage and reset the game
                localStorage.removeItem('chessGameState');
                this.resetGame();
                
                // Show feedback to the user
                this.displayTemporaryMessage('Game reset successfully!');
            }
        });
        
        // Promotion piece selection
        this.promotionPieces.forEach(piece => {
            piece.addEventListener('click', (e) => {
                const pieceType = e.target.dataset.piece;
                if (this.pendingPromotion && pieceType) {
                    this.completePromotion(pieceType);
                }
            });
        });
    }
    
    // Handle clicks on the chessboard
    handleBoardClick(e) {
        const square = e.target.closest('.square');
        if (!square) return;
        
        const row = parseInt(square.dataset.row);
        const col = parseInt(square.dataset.col);
        
        // If we already have a selected piece, try to move it
        if (this.selectedPiece) {
            const fromRow = this.selectedPiece.row;
            const fromCol = this.selectedPiece.col;
            
            // Check if clicked square is a valid move
            const isValidMove = this.validMoves.some(move => 
                move.row === row && move.col === col);
            
            if (isValidMove) {
                this.tryMovePiece(fromRow, fromCol, row, col);
            } else {
                // Deselect the current piece if clicking on a non-valid move square
                this.deselectPiece();
                
                // If clicked on a new piece of the current player, select it
                const clickedPiece = this.game.getPiece(row, col);
                if (clickedPiece && clickedPiece.color === this.game.currentPlayer) {
                    this.selectPiece(row, col);
                }
            }
        } else {
            // If no piece is selected, try to select one
            const piece = this.game.getPiece(row, col);
            if (piece && piece.color === this.game.currentPlayer) {
                this.selectPiece(row, col);
            }
        }
    }
    
    // Select a piece and show its valid moves
    selectPiece(row, col) {
        this.selectedPiece = { row, col };
        this.validMoves = this.game.getValidMovesForPiece(row, col);
        
        // Highlight the selected piece and valid moves
        this.boardSquares[row][col].classList.add('selected');
        
        this.validMoves.forEach(move => {
            this.boardSquares[move.row][move.col].classList.add('valid-move');
        });
    }
    
    // Deselect the currently selected piece
    deselectPiece() {
        if (!this.selectedPiece) return;
        
        // Remove highlighting
        this.boardSquares[this.selectedPiece.row][this.selectedPiece.col].classList.remove('selected');
        
        this.validMoves.forEach(move => {
            this.boardSquares[move.row][move.col].classList.remove('valid-move');
        });
        
        this.selectedPiece = null;
        this.validMoves = [];
    }
    
    // Try to move a piece
    tryMovePiece(fromRow, fromCol, toRow, toCol) {
        const piece = this.game.getPiece(fromRow, fromCol);
        
        // Check if this is a pawn promotion move
        if (piece && piece.type === 'pawn' && 
            ((piece.color === 'white' && toRow === 0) || 
             (piece.color === 'black' && toRow === 7))) {
            
            // Store pending promotion and show the promotion modal
            this.pendingPromotion = { fromRow, fromCol, toRow, toCol };
            this.showPromotionModal(piece.color);
            return;
        }
        
        // Normal move
        const result = this.game.makeMove(fromRow, fromCol, toRow, toCol);
        
        if (result && result.success) {
            // Play move sound
            this.playMoveSound(result.moveData.captured ? 'capture' : 'move');
            
            // Check if the game ended
            if (result.result && result.result.gameOver) {
                this.handleGameOver(result.result);
            }
        }
        
        this.deselectPiece();
        this.renderBoard();
    }
    
    // Show the promotion selection modal
    showPromotionModal(pieceColor) {
        // Set the piece colors for the promotion options
        this.promotionPieces.forEach(pieceElement => {
            const pieceType = pieceElement.dataset.piece;
            pieceElement.className = `promotion-piece ${pieceColor} ${pieceType}`;
        });
        
        // Display the modal
        this.promotionModal.style.display = 'flex';
    }
    
    // Hide the promotion modal
    hidePromotionModal() {
        this.promotionModal.style.display = 'none';
    }
    
    // Complete a pawn promotion with the selected piece type
    completePromotion(pieceType) {
        if (!this.pendingPromotion) return;
        
        const { fromRow, fromCol, toRow, toCol } = this.pendingPromotion;
        
        // Make the move with the promotion piece
        const result = this.game.makeMove(fromRow, fromCol, toRow, toCol, pieceType);
        
        if (result && result.success) {
            // Play promotion sound
            this.playMoveSound('promotion');
            
            // Check if the game ended
            if (result.result && result.result.gameOver) {
                this.handleGameOver(result.result);
            }
        }
        
        // Reset promotion state
        this.pendingPromotion = null;
        this.hidePromotionModal();
        this.deselectPiece();
        this.renderBoard();
    }
    
    // Handle the start of drag operations
    handleDragStart(e) {
        const pieceElement = e.target.closest('.piece');
        if (!pieceElement) return;
        
        const square = pieceElement.closest('.square');
        const row = parseInt(square.dataset.row);
        const col = parseInt(square.dataset.col);
        
        const piece = this.game.getPiece(row, col);
        if (!piece || piece.color !== this.game.currentPlayer) return;
        
        // Select the piece
        this.deselectPiece();
        this.selectPiece(row, col);
        
        // Create a draggable clone
        this.dragElement = pieceElement.cloneNode(true);
        this.dragElement.classList.add('dragging');
        document.body.appendChild(this.dragElement);
        
        // Set position and prevent original piece from showing
        this.dragElement.style.position = 'absolute';
        pieceElement.style.opacity = '0.3';
        
        // Store the original piece element for later
        this.originalPiece = pieceElement;
        
        // Initial position
        this.updateDragPosition(e.clientX, e.clientY);
    }
    
    // Handle drag movement
    handleDragMove(e) {
        if (!this.dragElement) return;
        this.updateDragPosition(e.clientX, e.clientY);
    }
    
    // Update the position of the dragged piece
    updateDragPosition(x, y) {
        if (!this.dragElement) return;
        
        // Center the piece on the cursor
        const rect = this.dragElement.getBoundingClientRect();
        const offsetX = rect.width / 2;
        const offsetY = rect.height / 2;
        
        this.dragElement.style.left = `${x - offsetX}px`;
        this.dragElement.style.top = `${y - offsetY}px`;
    }
    
    // Handle the end of drag operations
    handleDragEnd(e) {
        if (!this.dragElement) return;
        
        // Get the position where the piece was dropped
        const { clientX, clientY } = e.changedTouches ? e.changedTouches[0] : e;
        const targetElement = document.elementFromPoint(clientX, clientY);
        
        // Find the target square
        const targetSquare = targetElement ? targetElement.closest('.square') : null;
        
        if (targetSquare && this.selectedPiece) {
            const toRow = parseInt(targetSquare.dataset.row);
            const toCol = parseInt(targetSquare.dataset.col);
            
            const isValidMove = this.validMoves.some(move => 
                move.row === toRow && move.col === toCol);
            
            if (isValidMove) {
                this.tryMovePiece(
                    this.selectedPiece.row, 
                    this.selectedPiece.col, 
                    toRow, 
                    toCol
                );
            }
        }
        
        // Clean up drag elements
        if (this.originalPiece) {
            this.originalPiece.style.opacity = '1';
            this.originalPiece = null;
        }
        
        if (this.dragElement && this.dragElement.parentNode) {
            this.dragElement.parentNode.removeChild(this.dragElement);
        }
        
        this.dragElement = null;
    }
    
    // Handle game over conditions
    handleGameOver(result) {
        if (result.result === 'checkmate') {
            setTimeout(() => {
                alert(`Checkmate! ${this.playerColors[result.winner]} wins!`);
            }, 100);
        } else if (result.result === 'stalemate') {
            setTimeout(() => {
                alert('Stalemate! The game is a draw.');
            }, 100);
        }
    }
    
    // Reset the game
    resetGame() {
        this.game.resetBoard();
        this.deselectPiece();
        this.renderBoard();
    }
    
    // Undo the last move
    undoLastMove() {
        if (this.game.undoMove()) {
            this.deselectPiece();
            this.renderBoard();
        }
    }
    
    // Play sound effects for moves
    playMoveSound(type) {
        // Sound effects could be added here
        // For example, different sounds for regular moves, captures, checks, etc.
        console.log(`Playing ${type} sound`);
    }
    
    // Display a temporary message to the user
    displayTemporaryMessage(message, duration = 2000) {
        const originalMessage = this.gameMessageElement.textContent;
        
        // Show the temporary message
        this.gameMessageElement.textContent = message;
        
        // After the duration, restore the original message
        setTimeout(() => {
            this.gameMessageElement.textContent = originalMessage;
        }, duration);
    }
}