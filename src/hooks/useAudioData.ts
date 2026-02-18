"use client";

import { useRef } from "react";
import type { AudioData } from "@/lib/types";

const defaultAudioData: AudioData = {
  sub: 0,
  bass: 0,
  mid: 0,
  high: 0,
  treble: 0,
  energy: 0,
  raw: new Float32Array(32),
  waveform: new Float32Array(1024),
};

let globalAudioData: AudioData = { ...defaultAudioData, raw: new Float32Array(32), waveform: new Float32Array(1024) };

export function getAudioData(): AudioData {
  return globalAudioData;
}

export function setGlobalAudioData(data: AudioData) {
  globalAudioData = data;
}

export function useAudioDataRef() {
  const ref = useRef<AudioData>(globalAudioData);
  return ref;
}
