document.addEventListener("DOMContentLoaded", () => {
  const btnLoad = document.getElementById("btn-load");
  const btnPrev = document.getElementById("btn-prev");
  const btnNext = document.getElementById("btn-next");
  const pageNumDisplay = document.getElementById("page-num");
  const torrentList = document.getElementById("torrent-list");
  const loadingIndicator = document.getElementById("loading");

  let currentPage = 1;
  const itemsPerPage = 50;

  btnLoad.addEventListener("click", () => {
    currentPage = 1;
    loadTorrents();
  });

  btnPrev.addEventListener("click", () => {
    if (currentPage > 1) {
      currentPage--;
      loadTorrents();
    }
  });

  btnNext.addEventListener("click", () => {
    currentPage++;
    loadTorrents();
  });

  async function loadTorrents() {
    // UI Loading State
    btnLoad.disabled = true;
    btnPrev.disabled = true;
    btnNext.disabled = true;
    loadingIndicator.style.display = "inline";
    torrentList.innerHTML = ""; // Clear existing

    try {
      const result = await window.rdApi.getTorrents(currentPage, itemsPerPage);
      const { torrents, totalCount } = result;
      const totalPages = Math.ceil(totalCount / itemsPerPage) || 1;

      pageNumDisplay.innerText = `Page ${currentPage} of ${totalPages}`;
      renderTorrents(torrents);

      // Enable/Disable buttons based on current state
      btnPrev.disabled = currentPage === 1;
      btnNext.disabled = currentPage >= totalPages;
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
            <div class="col-actions">Actions</div>
        `;
    torrentList.appendChild(headerRow);

    // Create Data Rows
    torrents.forEach((torrent) => {
      const row = document.createElement("div");

      const name = torrent.filename || "Unknown";
      const status = torrent.status || "unknown";
      const progress = torrent.progress ? `${torrent.progress}%` : "0%";
      const fileId = torrent.id;
      row.className = "torrent-row";
      row.setAttribute("data-file-id", fileId);
      row.innerHTML = `
                <div class="col-name" title="${name}" "data-file-id="${fileId}">${name}</div>
                <div class="col-status">${status}</div>
                <div class="col-progress">${progress}</div>
                <div class="col-actions">
                  <button class="material-symbols">play_arrow</button>
                  <button class="material-symbols">more_vert</button>
                </div>
            `;

      torrentList.appendChild(row);
    });
  }
});
