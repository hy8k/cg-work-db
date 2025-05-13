import type {
    ActionFunctionArgs,
    LoaderFunctionArgs,
    MetaFunction
} from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Link, Form, useActionData, useNavigation, useLoaderData, useSubmit } from "@remix-run/react";
import React, { Fragment, useState } from 'react';
import { getCurrentUser } from "~/.server/auth";
import { createPiece, getComposersList, getPlayStyleList, getTagsList } from "~/.server/piece";
import { dbConnectionErrorRedirect, getCurrentUserErrorRedirect, loginRedirect, unexpectedErrorRedirect } from "~/.server/redirect";
import { getYoutubeMovieIdFromUrl } from "~/utils/getYoutubeMovieIdFromUrl";

export const meta: MetaFunction = () => {
    return [
        { title: "クラシックギター音楽作品データベース - 作品投稿" },
    ];
};

type Post = {
    title: string,

    composerInputMode: "SEARCH" | "CREATE",
    composerId: number | null,

    newComposerName: string,
    newComposerBirthYear: number | null,
    newComposerBirthYearInfo: "EXACT" | "APPROXIMATE" | "UNKNOWN";
    newComposerDeathYear: number | null,
    newComposerDeathYearInfo: "EXACT" | "APPROXIMATE" | "UNKNOWN" | "ALIVE",
    isFloruit: boolean,
    floruitStart: number | null,
    floruitEnd: number | null,

    tagIdList: number[],
    explanation: string | null

    scoreSources: {
        tmpSourceId: number,
        scoreTitle: string,
        publisher: string,
        playStyleId: number,
        arranger: string | null
        explanation: string | null
    }[]
    audioCDSources: {
        tmpSourceId: number,
        audioCDTitle: string,
        url: string | null,
        isYoutubeAudioAvailable: boolean,
        youtubeAudioUrl: string | null,
        playStyleId: number,
        arranger: string | null
        explanation: string | null
    }[]
    youtubeAudioSources: {
        tmpSourceId: number,
        url: string,
        playStyleId: number,
        arranger: string | null
        explanation: string | null
    }[]
}

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
                    // arrangers,
                    playStyles,
                    tags
                ] = await Promise.all([
                    getComposersList().then(composers => {
                        return composers.map(({ id, name }) => ({ value: id, label: name }))
                            .sort((a, b) => a.label.localeCompare(b.label))
                    }),
                    // getArrangersList().then(arrangers => {
                    //     return arrangers.map(({ id, name }) => ({ value: id, label: name }))
                    //         .sort((a, b) => a.label.localeCompare(b.label))
                    // }),
                    getPlayStyleList().then(playStyleList => {
                        return playStyleList.map(({ id, label }) => ({ value: id, label: label }))
                    }),
                    getTagsList().then(tags => {
                        return tags.map(({ id, name }) => ({ value: id, label: name }))
                    })
                ]);
                return json({ composers, playStyles, tags });
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
        "composerMessages": [] as Array<string>,
        // "playStyleMessages": [] as Array<string>,
        "movieUrlMessages": [] as Array<string>,
        "formMessages": [] as Array<string>,
        "exceptionErrorMessage": null as unknown
    }

    try {
        const { userInfo } = await getCurrentUser(request);
        const userId = userInfo.id

        const formData = await request.formData();

        const post: Post = JSON.parse(String(formData.get("json")))

        const title = post.title;
        const composerInputMode = post.composerInputMode;

        const composerId = post.composerId
        const newComposerName = post.newComposerName;
        const newComposerBirthYear = post.newComposerBirthYear;
        const newComposerBirthYearInfo = post.newComposerBirthYearInfo;
        const newComposerDeathYear = post.newComposerDeathYear;
        const newComposerDeathYearInfo = post.newComposerDeathYearInfo;
        const isFloruit = post.isFloruit;
        const floruitStart = post.floruitStart;
        const floruitEnd = post.floruitEnd;

        const tagIdList = post.tagIdList;
        const explanation = post.explanation

        const scoreSources = post.scoreSources;

        const formatValidationResult = validatePiecePostFormFormat(formData);
        response.titleMessages = formatValidationResult.titleMessages;
        response.composerMessages = formatValidationResult.composerMessages;
        // response.playStyleMessages = formatValidationResult.playStyleMessages;
        response.movieUrlMessages = formatValidationResult.movieUrlMessages;
        response.formMessages = formatValidationResult.formMessages;
        if (formatValidationResult.error === true) {
            return json({ response });
        }

        // const title = String(formData.get("title"));
        // const composerIdArray: Array<number> | null = formData.getAll("composer")[0] !== "0" ? formData.getAll("composer").map(composerId => {
        //     const parsedComposerId = Number(composerId)
        //     return parsedComposerId;
        // }) : null;
        // const newComposerNameArray: Array<string> | null = formData.getAll("newComposerName")[0] !== "" ? formData.getAll("newComposerName").map(newComposerName => {
        //     return String(newComposerName);
        // }) : null;
        // // const arrangerIdArray: Array<number> | null = formData.getAll("arranger")[0] !== "0" ? formData.getAll("arranger").map(arrangerId => {
        // //     const parsedArrangerId = Number(arrangerId)
        // //     return parsedArrangerId;
        // // }) : null;
        // const newArrangerNameArray: Array<string> | null = formData.getAll("newArrangerName")[0] !== "" ? formData.getAll("newArrangerName").map(newArrangerName => {
        //     return String(newArrangerName);
        // }) : null;
        // const playstyleId = Number(formData.get("playStyles"));
        // const movieUrlArray: Array<string> | null = formData.getAll("movie")[0] !== "" ? formData.getAll("movie").map(newComposerName => {
        //     return String(newComposerName);
        // }) : null;
        // const explanation = formData.get("explanation") === "0" ? null : String(formData.get("explanation"));
        // const tagIdArray: Array<number> | null = formData.getAll("tag").map(tagId => {
        //     const parsedTagId = Number(tagId);
        //     return parsedTagId;
        // });

        const createPieceResult = await createPiece(userId, title, composerInputMode, composerId, newComposerName, newComposerBirthYear, newComposerBirthYearInfo, newComposerDeathYear, newComposerDeathYearInfo, isFloruit, floruitStart, floruitEnd, tagIdList, explanation);

        if (createPieceResult.error === true) {
            return redirect("/works", {
                headers: [
                    ["Set-Cookie", "fmsg=" + encodeURIComponent("投稿できませんでした。") + encodeURIComponent(createPieceResult.formMessages[0]) + "; Max-Age=5; HttpOnly; Path='/'; Samesite:Lax;"],
                    ["Set-Cookie", "newfmsgfg=" + String(new Date().getTime()) + "; Max-Age=5; HttpOnly; Path='/'; Samesite:Lax;"],
                    ["Set-Cookie", "fmsgtype=alert; Max-Age=5; HttpOnly; Path='/'; Samesite:Lax;"]
                ]
            });
        } else {
            return redirect("/works", {
                headers: [
                    ["Set-Cookie", "fmsg=" + encodeURIComponent("投稿しました。") + "; Max-Age=5; HttpOnly; Path='/'; Samesite:Lax;"],
                    ["Set-Cookie", "newfmsgfg=" + String(new Date().getTime()) + "; Max-Age=5; HttpOnly; Path='/'; Samesite:Lax;"],
                    ["Set-Cookie", "fmsgtype=success; Max-Age=5; HttpOnly; Path='/'; Samesite:Lax;"]
                ]
            });
        }

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

export const validatePiecePostFormFormat = (formData: FormData) => {
    const validationResult = {
        "error": false,
        "titleMessages": [] as Array<string>,
        "composerMessages": [] as Array<string>,
        // "playStyleMessages": [] as Array<string>,
        "movieUrlMessages": [] as Array<string>,
        "formMessages": [] as Array<string>
    }

    const title = String(formData.get("title"));
    const composerId = formData.get("composerId");
    const newComposerName = formData.get("newComposerName");
    const playStyleId = Number(formData.get("playStyles"));
    const movieUrlArray: Array<string> | null = formData.getAll("movie")[0] !== "" ? formData.getAll("movie").map(movieUrl => {
        return String(movieUrl);
    }) : null;
    const tagArray: Array<number> | null = formData.getAll("tag")[0] !== "" ? formData.getAll("tag").map(tagId => {
        return Number(tagId);
    }) : null;


    if (!title) {
        validationResult.error = true;
        validationResult.titleMessages.push("入力してください。")
    }

    if ((composerId !== null && Number(composerId) === 0) || (newComposerName !== null && String(newComposerName) === "")) {
        validationResult.error = true;
        validationResult.composerMessages.push("選択または入力してください。")
    }

    // if (playStyleId === 0) {
    //     validationResult.error = true;
    //     validationResult.playStyleMessages.push("入力してください。")
    // }

    // if (movieUrlArray !== null) {
    //     movieUrlArray.forEach(movieUrl => {
    //         if (getYoutubeMovieIdFromUrl(movieUrl) === "") {
    //             validationResult.error = true;
    //             validationResult.movieUrlMessages.push("無効なURLです。")

    //         }
    //     })
    // }

    if (validationResult.error === true) {
        validationResult.formMessages.push("入力に不備があります。")
    }

    return validationResult;
}

export const shouldRevalidate = () => false;

export default function Post() {
    // const loaderData = useLoaderData<typeof loader>();
    const { composers, playStyles, tags } = useLoaderData<typeof loader>();
    const actionData = useActionData<typeof action>();
    const navigation = useNavigation();
    const isSubmitting = navigation.state === "submitting"

    const [postContent, setPostContent] = useState<Post>({
        title: "",
        composerInputMode: "SEARCH",
        composerId: 0,
        newComposerName: "",
        newComposerBirthYear: null,
        newComposerBirthYearInfo: "EXACT",
        newComposerDeathYear: null,
        newComposerDeathYearInfo: "EXACT",
        isFloruit: false,
        floruitStart: null,
        floruitEnd: null,
        tagIdList: [],
        explanation: "",
        scoreSources: [],
        audioCDSources: [],
        youtubeAudioSources: []
    })

    const [composerBirthYearSuffix, setComposerBirthYearSuffix] = useState("　　");
    const [composerDeathYearSuffix, setComposerDeathYearSuffix] = useState("");
    const [isComposerBirthYearInputDisabled, setIsComposerBirthYearInputDisabled] = useState(true);
    const [isComposerDeathYearInputDisabled, setIsComposerDeathYearInputDisabled] = useState(true);

    const titleMessages = actionData?.response.titleMessages.map((titleMessage, index) => <li key={index}>{titleMessage}</li>);
    const composerMessages = actionData?.response.composerMessages.map((composerMessage, index) => <li key={index}>{composerMessage}</li>);
    // const playStyleMessages = actionData?.response.playStyleMessages.map((playStyleMessage, index) => <li key={index}>{playStyleMessage}</li>);
    const movieUrlMessages = actionData?.response.movieUrlMessages.map((movieUrlMessage, index) => <li key={index}>{movieUrlMessage}</li>);
    const formMessages = actionData?.response.formMessages.map((formError, index) => <li key={index}>{formError}</li>);

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

    // const numberInputList = [
    //     "composerId",
    //     "tagIdList",
    //     "newComposerBirthYear",
    //     "newComposerDeathYear"
    // ]

    const handleAddSource = (type: "scoreSources" | "audioCDSources" | "youtubeAudioSources") => {
        setPostContent((prev) => ({
            ...prev,
            [type]: [
                ...prev[type],
                type === "scoreSources"
                    ? {
                        tmpSourceId: Date.now(),
                        scoreTitle: "",
                        publisher: "",
                        playStyleId: 0,
                        arranger: "",
                        explanation: "",
                    }
                    : type === "audioCDSources"
                        ? {
                            tmpSourceId: Date.now(),
                            audioCDTitle: "",
                            url: "",
                            isYoutubeAudioAvailable: false,
                            youtubeAudioUrl: "",
                            playStyleId: 0,
                            arranger: "",
                            explanation: "",
                        }
                        : {
                            tmpSourceId: Date.now(),
                            url: "",
                            playStyleId: 0,
                            arranger: "",
                            explanation: "",
                        },
            ],
        }));
    };

    const handleRemoveSource = (type: "scoreSources" | "audioCDSources" | "youtubeAudioSources", tmpSourceId: number) => {
        setPostContent((prev) => ({
            ...prev,
            [type]: prev[type].filter((source) => source.tmpSourceId !== tmpSourceId),
        }));
    };

    const handleSourceChange = (type: "scoreSources" | "audioCDSources" | "youtubeAudioSources", index: number, field: string, value: any) => {
        setPostContent((prev) => {
            const updatedSources = [...prev[type]];
            updatedSources[index] = { ...updatedSources[index], [field]: value };
            return { ...prev, [type]: updatedSources };
        });
    };

    // const (event) => { setPostContent((prev) => { return { ...prev, [event.target.name]: event.target.value } }) } = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    //     const { name, value } = e.target;

    //     setPostContent((prevPiece) => {
    //         const key = name as keyof Post;
    //         const newValue = numberInputList.includes(key) ? Number(value) : value;

    //         return {
    //             ...prevPiece,
    //             [key]: Array.isArray(prevPiece[key])
    //                 ? prevPiece[key].includes(newValue as any)
    //                     ? prevPiece[key].filter((item) => item !== newValue)
    //                     : [...prevPiece[key], newValue]
    //                 : newValue,
    //         };
    //     });
    // };


    const handleBirthYearChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        switch (event.target.value) {
            case "EXACT":
                setComposerBirthYearSuffix("年　");
                setIsComposerBirthYearInputDisabled(false);
                break;
            case "APPROXIMATE":
                setComposerBirthYearSuffix("年頃");
                setIsComposerBirthYearInputDisabled(false);
                break;
            case "UNKNOWN":
                setComposerBirthYearSuffix("　　");
                setIsComposerBirthYearInputDisabled(true);
                break;
        }
        setPostContent((prev) => { return { ...prev, [event.target.name]: event.target.value } })
    };

    const handleDeathYearChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        switch (event.target.value) {
            case "EXACT":
                setComposerDeathYearSuffix("年");
                setIsComposerDeathYearInputDisabled(false);
                break;
            case "APPROXIMATE":
                setComposerDeathYearSuffix("年頃");
                setIsComposerDeathYearInputDisabled(false);
                break;
            case "UNKNOWN":
            case "ALIVE":
                setComposerDeathYearSuffix("");
                setIsComposerDeathYearInputDisabled(true);
                break;
        }
        setPostContent((prev) => { return { ...prev, [event.target.name]: event.target.value } })

    };
    // const usernameMessages = actionData?.response.usernameMessages.map((usernameError, index) => <li key={index}>{usernameError}</li>);
    // const passwordMessages = actionData?.response.passwordMessages.map((passwordError, index) => <li key={index}>{passwordError}</li>);
    // const formMessages = actionData?.response.formMessages.map((formError, index) => <li key={index}>{formError}</li>);

    return (
        <div className="flex justify-center">
            <Form className="flex-1 bg-white shadow-md rounded-lg px-8 pt-8 pb-8 mb-6" method="POST" noValidate>
                <p className="text-2xl font-bold mb-2">作品投稿</p>
                <p className="mb-6 text-sm">*：必須項目</p>
                <div className="mb-6 max-w-96">
                    <label className="block font-bold mb-2" htmlFor="title">
                        曲名*
                    </label>
                    <input className="shadow appearance-none border rounded w-full h-10 py-2 px-2.5 border-slate-300 leading-tight focus:outline-none focus:shadow-outline focus:shadow-md focus:border-blue-400 transition-colors" name="title" type="text" onChange={(event) => { setPostContent((prev) => { return { ...prev, [event.target.name]: event.target.value } }) }} />
                    <ul>
                        <p className="text-red-500 text-sm">{titleMessages}</p>
                    </ul>
                </div>
                {/* <div className="mb-6 w-36">
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
                </div> */}
                <div className="md:flex flex-wrap mb-6">
                    <div className="mb-6 md:mr-3 flex-1">
                        <div className="mb-2">
                            <p className="font-bold">
                                作曲者*
                            </p>
                            <p className="text-sm text-slate-500"></p>
                        </div>
                        <div>
                            <div className="flex items-center">
                                <input type="radio" name="composerInputMode" id="composerInputSearch" value="SEARCH" onChange={(event) => { setPostContent((prev) => { return { ...prev, [event.target.name]: event.target.value } }) }} defaultChecked />
                                <label className="text-sm p-0.5" htmlFor="composerInputSearch" >作曲者DBから選択</label>
                            </div>
                            <div className="ml-3 w-1/2 min-w-48" hidden={postContent.composerInputMode === "CREATE"}>
                                <select name="composerId" className="shadow border rounded w-full py-2 px-2.5 border-slate-300 leading-tight focus:outline-none focus:shadow-outline focus:shadow-md focus:border-blue-400 transition-colors" disabled={postContent.composerInputMode === "CREATE"} onChange={(event) => { setPostContent((prev) => { return { ...prev, [event.target.name]: event.target.value } }) }}>
                                    <option>未選択</option>
                                    {composers.map((composer) => (
                                        <option value={composer.value} key={composer.value}>{composer.label}</option>
                                    ))}
                                </select>
                            </div>

                        </div>
                        <div className="mt-2">
                            <div className="flex items-center">
                                <input type="radio" name="composerInputMode" id="composerInputCreate" value="CREATE" onChange={(event) => { setPostContent((prev) => { return { ...prev, [event.target.name]: event.target.value } }) }} />
                                <label className="text-sm p-0.5" htmlFor="composerInputCreate" >新規作成する（作曲者DBにない場合）</label>
                            </div>
                            <div className="ml-3" hidden={postContent.composerInputMode === "SEARCH"}>
                                <div className="mb-2  w-1/2 min-w-48">
                                    <label className="text-sm font-bold" htmlFor="newComposerName">作曲者名</label>
                                    <input className="shadow appearance-none border rounded w-full h-10 py-2 px-2.5 border-slate-300 leading-tight focus:outline-none focus:shadow-outline focus:shadow-md focus:border-blue-400 transition-colors" name="newComposerName" type="text" disabled={postContent.composerInputMode === "SEARCH"} onChange={(event) => { setPostContent((prev) => { return { ...prev, [event.target.name]: event.target.value } }) }} />
                                </div>
                                <div className="flex">
                                    <div className="">
                                        <div className="mb-2">
                                            <p className="text-sm font-bold">作曲者の生没年について</p>
                                        </div>
                                        <div className="ml-2">
                                            <ul className="list-decimal">
                                                <li className="text-sm">作曲者の生年について，あてはまるものを選んでください。</li>
                                                <div className="flex flex-wrap ml-2 mb-4">
                                                    <div className="mr-2">
                                                        <input type="radio" name="newComposerBirthYearInfo" id="composerBirthYearExact" value="EXACT" onChange={handleBirthYearChange} disabled={postContent.composerInputMode === "SEARCH"} />
                                                        <label className="text-sm p-0.5" htmlFor="composerBirthYearExact">正確にわかっている</label>
                                                    </div>
                                                    <div className="mr-2">
                                                        <input type="radio" name="newComposerBirthYearInfo" id="composerBirthYearApproximate" value="APPROXIMATE" onChange={handleBirthYearChange} disabled={postContent.composerInputMode === "SEARCH"} />
                                                        <label className="text-sm p-0.5" htmlFor="composerBirthYearApproximate">おおよその年代がわかっている</label>
                                                    </div>
                                                    <div className="mr-2">
                                                        <input type="radio" name="newComposerBirthYearInfo" id="composerBirthYearUnknown" value="UNKNOWN" onChange={handleBirthYearChange} disabled={postContent.composerInputMode === "SEARCH"} />
                                                        <label className="text-sm p-0.5" htmlFor="composerBirthYearUnknown" >不詳である</label>
                                                    </div>
                                                </div>
                                                <li className="text-sm">作曲者の没年について，あてはまるものを選んでください。</li>
                                                <div className="flex flex-wrap ml-2 mb-4">
                                                    <div className="mr-2">
                                                        <input type="radio" name="newComposerDeathYearInfo" id="composerDeathYearExact" value="EXACT" onChange={handleDeathYearChange} disabled={postContent.composerInputMode === "SEARCH"} />
                                                        <label className="text-sm p-0.5" htmlFor="composerDeathYearExact">正確にわかっている</label>
                                                    </div>
                                                    <div className="mr-2">
                                                        <input type="radio" name="newComposerDeathYearInfo" id="composerDeathYearApproximate" value="APPROXIMATE" onChange={handleDeathYearChange} disabled={postContent.composerInputMode === "SEARCH"} />
                                                        <label className="text-sm p-0.5" htmlFor="composerDeathYearApproximate">おおよその年代がわかっている</label>
                                                    </div>
                                                    <div className="mr-2">
                                                        <input type="radio" name="newComposerDeathYearInfo" id="composerDeathYearUnknown" value="UNKNOWN" onChange={handleDeathYearChange} disabled={postContent.composerInputMode === "SEARCH"} />
                                                        <label className="text-sm p-0.5" htmlFor="composerDeathYearUnknown" >不詳である</label>
                                                    </div>
                                                    <div className="mr-2">
                                                        <input type="radio" name="newComposerDeathYearInfo" id="composerDeathYearAlive" value="ALIVE" onChange={handleDeathYearChange} disabled={postContent.composerInputMode === "SEARCH"} />
                                                        <label className="text-sm p-0.5" htmlFor="composerDeathYearAlive">存命人物である</label>
                                                    </div>
                                                </div>
                                                <li className="text-sm">作曲者の生没年を入力してください。灰色欄は記入不要です。</li>
                                                <div className="flex flex-wrap mb-4">
                                                    <div className="flex flex-nowrap items-center mr-4">
                                                        <div>
                                                            <label className="block text-sm" htmlFor="birthYear">生年</label>
                                                            <input className="shadow appearance-none border rounded w-24 h-10 py-2 px-2.5 border-slate-300 leading-tight focus:outline-none focus:shadow-outline focus:shadow-md focus:border-blue-400 transition-colors" name="newComposerBirthYear" type="number" disabled={postContent.composerInputMode === "SEARCH" || isComposerBirthYearInputDisabled} onChange={(event) => { setPostContent((prev) => { return { ...prev, [event.target.name]: event.target.value } }) }} />
                                                        </div>
                                                        <p className="text-sm pl-2 pt-5">{composerBirthYearSuffix}</p>
                                                    </div>
                                                    <div className="flex flex-nowrap items-center">
                                                        <div>
                                                            <label className="block text-sm" htmlFor="deathYear">没年</label>
                                                            <input className="shadow appearance-none border rounded w-24 h-10 py-2 px-2.5 border-slate-300 leading-tight focus:outline-none focus:shadow-outline focus:shadow-md focus:border-blue-400 transition-colors" name="newComposerDeathYear" type="number" disabled={postContent.composerInputMode === "SEARCH" || isComposerDeathYearInputDisabled} onChange={(event) => { setPostContent((prev) => { return { ...prev, [event.target.name]: event.target.value } }) }} />
                                                        </div>
                                                        <p className="text-sm pl-2 pt-5">{composerDeathYearSuffix}</p>
                                                    </div>
                                                </div>
                                                <li className="text-sm">(生没年が両方不明の場合のみ)作曲者の活躍年代が分かる場合は記入してください。</li>
                                                <div className="flex flex-wrap">
                                                    <div className="flex flex-nowrap items-center mr-4">
                                                        <div>
                                                            <label className="block text-sm" htmlFor="birthYear">開始年</label>
                                                            <input className="shadow appearance-none border rounded w-24 h-10 py-2 px-2.5 border-slate-300 leading-tight focus:outline-none focus:shadow-outline focus:shadow-md focus:border-blue-400 transition-colors" name="newComposerBirthYear" type="number" disabled={postContent.composerInputMode === "SEARCH" || isComposerBirthYearInputDisabled} onChange={(event) => { setPostContent((prev) => { return { ...prev, [event.target.name]: event.target.value } }) }} />
                                                        </div>
                                                        <p className="text-sm pl-2 pt-5">{composerBirthYearSuffix}</p>
                                                    </div>
                                                    <div className="flex flex-nowrap items-center">
                                                        <div>
                                                            <label className="block text-sm" htmlFor="deathYear">終了年</label>
                                                            <input className="shadow appearance-none border rounded w-24 h-10 py-2 px-2.5 border-slate-300 leading-tight focus:outline-none focus:shadow-outline focus:shadow-md focus:border-blue-400 transition-colors" name="newComposerDeathYear" type="number" disabled={postContent.composerInputMode === "SEARCH" || isComposerDeathYearInputDisabled} onChange={(event) => { setPostContent((prev) => { return { ...prev, [event.target.name]: event.target.value } }) }} />
                                                        </div>
                                                        <p className="text-sm pl-2 pt-5">{composerDeathYearSuffix}</p>
                                                    </div>
                                                </div>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <ul>
                            <p className="text-red-500 text-sm">{composerMessages}</p>
                        </ul>
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
                            <input className="shadow appearance-none border rounded w-full h-10 py-2 px-2.5 border-slate-300 leading-tight focus:outline-none focus:shadow-outline focus:shadow-md focus:border-blue-400 transition-colors" name="newArrangerName" type="text" disabled={arrangerInputState !== "create"} />
                        </div>

                    </div> */}
                {/* <div className="flex w-full">
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
                </div>
                <div className="mb-6 max-w-96">
                    <label className="block font-bold mb-2" htmlFor="title">
                        動画リンク
                    </label>
                    <input className="shadow appearance-none border rounded w-full h-10 py-2 px-2.5 border-slate-300 leading-tight focus:outline-none focus:shadow-outline focus:shadow-md focus:border-blue-400 transition-colors" name="movie" type="text" />
                    <ul>
                        <p className="text-red-500 text-sm">{movieUrlMessages}</p>
                    </ul>
                </div> */}
                <div className="mb-6">
                    <p className="block font-bold mb-2">
                        タグ（複数選択可能）
                    </p>
                    <div className="mb-2">
                        <div className="flex flex-wrap">
                            {tags !== null ? tags.map((tag) => (
                                <div className="mr-2 mb-3" key={tag.value}>
                                    <input type="checkbox" name="tagIdList" value={tag.value} id={"tag-" + String(tag.value)} className="peer hidden" onChange={(event) => { setPostContent((prev) => { return { ...prev, [event.target.name]: prev.tagIdList.includes(Number(event.target.value)) ? prev.tagIdList.filter((tagId) => tagId !== Number(event.target.value)) : [...prev.tagIdList, Number(event.target.value)] } }) }} />
                                    <label htmlFor={"tag-" + String(tag.value)} className="text-sm select-none cursor-pointer rounded-lg border border-black py-1 px-2 peer-checked:bg-black peer-checked:text-white">{tag.label}</label>
                                </div>
                            )) : <p>タグ使用不能</p>}
                        </div>
                    </div>
                </div>
                <div className="mb-6">
                    <div className="mb-3">
                        <p className="font-bold">
                            譜面情報
                        </p>
                        <p className="text-sm text-slate-500">作品の譜面が収載されている書籍等の情報を入力してください。複数追加できます。</p>
                    </div>
                    <button
                        className="text-sm bg-cyan-500 hover:bg-cyan-600 text-white w-40 font-bold py-1 rounded mb-2"
                        type="button"
                        onClick={() => handleAddSource("scoreSources")}
                    >
                        ＋ 譜面情報を追加する
                    </button>

                    {postContent.scoreSources.map((source, index) => (
                        <div key={source.tmpSourceId} className="p-5 border rounded bg-cyan-100 shadow relative mb-4">
                            {/* 削除ボタン */}
                            <button
                                type="button"
                                className="absolute top-2 right-2 text-red-600 hover:text-red-800 text-sm font-bold"
                                onClick={() => handleRemoveSource("scoreSources", source.tmpSourceId)}
                            >
                                ✕ 削除
                            </button>

                            <div className="flex flex-wrap">
                                <div className="mb-2 mr-2">
                                    <label className="text-sm block font-bold mb-2" htmlFor={`scoreTitle-${index}`}>
                                        書誌タイトル*
                                    </label>
                                    <input
                                        className="shadow appearance-none border rounded w-52 h-10 py-2 px-2.5 border-slate-300 leading-tight focus:outline-none focus:shadow-outline focus:shadow-md focus:border-blue-400 transition-colors"
                                        name={`scoreTitle-${index}`}
                                        type="text"
                                        value={source.scoreTitle}
                                        onChange={(event) => handleSourceChange("scoreSources", index, "scoreTitle", event.target.value)}
                                    />
                                </div>
                                <div className="mb-2 mr-2">
                                    <label className="text-sm block font-bold mb-2" htmlFor={`publisher-${index}`}>
                                        出版社名*
                                    </label>
                                    <input
                                        className="shadow appearance-none border rounded w-52 h-10 py-2 px-2.5 border-slate-300 leading-tight focus:outline-none focus:shadow-outline focus:shadow-md focus:border-blue-400 transition-colors"
                                        name={`publisher-${index}`}
                                        type="text"
                                        value={source.publisher}
                                        onChange={(event) => handleSourceChange("scoreSources", index, "publisher", event.target.value)}
                                    />
                                </div>
                                <div className="mb-2 mr-2">
                                    <label className="text-sm block font-bold mb-2" htmlFor={`playStyle-${index}`}>
                                        演奏形式*
                                    </label>
                                    <select
                                        name={`playStyle-${index}`}
                                        className="shadow border rounded w-44 h-10 py-2 px-2.5 border-slate-300 leading-tight focus:outline-none focus:shadow-outline focus:shadow-md focus:border-blue-400 transition-colors"
                                        value={source.playStyleId}
                                        onChange={(event) => handleSourceChange("scoreSources", index, "playStyleId", Number(event.target.value))}
                                    >
                                        <option value="0">未選択</option>
                                        {playStyles.map((playStyle) => (
                                            <option value={playStyle.value} key={playStyle.value}>
                                                {playStyle.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="mb-2">
                                    <label className="text-sm block font-bold mb-2" htmlFor={`arranger-${index}`}>
                                        編曲者（任意）
                                    </label>
                                    <input
                                        className="shadow appearance-none border rounded w-52 h-10 py-2 px-2.5 border-slate-300 leading-tight focus:outline-none focus:shadow-outline focus:shadow-md focus:border-blue-400 transition-colors"
                                        name={`arranger-${index}`}
                                        type="text"
                                        value={source.arranger || ""}
                                        onChange={(e) => handleSourceChange("scoreSources", index, "arranger", e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="mb-2">
                                <label className="text-sm block font-bold mb-2" htmlFor={`explanation-${index}`}>
                                    備考
                                </label>
                                <textarea
                                    className="shadow appearance-none border rounded w-1/2 min-w-52 h-20 py-2 px-2.5 border-slate-300 leading-tight focus:outline-none focus:shadow-outline focus:shadow-md focus:border-blue-400 transition-colors"
                                    name={`explanation-${index}`}
                                    value={source.explanation || ""}
                                    onChange={(e) => handleSourceChange("scoreSources", index, "explanation", e.target.value)}
                                />
                            </div>
                        </div>
                    ))}


                </div>
                <div className="mb-6">
                    {/* Audio CD 情報 */}
                    <div className="mb-3">
                        <p className="font-bold">CD音源情報</p>
                        <p className="text-sm text-slate-500">作品の音源が収録されているCD等の情報を入力してください。複数追加できます。</p>
                    </div>
                    <button
                        className="text-sm bg-cyan-500 hover:bg-cyan-600 text-white w-40 font-bold py-1 rounded mb-2"
                        type="button"
                        onClick={() => handleAddSource("audioCDSources")}
                    >
                        ＋ CD音源を追加する
                    </button>

                    {postContent.audioCDSources.map((source, index) => (
                        <div key={source.tmpSourceId} className="p-5 border rounded bg-cyan-100 shadow relative mb-4">
                            <button
                                type="button"
                                className="absolute top-2 right-2 text-red-600 hover:text-red-800 text-sm font-bold"
                                onClick={() => handleRemoveSource("audioCDSources", source.tmpSourceId)}
                            >
                                ✕ 削除
                            </button>

                            <div className="flex flex-wrap">
                                <div className="mb-2 mr-2">
                                    <label className="text-sm block font-bold mb-2">CDタイトル*</label>
                                    <input
                                        className="shadow appearance-none border rounded w-52 h-10 py-2 px-2.5 border-slate-300 leading-tight focus:outline-none focus:shadow-outline focus:shadow-md focus:border-blue-400 transition-colors"
                                        type="text"
                                        value={source.audioCDTitle}
                                        onChange={(e) => handleSourceChange("audioCDSources", index, "audioCDTitle", e.target.value)}
                                    />
                                </div>

                                <div className="mb-2 mr-2">
                                    <label className="text-sm block font-bold mb-2">URL</label>
                                    <input
                                        className="shadow appearance-none border rounded w-52 h-10 py-2 px-2.5 border-slate-300 leading-tight focus:outline-none focus:shadow-outline focus:shadow-md focus:border-blue-400 transition-colors"
                                        type="text"
                                        value={source.url || ""}
                                        onChange={(e) => handleSourceChange("audioCDSources", index, "url", e.target.value)}
                                    />
                                </div>

                                <div className="mb-2 mr-2">
                                    <label className="text-sm block font-bold mb-2">演奏形式*</label>
                                    <select
                                        className="shadow border rounded w-44 h-10 py-2 px-2.5 border-slate-300 leading-tight focus:outline-none focus:shadow-outline focus:shadow-md focus:border-blue-400 transition-colors"
                                        value={source.playStyleId}
                                        onChange={(e) => handleSourceChange("audioCDSources", index, "playStyleId", Number(e.target.value))}
                                    >
                                        <option value="0">未選択</option>
                                        {playStyles.map((playStyle) => (
                                            <option value={playStyle.value} key={playStyle.value}>
                                                {playStyle.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="mb-2">
                                <label className="text-sm block font-bold mb-2">備考</label>
                                <textarea
                                    className="shadow appearance-none border rounded w-1/2 min-w-52  h-20 py-2 px-2.5 border-slate-300 leading-tight focus:outline-none focus:shadow-outline focus:shadow-md focus:border-blue-400 transition-colors"
                                    value={source.explanation || ""}
                                    onChange={(e) => handleSourceChange("audioCDSources", index, "explanation", e.target.value)}
                                />
                            </div>
                        </div>
                    ))}
                </div>
                <div className="mb-6">
                    <div className="mb-3 mt-6">
                        <p className="font-bold">YouTube音源情報</p>
                        <p className="text-sm text-slate-500">作品の音源が配信されているYoutubeの動画情報を入力してください。複数追加できます。</p>
                    </div>
                    <button
                        className="text-sm bg-cyan-500 hover:bg-cyan-600 text-white w-48 font-bold py-1 rounded mb-2"
                        type="button"
                        onClick={() => handleAddSource("youtubeAudioSources")}
                    >
                        ＋ YouTube音源を追加する
                    </button>

                    {postContent.youtubeAudioSources.map((source, index) => (
                        <div key={source.tmpSourceId} className="p-5 border rounded bg-cyan-100 shadow relative mb-4">
                            <button
                                type="button"
                                className="absolute top-2 right-2 text-red-600 hover:text-red-800 text-sm font-bold"
                                onClick={() => handleRemoveSource("youtubeAudioSources", source.tmpSourceId)}
                            >
                                ✕ 削除
                            </button>

                            <div className="flex flex-wrap">
                                <div className="mb-2 mr-2">
                                    <label className="text-sm block font-bold mb-2">YouTube URL*</label>
                                    <input
                                        className="shadow appearance-none border rounded w-52 h-10 py-2 px-2.5 border-slate-300 leading-tight focus:outline-none focus:shadow-outline focus:shadow-md focus:border-blue-400 transition-colors"
                                        type="text"
                                        value={source.url}
                                        onChange={(e) => handleSourceChange("youtubeAudioSources", index, "url", e.target.value)}
                                    />
                                </div>

                                <div className="mb-2 mr-2">
                                    <label className="text-sm block font-bold mb-2">演奏形式*</label>
                                    <select
                                        className="shadow border rounded w-44 h-10 py-2 px-2.5 border-slate-300 leading-tight focus:outline-none focus:shadow-outline focus:shadow-md focus:border-blue-400 transition-colors"
                                        value={source.playStyleId}
                                        onChange={(e) => handleSourceChange("youtubeAudioSources", index, "playStyleId", Number(e.target.value))}
                                    >
                                        <option value="0">未選択</option>
                                        {playStyles.map((playStyle) => (
                                            <option value={playStyle.value} key={playStyle.value}>
                                                {playStyle.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="mb-2">
                                <label className="text-sm block font-bold mb-2">備考</label>
                                <textarea
                                    className="shadow appearance-none border rounded w-1/2 min-w-52 h-20 py-2 px-2.5 border-slate-300 leading-tight focus:outline-none focus:shadow-outline focus:shadow-md focus:border-blue-400 transition-colors"
                                    value={source.explanation || ""}
                                    onChange={(e) => handleSourceChange("youtubeAudioSources", index, "explanation", e.target.value)}
                                />
                            </div>
                        </div>
                    ))}
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
                <input
                    type="hidden"
                    name="json"
                    value={JSON.stringify(postContent)}
                />
            </Form>
        </div>

    );
}