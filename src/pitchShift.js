import { SoundTouch } from 'soundtouchjs';

// Changes pitch without changing length by running the whole clip through SoundTouch up front.
// Same processing as the overlay, so the preview sounds like what plays on stream.
export function pitchShiftBuffer(audioCtx, buffer, pitch) {
  const frames = buffer.length;
  const left = buffer.getChannelData(0);
  const right = buffer.numberOfChannels > 1 ? buffer.getChannelData(1) : left;
  // Extra silence at the end flushes the last part of the clip out of SoundTouch
  const padFrames = Math.ceil(buffer.sampleRate * 0.5);
  const input = new Float32Array((frames + padFrames) * 2);
  for (let i = 0; i < frames; i++) {
    input[i * 2] = left[i];
    input[i * 2 + 1] = right[i];
  }

  const soundTouch = new SoundTouch();
  soundTouch.pitch = pitch;
  soundTouch.inputBuffer.putSamples(input, 0, frames + padFrames);
  soundTouch.process();

  const outFrames = Math.min(frames, soundTouch.outputBuffer.frameCount);
  const output = new Float32Array(outFrames * 2);
  soundTouch.outputBuffer.receiveSamples(output, outFrames);

  const result = audioCtx.createBuffer(2, frames, buffer.sampleRate);
  const outLeft = result.getChannelData(0);
  const outRight = result.getChannelData(1);
  for (let i = 0; i < outFrames; i++) {
    outLeft[i] = output[i * 2];
    outRight[i] = output[i * 2 + 1];
  }
  return result;
}
