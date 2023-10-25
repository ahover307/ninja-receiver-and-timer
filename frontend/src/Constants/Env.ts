export const endpoint: string = import.meta.env.VITE_ENDPOINT;
export const anon_key: string = import.meta.env.VITE_ANON_KEY;
export const timerSleepDelay: number =
  parseInt(import.meta.env.VITE_TIMER_SLEEP_DELAY) || 17;
export const displayScrollSpeed: number =
  parseInt(import.meta.env.VITE_DISPLAY_SCROLL_SPEED) || 0.0005;
