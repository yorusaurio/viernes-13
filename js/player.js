window.Viernes = window.Viernes || {};

/**
 * La reproducción usa el embed oficial de Spotify.
 * audioSrc queda vacío a propósito: no hay un archivo de audio autorizado en el proyecto.
 * Si más adelante tienes uno, escribe aquí su ruta, por ejemplo "assets/audio/viernes-13.mp3".
 */
const TRACK = {
  title: "Viernes 13",
  artist: "Marcos Menchaca",
  year: 2019,
  spotifyTrackId: "1qXYKmTTd4e0YdugtGmb5R",
  audioSrc: ""
};

window.Viernes.initPlayer = function initPlayer() {
  const playBtn = document.getElementById("play");
  const restartBtn = document.getElementById("restart");
  const seek = document.getElementById("seek");
  const currentTime = document.getElementById("time-current");
  const durationTime = document.getElementById("time-duration");
  const status = document.getElementById("player-status");
  const nowPlaying = document.getElementById("now-playing");
  const transport = document.getElementById("transport");
  const volumeControl = document.getElementById("volume-control");
  const volume = document.getElementById("volume");
  const slot = document.getElementById("embed-slot");
  const cover = document.getElementById("cover");
  const coverFallback = document.getElementById("cover-fallback");
  const spotifyLink = document.getElementById("spotify-link");

  const spotifyUrl = `https://open.spotify.com/track/${TRACK.spotifyTrackId}`;
  spotifyLink.href = spotifyUrl;

  const coverSources = [
    "assets/images/cover.jpg",
    "https://s.mxmcdn.net/images-storage/albums4/7/9/3/8/9/5/36598397_500_500.jpg",
    "https://i.scdn.co/image/ab67616d0000b273eec3c8690fafca3999e3b659"
  ];
  let coverIndex = 0;
  cover.addEventListener("error", () => {
    coverIndex += 1;
    if (coverIndex < coverSources.length) {
      cover.src = coverSources[coverIndex];
      return;
    }
    cover.hidden = true;
    coverFallback.hidden = false;
  });

  const state = {
    position: 0,
    duration: 0,
    isPaused: true,
    isBuffering: false,
    anchor: 0,
    received: false
  };
  let seeking = false;
  let looping = false;
  let controller = null;
  let audio = null;
  let shownSecond = -1;
  const seekWrap = seek.parentElement;

  function formatTime(ms) {
    if (!Number.isFinite(ms) || ms < 0) return "0:00";
    const total = Math.floor(ms / 1000);
    const minutes = Math.floor(total / 60);
    const seconds = total % 60;
    return `${minutes}:${String(seconds).padStart(2, "0")}`;
  }

  function spokenTime(ms) {
    const total = Math.max(0, Math.floor(ms / 1000));
    const minutes = Math.floor(total / 60);
    const seconds = total % 60;
    return `${minutes} minutos ${seconds} segundos`;
  }

  function render(positionMs, syncControl) {
    const duration = state.duration;
    const ratio = duration > 0 ? Math.min(1, Math.max(0, positionMs / duration)) : 0;
    const visual = seeking ? Number(seek.value) / 1000 : ratio;
    seekWrap.style.setProperty("--ratio", visual.toFixed(5));
    const shownMs = seeking && duration ? visual * duration : positionMs;
    const second = Math.floor(Math.max(0, shownMs) / 1000);
    if (syncControl || second !== shownSecond) {
      shownSecond = second;
      currentTime.textContent = formatTime(shownMs);
      if (!seeking) {
        seek.value = String(Math.round(ratio * 1000));
        seek.setAttribute("aria-valuenow", seek.value);
        seek.setAttribute("aria-valuetext", spokenTime(shownMs));
      }
    }
    if (duration > 0) {
      durationTime.textContent = formatTime(duration);
      seek.disabled = false;
    }
    const playing = state.received && !state.isPaused;
    document.body.classList.toggle("is-playing", playing);
    playBtn.classList.toggle("is-buffering", state.isBuffering);
    playBtn.setAttribute("aria-pressed", playing ? "true" : "false");
    playBtn.setAttribute("aria-label", playing ? "Pausar Viernes 13" : "Reproducir Viernes 13");
    nowPlaying.hidden = !playing;
  }

  function startLoop() {
    if (looping || audio) return;
    looping = true;
    const step = (now) => {
      if (!looping) return;
      if (!state.isPaused && !state.isBuffering && !seeking && state.duration > 2000) {
        const position = state.position + (now - state.anchor);
        if (position >= state.duration) {
          state.position = state.duration;
          state.isPaused = true;
          render(state.duration, true);
          stopLoop();
          return;
        }
        render(position, false);
      }
      requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  function stopLoop() {
    looping = false;
  }

  function enableTransport(message) {
    playBtn.disabled = false;
    restartBtn.disabled = false;
    status.textContent = message;
  }

  function showSpotifyFallback(message) {
    stopLoop();
    nowPlaying.hidden = true;
    document.body.classList.remove("is-playing");
    const iframe = document.createElement("iframe");
    iframe.src = `https://open.spotify.com/embed/track/${TRACK.spotifyTrackId}?utm_source=generator&theme=0`;
    iframe.title = "Viernes 13 de Marcos Menchaca en Spotify";
    iframe.height = "152";
    iframe.loading = "lazy";
    iframe.allow = "autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture";
    iframe.referrerPolicy = "strict-origin-when-cross-origin";
    slot.replaceChildren(iframe);
    status.textContent = message;
    document.getElementById("embed-shell").append(status);
    transport.hidden = true;
  }

  function bindSeek(onSeek) {
    seek.addEventListener("pointerdown", () => {
      seeking = true;
    });
    const release = () => {
      seeking = false;
    };
    seek.addEventListener("pointerup", release);
    seek.addEventListener("pointercancel", release);
    seek.addEventListener("input", () => {
      if (!state.duration) return;
      const ratio = seek.value / 1000;
      seek.style.setProperty("--p", `${ratio * 100}%`);
      currentTime.textContent = formatTime(ratio * state.duration);
    });
    seek.addEventListener("change", () => {
      if (!state.duration) return;
      const seconds = (seek.value / 1000) * (state.duration / 1000);
      onSeek(seconds);
      seeking = false;
    });
  }

  function initAudio() {
    document.body.dataset.player = "audio";
    audio = new Audio(TRACK.audioSrc);
    audio.preload = "metadata";
    volumeControl.hidden = false;
    slot.hidden = true;

    audio.addEventListener("loadedmetadata", () => {
      state.duration = Number.isFinite(audio.duration) ? audio.duration * 1000 : 0;
      enableTransport("Cuando quieras, dale a reproducir.");
      render(0);
    });

    audio.addEventListener("timeupdate", () => {
      state.position = audio.currentTime * 1000;
      state.duration = Number.isFinite(audio.duration) ? audio.duration * 1000 : state.duration;
      state.isPaused = audio.paused;
      state.isBuffering = false;
      state.received = true;
      render(state.position);
    });

    audio.addEventListener("play", () => {
      state.isPaused = false;
      state.received = true;
      render(audio.currentTime * 1000);
    });

    audio.addEventListener("pause", () => {
      state.isPaused = true;
      render(audio.currentTime * 1000);
    });

    audio.addEventListener("waiting", () => {
      state.isBuffering = true;
      render(audio.currentTime * 1000);
    });

    audio.addEventListener("ended", () => {
      state.isPaused = true;
      state.position = state.duration;
      render(state.position);
    });

    audio.addEventListener("error", () => {
      audio = null;
      volumeControl.hidden = true;
      status.textContent = "No pude abrir el archivo de audio. La canción sigue disponible en Spotify.";
      initSpotify();
    });

    playBtn.addEventListener("click", () => {
      if (!audio) return;
      if (audio.paused) {
        const pending = audio.play();
        if (pending) {
          pending.catch(() => {
            status.textContent = "El navegador detuvo la reproducción. Puedes abrirla en Spotify.";
          });
        }
      } else {
        audio.pause();
      }
    });

    restartBtn.addEventListener("click", () => {
      if (!audio) return;
      audio.currentTime = 0;
      const pending = audio.play();
      if (pending) pending.catch(() => {});
    });

    volume.addEventListener("input", () => {
      if (!audio) return;
      audio.volume = Number(volume.value);
      audio.muted = audio.volume === 0;
      volume.setAttribute("aria-valuenow", String(Math.round(audio.volume * 100)));
      volume.setAttribute("aria-valuetext", `Volumen ${Math.round(audio.volume * 100)} por ciento`);
    });

    bindSeek((seconds) => {
      if (!audio) return;
      audio.currentTime = seconds;
    });
  }

  function initSpotify() {
    document.body.dataset.player = "spotify";
    volumeControl.hidden = true;
    slot.hidden = false;
    let settled = false;

    const timeout = window.setTimeout(() => {
      if (controller || settled) return;
      settled = true;
      showSpotifyFallback("No pude preparar los controles propios. Puedes escucharla en el reproductor de Spotify.");
    }, 12000);

    function markReady() {
      if (settled) return;
      settled = true;
      window.clearTimeout(timeout);
      enableTransport("Cuando quieras, dale a reproducir.");
    }

    window.onSpotifyIframeApiReady = (api) => {
      const width = Math.max(280, Math.round(slot.getBoundingClientRect().width) || 360);
      api.createController(
        document.getElementById("embed-iframe"),
        {
          width,
          height: 152,
          uri: `spotify:track:${TRACK.spotifyTrackId}`,
          theme: "dark"
        },
        (embed) => {
          controller = embed;
          if (settled) {
            if (typeof embed.destroy === "function") embed.destroy();
            return;
          }
          embed.addListener("ready", () => {
            const iframe = slot.querySelector("iframe");
            if (iframe) {
              iframe.title = "Viernes 13 de Marcos Menchaca en Spotify";
              iframe.allow = "autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture";
            }
            markReady();
          });
          embed.addListener("playback_update", (event) => {
            const data = event.data || event;
            const reported = Math.max(0, Number(data.position) || 0);
            const reportedDuration = Math.max(0, Number(data.duration) || 0);
            const now = performance.now();
            if (reportedDuration > 0) state.duration = reportedDuration;

            let position = reported;
            if (!data.isPaused && !data.isBuffering && !seeking && state.anchor && state.duration > 0) {
              const estimated = Math.min(state.duration, state.position + (now - state.anchor));
              const behind = estimated - reported;
              if (behind > 0 && behind < 1600) position = estimated;
            }

            state.position = position;
            state.isPaused = Boolean(data.isPaused);
            state.isBuffering = Boolean(data.isBuffering);
            state.anchor = now;
            state.received = state.duration > 0 || !state.isPaused;
            render(state.position, true);
            if (!state.isPaused && !state.isBuffering) startLoop();
            else stopLoop();
          });
          markReady();
        }
      );
    };

    const script = document.createElement("script");
    script.src = "https://open.spotify.com/embed/iframe-api/v1";
    script.async = true;
    script.onerror = () => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timeout);
      showSpotifyFallback("Spotify no cargó en esta red. Puedes abrir la canción con el enlace.");
    };
    document.body.appendChild(script);

    playBtn.addEventListener("click", () => {
      if (!controller) return;
      controller.togglePlay();
    });

    restartBtn.addEventListener("click", () => {
      if (!controller) return;
      controller.restart();
    });

    bindSeek((seconds) => {
      if (!controller) return;
      controller.seek(Math.round(seconds));
      state.position = Math.round(seconds) * 1000;
      state.anchor = performance.now();
      render(state.position);
    });
  }

  if (TRACK.audioSrc) initAudio();
  else initSpotify();
};
