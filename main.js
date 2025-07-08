import Game2048 from "./game2048.js";

// dom elements
const popupGridSelection = document.querySelector('.grid-selection-popup');
const popupGameOver = document.querySelector('.game-over-popup');
const popupGameWon = document.querySelector('.game-won-popup');
const popupNewGame = document.querySelector('.new-game-popup');
const btnRetry = popupGameOver.querySelector('.menu-popup__btn-1');
const btnChooseGrid = popupGameOver.querySelector('.menu-popup__btn-2');
const btnContinue = popupGameWon.querySelector('.menu-popup__btn-1');
const btnNewGamePopup = popupGameWon.querySelector('.menu-popup__btn-2');
const btnYes = popupNewGame.querySelector('.menu-popup__btn-1');
const btnCancel = popupNewGame.querySelector('.menu-popup__btn-2');
const btnNewGame = document.querySelector('.new-game-btn');


//variables
let game;
let board_size;
let allowNewBtnClick;

//helper functions
function showPopup(popup)
{
    popup.classList.add('show-menu-popup');
}

function hidePopup(popup)
{
    popup.classList.remove('show-menu-popup');
    popup.classList.add('hide-menu-popup');

    popup.addEventListener('animationend', () =>
    {
        popup.classList.remove('hide-menu-popup');
    }, {once: true});
}


function setNewBtnState(state)
{
    if (state)
    {
        btnNewGame.style.opacity = 1;
    }

    else
    {
        btnNewGame.style.opacity = 0.8;
    }

    allowNewBtnClick = state;
}

// main functions
function setupEventListeners()
{

    // grid selection popup
    popupGridSelection.addEventListener('click', (e) => 
    {
        setNewBtnState(false);

        if (e.target.closest('.grid-4x4-btn'))
        {
            startGame(4);
        }

        else if (e.target.closest('.grid-5x5-btn'))
        {
            startGame(5);
        }

        // to prevent closing the menu if button is not clicked
        if (e.target.closest('.menu-popup__btn'))
        {
            hidePopup(popupGridSelection);
            setNewBtnState(true);
        }
    });

    // new game btn
    btnNewGame.addEventListener('click', () =>
    {
        if (allowNewBtnClick)
        {
            showPopup(popupNewGame);
        }
    })
}


function startGame(size)
{
    board_size = size;
    game = new Game2048(size);
}

; (() =>
{
    startGame(4);
    setNewBtnState(false);
    setupEventListeners();
    showPopup(popupGridSelection);
})();