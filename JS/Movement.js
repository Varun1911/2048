import {moveTile} from "./UI.js";

export function slideLeft(board)
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

    moveTile(board);
    return board;

}


export function slideRight(board)
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

    moveTile(board);
    return board;
}


export function slideUp(board)
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

    moveTile(board);
    return board;
}


export function slideDown(board)
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

    moveTile(board);
    return board;
}
