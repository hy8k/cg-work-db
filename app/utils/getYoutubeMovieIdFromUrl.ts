export function getYoutubeMovieIdFromUrl(url: string) {
    const patterns = [
        { prefix: "watch?v=", offset: 8 },
        { prefix: "/embed/", offset: 7 },
        { prefix: "/v/", offset: 3 },
        { prefix: "/live/", offset: 6 },
        { prefix: "youtu.be/", offset: 9 }
    ];

    for (const pattern of patterns) {
        const index = url.indexOf(pattern.prefix);
        if (index !== -1) {
            return url.substr(index + pattern.offset, 11);
        }
    }

    return "";
}