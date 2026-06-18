let activeAudio = null;
let activeVoiceAudio = null;

export const playVoiceSound = (text) => {
  if (typeof window === 'undefined') return;

  const lowerText = text.toLowerCase();
  const categories = {
    chuckle: ['chuckle.mp3', 'chuckle2.mp3'],
    laugh: ['laughter.mp3', 'laughter2.mp3'],
    sigh: ['sign.mp3', 'sign2.mp3'],
    cough: ['cough.mp3', 'cough2.mp3'],
    gasp: ['gasp.mp3', 'gasp2.mp3'],
    shh: ['shh.mp3', 'shh2.mp3'],
    clear: ['clear-throat.mp3', 'clear-throat2.mp3', 'clear-throat3.mp3'],
    hmm: ['hmmm.mp3'],
    um: ['um.mp3', 'um2.mp3']
  };

  let chosenFile = null;

  if (lowerText.includes('chuckle') || lowerText.includes('giggle') || lowerText.includes('snicker')) {
    chosenFile = categories.chuckle[Math.floor(Math.random() * categories.chuckle.length)];
  } else if (lowerText.includes('laugh') || lowerText.includes('giggle') || lowerText.includes('haha')) {
    chosenFile = categories.laugh[Math.floor(Math.random() * categories.laugh.length)];
  } else if (lowerText.includes('gasp') || lowerText.includes('gasps')) {
    chosenFile = categories.gasp[Math.floor(Math.random() * categories.gasp.length)];
  } else if (lowerText.includes('sigh') || lowerText.includes('sighs')) {
    chosenFile = categories.sigh[Math.floor(Math.random() * categories.sigh.length)];
  } else if (lowerText.includes('cough') || lowerText.includes('coughs')) {
    chosenFile = categories.cough[Math.floor(Math.random() * categories.cough.length)];
  } else if (lowerText.includes('shh') || lowerText.includes('shhh') || lowerText.includes('whisper')) {
    chosenFile = categories.shh[Math.floor(Math.random() * categories.shh.length)];
  } else if (lowerText.includes('clear-throat') || lowerText.includes('clear throat')) {
    chosenFile = categories.clear[Math.floor(Math.random() * categories.clear.length)];
  } else if (lowerText.includes('hmmm') || lowerText.includes('hmm')) {
    chosenFile = categories.hmm[Math.floor(Math.random() * categories.hmm.length)];
  } else if (lowerText.includes('um') || lowerText.includes('uh') || lowerText.includes('well')) {
    chosenFile = categories.um[Math.floor(Math.random() * categories.um.length)];
  } else {
    const fallbacks = ['hmmm.mp3', 'um.mp3', 'um2.mp3', 'clear-throat.mp3'];
    chosenFile = fallbacks[Math.floor(Math.random() * fallbacks.length)];
  }

  if (chosenFile) {
    try {
      if (activeVoiceAudio) {
        activeVoiceAudio.pause();
        activeVoiceAudio = null;
      }
      activeVoiceAudio = new Audio(`/sounds/mia-voices/${chosenFile}`);
      activeVoiceAudio.volume = 0.2;
      const playPromise = activeVoiceAudio.play();
      if (playPromise !== undefined) {
        playPromise.catch(e => {
          if (e.name !== 'AbortError') {
            console.warn("Voice playback issue:", e);
          }
        });
      }
    } catch (err) {
      console.warn("Voice Audio init failed:", err);
    }
  }
};

export const playKickSound = () => {
  if (typeof window !== 'undefined') {
    try {
      if (!activeAudio) {
        activeAudio = new Audio('/sounds/closing-door.mp3');
      }
      activeAudio.currentTime = 0;
      const playPromise = activeAudio.play();
      if (playPromise !== undefined) {
        playPromise.catch(e => {
          if (e.name !== 'AbortError') {
            console.warn("Audio playback issue:", e);
          }
        });
      }
    } catch (err) {
      console.warn("Audio init failed:", err);
    }
  }
};

export const playBellSound = () => {
  if (typeof window !== 'undefined') {
    try {
      const audio = new Audio('/sounds/dragon-studio-bell-ring.mp3');
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(e => {
          if (e.name !== 'AbortError') {
            console.warn("Audio playback issue:", e);
          }
        });
      }
    } catch (err) {
      console.warn("Audio init failed:", err);
    }
  }
};
