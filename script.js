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

// Função para clarear a cor base (mistura com branco)
function lightenColor(hex, factor = 0.5) {
  hex = hex.replace("#", "");
  let r = parseInt(hex.substring(0, 2), 16);
  let g = parseInt(hex.substring(2, 4), 16);
  let b = parseInt(hex.substring(4, 6), 16);

  // Mistura ajustável com branco
  r = Math.floor(r + (255 - r) * factor);
  g = Math.floor(g + (255 - g) * factor);
  b = Math.floor(b + (255 - b) * factor);

  return `#${((1 << 24) + (r << 16) + (g << 8) + b)
    .toString(16)
    .slice(1)
    .toUpperCase()}`;
}

// Função para retornar a cor correspondente à nota
function getColorForNote(note) {
  note = note.trim().toUpperCase();
  if (note.length === 0) return null;

  // Se a nota contém acidental (ex.: C#)
  if (note.includes("#")) {
    const baseNote = note[0];
    if (noteColors[baseNote]) {
      return lightenColor(noteColors[baseNote]);
    }
  } else {
    if (noteColors[note]) {
      return noteColors[note];
    }
  }
  return null;
}

// Desenha um gradiente de fundo no canvas
function drawBackgroundGradient(ctx, w, h) {
  const gradient = ctx.createRadialGradient(
    w / 2, // centro X
    h / 2, // centro Y
    0, // raio interno
    w / 2, // centro X
    h / 2, // centro Y
    w / 1.3 // raio externo
  );
  gradient.addColorStop(0, "#FFFFFF");
  gradient.addColorStop(1, "#DDDDDD");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, w, h);
}

// Função para desenhar um polígono abstrato
function drawPolygon(ctx, x, y, color) {
  // Número de lados entre 4 e 8
  const sides = Math.floor(Math.random() * 5) + 4;
  const angleStep = (Math.PI * 2) / sides;

  ctx.beginPath();
  for (let i = 0; i < sides; i++) {
    // Variação aleatória no raio para irregularidade
    const radius = Math.random() * 150 + 50; // maior variação
    const angle = i * angleStep + Math.random() * (angleStep / 2);
    const newX = x + radius * Math.cos(angle);
    const newY = y + radius * Math.sin(angle);
    if (i === 0) {
      ctx.moveTo(newX, newY);
    } else {
      ctx.lineTo(newX, newY);
    }
  }
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
}

window.addEventListener("load", function () {
  const submitButton = document.querySelector("#submit");
  const clearButton = document.querySelector("#clear");
  const eraserButton = document.querySelector("#eraserButton");
  const label = document.querySelector("label[for='sharpCheckbox']");

  const canvas = document.getElementById("artCanvas");
  const ctx = canvas.getContext("2d");

  const noteButtons = document.querySelectorAll(".note-btn");
  const sharpCheckbox = document.getElementById("sharpCheckbox");
  const noteDisplay = document.getElementById("noteDisplay");

  sharpCheckbox.checked = false;

  label.onclick = function () {
    if (label.classList.contains("btn-secondary")) {
      label.classList.remove("btn-secondary");
      label.classList.add("btn-warning");
    } else {
      label.classList.remove("btn-warning");
      label.classList.add("btn-secondary");
    }
  };

  noteButtons.forEach((button) => {
    button.addEventListener("click", function () {
      let note = this.dataset.note;
      // Se o checkbox estiver marcado, adiciona o "#"
      if (sharpCheckbox.checked) {
        note += "#";
      }
      // Adiciona a nota ao campo de saída, separando por espaço
      noteDisplay.value = noteDisplay.value
        ? noteDisplay.value + " " + note
        : note;
    });
  });

  // Desenha o fundo gradiente uma vez ao carregar
  drawBackgroundGradient(ctx, canvas.width, canvas.height);

  submitButton.onclick = function (e) {
    e.preventDefault();
    const inputText = noteDisplay.value;
    // Separa as notas por espaço e filtra entradas vazias
    const notes = inputText.split(" ").filter((n) => n.trim() !== "");

    if (notes.length === 0) {
      alert("Por favor, insira pelo menos uma nota.");
      return;
    }

    notes.forEach((note) => {
      const color = getColorForNote(note);
      if (color) {
        // Para cada nota, desenhamos múltiplos polígonos para "preencher" mais
        const shapesPerNote = 3; // Ajuste para mais/menos formas

        for (let i = 0; i < shapesPerNote; i++) {
          // Define posição aleatória no canvas
          const x = Math.random() * canvas.width;
          const y = Math.random() * canvas.height;

          // Define um nível de transparência aleatório
          ctx.globalAlpha = Math.random() * 0.5 + 0.5;
          drawPolygon(ctx, x, y, color);
        }

        // Restaura a opacidade para 1, caso precise desenhar outras coisas depois
        ctx.globalAlpha = 1.0;

        // Limpa o campo de saída
        noteDisplay.value = "";
      } else {
        alert(
          `Nota inválida: ${note}. Use C, D, E, F, G, A, B ou notas com acidental como C#.`
        );
      }
    });
  };

  clearButton.onclick = function (e) {
    e.preventDefault();
    noteDisplay.value = "";
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBackgroundGradient(ctx, canvas.width, canvas.height);
  };

  eraserButton.onclick = function (e) {
    e.preventDefault();
    noteDisplay.value = noteDisplay.value.split(" ").slice(0, -1).join(" ");
  };
});
