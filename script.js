// import {slideLeft, slideRight, slideUp, slideDown} from "./JS/Movement.js";
// import {createBoardUI, createTileUI} from "./JS/UI.js";

// (function IIFE()
// {
//   const BOARD_SIZE = 4;
//   let board;


//   (function init()
//   {
//     createBoardUI(BOARD_SIZE);
//     board = createBoard(BOARD_SIZE);
//       //set timeout so that the first animation plays
//     setTimeout(() =>
//     {
//       spawnInitialTiles(board);
//       handleInput();
//     }, 1000);
//   })();



//   function createBoard(size)
//   {
//     const board = Array.from({length: size}, () => Array(size).fill(0));
//     return board;
//   }


//   function spawnInitialTiles(board)
//   {
//     addNewNumber(board);
//     addNewNumber(board);
//   }


//   function addNewNumber(board)
//   {
//     let emptyCells = [];

//     // for (let i = 0; i < board.length; i++)
//     for (let i = 0; i < 1; i++)
//     {
//       for (let j = 0; j < board[0].length; j++)
//       {
//         if (board[i][j] === 0)
//         {
//           emptyCells.push({i, j});
//         }
//       }
//     }

//     if (emptyCells.length > 0)
//     {
//       let {i, j} = emptyCells[Math.floor(Math.random() * emptyCells.length)];
//       const number = Math.random() < 0.9 ? 2 : 4;
//       board[i][j] = number
//       const parent = document.querySelector(`.tile-container-${i}-${j}`)
//       createTileUI(parent, number);
//     }

//   }


//   function isGameOver(board)
//   {
//     for (let i = 0; i < board.length; i++)
//     {
//       for (let j = 0; j < board[i].length; j++)
//       {
//         if (board[i][j] === 0) return false;
//         if ((i < board.length - 1) && (board[i][j] === board[i + 1][j])) return false;
//         if ((j < board[0].length - 1) && (board[i][j] === board[i][j + 1])) return false;
//       }
//     }

//     return true;
//   }


//   function onPlayerInput()
//   {
//     addNewNumber(board);
//     if (isGameOver(board))
//       alert('Game Over!')
//   }


//   function handleInput()
//   {
//     document.addEventListener('keydown', (e) =>
//     {
//       switch (e.key)
//       {
//         case 'ArrowLeft': board = slideLeft(board);
//           onPlayerInput();
//           break;
//         case 'ArrowRight': board = slideRight(board);
//           onPlayerInput();
//           break;
//         case 'ArrowUp': board = slideUp(board);
//           onPlayerInput();
//           break;
//         case 'ArrowDown': board = slideDown(board);
//           onPlayerInput();
//           break;
//       }
//     })
//   }

// })();

class Game2048
{

  constructor(BOARD_SIZE)
  {
    this.BOARD_SIZE = BOARD_SIZE;
    this.grid = [];
    this.score = 0;
    this.best = parseInt(localStorage.getItem('best2048') || '0');
    this.gameWon = false;
    this.gameOver = false;
    this.tileId = 0;
    this.tiles = new Map(); // Track tiles for animation

    this.createBoardUI(BOARD_SIZE)
    this.init(BOARD_SIZE);
    this.setupEventListeners();
  }


  createBoardUI(size)
  {
    const board = document.querySelector('.board');

    // * Dynamic board size ==

    const root = document.documentElement;

    //410 x 410 px board (fixed)
    const rootStyles = getComputedStyle(root);
    let boardSize = parseInt(rootStyles.getPropertyValue('--BOARD-SIZE'));

    //combined tile length is 87% of board length
    let tileSize = (boardSize * 0.87) / size;

    root.style.setProperty('--TILE-SIZE', `${tileSize}px`);

    //remaining is padding, padding is on both sides of tile and on the board
    let padding = (boardSize - tileSize * size) / (size * 2 + 2);
    root.style.setProperty('--PADDING-BOARD', `${padding}px`);


    //grid templates
    board.style.gridTemplateColumns = `repeat(${size}, calc(var(--TILE-SIZE) + var(--PADDING-BOARD) * 2))`;
    board.style.gridTemplateRows = `repeat(${size}, calc(var(--TILE-SIZE) + var(--PADDING-BOARD) * 2))`;


    for (let i = 0; i < size; i++)
    {
      for (let j = 0; j < size; j++)
      {
        const tile = document.createElement('div');
        tile.className = `tile-container inner-shadow`;
        tile.setAttribute('data-row', i);
        tile.setAttribute('data-col', j);
        board.appendChild(tile);
      }
    }
  }


  init(size)
  {
    this.grid = Array(size).fill().map(() => Array(size).fill(null));
    this.score = 0;
    this.gameWon = false;
    this.gameOver = false;
    this.tileId = 0;
    this.tiles.clear();

    //remove existing tiles
    const board = document.querySelector('.board');
    const existingTiles = board.querySelectorAll('.tile');
    existingTiles.forEach(item => item.remove());

    // Add two initial tiles
    this.addNewTile();
    this.addNewTile();

    this.updateDisplay();
  }


  setupEventListeners()
  {
    document.addEventListener('keydown', (e) =>
    {
      if (this.gameOver && !this.gameWon)
        return;

      const keyMap = {
        'ArrowLeft': 'left',
        'ArrowRight': 'right',
        'ArrowUp': 'up',
        'ArrowDown': 'down',
        'KeyA': 'left',
        'KeyD': 'right',
        'KeyW': 'up',
        'KeyS': 'down',
      }

      const direction = keyMap[e.key];

      if (direction)
      {
        e.preventDefault();
        this.move(direction);
      }

    })
  }



  addNewTile()
  {
    let emptyCells = [];

    for (let r = 0; r < this.grid.length; r++)
    {
      for (let c = 0; c < this.grid[0].length; c++)
      {
        if (this.grid[r][c] === null)
        {
          emptyCells.push({r, c});
        }
      }
    }

    if (emptyCells.length > 0)
    {
      const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
      const value = this.getRandomNumber();
      const tile = this.createTile(this.tileId++, randomCell, value, true);

      this.grid[randomCell.r][randomCell.c] = tile;
      this.tiles.set(tile.id, tile);
      this.createTileElement(tile);

      return randomCell;
    }

    return null;
  }


  getRandomNumber()
  {
    return Math.random() < 0.9 ? 2 : 4;
  }

  createTile(tileId, cell, value, isNew, merged = false)
  {
    const tile = {
      id: tileId,
      value: value,
      row: cell.r,
      col: cell.c,
      isNew: isNew,
      merged: merged
    };

    return tile;
  }


  createTileElement(tile)
  {
    const board = document.querySelector('.board');

    const tileElement = document.createElement('div');
    tileElement.id = `tile-${tile.id}`;
    tileElement.className = `tile tile-${tile.value}`;

    if (tile.isNew)
    {
      tileElement.classList.add('tile-new');
    }

    this.setTileElementPosition(tile, tileElement);

    board.appendChild(tileElement);

    // Remove new class after animation
    const animationTimeSpawn = parseFloat(getComputedStyle(tileElement).getPropertyValue('--ANIMATION-TIME-SPAWN'));


    if (tile.isNew)
    {
      setTimeout(() =>
      {
        tile.isNew = false;
        tileElement.classList.remove('tile-new');
      }, animationTimeSpawn * 1000);
    }
  }


  setTileElementPosition(tile, tileElement)
  {
    const root = document.documentElement;
    const padding = parseFloat(getComputedStyle(root).getPropertyValue('--PADDING-BOARD'));
    const tileSize = parseFloat(getComputedStyle(root).getPropertyValue('--TILE-SIZE'));
    tileElement.textContent = tile.value;

    tileElement.style.left = `${tile.col * (tileSize + padding * 2) + padding * 2}px`;
    tileElement.style.top = `${tile.row * (tileSize + padding * 2) + padding * 2}px`;
  }

  move(direction)
  {
    let moved = false;

    switch (direction)
    {
      case 'left':
        moved = this.moveLeft();
        break;
      case 'right':
        moved = this.moveRight();
        break;
      case 'up':
        moved = this.moveUp();
        break;
      case 'down':
        moved = this.moveDown();
        break;
      default: return;
    }


    if (moved)
    {
      // animate to new positions
      this.animateTiles();

      // move animation time in sec
      const animationTimeMove = parseFloat(getComputedStyle(document.querySelector('.tile-moved')).getPropertyValue('--ANIMATION-TIME-MOVE'));

      // check game state and add tile
      setTimeout(() =>
      {
        this.addNewTile();

        if (!this.gameWon && this.hasWon())
        {
          this.gameWon = true;
          this.showGameWon();
        }

        else if (isGameOver())
        {
          this.gameOver = true;
          this.showGameOver();
        }
      }, animationTimeMove * 1000);
    }

  }


  moveLeft()
  {
    let moved = false;

    for (let r = 0; r < this.BOARD_SIZE; r++)
    {
      let row = this.grid[r].filter(item => item !== null);
      let newRow = Array(this.BOARD_SIZE).fill(null);
      let col = 0;

      for (let i = 0; i < row.length; i++)
      {
        // check for merge
        const tile = row[i];
        if (i < row.length - 1 && row[i + 1] === tile)
        {

          // merge tiles
          const cell = {r: r, c: col};
          const value = this.getRandomNumber();
          const mergedTile = this.createTile(tile.id, cell, value, false, true);

          newRow[col] = mergedTile;
          this.tiles.set(tile.id, mergedTile);
          this.score += mergedTile.value;

          // remove the merged tile 
          const mergedTileElement = document.querySelector(`#tile-${row[i + 1].id}`);
          if (mergedTileElement)
          {
            mergedTileElement.remove();
          }
          this.tiles.delete(row[i + 1].id);

          // skip the next tile as it is merged
          i++;
        }

        // if not merged
        else
        {
          // updated the row and col
          tile.row = r;
          tile.col = col;
          tile.merged = false;
          newRow[col] = tile;
          this.tiles.set(tile.id, tile);
        }


        col++;
      }

      // check if anything moved
      for (let c = 0; c < BOARD_SIZE; c++)
      {
        if ((this.grid[r][c] !== null) ^ (newRow[c] !== null) ||
          this.grid[r][c] && newRow[c] &&
          (this.grid[r][c].col !== newRow[c].col || this.grid[r][c].value !== newRow[c].value))
        {
          moved = true;
        }
      }

      this.grid[r] = newRow;

    }

    return moved;
  }


  updateDisplay()
  {
    // TODO set score on UI

    // TODOif score > best 
    // TODO update best variable and in local storage 

    // TODO update best UI
  }


  hasWon()
  {
    for (let r = 0; r < BOARD_SIZE; r++)
    {
      for (let c = 0; c < BOARD_SIZE; c++)
      {
        if (this.grid[r][c] && this.grid[r][c].value === 2048)
        {
          return true;
        }
      }
    }
    return false;
  }


  isGameOver()
  {
    // Check for empty cells
    for (let r = 0; r < BOARD_SIZE; r++)
    {
      for (let c = 0; c < BOARD_SIZE; c++)
      {
        if (this.grid[r][c] === null)
        {
          return false;
        }
      }
    }

    // Check for possible merges
    for (let r = 0; r < BOARD_SIZE; r++)
    {
      for (let c = 0; c < BOARD_SIZE; c++)
      {
        const currentValue = this.grid[r][c].value;
        if (
          (r < (BOARD_SIZE - 1) && this.grid[r + 1][c] && this.grid[r + 1][c].value === currentValue) ||
          (c < (BOARD_SIZE - 1) && this.grid[r][c + 1] && this.grid[r][c + 1].value === currentValue)
        )
        {
          return false;
        }
      }
    }

    return true;
  }
}


// animateTiles()
// {
//   // todo
//   this.tiles.forEach(tile =>
//   {
//     const tileElement = document.querySelector(`#tile-${tile.id}`);
//     if (tileElement)
//     {
//       // tileElement.style.left =
//     }
//   }
//   )
// }

showGameWon()
{

}


showGameOver()
{

}


let BOARD_SIZE = 5;
const game = new Game2048(BOARD_SIZE);