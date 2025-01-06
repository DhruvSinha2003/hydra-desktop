// src/app.js
const { ipcRenderer } = require("electron");
const HydraSynth = require("hydra-synth");

let editor;
let hydra;

// Initialize Monaco Editor
require.config({
  paths: {
    vs: "https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.45.0/min/vs",
  },
});
require(["vs/editor/editor.main"], function () {
  editor = monaco.editor.create(document.getElementById("monaco-editor"), {
    value: `// Welcome to Hydra Desktop!\n// Start with a simple example:\nosc(40,0.1,0.8)\n  .kaleid()\n  .color(0.5,0.3,0.9)\n  .rotate(0.009)\n  .out()`,
    language: "javascript",
    theme: "vs-dark",
  });
});

// Initialize Hydra
window.onload = () => {
  const canvas = document.getElementById("hydra-canvas");
  hydra = new HydraSynth({
    canvas: canvas,
    detectAudio: true,
    enableStreamCapture: false,
  });

  // Set up UI controls
  setupControls();

  // Run initial code
  document.getElementById("run-code").click();
};

function setupControls() {
  // Run button
  document.getElementById("run-code").addEventListener("click", () => {
    const code = editor.getValue();
    try {
      eval(code);
    } catch (error) {
      console.error("Error running code:", error);
    }
  });

  // Save snippet
  document.getElementById("save-snippet").addEventListener("click", () => {
    const code = editor.getValue();
    const name = prompt("Enter a name for this snippet:");
    if (name) {
      ipcRenderer.send("save-snippet", { name, code });
    }
  });

  // Parameter controls
  document.getElementById("scale").addEventListener("input", (e) => {
    const scale = parseFloat(e.target.value);
    try {
      eval(`solid().scale(${scale}).out()`);
    } catch (error) {
      console.error("Error updating scale:", error);
    }
  });

  document.getElementById("rotation").addEventListener("input", (e) => {
    const rotation = parseFloat(e.target.value);
    try {
      eval(`solid().rotate(${rotation})`);
    } catch (error) {
      console.error("Error updating rotation:", error);
    }
  });

  document.getElementById("hue").addEventListener("input", (e) => {
    const hue = parseFloat(e.target.value);
    try {
      eval(`solid().hue(${hue})`);
    } catch (error) {
      console.error("Error updating hue:", error);
    }
  });
}

// Handle audio input
navigator.mediaDevices
  .getUserMedia({ audio: true })
  .then((stream) => {
    const audioContext = new AudioContext();
    const source = audioContext.createMediaStreamSource(stream);
    const analyzer = audioContext.createAnalyser();
    source.connect(analyzer);

    // Make analyzer available to Hydra
    window.analyzer = analyzer;
  })
  .catch((error) => {
    console.error("Error accessing audio input:", error);
  });
