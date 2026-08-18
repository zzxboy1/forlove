const ALBUM_CONFIG = {
  to: "老婆",
  from: "爱你的我",
};

const album = document.querySelector("#album");
const pages = [...document.querySelectorAll(".page")];
const currentPage = document.querySelector("#currentPage");
const totalPages = document.querySelector("#totalPages");
const progressBar = document.querySelector("#progressBar");
const pageCount = document.querySelector("#pageCount");
const nextButton = document.querySelector("#nextButton");
const startButton = document.querySelector("#startButton");
const restartButton = document.querySelector("#restartButton");

let activeIndex = 0;
let navigationLocked = false;

document.querySelectorAll("[data-to]").forEach((node) => {
  node.textContent = ALBUM_CONFIG.to;
});

document.querySelectorAll("[data-from]").forEach((node) => {
  node.textContent = ALBUM_CONFIG.from;
});

totalPages.textContent = String(pages.length).padStart(2, "0");

// Give each photo a blurred, full-bleed background of itself, so a
// "contain" image can show completely without black letterbox bars.
document.querySelectorAll(".photo, .landscape-photo").forEach((img) => {
  const bg = document.createElement("div");
  bg.className = "photo-bg";
  const apply = () => {
    bg.style.backgroundImage = `url("${img.currentSrc || img.src}")`;
  };
  if (img.complete) apply();
  else img.addEventListener("load", apply, { once: true });
  img.parentElement.insertBefore(bg, img);
});

function updateNavigation(index) {
  activeIndex = index;
  const page = pages[index];
  const progress = ((index + 1) / pages.length) * 100;

  currentPage.textContent = String(index + 1).padStart(2, "0");
  progressBar.style.width = `${progress}%`;
  document.body.dataset.tone = page.dataset.tone || "light";
  nextButton.classList.toggle("is-hidden", index === pages.length - 1);
  pageCount.classList.toggle("is-ready", index > 0);
  nextButton.classList.toggle("is-ready", index > 0 && index < pages.length - 1);
}

function goToPage(index) {
  const target = Math.max(0, Math.min(index, pages.length - 1));
  if (target === activeIndex || navigationLocked) return;

  navigationLocked = true;
  pages[target].scrollIntoView({ behavior: "smooth", block: "start" });
  window.setTimeout(() => {
    navigationLocked = false;
  }, 550);
}

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting && entry.intersectionRatio >= 0.62) {
        const index = pages.indexOf(entry.target);
        pages.forEach((page, pageIndex) => {
          page.classList.toggle("is-visible", pageIndex === index);
        });
        updateNavigation(index);
      }
    });
  },
  { root: album, threshold: [0.62] },
);

pages.forEach((page) => observer.observe(page));

startButton.addEventListener("click", () => goToPage(1));
nextButton.addEventListener("click", () => goToPage(activeIndex + 1));
restartButton.addEventListener("click", () => goToPage(0));

window.addEventListener("keydown", (event) => {
  if (["ArrowDown", "PageDown", " "].includes(event.key)) {
    event.preventDefault();
    goToPage(activeIndex + 1);
  }

  if (["ArrowUp", "PageUp"].includes(event.key)) {
    event.preventDefault();
    goToPage(activeIndex - 1);
  }

  if (event.key === "Home") {
    event.preventDefault();
    goToPage(0);
  }

  if (event.key === "End") {
    event.preventDefault();
    goToPage(pages.length - 1);
  }
});

updateNavigation(0);
