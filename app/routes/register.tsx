import {
    ActionFunctionArgs,
    LoaderFunctionArgs,
    MetaFunction,
    json,
    redirect,
} from "@remix-run/node";
import { Form, useActionData, useNavigation } from "@remix-run/react";
import { register, validateRegisterFormOnServer, login } from "~/.server/auth";
import { getCurrentUser } from "~/.server/auth";
import { getCurrentUserErrorRedirect, mypageRedirect, unexpectedErrorRedirect } from "~/.server/redirect";

export const meta: MetaFunction = () => {
    return [
        { title: "クラシックギター音楽作品データベース - 新規登録" },
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

export const action = async ({
    request
}: ActionFunctionArgs) => {
    const response = {
        "usernameMessages": [] as Array<string>,
        "passwordMessages": [] as Array<string>,
        "formMessages": [] as Array<string>,
        "exceptionErrorMessage": null as unknown
    }

    try {
        const formData = await request.formData();

        // format validation
        const formatValidationResult = validateRegisterFormFormat(formData);
        response.usernameMessages = formatValidationResult.usernameMessages;
        response.passwordMessages = formatValidationResult.passwordMessages;
        if (formatValidationResult.error === true) {
            return json({ response });
        }
        // server validation
        const serverValidationResult = await validateRegisterFormOnServer(formData)
        response.usernameMessages = serverValidationResult.usernameMessages;
        response.formMessages = serverValidationResult.formMessages;
        if (serverValidationResult.error === true) {
            return json({ response });
        }

        // register
        const username = String(formData.get("username"));
        const password = String(formData.get("password"));
        const registerResult = await register(username, password);
        response.formMessages = registerResult.formMessages;
        if (registerResult.error === true) {
            return json({ response });
        }

        // login and redirect to mypage
        const loginResult = await login(registerResult.userId);
        response.formMessages = loginResult.formMessages;

        if (loginResult.error === true) {
            return json({ response });
        }

        return redirect("/", {
            headers: [
                ["Set-Cookie","sid=" + loginResult.sessionId + ";Max-Age=31536000; HttpOnly; Path='/'; Samesite:Lax; Secure"],
                ["Set-Cookie", "fmsg=" + encodeURIComponent("正常に登録されました。登録されたアカウントでログインしました。") + "; Max-Age=5; HttpOnly; Path='/'; Samesite:Lax;"],
                ["Set-Cookie", "fmsgtype=success; Max-Age=5; HttpOnly; Path='/'; Samesite:Lax;"],
                ["Set-Cookie", "newfmsgfg=" + String(new Date().getTime()) + "; Max-Age=5; HttpOnly; Path='/'; Samesite:Lax;"],
            ]
        });
    } catch (err) {
        response.formMessages.push("予期しないエラーにより処理が失敗しました。");
        response.exceptionErrorMessage = err;
        return json({ response })
    }
};

export const validateRegisterFormFormat = (formData: FormData) => {
    const username = String(formData.get("username"));
    const password = String(formData.get("password"));
    const validationResult = {
        "error": false,
        "usernameMessages": [] as Array<string>,
        "passwordMessages": [] as Array<string>,
    }

    if (!username || username.length < 3 || !/^[a-zA-Z0-9]+$/.test(username)) {
        validationResult.error = true;
        if (!username) {
            validationResult.usernameMessages.push("入力してください。")
        } else {
            if (username.length < 3) {
                validationResult.error = true;
                validationResult.usernameMessages.push("3文字以上で入力してください。")
            }
            if (!/^[a-zA-Z0-9]+$/.test(username)) {
                validationResult.error = true;
                validationResult.usernameMessages.push("半角英数字で入力してください。")

            }
        }
    }

    if (!password || password.length < 8 || !/^[a-zA-Z0-9]+$/.test(password)) {
        validationResult.error = true;
        if (!password) {
            validationResult.passwordMessages.push("入力してください。")
        } else {
            if (password.length < 8) {
                validationResult.passwordMessages.push("8文字以上で入力してください。")
            }
            if (!/^[a-zA-Z0-9]+$/.test(password)) {
                validationResult.passwordMessages.push("半角英数字で入力してください。")

            }
        }
    }
    return validationResult;
}

export default function Register() {
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
                    <h2 className="text-2xl font-bold mb-4">新規登録</h2>
                    <div className="mb-4">
                        <label className="block font-bold mb-2" htmlFor="username">
                            ユーザー名
                        </label>
                        <input className="shadow appearance-none border rounded w-full py-2 px-2.5 leading-tight focus:outline-none focus:shadow-outline focus:shadow-md focus:border-blue-400 transition-colors" name="username" type="text" required></input>
                        <p className="text-sm text-gray-400">半角英数字で3文字以上</p>
                        <ul>
                            <p className="text-red-500 text-sm" >{usernameMessages}</p>
                        </ul>
                    </div>
                    <div className="mb-6">
                        <label className="block font-bold mb-2" htmlFor="password">
                            パスワード
                        </label>
                        <input className="shadow appearance-none border rounded w-full py-2 px-2.5 leading-tight focus:outline-none focus:shadow-outline focus:shadow-md focus:border-blue-400 transition-colors" name="password" type="password" required></input>
                        <p className="text-sm text-gray-400">半角英数字で8文字以上</p>
                        <ul>
                            <p className="text-red-500 text-sm">{passwordMessages}</p>
                        </ul>
                    </div>
                    <div className="text-right">
                        <button className={`bg-blue-600 w-24 text-white font-bold py-2 px-4 rounded ${isSubmitting ? "" : "hover:bg-blue-800 "}`} type="submit" disabled={isSubmitting}>
                            {isSubmitting ?
                                <div className="h-full flex justify-center items-center">
                                    <div className="animate-spin h-6 w-6 border-4 rounded-full border-t-transparent"></div>
                                </div>
                                :
                                <p>登録する</p>
                            }
                        </button>
                    </div>
                    <ul>
                        <p className="text-red-500 text-sm mt-2">{formMessages}</p>
                    </ul>
                </Form>
            </div >
        </div >
    );
}
