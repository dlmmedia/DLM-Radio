"use client";

import { useEffect, useRef, useCallback } from "react";
import { useRadioStore } from "@/stores/radioStore";
import { extractBands } from "@/lib/audio-analyzer";
import { recordClick } from "@/lib/radio-browser";
import { setGlobalAudioData } from "@/hooks/useAudioData";

export function useAudioEngine() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const animFrameRef = useRef<number>(0);
  const dataArrayRef = useRef<Uint8Array<ArrayBuffer> | null>(null);
  const timeDomainRef = useRef<Uint8Array<ArrayBuffer> | null>(null);
  const lastStationRef = useRef<string | null>(null);

  const {
    currentStation,
    isPlaying,
    volume,
    isMuted,
    setPlaying,
    setLoading,
    nextStation,
    prevStation,
  } = useRadioStore();

  // Initialize audio element and AudioContext once
  useEffect(() => {
    if (!audioRef.current) {
      const audio = new Audio();
      audio.crossOrigin = "anonymous";
      audio.preload = "none";
      audioRef.current = audio;
    }

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
        audioRef.current = null;
      }
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => {});
        audioCtxRef.current = null;
        analyserRef.current = null;
        sourceRef.current = null;
        dataArrayRef.current = null;
      }
      lastStationRef.current = null;
    };
  }, []);

  // Volume control
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  // Connect the audio element to the Web Audio API analyser.
  // This must only be called once per audio element since
  // createMediaElementSource cannot be called twice on the same element.
  const ensureAnalyser = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || sourceRef.current) return;

    try {
      const ctx = audioCtxRef.current ?? new AudioContext();
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 2048;
      analyser.smoothingTimeConstant = 0.8;

      const source = ctx.createMediaElementSource(audio);
      source.connect(analyser);
      analyser.connect(ctx.destination);

      audioCtxRef.current = ctx;
      analyserRef.current = analyser;
      sourceRef.current = source;
      dataArrayRef.current = new Uint8Array(analyser.frequencyBinCount) as Uint8Array<ArrayBuffer>;
      timeDomainRef.current = new Uint8Array(analyser.frequencyBinCount) as Uint8Array<ArrayBuffer>;
    } catch (e) {
      console.warn("Failed to set up audio analyser:", e);
    }
  }, []);

  // Animation loop: read frequency data and update global audio data
  const updateAudioData = useCallback(() => {
    if (analyserRef.current && dataArrayRef.current) {
      analyserRef.current.getByteFrequencyData(dataArrayRef.current);
      if (timeDomainRef.current) {
        analyserRef.current.getByteTimeDomainData(timeDomainRef.current);
      }
      const bands = extractBands(
        dataArrayRef.current,
        analyserRef.current.frequencyBinCount,
        timeDomainRef.current ?? undefined
      );
      setGlobalAudioData(bands);
    }
    animFrameRef.current = requestAnimationFrame(updateAudioData);
  }, []);

  // Build the stream URL, always routed through our CORS proxy
  const getProxyUrl = useCallback((station: typeof currentStation) => {
    if (!station) return null;
    const raw = station.url_resolved || station.url;
    return `/api/proxy?url=${encodeURIComponent(raw)}`;
  }, []);

  // Handle station changes
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentStation) return;

    const rawUrl = currentStation.url_resolved || currentStation.url;
    const sameUrl = lastStationRef.current === rawUrl;
    lastStationRef.current = rawUrl;

    if (sameUrl) {
      setLoading(false);
      return;
    }

    recordClick(currentStation.stationuuid);

    // Always use proxy to guarantee same-origin for audio analysis
    const proxyUrl = getProxyUrl(currentStation);
    if (!proxyUrl) return;

    audio.src = proxyUrl;
    audio.load();

    const onCanPlay = () => {
      setLoading(false);
      ensureAnalyser();
      if (audioCtxRef.current?.state === "suspended") {
        audioCtxRef.current.resume();
      }
    };

    const onError = () => {
      // If proxy also fails, try direct URL as last resort
      if (audio.src.includes("/api/proxy")) {
        audio.src = rawUrl;
        audio.load();
        audio.play().catch(() => {
          setLoading(false);
          setPlaying(false);
        });
      } else {
        setLoading(false);
        setPlaying(false);
      }
    };

    const onPlaying = () => {
      setLoading(false);
      setPlaying(true);
      ensureAnalyser();
      if (audioCtxRef.current?.state === "suspended") {
        audioCtxRef.current.resume();
      }
    };

    audio.addEventListener("canplay", onCanPlay);
    audio.addEventListener("error", onError);
    audio.addEventListener("playing", onPlaying);

    audio.play().catch(() => {});

    return () => {
      audio.removeEventListener("canplay", onCanPlay);
      audio.removeEventListener("error", onError);
      audio.removeEventListener("playing", onPlaying);
    };
  }, [currentStation, ensureAnalyser, getProxyUrl, setLoading, setPlaying]);

  // Play/pause control
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      ensureAnalyser();
      audio.play().catch(() => setPlaying(false));
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = requestAnimationFrame(updateAudioData);
      if (audioCtxRef.current?.state === "suspended") {
        audioCtxRef.current.resume();
      }
    } else {
      audio.pause();
      cancelAnimationFrame(animFrameRef.current);
    }
  }, [isPlaying, setPlaying, updateAudioData, ensureAnalyser]);

  // MediaSession API for lock screen / notification controls
  useEffect(() => {
    if (!("mediaSession" in navigator)) return;

    if (currentStation) {
      const genre = currentStation.tags?.split(",")[0]?.trim() || "Radio";
      navigator.mediaSession.metadata = new MediaMetadata({
        title: currentStation.name,
        artist: genre,
        album: "DLM World Radio",
        artwork: currentStation.favicon
          ? [
              { src: currentStation.favicon, sizes: "96x96", type: "image/png" },
              { src: currentStation.favicon, sizes: "256x256", type: "image/png" },
            ]
          : [
              { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
              { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
            ],
      });
    }
  }, [currentStation]);

  useEffect(() => {
    if (!("mediaSession" in navigator)) return;

    navigator.mediaSession.setActionHandler("play", () => setPlaying(true));
    navigator.mediaSession.setActionHandler("pause", () => setPlaying(false));
    navigator.mediaSession.setActionHandler("previoustrack", () => prevStation());
    navigator.mediaSession.setActionHandler("nexttrack", () => nextStation());

    return () => {
      navigator.mediaSession.setActionHandler("play", null);
      navigator.mediaSession.setActionHandler("pause", null);
      navigator.mediaSession.setActionHandler("previoustrack", null);
      navigator.mediaSession.setActionHandler("nexttrack", null);
    };
  }, [setPlaying, nextStation, prevStation]);

  useEffect(() => {
    if (!("mediaSession" in navigator)) return;
    navigator.mediaSession.playbackState = isPlaying ? "playing" : "paused";
  }, [isPlaying]);

  return audioRef;
}
