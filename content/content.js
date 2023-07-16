function addHideButtons() {
    document.querySelectorAll('.browse-card').forEach((item) => {
        // Skip if the hide button has already been added
        if (item.querySelector('.hide-button')) return;

        const animeName = item.querySelector('[class^="browse-card-hover__title-link"]').textContent;
        const hideButton = document.createElement('button');
        const imagePath = 'data:image/png;base64,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';
        hideButton.innerHTML = `<img alt="hide" width="32px" height="32px" src="${imagePath}" />`;
        hideButton.className = 'hide-button';
        hideButton.addEventListener('click', () => {
            item.setAttribute('hidden', '');
            chrome.storage.local.set({[animeName]: true});
        });
        item.querySelector('.browse-card-hover__footer--oK4Wg').appendChild(hideButton);

        // On page load, hide previously hidden animes
        chrome.storage.local.get([animeName], (result) => {
            if (result[animeName]) {
                item.setAttribute('hidden', '');
            }
        });
    });
}

setTimeout(function() {
// Run addHideButtons immediately on page load
    addHideButtons();
}, 1000);  // Wait for 1 second

// Then set up a MutationObserver to run addHideButtons when the DOM changes
const observer = new MutationObserver(addHideButtons);
observer.observe(document.body, {childList: true, subtree: true});

