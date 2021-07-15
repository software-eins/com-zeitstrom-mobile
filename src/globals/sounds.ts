const PLAY_SOUNDS = false;

const isSoundEnabled = function() {
  return PLAY_SOUNDS;
}

const wait = function(milliseconds: number) {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
}

const playLogin = async function() {
  if (!isSoundEnabled()) return;

  new Audio('/assets/sounds/pitch-2.mp3').play();
  await wait(100);
  new Audio('/assets/sounds/pitch-3.mp3').play();
}

const playButtonPress = async function() {
  if (!isSoundEnabled()) return;

  new Audio('/assets/sounds/pitch-4.mp3').play();
}


export { playLogin, playButtonPress }
