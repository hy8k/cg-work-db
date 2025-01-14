export function getCookieDict(cookies: string | null) {
    const cookieDict: {
        [key: string]: string
    } = {};

    if (cookies  === null) {
        return {};
    }
    cookies.split("; ").forEach(cookie => {
        const splitCookie = cookie.split("=");
        cookieDict[splitCookie[0]] = splitCookie[1];
    });
    return cookieDict;
}