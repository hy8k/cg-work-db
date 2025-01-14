import { prisma } from "./prisma";
import { compareSync, genSaltSync, hashSync } from "bcrypt-ts";
import { v4 as uuidv4 } from 'uuid';
import { getCookieDict } from "~/utils/getCookieDict";

export async function validateRegisterFormOnServer(formData: FormData) {
    const username = String(formData.get("username"));
    const validationResult = {
        "error": false,
        "usernameMessages": [] as Array<string>,
        "formMessages": [] as Array<string>
    }

    const user = await prisma.user.findUnique({
        where: {
            username: username
        }
    }).catch(() => {
        return undefined;
    })

    if (user === undefined) {
        validationResult.error = true;
        validationResult.formMessages.push("データベースとの接続が不安定です。再度ログインを試行してください。")
    } else if (user !== null) {
        validationResult.error = true;
        validationResult.usernameMessages.push("このユーザー名は既に使用されています。他のユーザー名を使用してください。")
    }

    return validationResult;
}

export async function validateCredentials(username: string, password: string) {
    const validationResult = {
        "error": false,
        "userId": -1,
        "formMessages": [] as Array<string>,
    }

    const user = await prisma.user.findUnique({
        where: {
            username: username,
        }
    }).catch(() => {
        return undefined;
    })

    if (user === null || user === undefined) {
        validationResult.error = true;
        if (user === null) {
            validationResult.formMessages.push("ユーザー名またはパスワードが違います。");
        } else if (user === undefined) {
            validationResult.formMessages.push("データベースとの接続が不安定です。再度ログインを試行してください。")
        }
        return validationResult;
    }

    const hashedPassword = user.password
    if (compareSync(password, hashedPassword)) {
        validationResult.userId = user.id;
    } else {
        validationResult.error = true;
        validationResult.formMessages.push("ユーザー名またはパスワードが違います。");
    }
    return validationResult;
}

export async function register(username: string, password: string) {
    const registerResult = {
        "error": false,
        "userId": -1,
        "formMessages": [] as Array<string>,
    }

    const salt = genSaltSync(10);
    const hashedPassword = hashSync(password, salt);

    const newUser = await prisma.user.create({
        data: {
            username: username,
            password: hashedPassword
        }
    }).catch(() => {
        registerResult.error = true;
        return undefined;
    })

    if (newUser !== undefined) {
        registerResult.userId = newUser.id;
    }

    return registerResult;

}

export async function login(userId: number) {
    const loginResult = {
        "error": false,
        "sessionId": "",
        "formMessages": [] as Array<string>
    }

    const sessionId = uuidv4();
    const newSession = await prisma.session.create({
        data: {
            id: sessionId,
            userId: userId,
        }
    }).catch(() => {
        loginResult.error = true;
        loginResult.formMessages.push("データベースとの接続が不安定です。再度ログインを試行してください。")
        return undefined;
    })

    if (newSession !== undefined) {
        loginResult.sessionId = newSession.id;
    }

    return loginResult;
}

export async function logout(request: Request) {
    const logoutResult = {
        "error": false,
        "sessionId": "",
        "logoutMessage": ""
    }

    const cookies = request.headers.get("Cookie");
    const cookieDict = getCookieDict(cookies);

    if (cookies === null) {
        logoutResult.error = true;
        logoutResult.logoutMessage = encodeURIComponent('正常にログアウトできませんでした。リクエストヘッダにCookieがセットされていません．');
        return logoutResult;
    }

    if (!("sid" in cookieDict)) {
        logoutResult.error = true;
        logoutResult.logoutMessage = encodeURIComponent("正常にログアウトできませんでした。Cookieにsidが含まれていません．");
        return logoutResult;
    }

    const sessionId = cookieDict["sid"];
    logoutResult.sessionId = sessionId;
    const session = await prisma.session.delete({
        where: {
            id: sessionId
        }
    }).catch(() => {
        logoutResult.error = true;
        logoutResult.logoutMessage = encodeURIComponent("正常にログアウトできませんでした。データベースとの接続が不安定です。");
        return undefined;
    })

    return logoutResult;
}

export async function getCurrentUser(request: Request) {
    const getCurrentUserResult = {
        "error": false,
        "userInfo": {
            "id": 0,
            "username": "Guest"
        },
        "sessionInfo": {
            "id": ""
        },
        "isSessionExistsOnServer": undefined as boolean | undefined,
        "getCurrentUserMessage": ""
    }

    const cookies = request.headers.get("Cookie");
    const cookieDict = getCookieDict(cookies);

    if (!("sid" in cookieDict)) {
        return getCurrentUserResult;
    }

    const sessionId = cookieDict["sid"];
    getCurrentUserResult.sessionInfo.id = sessionId;
    const currentUser = await prisma.session.findUnique({
        include: {
            user: true
        },
        where: {
            id: sessionId
        }
    }).catch(() => {
        getCurrentUserResult.error = true;
        getCurrentUserResult.getCurrentUserMessage =encodeURIComponent("ユーザー情報を取得できませんでした。データベースとの接続が不安定です。");
        return undefined;
    })

    if (currentUser === null) {
        getCurrentUserResult.error = true;
        getCurrentUserResult.isSessionExistsOnServer = false;
        getCurrentUserResult.getCurrentUserMessage = encodeURIComponent("リクエストされたセッションIDが存在しません。");
    } else if (currentUser !== undefined) {
        getCurrentUserResult.isSessionExistsOnServer = true;
        getCurrentUserResult.userInfo.id = currentUser.user.id;
        getCurrentUserResult.userInfo.username = currentUser.user.username;
    }

    return getCurrentUserResult;
}
