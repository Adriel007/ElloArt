// Mapeamento de notas para cores base
const noteColors = {
  C: "#FF0000", // Vermelho
  D: "#FF7F00", // Laranja
  E: "#FFFF00", // Amarelo
  F: "#00FF00", // Verde
  G: "#0000FF", // Azul
  A: "#4B0082", // Índigo
  B: "#8B00FF", // Violeta
};

// Frequências das notas
const noteFrequencies = {
  C: 261.63,
  D: 293.66,
  E: 329.63,
  F: 349.23,
  G: 392.0,
  A: 440.0,
  B: 493.88,
};

// Clareia a cor (mistura com branco)
function lightenColor(hex, factor = 0.5) {
  hex = hex.replace("#", "");
  let r = parseInt(hex.substring(0, 2), 16);
  let g = parseInt(hex.substring(2, 4), 16);
  let b = parseInt(hex.substring(4, 6), 16);

  r = Math.floor(r + (255 - r) * factor);
  g = Math.floor(g + (255 - g) * factor);
  b = Math.floor(b + (255 - b) * factor);

  return `#${((1 << 24) + (r << 16) + (g << 8) + b)
    .toString(16)
    .slice(1)
    .toUpperCase()}`;
}

// Retorna a cor para a nota (clara se for sustenido)
function getColorForNote(note) {
  note = note.trim().toUpperCase();
  if (!note) return null;

  if (note.includes("#")) {
    const baseNote = note[0];
    return noteColors[baseNote] ? lightenColor(noteColors[baseNote]) : null;
  } else {
    return noteColors[note] || null;
  }
}

// Desenha fundo gradiente
function drawBackgroundGradient(ctx, w, h) {
  const gradient = ctx.createRadialGradient(
    w / 2,
    h / 2,
    0,
    w / 2,
    h / 2,
    w / 1.3
  );
  gradient.addColorStop(0, "#FFFFFF");
  gradient.addColorStop(1, "#DDDDDD");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, w, h);
}

// Desenha polígono abstrato
function drawPolygon(ctx, x, y, color) {
  const sides = Math.floor(Math.random() * 5) + 4;
  const angleStep = (Math.PI * 2) / sides;

  ctx.beginPath();
  for (let i = 0; i < sides; i++) {
    const radius = Math.random() * 150 + 50;
    const angle = i * angleStep + Math.random() * (angleStep / 2);
    const newX = x + radius * Math.cos(angle);
    const newY = y + radius * Math.sin(angle);
    i === 0 ? ctx.moveTo(newX, newY) : ctx.lineTo(newX, newY);
  }
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
}

// Toca som da nota
function playNote(note, isSharp = false) {
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  let frequency = noteFrequencies[note];
  if (isSharp) {
    frequency *= Math.pow(2, 1 / 12);
  }

  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
  gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  oscillator.start();
  oscillator.stop(audioContext.currentTime + 0.5);

  oscillator.onended = () => {
    oscillator.disconnect();
    gainNode.disconnect();
    audioContext.close();
  };
}

function updateButtonColors(isSharp) {
  const buttons = document.querySelectorAll(".note-btn");

  buttons.forEach((btn) => {
    const note = btn.dataset.note;
    let color = noteColors[note];

    if (isSharp) {
      color = lightenColor(color, 0.5); // Clareia se for sustenido
    }

    btn.style.backgroundColor = color;

    // Contraste automático
    const rgb = parseInt(color.substring(1), 16);
    const r = (rgb >> 16) & 0xff;
    const g = (rgb >> 8) & 0xff;
    const b = rgb & 0xff;
    const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
    btn.style.color = luminance > 150 ? "black" : "white";
  });
}

const downloadButton = document.getElementById("download");

downloadButton.onclick = function (e) {
  e.preventDefault();

  const canvas = document.getElementById("artCanvas");

  const link = document.createElement("a");
  link.download = "arte-musical.png";
  link.href = canvas.toDataURL("image/png");
  link.click();

  // SweetAlert de sucesso
  Swal.fire({
    icon: "success",
    title: "Imagem salva!",
    text: "Sua arte foi baixada com sucesso.",
    confirmButtonColor: "#3085d6",
    confirmButtonText: "OK",
  });
};

window.addEventListener("load", function () {
  const clearButton = document.querySelector("#clear");
  const label = document.querySelector("label[for='sharpCheckbox']");

  const canvas = document.getElementById("artCanvas");
  const ctx = canvas.getContext("2d");

  const noteButtons = document.querySelectorAll(".note-btn");
  const sharpCheckbox = document.getElementById("sharpCheckbox");
  const noteDisplay = document.getElementById("noteDisplay");

  noteDisplay.value = "";

  sharpCheckbox.checked = false;

  sharpCheckbox.addEventListener("change", function () {
    const isChecked = sharpCheckbox.checked;

    // Atualiza cor do botão sustenido
    if (isChecked) {
      label.classList.remove("btn-secondary");
      label.classList.add("btn-warning");
    } else {
      label.classList.remove("btn-warning");
      label.classList.add("btn-secondary");
    }

    // Atualiza as cores dos botões de nota
    updateButtonColors(isChecked);
  });

  // Clique em cada nota
  noteButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const baseNote = this.dataset.note;
      const isSharp = sharpCheckbox.checked;
      const note = isSharp ? baseNote + "#" : baseNote;

      playNote(baseNote, isSharp);

      // Atualiza textarea
      noteDisplay.value = noteDisplay.value
        ? noteDisplay.value + " " + note
        : note;

      // Desenha automaticamente no canvas
      const color = getColorForNote(note);
      if (color) {
        const shapesPerNote = 3;
        for (let i = 0; i < shapesPerNote; i++) {
          const x = Math.random() * canvas.width;
          const y = Math.random() * canvas.height;
          ctx.globalAlpha = Math.random() * 0.5 + 0.5;
          drawPolygon(ctx, x, y, color);
        }
        ctx.globalAlpha = 1.0;
      }
    });
  });

  // Fundo ao carregar
  drawBackgroundGradient(ctx, canvas.width, canvas.height);

  clearButton.onclick = function (e) {
    e.preventDefault();
    noteDisplay.value = "";
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBackgroundGradient(ctx, canvas.width, canvas.height);
  };
});
