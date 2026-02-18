import type { AudioData } from "./types";

export function extractBands(dataArray: Uint8Array, bufferLength: number, timeDomainArray?: Uint8Array): AudioData {
  const raw = new Float32Array(32);
  const step = Math.floor(bufferLength / 32);
  for (let i = 0; i < 32; i++) {
    let sum = 0;
    for (let j = 0; j < step; j++) {
      sum += dataArray[i * step + j];
    }
    raw[i] = sum / step / 255;
  }

  // Sub bass: bins 1-3 (20-60Hz)
  const sub = average(dataArray, 1, 3) / 255;
  // Bass: bins 3-12 (60-250Hz)
  const bass = average(dataArray, 3, 12) / 255;
  // Mid: bins 12-100 (250-2000Hz)
  const mid = average(dataArray, 12, Math.min(100, bufferLength)) / 255;
  // High: bins 100-300 (2000-6000Hz)
  const high = average(dataArray, Math.min(100, bufferLength), Math.min(300, bufferLength)) / 255;
  // Treble: bins 300-512 (6000-20000Hz)
  const treble = average(dataArray, Math.min(300, bufferLength), bufferLength) / 255;

  // Overall energy (RMS)
  let rmsSum = 0;
  for (let i = 0; i < bufferLength; i++) {
    const v = dataArray[i] / 255;
    rmsSum += v * v;
  }
  const energy = Math.sqrt(rmsSum / bufferLength);

  const waveform = new Float32Array(bufferLength);
  if (timeDomainArray) {
    for (let i = 0; i < bufferLength; i++) {
      waveform[i] = (timeDomainArray[i] - 128) / 128;
    }
  }

  return { sub, bass, mid, high, treble, energy, raw, waveform };
}

function average(arr: Uint8Array, start: number, end: number): number {
  if (end <= start) return 0;
  let sum = 0;
  const clampedEnd = Math.min(end, arr.length);
  for (let i = start; i < clampedEnd; i++) {
    sum += arr[i];
  }
  return sum / (clampedEnd - start);
}
