function setBackground(mediaQuery) {
  const htmlElement = document.documentElement;
  const imgs = Array(6)
    .fill()
    .map((_, i) => `./assets/images/backgrounds/${i + 1}.jpg`);

  // Preload images for better UX and avoid flickering
  imgs.forEach((img) => {
    const image = new Image();
    image.src = img;
  });

  if (mediaQuery.matches) {
    htmlElement.style.backgroundColor = "var(--Background)";
    htmlElement.style.backgroundImage = "none";
  } else {
    const randomImg = imgs[Math.floor(Math.random() * imgs.length)];
    htmlElement.style.backgroundImage = `url(${randomImg})`;
    htmlElement.style.backgroundColor = "transparent";
  }
}

const mediaQuery = window.matchMedia("(max-width: 420px)");

function handleMediaChange(event) {
  setBackground(event);
}

// Debouncing media query changes to optimize performance
let debounceTimeout;
function debounce(func, delay) {
  return function (...args) {
    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(() => func.apply(this, args), delay);
  };
}

setBackground(mediaQuery);
mediaQuery.addEventListener("change", debounce(handleMediaChange, 100));

// Cleanup: remove event listener if no longer needed
function removeListener() {
  mediaQuery.removeEventListener("change", debounce(handleMediaChange, 100));
}
