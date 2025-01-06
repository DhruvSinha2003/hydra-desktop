// Initial code that will run when the app starts
const initialCode = `// Welcome to Hydra!
osc(60, 0.1, 0.8)
  .color(0.8, 0.3, 0.9)
  .kaleid(6)
  .rotate(({time}) => time%360)
  .modulate(
    noise(3,0.1)
    .rotate(({time}) => time%360)
  )
  .scale(1.5)
  .out()`;

let hydra;
let editor;

window.onload = async () => {
  // Initialize Hydra
  hydra = new Hydra({
    canvas: document.getElementById("hydra-canvas"),
    detectAudio: true,
    enableStreamCapture: false,
  });

  // Initialize CodeMirror
  editor = CodeMirror(document.getElementById("editor"), {
    value: initialCode,
    mode: "javascript",
    theme: "monokai",
    lineNumbers: true,
    autofocus: true,
    tabSize: 2,
    lineWrapping: true,
  });

  // Set up keyboard shortcuts
  editor.setOption("extraKeys", {
    "Ctrl-Enter": evaluateCode,
    "Shift-Enter": evaluateCode,
  });

  // Initialize audio
  await setupAudio();

  // Run initial code
  evaluateCode();
};

function evaluateCode() {
  const code = editor.getValue();
  try {
    eval(code);
  } catch (error) {
    console.error("Error running code:", error);
  }
}

async function setupAudio() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const audioContext = new AudioContext();
    const source = audioContext.createMediaStreamSource(stream);
    const analyzer = audioContext.createAnalyser();
    source.connect(analyzer);

    window.a = { fft: new Float32Array(analyzer.frequencyBinCount) };

    function updateAudio() {
      analyzer.getFloatFrequencyData(window.a.fft);
      // Normalize values
      for (let i = 0; i < window.a.fft.length; i++) {
        window.a.fft[i] = (window.a.fft[i] + 140) / 140;
      }
      requestAnimationFrame(updateAudio);
    }
    updateAudio();
  } catch (error) {
    console.error("Error setting up audio:", error);
  }
}
