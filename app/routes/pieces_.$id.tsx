import { json, LoaderFunctionArgs, defer, type MetaFunction } from "@remix-run/node";
import { Await, useLoaderData } from "@remix-run/react";
import { Suspense } from "react";
import { getPieceDetails } from "~/.server/piece";
import Piece from "~/components/Piece";

export const meta: MetaFunction = () => {
    return [
        { title: "ギター演奏者のための作品データベース - 作品詳細" },
    ];
};

export const loader = async ({
    params,
}: LoaderFunctionArgs) => {
    const piece = getPieceDetails(Number(params.id));
    return defer({ piece });
};

export default function Index() {
    const { piece } = useLoaderData<typeof loader>();

    return (
        <div className="bg-white p-8 shadow rounded">
            <Suspense fallback={<p>Loading...</p>}>
                <Await resolve={piece}>
                    {(piece) =>
                        <div className="mb-4 w-full lg:md:w-2/3 max-md:flex-1">
                            {piece !== null ?
                                <Piece key={piece.id} id={piece.id} title={piece.title} playstyle={piece.playstyle.name} publishedAt={piece.publishedAt !== null ? piece.publishedAt.label : null} composers={piece.composers} arrangers={piece.arrangers} /> : <p>表示するコンテンツがありません。</p>
                            }
                        </div>
                    }
                </Await>
            </Suspense>
        </div>
    );
}
