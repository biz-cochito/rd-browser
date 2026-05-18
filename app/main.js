document.addEventListener("DOMContentLoaded", () => {
    const btnLoad = document.getElementById("btn-load");
    const torrentList = document.getElementById("torrent-list");
    const loadingIndicator = document.getElementById("loading");

    btnLoad.addEventListener("click", loadTorrents);

    async function loadTorrents() {
        // UI Loading State
        btnLoad.disabled = true;
        loadingIndicator.style.display = "inline";
        torrentList.innerHTML = ""; // Clear existing

        try {
            const torrents = await window.rdApi.getTorrents(200);
            renderTorrents(torrents);
        } catch (error) {
            console.error("Failed to load torrents:", error);
            torrentList.innerHTML = `<div class="torrent-row" style="color: red;">Error loading torrents: ${error.message}</div>`;
        } finally {
            // UI Reset State
            btnLoad.disabled = false;
            loadingIndicator.style.display = "none";
        }
    }

    function renderTorrents(torrents) {
        if (!torrents || torrents.length === 0) {
            torrentList.innerHTML = `<div class="torrent-row">No torrents found.</div>`;
            return;
        }

        // Create Header Row
        const headerRow = document.createElement("div");
        headerRow.className = "torrent-row torrent-header";
        headerRow.innerHTML = `
            <div class="col-name">Name</div>
            <div class="col-status">Status</div>
            <div class="col-progress">Progress</div>
        `;
        torrentList.appendChild(headerRow);

        // Create Data Rows
        torrents.forEach((torrent) => {
            const row = document.createElement("div");
            row.className = "torrent-row";

            try {
                const videoLink = (torrent.links) => {

                }
            }
            const name = torrent.filename || "Unknown";
            const status = torrent.status || "unknown";
            const progress = torrent.progress ? `${torrent.progress}%` : "0%";

            row.innerHTML = `
                <div class="col-name" title="${name}">${name}</div>
                <div class="col-status">${status}</div>
                <div class="col-progress">${progress}</div>
            `;

            torrentList.appendChild(row);
        });
    }
});
