// Web Audio API Paper Rustle Synthesizer

let audioCtx: AudioContext | null = null;

const getAudioContext = (): AudioContext => {
  if (!audioCtx) {
    // Standard initialization, supporting prefixed versions
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  return audioCtx;
};

// Generates a 1-second buffer of white noise
const createNoiseBuffer = (ctx: AudioContext): AudioBuffer => {
  const bufferSize = ctx.sampleRate * 1.0; // 1 second of noise
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  
  return buffer;
};

export const playPaperRustle = () => {
  try {
    const ctx = getAudioContext();
    
    // Resume audio context if suspended (browser security policy)
    if (ctx.state === 'suspended') {
      ctx.resume();
    }
    
    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = createNoiseBuffer(ctx);
    
    // Create filters to simulate paper sound characteristics
    // Paper rustle has a bandpass frequency around 1kHz - 6kHz, with some high end
    const bandpass = ctx.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.frequency.setValueAtTime(3200, ctx.currentTime);
    bandpass.Q.setValueAtTime(1.5, ctx.currentTime);
    
    const highpass = ctx.createBiquadFilter();
    highpass.type = 'highpass';
    highpass.frequency.setValueAtTime(1000, ctx.currentTime);
    
    // Create Gain Node for volume envelope
    const gainNode = ctx.createGain();
    
    // Connect nodes: Noise -> Bandpass -> Highpass -> Gain -> Destination
    noiseSource.connect(bandpass);
    bandpass.connect(highpass);
    highpass.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    // Define volume envelope (quick rise, sliding decay)
    const now = ctx.currentTime;
    gainNode.gain.setValueAtTime(0, now);
    // Quick ramp up to simulate initial paper lift
    gainNode.gain.linearRampToValueAtTime(0.06, now + 0.05);
    // Slide down to simulate page falling
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
    
    // Modulate filter frequency slightly to simulate motion
    bandpass.frequency.setValueAtTime(3200, now);
    bandpass.frequency.exponentialRampToValueAtTime(1500, now + 0.4);
    
    // Start noise source and stop it after envelope ends
    noiseSource.start(now);
    noiseSource.stop(now + 0.5);
  } catch (error) {
    console.warn('Failed to play paper rustle sound via Web Audio API:', error);
  }
};
