// Get the hidden animes list and display it
chrome.storage.local.get(null, (items) => {
    const hiddenAnimes = Object.keys(items).filter((key) => items[key]);
    const hiddenAnimesList = document.getElementById('hidden-animes-list');

    // Update the title to include the number of hidden animes
    const title = document.getElementById('title');
    title.textContent = `Ausgeblendete Animes (${hiddenAnimes.length})`;

    hiddenAnimes.forEach((animeName) => {
        const animeDiv = document.createElement('div');
        animeDiv.className = 'anime';
        
        const animeNameSpan = document.createElement('span');
        animeNameSpan.textContent = animeName;
        animeNameSpan.className = 'anime-name';
        animeDiv.appendChild(animeNameSpan);

        const unhideButton = document.createElement('button');
        unhideButton.textContent = 'Einblenden';
        unhideButton.addEventListener('click', () => {
            // Remove this anime from the hidden list
            chrome.storage.local.remove(animeName, () => {
                // Remove this anime from the popup
                animeDiv.remove();

                // Refresh the current tab
                chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
                    chrome.tabs.reload(tabs[0].id);
                });

                // Update the title to decrease the number of hidden animes
                title.textContent = `Ausgeblendete Animes (${hiddenAnimes.length - 1})`;
            });
        });
        animeDiv.appendChild(unhideButton);

        hiddenAnimesList.appendChild(animeDiv);
    });
});

document.getElementById('export').addEventListener('click', () => {
    // Get all hidden animes
    chrome.storage.local.get(null, (items) => {
        const hiddenAnimes = Object.keys(items).filter((key) => items[key]);

        // Create a blob with the data
        const blob = new Blob([JSON.stringify(hiddenAnimes)], {type: 'application/json'});

        // Create a link and click it to start the download
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'hiddenAnimes.json';
        link.click();
    });
});

document.getElementById('import').addEventListener('click', () => {
    document.getElementById('file-input').click();
});

document.getElementById('file-input').addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (!file) {
        return;
    }

    // Read the file
    const reader = new FileReader();
    reader.onload = (event) => {
        const hiddenAnimes = JSON.parse(event.target.result);

        // Store the imported animes
        const items = {};
        for (const anime of hiddenAnimes) {
            items[anime] = true;
        }
        chrome.storage.local.set(items, () => {
            // Refresh the current tab
            chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
                chrome.tabs.reload(tabs[0].id);
            });

            // Refresh the popup
            window.location.reload();
        });
    };
    reader.readAsText(file);
});