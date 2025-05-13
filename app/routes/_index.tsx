import type { MetaFunction } from "@remix-run/node";
import { PiGuitar } from "react-icons/pi";

export const meta: MetaFunction = () => {
    return [
        { title: "クラシックギター音楽作品データベース" },
    ];
};

export default function Index() {
    return (
        <div className="bg-white p-8 shadow rounded">
            <div className="mb-5">
                <p className="text-xl font-bold mb-1">このサイトについて</p>
                <p className="text-sm">クラシックギターのための音楽作品をまとめたデータベースです。左上のメニューから項目を選んでください。</p>
            </div>
        </div>
    );
}
