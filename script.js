// Data Pemain Bawaan (Bisa kamu ganti default-nya di sini)
let players = [
    { name: "Pemain 1", history: [], totalScore: 0, isRT: false },
    { name: "Pemain 2", history: [], totalScore: 0, isRT: false },
    { name: "Pemain 3", history: [], totalScore: 0, isRT: false },
    { name: "pemain 4", history: [], totalScore: 0, isRT: false }
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

// Jalankan saat pertama kali web dibuka
window.onload = () => {
    initScoreboardTable();
    renderDashboard();
    renderTable();
};

// 1. Fungsi Membuat Header Tabel
function initScoreboardTable() {
    tableHeaderRow.innerHTML = '<th>Ronde</th>';
    players.forEach(player => {
        const th = document.createElement('th');
        th.innerText = player.name;
        tableHeaderRow.appendChild(th);
    });
}

// 2. Fungsi Menggambar Dashboard Atas
function renderDashboard() {
    roundTitle.innerText = `Input Skor Ronde ${currentRound}`;

    // Render form input
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

    // Deteksi Ketua RT (Minus Terbanyak)
    let minScore = Infinity;
    // Cek jika sudah ada histori skor, baru hitung RT
    if (players[0].history.length > 0) {
        players.forEach(p => {
            if (p.totalScore < minScore) minScore = p.totalScore;
        });
        players.forEach(p => {
            p.isRT = (p.totalScore === minScore);
        });
    } else {
        // Reset flag RT jika tidak ada histori
        players.forEach(p => p.isRT = false);
    }

    // Render Leaderboard Atas dengan fitur Klik Edit Nama
    leaderboardContainer.innerHTML = '';
    players.forEach((player, index) => {
        const card = document.createElement('div');
        card.className = `card-player ${player.isRT ? 'is-rt' : ''}`;
        
        // Perhatikan class 'editable-text' dan onclick='editName' di sini
        card.innerHTML = `
            <div class="rt-badge">🧹 KETUA RT (Kocok)</div>
            <div class="name editable-text" onclick="editName(${index})" title="Klik untuk ubah nama">✏️ ${player.name}</div>
            <div class="score">${player.totalScore}</div>
        `;
        leaderboardContainer.appendChild(card);
    });
}

// 3. Fungsi Khusus Menggambar Tabel Riwayat
function renderTable() {
    tableBody.innerHTML = '';
    const totalHistoryRounds = currentRound - 1;

    for (let r = 0; r < totalHistoryRounds; r++) {
        const tr = document.createElement('tr');
        let tdHtml = `<td><b>R-${r + 1}</b></td>`;
        
        players.forEach((player, pIndex) => {
            const score = player.history[r];
            const colorStyle = score < 0 ? 'style="color: #f87171; font-weight:bold;"' : '';
            
            // Perhatikan class 'editable-score' dan onclick='editScore' di sini
            tdHtml += `<td class="editable-score" ${colorStyle} onclick="editScore(${pIndex}, ${r})" title="Klik untuk edit skor">${score}</td>`;
        });
        
        tr.innerHTML = tdHtml;
        tableBody.appendChild(tr);
    }
}

// ================= FITUR EDIT ================= //

// 4. Fungsi Edit Nama
function editName(index) {
    const newName = prompt("Masukkan nama baru untuk pemain ini:", players[index].name);
    
    // Jika tidak dibatalkan (Cancel) dan nama tidak kosong
    if (newName !== null && newName.trim() !== "") {
        players[index].name = newName.trim();
        initScoreboardTable(); // Segarkan nama di kolom tabel
        renderDashboard();     // Segarkan nama di kartu leaderboard
    }
}

// 5. Fungsi Edit Skor
function editScore(playerIndex, roundIndex) {
    const currentScore = players[playerIndex].history[roundIndex];
    const newScoreStr = prompt(`Koreksi skor ${players[playerIndex].name} di Ronde ${roundIndex + 1}:`, currentScore);
    
    if (newScoreStr !== null && newScoreStr.trim() !== "") {
        const newScore = parseInt(newScoreStr);
        
        if (!isNaN(newScore)) {
            // Timpa angka lama dengan angka baru di memori (history)
            players[playerIndex].history[roundIndex] = newScore;
            
            // Hitung ulang total skor pemain tersebut dari nol
            players[playerIndex].totalScore = players[playerIndex].history.reduce((total, nilai) => total + nilai, 0);
            
            // Segarkan tampilan layar
            renderDashboard();
            renderTable();
        } else {
            alert("Gagal mengedit! Harap masukkan format angka yang valid (contoh: 20 atau -15).");
        }
    }
}

// ================= TOMBOL UTAMA ================= //

// Tombol Simpan Ronde
btnSubmitRound.addEventListener('click', () => {
    let currentRoundScores = [];

    // Ambil input
    for (let i = 0; i < players.length; i++) {
        const inputEl = document.getElementById(`input-score-${i}`);
        let val = parseInt(inputEl.value);
        if (isNaN(val)) val = 0; 
        currentRoundScores.push(val);
    }

    // Update state dan total skor
    players.forEach((player, index) => {
        const scoreThisRound = currentRoundScores[index];
        player.history.push(scoreThisRound);
        player.totalScore += scoreThisRound;
    });

    currentRound++;
    renderDashboard();
    renderTable(); // Gambar ulang tabel dengan data baru
});

// Tombol Reset Permainan
btnResetGame.addEventListener('click', () => {
    if (confirm('Yakin ingin mereset permainan ke nol? Semua skor akan dihapus.')) {
        currentRound = 1;
        
        // Reset history dan skor tiap pemain
        players.forEach(player => {
            player.history = [];
            player.totalScore = 0;
            player.isRT = false;
        });

        renderDashboard();
        renderTable();
    }
});