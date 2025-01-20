async function populate() {
  const requestURL = '../assets/data/oldgamepatches.json';

  try {
    // Fetching the patches data
    const response = await fetch(requestURL, { cache: 'no-cache' });

    if (!response.ok) {
      throw new Error(`Network response was not ok: ${response.statusText}`);
    }

    let patches;

    try {
      patches = await response.json(); // Safely parse JSON
    } catch (jsonError) {
      throw new Error('Failed to parse JSON data');
    }

    // Ensure game data exists
    if (!patches || !Array.isArray(patches.game)) {
      throw new Error('Invalid data format: Missing or malformed game data');
    }

    // Render the patches if available
    renderPatchList(patches.game, '.gameList');
  } catch (error) {
    console.error('There has been a problem with your fetch operation:', error);
    renderError('.gameList', 'Failed to load game patches');
  }
}

function renderPatchList(patchList, containerSelector) {
  const container = document.querySelector(containerSelector);

  if (!container) {
    console.error(`Container with selector "${containerSelector}" not found.`);
    return;
  }

  const fragment = document.createDocumentFragment(); // Use fragment for better performance

  patchList.forEach(
    ({ patch = 'Unknown Patch', link = '#', date = 'Unknown Date' }) => {
      const listItem = document.createElement('li');

      const linkElement = document.createElement('a');
      linkElement.textContent = patch;
      linkElement.href = link;
      linkElement.target = '_blank';

      const dateElement = document.createElement('span');
      dateElement.textContent = date;

      listItem.append(linkElement, dateElement);
      fragment.appendChild(listItem);
    }
  );

  container.innerHTML = ''; // Clear existing content
  container.appendChild(fragment); // Append all items at once for better performance
}

function renderError(containerSelector, message) {
  const container = document.querySelector(containerSelector);

  if (container) {
    container.innerHTML = `<p class="error">${message}</p>`;
  } else {
    console.error(`Container with selector "${containerSelector}" not found.`);
  }
}

// Load the patches on DOMContentLoaded
document.addEventListener('DOMContentLoaded', async () => {
  await populate(); // Use async function for potential future enhancements
});
