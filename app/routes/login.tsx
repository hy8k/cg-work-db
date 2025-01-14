import type {
    ActionFunctionArgs,
    LoaderFunctionArgs,
    MetaFunction
} from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Link, Form, useActionData, useNavigation } from "@remix-run/react";
import { validateCredentials, login, getCurrentUser } from "~/.server/auth";
import { getCurrentUserErrorRedirect, mypageRedirect, unexpectedErrorRedirect } from "~/.server/redirect";

export const meta: MetaFunction = () => {
    return [
        { title: "ギター演奏者のための作品データベース - ログイン" },
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
            return null;
        } else {
            return mypageRedirect();
        }
    } catch {
        return unexpectedErrorRedirect();
    }
}

export async function action({
    request,
}: ActionFunctionArgs) {
    const response = {
        "usernameMessages": [] as Array<string>,
        "passwordMessages": [] as Array<string>,
        "formMessages": [] as Array<string>,
        "exceptionErrorMessage": null as unknown
    }

    try {
        const formData = await request.formData();
        const username = String(formData.get("username"));
        const password = String(formData.get("password"));

        // client validation
        const clientValidationResult = validateLoginFormOnClient(formData);
        response.usernameMessages = clientValidationResult.usernameMessages;
        response.passwordMessages = clientValidationResult.passwordMessages;
        if (clientValidationResult.error === true) {
            return json({ response });
        }

        // credentials validation
        const credentialsValidationResult = await validateCredentials(username, password);
        response.formMessages = credentialsValidationResult.formMessages;
        if (credentialsValidationResult.error === true) {
            return json({ response });
        }

        // login and redirect to mypage
        const loginResult = await login(credentialsValidationResult.userId);
        response.formMessages = loginResult.formMessages;

        if (loginResult.error === true) {
            return json({ response });
        }

        return redirect("/mypage", {
            headers: [
                ["Set-Cookie", "fmsg=" + encodeURIComponent("ログインしました。") + "; Max-Age=5; HttpOnly; Path='/'; Samesite:Lax;"],
                ["Set-Cookie", "fmsgtype=success; Max-Age=5; HttpOnly; Path='/'; Samesite:Lax;"],
                ["Set-Cookie", "newfmsgfg=" + String(new Date().getTime()) + "; Max-Age=5; HttpOnly; Path='/'; Samesite:Lax;"],
                ["Set-Cookie", "sid=" + loginResult.sessionId + ";Max-Age=31536000; HttpOnly; Path='/'; Samesite:Lax; Secure"],
            ]
        });
    } catch (err) {
        response.formMessages.push("予期しないエラーにより処理が失敗しました。");
        response.exceptionErrorMessage = err;
        return json({ response })
    }
}


export const validateLoginFormOnClient = (formData: FormData) => {
    const username = String(formData.get("username"));
    const password = String(formData.get("password"));
    const validationResult = {
        "error": false,
        "usernameMessages": [] as Array<string>,
        "passwordMessages": [] as Array<string>
    }

    if (!username) {
        validationResult.error = true;
        validationResult.usernameMessages.push("入力してください。")
    }

    if (!password) {
        validationResult.error = true;
        validationResult.passwordMessages.push("入力してください。")
    }
    return validationResult;
}

export default function Login() {
    const actionData = useActionData<typeof action>();
    const navigation = useNavigation();
    const isSubmitting = navigation.state === "submitting"

    const usernameMessages = actionData?.response.usernameMessages.map((usernameError, index) => <li key={index}>{usernameError}</li>);
    const passwordMessages = actionData?.response.passwordMessages.map((passwordError, index) => <li key={index}>{passwordError}</li>);
    const formMessages = actionData?.response.formMessages.map((formError, index) => <li key={index}>{formError}</li>);

    return (
        <div className="flex justify-center">
            <div className="max-w-96 flex-1">
                <Form className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4" method="POST" noValidate>
                    <h2 className="text-2xl font-bold mb-4">ログイン</h2>

                    <div className="mb-4">
                        <label className="block font-bold mb-2" htmlFor="username">
                            ユーザー名
                        </label>
                        <input className="shadow appearance-none border rounded w-full py-2 px-2.5 leading-tight focus:outline-none focus:shadow-outline focus:shadow-md focus:border-blue-400 transition-colors" name="username" type="text" required></input>
                        <ul>
                            <p className="text-red-500 text-sm" >{usernameMessages}</p>
                        </ul>
                    </div>
                    <div className="mb-6">
                        <label className="block font-bold mb-2" htmlFor="password">
                            パスワード
                        </label>
                        <input className="shadow appearance-none border rounded w-full py-2 px-2.5 leading-tight focus:outline-none focus:shadow-outline focus:shadow-md focus:border-blue-400 transition-colors" name="password" type="password" required></input>
                        <ul>
                            <p className="text-red-500 text-sm">{passwordMessages}</p>
                        </ul>
                    </div>
                    <div className="text-right mb-4">
                        <button className={`bg-blue-600 text-white w-24 font-bold py-2 px-4 rounded ${isSubmitting ? "" : "hover:bg-blue-800 "}`} type="submit" disabled={isSubmitting}>
                            {isSubmitting ?
                                <div className="h-full flex justify-center items-center">
                                    <div className="animate-spin h-6 w-6 border-4 rounded-full border-t-transparent"></div>
                                </div>
                                :
                                <p>ログイン</p>
                            }
                        </button>
                    </div>
                    <ul>
                        <p className="text-red-500 text-sm mt-2">{formMessages}</p>
                    </ul>
                </Form>
            </div>
        </div>

    );
}
