const btnNewGame = document.querySelector('.new-game-btn');
const bgBlur = document.querySelector('.bg-blur');
let isPopupOpened = true;

function showPopup(popup)
{
    isPopupOpened = true;
    bgBlur.classList.remove('hide');
    popup.classList.add('show-menu-popup');
}

function hidePopup(popup)
{
    isPopupOpened = false;
    bgBlur.classList.add('hide');
    popup.classList.remove('show-menu-popup');
    popup.classList.add('hide-menu-popup');

    popup.addEventListener('animationend', () =>
    {
        popup.classList.remove('hide-menu-popup');
    }, { once: true });
}


export { showPopup, hidePopup, isPopupOpened };