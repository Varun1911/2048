export function createBoardUI(size)
{
    const board = document.querySelector('.board');


    // * Dynamic board size == 

    //4x4 size = 90px
    //reduce by 10px on increasing size
    let tileSize = 90 - 17 * (size - 4);
    const root = document.documentElement;
    root.style.setProperty('--TILE-SIZE', `${tileSize}px`);

    //base paading - extra size
    let padding = 5 - (size - 4);
    root.style.setProperty('--PADDING-BOARD', `${padding}px`);


    //grid templates
    board.style.gridTemplateColumns = `repeat(${size}, calc(var(--TILE-SIZE) + var(--PADDING-BOARD) * 2))`;
    board.style.gridTemplateRows = `repeat(${size}, calc(var(--TILE-SIZE) + var(--PADDING-BOARD) * 2))`;


    for (let i = 0; i < size; i++)
    {
        for (let j = 0; j < size; j++)
        {
            const tile = document.createElement('div');
            tile.className = `tile-container tile-container-${i}-${j} inner-shadow`;
            board.appendChild(tile);
        }
    }
}


export function createTileUI(parent, number)
{
    const tile = document.createElement('div');

    tile.addEventListener('animationend', () =>
    {
        tile.textContent = number;
    });

    parent.appendChild(tile);
    tile.className = `tile tile-${number}`;
}



export function moveTiles(moves)
{
    // * Structure

    // moves[idx] =
    // {
    //     number: board[i][j],
    //     from: {row: i, col: j},
    //     to: {row: i, col: j - c},
    //     merge: toMerge
    // };

    moves.forEach((item) =>
    {
        if (!item || item === -1)
        {
            return;
        }

        const currRow = item.from.row;
        const currCol = item.from.col;
        const newRow = item.to.row;
        const newCol = item.to.col;

        const currParent = document.querySelector(`.tile-container-${currRow}-${currCol}`);
        const newParent = document.querySelector(`.tile-container-${newRow}-${newCol}`);
        const tile = currParent.querySelector('.tile');

        moveTile(tile, currParent, newParent);

        if (item.merge)
        {
            const tileToDelete = document.querySelector(`.tile-container-${newRow}-${newCol} .tile`);
            mergeTiles(tile, tileToDelete, item.number)
        }
    });
}


function moveTile(tile, currParent, newParent)
{
    // get rects
    const oldRect = currParent.getBoundingClientRect();
    const newRect = newParent.getBoundingClientRect();

    // to positions 
    const newLeft = Math.round(newRect.left - oldRect.left);
    const newTop = Math.round(newRect.top - oldRect.top);

    // console.log({newLeft, newTop});

    // current positions
    const prevLeft = tile.offsetLeft;
    const pervTop = tile.offsetTop;

    // console.log({currLeft, currTop});

    // tile.style.left = newLeft;

    tile.style.left = `${newLeft}px`;
    tile.style.top = `${newTop}px`;

    tile.addEventListener('transitionend', () =>
    {
        newParent.appendChild(tile);
        tile.style.left = `${prevLeft}px`
        tile.style.top = `${pervTop}px`
        console.log(tile.textContent);
        // void tile.offsetWidth;
    });
}


function mergeTiles(tileToChange, tileToDelete, number)
{
    console.log(tileToChange, tileToDelete);
    tileToChange.classList.add(`tile-${number * 2}`);
    tileToChange.classList.remove(`tile-${number}`);
    tileToChange.textContent = number * 2;
    tileToDelete.remove();

}