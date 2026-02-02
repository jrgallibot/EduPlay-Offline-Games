/**
 * Generate a short WAV file (sine wave) as base64.
 * Used for animal "tone" sounds so we never use Speech/TTS (no human/AI voice).
 */

import { getNoteFrequency } from './tonePlayer';

const SAMPLE_RATE = 44100;

function createWavBuffer(frequencyHz: number, durationMs: number, volume: number = 0.25): ArrayBuffer {
  const numSamples = Math.floor((SAMPLE_RATE * durationMs) / 1000);
  const dataSize = numSamples * 2; // 16-bit = 2 bytes per sample
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);

  // WAV header first (bytes 0–43)
  let offset = 0;
  const write = (bytes: string) => {
    for (let i = 0; i < bytes.length; i++) view.setUint8(offset++, bytes.charCodeAt(i));
  };
  const writeU32 = (v: number) => {
    view.setUint32(offset, v, true);
    offset += 4;
  };
  const writeU16 = (v: number) => {
    view.setUint16(offset, v, true);
    offset += 2;
  };
  write('RIFF');
  writeU32(36 + dataSize);
  write('WAVE');
  write('fmt ');
  writeU32(16);
  writeU16(1); // PCM
  writeU16(1); // mono
  writeU32(SAMPLE_RATE);
  writeU32(SAMPLE_RATE * 2); // byte rate
  writeU16(2); // block align
  writeU16(16); // bits per sample
  write('data');
  writeU32(dataSize);

  // PCM data (bytes 44+)
  const channelData = new Int16Array(buffer, 44, numSamples);
  const amplitude = Math.floor(32767 * Math.min(1, Math.max(0, volume)));
  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE;
    const sample = amplitude * Math.sin(2 * Math.PI * frequencyHz * t);
    channelData[i] = Math.max(-32768, Math.min(32767, Math.round(sample)));
  }
  return buffer;
}

const BASE64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
function bytesToBase64(bytes: Uint8Array): string {
  let out = '';
  for (let i = 0; i < bytes.length; i += 3) {
    const a = bytes[i];
    const b = bytes[i + 1];
    const c = bytes[i + 2];
    out += BASE64[a >> 2];
    out += BASE64[((a & 3) << 4) | ((b ?? 0) >> 4)];
    out += b !== undefined ? BASE64[((b & 15) << 2) | ((c ?? 0) >> 6)] : '=';
    out += c !== undefined ? BASE64[c & 63] : '=';
  }
  return out;
}

/** Get base64-encoded WAV for a sine tone (for writing to file and playing). */
export function getWavBase64(frequencyHz: number, durationMs: number, volume?: number): string {
  const buf = createWavBuffer(frequencyHz, durationMs, volume);
  return bytesToBase64(new Uint8Array(buf));
}

/** Get frequency in Hz for a note name and octave (same mapping as tonePlayer). */
export function noteToFrequency(note: string, octave: number): number {
  return getNoteFrequency(note, octave);
}
