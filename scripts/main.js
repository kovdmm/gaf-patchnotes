((g) => {
  // render patch list
  const renderPatchList = async (containerSelector, jsonUrl, type = "balance") => {
    if (!SUPPORTED_TYPES.includes(type)) {
      throw new Error(`The type of list should be one of (${SUPPORTED_TYPES.join(", ")}), but "${type}" provided`);
    }

    const container = document.querySelector(containerSelector);
    if (!container) {
      throw new Error(`Container with selector "${containerSelector}" not found.`);
    }

    const patches = await fetchPatches(jsonUrl);
    const patchesByType = patches[type].slice(0);
    patchesByType.sort(desc("date"));
    renderList(container, patchesByType);
  };

  const asyncMemo = (func) => {
    const cache = {};
    return async (...args) => {
      const cacheKey = JSON.stringify(args);
      if (!cache[cacheKey]) {
        cache[cacheKey] = await func(...args);
      }
      return cache[cacheKey];
    };
  };

  const fetchPatches = asyncMemo(async (jsonUrl) => {
    const response = await fetch(jsonUrl, { cache: "no-cache" });
    if (!response.ok) {
      throw new Error(`Network response was not ok: ${response.statusText}`);
    }
    return await response.json();
  });

  const desc = (property, arg2) => (arg2 ? (property > arg2 ? -1 : 1) : (a, b) => (a[property] > b[property] ? -1 : 1));

  const renderList = (container, patches) => {
    const dateFormatter = new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "long", year: "numeric" });
    // building list
    const fragment = document.createDocumentFragment();
    fragment.append(
      ...patches.map(({ patch = "Unknown Patch", link = "#", date = "Invalid Date" }, i) => {
        const linkElement = document.createElement("a");
        linkElement.textContent = patch;
        linkElement.href = link;

        const dateElement = document.createElement("span");
        const dateObj = new Date(date);
        const formattedDate = isNaN(dateObj) ? date : dateFormatter.format(dateObj);
        dateElement.textContent = ` – ${formattedDate}${i === 0 ? " (текущий)" : ""}`;

        const listElement = document.createElement("li");
        listElement.append(linkElement, dateElement);
        return listElement;
      }),
    );
    // rendering list
    container.innerHTML = "";
    container.appendChild(fragment);
  };

  const SUPPORTED_TYPES = ["balance", "game"];

  // theme
  const THEME_KEY = "theme";
  const LIGHT_MODE_CLASS = "light-mode";
  const LIGHT_MODE = "light";
  const DARK_MODE = "dark";

  const toggleTheme = () => {
    const htmlElement = document.documentElement;
    const isLightMode = htmlElement.classList.toggle(LIGHT_MODE_CLASS);
    const newTheme = isLightMode ? LIGHT_MODE : DARK_MODE;
    try {
      localStorage.setItem(THEME_KEY, newTheme);
    } catch (e) {
      console.warn("Unable to access localStorage. Theme will reset on reload.");
    }
    document.dispatchEvent(new CustomEvent("theme-change", { detail: newTheme }));
  };

  const loadTheme = () => {
    const htmlElement = document.documentElement;
    let savedTheme;
    try {
      savedTheme = localStorage.getItem(THEME_KEY) ?? DARK_MODE;
    } catch (e) {
      savedTheme = DARK_MODE;
      console.warn("Unable to access localStorage. Using default theme.");
    }
    if (savedTheme === LIGHT_MODE) {
      htmlElement.classList.add(LIGHT_MODE_CLASS);
    } else {
      htmlElement.classList.remove(LIGHT_MODE_CLASS);
    }
    document.dispatchEvent(new CustomEvent("theme-change", { detail: savedTheme }));
  };

  // scrolling
  const scrollSmooth = (event) => {
    event.preventDefault();
    document.querySelector(event.currentTarget.getAttribute("href")).scrollIntoView({
      behavior: "smooth",
    });
  };

  // sidebar
  const updateSidebar = () => {
    renderNavigation();
    adjustSidebarHeight();
  };

  const renderNavigation = () => {
    const navigationPanel = document.querySelector(".navigation");
    if (!navigationPanel) {
      return;
    }
    navigationPanel.classList.add("IconSidebarSubgrid");

    const fragment = document.createDocumentFragment();
    const sections = document.querySelectorAll("div.Content section");
    if (sections) {
      const navSections = [...sections].splice(1);
      const item = document.createElement("div");
      item.textContent = "DICK";
      fragment.append(
        ...navSections
          .map((section) => {
            const elements = [];
            const title = section.querySelector("h2")?.textContent;
            if (title) {
              const titleElement = document.createElement("h3");
              titleElement.textContent = title;
              titleElement.className = "text-center";
              elements.push(titleElement);
            }
            const cards = section.querySelectorAll("article.Card");
            elements.push(
              ...[...cards]
                .map((card) => {
                  const id = card.id;
                  const titleElement = card.querySelector("h4");
                  const title = titleElement?.textContent.trim();
                  const img = titleElement.querySelector("img")?.cloneNode();
                  if (img && title) {
                    img.loading = "lazy";
                    const anchor = document.createElement("a");
                    anchor.title = title;
                    anchor.href = `#${id}`;
                    anchor.append(img);
                    anchor.addEventListener("click", scrollSmooth);
                    return anchor;
                  }
                })
                .filter((x) => x),
            );
            return elements;
          })
          .flat(),
      );
    } else {
      const message = document.createElement("h3");
      message.className = "text-center";
      message.textContent = "Секции не найдены";
      fragment.append(message);
    }

    navigationPanel.append(fragment);
    return navigationPanel;
  };

  const adjustSidebarHeight = () => {
    const sidebarPanel = document.querySelector(".icon-sidebar-inner");
    const sidebarPanelHeight = sidebarPanel?.clientHeight;
    const sidebarPanelWrapper = document.querySelector(".icon-sidebar-wrapper");
    if (sidebarPanelWrapper) {
      sidebarPanelWrapper.style.height = `${sidebarPanelHeight}px`;
    }
  };

  // resize
  const debounce = (func, ms) => {
    let blocked = false;
    return (...args) => {
      if (!blocked) {
        blocked = true;
        func(...args);
      }
      setTimeout(() => {
        blocked = false;
      }, ms);
    };
  };

  const resize = (elements, ratio) =>
    elements?.forEach((element) => {
      element.height = element.getBoundingClientRect().width * ratio;
    });

  const insertYoutubeVideo = (id, { autoplay = true, mute = true } = {}) => {
    document.write(`
      <iframe
        src="https://www.youtube.com/embed/${id}?autoplay=${+autoplay}&mute=${+mute}"
        class="preview"
        title="YouTube video player"
        frameborder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrerpolicy="strict-origin-when-cross-origin"
        allowfullscreen
      ></iframe>
    `);
  };

  // publishing functions to global object (window)
  g.renderPatchList = renderPatchList;
  g.toggleTheme = toggleTheme;
  g.insertYoutubeVideo = insertYoutubeVideo;

  // event handling
  document.addEventListener("DOMContentLoaded", () => {
    // update year value
    document.querySelectorAll("span.year")?.forEach((yearElement) => {
      yearElement.textContent = new Date().getFullYear();
    });
    // make scrolling smooth
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener("click", scrollSmooth);
    });
    // handle resize and resize preview videos
    const videoPreviews = document.querySelectorAll("iframe.preview");
    if (videoPreviews.length) {
      const handleResize = debounce(() => resize(videoPreviews, 9 / 16), 25);
      window.addEventListener("resize", handleResize);
      setTimeout(handleResize, 50);
    }

    loadTheme();
    updateSidebar();
  });
  document.addEventListener("theme-change", ({ detail: theme }) => {
    const icons = document.querySelectorAll(".theme-icon");
    if (document.body) {
      document.body.dataset.theme = theme;
    }
    icons.forEach((iconElement) => {
      if (theme === "light") {
        iconElement.classList.remove("fa-sun");
        iconElement.classList.add("fa-moon");
      } else {
        iconElement.classList.remove("fa-moon");
        iconElement.classList.add("fa-sun");
      }
    });
  });
})(window);
