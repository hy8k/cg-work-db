import { Link } from "@remix-run/react";
import { RiPriceTag3Line, RiVideoLine, RiChat1Line } from "react-icons/ri";
import { Fragment } from "react/jsx-runtime";

interface Piece {
    id: number;
    title: string;
    composers?: { name: string }[];
    arrangers?: { name: string }[];
    publishedAt?: string;
    playstyle?: string;
    //     numOfMovies: number;
    //     numOfExplanations?: number;
    tags?: { name: string }[];
}


// export default function Piece({ title, composers, arrangers, publishedAt, playstyle, tags, numOfMovies, numOfExplanations }: Piece) {
export default function Piece({ id, title, composers, arrangers, publishedAt, playstyle, tags }: Piece) {
    const color = () => {
        switch (playstyle) {
            case "独奏": return "bg-blue-100"
            case "2重奏": return "bg-red-100"
            case "3重奏": return "bg-yellow-100"
            case "4重奏": return "bg-green-100"
            case "合奏": return "bg-orange-100"
            case "その他": return "bg-gray-100"
        }
    }

    return (
        <div className="mb-4 px-6 pt-8 pb-2 bg-white shadow rounded min-h-32 relative ">
            <div className={`absolute left-0 top-0 px-2 py-1 text-sm rounded-tl font-medium border shadow ${color()}`}>
                {playstyle}
            </div>
            <div className="flex justify-end absolute right-2 top-2 ">
                <div className="text-slate-500">
                    <div className="flex justify-end">
                        <div className="flex items-center mr-2">
                            <div>
                                <RiVideoLine size="20px" />
                            </div>
                            <p className="text-sm">演奏動画：1件</p>
                        </div>
                    </div>
                </div>
            </div>
            <div className="flex flex-wrap mb-5">
                <div className="md:flex-1 max-md:mb-2">
                    <Link to={`/pieces/${id}`} className="cursor-pointer text-lg flex-1 font-bold mr-2">{title}</Link>
                    <div className="flex flex-wrap">
                        {composers?.length !== 0 ?
                            <div className="text-slate-500 text-sm mr-2">
                                作曲者：
                                {composers?.map((composer, index) => {
                                    if (index + 1 < composers.length) {
                                        return <Fragment key={index}>{composer.name}，</Fragment>
                                    } else {
                                        return <Fragment key={index}>{composer.name}</Fragment>
                                    }
                                })}
                            </div>
                            : null}
                        {arrangers?.length !== 0 ?
                            <div className="text-slate-500 text-sm mr-2">
                                編曲者：
                                {arrangers?.map((arranger, index) => {
                                    if (index + 1 < arrangers.length) {
                                        return <Fragment key={index}>{arranger.name}，</Fragment>
                                    } else {
                                        return <Fragment key={index}>{arranger.name}</Fragment>
                                    }
                                })}
                            </div>
                            : null}
                        {publishedAt ?
                            <div className="text-slate-500 text-sm mr-2">
                                作曲時期：{publishedAt}
                            </div>
                            : null}
                    </div>
                </div>
                <div className="md:flex-1 w-full">
                    <div className="flex">
                        <RiPriceTag3Line size="20px" />
                        <p className="text-sm font-medium mb-1 text-nowrap">
                            タグ：
                        </p>
                    </div>
                    <div className="flex items-center ml-3 flex-wrap">
                        {tags?.map((tag, index) => {
                            return <p className="text-xs rounded-lg border border-black py-1 px-2 mr-1 mb-1" key={index}>{tag.name}</p>
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
