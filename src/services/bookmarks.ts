import { useState, useEffect, useMemo } from "react";
import type { Torrent } from "@/types/torrent";

const BOOKMARKS_STORAGE_KEY = "rd_bookmarks";

export function getBookmarks(): Torrent[] {
    if (typeof window === "undefined") return [];
    try {
        const stored = localStorage.getItem(BOOKMARKS_STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch {
        return [];
    }
}

export function isBookmarked(id: string): boolean {
    const bookmarks = getBookmarks();
    return bookmarks.some((b) => b.id === id);
}

export function toggleBookmark(torrent: Torrent): boolean {
    const bookmarks = getBookmarks();
    const index = bookmarks.findIndex((b) => b.id === torrent.id);
    let isBookmarked = false;

    if (index >= 0) {
        bookmarks.splice(index, 1);
        isBookmarked = false;
    } else {
        bookmarks.unshift(torrent);
        isBookmarked = true;
    }

    try {
        localStorage.setItem(BOOKMARKS_STORAGE_KEY, JSON.stringify(bookmarks));
        window.dispatchEvent(new CustomEvent("rd_bookmarks_updated"));
    } catch (e) {
        console.error("Failed to save bookmarks:", e);
    }

    return isBookmarked;
}

export function useBookmarks() {
    const [bookmarks, setBookmarks] = useState<Torrent[]>(() => getBookmarks());

    useEffect(() => {
        const update = () => setBookmarks(getBookmarks());
        window.addEventListener("rd_bookmarks_updated", update);
        window.addEventListener("storage", update);
        return () => {
            window.removeEventListener("rd_bookmarks_updated", update);
            window.removeEventListener("storage", update);
        };
    }, []);

    const bookmarkedIds = useMemo(() => new Set(bookmarks.map((b) => b.id)), [bookmarks]);

    return {
        bookmarks,
        bookmarkedIds,
        toggle: (torrent: Torrent) => toggleBookmark(torrent),
        isBookmarked: (id: string) => bookmarkedIds.has(id),
    };
}
