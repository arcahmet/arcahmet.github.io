// ================================
// 1. YARDIMCI FONKSİYONLAR
// ================================

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function isValid(board, row, col, num) {
    for (let c = 0; c < 9; c++) if (board[row][c] === num) return false;
    for (let r = 0; r < 9; r++) if (board[r][col] === num) return false;
    const boxRow = Math.floor(row / 3) * 3;
    const boxCol = Math.floor(col / 3) * 3;
    for (let r = 0; r < 3; r++)
        for (let c = 0; c < 3; c++)
            if (board[boxRow + r][boxCol + c] === num) return false;
    return true;
}

// ================================
// 2. SUDOKU ÜRETME ALGORİTMASI
// ================================

function fillBoard(board) {
    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            if (board[row][col] === 0) {
                const numbers = shuffle([1,2,3,4,5,6,7,8,9]);
                for (let num of numbers) {
                    if (isValid(board, row, col, num)) {
                        board[row][col] = num;
                        if (fillBoard(board)) return true;
                        board[row][col] = 0;
                    }
                }
                return false;
            }
        }
    }
    return true;
}

// ================================
// 3. ZORLUK AYARI
// ================================

const DIFFICULTY = {
    easy:   36,
    medium: 46,
    hard:   52,
    expert: 58
};

function removeNumbers(board, count) {
    const puzzle = board.map(row => [...row]);
    let removed = 0;
    while (removed < count) {
        const row = Math.floor(Math.random() * 9);
        const col = Math.floor(Math.random() * 9);
        if (puzzle[row][col] !== 0) {
            puzzle[row][col] = 0;
            removed++;
        }
    }
    return puzzle;
}

// ================================
// 4. OYUN DURUMU
// ================================

let currentPuzzle = null;
let currentSolution = null;
let solutionVisible = false;
let timerInterval = null;
let seconds = 0;
let mistakeCount = 0;
let hintCount = 3;
let gameOver = false;
let selectedInput = null;

function startTimer() {
    clearInterval(timerInterval);
    seconds = 0;
    updateTimerDisplay();
    timerInterval = setInterval(() => {
        if (!gameOver) {
            seconds++;
            updateTimerDisplay();
        }
    }, 1000);
}

function updateTimerDisplay() {
    const m = String(Math.floor(seconds / 60)).padStart(2, '0');
    const s = String(seconds % 60).padStart(2, '0');
    document.getElementById('timer').textContent = `${m}:${s}`;
}

function resetGameState() {
    gameOver = false;
    mistakeCount = 0;
    hintCount = 3;
    document.getElementById('mistakeCount').textContent = '0';
    document.getElementById('hintCount').textContent = '3';
    startTimer();
}

// ================================
// 5. TAHTAYI ÇİZ
// ================================

function drawBoard(puzzle, solution, showSolution = false) {
    const boardEl = document.getElementById('board');
    boardEl.innerHTML = '';

    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');

            if (puzzle[row][col] !== 0) {
                cell.textContent = puzzle[row][col];
                cell.classList.add('given');
                cell.addEventListener('click', () => {
    document.querySelectorAll('.cell').forEach(c => {
        c.classList.remove('highlighted', 'same-number');
    });
    const num = String(puzzle[row][col]);
    document.querySelectorAll('.cell').forEach(c => {
        const cIdx = [...c.parentElement.children].indexOf(c);
        const cRow = Math.floor(cIdx / 9);
        const cCol = cIdx % 9;
        if (cRow === row || cCol === col) c.classList.add('highlighted');
        const cInput = c.querySelector('.cell-input');
        const cText = c.textContent.trim();
        if (cInput && cInput.value === num) c.classList.add('same-number');
        else if (!cInput && cText === num) c.classList.add('same-number');
    });
});
            } else if (showSolution) {
                cell.textContent = solution[row][col];
                cell.classList.add('solution');
            } else {
                const input = document.createElement('input');
                input.type = 'text';
                input.maxLength = 1;
                input.classList.add('cell-input');
                input.dataset.solution = solution[row][col];
                input.dataset.row = row;
                input.dataset.col = col;

                input.addEventListener('input', (e) => {
                    highlightRowCol(e.target);
                    const val = e.target.value;
                    if (!/^[1-9]$/.test(val)) {
                        e.target.value = '';
                        e.target.classList.remove('correct', 'wrong');
                        return;
                    }
                    if (parseInt(val) === solution[row][col]) {
                        e.target.classList.add('correct');
                        e.target.classList.remove('wrong');
                        checkWin();
                    } else {
                        e.target.classList.add('wrong');
                        e.target.classList.remove('correct');
                        mistakeCount++;
                        document.getElementById('mistakeCount').textContent = mistakeCount;
                        if (mistakeCount >= 3) {
                            gameOver = true;
                            clearInterval(timerInterval);
                            setTimeout(() => {
                                alert('❌ 3 hata yaptın! Puzzle yeniden başlıyor...');
                                generatePuzzle();
                            }, 300);
                        }
                    }
                });

                cell.appendChild(input);
            }

            boardEl.appendChild(cell);
        }
    }
}

// ================================
// 6. KAZANMA & SKOR
// ================================

function checkWin() {
    const inputs = document.querySelectorAll('.cell-input');
    const allCorrect = [...inputs].every(input => input.classList.contains('correct'));
    if (allCorrect) {
        gameOver = true;
        clearInterval(timerInterval);
        const m = String(Math.floor(seconds / 60)).padStart(2, '0');
        const s = String(seconds % 60).padStart(2, '0');
        setTimeout(() => {
            showCelebration(`🎉 Tebrikler! ${m}:${s} sürede çözdün!`);
            saveBestScore();
        }, 300);
    }
}

function showCelebration(message) {
    const el = document.createElement('div');
    el.className = 'celebration';
    el.textContent = message;
    document.querySelector('.container').prepend(el);
    setTimeout(() => el.remove(), 4000);
}

function saveBestScore() {
    const difficulty = document.getElementById('difficulty').value;
    const key = `bestScore_${difficulty}`;
    const prev = localStorage.getItem(key);
    if (!prev || seconds < parseInt(prev)) {
        localStorage.setItem(key, seconds);
    }
    updateScoreTable();
}

function updateScoreTable() {
    ['easy', 'medium', 'hard', 'expert'].forEach(d => {
        const val = localStorage.getItem(`bestScore_${d}`);
        const el = document.getElementById(`score_${d}`);
        if (el) {
            if (val) {
                const m = String(Math.floor(parseInt(val) / 60)).padStart(2, '0');
                const s = String(parseInt(val) % 60).padStart(2, '0');
                el.textContent = `${m}:${s}`;
            } else {
                el.textContent = '--:--';
            }
        }
    });
}
// ================================
// OK TUŞU NAVİGASYONU
// ================================

document.getElementById('board').addEventListener('keydown', (e) => {
    if (!selectedInput) return;
    const row = parseInt(selectedInput.dataset.row);
    const col = parseInt(selectedInput.dataset.col);

    let newRow = row, newCol = col;

    if (e.key === 'ArrowUp')    { newRow = row - 1; e.preventDefault(); }
    if (e.key === 'ArrowDown')  { newRow = row + 1; e.preventDefault(); }
    if (e.key === 'ArrowLeft')  { newCol = col - 1; e.preventDefault(); }
    if (e.key === 'ArrowRight') { newCol = col + 1; e.preventDefault(); }

    if (newRow < 0 || newRow > 8 || newCol < 0 || newCol > 8) return;
    if (newRow === row && newCol === col) return;

    // Hedef hücredeki input'u bul
    const allInputs = [...document.querySelectorAll('.cell-input')];
    const target = allInputs.find(
        i => parseInt(i.dataset.row) === newRow && parseInt(i.dataset.col) === newCol
    );

    if (target) {
        target.focus();
    } else {
        // Verilen sayı olan hücre — bir sonrakine atla
        const directions = { ArrowUp: [-1,0], ArrowDown: [1,0], ArrowLeft: [0,-1], ArrowRight: [0,1] };
        const [dr, dc] = directions[e.key] || [0,0];
        let r = newRow + dr, c = newCol + dc;
        while (r >= 0 && r <= 8 && c >= 0 && c <= 8) {
            const next = allInputs.find(
                i => parseInt(i.dataset.row) === r && parseInt(i.dataset.col) === c
            );
            if (next) { next.focus(); break; }
            r += dr; c += dc;
        }
    }
});
// ================================
// 7. PUZZLE ÜRET
// ================================

function generatePuzzle() {
    const board = Array.from({length: 9}, () => Array(9).fill(0));
    fillBoard(board);
    currentSolution = board.map(row => [...row]);
    const difficulty = document.getElementById('difficulty').value;
    currentPuzzle = removeNumbers(board, DIFFICULTY[difficulty]);
    solutionVisible = false;
    document.getElementById('solveBtn').textContent = 'Çözümü Göster';
    drawBoard(currentPuzzle, currentSolution, false);
    resetGameState();
    updateScoreTable();
}

// ================================
// 8. KAYDET & YÜKLE
// ================================

function saveGame() {
    if (!currentPuzzle || gameOver) return;
    const inputs = [...document.querySelectorAll('.cell-input')];
    const userProgress = inputs.map(input => ({
        value: input.value || '',
        correct: input.classList.contains('correct'),
        wrong: input.classList.contains('wrong')
    }));
    localStorage.setItem('savedGame', JSON.stringify({
        puzzle: currentPuzzle,
        solution: currentSolution,
        difficulty: document.getElementById('difficulty').value,
        seconds,
        mistakeCount,
        hintCount,
        userProgress
    }));
    showToast('💾 Oyun kaydedildi!');
}

function loadGame() {
    const saved = localStorage.getItem('savedGame');
    if (!saved) {
        showToast('📂 Kayıtlı oyun bulunamadı!');
        return;
    }
    const data = JSON.parse(saved);
    currentPuzzle = data.puzzle;
    currentSolution = data.solution;
    seconds = data.seconds;
    mistakeCount = data.mistakeCount;
    hintCount = data.hintCount;
    gameOver = false;
    solutionVisible = false;

    document.getElementById('difficulty').value = data.difficulty;
    document.getElementById('mistakeCount').textContent = mistakeCount;
    document.getElementById('hintCount').textContent = hintCount;

    drawBoard(currentPuzzle, currentSolution, false);

    const inputs = [...document.querySelectorAll('.cell-input')];
    data.userProgress.forEach((p, i) => {
        if (p.value && inputs[i]) {
            inputs[i].value = p.value;
            if (p.correct) inputs[i].classList.add('correct');
            if (p.wrong) inputs[i].classList.add('wrong');
        }
    });

    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        if (!gameOver) {
            seconds++;
            updateTimerDisplay();
        }
    }, 1000);
    updateTimerDisplay();
    updateScoreTable();
    showToast('📂 Oyun yüklendi!');
}

function showToast(message) {
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2500);
}

// ================================
// 9. NUMPAD & HIGHLIGHT
// ================================

document.getElementById('board').addEventListener('focusin', (e) => {
    if (e.target.classList.contains('cell-input')) {
        if (selectedInput) selectedInput.classList.remove('selected');
        selectedInput = e.target;
        selectedInput.classList.add('selected');
        highlightRowCol(e.target);
    }
});

function highlightRowCol(input) {
    document.querySelectorAll('.cell').forEach(c => {
        c.classList.remove('highlighted', 'same-number');
    });

    const row = parseInt(input.dataset.row);
    const col = parseInt(input.dataset.col);
    const val = input.value;

    document.querySelectorAll('.cell').forEach(cell => {
        const idx = [...cell.parentElement.children].indexOf(cell);
        const cellRow = Math.floor(idx / 9);
        const cellCol = idx % 9;

        if (cellRow === row || cellCol === col) {
            cell.classList.add('highlighted');
        }

        // Aynı sayıyı vurgula
        if (val && val !== '') {
            const cellInput = cell.querySelector('.cell-input');
            const cellText = cell.textContent.trim();
            if (cellInput && cellInput.value === val) {
                cell.classList.add('same-number');
            } else if (!cellInput && cellText === val) {
                cell.classList.add('same-number');
            }
        }
    });
}

document.getElementById('numpad').addEventListener('click', (e) => {
    const btn = e.target.closest('.num-btn');
    if (!btn || !selectedInput) return;
    const num = btn.dataset.num;
    if (num === '0') {
        selectedInput.value = '';
        selectedInput.classList.remove('correct', 'wrong');
    } else {
        selectedInput.value = num;
        selectedInput.dispatchEvent(new Event('input'));
    }
    document.querySelectorAll('.num-btn').forEach(b => b.classList.remove('active-num'));
    if (num !== '0') btn.classList.add('active-num');
    selectedInput.focus();
});

// ================================
// 10. BUTON EVENTLERİ
// ================================

document.getElementById('generateBtn').addEventListener('click', () => {
    localStorage.removeItem('savedGame');
    generatePuzzle();
});

document.getElementById('newGameBtn').addEventListener('click', () => {
    localStorage.removeItem('savedGame');
    generatePuzzle();
});
document.getElementById('solveBtn').addEventListener('click', () => {
    if (!currentPuzzle) return;
    solutionVisible = !solutionVisible;
    document.getElementById('solveBtn').textContent =
        solutionVisible ? 'Çözümü Gizle' : 'Çözümü Göster';
    drawBoard(currentPuzzle, currentSolution, solutionVisible);
});

document.getElementById('hintBtn').addEventListener('click', () => {
    if (hintCount <= 0 || gameOver) return;
    const inputs = [...document.querySelectorAll('.cell-input')];
    const empty = inputs.filter(i => !i.classList.contains('correct'));
    if (empty.length === 0) return;
    const random = empty[Math.floor(Math.random() * empty.length)];
    random.value = random.dataset.solution;
    random.classList.add('correct');
    random.classList.remove('wrong');
    hintCount--;
    document.getElementById('hintCount').textContent = hintCount;
    checkWin();
});

document.getElementById('saveBtn').addEventListener('click', saveGame);

document.getElementById('loadBtn').addEventListener('click', loadGame);

document.getElementById('themeBtn').addEventListener('click', () => {
    const isLight = document.documentElement.classList.toggle('light');
    document.getElementById('themeBtn').textContent = isLight ? '🌙 Dark Mode' : '☀️ Light Mode';
});

document.getElementById('pdfBtn').addEventListener('click', () => {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p', 'mm', 'a4');
    const difficulty = document.getElementById('difficulty').value;
    const difficultyTR = { easy: 'Kolay', medium: 'Orta', hard: 'Zor', expert: 'Uzman' };
    const count = parseInt(document.getElementById('puzzleCount').value);
    const puzzles = [], solutions = [];
    for (let i = 0; i < count; i++) {
        const board = Array.from({length: 9}, () => Array(9).fill(0));
        fillBoard(board);
        solutions.push(board.map(row => [...row]));
        puzzles.push(removeNumbers(board, DIFFICULTY[difficulty]));
    }
    const pageW = 210, pageH = 297, margin = 10;
    const cols = count <= 2 ? 1 : 2;
    const rows = Math.ceil(count / cols);
    const areaW = (pageW - margin * 2 - (cols - 1) * 5) / cols;
    const areaH = (pageH - margin * 2 - (rows - 1) * 10 - 20) / rows;
    const cellSize = Math.min(areaW / 9, areaH / 10);

    function drawGrid(doc, puzzle, startX, startY, label) {
        doc.setFontSize(9);
        doc.setTextColor(120);
        doc.text(label, startX + (9 * cellSize) / 2, startY - 3, { align: 'center' });
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                const x = startX + col * cellSize;
                const y = startY + row * cellSize;
                const blockRow = Math.floor(row / 3);
                const blockCol = Math.floor(col / 3);
                if ((blockRow + blockCol) % 2 === 0) {
                    doc.setFillColor(240, 240, 248);
                    doc.rect(x, y, cellSize, cellSize, 'F');
                }
                doc.setDrawColor(180);
                doc.setLineWidth(0.2);
                doc.rect(x, y, cellSize, cellSize);
                if (puzzle[row][col] !== 0) {
                    doc.setFontSize(cellSize * 0.55 * 2.83);
                    doc.setTextColor(40, 40, 40);
                    doc.text(String(puzzle[row][col]), x + cellSize / 2, y + cellSize * 0.68, { align: 'center' });
                }
            }
        }
        doc.setDrawColor(60);
        doc.setLineWidth(0.8);
        for (let i = 0; i <= 9; i += 3) {
            doc.line(startX + i * cellSize, startY, startX + i * cellSize, startY + 9 * cellSize);
            doc.line(startX, startY + i * cellSize, startX + 9 * cellSize, startY + i * cellSize);
        }
    }

    function drawPage(doc, list, pageTitle, labels) {
        doc.setFontSize(14);
        doc.setTextColor(60, 60, 60);
        doc.text(pageTitle, pageW / 2, margin + 6, { align: 'center' });
        doc.setFontSize(9);
        doc.setTextColor(140);
        doc.text(`Zorluk: ${difficultyTR[difficulty]}`, pageW / 2, margin + 12, { align: 'center' });
        list.forEach((puzzle, i) => {
            const col = i % cols;
            const row = Math.floor(i / cols);
            const x = margin + col * (areaW + 5) + (areaW - 9 * cellSize) / 2;
            const y = margin + 20 + row * (areaH + 10) + (areaH - 9 * cellSize) / 2;
            drawGrid(doc, puzzle, x, y, labels[i]);
        });
    }

    drawPage(doc, puzzles, 'Sudoku Puzzles', puzzles.map((_, i) => `Puzzle ${i + 1}`));
    doc.addPage();
    drawPage(doc, solutions, 'Cevaplar', solutions.map((_, i) => `Cevap ${i + 1}`));
    doc.save(`sudoku-${difficulty}-x${count}.pdf`);
});

// ================================
// 11. BAŞLAT
// ================================

generatePuzzle();
updateScoreTable();