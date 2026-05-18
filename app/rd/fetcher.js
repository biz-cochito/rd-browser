async function getTorrents(limit = 50, page = 1) {
    try {
        const response = await fetch(
            `/api/torrents?limit=${limit}&page=${page}`,
        );
        if (!response.ok) throw new Error("Failed to fetch torrents");

        const data = await response.json();
        console.log("Torrents:", data);
        return data;
    } catch (error) {
        console.error(error);
    }
}
