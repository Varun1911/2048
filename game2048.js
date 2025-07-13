import { showPopup, isPopupOpened } from "./helper.js";

const popupGameOver = document.querySelector('.game-over-popup');
const popupGameWon = document.querySelector('.game-won-popup');
const board = document.querySelector('.board');
const swapPopup = document.querySelector('.swap-popup');
const swapPopupCancelBtn = swapPopup.querySelector('.swap-popup__cancel-btn');
const swapPopupMoveAmount = '-4dvh';
const swapPopupTop = '-1dvh';


export default class Game2048
{

  constructor(BOARD_SIZE)
  {
    this.BOARD_SIZE = BOARD_SIZE;
    this.grid = [];
    this.score = 0;
    this.best = this.getBestScoreFromStorage();
    this.gameWon = false;
    this.gameOver = false;
    this.tileId = 0;
    this.tiles = new Map(); // Track tiles for animation
    this.allowInput = true;
    // in ms
    this.animationTimeMove = 150;
    // Store tiles that need to be animated and then removed
    this.tilesToRemove = [];
    // total number of moves in the game
    this.moveCount = 0;

    // Undo functionality
    this.gameStates = []; // Stack to store previous game states
    this.maxUndoStates = 2; // Limit undo history to prevent memory issues
    this.undoRemaining = 2;
    this.canUndo = false;

    // Shuffle Functionality
    this.maxShuffleCount = 2;
    this.shuffleRemaining = this.maxShuffleCount;

    // Swap Functionality 
    this.maxSwapCount = 2;
    this.swapRemaining = this.maxSwapCount;
    this.isSwaping = false;
    this.firstTile_Swap = null;
    this.secondTile_Swap = null;

    // to dispose event listeners
    this.keyDownListener;
    this.undoBtnListener;
    this.shuffleBtnListener;
    this.swapBtnListener;
    this.swapPopupChangeListener;
    this.swapPopupCancelListener;
    this.swapPopupDisapperListener;
    this.tileEventListeners = new Map();
    this.touchMoveListener;
    this.touchStartListener;
    this.touchEndListener;

    this.createBoardUI(BOARD_SIZE)
    this.init(BOARD_SIZE);
    this.setupEventListeners();
    this.setupTouchInput();
  }

  dispose()
  {
    document.removeEventListener('keydown', this.keyDownListener);
    document.removeEventListener('touchmove', this.touchMoveListener);
    document.body.removeEventListener('touchstart', this.touchStartListener);
    document.body.removeEventListener('touchend', this.touchEndListener);

    // Remove button listeners
    const undoBtn = document.querySelector('.undo-btn');
    const shuffleBtn = document.querySelector('.shuffle-btn');
    const swapBtn = document.querySelector('.swap-btn');
    if (undoBtn) undoBtn.removeEventListener('click', this.undoClickListener);
    if (shuffleBtn) shuffleBtn.removeEventListener('click', this.shuffleBtnListener);
    if (swapBtn) swapBtn.removeEventListener('click', this.swapBtnListener);
    if (swapPopup) 
    {
      swapPopup.removeEventListener('transitionend', this.swapPopupChangeListener);
      swapPopup.removeEventListener('transitionend', this.swapPopupDisapperListener);
    }
    if (swapPopupCancelBtn) swapPopupCancelBtn.removeEventListener('click', this.swapPopupCancelListener);
  }

  // Helper functions
  isInputAllowed()
  {
    return this.allowInput && !isPopupOpened;
  }

  getBestScoreFromStorage()
  {
    return parseInt(localStorage.getItem(`best2048_${this.BOARD_SIZE}`) || '0')
  }


  setBestScoreInStorage()
  {
    localStorage.setItem(`best2048_${this.BOARD_SIZE}`, this.best);
  }


  getRandomNumber()
  {
    //*for testing
    // return Math.random() < 0.9 ? 1024 : 512;
    // let arr = [2, 4, 8, 16, 32, 64, 128, 256, 512];
    // return arr[Math.floor(Math.random() * arr.length)];

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
    // const root = document.documentElement;
    const padding = parseFloat(getComputedStyle(board).padding);

    const tileContainer = document.querySelector('.tile-container');
    const tileSize = tileContainer.getBoundingClientRect().width;
    const boardSize = board.getBoundingClientRect().width;

    const left = (tile.col * (tileSize + padding * 2) + padding * 2) / boardSize * 100;
    const top = (tile.row * (tileSize + padding * 2) + padding * 2) / boardSize * 100;

    return { left, top };
  }


  setScoreContainerWidth()
  {
    const scoreWrapper = document.querySelector('.score-wrapper');

    let width = board.getBoundingClientRect().width;

    if (board && scoreWrapper)
    {
      scoreWrapper.style.width = `${(width * 0.75) / window.innerHeight * 100}dvh`;
    }
  }


  setPowerUpContainerWidth()
  {
    const powerUpContainer = document.querySelector('.power-ups-container');

    let width = board.getBoundingClientRect().width;

    if (board && powerUpContainer)
    {
      powerUpContainer.style.width = `${(width * 0.75) / window.innerHeight * 100}dvh`;
    }
  }


  setNewGameBtnWidth()
  {
    const btnContainer = document.querySelector('.new-game-btn-container');

    let width = board.getBoundingClientRect().width;


    if (board && btnContainer)
    {
      btnContainer.style.width = `${(width * 0.481) / window.innerHeight * 100}dvh`;
    }
  }


  setMenuBtnWidth()
  {
    const menuBtns = document.querySelectorAll('.menu-popup__btn');

    let width = board.getBoundingClientRect().width;


    if (board && menuBtns)
    {
      menuBtns.forEach(item => 
      {
        item.style.width = `${(width * 0.75) / window.innerHeight * 100}dvh`;
      }
      )
    }
  }


  setSwapPopupWidth()
  {
    let width = board.getBoundingClientRect().width;


    if (board && swapPopup)
    {
      swapPopup.style.width = `${(width * 0.75) / window.innerHeight * 100}dvh`;
    }
  }


  animateTile(tileElement, leftInitialPos, leftFinalPos, topInitialPos, topFinalPos)
  {
    const offsetMult = 0.05;

    //animate the element
    const animation = tileElement.animate(
      {
        left: [`${leftInitialPos}%`, `${leftFinalPos + (leftFinalPos - leftInitialPos) * offsetMult}%`, `${leftFinalPos}%`],
        top: [`${topInitialPos}%`, `${topFinalPos + (topFinalPos - topInitialPos) * offsetMult}%`, `${topFinalPos}%`],
        offset: [0, 0.8, 1]
      },
      {
        duration: this.animationTimeMove,
        fill: "forwards",
        easing: "ease-out"
      });

    // set position after animation is complete
    animation.finished.then(() =>
    {
      tileElement.style.left = `${leftFinalPos}%`;
      tileElement.style.top = `${topFinalPos}%`;
    });

    return animation;
  }

  // Main functions
  createBoardUI(size)
  {

    // Remove all previous tile-containers
    const tileContainerNodeList = board.querySelectorAll('.tile-container');
    tileContainerNodeList.forEach(item => 
    {
      item.remove();
    });

    // * Dynamic board size ==
    document.documentElement.style.setProperty("--BOARD-SIZE", this.BOARD_SIZE);


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

    this.setScoreContainerWidth();
    this.setPowerUpContainerWidth();
    this.setNewGameBtnWidth();
    this.setMenuBtnWidth();
    this.setSwapPopupWidth();
  }


  init(size)
  {
    this.grid = Array(size).fill().map(() => Array(size).fill(null));
    this.score = 0;
    this.gameWon = false;
    this.gameOver = false;
    this.tileId = 0;
    this.tiles.clear();
    this.tilesToRemove = [];
    this.moveCount = 0;

    // reset event listener variables
    this.keyDownListener = null;
    this.undoBtnListener = null;
    this.shuffleBtnListener = null;
    this.swapBtnListener = null;
    this.swapPopupChangeListener = null;
    this.swapPopupCancelListener = null;
    this.swapPopupDisapperListener = null;
    this.touchMoveListener = null;
    this.touchStartListener = null;
    this.touchEndListener = null;

    // Clear undo history on new game
    this.gameStates = [];
    this.undoRemaining = 2;
    this.canUndo = false;
    this.updateUndoButton();

    // reset shuffle count
    this.shuffleRemaining = this.maxShuffleCount;
    this.updateShuffleButton();

    //reset swap 
    this.swapRemaining = this.maxSwapCount;
    this.updateSwapButton();
    this.isSwaping = false;
    this.exitSwapMode();
    this.tileEventListeners.clear();

    //remove existing tiles
    const existingTiles = board.querySelectorAll('.tile');
    existingTiles.forEach(item => item.remove());

    // Add two initial tiles
    this.addNewTile();
    this.addNewTile();

    this.updateDisplay();
  }


  setupEventListeners()
  {
    document.addEventListener('keydown', this.keyDownListener = (e) =>
    {
      if (this.gameOver && !this.gameWon)
        return;

      const keyMap =
      {
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
    });

    // Add undo button event listener
    const undoBtn = document.querySelector('.undo-btn');

    if (undoBtn)
    {
      undoBtn.addEventListener('click', this.undoBtnListener = () =>
      {
        this.undo();
      });
    }


    // Add shuffle button event listener
    const shuffleBtn = document.querySelector('.shuffle-btn');

    if (shuffleBtn)
    {
      shuffleBtn.addEventListener('click', this.shuffleBtnListener = () =>
      {
        this.shuffleTiles();
      })
    }


    const swapBtn = document.querySelector('.swap-btn');

    if (swapBtn)
    {
      swapBtn.addEventListener('click', this.swapBtnListener = () =>
      {
        this.swapTiles();
      })
    }

    if (swapPopupCancelBtn)
    {
      swapPopupCancelBtn.addEventListener('click', this.swapPopupCancelListener = () =>
      {
        this.cancelSwap();
      })
    }
  }


  setupTouchInput()
  {
    let startX, startY, endX, endY;

    document.addEventListener('touchmove', this.touchMoveListener = function (e)
    {
      e.preventDefault();
    }, { passive: false });

    // Touch start
    document.body.addEventListener('touchstart', this.touchStartListener = (e) =>
    {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    });

    // Touch end
    document.body.addEventListener('touchend', this.touchEndListener = (e) =>
    {
      endX = e.changedTouches[0].clientX;
      endY = e.changedTouches[0].clientY;
      handleSwipe.call(this);
    });


    function handleSwipe()
    {

      if (this.gameOver && !this.gameWon)
        return;

      let direction;

      const deltaX = endX - startX;
      const deltaY = endY - startY;
      const minSwipeDistance = 30;

      if (Math.abs(deltaX) > Math.abs(deltaY))
      {
        // Horizontal swipe
        if (Math.abs(deltaX) > minSwipeDistance)
        {
          if (deltaX > 0)
          {
            direction = 'right';
          }
          else
          {
            direction = 'left';
          }
        }
      }
      else
      {
        // Vertical swipe
        if (Math.abs(deltaY) > minSwipeDistance)
        {
          if (deltaY > 0)
          {
            direction = 'down';
          }
          else
          {
            direction = 'up';
          }
        }
      }

      if (direction)
      {
        this.move(direction);
      }
    }
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


  createTileElement(tile, isUndoAnimation = false)
  {
    const tileElement = document.createElement('div');
    tileElement.id = `tile-${tile.id}`;
    tileElement.className = `tile tile-${tile.value}`;

    const tileBlur = document.createElement('div');
    tileBlur.className = 'tile-blur';
    tileElement.appendChild(tileBlur);

    if (tile.isNew || isUndoAnimation)
    {
      tileElement.classList.add('tile-new');
    }

    const { left, top } = this.getTileElementPosition(tile);
    tileElement.style.left = left + '%';
    tileElement.style.top = top + '%';
    const tileTextNode = document.createTextNode(tile.value);
    tileElement.prepend(tileTextNode);

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
    if (!this.isInputAllowed())
    {
      return;
    }

    let moved = false;
    // Clear previous tiles to remove
    this.tilesToRemove = [];

    // Save current state before making a move
    this.saveGameState();

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
      this.moveCount++;

      //disallow input during animation
      this.allowInput = false;

      // animate to new positions
      this.animateTiles();

      const animationTimeSpawn = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--ANIMATION-TIME-SPAWN')) * 1000;

      // check game state and add tile
      setTimeout(() =>
      {
        this.allowInput = true;

        // Remove tiles that were marked for removal after animation
        this.cleanupRemovedTiles();

        this.addNewTile();

        if (!this.gameWon && this.hasWon())
        {
          this.gameWon = true;
          setTimeout(() =>
          {
            this.showGameWon();
          }, animationTimeSpawn);
        }

        else if (this.isGameOver())
        {
          this.gameOver = true;

          //to allow new tile to spawn
          setTimeout(() =>
          {
            this.showGameOver();
          }, animationTimeSpawn);
        }

      }, this.animationTimeMove);
    }
    else 
    {
      // If no move was made, remove the saved state
      this.gameStates.pop();
      this.canUndo = this.gameStates.length > 0 && this.undoRemaining > 0;
      this.updateUndoButton();
    }

  }

  // New method to clean up tiles after animation
  cleanupRemovedTiles()
  {
    this.tilesToRemove.forEach(tileId =>
    {
      const tileElement = document.querySelector(`#tile-${tileId}`);
      if (tileElement)
      {
        tileElement.remove();
      }
      this.tiles.delete(tileId);
    });
    this.tilesToRemove = [];
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

          // Mark the merged tile for removal AFTER animation
          const tileToRemoveId = row[i + 1].id;
          this.tilesToRemove.push(tileToRemoveId);

          // Update the removed tile's position for animation
          const tileToRemove = this.tiles.get(tileToRemoveId);
          if (tileToRemove)
          {
            tileToRemove.row = r;
            tileToRemove.col = col;
          }

          // move the z-index back
          const tileToRemoveElement = document.querySelector(`#tile-${tileToRemoveId}`);

          if (tileToRemoveElement)
          {
            // initially it is 1
            tileToRemoveElement.style.zIndex = 0;
          }

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

          // Mark the merged tile for removal AFTER animation
          const mergedTileId = row[i - 1].id;
          this.tilesToRemove.push(mergedTileId);

          // Update the merged tile's position for animation
          const mergedTileToAnimate = this.tiles.get(mergedTileId);
          if (mergedTileToAnimate)
          {
            mergedTileToAnimate.row = r;
            mergedTileToAnimate.col = col;
          }

          // move the z-index back
          const mergedTileElement = document.querySelector(`#tile-${mergedTileId}`);

          if (mergedTileElement)
          {
            // initially it is 1
            mergedTileElement.style.zIndex = 0;
          }

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

          // Mark the merged tile for removal AFTER animation
          const mergedTileId = col[i + 1].id;
          this.tilesToRemove.push(mergedTileId);

          // Update the merged tile's position for animation
          const mergedTileToAnimate = this.tiles.get(mergedTileId);
          if (mergedTileToAnimate)
          {
            mergedTileToAnimate.row = row;
            mergedTileToAnimate.col = c;
          }

          // move the z-index back
          const mergedTileElement = document.querySelector(`#tile-${mergedTileId}`);

          if (mergedTileElement)
          {
            // initially it is 1
            mergedTileElement.style.zIndex = 0;
          }

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

          // Mark the merged tile for removal AFTER animation
          const mergedTileId = col[i - 1].id;
          this.tilesToRemove.push(mergedTileId);

          // Update the merged tile's position for animation
          const mergedTileToAnimate = this.tiles.get(mergedTileId);
          if (mergedTileToAnimate)
          {
            mergedTileToAnimate.row = row;
            mergedTileToAnimate.col = c;
          }


          // move the z-index back
          const mergedTileElement = document.querySelector(`#tile-${mergedTileId}`);

          if (mergedTileElement)
          {
            // initially it is 1
            mergedTileElement.style.zIndex = 0;
          }

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
    let currScoreElement = document.querySelector(`.current-score-container .score`);
    currScoreElement.textContent = this.score;


    if (this.score > this.best)
    {
      this.best = this.score;
      this.setBestScoreInStorage();
    }

    let bestScoreElement = document.querySelector(`.best-score-container .score`)
    bestScoreElement.textContent = this.best;
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

        // calculate the position
        const leftInitial = parseFloat(tileElement.style.left);
        const topInitial = parseFloat(tileElement.style.top);
        const { left, top } = this.getTileElementPosition(tile);

        this.animateTile(tileElement, leftInitial, left, topInitial, top);

        // add merge class to merged tiles
        if (tile.merged)
        {
          // only change the number not the tileBlur div
          tileElement.firstChild.textContent = tile.value;
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
    showPopup(popupGameWon);
  }


  showGameOver()
  {
    const popupScore = popupGameOver.querySelector('.score');
    const popupMoveCount = popupGameOver.querySelector('.move-count');
    popupScore.textContent = this.score;
    popupMoveCount.textContent = this.moveCount;
    showPopup(popupGameOver);
  }


  // *UNDO Powerup

  saveGameState()
  {
    const gameState = {
      grid: this.deepCopyGrid(),
      tiles: this.deepCopyTiles(),
      score: this.score,
      gameWon: this.gameWon,
      gameOver: this.gameOver,
      tileId: this.tileId
    };

    this.gameStates.push(gameState);

    // Limit the number of stored states
    if (this.gameStates.length > this.maxUndoStates)
    {
      this.gameStates.shift();
    }

    this.canUndo = this.undoRemaining > 0;
    this.updateUndoButton();
  }


  deepCopyGrid()
  {
    return this.grid.map(row =>
      row.map(tile => tile ? { ...tile } : null)
    );
  }


  deepCopyTiles()
  {
    const tilesCopy = new Map();
    this.tiles.forEach((tile, id) =>
    {
      tilesCopy.set(id, { ...tile });
    });
    return tilesCopy;
  }


  undo()
  {
    if (!this.canUndo || this.gameStates.length === 0 || !this.isInputAllowed() || this.isSwaping)
    {
      return;
    }

    this.moveCount--;
    this.undoRemaining--;
    this.allowInput = false;

    const previousState = this.gameStates.pop();

    // Store current tiles for animation
    const currentTiles = new Map(this.tiles);

    // Restore previous state
    this.grid = previousState.grid;
    this.tiles = previousState.tiles;
    this.score = previousState.score;
    this.gameWon = previousState.gameWon;
    this.gameOver = previousState.gameOver;
    this.tileId = previousState.tileId;

    // Update UI immediately for score
    this.updateDisplay();

    // Animate tiles back to their previous positions
    this.animateUndo(currentTiles);

    // Update undo button state
    this.canUndo = this.gameStates.length > 0 && this.undoRemaining > 0;
    this.updateUndoButton();

    setTimeout(() =>
    {
      this.allowInput = true;
    }, this.animationTimeMove);
  }


  animateUndo(currentTiles)
  {
    // Remove the newly spawned tile
    for (const id of currentTiles.keys())
    {
      if (!this.tiles.has(id))
      {
        const tileElement = document.querySelector(`#tile-${id}`);
        if (tileElement)
        {
          // Animate tile disappearing
          tileElement.animate(
            {
              transform: ['scale(1)', 'scale(0)'],
              opacity: ['1', '0']
            },
            {
              duration: this.animationTimeMove / 2,
              fill: 'forwards'
            }
          ).finished.then(() =>
          {
            tileElement.remove();
          });
        }

        break;
      }
    }

    // creat tiles that got merged
    this.tiles.forEach((tile, id) =>
    {
      if (!currentTiles.has(id))
      {
        this.createTileElement(tile, true); // true for undo animation
      }
    });

    // Animate existing tiles to their previous positions
    this.tiles.forEach((tile, id) =>
    {
      if (currentTiles.has(id))
      {
        const tileElement = document.querySelector(`#tile-${id}`);
        if (tileElement)
        {
          const currentTile = currentTiles.get(id);
          const { left: newLeft, top: newTop } = this.getTileElementPosition(tile);
          const { left: oldLeft, top: oldTop } = this.getTileElementPosition(currentTile);

          // Update tile value and class if it changed
          if (tile.value !== currentTile.value)
          {
            tileElement.textContent = tile.value;
            tileElement.className = `tile tile-${tile.value}`;
          }

          this.animateTile(tileElement, oldLeft, newLeft, oldTop, newTop);
        }
      }
    });
  }

  updateUndoButton()
  {
    const undoBtn = document.querySelector('.undo-btn');
    const undoBtnCount = undoBtn.querySelector('.undo-btn__count');

    if (undoBtn)
    {
      const disable = !this.canUndo || this.isSwaping;
      undoBtn.disabled = disable;
      undoBtn.style.opacity = !disable ? '1' : '0.5';
    }

    if (undoBtnCount)
    {
      undoBtnCount.textContent = this.undoRemaining;
    }
  }



  // *Shuffle Powerup

  shuffleTiles()
  {
    if (!this.shuffleRemaining > 0 || this.isSwaping || !this.isInputAllowed())
    {
      return;
    }

    this.saveGameState();

    this.moveCount++;

    // array of all empty spots
    let emptySpots = Array(this.BOARD_SIZE * this.BOARD_SIZE).fill().map((_, idx) => idx);

    let newGrid = Array(this.BOARD_SIZE).fill().map(() => Array(this.BOARD_SIZE).fill(null));

    this.tiles.forEach(tile => 
    {
      let randomIdx = emptySpots[Math.floor(Math.random() * emptySpots.length)];

      let row = Math.floor(randomIdx / this.BOARD_SIZE);
      let col = randomIdx % this.BOARD_SIZE;

      tile.row = row;
      tile.col = col;

      newGrid[row][col] = tile;

      let indexToRemove = emptySpots.indexOf(randomIdx);
      emptySpots.splice(indexToRemove, 1);
    }
    )

    this.animateTiles();
    this.grid = newGrid;

    this.shuffleRemaining--;
    this.updateShuffleButton();
  }


  updateShuffleButton()
  {
    const shuffleBtn = document.querySelector('.shuffle-btn');
    const shuffleBtnCount = shuffleBtn.querySelector('.shuffle-btn__count');

    if (shuffleBtn)
    {
      const disable = (!(this.shuffleRemaining > 0) || this.isSwaping);
      shuffleBtn.disabled = disable;
      shuffleBtn.style.opacity = !disable ? '1' : '0.5';
    }

    if (shuffleBtnCount)
    {
      shuffleBtnCount.textContent = this.shuffleRemaining;
    }
  }


  // * Swap Powerup


  swapTiles()
  {
    if (!this.swapRemaining > 0 || this.isSwaping)
    {
      return;
    }

    this.enterSwapMode();
  }

  updateSwapButton()
  {
    const swapBtn = document.querySelector('.swap-btn');
    const swapBtnCount = swapBtn.querySelector('.swap-btn__count');

    if (swapBtn)
    {
      swapBtn.disabled = !(this.swapRemaining > 0);
      swapBtn.style.opacity = this.swapRemaining > 0 ? '1' : '0.5';
    }

    if (swapBtnCount)
    {
      swapBtnCount.textContent = this.swapRemaining;
    }
  }


  enterSwapMode()
  {
    this.saveGameState();

    this.isSwaping = true;
    this.updateShuffleButton();
    this.updateUndoButton();

    // show popup and hide score wrapper 
    swapPopup.removeEventListener('transitionend', this.swapPopupDisapperListener);
    swapPopup.style.visibility = 'visible';
    swapPopup.style.top = swapPopupTop;
    const scoreWrapper = document.querySelector('.score-wrapper');
    scoreWrapper.style.visibility = 'hidden';

    // visual changes
    document.querySelectorAll('.tile-blur').forEach(tileBlur =>
    {
      tileBlur.style.visibility = 'visible';
    });

    this.tiles.forEach(tile =>
    {
      const tileElement = board.querySelector(`#tile-${tile.id}`);
      tileElement.addEventListener('mouseenter', this.scaleUpTile_Swap);
      tileElement.addEventListener('mouseleave', this.scaleDownTile_Swap);
      let eventlistener;
      tileElement.addEventListener('click', eventlistener = (e) => this.selectTile_Swap.call(this, e));
      this.tileEventListeners.set(tileElement, eventlistener);
    })
  }

  exitSwapMode()
  {
    this.isSwaping = false;
    this.updateShuffleButton();
    this.updateUndoButton();

    // remove popup and show score wrapper 
    swapPopup.style.top = swapPopupMoveAmount;

    swapPopup.addEventListener('transitionend', this.swapPopupDisapperListener = () =>
    {
      // reset popup
      swapPopup.style.visibility = 'hidden';
      const popupTextDiv = swapPopup.querySelector('.swap-popup__text .description');
      popupTextDiv.textContent = "Choose the first tile";
      const scoreWrapper = document.querySelector('.score-wrapper');
      scoreWrapper.style.visibility = 'visible';
    });

    document.querySelectorAll('.tile-blur').forEach(tileBlur =>
    {
      tileBlur.style.visibility = 'hidden';
    });

    this.tiles.forEach(tile =>
    {
      const tileElement = board.querySelector(`#tile-${tile.id}`);
      tileElement.removeEventListener('mouseenter', this.scaleUpTile_Swap);
      tileElement.removeEventListener('mouseleave', this.scaleDownTile_Swap);
      if (this.tileEventListeners.has(tileElement))
      {
        tileElement.removeEventListener('click', this.tileEventListeners.get(tileElement));
        this.tileEventListeners.delete(tileElement);
      }
    });

    this.tileEventListeners.clear();

    // reset first tile if selected 
    if (this.firstTile_Swap)
    {
      this.firstTile_Swap.style.transform = 'scale(1)';
    }

    // remove popup event listener 
    if (this.swapPopupChangeListener)
    {
      swapPopup.removeEventListener('transitionend', this.swapPopupChangeListener);
    }

    this.firstTile_Swap = null;
    this.secondTile_Swap = null;

    this.updateSwapButton();
  }

  scaleUpTile_Swap(eventArgs)
  {
    eventArgs.target.style.transform = 'scale(1.1)';
  }

  scaleDownTile_Swap(eventArgs)
  {
    eventArgs.target.style.transform = 'scale(1)';
  }

  selectTile_Swap(eventArgs)
  {
    const tileElement = eventArgs.currentTarget;

    if (!this.firstTile_Swap)
    {
      this.firstTile_Swap = tileElement;

      //remove event listeners 
      tileElement.removeEventListener('mouseenter', this.scaleUpTile_Swap);
      tileElement.removeEventListener('mouseleave', this.scaleDownTile_Swap);
      tileElement.removeEventListener('click', this.tileEventListeners.get(tileElement));

      this.tileEventListeners.delete(tileElement);

      // remove blur
      tileElement.querySelector('.tile-blur').style.visibility = 'hidden';
      tileElement.style.transform = 'scale(1.1)';

      swapPopup.style.top = swapPopupMoveAmount;

      // change popup text
      swapPopup.addEventListener('transitionend', this.swapPopupChangeListener = () => 
      {
        const popupTextDiv = swapPopup.querySelector('.swap-popup__text .description');
        popupTextDiv.textContent = "Choose the second tile";
        swapPopup.style.top = swapPopupTop;
      })
    }

    else
    {
      this.swapRemaining--;
      this.secondTile_Swap = tileElement;

      //remove event listeners 
      tileElement.removeEventListener('mouseenter', this.scaleUpTile_Swap);
      tileElement.removeEventListener('mouseleave', this.scaleDownTile_Swap);
      tileElement.removeEventListener('click', this.tileEventListeners.get(tileElement));


      this.tileEventListeners.delete(tileElement);

      // remove blur
      tileElement.querySelector('.tile-blur').style.visibility = 'hidden';
      tileElement.style.transform = 'scale(1.1)';

      // update the grid and tiles Map
      const firstTileId = parseInt(this.firstTile_Swap.id.split("-")[1]);
      const secondTileId = parseInt(this.secondTile_Swap.id.split("-")[1]);
      const firstTile = this.tiles.get(firstTileId);
      const secondTile = this.tiles.get(secondTileId);

      const rowFirstTile = firstTile.row;
      const colFirstTile = firstTile.col;

      firstTile.row = secondTile.row;
      firstTile.col = secondTile.col;
      this.grid[secondTile.row][secondTile.col] = firstTile;

      secondTile.row = rowFirstTile;
      secondTile.col = colFirstTile;
      this.grid[rowFirstTile][colFirstTile] = secondTile;

      this.tiles.set(firstTileId, firstTile);
      this.tiles.set(secondTileId, secondTile);


      // animate the tile and exit swap mode 
      const animation = this.animateSwap(this.firstTile_Swap, this.secondTile_Swap);
      this.exitSwapMode();
    }
  }

  animateSwap(firstTile_Swap, secondTile_Swap)
  {
    const firstTileInitialTop = parseFloat(firstTile_Swap.style.top);
    const firstTileInitialLeft = parseFloat(firstTile_Swap.style.left);
    const secondTileInitialTop = parseFloat(secondTile_Swap.style.top);
    const secondTileInitialLeft = parseFloat(secondTile_Swap.style.left);

    firstTile_Swap.style.transform = 'scale(1)';
    secondTile_Swap.style.transform = 'scale(1)';


    this.animateTile(firstTile_Swap, firstTileInitialLeft, secondTileInitialLeft, firstTileInitialTop, secondTileInitialTop);
    return this.animateTile(secondTile_Swap, secondTileInitialLeft, firstTileInitialLeft, secondTileInitialTop, firstTileInitialTop);
  }

  cancelSwap()
  {
    // If no swap was made, remove the saved state
    this.gameStates.pop();
    this.canUndo = this.gameStates.length > 0 && this.undoRemaining > 0;
    this.updateUndoButton();

    this.exitSwapMode();
  }
}




