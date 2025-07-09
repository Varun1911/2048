const btnNewGame = document.querySelector('.new-game-btn');
let allowNewBtnClick;
let isPopupOpened = true;

function showPopup(popup)
{
    isPopupOpened = true;
    setNewBtnState(false);
    popup.classList.add('show-menu-popup');
}

function hidePopup(popup)
{
    isPopupOpened = false;
    setNewBtnState(true);
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


export {showPopup, hidePopup, allowNewBtnClick, isPopupOpened};