# Chess Piece Images

This folder should contain the following chess piece images:

- white-pawn.png
- white-rook.png
- white-knight.png
- white-bishop.png
- white-queen.png
- white-king.png
- black-pawn.png
- black-rook.png
- black-knight.png
- black-bishop.png
- black-queen.png
- black-king.png

## How to Get Chess Piece Images

You can download chess piece images from various free sources:

1. **Chess.com's GitHub repository**: https://github.com/lichess-org/lila/tree/master/public/piece
   Various chess piece styles are available here

2. **OpenGameArt.org**: https://opengameart.org/content/chess-pieces-and-board-squares

3. **Wikimedia Commons**: https://commons.wikimedia.org/wiki/Category:SVG_chess_pieces

### Alternative Approach

If you don't want to download individual images, you can use CSS sprite sheets or icon fonts:

1. **Chess.js and chessboard.js**: https://chessboardjs.com/
   Offers a complete chess UI library with built-in piece images

2. **Font Awesome Chess Pieces**: 
   Use Font Awesome's chess piece icons if you prefer font-based pieces

## Implementing Fallback Images

Until you add the actual images, the game will function but the pieces won't be visible. To make it work without images immediately, you can:

1. Add Unicode chess symbols as a fallback in your CSS
2. Use a chess piece font instead of images
3. Use basic colored shapes to represent the pieces temporarily