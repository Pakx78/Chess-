/**
 * Chess Game - Core Logic
 * 
 * This file contains the core chess game logic:
 * - Board representation
 * - Piece movement rules
 * - Game state tracking
 * - Check and checkmate detection
 */

class Chess {
    constructor() {
        // Initialize the board
        this.board = this.createEmptyBoard();
        this.resetBoard();
        
        // Game state
        this.currentPlayer = 'white';
        this.gameOver = false;
        this.checkState = { inCheck: false, king: null };
        this.moveHistory = [];
        this.capturedPieces = { white: [], black: [] };
        
        // Special move flags
        this.castlingRights = {
            white: { kingSide: true, queenSide: true },
            black: { kingSide: true, queenSide: true }
        };
        this.enPassantTarget = null;
    }
    
    // Create an 8x8 empty board
    createEmptyBoard() {
        const board = [];
        for (let i = 0; i < 8; i++) {
            board[i] = Array(8).fill(null);
        }
        return board;
    }
    
    // Set up pieces in their initial positions
    resetBoard() {
        // Place pawns
        for (let i = 0; i < 8; i++) {
            this.board[1][i] = { type: 'pawn', color: 'black', hasMoved: false };
            this.board[6][i] = { type: 'pawn', color: 'white', hasMoved: false };
        }
        
        // Place rooks
        this.board[0][0] = { type: 'rook', color: 'black', hasMoved: false };
        this.board[0][7] = { type: 'rook', color: 'black', hasMoved: false };
        this.board[7][0] = { type: 'rook', color: 'white', hasMoved: false };
        this.board[7][7] = { type: 'rook', color: 'white', hasMoved: false };
        
        // Place knights
        this.board[0][1] = { type: 'knight', color: 'black' };
        this.board[0][6] = { type: 'knight', color: 'black' };
        this.board[7][1] = { type: 'knight', color: 'white' };
        this.board[7][6] = { type: 'knight', color: 'white' };
        
        // Place bishops
        this.board[0][2] = { type: 'bishop', color: 'black' };
        this.board[0][5] = { type: 'bishop', color: 'black' };
        this.board[7][2] = { type: 'bishop', color: 'white' };
        this.board[7][5] = { type: 'bishop', color: 'white' };
        
        // Place queens
        this.board[0][3] = { type: 'queen', color: 'black' };
        this.board[7][3] = { type: 'queen', color: 'white' };
        
        // Place kings
        this.board[0][4] = { type: 'king', color: 'black', hasMoved: false };
        this.board[7][4] = { type: 'king', color: 'white', hasMoved: false };
        
        // Reset game state
        this.currentPlayer = 'white';
        this.gameOver = false;
        this.checkState = { inCheck: false, king: null };
        this.moveHistory = [];
        this.capturedPieces = { white: [], black: [] };
        this.castlingRights = {
            white: { kingSide: true, queenSide: true },
            black: { kingSide: true, queenSide: true }
        };
        this.enPassantTarget = null;
    }
    
    // Get a piece at a specific position
    getPiece(row, col) {
        if (this.isValidPosition(row, col)) {
            return this.board[row][col];
        }
        return null;
    }
    
    // Check if a position is within the board boundaries
    isValidPosition(row, col) {
        return row >= 0 && row < 8 && col >= 0 && col < 8;
    }
    
    // Switch the current player
    switchTurn() {
        this.currentPlayer = this.currentPlayer === 'white' ? 'black' : 'white';
        
        // Check if the new current player is in check
        this.updateCheckState();
        
        // Update en passant targets (only valid for one move)
        this.enPassantTarget = null;
        
        // Check for game end conditions
        return this.checkGameEndConditions();
    }
    
    // Find the position of the king for a given color
    findKing(color) {
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = this.board[row][col];
                if (piece && piece.type === 'king' && piece.color === color) {
                    return { row, col };
                }
            }
        }
        return null; // Should never happen in a valid chess game
    }
    
    // Check if a king is in check
    isKingInCheck(kingColor, kingPosition = null) {
        if (!kingPosition) {
            kingPosition = this.findKing(kingColor);
        }
        
        const opponentColor = kingColor === 'white' ? 'black' : 'white';
        
        // Check if any opponent piece can attack the king's position
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = this.board[row][col];
                if (piece && piece.color === opponentColor) {
                    const moves = this.getValidMovesForPiece(row, col, true);
                    for (const move of moves) {
                        if (move.row === kingPosition.row && move.col === kingPosition.col) {
                            return true;
                        }
                    }
                }
            }
        }
        
        return false;
    }
    
    // Update the check state for the current player
    updateCheckState() {
        const kingColor = this.currentPlayer;
        const kingPosition = this.findKing(kingColor);
        
        const inCheck = this.isKingInCheck(kingColor, kingPosition);
        this.checkState = {
            inCheck: inCheck,
            king: kingPosition
        };
        
        return inCheck;
    }
    
    // Make a move on the board
    makeMove(fromRow, fromCol, toRow, toCol, promotionPiece = null) {
        const piece = this.board[fromRow][fromCol];
        
        if (!piece || piece.color !== this.currentPlayer) {
            return false;
        }
        
        // Get valid moves and check if the destination is valid
        const validMoves = this.getValidMovesForPiece(fromRow, fromCol);
        const isValidMove = validMoves.some(move => move.row === toRow && move.col === toCol);
        
        if (!isValidMove) {
            return false;
        }
        
        // Save the current board and state for potential undo
        const moveData = {
            piece: {...piece},
            from: { row: fromRow, col: fromCol },
            to: { row: toRow, col: toCol },
            captured: this.board[toRow][toCol] ? {...this.board[toRow][toCol]} : null,
            enPassantTarget: this.enPassantTarget,
            castlingRights: JSON.parse(JSON.stringify(this.castlingRights)),
            isFirstMove: piece.hasMoved === false
        };
        
        // Handle special moves
        if (piece.type === 'pawn') {
            // En passant capture
            if (this.enPassantTarget && toRow === this.enPassantTarget.row && toCol === this.enPassantTarget.col) {
                const captureRow = piece.color === 'white' ? toRow + 1 : toRow - 1;
                moveData.enPassantCapture = { row: captureRow, col: toCol, piece: {...this.board[captureRow][toCol]} };
                this.capturedPieces[this.board[captureRow][toCol].color].push(this.board[captureRow][toCol].type);
                this.board[captureRow][toCol] = null;
            }
            
            // Pawn promotion
            if ((piece.color === 'white' && toRow === 0) || (piece.color === 'black' && toRow === 7)) {
                moveData.promotion = true;
                if (promotionPiece && ['queen', 'rook', 'bishop', 'knight'].includes(promotionPiece)) {
                    piece.type = promotionPiece;
                } else {
                    piece.type = 'queen'; // Default promotion to queen
                }
            }
            
            // Set en passant target if the pawn moved two squares
            if (Math.abs(fromRow - toRow) === 2) {
                const enPassantRow = piece.color === 'white' ? fromRow - 1 : fromRow + 1;
                this.enPassantTarget = { row: enPassantRow, col: fromCol };
            }
        }
        
        // Handle castling for kings
        if (piece.type === 'king' && Math.abs(fromCol - toCol) === 2) {
            const isKingSideCastling = toCol > fromCol;
            const rookCol = isKingSideCastling ? 7 : 0;
            const newRookCol = isKingSideCastling ? fromCol + 1 : fromCol - 1;
            
            moveData.castling = {
                rook: { ...this.board[fromRow][rookCol] },
                from: { row: fromRow, col: rookCol },
                to: { row: fromRow, col: newRookCol }
            };
            
            // Move the rook
            this.board[fromRow][newRookCol] = this.board[fromRow][rookCol];
            this.board[fromRow][rookCol] = null;
            this.board[fromRow][newRookCol].hasMoved = true;
        }
        
        // Update castling rights
        if (piece.type === 'king') {
            this.castlingRights[piece.color].kingSide = false;
            this.castlingRights[piece.color].queenSide = false;
        } else if (piece.type === 'rook') {
            if (fromCol === 0) { // Queen side
                this.castlingRights[piece.color].queenSide = false;
            } else if (fromCol === 7) { // King side
                this.castlingRights[piece.color].kingSide = false;
            }
        }
        
        // If a rook is captured, update castling rights
        if (moveData.captured && moveData.captured.type === 'rook') {
            const capturedColor = moveData.captured.color;
            if (toCol === 0) {
                this.castlingRights[capturedColor].queenSide = false;
            } else if (toCol === 7) {
                this.castlingRights[capturedColor].kingSide = false;
            }
        }
        
        // Capture piece if present
        if (this.board[toRow][toCol]) {
            this.capturedPieces[this.board[toRow][toCol].color].push(this.board[toRow][toCol].type);
        }
        
        // Move the piece
        this.board[toRow][toCol] = piece;
        this.board[fromRow][fromCol] = null;
        
        // Update piece's move status
        if (piece.hasMoved !== undefined) {
            piece.hasMoved = true;
        }
        
        // Save the move to history
        this.moveHistory.push(moveData);
        
        // Switch turns and check for game end
        const result = this.switchTurn();
        
        return {
            success: true,
            moveData: moveData,
            result: result
        };
    }
    
    // Get all valid moves for a piece
    getValidMovesForPiece(row, col, ignoreCheck = false) {
        const piece = this.board[row][col];
        if (!piece) return [];
        
        let moves = [];
        
        switch (piece.type) {
            case 'pawn':
                moves = this.getPawnMoves(row, col);
                break;
            case 'rook':
                moves = this.getRookMoves(row, col);
                break;
            case 'knight':
                moves = this.getKnightMoves(row, col);
                break;
            case 'bishop':
                moves = this.getBishopMoves(row, col);
                break;
            case 'queen':
                moves = this.getQueenMoves(row, col);
                break;
            case 'king':
                moves = this.getKingMoves(row, col, ignoreCheck);
                break;
        }
        
        // Filter out moves that would leave the king in check, unless we're ignoring checks
        if (!ignoreCheck) {
            moves = moves.filter(move => {
                return this.wouldMoveBeValid(row, col, move.row, move.col);
            });
        }
        
        return moves;
    }
    
    // Check if a move would leave the king in check
    wouldMoveBeValid(fromRow, fromCol, toRow, toCol) {
        const piece = this.board[fromRow][fromCol];
        if (!piece) return false;
        
        // Make a temporary copy of the board
        const tempBoard = JSON.parse(JSON.stringify(this.board));
        
        // Make the move on the temporary board
        const capturedPiece = tempBoard[toRow][toCol];
        tempBoard[toRow][toCol] = tempBoard[fromRow][fromCol];
        tempBoard[fromRow][fromCol] = null;
        
        // Find the king of the moving player
        let kingRow, kingCol;
        if (piece.type === 'king') {
            kingRow = toRow;
            kingCol = toCol;
        } else {
            for (let r = 0; r < 8; r++) {
                for (let c = 0; c < 8; c++) {
                    const p = tempBoard[r][c];
                    if (p && p.type === 'king' && p.color === piece.color) {
                        kingRow = r;
                        kingCol = c;
                        break;
                    }
                }
                if (kingRow !== undefined) break;
            }
        }
        
        // Check if any opponent piece can attack the king on the temporary board
        const opponentColor = piece.color === 'white' ? 'black' : 'white';
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const p = tempBoard[r][c];
                if (!p || p.color !== opponentColor) continue;
                
                // Get all possible moves for the opponent piece
                const opponentMoves = [];
                switch (p.type) {
                    case 'pawn':
                        // Simplified pawn attack check
                        const dir = p.color === 'white' ? -1 : 1;
                        if ((r + dir === kingRow && c - 1 === kingCol) || (r + dir === kingRow && c + 1 === kingCol)) {
                            return false;
                        }
                        break;
                    case 'rook':
                        if (this.isValidRookMove(r, c, kingRow, kingCol, tempBoard)) return false;
                        break;
                    case 'knight':
                        if (this.isValidKnightMove(r, c, kingRow, kingCol)) return false;
                        break;
                    case 'bishop':
                        if (this.isValidBishopMove(r, c, kingRow, kingCol, tempBoard)) return false;
                        break;
                    case 'queen':
                        if (this.isValidRookMove(r, c, kingRow, kingCol, tempBoard) || 
                            this.isValidBishopMove(r, c, kingRow, kingCol, tempBoard)) {
                            return false;
                        }
                        break;
                    case 'king':
                        // King can only attack adjacent squares
                        if (Math.abs(r - kingRow) <= 1 && Math.abs(c - kingCol) <= 1) return false;
                        break;
                }
            }
        }
        
        return true;
    }
    
    // Get all valid moves for a pawn
    getPawnMoves(row, col) {
        const piece = this.board[row][col];
        const moves = [];
        
        if (!piece || piece.type !== 'pawn') return moves;
        
        const direction = piece.color === 'white' ? -1 : 1;
        
        // Forward move
        if (this.isValidPosition(row + direction, col) && !this.board[row + direction][col]) {
            moves.push({ row: row + direction, col: col });
            
            // Double forward move from starting position
            if (((piece.color === 'white' && row === 6) || (piece.color === 'black' && row === 1)) && 
                !this.board[row + 2 * direction][col]) {
                moves.push({ row: row + 2 * direction, col: col });
            }
        }
        
        // Captures
        for (let colOffset of [-1, 1]) {
            const newCol = col + colOffset;
            if (this.isValidPosition(row + direction, newCol)) {
                const targetPiece = this.board[row + direction][newCol];
                
                // Regular capture
                if (targetPiece && targetPiece.color !== piece.color) {
                    moves.push({ row: row + direction, col: newCol });
                }
                
                // En passant capture
                else if (this.enPassantTarget && 
                         row + direction === this.enPassantTarget.row && 
                         newCol === this.enPassantTarget.col) {
                    moves.push({ row: row + direction, col: newCol });
                }
            }
        }
        
        return moves;
    }
    
    // Check if a rook move is valid
    isValidRookMove(fromRow, fromCol, toRow, toCol, board = this.board) {
        if (fromRow !== toRow && fromCol !== toCol) return false;
        
        // Check for pieces in the path
        if (fromRow === toRow) {
            // Horizontal movement
            const start = Math.min(fromCol, toCol) + 1;
            const end = Math.max(fromCol, toCol);
            for (let c = start; c < end; c++) {
                if (board[fromRow][c]) return false;
            }
        } else {
            // Vertical movement
            const start = Math.min(fromRow, toRow) + 1;
            const end = Math.max(fromRow, toRow);
            for (let r = start; r < end; r++) {
                if (board[r][fromCol]) return false;
            }
        }
        
        return true;
    }
    
    // Get all valid moves for a rook
    getRookMoves(row, col) {
        const piece = this.board[row][col];
        const moves = [];
        
        if (!piece || piece.type !== 'rook') return moves;
        
        // Check in all four directions: up, right, down, left
        const directions = [[-1, 0], [0, 1], [1, 0], [0, -1]];
        
        for (const [rowDir, colDir] of directions) {
            let newRow = row + rowDir;
            let newCol = col + colDir;
            
            while (this.isValidPosition(newRow, newCol)) {
                const targetPiece = this.board[newRow][newCol];
                
                if (!targetPiece) {
                    moves.push({ row: newRow, col: newCol });
                } else {
                    if (targetPiece.color !== piece.color) {
                        moves.push({ row: newRow, col: newCol });
                    }
                    break;
                }
                
                newRow += rowDir;
                newCol += colDir;
            }
        }
        
        return moves;
    }
    
    // Check if a knight move is valid
    isValidKnightMove(fromRow, fromCol, toRow, toCol) {
        const rowDiff = Math.abs(fromRow - toRow);
        const colDiff = Math.abs(fromCol - toCol);
        
        return (rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2);
    }
    
    // Get all valid moves for a knight
    getKnightMoves(row, col) {
        const piece = this.board[row][col];
        const moves = [];
        
        if (!piece || piece.type !== 'knight') return moves;
        
        // All possible knight moves
        const knightMoves = [
            [-2, -1], [-2, 1], [-1, -2], [-1, 2],
            [1, -2], [1, 2], [2, -1], [2, 1]
        ];
        
        for (const [rowOffset, colOffset] of knightMoves) {
            const newRow = row + rowOffset;
            const newCol = col + colOffset;
            
            if (this.isValidPosition(newRow, newCol)) {
                const targetPiece = this.board[newRow][newCol];
                
                if (!targetPiece || targetPiece.color !== piece.color) {
                    moves.push({ row: newRow, col: newCol });
                }
            }
        }
        
        return moves;
    }
    
    // Check if a bishop move is valid
    isValidBishopMove(fromRow, fromCol, toRow, toCol, board = this.board) {
        const rowDiff = Math.abs(fromRow - toRow);
        const colDiff = Math.abs(fromCol - toCol);
        
        if (rowDiff !== colDiff) return false;
        
        // Check for pieces in the path
        const rowDir = fromRow < toRow ? 1 : -1;
        const colDir = fromCol < toCol ? 1 : -1;
        
        let r = fromRow + rowDir;
        let c = fromCol + colDir;
        
        while (r !== toRow && c !== toCol) {
            if (board[r][c]) return false;
            r += rowDir;
            c += colDir;
        }
        
        return true;
    }
    
    // Get all valid moves for a bishop
    getBishopMoves(row, col) {
        const piece = this.board[row][col];
        const moves = [];
        
        if (!piece || piece.type !== 'bishop') return moves;
        
        // Check in all four diagonal directions
        const directions = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
        
        for (const [rowDir, colDir] of directions) {
            let newRow = row + rowDir;
            let newCol = col + colDir;
            
            while (this.isValidPosition(newRow, newCol)) {
                const targetPiece = this.board[newRow][newCol];
                
                if (!targetPiece) {
                    moves.push({ row: newRow, col: newCol });
                } else {
                    if (targetPiece.color !== piece.color) {
                        moves.push({ row: newRow, col: newCol });
                    }
                    break;
                }
                
                newRow += rowDir;
                newCol += colDir;
            }
        }
        
        return moves;
    }
    
    // Get all valid moves for a queen
    getQueenMoves(row, col) {
        // Queen moves like a rook and bishop combined
        return [...this.getRookMoves(row, col), ...this.getBishopMoves(row, col)];
    }
    
    // Get all valid moves for a king
    getKingMoves(row, col, ignoreCheck = false) {
        const piece = this.board[row][col];
        const moves = [];
        
        if (!piece || piece.type !== 'king') return moves;
        
        // Regular king moves (all eight surrounding squares)
        for (let rowOffset = -1; rowOffset <= 1; rowOffset++) {
            for (let colOffset = -1; colOffset <= 1; colOffset++) {
                if (rowOffset === 0 && colOffset === 0) continue;
                
                const newRow = row + rowOffset;
                const newCol = col + colOffset;
                
                if (this.isValidPosition(newRow, newCol)) {
                    const targetPiece = this.board[newRow][newCol];
                    
                    if (!targetPiece || targetPiece.color !== piece.color) {
                        moves.push({ row: newRow, col: newCol });
                    }
                }
            }
        }
        
        // Castling
        if (!piece.hasMoved && !this.checkState.inCheck && !ignoreCheck) {
            // King-side castling
            if (this.castlingRights[piece.color].kingSide && 
                !this.board[row][col + 1] && 
                !this.board[row][col + 2] && 
                this.board[row][7] && 
                this.board[row][7].type === 'rook' && 
                !this.board[row][7].hasMoved) {
                
                // Check if king would pass through check
                if (!this.isKingInCheck(piece.color, { row, col: col + 1 })) {
                    moves.push({ row: row, col: col + 2 });
                }
            }
            
            // Queen-side castling
            if (this.castlingRights[piece.color].queenSide && 
                !this.board[row][col - 1] && 
                !this.board[row][col - 2] && 
                !this.board[row][col - 3] && 
                this.board[row][0] && 
                this.board[row][0].type === 'rook' && 
                !this.board[row][0].hasMoved) {
                
                // Check if king would pass through check
                if (!this.isKingInCheck(piece.color, { row, col: col - 1 })) {
                    moves.push({ row: row, col: col - 2 });
                }
            }
        }
        
        return moves;
    }
    
    // Check if the game has ended and the reason
    checkGameEndConditions() {
        // Check if the current player has any valid moves
        let hasValidMoves = false;
        
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = this.board[row][col];
                if (piece && piece.color === this.currentPlayer) {
                    const validMoves = this.getValidMovesForPiece(row, col);
                    if (validMoves.length > 0) {
                        hasValidMoves = true;
                        break;
                    }
                }
            }
            if (hasValidMoves) break;
        }
        
        if (!hasValidMoves) {
            if (this.checkState.inCheck) {
                // Checkmate
                this.gameOver = true;
                return { gameOver: true, result: 'checkmate', winner: this.currentPlayer === 'white' ? 'black' : 'white' };
            } else {
                // Stalemate
                this.gameOver = true;
                return { gameOver: true, result: 'stalemate', winner: null };
            }
        }
        
        return { gameOver: false };
    }
    
    // Get all valid moves for the current player
    getAllValidMovesForCurrentPlayer() {
        const moves = [];
        
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = this.board[row][col];
                if (piece && piece.color === this.currentPlayer) {
                    const validMoves = this.getValidMovesForPiece(row, col);
                    validMoves.forEach(move => {
                        moves.push({
                            from: { row, col },
                            to: move
                        });
                    });
                }
            }
        }
        
        return moves;
    }
    
    // Undo the last move
    undoMove() {
        if (this.moveHistory.length === 0) {
            return false;
        }
        
        const lastMove = this.moveHistory.pop();
        const { from, to, piece, captured, enPassantTarget, castlingRights } = lastMove;
        
        // Restore the piece to its original position
        this.board[from.row][from.col] = { ...piece };
        
        // If the piece was moved for the first time, restore its hasMoved status
        if (lastMove.isFirstMove) {
            this.board[from.row][from.col].hasMoved = false;
        }
        
        // Restore captured piece or clear destination
        if (captured) {
            this.board[to.row][to.col] = { ...captured };
            
            // Remove from captured pieces list
            const index = this.capturedPieces[captured.color].lastIndexOf(captured.type);
            if (index !== -1) {
                this.capturedPieces[captured.color].splice(index, 1);
            }
        } else {
            this.board[to.row][to.col] = null;
        }
        
        // Handle en passant capture
        if (lastMove.enPassantCapture) {
            const { row, col, piece } = lastMove.enPassantCapture;
            this.board[row][col] = { ...piece };
            
            // Remove from captured pieces list
            const index = this.capturedPieces[piece.color].lastIndexOf(piece.type);
            if (index !== -1) {
                this.capturedPieces[piece.color].splice(index, 1);
            }
        }
        
        // Handle castling
        if (lastMove.castling) {
            const { rook, from: rookFrom, to: rookTo } = lastMove.castling;
            this.board[rookFrom.row][rookFrom.col] = { ...rook };
            this.board[rookTo.row][rookTo.col] = null;
        }
        
        // Restore en passant target
        this.enPassantTarget = enPassantTarget;
        
        // Restore castling rights
        this.castlingRights = JSON.parse(JSON.stringify(castlingRights));
        
        // Switch back to previous player
        this.currentPlayer = this.currentPlayer === 'white' ? 'black' : 'white';
        
        // Update check state
        this.updateCheckState();
        
        return true;
    }
    
    // Convert algebraic notation to board coordinates
    algebraicToCoords(notation) {
        if (notation.length !== 2) return null;
        
        const col = notation.charCodeAt(0) - 'a'.charCodeAt(0);
        const row = 8 - parseInt(notation[1]);
        
        if (col < 0 || col > 7 || row < 0 || row > 7) return null;
        
        return { row, col };
    }
    
    // Convert board coordinates to algebraic notation
    coordsToAlgebraic(row, col) {
        if (!this.isValidPosition(row, col)) return null;
        
        const file = String.fromCharCode('a'.charCodeAt(0) + col);
        const rank = 8 - row;
        
        return file + rank;
    }
    
    // Get the state of the game
    getGameState() {
        return {
            board: JSON.parse(JSON.stringify(this.board)),
            currentPlayer: this.currentPlayer,
            gameOver: this.gameOver,
            checkState: this.checkState,
            capturedPieces: this.capturedPieces,
            moveHistory: JSON.parse(JSON.stringify(this.moveHistory)),
            castlingRights: JSON.parse(JSON.stringify(this.castlingRights)),
            enPassantTarget: this.enPassantTarget
        };
    }
    
    // Load game from a saved state
    loadFromState(state) {
        if (!state) return false;
        
        // Restore the board
        this.board = JSON.parse(JSON.stringify(state.board));
        
        // Restore game state
        this.currentPlayer = state.currentPlayer;
        this.gameOver = state.gameOver;
        this.checkState = state.checkState;
        this.capturedPieces = state.capturedPieces;
        
        // Restore move history
        this.moveHistory = JSON.parse(JSON.stringify(state.moveHistory));
        
        // Restore special move states
        this.castlingRights = state.castlingRights;
        this.enPassantTarget = state.enPassantTarget;
        
        return true;
    }
}