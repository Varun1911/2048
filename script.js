import {slideLeft, slideRight, slideUp, slideDown} from "./JS/Movement.js";
import {createBoardUI, createTileUI} from "./JS/UI.js";

(function IIFE()
{
  const size = 4;

  function createBoard(size)
  {
    const board = Array.from({length: size}, () => Array(size).fill(0));
    return board;
  }


  function initializeBoard(board) 
  {
    addNewNumber(board);
    addNewNumber(board);
  }


  function addNewNumber(board)
  {
    let emptyCells = [];

    for (let i = 0; i < board.length; i++)
    {
      for (let j = 0; j < board[0].length; j++)
      {
        if (board[i][j] === 0)
        {
          emptyCells.push({i, j});
        }
      }
    }

    if (emptyCells.length > 0)
    {
      let {i, j} = emptyCells[Math.floor(Math.random() * emptyCells.length)];
      const number = Math.random() < 0.9 ? 2 : 4;
      board[i][j] = number
      const parent = document.querySelector(`.tile-container-${i}-${j}`)
      createTileUI(parent, number);
    }

  }




  function isGameOver(board)
  {
    for (let i = 0; i < board.length; i++)
    {
      for (let j = 0; j < board[i].length; j++)
      {
        if (board[i][j] === 0) return false;
        if ((i < board.length - 1) && (board[i][j] === board[i + 1][j])) return false;
        if ((j < board[0].length - 1) && (board[i][j] === board[i][j + 1])) return false;
      }
    }

    return true;
  }


  function onPlayerInput()
  {
    addNewNumber(board);
    if (isGameOver(board))
      alert('Game Over!')
  }


  function handleInput()
  {
    document.addEventListener('keydown', (e) =>
    {
      switch (e.key)
      {
        case 'ArrowLeft': board = slideLeft(board); break;
        case 'ArrowRight': board = slideRight(board); break;
        case 'ArrowUp': board = slideUp(board); break;
        case 'ArrowDown': board = slideDown(board); break;
      }

      onPlayerInput();
    })
  }


  let board = createBoard(size);
  createBoardUI(size);

  //set timeout so that the first animation plays
  setTimeout(() =>
  {
    initializeBoard(board);
    handleInput();
  }, 500);
})();