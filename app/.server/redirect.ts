import { redirect } from "@remix-run/node";

export function getCurrentUserErrorRedirect(getCurrentUserMessage: string) {
    return redirect("/", {
        headers: [
            ["Set-Cookie", "fmsg=" + getCurrentUserMessage + "; Max-Age=5; HttpOnly; Path='/'; Samesite:Lax;"],
            ["Set-Cookie", "fmsgtype=alert; Max-Age=5; HttpOnly; Path='/'; Samesite:Lax;"],
            ["Set-Cookie", "newfmsgfg=" + String(new Date().getTime()) + "; Max-Age=5; HttpOnly; Path='/'; Samesite:Lax;"],
            ["Set-Cookie", "sid=;expires=Thu, 1-Jan-1970 00:00:00 GMT;"]
        ]
    });
}

export function unexpectedErrorRedirect() {
    return redirect("/", {
        headers: [
            ["Set-Cookie", "fmsg=" + encodeURIComponent("処理中に予期しないエラーが発生しました。") + "; Max-Age=5; HttpOnly; Path='/'; Samesite:Lax;"],
            ["Set-Cookie", "fmsgtype=alert; Max-Age=5; HttpOnly; Path='/'; Samesite:Lax;"],
            ["Set-Cookie", "newfmsgfg=" + String(new Date().getTime()) + "; Max-Age=5; HttpOnly; Path='/'; Samesite:Lax;"],
        ]
    })
}

export function loginRedirect() {
    return redirect("/login", {
        headers: [
            ["Set-Cookie", "fmsg=" + encodeURIComponent("ログインしてください。") + "; Max-Age=5; HttpOnly; Path='/'; Samesite:Lax;"],
            ["Set-Cookie", "fmsgtype=caution; Max-Age=5; HttpOnly; Path='/'; Samesite:Lax;"],
            ["Set-Cookie", "newfmsgfg=" + String(new Date().getTime()) + "; Max-Age=5; HttpOnly; Path='/'; Samesite:Lax;"],
        ]
    });
}

export function mypageRedirect() {
    return redirect("/mypage", {
        headers: [
            ["Set-Cookie", "fmsg=" + encodeURIComponent("既にログインしています。") + "; Max-Age=5; HttpOnly; Path='/'; Samesite:Lax;"],
            ["Set-Cookie", "fmsgtype=caution; Max-Age=5; HttpOnly; Path='/'; Samesite:Lax;"],
            ["Set-Cookie", "newfmsgfg=" + String(new Date().getTime()) + "; Max-Age=5; HttpOnly; Path='/'; Samesite:Lax;"],
        ]
    });
}

export function dbConnectionErrorRedirect() {
    return redirect("/", {
        headers: [
            ["Set-Cookie", "fmsg=" + encodeURIComponent("データベースに接続できませんでした。時間をおいてもう一度お試しください。") + "; Max-Age=5; HttpOnly; Path='/'; Samesite:Lax;"],
            ["Set-Cookie", "fmsgtype=alert; Max-Age=5; HttpOnly; Path='/'; Samesite:Lax;"],
            ["Set-Cookie", "newfmsgfg=" + String(new Date().getTime()) + "; Max-Age=5; HttpOnly; Path='/'; Samesite:Lax;"],
        ]
    })
}