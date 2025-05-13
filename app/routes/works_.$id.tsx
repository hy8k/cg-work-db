import { json, LoaderFunctionArgs, type MetaFunction } from "@remix-run/node";
import { Await, useLoaderData, defer } from "@remix-run/react";
import { Suspense } from "react";
import { getPieceDetails } from "~/.server/piece";

export const meta: MetaFunction = () => {
    return [
        { title: "クラシックギター音楽作品データベース - 作品詳細" },
    ];
};

type PieceDetails = {
    id: number;
    title: string;
    composers?: { name: string }[];
    playstyleList?: string[];
    //     numOfMovies: number;
    //     numOfExplanations?: number;
    tags?: { name: string }[];
    scoreSources?: {
        id: number,
        playstyle: {
            id: number,
            name: string,
            label: string
        },
        explanation: string | null
    }[];
    audioCDSources?: {
        id: number,
        title: string,
        artists: {
            name: string
        }[]
        playstyle: {
            id: number,
            name: string,
            label: string
        }
        explanation: string | null
    }[];
    youtubeAudioSources?: {
        id: number,
        artists: {
            name: string
        }[]
        playstyle: {
            id: number,
            name: string,
            label: string
        }
        explanation: string | null
    }[];
}

export const loader = async ({
    params,
}: LoaderFunctionArgs) => {
    const piece = getPieceDetails(Number(params.id));
    return defer({ piece });
};

const getPlaystyleList = (piece: PieceDetails) => {
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

export default function Index() {
    const { piece } = useLoaderData<typeof loader>();

    return (
        <div className="bg-white p-8 shadow rounded">
            <Suspense fallback={<p>Loading...</p>}>
                <Await resolve={piece}>
                    {(piece) =>
                        <div className="mb-4 w-full">
                            {piece !== null ?
                                <>
                                    <p className="text-2xl font-bold mb-2">作品詳細</p>
                                    <div className="mb-5 text-sm">
                                        <p>曲名：{piece.title}</p>
                                        <p>作曲者：{piece.composers.map(composer => { return composer.name })}</p>
                                        <p>演奏形式：{getPlaystyleList(piece).map(playstyle => playstyle.label).join(', ')}</p>
                                        <div className="flex align-middle">
                                            <p>タグ：</p>
                                            <div className="flex items-center ml-1 flex-wrap">
                                                {piece.tags?.map((tag, index) => {
                                                    return <p className="text-xs rounded-lg border border-black py-0.5 px-2 mr-1" key={index}>{tag.name}</p>
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                    <div className=" mb-5">
                                        <p className="text-xl font-bold">譜面情報</p>
                                        {piece.scoreSources.length === 0 ? <p className="text-sm text-slate-500">譜面情報がありません。</p>
                                            : <div className="overflow-x-auto">
                                                <table className="">
                                                    <thead>
                                                        <tr className="bg-gray-100">
                                                            <th className="text-nowrap px-4 py-1 border-y text-sm">書誌タイトル</th>
                                                            <th className="text-nowrap px-4 py-1 border-y text-sm">演奏形式</th>
                                                            <th className="text-nowrap px-4 py-1 border-y text-sm">関連URL</th>
                                                            <th className="text-nowrap px-4 py-1 border-y text-sm">備考</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {piece.scoreSources.map(scoreSource => (
                                                            <tr key={scoreSource.id}>
                                                                <td className="text-nowrap px-4 py-1 border-y text-sm">{scoreSource.title}</td>
                                                                <td className="text-nowrap px-4 py-1 border-y text-sm">{scoreSource.playstyle.label}</td>
                                                                <td className="text-nowrap px-4 py-1 border-y text-sm">{scoreSource.url}</td>
                                                                <td className="text-nowrap px-4 py-1 border-y text-sm">{scoreSource.explanation}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        }
                                    </div>
                                    <div className="mb-5">
                                        <p className="text-xl font-bold">演奏音源（CD等）</p>
                                        {piece.audioCDSources.length === 0 ? <p className="text-sm text-slate-500">演奏音源（CD等）がありません。 </p>
                                            : <div className="overflow-x-auto">
                                                <table className="">
                                                    <thead>
                                                        <tr className="bg-gray-100">
                                                            <th className="text-nowrap px-4 py-1 border-y text-sm">アルバム名等</th>
                                                            <th className="text-nowrap px-4 py-1 border-y text-sm">演奏者</th>
                                                            <th className="text-nowrap px-4 py-1 border-y text-sm">演奏形式</th>
                                                            <th className="text-nowrap px-4 py-1 border-y text-sm">販売サイト等</th>
                                                            <th className="text-nowrap px-4 py-1 border-y text-sm">Youtubeでの配信</th>
                                                            <th className="text-nowrap px-4 py-1 border-y text-sm">備考</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {piece.audioCDSources.map(audioCDSource => (
                                                            <tr key={audioCDSource.id}>
                                                                <td className="text-center text-nowrap px-4 py-1 border-y text-sm">{audioCDSource.title}</td>
                                                                <td className="text-center text-nowrap px-4 py-1 border-y text-sm">{audioCDSource.artists[0].name}</td>
                                                                <td className="text-center text-nowrap px-4 py-1 border-y text-sm">{audioCDSource.playstyle.label}</td>
                                                                <td className="text-center text-nowrap px-4 py-1 border-y text-sm">
                                                                    {audioCDSource.url ? <a className="text-sm bg-blue-600 hover:bg-blue-800 text-white py-0.5 px-3 rounded transition-colors" href={audioCDSource.url}>見る</a> : "なし"}
                                                                </td>
                                                                <td className="text-center text-nowrap px-4 py-1 border-y text-sm">
                                                                    {audioCDSource.youtubeAudioUrl ? <a className="text-sm bg-blue-600 hover:bg-blue-800 text-white py-0.5 px-3 rounded transition-colors" href={audioCDSource.youtubeAudioUrl}>見る</a> : "なし"}
                                                                    </td>
                                                                <td className="text-center text-nowrap px-4 py-1 border-y text-sm">{audioCDSource.explanation}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        }
                                    </div>
                                    <div className="mb-5">
                                        <p className="text-xl font-bold">演奏音源（Youtube）</p>
                                        {piece.youtubeAudioSources.length === 0 ? <p className="text-sm text-slate-500">演奏音源（Youtube）がありません。</p>
                                            : <div className="overflow-x-auto">
                                                <table className="">
                                                    <thead>
                                                        <tr className="bg-gray-100">
                                                            <th className="text-nowrap px-4 py-1 border-y text-sm">演奏者</th>
                                                            <th className="text-nowrap px-4 py-1 border-y text-sm">演奏形式</th>
                                                            <th className="text-nowrap px-4 py-1 border-y text-sm">演奏動画</th>
                                                            <th className="text-nowrap px-4 py-1 border-y text-sm">備考</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {piece.youtubeAudioSources.map(youtubeAudioSource => (
                                                            <tr key={youtubeAudioSource.id}>
                                                                <td className="text-center text-nowrap px-4 py-1 border-y text-sm">{youtubeAudioSource.artists[0].name}</td>
                                                                <td className="text-center text-nowrap px-4 py-1 border-y text-sm">{youtubeAudioSource.playstyle.label}</td>
                                                                <td className="text-center text-nowrap px-4 py-1 border-y text-sm">{youtubeAudioSource.url ? <a className="text-sm bg-blue-600 hover:bg-blue-800 text-white py-0.5 px-3 rounded transition-colors" href={youtubeAudioSource.url}>見る</a> : "なし"}</td>
                                                                <td className="text-center text-nowrap px-4 py-1 border-y text-sm">{youtubeAudioSource.explanation}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        }
                                    </div>
                                </>

                                : <p>表示するコンテンツがありません</p>
                            }
                        </div>
                    }
                </Await>
            </Suspense>
        </div>
    );
}
