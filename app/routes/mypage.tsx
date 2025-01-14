import {
    LoaderFunctionArgs,
    MetaFunction,
    json,
    redirect
} from "@remix-run/node";
import { useLoaderData, useRouteLoaderData } from "@remix-run/react";
import { getCurrentUser } from "~/.server/auth";
import { getCurrentUserErrorRedirect, loginRedirect, unexpectedErrorRedirect } from "~/.server/redirect";

export const meta: MetaFunction = () => {
    return [
        { title: "ギター演奏者のための作品データベース - マイページ" },
    ];
};

export async function loader({
    request,
}: LoaderFunctionArgs) {
    try {
        const { error, userInfo, isSessionExistsOnServer: isSessionExists, sessionInfo, getCurrentUserMessage } = await getCurrentUser(request);
        if (error === true) {
            return getCurrentUserErrorRedirect(getCurrentUserMessage);
        } else if (userInfo.id === 0) {
            return loginRedirect();
        } else {
            return json({ userInfo })
        }
    } catch {
        return unexpectedErrorRedirect();
    }
}

export default function Mypage() {
    const loaderData = useLoaderData<typeof loader>();
    return (
        <div className="bg-white p-8 shadow rounded">
            <h1 className="text-2xl font-bold mb-4">マイページ</h1>
            {loaderData?.userInfo.id}
        </div>
    );
}
