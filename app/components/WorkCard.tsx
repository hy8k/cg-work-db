import { Link } from "@remix-run/react";
import { RiPriceTag3Line, RiVideoLine, RiChat1Line } from "react-icons/ri";
import { GiSpeaker, GiMusicalScore, GiCompactDisc } from "react-icons/gi";
import { Fragment } from "react/jsx-runtime";
import { BsYoutube } from "react-icons/bs";

type PieceAbstract = {
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
    playstyleList: { id: number; name: string }[];
    numOfScoreSources: number;
    numOfAudioCDSources: number;
    numOfYoutubeAudioSources: number;
    tags?: { name: string }[];
}

type Composer = {
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
}

const formatComposerInfo = (composer: Composer) => {
    let years: string;

    if (composer.isFloruit) {
        years = `fl. ${composer.floruitStart ?? "?"} - ${composer.floruitEnd ?? "?"}`;
    } else if (composer.birthYear === null && composer.deathYear === null) {
        years = "生没年不詳";
    } else if (composer.deathYearInfo === "ALIVE") {
        years = `${composer.birthYear ?? "?"}-`;
    } else {
        const birth = composer.birthYearInfo === "APPROXIMATE" ? `c.${composer.birthYear}` : composer.birthYear ?? "?";
        const death = composer.deathYearInfo === "APPROXIMATE" ? `c.${composer.deathYear}` : composer.deathYear ?? "?";
        years = `${birth} - ${death}`;
    }

    return `${composer.name} (${years})`;
}

export default function Piece({ id, title, composers, playstyleList, numOfScoreSources, numOfAudioCDSources, numOfYoutubeAudioSources, tags }: PieceAbstract) {
    const color = (playstyle: string) => {
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
        <div className="mb-4 pl-6 pt-8 pb-2 bg-white shadow rounded min-h-32 relative ">
            <div className="flex flex-wrap absolute left-0 top-0  text-xs font-medium">
                {playstyleList !== undefined ? playstyleList.sort((a, b) => a.id - b.id).map((playstyle) => (
                    <div key={playstyle.id} className={`px-2 py-1 rounded border shadow ${color(playstyle.name)}`}>
                        {playstyle.name}
                    </div>)) : null
                }

            </div>


            <div className="flex flex-wrap mb-5">
                <div className="md:flex-1 max-md:mb-2">
                    <Link to={`/works/${id}`} className="cursor-pointer text-lg flex-1 font-bold mr-2">{title}</Link>
                    <div className="flex flex-wrap">
                        {composers?.length !== 0 ?
                            <div className="text-slate-500 text-sm mr-2">
                                {composers?.map((composer, index) => {
                                    if (index + 1 < composers.length) {
                                        return <Fragment key={index}>{formatComposerInfo(composer)}，</Fragment>
                                    } else {
                                        return <Fragment key={index}>{formatComposerInfo(composer)}</Fragment>
                                    }
                                })}
                            </div>
                            : null}
                    </div>
                </div>
                <div className="md:flex-1 w-full flex items-start">
                    <div className="flex">
                        <RiPriceTag3Line size="18px" />
                        <p className="text-sm font-medium mb-1 text-nowrap">
                            タグ：
                        </p>
                    </div>
                    <div className="flex items-center ml-1 flex-wrap">
                        {tags?.map((tag, index) => {
                            return <p className="text-xs rounded-lg border border-black py-0.5 px-2 mr-1 mb-1" key={index}>{tag.name}</p>
                        })}
                    </div>
                </div>
            </div>
            <div className="flex justify-end text-nowrap flex-wrap">
                <div className="text-slate-500 mr-3">
                    <div className="flex justify-end">
                        <div className="flex items-center">
                            <div className="mr-1">
                                <GiMusicalScore size="18px" />
                            </div>
                            <p className="text-xs">譜面：{numOfScoreSources}件</p>
                        </div>
                    </div>
                </div>
                <div className="text-slate-500 mr-3">
                    <div className="flex justify-end">
                        <div className="flex items-center">
                            <div className="mr-1">
                                <GiCompactDisc size="18px" />
                            </div>
                            <p className="text-xs">音源(CD等)：{numOfAudioCDSources}件</p>
                        </div>
                    </div>
                </div>
                <div className="text-slate-500 mr-3">
                    <div className="flex justify-end">
                        <div className="flex items-center">
                            <div className="mr-1">
                                <BsYoutube size="18px" />
                            </div>
                            <p className="text-xs">音源(Youtube)：{numOfYoutubeAudioSources}件</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
