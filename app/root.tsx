import {
    Link,
    Links,
    Meta,
    Outlet,
    Scripts,
    ScrollRestoration,
    useNavigation,
    useLoaderData,
    isRouteErrorResponse,
    useRouteError,
} from "@remix-run/react";
import "./tailwind.css";
import Navbar from "./components/Navbar";
import {
    LoaderFunctionArgs,
    ActionFunctionArgs,
    json,
    redirect
} from "@remix-run/node";
import { getCurrentUser, logout } from "./.server/auth";
import FlashMessage from "./components/FlashMessage";
import { getCurrentUserErrorRedirect, unexpectedErrorRedirect } from "./.server/redirect";
import { getCookieDict } from "./utils/getCookieDict";

interface UserInfo {
    "id": number,
    "username": string
}

interface FlashMessageInfo {
    "content": string,
    "type": "success" | "alert" | "caution"
    "newFlashMessageFlag": string
}

export const loader = async ({
    request,
}: LoaderFunctionArgs) => {
    try {
        const { error, userInfo, isSessionExistsOnServer: isSessionExistsOnServer, sessionInfo, getCurrentUserMessage } = await getCurrentUser(request);
        if (error === true) {
            return getCurrentUserErrorRedirect(getCurrentUserMessage);
        }

        const cookies = request.headers.get("Cookie");
        const cookieDict = getCookieDict(cookies);
        const flashMessageInfo = "fmsg" in cookieDict ?
            {
                "content": cookieDict["fmsg"],
                "type": cookieDict["fmsgtype"],
                "newFlashMessageFlag": cookieDict["newfmsgfg"]
            } as
            {
                "content": string,
                "type": "success" | "alert" | "caution",
                "newFlashMessageFlag": string
            }
            : null;

        return json({ userInfo, flashMessageInfo });
    } catch {
        return json({
            "userInfo": {
                "id": -1,
                "username": "Guest"
            } as UserInfo,
            "flashMessageInfo": {
                "content": "Exception has been thrown on the loader function of root.",
                "type": "alert",
                "newFlashMessageFlag": ""
            } as FlashMessageInfo
        })
    }
}

export const action = async ({
    request
}: ActionFunctionArgs) => {
    const logoutResult = await logout(request);
    const logoutMessage = logoutResult.logoutMessage

    if (logoutResult.error === true) {
        return redirect("/", {
            headers: [
                ["Set-Cookie", "fmsg=" + logoutMessage + "; Max-Age=5; HttpOnly; Path='/'; Samesite:Lax;"],
                ["Set-Cookie", "fmsgtype=alert;Max-Age=5; HttpOnly; Path='/'; Samesite:Lax;"],
                ["Set-Cookie", "newfmsgfg=; Max-Age=5; HttpOnly; Path='/'; Samesite:Lax;"],
                // ["Set-Cookie", "sid=;expires=Thu, 1-Jan-1970 00:00:00 GMT;"]
            ]
        });
    } else {
        return redirect("/", {
            headers: [
                ["Set-Cookie", "fmsg=" + encodeURIComponent("ログアウトしました。") + "; Max-Age=5; HttpOnly; Path='/'; Samesite:Lax;"],
                ["Set-Cookie", "fmsgtype=success;Max-Age=5; HttpOnly; Path='/'; Samesite:Lax;"],
                ["Set-Cookie", "newfmsgfg=; Max-Age=5; HttpOnly; Path='/'; Samesite:Lax;"],
                ["Set-Cookie", "sid=;expires=Thu, 1-Jan-1970 00:00:00 GMT;"]
            ]
        });
    }
}

export default function App() {
    const { userInfo, flashMessageInfo } = useLoaderData<typeof loader>();
    const navigation = useNavigation()

    return (
        <html lang="ja">
            <head>
                <meta charSet="utf-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <Meta />
                <Links />
            </head>
            <body className="bg-gray-100 min-h-screen overflow-y-scroll">
                <div className={`fixed inset-0 bg-white ${navigation.state === 'loading' ? 'opacity-50' : 'opacity-0 pointer-events-none'} transition-opacity duration-300 z-10`}>
                    <div className="h-full flex justify-center items-center">
                        <div className="animate-spin h-20 w-20 border-4 border-blue-500 rounded-full border-t-transparent"></div>
                    </div>
                </div>
                {userInfo === undefined ?
                    <>
                        <Navbar currentUserId={-1} currentUsername={"連絡してください"} />
                    </>
                    :
                    <>
                        <Navbar currentUserId={userInfo.id} currentUsername={userInfo.username} />
                    </>
                }
                <div className="pt-20 pb-20 px-4 flex justify-center">
                    <div className="max-w-[1000px] w-11/12">
                        <Outlet />
                    </div>
                </div>
                {flashMessageInfo !== null ? <FlashMessage message={flashMessageInfo.content} newFlashMessageFlag={flashMessageInfo.newFlashMessageFlag} duration={4000} type={flashMessageInfo.type} /> : null}
                <ScrollRestoration />
                <Scripts />
            </body>
        </html>
    );
}

export function ErrorBoundary() {
    const error = useRouteError();

    if (isRouteErrorResponse(error)) {
        return (
            <html lang="ja">
                <head>
                    <meta charSet="utf-8" />
                    <meta name="viewport" content="width=device-width, initial-scale=1" />
                </head>
                <body style={{ backgroundColor: '#f7fafc', minHeight: '100vh' }}>
                    <div style={{ paddingTop: '5rem', padding: '1rem' }}>
                        <div style={{
                            backgroundColor: '#ffffff',
                            padding: '2rem',
                            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
                            borderRadius: '0.375rem'
                        }}>
                            <h1 style={{ fontSize: '1.125rem', fontWeight: '800' }}>
                                {error.status} {error.statusText}
                            </h1>
                            <p>{error.data}</p>
                            <a href="/">ホームページに戻る</a>
                        </div>
                    </div>
                </body>
            </html>
        );
    } else if (error instanceof Error) {
        return (
            <html lang="ja">
                <head>
                    <meta charSet="utf-8" />
                    <meta name="viewport" content="width=device-width, initial-scale=1" />
                </head>
                <body style={{ backgroundColor: '#f7fafc', height: '100vh' }}>
                    <div style={{ paddingTop: '5rem', padding: '1rem' }}>
                        <div style={{ backgroundColor: 'white', padding: '2rem', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)', borderRadius: '0.375rem' }}>
                            <p>処理中に予期しないエラーが発生しました。</p>
                            <p>{error.message}</p>
                            <pre>{error.stack}</pre>
                            <a href="/">ホームページに戻る</a>
                        </div>
                    </div>
                </body>
            </html>
        );
    } else {
        return (
            <html lang="ja">
                <head>
                    <meta charSet="utf-8" />
                    <meta name="viewport" content="width=device-width, initial-scale=1" />
                </head>
                <body style={{ backgroundColor: '#f7fafc', height: '100vh' }}>
                    <div style={{ paddingTop: '5rem', padding: '1rem' }}>
                        <div style={{ backgroundColor: 'white', padding: '2rem', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)', borderRadius: '0.375rem' }}>
                            <p>不明なエラーが発生しました。</p>
                            <a href="/">ホームページに戻る</a>
                        </div>
                    </div>
                </body>
            </html>
        );
    }

}