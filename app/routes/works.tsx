import { json, LoaderFunctionArgs, type MetaFunction } from "@remix-run/node";
import { Await, defer, Form, useLoaderData, useLocation, useSubmit } from "@remix-run/react";
import { getComposersList, getNumOfPieces, getPiecesList, getPlayStyleList, getTagsList } from "~/.server/piece";
import WorkCard from "~/components/WorkCard";
import { Suspense, useLayoutEffect, useState } from "react";
import Pagination from "~/components/Pagination";
import { dbConnectionErrorRedirect, unexpectedErrorRedirect } from "~/.server/redirect";
import { PiEyeClosed } from "react-icons/pi";

type Piece = {
    id: number;
    title: string;
    composers?: {
        id: number;
        userId: number | null;
        name: string;
        birthYear: number | null;
        birthYearInfo: "EXACT" | "APPROXIMATE" | "UNKNOWN";
        deathYear: number | null;
        deathYearInfo: "EXACT" | "APPROXIMATE" | "UNKNOWN" | "ALIVE";
        floruitStart: number | null;
        floruitEnd: number | null;
        isFloruit: boolean;
    }[];
    playstyleList?: string[];
    //     numOfMovies: number;
    //     numOfExplanations?: number;
    tags?: { name: string }[];
    scoreSources?: {
        id: number,
        playstyle: {
            id: number,
            name: string
        },
        explanation: string | null
    }[];
    audioCDSources?: {
        id: number,
        playstyle: {
            id: number,
            name: string
        }
        explanation: string | null
        isYoutubeAudioAvailable: boolean
    }[];
    youtubeAudioSources?: {
        id: number,
        playstyle: {
            id: number,
            name: string
        }
        explanation: string | null
    }[];
}

export const meta: MetaFunction = () => {
    return [
        { title: "クラシックギター音楽作品データベース - 作品一覧" },
    ];
};

export const loader = async ({
    request,
}: LoaderFunctionArgs) => {
    try {
        const url = new URL(request.url);

        const titleQuery = url.searchParams.get("title") ?? undefined
        const composerIdQuery = Number(url.searchParams.get("composerId")) === 0 ? undefined : Number(url.searchParams.get("composerId"));
        const tagIdQuery = url.searchParams.getAll("tag").map(tagId => { return Number(tagId) });
        const currentPage = Number(url.searchParams.get("page")) > 0 ? Number(url.searchParams.get("page")) : 1;

        try {
            const [
                numOfPieces,
                pieces,
                composers,
                // arrangers,
                playStyles,
                tags
            ] = await Promise.all([
                getNumOfPieces({ title: titleQuery, composerId: composerIdQuery, tagIdList: tagIdQuery }),
                getPiecesList({ title: titleQuery, composerId: composerIdQuery, tagIdList: tagIdQuery, page: currentPage }),
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
            return defer({ titleQuery, composerIdQuery, tagIdQuery, numOfPieces, pieces, composers, playStyles, tags, currentPage });
        } catch {
            return dbConnectionErrorRedirect();
        }
    } catch {
        return unexpectedErrorRedirect();
    }
}

const getPlaystyleList = (piece: Piece) => {
    const playstyles = [
        ...(piece.scoreSources?.map(source => source.playstyle) ?? []),
        ...(piece.audioCDSources?.map(source => source.playstyle) ?? []),
        ...(piece.youtubeAudioSources?.map(source => source.playstyle) ?? [])
    ];

    const uniquePlaystyles = Array.from(
        new Map(playstyles.map(p => [p.id, p])).values()
    );

    return uniquePlaystyles;
};

export default function Pieces() {
    const { titleQuery, composerIdQuery, tagIdQuery, numOfPieces, pieces, composers, tags, currentPage } = useLoaderData<typeof loader>();

    const [currentTitleQuery, setCurrentTitleQuery] = useState(titleQuery);
    const [currentComposerIdQuery, setCurrentComposerIdQuery] = useState(composerIdQuery);
    const [currentTagIdQuery, setCurrentTagIdQuery] = useState(tagIdQuery);


    return (
        <div className="flex justify-center">
            <div className="lg:flex w-full items-start">
                <details className="bg-white shadow rounded mb-4 w-full lg:mr-4 lg:w-1/3">
                    <summary className="p-3 bg-cyan-600 text-white cursor-pointer rounded">
                        検索欄
                    </summary>
                    <Form className="p-8">
                        {/* <p className="text-lg font-bold mb-1">検索</p> */}
                        <div className="mb-3 md:mr-3 flex-1">
                            <label className="text-sm" htmlFor="title">
                                曲名
                            </label>
                            <input className="shadow appearance-none border rounded w-full h-9 py-2 px-2.5 border-slate-300 leading-tight focus:outline-none focus:shadow-outline focus:shadow-md focus:border-blue-400 transition-colors" name="title" type="text" value={currentTitleQuery} onChange={event => setCurrentTitleQuery(event.currentTarget.value)} />
                        </div>
                        <div className="mb-3 md:mr-3 flex-1">
                            <label className="text-sm" htmlFor="composerId">
                                作曲者
                            </label>
                            <select name="composerId" className="shadow border rounded w-full py-2 px-2.5 border-slate-300 leading-tight focus:outline-none focus:shadow-outline focus:shadow-md focus:border-blue-400 transition-colors" value={currentComposerIdQuery} onChange={event => { setCurrentComposerIdQuery(Number(event.currentTarget.value)) }}>
                                <option value="">未選択</option>
                                {composers.map((composer) => (
                                    <option value={composer.value} key={composer.value}>{composer.label}</option>
                                ))}
                            </select>
                        </div>
                        <div className="mb-2">
                            <label className="text-sm" htmlFor="tag">
                                タグ
                            </label>
                            <div className="flex flex-wrap mt-1">
                                {tags !== null ? tags.map((tag) => (
                                    <div className="mr-2 mb-3" key={tag.value}>
                                        <input type="checkbox" name="tag" value={tag.value} id={"tag-" + String(tag.value)} className="peer hidden" onChange={event => {
                                            if (event.currentTarget.checked) {
                                                setCurrentTagIdQuery([...currentTagIdQuery, Number(event.currentTarget.value)]);
                                            } else {
                                                setCurrentTagIdQuery(currentTagIdQuery.filter(tagId => tagId !== Number(event.currentTarget.value)));
                                            }
                                        }}
                                            checked={currentTagIdQuery.find(tadId => tadId === tag.value) !== undefined}
                                        />
                                        <label htmlFor={"tag-" + String(tag.value)} className="text-sm select-none cursor-pointer rounded-lg border border-black py-1 px-2 peer-checked:bg-black peer-checked:text-white">{tag.label}</label>
                                    </div>
                                )) : <p>タグ使用不能</p>}
                            </div>
                        </div>
                        <div className="text-right">
                            <button className="bg-blue-600 text-white w-16 font-bold py-1 px-2 rounded" type="submit">
                                検索
                            </button>
                        </div>
                    </Form>
                </details>
                <div className="lg:flex-1 mb-4">
                    <Suspense fallback={<p>Loading...</p>}>
                        {numOfPieces !== null ?
                            <>
                                <Pagination itemsPerPage={10} currentPage={currentPage} totalItems={numOfPieces} />
                                <Await resolve={pieces}>
                                    {(pieces) =>
                                        <div className="mb-4 w-full">
                                            {pieces !== null ? pieces.map((piece) => (
                                                <WorkCard key={piece.id} id={piece.id} title={piece.title} composers={piece.composers} tags={piece.tags} numOfAudioCDSources={piece.audioCDSources.length} numOfScoreSources={piece.scoreSources.length} numOfYoutubeAudioSources={piece.youtubeAudioSources.length + piece.audioCDSources.reduce((acc, curr) => curr.isYoutubeAudioAvailable ? acc + 1 : 0, 0)} playstyleList={getPlaystyleList(piece)} />
                                            )) : <p>作品リストの取得に失敗しました。</p>}
                                        </div>
                                    }
                                </Await>
                            </> : <p>データベース接続エラー</p>
                        }
                    </Suspense>
                </div>
            </div>
        </div>
    );
}
