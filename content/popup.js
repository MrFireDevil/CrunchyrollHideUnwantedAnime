let currentPage = 0;
const itemsPerPage = 6;

// Get the hidden animes list and display it
chrome.storage.local.get(null, (items) => {
    let hiddenAnimes = Object.keys(items).filter((key) => items[key]);

    const searchInput = document.getElementById('search-input');
    const prevPageButton = document.getElementById('prev-page');
    const nextPageButton = document.getElementById('next-page');
    const hiddenAnimesList = document.getElementById('hidden-animes-list');
    const title = document.getElementById('title');

    function updateList() {
        // Clear the current list
        hiddenAnimesList.innerHTML = '';

        // Get the animes for the current page
        const animesForPage = hiddenAnimes.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage);

        // Update the page indicator
        pageIndicator.innerHTML = '';
        const totalPages = Math.ceil(hiddenAnimes.length / itemsPerPage);
        let startPage = Math.max(0, Math.min(totalPages - 5, currentPage - 2));
        for (let i = startPage; i < startPage + 5; i++) {
            const dot = document.createElement('span');
            dot.className = 'dot';
            if (i === currentPage) {
                dot.className += ' active';
            }
            pageIndicator.appendChild(dot);
        }

        // Add the animes for the current page
        animesForPage.forEach((animeName) => {
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

                    // Remove the anime from the hiddenAnimes array and update the list
                    hiddenAnimes = hiddenAnimes.filter(anime => anime !== animeName);
                    updateList();
                });
            });
        animeDiv.appendChild(unhideButton);

            hiddenAnimesList.appendChild(animeDiv);
        });

        // Enable or disable the page buttons based on the current page
        prevPageButton.disabled = currentPage === 0;
        nextPageButton.disabled = (currentPage + 1) * itemsPerPage >= hiddenAnimes.length;

        // Update the title to include the number of hidden animes
        title.textContent = `Unwanted animes (${hiddenAnimes.length})`;
    }

    // Event listener for the search input
    searchInput.addEventListener('input', (event) => {
        const searchQuery = event.target.value.toLowerCase();
        hiddenAnimes = Object.keys(items)
                              .filter((key) => items[key] && key.toLowerCase().includes(searchQuery))
                              .sort((a, b) => Math.abs(a.length - searchQuery.length) - Math.abs(b.length - searchQuery.length));
        currentPage = 0; // Reset current page
        updateList();
    });

    // Event listeners for the page buttons
    prevPageButton.addEventListener('click', () => {
        currentPage--;
        updateList();
    });

    nextPageButton.addEventListener('click', () => {
        currentPage++;
        updateList();
    });

    // Initial call to update the list
    updateList();
});

document.getElementById('export').addEventListener('click', () => {
    // Get all hidden animes
    chrome.storage.local.get(null, (items) => {
        const hiddenAnimes = Object.keys(items).filter((key) => items[key]);

        // Create a blob with the data
        const blob = new Blob([JSON.stringify(hiddenAnimes)], {type: 'application/json'});

        // Create a link and click it to start the download
        const link = document.createElement('a');
        const date = new Date().toISOString();
        link.href = URL.createObjectURL(blob);
        link.download = 'hiddenAnimes_' + date + '.json';
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

const pageIndicator = document.getElementById('page-indicator');

/* before unload */
window.addEventListener('beforeunload', () => {
    // Refresh all Crunchyroll tabs
    chrome.tabs.query({}, (tabs) => {
        tabs.forEach((tab) => {
            if (tab.url.includes('crunchyroll.com')) {
                chrome.tabs.reload(tab.id);
            }
        });
    });
});

/* Darkmode slider */
const themeSwitch = document.querySelector('#checkbox');

// Set the initial state of the checkbox based on localStorage
themeSwitch.checked = localStorage.getItem('darkMode') === 'true';

// If darkMode was enabled before, add the class
if (themeSwitch.checked) {
    document.body.classList.add('dark-mode');
}

themeSwitch.addEventListener('change', (e) => {
  document.body.classList.toggle('dark-mode', e.target.checked);
  // Save the current state to localStorage
  localStorage.setItem('darkMode', e.target.checked);
});

window.addEventListener('beforeunload', () => {
  // Refresh all Crunchyroll tabs
  chrome.tabs.query({}, (tabs) => {
    tabs.forEach((tab) => {
      if (tab.url.includes('crunchyroll.com')) {
        chrome.tabs.reload(tab.id);
      }
    });
  });
});