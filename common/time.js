import { zeroPad } from './utils';

export function formatDuration(durationSeconds) {
  const hours = Math.floor(durationSeconds / (60 * 60));
  const minutes = Math.floor(durationSeconds / 60) - (hours * 60);
  const seconds = durationSeconds - (Math.floor(durationSeconds / 60) * 60);
  
  if (hours > 0) {
    return `${hours}:${zeroPad(minutes)}:${zeroPad(seconds)}`;
  } else {
    return `${minutes}:${zeroPad(seconds)}`;
  }
}
