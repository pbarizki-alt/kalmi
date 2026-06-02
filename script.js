// Data Pemain Bawaan
let players = [
    { name: "Pemain 1", history: [], totalScore: 0, isRT: false, rtCount: 0, surprises: [] },
    { name: "Pemain 2", history: [], totalScore: 0, isRT: false, rtCount: 0, surprises: [] },
    { name: "Pemain 3", history: [], totalScore: 0, isRT: false, rtCount: 0, surprises: [] },
    { name: "pemain 4", history: [], totalScore: 0, isRT: false, rtCount: 0, surprises: [] }
];

let currentRound = 1;

// Elemen HTML
const leaderboardContainer = document.getElementById('leaderboard-container');
const roundTitle = document.getElementById('round-title');
const roundInputsContainer = document.getElementById('round-inputs-container');
const btnSubmitRound = document.getElementById('btn-submit-round');
const tableHeaderRow = document.getElementById('table-header-row');
const tableBody = document.getElementById('table-body');
const btnResetGame = document.getElementById('btn-reset-game');

// Daftar Kejutan & Batas Minus
const surpriseThresholds = [
    { limit: -1000, text: "WIS COCOK DADI RT" },
    { limit: -500, text: "-500 WIS KENA NGGO TUKU PERMEN" },
    { limit: -400, text: "DI BUKET NGOCOKE"},
    { limit: -300, text: "MINUS TERUS KAYA WONGE" },
    { limit: -200, text: "TAMBAH MANING SING AKEH" },
    { limit: -100, text: "MAINE DIBENER" }
];

window.onload = () => {
    initScoreboardTable();
    renderDashboard();
    renderTable();
};

function initScoreboardTable() {
    tableHeaderRow.innerHTML = '<th>Ronde</th>';
    players.forEach(player => {
        const th = document.createElement('th');
        th.innerText = player.name;
        tableHeaderRow.appendChild(th);
    });
}

function renderDashboard() {
    roundTitle.innerText = `Input Skor Ronde ${currentRound}`;

    roundInputsContainer.innerHTML = '';
    players.forEach((player, index) => {
        const row = document.createElement('div');
        row.className = 'input-row';
        row.innerHTML = `
            <label>${player.name}</label>
            <input type="number" id="input-score-${index}" placeholder="0" pattern="[0-9-]*">
        `;
        roundInputsContainer.appendChild(row);
    });

    // === LOGIKA PENGHITUNG RT (Real-time & Tahan Edit) ===
    let minScore = Infinity;
    if (players[0].history.length > 0) {
        // 1. Cari siapa yang RT saat ini
        players.forEach(p => {
            if (p.totalScore < minScore) minScore = p.totalScore;
        });
        players.forEach(p => {
            p.isRT = (p.totalScore === minScore);
        });

        // 2. Hitung berapa kali masing-masing pemain pernah jadi RT dari ronde 1
        players.forEach(p => p.rtCount = 0); // Reset hitungan sementara
        const numRounds = players[0].history.length;
        let runningScores = new Array(players.length).fill(0);

        for (let r = 0; r < numRounds; r++) {
            let minRunning = Infinity;
            // Kumpulkan skor tiap pemain sampai ronde r
            for (let p = 0; p < players.length; p++) {
                runningScores[p] += players[p].history[r];
                if (runningScores[p] < minRunning) {
                    minRunning = runningScores[p];
                }
            }
            // Tambahkan +1 rtCount ke pemain yang paling minus di ronde itu
            for (let p = 0; p < players.length; p++) {
                if (runningScores[p] === minRunning) {
                    players[p].rtCount++;
                }
            }
        }
    } else {
        // Jika belum ada ronde dimainkan
        players.forEach(p => {
            p.isRT = false;
            p.rtCount = 0;
        });
    }

    // === RENDER KARTU PEMAIN & GELAR ===
    leaderboardContainer.innerHTML = '';
    players.forEach((player, index) => {
        const card = document.createElement('div');
        card.className = `card-player ${player.isRT ? 'is-rt' : ''}`;
        
        // Cek jika sudah 3x atau lebih jadi RT, munculkan medali
        let badgeHTML = '';
        if (player.rtCount >= 3) {
            badgeHTML = `<div class="pengocok-badge">🏅 PENGOCOK HANDAL</div>`;
        }

        card.innerHTML = `
            ${badgeHTML}
            <div class="rt-badge">🧹 KETUA RT (Kocok)</div>
            <div class="name editable-text" onclick="editName(${index})" title="Klik untuk ubah nama">✏️ ${player.name}</div>
            <div class="score">${player.totalScore}</div>
        `;
        leaderboardContainer.appendChild(card);
    });
}

function renderTable() {
    tableBody.innerHTML = '';
    const totalHistoryRounds = currentRound - 1;

    for (let r = 0; r < totalHistoryRounds; r++) {
        const tr = document.createElement('tr');
        let tdHtml = `<td><b>R-${r + 1}</b></td>`;
        
        players.forEach((player, pIndex) => {
            const score = player.history[r];
            const colorStyle = score < 0 ? 'style="color: #f87171; font-weight:bold;"' : '';
            tdHtml += `<td class="editable-score" ${colorStyle} onclick="editScore(${pIndex}, ${r})" title="Klik untuk edit skor">${score}</td>`;
        });
        
        tr.innerHTML = tdHtml;
        tableBody.appendChild(tr);
    }
}

// ================= FITUR EDIT ================= //
function editName(index) {
    const newName = prompt("Masukkan nama baru untuk pemain ini:", players[index].name);
    if (newName !== null && newName.trim() !== "") {
        players[index].name = newName.trim();
        initScoreboardTable();
        renderDashboard();
    }
}

function editScore(playerIndex, roundIndex) {
    const currentScore = players[playerIndex].history[roundIndex];
    const newScoreStr = prompt(`Koreksi skor ${players[playerIndex].name} di Ronde ${roundIndex + 1}:`, currentScore);
    
    if (newScoreStr !== null && newScoreStr.trim() !== "") {
        const newScore = parseInt(newScoreStr);
        if (!isNaN(newScore)) {
            players[playerIndex].history[roundIndex] = newScore;
            players[playerIndex].totalScore = players[playerIndex].history.reduce((total, nilai) => total + nilai, 0);
            renderDashboard();
            renderTable();
        } else {
            alert("Gagal mengedit! Harap masukkan format angka yang valid.");
        }
    }
}

// ================= TOMBOL SIMPAN RONDE ================= //
btnSubmitRound.addEventListener('click', () => {
    let currentRoundScores = [];

    for (let i = 0; i < players.length; i++) {
        const inputEl = document.getElementById(`input-score-${i}`);
        let val = parseInt(inputEl.value);
        if (isNaN(val)) val = 0; 
        currentRoundScores.push(val);
    }

    players.forEach((player, index) => {
        const scoreThisRound = currentRoundScores[index];
        player.history.push(scoreThisRound);
        player.totalScore += scoreThisRound;
    });

    currentRound++;
    
    // === LOGIKA KEJUTAN BERTINGKAT ===
    let triggerSurprise = false;
    let activeMessage = "";
    let targetNames = [];
    let lowestLimitHit = 0;

    players.forEach(player => {
        for (let i = 0; i < surpriseThresholds.length; i++) {
            const t = surpriseThresholds[i];
            if (player.totalScore <= t.limit && !player.surprises.includes(t.limit)) {
                triggerSurprise = true;
                player.surprises.push(t.limit); 
                targetNames.push(player.name);
                
                if (t.limit < lowestLimitHit) {
                    lowestLimitHit = t.limit;
                    activeMessage = t.text;
                }
                break; 
            }
        }
    });

    if (triggerSurprise) {
        const overlay = document.getElementById('surprise-overlay');
        const textContent = document.getElementById('surprise-text-content');
        
        const namesString = targetNames.join(" & ");
        textContent.innerHTML = `${activeMessage}<br>${namesString.toUpperCase()}!`;
        
        overlay.classList.add('show-surprise');
        
        setTimeout(() => {
            overlay.classList.remove('show-surprise');
        }, 3000);
    }

    renderDashboard();
    renderTable(); 
});

// ================= TOMBOL RESET ================= //
btnResetGame.addEventListener('click', () => {
    if (confirm('Yakin ingin mereset permainan ke nol? Semua skor akan dihapus.')) {
        currentRound = 1;
        
        players.forEach(player => {
            player.history = [];
            player.totalScore = 0;
            player.isRT = false;
            player.rtCount = 0;
            player.surprises = []; 
        });

        renderDashboard();
        renderTable();
    }
});