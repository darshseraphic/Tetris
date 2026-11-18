(() => {
  "use strict";

  const button = document.getElementById("theme-button");
  const label = document.getElementById("theme-label");
  if (!button || !label) return;

  const themes = ["system", "light", "dark"];
  let currentTheme = "system";

  function nextTheme(theme) {
    const index = themes.indexOf(theme);
    return themes[(index + 1) % themes.length];
  }

  function applyTheme(theme) {
    currentTheme = themes.includes(theme) ? theme : "system";
    if (currentTheme === "light" || currentTheme === "dark") {
      document.documentElement.dataset.theme = currentTheme;
    } else {
      delete document.documentElement.dataset.theme;
    }

    const next = nextTheme(currentTheme);
    label.textContent = currentTheme[0].toUpperCase() + currentTheme.slice(1);
    button.setAttribute(
      "aria-label",
      `Current theme: ${label.textContent}. Click to switch to ${next[0].toUpperCase()}${next.slice(1)}.`
    );
    button.title = `Switch to ${next[0].toUpperCase()}${next.slice(1)} theme`;
  }

  function persistTheme(theme) {
    try {
      if (globalThis.chrome?.storage?.local) {
        chrome.storage.local.set({ theme });
      } else {
        localStorage.setItem("blockFallTheme", theme);
      }
    } catch (_error) {
      // Theme changes should still apply if extension storage is unavailable.
    }
  }

  button.addEventListener("click", () => {
    const theme = nextTheme(currentTheme);
    applyTheme(theme);
    persistTheme(theme);
  });

  try {
    if (globalThis.chrome?.storage?.local) {
      chrome.storage.local.get(["theme"], (result) => {
        applyTheme(result.theme || "system");
      });
      chrome.storage.onChanged?.addListener((changes, areaName) => {
        if (areaName === "local" && changes.theme) {
          applyTheme(changes.theme.newValue || "system");
        }
      });
    } else {
      applyTheme(localStorage.getItem("blockFallTheme") || "system");
    }
  } catch (_error) {
    applyTheme("system");
  }
})();
