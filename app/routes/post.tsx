import type {
    ActionFunctionArgs,
    LoaderFunctionArgs,
    MetaFunction
} from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Link, Form, useActionData, useNavigation, useLoaderData } from "@remix-run/react";
import React, { Fragment, useState } from 'react';
import { getCurrentUser } from "~/.server/auth";
import { createPiece, getArrangersList, getComposersList, getPlayStyleList, getPublishedAtList, getTagsList } from "~/.server/piece";
import { dbConnectionErrorRedirect, getCurrentUserErrorRedirect, loginRedirect, unexpectedErrorRedirect } from "~/.server/redirect";
import { getYoutubeMovieIdFromUrl } from "~/utils/getYoutubeMovieIdFromUrl";

export const meta: MetaFunction = () => {
    return [
        { title: "クラシックギター作品データベース - 作品投稿" },
    ];
};

export async function loader({
    request,
}: LoaderFunctionArgs) {
    try {
        const { error, userInfo, isSessionExistsOnServer, sessionInfo, getCurrentUserMessage } = await getCurrentUser(request);
        if (error === true) {
            return getCurrentUserErrorRedirect(getCurrentUserMessage);
        } else if (userInfo.id === 0) {
            return loginRedirect();
        } else {
            try {
                const [
                    composers,
                    arrangers,
                    publishedAt,
                    playStyles,
                    tags
                ] = await Promise.all([
                    getComposersList().then(composers => {
                        return composers.map(({ id, name }) => ({ value: id, label: name }))
                            .sort((a, b) => a.label.localeCompare(b.label))
                    }),
                    getArrangersList().then(arrangers => {
                        return arrangers.map(({ id, name }) => ({ value: id, label: name }))
                            .sort((a, b) => a.label.localeCompare(b.label))
                    }),
                    getPublishedAtList().then(publishedAtList => {
                        return publishedAtList.map(({ id, label }) => ({ value: id, label: label }))
                    }),
                    getPlayStyleList().then(playStyleList => {
                        return playStyleList.map(({ id, label }) => ({ value: id, label: label }))
                    }),
                    getTagsList().then(tags => {
                        return tags.map(({ id, name, tagCategory }) => ({ value: id, label: name, tagCategoryName: tagCategory === null ? "" : tagCategory.name }))
                    })
                ]);
                return json({ composers, arrangers, publishedAt, playStyles, tags });
            } catch {
                return dbConnectionErrorRedirect();
            }

        }
    } catch {
        return unexpectedErrorRedirect();
    }
}

export async function action({
    request,
}: ActionFunctionArgs) {
    const response = {
        "titleMessages": [] as Array<string>,
        "playStyleMessages": [] as Array<string>,
        "movieUrlMessages": [] as Array<string>,
        "formMessages": [] as Array<string>,
        "exceptionErrorMessage": null as unknown
    }

    try {
        const { userInfo } = await getCurrentUser(request);
        const userId = userInfo.id

        const formData = await request.formData();

        const clientValidationResult = validatePiecePostFormOnClient(formData);
        response.titleMessages = clientValidationResult.titleMessages;
        response.playStyleMessages = clientValidationResult.playStyleMessages;
        response.movieUrlMessages = clientValidationResult.movieUrlMessages;
        response.formMessages = clientValidationResult.formMessages;
        if (clientValidationResult.error === true) {
            return json({ response });
        }

        const title = String(formData.get("title"));
        const composerIdArray: Array<number> | null = formData.getAll("composer")[0] !== "0" ? formData.getAll("composer").map(composerId => {
            const parsedComposerId = Number(composerId)
            return parsedComposerId;
        }) : null;
        const newComposerNameArray: Array<string> | null = formData.getAll("newComposerName")[0] !== "" ? formData.getAll("newComposerName").map(newComposerName => {
            return String(newComposerName);
        }) : null;
        const arrangerIdArray: Array<number> | null = formData.getAll("arranger")[0] !== "0" ? formData.getAll("arranger").map(arrangerId => {
            const parsedArrangerId = Number(arrangerId)
            return parsedArrangerId;
        }) : null;
        const newArrangerNameArray: Array<string> | null = formData.getAll("newArrangerName")[0] !== "" ? formData.getAll("newArrangerName").map(newArrangerName => {
            return String(newArrangerName);
        }) : null;
        const publishedAtId = formData.get("publishedAt") === "0" ? null : Number(formData.get("publishedAt"));
        const playstyleId = Number(formData.get("playStyles"));
        const movieUrlArray: Array<string> | null = formData.getAll("movie")[0] !== "" ? formData.getAll("movie").map(newComposerName => {
            return String(newComposerName);
        }) : null;
        const explanation = formData.get("explanation") === "0" ? null : String(formData.get("explanation"));
        const tags: Array<{ id: number; name: string }> = formData.getAll("tags").map(tag => {
            const parsedItem = JSON.parse(tag as string);
            return {
                id: Number(parsedItem.id),
                name: parsedItem.name,
            };
        });

        const createPieceResult = await createPiece(userId, title, composerIdArray, newComposerNameArray, arrangerIdArray, newArrangerNameArray, publishedAtId, playstyleId, movieUrlArray, explanation);

        return redirect("/pieces", {
            headers: [
                ["Set-Cookie", "fmsg=" + encodeURIComponent("投稿しました。") + "; Max-Age=5; HttpOnly; Path='/'; Samesite:Lax;"],
                ["Set-Cookie", "newfmsgfg=" + String(new Date().getTime()) + "; Max-Age=5; HttpOnly; Path='/'; Samesite:Lax;"],
                ["Set-Cookie", "fmsgtype=success; Max-Age=5; HttpOnly; Path='/'; Samesite:Lax;"]
            ]
        });
        // const loginResult = await login(credentialsValidationResult.userId);
        // response.formMessages = loginResult.formMessages;

        // if (loginResult.error === true) {
        //     return json({ response });
        // }

    } catch (err) {
        response.formMessages.push("予期しないエラーにより処理が失敗しました。");
        response.exceptionErrorMessage = err;
        return json({ response })
    }
}

export const validatePiecePostFormOnClient = (formData: FormData) => {
    const validationResult = {
        "error": false,
        "titleMessages": [] as Array<string>,
        "playStyleMessages": [] as Array<string>,
        "movieUrlMessages": [] as Array<string>,
        "formMessages": [] as Array<string>
    }

    const title = String(formData.get("title"));
    const playStyleId = Number(formData.get("playStyles"));
    const movieUrlArray: Array<string> | null = formData.getAll("movie")[0] !== "" ? formData.getAll("movie").map(newComposerName => {
        return String(newComposerName);
    }) : null;


    if (!title) {
        validationResult.error = true;
        validationResult.titleMessages.push("入力してください。")
    }

    if (playStyleId === 0) {
        validationResult.error = true;
        validationResult.playStyleMessages.push("入力してください。")
    }

    if (movieUrlArray !== null) {
        movieUrlArray.forEach(movieUrl => {
            if (getYoutubeMovieIdFromUrl(movieUrl) === "") {
                validationResult.error = true;
                validationResult.movieUrlMessages.push("無効なURLです。")

            }
        })
    }

    if (validationResult.error === true) {
        validationResult.formMessages.push("入力に不備があります。")
    }

    return validationResult;
}

export const shouldRevalidate = () => false;

export default function Post() {
    // const loaderData = useLoaderData<typeof loader>();
    const { composers, arrangers, publishedAt, playStyles, tags } = useLoaderData<typeof loader>();
    const actionData = useActionData<typeof action>();
    const navigation = useNavigation();
    const isSubmitting = navigation.state === "submitting"

    // const composers = loaderData.composers
    //     ? loaderData.composers
    //         .map(({ id, name }) => ({ value: id, label: name }))
    //         .sort((a, b) => a.label.localeCompare(b.label))
    //     : [];
    // const arrangers = loaderData.arrangers
    //     ? loaderData.arrangers
    //         .map(({ id, name }) => ({ value: id, label: name }))
    //         .sort((a, b) => a.label.localeCompare(b.label))
    //     : [];
    // const publishedAt = loaderData.publishedAt ? loaderData.publishedAt.map(({ id, label }) => ({ value: id, label: label })) : [];
    // const playStyles = loaderData.playStyles ? loaderData.playStyles.map(({ id, label }) => ({ value: id, label: label })) : [];
    // const tags = loaderData.tags ? loaderData.tags.map(({ id, name, tagCategory }) => ({ value: id, label: name, tagCategoryName: tagCategory === null ? "" : tagCategory.name })) : [];

    const [composerInputState, setComposerInputState] = useState("search");
    const [arrangerInputState, setArrangerInputState] = useState("search");

    function handleComposerInputClick(mode: string) {
        setComposerInputState(mode);
    }

    function handleArrangerInputClick(mode: string) {
        setArrangerInputState(mode);
    }

    const titleMessages = actionData?.response.titleMessages.map((titleMessage, index) => <li key={index}>{titleMessage}</li>);
    const playStyleMessages = actionData?.response.playStyleMessages.map((playStyleMessage, index) => <li key={index}>{playStyleMessage}</li>);
    const movieUrlMessages = actionData?.response.movieUrlMessages.map((movieUrlMessage, index) => <li key={index}>{movieUrlMessage}</li>);
    const formMessages = actionData?.response.formMessages.map((formError, index) => <li key={index}>{formError}</li>);


    // const usernameMessages = actionData?.response.usernameMessages.map((usernameError, index) => <li key={index}>{usernameError}</li>);
    // const passwordMessages = actionData?.response.passwordMessages.map((passwordError, index) => <li key={index}>{passwordError}</li>);
    // const formMessages = actionData?.response.formMessages.map((formError, index) => <li key={index}>{formError}</li>);

    return (
        <div className="flex justify-center">
            <Form className="flex-1 bg-white shadow-md rounded-lg px-8 pt-8 pb-8 mb-6" method="POST" noValidate>
                <h2 className="text-2xl font-bold mb-2">作品投稿</h2>
                <p className="mb-6 text-sm">*：必須項目</p>
                <div className="mb-6 max-w-96">
                    <label className="block font-bold mb-2" htmlFor="title">
                        曲名*
                    </label>
                    <input className="shadow appearance-none border rounded w-full h-9 py-2 px-2.5 border-slate-300 leading-tight focus:outline-none focus:shadow-outline focus:shadow-md focus:border-blue-400 transition-colors" name="title" type="text" />
                    <ul>
                        <p className="text-red-500 text-sm">{titleMessages}</p>
                    </ul>
                </div>
                <div className="md:flex flex-wrap w-full">
                    <div className="mb-6 md:mr-3 flex-1">
                        <p className="block font-bold mb-2">
                            作曲者
                        </p>
                        <div>
                            <div className="flex items-center">
                                <input type="radio" name="composerInputMode" id="composerInputSearch" defaultChecked onClick={() => handleComposerInputClick("search")} />
                                <label className="text-sm p-0.5" htmlFor="composerInputSearch">作曲者データベースから選択</label>
                            </div>
                            <select name="composer" className="shadow border rounded w-full py-2 px-2.5 border-slate-300 leading-tight focus:outline-none focus:shadow-outline focus:shadow-md focus:border-blue-400 transition-colors" disabled={composerInputState !== "search"}>
                                <option value="0">未選択</option>
                                {composers.map((composer) => (
                                    <option value={composer.value} key={composer.value}>{composer.label}</option>
                                ))}
                            </select>
                        </div>
                        <div className="mt-2">
                            <div className="flex items-center">
                                <input type="radio" name="composerInputMode" id="composerInputCreate" onClick={() => handleComposerInputClick("create")} />
                                <label className="text-sm p-0.5" htmlFor="composerInputCreate">新規作成（DBに未登録の場合）</label>
                            </div>
                            <input className="shadow appearance-none border rounded w-full h-9 py-2 px-2.5 border-slate-300 leading-tight focus:outline-none focus:shadow-outline focus:shadow-md focus:border-blue-400 transition-colors" name="newComposerName" type="text" disabled={composerInputState !== "create"} />
                        </div>

                    </div>
                    {/* <div className="mb-6 md:mr-3 flex-1">
                        <p className="block font-bold mb-2">
                            編曲者
                        </p>
                        <div>
                            <div className="flex items-center">
                                <input type="radio" name="arrangerInputMode" id="arrangerInputSearch" defaultChecked onClick={() => handleArrangerInputClick("search")} />
                                <label className="text-sm p-0.5" htmlFor="arrangerInputSearch">編曲者データベースから選択</label>
                            </div>
                            <select name="arranger" className="shadow border rounded w-full py-2 px-2.5 border-slate-300 leading-tight focus:outline-none focus:shadow-outline focus:shadow-md focus:border-blue-400 transition-colors" disabled={arrangerInputState !== "search"}>
                                <option value="0">未選択</option>
                                {arrangers.map((arranger) => (
                                    <option value={arranger.value} key={arranger.value}>{arranger.label}</option>
                                ))}
                            </select>
                        </div>
                        <div className="mt-2">
                            <div className="flex items-center">
                                <input type="radio" name="arrangerInputMode" id="arrangerInputCreate" onClick={() => handleArrangerInputClick("create")} />
                                <label className="text-sm p-0.5" htmlFor="arrangerInputCreate">新規作成（DBに未登録の場合）</label>
                            </div>
                            <input className="shadow appearance-none border rounded w-full h-9 py-2 px-2.5 border-slate-300 leading-tight focus:outline-none focus:shadow-outline focus:shadow-md focus:border-blue-400 transition-colors" name="newArrangerName" type="text" disabled={arrangerInputState !== "create"} />
                        </div>

                    </div> */}
                </div>
                <div className="flex w-full">
                    <div className="mb-6 mr-3 w-40">
                        <label className="block font-bold mb-2" htmlFor="title">
                            作曲時期
                        </label>
                        <select name="publishedAt" className="shadow border rounded w-full py-2 px-2.5 border-slate-300 leading-tight focus:outline-none focus:shadow-outline focus:shadow-md focus:border-blue-400 transition-colors">
                            <option value="0">未選択</option>
                            {publishedAt.map((publishedAt) => (
                                <option value={publishedAt.value} key={publishedAt.value}>{publishedAt.label}</option>
                            ))}
                        </select>
                    </div>
                    <div className="mb-6 w-36">
                        <label className="block font-bold mb-2" htmlFor="playStyles">
                            演奏形式*
                        </label>
                        <select name="playStyles" className="shadow border rounded w-full py-2 px-2.5 border-slate-300 leading-tight focus:outline-none focus:shadow-outline focus:shadow-md focus:border-blue-400 transition-colors">
                            <option value="0">未選択</option>
                            {playStyles.map((playStyles) => (
                                <option value={playStyles.value} key={playStyles.value}>{playStyles.label}</option>
                            ))}
                        </select>
                        <ul>
                            <p className="text-red-500 text-sm">{playStyleMessages}</p>
                        </ul>
                    </div>
                </div>
                <div className="mb-6 max-w-96">
                    <label className="block font-bold mb-2" htmlFor="title">
                        動画リンク
                    </label>
                    <input className="shadow appearance-none border rounded w-full h-9 py-2 px-2.5 border-slate-300 leading-tight focus:outline-none focus:shadow-outline focus:shadow-md focus:border-blue-400 transition-colors" name="movie" type="text" />
                    <ul>
                        <p className="text-red-500 text-sm">{movieUrlMessages}</p>
                    </ul>
                </div>
                <div>
                    <label className="block font-bold mb-2">
                        タグ
                    </label>
                    <div className="mb-2">
                        <div className="flex flex-wrap">
                            {tags !== null ? tags.map((tag) => (
                                <div className="mr-2 mb-3" key={tag.value}>
                                    <input type="checkbox" name="tag" id={"tag-" + String(tag.value)} className="peer hidden" />
                                    <label htmlFor={"tag-" + String(tag.value)} className="select-none cursor-pointer rounded-lg border border-black py-1 px-2 peer-checked:bg-black peer-checked:text-white">{tag.label}</label>
                                </div>
                            )) : <p>タグ使用不能</p>}
                        </div>
                    </div>
                </div>
                <div className="text-right">
                    <button className={`bg-blue-600 text-white w-24 font-bold py-2 px-4 rounded ${isSubmitting ? "" : "hover:bg-blue-800"}`} type="submit" disabled={isSubmitting} >
                        {isSubmitting ?
                            <div className="h-full flex justify-center items-center">
                                <div className="animate-spin h-6 w-6 border-4 rounded-full border-t-transparent"></div>
                            </div>
                            :
                            <p>投稿する</p>
                        }
                    </button>
                </div>
                <ul>
                    <p className="text-red-500 text-sm mt-2">{formMessages}</p>
                </ul>
            </Form>
        </div>

    );
}
