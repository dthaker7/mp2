// Plays the cry URL returned by PokeAPI (data.cries.latest)
let on = localStorage.getItem("pokedex-sound") !== "off";
let current: HTMLAudioElement | null = null;

export const isSoundOn = () => on;

export function stopCry() {
  current?.pause();
  current = null;
}

export function setSoundOn(value: boolean) {
  on = value;
  localStorage.setItem("pokedex-sound", value ? "on" : "off");
  if (!value) stopCry();
}

export function playCry(url: string | null) {
  if (!on || !url) return;
  stopCry();
  const cry = new Audio(url);
  cry.volume = 0.4;
  current = cry;
  cry.play().catch(() => {
    /* browser blocked autoplay or file failed to load */
  });
}