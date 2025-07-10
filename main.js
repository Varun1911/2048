import Game2048 from "./game2048.js";
import { showPopup, hidePopup, allowNewBtnClick } from "./helper.js";

// dom elements
const popupGridSelection = document.querySelector('.grid-selection-popup');
const popupGameOver = document.querySelector('.game-over-popup');
const popupGameWon = document.querySelector('.game-won-popup');
const popupNewGame = document.querySelector('.new-game-popup');
const btnNewGame = document.querySelector('.new-game-btn');


//variables
let game;
let board_size;

//helper functions
function startGame(size)
{
    board_size = size;
    if (game)
    {
        game.dispose();
        game = null;
    }
    game = new Game2048(size);
}


// main functions
function setupEventListeners()
{
    // grid selection popup
    popupGridSelection.addEventListener('click', (e) => 
    {

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
        }
    });

    // new game popup
    popupNewGame.addEventListener('click', (e) => 
    {
        // to prevent closing the menu if button is not clicked
        if (e.target.closest('.menu-popup__btn'))
        {
            hidePopup(popupNewGame);
        }

        if (e.target.closest('.yes-btn'))
        {
            showPopup(popupGridSelection);
        }
    });

    //game won popup
    popupGameWon.addEventListener('click', (e) => 
    {

        // to prevent closing the menu if button is not clicked
        if (e.target.closest('.menu-popup__btn'))
        {
            hidePopup(popupGameWon);
        }

        if (e.target.closest('.new-game-btn-popup'))
        {
            showPopup(popupGridSelection);
        }
    });

    //game over popup
    popupGameOver.addEventListener('click', (e) => 
    {

        // to prevent closing the menu if button is not clicked
        if (e.target.closest('.menu-popup__btn'))
        {
            hidePopup(popupGameOver);
        }

        if (e.target.closest('.retry-btn'))
        {
            startGame(board_size);
        }

        else if (e.target.closest('.choose-grid-btn'))
        {
            showPopup(popupGridSelection);
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

document.addEventListener("DOMContentLoaded", () =>
{
    document.body.classList.remove("preload");
    // document.querySelector('.loader').remove();
    startGame(4);
    setupEventListeners();
    showPopup(popupGridSelection);
    // to play the loader for min 1.5s
    // setTimeout(() =>
    // {
    //     document.body.classList.remove("preload");
    //     // document.querySelector('.loader').remove();
    //     startGame(4);
    //     setupEventListeners();
    //     showPopup(popupGridSelection);
    // }, 1000);
})
