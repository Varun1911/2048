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
      board[i][j] = Math.random() < 0.9 ? 2 : 4;
    }
  }


  function slideLeft(board)
  {
    for (let i = 0; i < board.length; i++)
    {
      const row = board[i];

      let newRow = row.filter((val) => val !== 0);

      for (let j = 0; j < newRow.length - 1; j++)
      {
        if (newRow[j] === newRow[j + 1])
        {
          newRow[j] *= 2;
          newRow[j + 1] = 0;
        }
      }

      newRow = newRow.filter((val) => val !== 0);

      while (newRow.length < board.length)
      {
        newRow.push(0);
      }


      board[i] = newRow;

    }
    return board;
  }


  function slideRight(board)
  {
    for (let i = 0; i < board.length; i++)
    {
      const row = board[i];

      let newRow = row.filter((val) => val !== 0);

      for (let j = newRow.length - 1; j > 0; j--)
      {
        if (newRow[j] === newRow[j - 1])
        {
          newRow[j] *= 2;
          newRow[j - 1] = 0;
        }
      }

      newRow = newRow.filter((val) => val !== 0);

      while (newRow.length < board.length)
      {
        newRow.unshift(0);
      }

      board[i] = newRow;
    }
    return board;
  }


  function slideUp(board)
  {
    for (let j = 0; j < board[0].length; j++)
    {
      const col = board.map(row => row[j]);

      let newCol = col.filter((val) => val !== 0);

      for (let i = 0; i < newCol.length - 1; i++)
      {
        if (newCol[i] === newCol[i + 1])
        {
          newCol[i] *= 2;
          newCol[i + 1] = 0;
        }
      }

      newCol = newCol.filter((val) => val !== 0);

      while (newCol.length < board[0].length)
      {
        newCol.push(0);
      }

      newCol.forEach((val, rowIdx) =>
      {
        board[rowIdx][j] = val;
      });
    }
    return board;
  }


  function slideDown(board)
  {
    for (let j = 0; j < board[0].length; j++)
    {
      const col = board.map(row => row[j]);

      let newCol = col.filter((val) => val !== 0);

      for (let i = newCol.length - 1; i > 0; i--)
      {
        if (newCol[i] === newCol[i - 1])
        {
          newCol[i] *= 2;
          newCol[i - 1] = 0;
        }
      }

      newCol = newCol.filter((val) => val !== 0);

      while (newCol.length < board[0].length)
      {
        newCol.unshift(0);
      }

      newCol.forEach((val, rowIdx) =>
      {
        board[rowIdx][j] = val;
      });
    }

    return board;
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

  function createUI(size)
  {
    const board = document.querySelector('.board');

    for (let i = 0; i < size; i++)
    {
      const row = document.createElement('div');
      row.className = `row row${i}`;
      board.appendChild(row);

      for (let j = 0; j < size; j++)
      {
        const col = document.createElement('div');
        col.className = `col row${i}-col${j}`;
        row.appendChild(col);
      }
    }
  }

  function updateUI(board)
  {
    for (let i = 0; i < size; i++)
    {
      for (let j = 0; j < size; j++)
      {
        let tile = document.querySelector(`.row${i}-col${j}`);
        tile.textContent = board[i][j] !== 0 ? board[i][j] : '';
        // tile.className = `tile tile-${board[r][c]}`; // for styling
      }
    }
  }


  function onPlayerInput()
  {
    addNewNumber(board);
    updateUI(board);
    if (isGameOver(board))
      alert('Game Over!')
  }


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


  let board = createBoard(size);
  initializeBoard(board);
  createUI(size);
  updateUI(board);
})();