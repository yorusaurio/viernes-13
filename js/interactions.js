window.Viernes = window.Viernes || {};

window.Viernes.initQuestion = function initQuestion() {
  const yes = document.getElementById("yes");
  const no = document.getElementById("no");
  const joke = document.getElementById("joke");
  const promise = document.getElementById("promise");
  const actions = document.getElementById("proposal-actions");
  const section = document.getElementById("pregunta");
  const layer = document.getElementById("celebration");
  const reduce = document.documentElement.classList.contains("reduce-motion");

  function celebrate() {
    if (reduce) return;
    const colors = ["#d68b9c", "#8f304a", "#f5f1f2", "#c46b82"];
    const count = 16;
    for (let index = 0; index < count; index += 1) {
      const heart = document.createElement("span");
      heart.className = "heart";
      const size = 8 + Math.random() * 8;
      heart.style.left = `${8 + Math.random() * 84}%`;
      heart.style.setProperty("--size", `${size}px`);
      heart.style.background = colors[index % colors.length];
      heart.style.animationDelay = `${Math.random() * 0.45}s`;
      heart.style.animationDuration = `${2.8 + Math.random() * 1.5}s`;
      heart.style.setProperty("--drift", `${(Math.random() - 0.5) * 70}px`);
      layer.appendChild(heart);
    }
    window.setTimeout(() => layer.replaceChildren(), 4800);
  }

  no.addEventListener("click", () => {
    joke.hidden = false;
    actions.classList.add("is-teasing");
    no.setAttribute("aria-expanded", "true");
    yes.focus();
  });

  yes.addEventListener("click", () => {
    section.classList.add("is-promised");
    document.body.classList.add("is-promised");
    joke.hidden = true;
    actions.hidden = true;
    promise.hidden = false;
    celebrate();
    window.setTimeout(() => {
      promise.focus({ preventScroll: true });
      promise.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" });
    }, reduce ? 0 : 180);
  });
};
