(function boot() {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce) document.documentElement.classList.add("reduce-motion");

  const intro = document.getElementById("intro");
  const experience = document.getElementById("experience");
  const discover = document.getElementById("discover");
  const skip = document.querySelector(".skip");
  let opened = false;

  experience.inert = true;

  function openExperience() {
    if (opened) return;
    opened = true;
    document.body.classList.add("is-opening");
    experience.inert = false;
    experience.removeAttribute("aria-hidden");
    const wait = reduce ? 0 : 880;
    window.setTimeout(() => {
      document.body.classList.add("is-open");
      intro.setAttribute("aria-hidden", "true");
      const title = document.getElementById("player-title");
      title.setAttribute("tabindex", "-1");
      title.focus({ preventScroll: true });
    }, wait);
  }

  discover.addEventListener("click", openExperience);
  skip.addEventListener("click", (event) => {
    event.preventDefault();
    openExperience();
  });

  window.Viernes.initAnimations();
  window.Viernes.initGallery();
  window.Viernes.initPlayer();
  window.Viernes.initQuestion();
})();
