window.Viernes = window.Viernes || {};

window.Viernes.initGallery = function initGallery() {
  const opens = Array.from(document.querySelectorAll(".memory__open"));
  const dialog = document.getElementById("lightbox");
  const image = document.getElementById("lightbox-img");
  const caption = document.getElementById("lightbox-caption");
  const closeBtn = document.getElementById("lightbox-close");
  const prevBtn = document.getElementById("lightbox-prev");
  const nextBtn = document.getElementById("lightbox-next");
  let current = 0;
  let lastTrigger = null;
  let touchStartX = 0;
  let touchStartY = 0;

  opens.forEach((button) => {
    const img = button.querySelector("img");
    const mat = button.querySelector(".memory__mat");
    if (!img || !mat) return;

    img.addEventListener("error", () => {
      img.hidden = true;
      mat.classList.add("is-missing");
      button.disabled = true;
      button.setAttribute("aria-label", "Esta fotografía todavía no está disponible");
    });
  });

  function availableIndex(start, direction) {
    const total = opens.length;
    for (let step = 0; step < total; step += 1) {
      const index = (start + direction * step + total) % total;
      if (!opens[index].disabled) return index;
    }
    return -1;
  }

  function show(index) {
    const next = availableIndex(index, 1);
    if (next < 0) return;
    current = next;
    const button = opens[current];
    const source = button.querySelector("img");
    const note = button.dataset.note || "";
    const label = button.dataset.label || "Fotografía";
    image.src = source.currentSrc || source.src;
    image.alt = note ? `${label}. ${note}` : label;
    caption.textContent = note;
    if (!dialog.open) {
      if (typeof dialog.showModal === "function") dialog.showModal();
      else dialog.setAttribute("open", "");
    }
  }

  function close() {
    if (typeof dialog.close === "function" && dialog.open) dialog.close();
    else dialog.removeAttribute("open");
    if (lastTrigger) lastTrigger.focus();
  }

  opens.forEach((button, index) => {
    button.addEventListener("click", () => {
      if (button.disabled) return;
      lastTrigger = button;
      show(index);
    });
  });

  closeBtn.addEventListener("click", close);
  prevBtn.addEventListener("click", () => show(availableIndex(current - 1, -1)));
  nextBtn.addEventListener("click", () => show(availableIndex(current + 1, 1)));

  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) close();
  });

  dialog.addEventListener("close", () => {
    image.removeAttribute("src");
  });

  document.addEventListener("keydown", (event) => {
    if (!dialog.open) return;
    if (event.key === "Escape") {
      event.preventDefault();
      close();
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      show(availableIndex(current - 1, -1));
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      show(availableIndex(current + 1, 1));
    }
  });

  dialog.addEventListener(
    "touchstart",
    (event) => {
      touchStartX = event.changedTouches[0].clientX;
      touchStartY = event.changedTouches[0].clientY;
    },
    { passive: true }
  );

  dialog.addEventListener(
    "touchend",
    (event) => {
      const diffX = event.changedTouches[0].clientX - touchStartX;
      const diffY = event.changedTouches[0].clientY - touchStartY;
      if (Math.abs(diffX) < 48 || Math.abs(diffX) < Math.abs(diffY)) return;
      if (diffX > 0) show(availableIndex(current - 1, -1));
      else show(availableIndex(current + 1, 1));
    },
    { passive: true }
  );
};
