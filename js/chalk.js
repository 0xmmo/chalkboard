document.addEventListener("DOMContentLoaded", chalkboard);

function chalkboard() {
  // Remove existing elements if they exist
  const existingChalkboard = document.getElementById("chalkboard");
  if (existingChalkboard) existingChalkboard.remove();
  const existingChalk = document.querySelector(".chalk");
  if (existingChalk) existingChalk.remove();

  // Create and prepend new elements
  const panel = document.createElement("div");
  panel.className = "panel";
  panel.innerHTML = '<a class="link" target="_blank">Save</a>';
  document.body.prepend(panel);

  const pattern = document.createElement("img");
  pattern.src = "img/bg.png";
  pattern.id = "pattern";
  pattern.width = 50;
  pattern.height = 50;
  document.body.prepend(pattern);

  const canvas = document.createElement("canvas");
  canvas.id = "chalkboard";
  document.body.prepend(canvas);

  const chalkDiv = document.createElement("div");
  chalkDiv.className = "chalk";
  document.body.prepend(chalkDiv);

  // Set canvas dimensions
  canvas.style.width = window.innerWidth + "px";
  canvas.style.height = window.innerHeight + "px";
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const ctx = canvas.getContext("2d");

  const width = canvas.width;
  const height = canvas.height;
  let mouseX = 0;
  let mouseY = 0;
  let mouseD = false;
  let eraser = false;
  let xLast = 0;
  let yLast = 0;
  const brushDiameter = 7;
  const eraserWidth = 50;
  const eraserHeight = 100;

  canvas.style.cursor = "none";
  document.onselectstart = () => false;
  ctx.fillStyle = "rgba(255,255,255,0.5)";
  ctx.strokeStyle = "rgba(255,255,255,0.5)";
  ctx.lineWidth = brushDiameter;
  ctx.lineCap = "round";

  const patImg = document.getElementById("pattern");
  const chalk = document.querySelector(".chalk");

  // Touch events
  document.addEventListener(
    "touchmove",
    (evt) => {
      const touch = evt.touches[0];
      mouseX = touch.pageX;
      mouseY = touch.pageY;
      if (mouseY < height && mouseX < width) {
        evt.preventDefault();
        chalk.style.left = mouseX + "px";
        chalk.style.top = mouseY + "px";
        if (mouseD) {
          draw(mouseX, mouseY);
        }
      }
    },
    false
  );

  document.addEventListener(
    "touchstart",
    (evt) => {
      const touch = evt.touches[0];
      mouseD = true;
      mouseX = touch.pageX;
      mouseY = touch.pageY;
      xLast = mouseX;
      yLast = mouseY;
      draw(mouseX + 1, mouseY + 1);
    },
    false
  );

  document.addEventListener(
    "touchend",
    () => {
      mouseD = false;
    },
    false
  );

  // Mouse events
  document.addEventListener("mousemove", (evt) => {
    mouseX = evt.pageX;
    mouseY = evt.pageY;
    if (mouseY < height && mouseX < width) {
      chalk.style.left = mouseX - 0.5 * brushDiameter + "px";
      chalk.style.top = mouseY - 0.5 * brushDiameter + "px";
      if (mouseD) {
        if (eraser) {
          erase(mouseX, mouseY);
        } else {
          draw(mouseX, mouseY);
        }
      }
    } else {
      chalk.style.top = height - 10 + "px";
    }
  });

  document.addEventListener("mousedown", (evt) => {
    mouseD = true;
    xLast = mouseX;
    yLast = mouseY;
    if (evt.button == 2) {
      erase(mouseX, mouseY);
      eraser = true;
      chalk.classList.add("eraser");
    } else {
      if (!evt.target.closest(".panel")) {
        draw(mouseX + 1, mouseY + 1);
      }
    }
  });

  document.addEventListener("mouseup", (evt) => {
    mouseD = false;
    if (evt.button == 2) {
      eraser = false;
      chalk.classList.remove("eraser");
    }
  });

  document.addEventListener("keyup", (evt) => {
    if (evt.keyCode == 32) {
      ctx.clearRect(0, 0, width, height);
    }
    if (evt.keyCode == 83) {
      changeLink();
    }
  });

  document.oncontextmenu = () => false;

  function draw(x, y) {
    ctx.strokeStyle = "rgba(255,255,255," + (0.4 + Math.random() * 0.2) + ")";
    ctx.beginPath();
    ctx.moveTo(xLast, yLast);
    ctx.lineTo(x, y);
    ctx.stroke();

    // Chalk Effect
    const length = Math.round(
      Math.sqrt(Math.pow(x - xLast, 2) + Math.pow(y - yLast, 2)) /
        (5 / brushDiameter)
    );
    const xUnit = (x - xLast) / length;
    const yUnit = (y - yLast) / length;
    for (let i = 0; i < length; i++) {
      const xCurrent = xLast + i * xUnit;
      const yCurrent = yLast + i * yUnit;
      const xRandom = xCurrent + (Math.random() - 0.5) * brushDiameter * 1.2;
      const yRandom = yCurrent + (Math.random() - 0.5) * brushDiameter * 1.2;
      ctx.clearRect(xRandom, yRandom, Math.random() * 2 + 2, Math.random() + 1);
    }

    xLast = x;
    yLast = y;
  }

  function erase(x, y) {
    ctx.clearRect(
      x - 0.5 * eraserWidth,
      y - 0.5 * eraserHeight,
      eraserWidth,
      eraserHeight
    );
  }

  document.querySelector(".link").addEventListener("click", () => {
    const downloadEl = document.querySelector(".download");
    if (downloadEl) downloadEl.remove();

    const imgCanvas = document.createElement("canvas");
    const imgCtx = imgCanvas.getContext("2d");
    const pattern = imgCtx.createPattern(patImg, "repeat");

    imgCanvas.width = width;
    imgCanvas.height = height;

    imgCtx.fillStyle = pattern;
    imgCtx.rect(0, 0, width, height);
    imgCtx.fill();

    const layimage = new Image();
    layimage.src = canvas.toDataURL("image/png");

    setTimeout(() => {
      imgCtx.drawImage(layimage, 0, 0);
      const compimage = imgCanvas.toDataURL("image/png");

      const downloadLink = document.createElement("a");
      downloadLink.href = compimage;
      downloadLink.download = "chalkboard.png";
      downloadLink.className = "download";
      downloadLink.textContent = "Download";
      panel.appendChild(downloadLink);

      downloadLink.addEventListener("click", () => {
        IEsave(compimage);
      });
    }, 500);
  });

  function IEsave(ctximage) {
    setTimeout(() => {
      const win = window.open();
      win.document.body.innerHTML =
        '<img src="' + ctximage + '" name="chalkboard.png">';
    }, 500);
  }

  window.addEventListener("resize", () => {
    // Implement resize handling if needed
  });
}
