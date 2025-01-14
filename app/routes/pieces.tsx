import { json, LoaderFunctionArgs, type MetaFunction } from "@remix-run/node";
import { Await, defer, Form, useLoaderData, useSubmit } from "@remix-run/react";
import { getArrangersList, getComposersList, getNumOfPieces, getPiecesList, getPlayStyleList, getPublishedAtList, getTagsList } from "~/.server/piece";
import Piece from "~/components/Piece";
import { Suspense, useState } from "react";
import Pagination from "~/components/Pagination";
import { dbConnectionErrorRedirect, unexpectedErrorRedirect } from "~/.server/redirect";

export const meta: MetaFunction = () => {
    return [
        { title: "クラシックギター作品データベース - 作品一覧" },
    ];
};

export const loader = async ({
    request,
}: LoaderFunctionArgs) => {
    try {
        const url = new URL(request.url);

        const titleQuery = url.searchParams.get("title") ?? undefined
        const composerIdQuery = Number(url.searchParams.get("composerId")) === 0 ? undefined : Number(url.searchParams.get("composerId"));
        const currentPage = Number(url.searchParams.get("page")) > 0 ? Number(url.searchParams.get("page")) : 1;

        try {
            const [
                numOfPieces,
                pieces,
                composers,
                arrangers,
                publishedAt,
                playStyles,
                tags
            ] = await Promise.all([
                getNumOfPieces({ title: titleQuery, composerId: composerIdQuery }),
                getPiecesList({ title: titleQuery, composerId: composerIdQuery, page: currentPage }),
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
            return defer({ url, titleQuery, composerIdQuery, numOfPieces, pieces, composers, arrangers, publishedAt, playStyles, tags, currentPage });
        } catch {
            return dbConnectionErrorRedirect();
        }
    } catch {
        return unexpectedErrorRedirect();
    }
}


export default function Pieces() {
    const { url, titleQuery, composerIdQuery, numOfPieces, pieces, composers, arrangers, publishedAt, playStyles, tags, currentPage } = useLoaderData<typeof loader>();

    const [currentTitleQuery, setCurrentTitleQuery] = useState(titleQuery);
    const [currentComposerIdQuery, setCurrentComposerIdQuery] = useState(composerIdQuery);

    return (
        <div className="flex justify-center">
            <div className="lg:flex w-full items-start">
                <Form className="bg-white p-8 shadow rounded mb-4 w-full lg:mr-4 lg:w-1/3">
                    <p className="text-lg font-bold mb-1">検索</p>
                    <div className="mb-3 md:mr-3 flex-1">
                        <label className="mb-2 text-sm" htmlFor="title">
                            曲名
                        </label>
                        <input className="shadow appearance-none border rounded w-full h-9 py-2 px-2.5 border-slate-300 leading-tight focus:outline-none focus:shadow-outline focus:shadow-md focus:border-blue-400 transition-colors" name="title" type="text" value={currentTitleQuery} onChange={event => setCurrentTitleQuery(event.currentTarget.value)} />
                    </div>
                    <div className="mb-3 md:mr-3 flex-1">
                        <label className="text-sm mb-2" htmlFor="composerId">
                            作曲者
                        </label>
                        <select name="composerId" className="shadow border rounded w-full py-2 px-2.5 border-slate-300 leading-tight focus:outline-none focus:shadow-outline focus:shadow-md focus:border-blue-400 transition-colors" value={currentComposerIdQuery} onChange={event => { setCurrentComposerIdQuery(Number(event.currentTarget.value)) }}>
                            <option value="0">未選択</option>
                            {composers.map((composer) => (
                                <option value={composer.value} key={composer.value}>{composer.label}</option>
                            ))}
                        </select>
                    </div>
                    <div className="text-right">
                        <button className="bg-blue-600 text-white w-16 font-bold py-1 px-2 rounded" type="submit">
                            検索
                        </button>
                    </div>
                </Form>
                <div className="lg:flex-1 mb-4">
                    <Suspense fallback={<p>Loading...</p>}>
                        {numOfPieces !== null ?
                            <>
                                <Pagination urlString={url} itemsPerPage={10} currentPage={currentPage} totalItems={numOfPieces} />
                                <Await resolve={pieces}>
                                    {(pieces) =>
                                        <div className="mb-4 w-full">
                                            {pieces !== null ? pieces.map((piece) => (
                                                <Piece key={piece.id} id={piece.id} title={piece.title} playstyle={piece.playstyle.name} publishedAt={piece.publishedAt?.label} composers={piece.composers} arrangers={piece.arrangers} tags={piece.tags} />
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
