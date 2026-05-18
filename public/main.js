document.addEventListener("alpine:init", () => {
    Alpine.data("torrentManager", () => ({
        torrents: [],
        isLoading: false,

        async loadTorrents() {
            this.isLoading = true;
            try {
                const response = await fetch("/api/torrents?limit=5");
                const data = await response.json();
                this.torrents = data; // Alpine will automatically update the UI
            } catch (error) {
                console.error("Failed to load:", error);
            } finally {
                this.isLoading = false;
            }
        },
    }));
});
