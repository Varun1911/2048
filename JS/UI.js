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



export function moveTile(currParent, newParent)
{
    for (let i = 0; i < size; i++)
    {
        for (let j = 0; j < size; j++)
        {
            // let tile = document.querySelector(`.tile-container${i}-${j}`);
            // tile.textContent = board[i][j] !== 0 ? board[i][j] : '';
            // tile.className = `tile tile-${board[r][c]}`; // for styling
        }
    }
}