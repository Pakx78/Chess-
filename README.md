# Chess Game with HTML, CSS, and JavaScript

A fully functional chess game built with HTML, CSS, and JavaScript. Features include:

- Complete chess rules implementation
- Drag-and-drop piece movement
- Highlighting of valid moves
- Capture tracking
- Check and checkmate detection
- Game state display
- Pawn promotion
- Castling and en passant special moves
- Move history and undo functionality
- Responsive design for different screen sizes

## How to Play

1. Open `index.html` in your web browser
2. White moves first, click or drag pieces to move them
3. Valid moves will be highlighted when a piece is selected
4. Special moves (castling, en passant, pawn promotion) are automatically handled
5. Use the "New Game" button to restart or "Undo Move" to take back your last move

## Requirements

- A modern web browser with JavaScript enabled
- No server-side components or dependencies required

## Customization

### Chess Piece Images

Replace the image files in the `/images` directory with your preferred chess piece designs. The default naming convention is `[color]-[piece].png`, such as `white-pawn.png` or `black-queen.png`.

See the [images/README.md](images/README.md) file for more information on obtaining chess piece images.

### Styling

The game's appearance can be customized by editing the `css/style.css` file. You can change:

- Board colors and size
- Piece sizes
- Highlighting colors
- Overall layout and responsiveness
- Animation effects

### Game Logic

The chess rules and game mechanics are implemented in `js/chess.js`. If you want to modify the rules or add features (such as timers or game analysis), you can extend this file.

## Project Structure

- `index.html` - Main HTML file with the game structure
- `css/style.css` - All styling for the game interface
- `js/chess.js` - Core chess game logic and rules
- `js/ui.js` - User interface handling (rendering, interactions)
- `js/app.js` - Application initialization
- `images/` - Directory for chess piece images

## License

This project is available as open-source under the MIT License.