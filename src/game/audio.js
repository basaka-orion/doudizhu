// src/game/audio.js

class AudioEngine {
  constructor() {
    this.sounds = {};
    this.enabled = true;
    this.baseUrl = 'https://assets.mixkit.co/active_storage/sfx/'; // Temporary open source assets
  }

  // Predefined sound URLs
  static SOUNDS = {
    DEAL: '2571/2571-preview.mp3', // Card flick
    PLAY: '2572/2572-preview.mp3', // Thud/Slide
    PASS: '2568/2568-preview.mp3', // Soft tap
    BID: '2569/2569-preview.mp3', // Ping
    WIN: '1435/1435-preview.mp3', // Fanfare
    LOSE: '1434/1434-preview.mp3', // Aw
    BOMB: '2567/2567-preview.mp3', // Explosion
  };

  play(key) {
    if (!this.enabled) return;
    try {
      const audio = new Audio(this.baseUrl + AudioEngine.SOUNDS[key]);
      audio.volume = 0.5;
      audio.play().catch(e => console.log('Audio blocked', e));
    } catch (e) {
      console.error('Audio error', e);
    }
  }

  toggle() {
    this.enabled = !this.enabled;
    return this.enabled;
  }
}

export const audioEngine = new AudioEngine();
