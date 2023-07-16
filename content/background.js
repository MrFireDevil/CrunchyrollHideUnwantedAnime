// Listen for messages from content.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.method === 'storeAnime') {
    // Add the anime to the hidden animes list
    chrome.storage.sync.get('hiddenAnimes', (data) => {
      let hiddenAnimes = data.hiddenAnimes || [];
      hiddenAnimes.push({name: request.animeName, hideStatus: request.hideStatus});
      chrome.storage.sync.set({hiddenAnimes: hiddenAnimes}, () => {
        sendResponse({status: 'Anime stored'});
      });
    });
    return true; // Indicate that the response will be sent asynchronously
  } else if (request.method === 'getAnimeStatus') {
    // Check if the anime is in the hidden animes list
    chrome.storage.sync.get('hiddenAnimes', (data) => {
      let hiddenAnimes = data.hiddenAnimes || [];
      const anime = hiddenAnimes.find(anime => anime.name === request.animeName);
      sendResponse({hideStatus: anime ? anime.hideStatus : false});
    });
    return true; // Indicate that the response will be sent asynchronously
  } else if (request.method === 'getHiddenAnimes') {
    // Return the list of hidden animes
    chrome.storage.sync.get('hiddenAnimes', (data) => {
      let hiddenAnimes = data.hiddenAnimes || [];
      sendResponse({animes: hiddenAnimes.filter(anime => anime.hideStatus)});
    });
    return true; // Indicate that the response will be sent asynchronously
  } else if (request.method === 'unhideAnime') {
    // Find the anime in the hidden animes list and unhide it
    chrome.storage.sync.get('hiddenAnimes', (data) => {
      let hiddenAnimes = data.hiddenAnimes || [];
      const anime = hiddenAnimes.find(anime => anime.name === request.animeName);
      if (anime) {
        anime.hideStatus = false;
      }
      chrome.storage.sync.set({hiddenAnimes: hiddenAnimes}, () => {
        sendResponse({status: 'Anime unhidden'});
      });
    });
    return true; // Indicate that the response will be sent asynchronously
  }
});
