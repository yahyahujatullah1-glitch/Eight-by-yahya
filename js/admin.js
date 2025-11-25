// --- CREDENTIALS (SIMULATED) ---
const ADMIN_USER = "eight@admin9192";
const ADMIN_PASS = "eight39";

// --- FAKE DATABASE (Local Storage) ---
// If no data exists, create some fake players
if (!localStorage.getItem('eightRP_players')) {
    const initialPlayers = [
        { id: 101, name: "Sharma Ji", discord: "sharma#999", money: 5000000, status: "Active" },
        { id: 102, name: "Edgar", discord: "edgar#123", money: 120000, status: "Active" },
        { id: 103, name: "Random Guy", discord: "troll#000", money: 50, status: "Banned" }
    ];
    localStorage.setItem('eightRP_players', JSON.stringify(initialPlayers));
}

// --- LOGIN FUNCTION ---
function attemptLogin() {
    const userInput = document.getElementById('username').value;
    const passInput = document.getElementById('password').value;
    const errorMsg = document.getElementById('error-msg');

    if (userInput === ADMIN_USER && passInput === ADMIN_PASS) {
        // Success
        document.getElementById('login-view').style.display = "none";
        document.getElementById('dashboard-view').style.display = "flex";
        loadTable(); // Load data
    } else {
        // Fail
        errorMsg.style.display = "block";
        errorMsg.innerText = "Invalid Credentials Access Denied.";
    }
}

// --- LOGOUT ---
function logout() {
    location.reload(); // Simply reload page to reset
}

// --- LOAD TABLE DATA ---
function loadTable() {
    const players = JSON.parse(localStorage.getItem('eightRP_players'));
    const tbody = document.getElementById('player-table-body');
    tbody.innerHTML = ""; // Clear existing

    players.forEach((player, index) => {
        // Determine Badge Color
        const badgeClass = player.status === "Active" ? "active-badge" : "banned-badge";
        
        const row = `
            <tr>
                <td>#${player.id}</td>
                <td><strong>${player.name}</strong></td>
                <td style="color:#aaa">${player.discord}</td>
                <td style="color:var(--primary)">$${player.money.toLocaleString()}</td>
                <td><span class="badge ${badgeClass}">${player.status}</span></td>
                <td>
                    <button class="action-btn btn-ban" onclick="toggleBan(${index})">
                        ${player.status === "Active" ? "Ban" : "Unban"}
                    </button>
                    <button class="action-btn btn-kick" onclick="deleteUser(${index})">Delete</button>
                </td>
            </tr>
        `;
        tbody.innerHTML += row;
    });
}

// --- ADMIN ACTIONS ---

// 1. Toggle Ban Status
function toggleBan(index) {
    let players = JSON.parse(localStorage.getItem('eightRP_players'));
    
    if (players[index].status === "Active") {
        players[index].status = "Banned";
    } else {
        players[index].status = "Active";
    }

    localStorage.setItem('eightRP_players', JSON.stringify(players));
    loadTable(); // Refresh table
}

// 2. Delete User
function deleteUser(index) {
    if(confirm("Are you sure you want to delete this player data?")) {
        let players = JSON.parse(localStorage.getItem('eightRP_players'));
        players.splice(index, 1); // Remove from array
        localStorage.setItem('eightRP_players', JSON.stringify(players));
        loadTable();
    }
}

// 3. Add Mock User (For testing)
function addFakeUser() {
    let players = JSON.parse(localStorage.getItem('eightRP_players'));
    const names = ["DrifterX", "CopRoleplay", "MafiaBoss", "Newbie101"];
    
    const newPlayer = {
        id: Math.floor(Math.random() * 900) + 100,
        name: names[Math.floor(Math.random() * names.length)],
        discord: "user#" + Math.floor(Math.random() * 9999),
        money: Math.floor(Math.random() * 100000),
        status: "Active"
    };

    players.push(newPlayer);
    localStorage.setItem('eightRP_players', JSON.stringify(players));
    loadTable();
}
