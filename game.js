(() => {
  "use strict";

  const COLS = 10;
  const ROWS = 20;
  const CELL = 30;
  const PREVIEW_CELL = 17;
  const TYPES = ["I", "O", "T", "S", "Z", "J", "L"];
  // Every piece uses a different neutral value; the game remains monochrome.
  const COLORS = {
    I: "#F4F4F2",
    O: "#DADAD6",
    T: "#C5C5C1",
    S: "#AFAFAC",
    Z: "#E8E8E4",
    J: "#989894",
    L: "#CECECA"
  };
  const SHAPES = {
    I: [[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]],
    O: [[1,1],[1,1]],
    T: [[0,1,0],[1,1,1],[0,0,0]],
    S: [[0,1,1],[1,1,0],[0,0,0]],
    Z: [[1,1,0],[0,1,1],[0,0,0]],
    J: [[1,0,0],[1,1,1],[0,0,0]],
    L: [[0,0,1],[1,1,1],[0,0,0]]
  };
  const LINE_POINTS = [0, 100, 300, 500, 800];

  const $ = (id) => document.getElementById(id);
  const boardCanvas = $("game-board");
  const boardCtx = boardCanvas.getContext("2d");
  const holdCanvas = $("hold-preview");
  const nextCanvases = Array.from($("next-list").querySelectorAll("canvas"));
  const overlay = $("game-overlay");
  const overlayKicker = $("overlay-kicker");
  const overlayTitle = $("overlay-title");
  const overlayCopy = $("overlay-copy");
  const startButton = $("start-button");
  const pauseButton = $("pause-button");
  const restartButton = $("restart-button");
  const announcement = $("game-announcement");

  let board = emptyBoard();
  let bag = [];
  let queue = [];
  let active = null;
  let heldType = null;
  let hasHeldThisTurn = false;
  let phase = "ready";
  let score = 0;
  let best = 0;
  let lines = 0;
  let level = 1;
  let lastFrame = 0;
  let gravityAccumulator = 0;
  let animationId = 0;

  function emptyBoard() {
    return Array.from({ length: ROWS }, () => Array(COLS).fill(null));
  }

  function cloneMatrix(matrix) {
    return matrix.map((row) => row.slice());
  }

  function rotateMatrix(matrix, direction = 1) {
    const n = matrix.length;
    const rotated = Array.from({ length: n }, () => Array(n).fill(0));
    for (let y = 0; y < n; y += 1) {
      for (let x = 0; x < n; x += 1) {
        if (direction > 0) rotated[y][x] = matrix[n - 1 - x][y];
        else rotated[y][x] = matrix[x][n - 1 - y];
      }
    }
    return rotated;
  }

  function shuffle(items) {
    const result = items.slice();
    for (let i = result.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }

  function drawFromBag() {
    if (bag.length === 0) bag = shuffle(TYPES);
    return bag.pop();
  }

  function fillQueue() {
    while (queue.length < 5) queue.push(drawFromBag());
  }

  function makePiece(type) {
    const matrix = cloneMatrix(SHAPES[type]);
    return {
      type,
      matrix,
      x: Math.floor((COLS - matrix[0].length) / 2),
      y: 0
    };
  }

  function collides(piece, offsetX = 0, offsetY = 0, matrix = piece.matrix) {
    for (let y = 0; y < matrix.length; y += 1) {
      for (let x = 0; x < matrix[y].length; x += 1) {
        if (!matrix[y][x]) continue;
        const boardX = piece.x + x + offsetX;
        const boardY = piece.y + y + offsetY;
        if (boardX < 0 || boardX >= COLS || boardY >= ROWS) return true;
        if (boardY >= 0 && board[boardY][boardX] !== null) return true;
      }
    }
    return false;
  }

  function spawnPiece(type) {
    active = makePiece(type);
    hasHeldThisTurn = false;
    if (collides(active)) {
      active = null;
      endGame();
    }
    drawAll();
  }

  function takeNextPiece() {
    fillQueue();
    const type = queue.shift();
    fillQueue();
    updatePreviews();
    spawnPiece(type);
  }

  function startGame() {
    cancelAnimationFrame(animationId);
    board = emptyBoard();
    bag = [];
    queue = [];
    active = null;
    heldType = null;
    hasHeldThisTurn = false;
    score = 0;
    lines = 0;
    level = 1;
    gravityAccumulator = 0;
    phase = "playing";
    hideOverlay();
    announcement.textContent = "New game started.";
    fillQueue();
    updateUI();
    updatePreviews();
    takeNextPiece();
    lastFrame = performance.now();
    animationId = requestAnimationFrame(gameLoop);
    drawAll();
  }

  function endGame() {
    phase = "over";
    active = null;
    cancelAnimationFrame(animationId);
    showOverlay("GAME OVER", "Stack reached\nthe top.", "Start a new run and see if you can beat your personal best.", "Play again");
    announcement.textContent = `Game over. Final score ${score}.`;
    updateUI();
    drawAll();
  }

  function togglePause() {
    if (phase === "playing") {
      phase = "paused";
      cancelAnimationFrame(animationId);
      showOverlay("", "", "", "Resume game", true);
      announcement.textContent = "Game paused.";
    } else if (phase === "paused") {
      phase = "playing";
      hideOverlay();
      announcement.textContent = "Game resumed.";
      lastFrame = performance.now();
      animationId = requestAnimationFrame(gameLoop);
    }
    updateUI();
  }

  function showOverlay(kicker, title, copy, buttonText, minimal = false) {
    overlay.classList.toggle("is-minimal", minimal);
    overlayKicker.textContent = kicker;
    overlayTitle.textContent = title;
    overlayTitle.style.whiteSpace = "pre-line";
    overlayTitle.hidden = !title;
    overlayCopy.textContent = copy;
    overlayCopy.hidden = !copy;
    startButton.innerHTML = `${buttonText} <span aria-hidden="true">↗</span>`;
    overlay.hidden = false;
  }

  function hideOverlay() {
    overlay.hidden = true;
    overlay.classList.remove("is-minimal");
  }

  function updateUI() {
    $("play-score").textContent = String(score).padStart(6, "0");
    $("play-level").textContent = String(level).padStart(2, "0");
    $("best-value").textContent = String(best).padStart(6, "0");
    $("lines-value").textContent = String(lines).padStart(3, "0");
    pauseButton.disabled = phase !== "playing";
    pauseButton.innerHTML = 'Pause <span aria-hidden="true">Ⅱ</span>';
    document.querySelectorAll("[data-control]").forEach((button) => {
      button.disabled = phase !== "playing";
    });
  }

  function updatePreviews() {
    drawPreview(holdCanvas, heldType);
    nextCanvases.forEach((canvas, index) => drawPreview(canvas, queue[index] || null));
  }

  function getDpr() {
    return Math.max(1, Math.min(2, window.devicePixelRatio || 1));
  }

  function setupCanvas(canvas, width, height) {
    const dpr = getDpr();
    const pixelWidth = Math.round(width * dpr);
    const pixelHeight = Math.round(height * dpr);
    if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
      canvas.width = pixelWidth;
      canvas.height = pixelHeight;
    }
    const ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return ctx;
  }

  function drawTile(ctx, x, y, size, type, alpha = 1) {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = COLORS[type] || "#eeeeea";
    ctx.fillRect(x + 1, y + 1, size - 2, size - 2);
    ctx.strokeStyle = "rgba(17,17,17,.42)";
    ctx.lineWidth = 1;
    ctx.strokeRect(x + 1.5, y + 1.5, size - 3, size - 3);
    ctx.restore();
  }

  function drawBoard() {
    const ctx = setupCanvas(boardCanvas, COLS * CELL, ROWS * CELL);
    ctx.fillStyle = "#141414";
    ctx.fillRect(0, 0, COLS * CELL, ROWS * CELL);

    ctx.strokeStyle = "#292929";
    ctx.lineWidth = 1;
    for (let x = 0; x <= COLS; x += 1) {
      ctx.beginPath();
      ctx.moveTo(x * CELL + 0.5, 0);
      ctx.lineTo(x * CELL + 0.5, ROWS * CELL);
      ctx.stroke();
    }
    for (let y = 0; y <= ROWS; y += 1) {
      ctx.beginPath();
      ctx.moveTo(0, y * CELL + 0.5);
      ctx.lineTo(COLS * CELL, y * CELL + 0.5);
      ctx.stroke();
    }

    for (let y = 0; y < ROWS; y += 1) {
      for (let x = 0; x < COLS; x += 1) {
        if (board[y][x]) drawTile(ctx, x * CELL, y * CELL, CELL, board[y][x]);
      }
    }

    if (active && phase !== "over") {
      const ghostY = getGhostY();
      drawPiece(ctx, active, ghostY, true);
      drawPiece(ctx, active, active.y, false);
    }
  }

  function drawPiece(ctx, piece, yPosition, ghost) {
    for (let y = 0; y < piece.matrix.length; y += 1) {
      for (let x = 0; x < piece.matrix[y].length; x += 1) {
        if (!piece.matrix[y][x]) continue;
        const px = (piece.x + x) * CELL;
        const py = (yPosition + y) * CELL;
        if (py < 0) continue;
        if (ghost) {
          ctx.strokeStyle = "rgba(245,245,240,.52)";
          ctx.lineWidth = 1.5;
          ctx.strokeRect(px + 4, py + 4, CELL - 8, CELL - 8);
        } else {
          drawTile(ctx, px, py, CELL, piece.type);
        }
      }
    }
  }

  function drawPreview(canvas, type) {
    const bounds = canvas.getBoundingClientRect();
    const width = Math.max(1, Math.round(bounds.width || 120));
    const height = Math.max(1, Math.round(bounds.height || (canvas === holdCanvas ? 72 : 60)));
    const previewCell = Math.max(8, Math.min(PREVIEW_CELL, width / 5, height / 4));
    const ctx = setupCanvas(canvas, width, height);
    ctx.clearRect(0, 0, width, height);
    if (!type) {
      ctx.strokeStyle = "#686868";
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 4]);
      ctx.strokeRect(35, height / 2 - 12, 50, 24);
      ctx.setLineDash([]);
      return;
    }
    const matrix = SHAPES[type];
    let minX = matrix[0].length;
    let maxX = -1;
    let minY = matrix.length;
    let maxY = -1;
    matrix.forEach((row, y) => row.forEach((value, x) => {
      if (value) {
        minX = Math.min(minX, x); maxX = Math.max(maxX, x);
        minY = Math.min(minY, y); maxY = Math.max(maxY, y);
      }
    }));
    const shapeWidth = (maxX - minX + 1) * previewCell;
    const shapeHeight = (maxY - minY + 1) * previewCell;
    const left = (width - shapeWidth) / 2;
    const top = (height - shapeHeight) / 2;
    for (let y = minY; y <= maxY; y += 1) {
      for (let x = minX; x <= maxX; x += 1) {
        if (matrix[y][x]) drawTile(ctx, left + (x - minX) * previewCell, top + (y - minY) * previewCell, previewCell, type);
      }
    }
  }

  function drawAll() {
    drawBoard();
    updatePreviews();
  }

  function getGhostY() {
    if (!active) return 0;
    let y = active.y;
    while (!collides(active, 0, y - active.y + 1)) y += 1;
    return y;
  }

  function move(dx, dy) {
    if (phase !== "playing" || !active) return false;
    if (!collides(active, dx, dy)) {
      active.x += dx;
      active.y += dy;
      drawBoard();
      return true;
    }
    return false;
  }

  function rotate(direction) {
    if (phase !== "playing" || !active || active.type === "O") return;
    const rotated = rotateMatrix(active.matrix, direction);
    const kicks = [[0, 0], [-1, 0], [1, 0], [-2, 0], [2, 0], [0, -1]];
    for (const [dx, dy] of kicks) {
      if (!collides(active, dx, dy, rotated)) {
        active.matrix = rotated;
        active.x += dx;
        active.y += dy;
        drawBoard();
        return;
      }
    }
  }

  function softDrop() {
    if (phase !== "playing" || !active) return;
    if (move(0, 1)) {
      score += 1;
      updateUI();
    } else {
      lockPiece();
    }
  }

  function hardDrop() {
    if (phase !== "playing" || !active) return;
    const landingY = getGhostY();
    const distance = landingY - active.y;
    active.y = landingY;
    score += distance * 2;
    updateUI();
    lockPiece();
  }

  function holdPiece() {
    if (phase !== "playing" || !active || hasHeldThisTurn) return;
    const currentType = active.type;
    if (heldType === null) {
      heldType = currentType;
      takeNextPiece();
    } else {
      const swapType = heldType;
      heldType = currentType;
      spawnPiece(swapType);
    }
    hasHeldThisTurn = true;
    updatePreviews();
    drawBoard();
  }

  function lockPiece() {
    if (!active || phase !== "playing") return;
    let toppedOut = false;
    for (let y = 0; y < active.matrix.length; y += 1) {
      for (let x = 0; x < active.matrix[y].length; x += 1) {
        if (!active.matrix[y][x]) continue;
        const boardX = active.x + x;
        const boardY = active.y + y;
        if (boardY < 0) toppedOut = true;
        else if (boardY < ROWS && boardX >= 0 && boardX < COLS) board[boardY][boardX] = active.type;
      }
    }
    if (toppedOut) {
      endGame();
      return;
    }

    let cleared = 0;
    board = board.filter((row) => {
      if (row.every((cell) => cell !== null)) {
        cleared += 1;
        return false;
      }
      return true;
    });
    while (board.length < ROWS) board.unshift(Array(COLS).fill(null));

    if (cleared > 0) {
      score += LINE_POINTS[cleared] * level;
      lines += cleared;
      level = Math.floor(lines / 10) + 1;
      announcement.textContent = `${cleared} ${cleared === 1 ? "line" : "lines"} cleared.`;
    }
    if (score > best) {
      best = score;
      saveBest();
    }
    active = null;
    updateUI();
    takeNextPiece();
    gravityAccumulator = 0;
    drawBoard();
  }

  function gravityInterval() {
    return Math.max(85, 850 * Math.pow(0.82, level - 1));
  }

  function gameLoop(timestamp) {
    if (phase !== "playing") return;
    const delta = Math.min(timestamp - lastFrame, 80);
    lastFrame = timestamp;
    gravityAccumulator += delta;
    const interval = gravityInterval();
    if (gravityAccumulator >= interval) {
      gravityAccumulator -= interval;
      if (!move(0, 1)) lockPiece();
    }
    drawBoard();
    animationId = requestAnimationFrame(gameLoop);
  }

  function handleControl(control) {
    if (phase !== "playing") return;
    switch (control) {
      case "left": move(-1, 0); break;
      case "right": move(1, 0); break;
      case "down": softDrop(); break;
      case "rotate": rotate(1); break;
      case "hold": holdPiece(); break;
      case "drop": hardDrop(); break;
      default: break;
    }
  }

  function handleKeydown(event) {
    const key = event.key.toLowerCase();
    const target = event.target;
    const isInteractive = target instanceof Element
      && Boolean(target.closest("button, select, input, textarea, a, [contenteditable=\"true\"]"));
    if (!isInteractive && [" ", "arrowleft", "arrowright", "arrowdown", "arrowup"].includes(key)) {
      event.preventDefault();
    }

    if (key === "enter" && (phase === "ready" || phase === "over")) {
      if (!isInteractive) startGame();
      return;
    }
    if ((key === "p" || key === "escape") && (phase === "playing" || phase === "paused")) {
      if (event.repeat || isInteractive) return;
      togglePause();
      return;
    }
    if (key === "r" && !isInteractive) {
      startGame();
      return;
    }
    if (phase !== "playing" || isInteractive) return;

    switch (key) {
      case "arrowleft": move(-1, 0); break;
      case "arrowright": move(1, 0); break;
      case "arrowdown": softDrop(); break;
      case "arrowup":
      case "x": rotate(1); break;
      case "z": rotate(-1); break;
      case " ":
        if (!event.repeat) hardDrop();
        break;
      case "c":
        if (!event.repeat) holdPiece();
        break;
      default: break;
    }
  }

  function saveBest() {
    try {
      if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
        chrome.storage.local.set({ bestScore: best });
      } else {
        localStorage.setItem("blockFallBestScore", String(best));
      }
    } catch (_error) {
      // A storage failure should never interrupt a game.
    }
    $("best-value").textContent = String(best).padStart(6, "0");
  }

  function loadBest() {
    try {
      if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
        chrome.storage.local.get(["bestScore"], (result) => {
          best = Number(result.bestScore) || 0;
          updateUI();
        });
      } else {
        best = Number(localStorage.getItem("blockFallBestScore")) || 0;
        updateUI();
      }
    } catch (_error) {
      best = 0;
      updateUI();
    }
  }

  function focusBoard() {
    boardCanvas.focus({ preventScroll: true });
  }

  startButton.addEventListener("click", () => {
    if (phase === "paused") togglePause();
    else startGame();
    focusBoard();
  });
  pauseButton.addEventListener("click", () => {
    togglePause();
    focusBoard();
  });
  restartButton.addEventListener("click", () => {
    startGame();
    focusBoard();
  });
  boardCanvas.addEventListener("pointerdown", focusBoard);
  document.addEventListener("keydown", handleKeydown);
  document.querySelectorAll("[data-control]").forEach((button) => {
    button.addEventListener("click", () => {
      handleControl(button.dataset.control);
      focusBoard();
    });
  });
  window.addEventListener("resize", drawAll);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden && phase === "playing") togglePause();
  });

  loadBest();
  updateUI();
  drawAll();
})();
