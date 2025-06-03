class Game2048
{

  constructor(BOARD_SIZE)
  {
    this.BOARD_SIZE = BOARD_SIZE;
    this.grid = [];
    this.score = 0;
    this.best = parseInt(localStorage.getItem(`best2048_${this.BOARD_SIZE}`) || '0');
    this.gameWon = false;
    this.gameOver = false;
    this.tileId = 0;
    this.tiles = new Map(); // Track tiles for animation
    this.allowInput = true;

    this.createBoardUI(BOARD_SIZE)
    this.init(BOARD_SIZE);
    this.setupEventListeners();
  }

  // Helper functions
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


  getTileElementPosition(tile)
  {
    const root = document.documentElement;
    const padding = parseFloat(getComputedStyle(root).getPropertyValue('--PADDING-BOARD'));
    const tileSize = parseFloat(getComputedStyle(root).getPropertyValue('--TILE-SIZE'));

    const left = tile.col * (tileSize + padding * 2) + padding * 2;
    const top = tile.row * (tileSize + padding * 2) + padding * 2;

    return { left, top };
  }


  // Main functions
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
        'A': 'left',
        'D': 'right',
        'W': 'up',
        'S': 'down',
        'a': 'left',
        'd': 'right',
        'w': 'up',
        's': 'down',
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
          emptyCells.push({ r, c });
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

    const { left, top } = this.getTileElementPosition(tile);
    tileElement.style.left = left + 'px';
    tileElement.style.top = top + 'px';
    tileElement.textContent = tile.value;

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


  move(direction)
  {
    if (!this.allowInput)
    {
      return;
    }

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
      //disallow input during animation
      this.allowInput = false;

      // animate to new positions
      this.animateTiles();

      // move animation time in sec
      const animationTimeMove = 0.15;

      // check game state and add tile
      setTimeout(() =>
      {
        this.allowInput = true;

        this.addNewTile();

        if (!this.gameWon && this.hasWon())
        {
          this.gameWon = true;
          this.showGameWon();
        }

        else if (this.isGameOver())
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
      const row = this.grid[r].filter(item => item !== null);
      let newRow = Array(this.BOARD_SIZE).fill(null);
      let col = 0;

      for (let i = 0; i < row.length; i++)
      {
        const tile = row[i];

        // check for merge
        if (i < row.length - 1 && row[i + 1].value === tile.value)
        {

          // merge tiles
          const cell = { r: r, c: col };
          const mergedTile = this.createTile(tile.id, cell, tile.value * 2, false, true);

          newRow[col] = mergedTile;
          this.tiles.set(tile.id, mergedTile);
          this.score += mergedTile.value;

          // remove the merged tile 
          const mergedTileId = row[i + 1].id;
          const mergedTileElement = document.querySelector(`#tile-${mergedTileId}`);
          if (mergedTileElement)
          {
            mergedTileElement.remove();
          }
          this.tiles.delete(mergedTileId);

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
      for (let c = 0; c < this.BOARD_SIZE; c++)
      {
        if (this.grid[r][c] !== newRow[c])
        {
          moved = true;
          break;
        }
      }

      this.grid[r] = newRow;

    }

    return moved;
  }


  moveRight()
  {
    let moved = false;

    for (let r = 0; r < this.BOARD_SIZE; r++)
    {
      const row = this.grid[r].filter(tile => tile !== null);
      let newRow = Array(this.BOARD_SIZE).fill(null);
      let col = this.BOARD_SIZE - 1;

      for (let i = row.length - 1; i >= 0; i--)
      {
        const tile = row[i];

        // check for merge
        if (i > 0 && tile.value === row[i - 1].value)
        {
          // merge tiles
          const cell = { r: r, c: col };
          const mergedTile = this.createTile(tile.id, cell, tile.value * 2, false, true);

          newRow[col] = mergedTile;
          this.tiles.set(tile.id, mergedTile);
          this.score += mergedTile.value;

          // delete merged tile
          const mergedTileElement = document.querySelector(`#tile-${row[i - 1].id}`);
          if (mergedTileElement)
          {
            mergedTileElement.remove();
          }

          this.tiles.delete(row[i - 1].id);

          // skip the next element
          i--;
        }

        else
        {
          tile.row = r;
          tile.col = col;
          tile.merged = false;
          newRow[col] = tile;
          this.tiles.set(tile.id, tile);
        }

        col--;
      }

      // check if anything moved
      for (let c = 0; c < this.BOARD_SIZE; c++)
      {
        if (this.grid[r][c] !== newRow[c])
        {
          moved = true;
          break;
        }
      }

      this.grid[r] = newRow;
    }

    return moved;
  }


  moveUp()
  {
    let moved = false;

    for (let c = 0; c < this.BOARD_SIZE; c++)
    {
      const col = this.grid.map((row) => row[c]).filter(item => item !== null);
      let newCol = Array(this.BOARD_SIZE).fill(null);
      let row = 0;

      for (let i = 0; i < col.length; i++)
      {
        const tile = col[i];

        // check merge
        if (i < col.length - 1 && col[i + 1].value === tile.value)
        {
          // merge tiles
          const cell = { r: row, c: c };
          const mergedTile = this.createTile(tile.id, cell, tile.value * 2, false, true);

          newCol[row] = mergedTile;
          this.tiles.set(tile.id, mergedTile);
          this.score += mergedTile.value;

          // delete merged tile
          const mergedTileId = col[i + 1].id;
          const mergedTileElement = document.querySelector(`#tile-${mergedTileId}`);

          if (mergedTileElement)
          {
            mergedTileElement.remove();
          }

          this.tiles.delete(mergedTileId);

          // skip the next tile as it is merged
          i++;
        }

        else
        {
          tile.row = row;
          tile.col = c;
          tile.merged = false;
          newCol[row] = tile;
          this.tiles.set(tile.id, tile);
        }

        row++;
      }

      // check if anything moved
      for (let r = 0; r < this.BOARD_SIZE; r++)
      {
        if (this.grid[r][c] !== newCol[r])
        {
          moved = true;
          break;
        }
      }


      // update the column values in grid
      newCol.forEach((val, idx) =>
      {
        this.grid[idx][c] = val;
      })

    }

    return moved;
  }


  moveDown()
  {
    let moved = false;

    for (let c = 0; c < this.BOARD_SIZE; c++)
    {
      const col = this.grid.map((row) => row[c]).filter(item => item !== null);
      let newCol = Array(this.BOARD_SIZE).fill(null);
      let row = this.BOARD_SIZE - 1;

      for (let i = col.length - 1; i >= 0; i--)
      {
        const tile = col[i];

        // check merge
        if (i > 0 && col[i - 1].value === tile.value)
        {
          // merge tiles
          const cell = { r: row, c: c };
          const mergedTile = this.createTile(tile.id, cell, tile.value * 2, false, true);

          newCol[row] = mergedTile;
          this.tiles.set(tile.id, mergedTile);
          this.score += mergedTile.value;

          // delete merged tile
          const mergedTileId = col[i - 1].id;
          const mergedTileElement = document.querySelector(`#tile-${mergedTileId}`);

          if (mergedTileElement)
          {
            mergedTileElement.remove();
          }

          this.tiles.delete(mergedTileId);

          // skip the next tile as it is merged
          i--;
        }

        else
        {
          tile.row = row;
          tile.col = c;
          tile.merged = false;
          newCol[row] = tile;
          this.tiles.set(tile.id, tile);
        }

        row--;
      }

      // check if anything moved
      for (let r = 0; r < this.BOARD_SIZE; r++)
      {
        if (this.grid[r][c] !== newCol[r])
        {
          moved = true;
          break;
        }
      }


      // update the column values in grid
      newCol.forEach((val, idx) =>
      {
        this.grid[idx][c] = val;
      })

    }

    return moved;
  }


  updateDisplay()
  {
    // TODO set score on UI

    // TODO if score > best 
    // TODO update best variable and in local storage 

    // TODO update best UI
  }


  hasWon()
  {
    for (let r = 0; r < this.BOARD_SIZE; r++)
    {
      for (let c = 0; c < this.BOARD_SIZE; c++)
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
    for (let r = 0; r < this.BOARD_SIZE; r++)
    {
      for (let c = 0; c < this.BOARD_SIZE; c++)
      {
        if (this.grid[r][c] === null)
        {
          return false;
        }
      }
    }

    // Check for possible merges
    for (let r = 0; r < this.BOARD_SIZE; r++)
    {
      for (let c = 0; c < this.BOARD_SIZE; c++)
      {
        const currentValue = this.grid[r][c].value;
        if (
          (r < (this.BOARD_SIZE - 1) && this.grid[r + 1][c] && this.grid[r + 1][c].value === currentValue) ||
          (c < (this.BOARD_SIZE - 1) && this.grid[r][c + 1] && this.grid[r][c + 1].value === currentValue)
        )
        {
          return false;
        }
      }
    }

    return true;
  }


  animateTiles() 
  {
    this.tiles.forEach(tile => 
    {
      const tileElement = document.querySelector(`#tile-${tile.id}`);
      if (tileElement)
      {
        // in ms
        const animationDuration = 200;

        // calculate the position
        const leftInitial = parseFloat(tileElement.style.left);
        const topInitial = parseFloat(tileElement.style.top);
        const { left, top } = this.getTileElementPosition(tile);

        const offsetMult = 0.05;

        //animate the element
        const animation = tileElement.animate(
          {
            left: [`${leftInitial}px`, `${left + (left - leftInitial) * offsetMult}px`, `${left}px`],
            top: [`${topInitial}px`, `${top + (top - topInitial) * offsetMult}px`, `${top}px`],
            offset: [0, 0.8, 1]
          },
          {
            duration: animationDuration,
            fill: "forwards",
            easing: "ease-out"
          });

        // set position after animation is complete
        animation.finished.then(() =>
        {
          tileElement.style.left = `${left}px`;
          tileElement.style.top = `${top}px`;
        });


        // add merge class to merged tiles
        if (tile.merged)
        {
          console.log("enter merge");
          tileElement.textContent = tile.value;
          tileElement.className = `tile tile-${tile.value} tile-merged`;
          // in sec
          const mergeAnimationTime = parseFloat(getComputedStyle(tileElement).getPropertyValue('--ANIMATION-TIME-MERGE'));

          setTimeout(() => 
          {
            tile.merged = false;
            tileElement.classList.remove('tile-merged');
          }, mergeAnimationTime * 1000);
        }
      }
    }
    );

    this.updateDisplay();
  }

  showGameWon()
  {

  }


  showGameOver()
  {

  }

}

let BOARD_SIZE = 4;
const game = new Game2048(BOARD_SIZE);