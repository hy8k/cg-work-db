import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();



async function main() {
    const users = [
        { username: "admin", password: "$2a$10$iGzJp8aKFXltJITzTJCnDuqwjordv8.hEL.CRs.y0Zc2vSuquGm0O" }
    ]

    // const publishedAt = [
    //     { era: 2020, label: "2020年代" },
    //     { era: 2010, label: "2010年代" },
    //     { era: 2000, label: "2000年代" },
    //     { era: 1990, label: "1990年代" },
    //     { era: 1980, label: "1980年代" },
    //     { era: 1970, label: "1970年代" },
    //     { era: 1960, label: "1960年代" },
    //     { era: 1950, label: "1950年代" },
    //     { era: 1940, label: "1940年代" },
    //     { era: 1930, label: "1930年代" },
    //     { era: 1920, label: "1920年代" },
    //     { era: 1910, label: "1910年代" },
    //     { era: 1900, label: "1900年代" },
    //     { era: 1801, label: "19世紀" },
    //     { era: 1751, label: "18世紀" },
    //     { era: 1601, label: "17世紀" },
    //     { era: 1501, label: "16世紀" },
    // ];

    const playstyles = [
        { playstyle: "独奏", label: "独奏" },
        { playstyle: "2重奏", label: "2重奏" },
        { playstyle: "3重奏", label: "3重奏" },
        { playstyle: "4重奏", label: "4重奏" },
        { playstyle: "合奏", label: "合奏" },
        { playstyle: "その他", label: "その他の演奏形式" },
    ]

    const composers = [
        // { name: "anonymous（作者不明）" },
        // { name: "D.スカルラッティ" },
        // { name: "J.S.バッハ" },
        // { name: "S.L.ヴァイス" },
        // { name: "F.カルリ" },
        // { name: "M.ジュリアーニ" },
        // { name: "F.ソル" },
        // { name: "F.タレガ" },
        // { name: "J.G.メルツ" },
        // { name: "J.K.メルツ" },
        // { name: "N.コスト" },
        // { name: "I.アルベニス" },
        // { name: "E.グラナドス" },
        // { name: "M.ファリャ" },
        // { name: "J.トゥリーナ" },
        // { name: "M.リョベート" },
        // { name: "M.M.ポンセ" },
        // { name: "A.バリオス (Agustin)" },
        // { name: "A.バリオス (Angel)" },
        // { name: "H.ヴィラ＝ロボス" },
        // { name: "F.モレノ･トローバ" },
        // { name: "M.C＝テデスコ" },
        // { name: "R.S.デ・ラ・マーサ" },
        // { name: "J.ロドリーゴ" },
        // { name: "A.ラウロ" },
        // { name: "A.ピアソラ" },
        // { name: "武満徹" },
        // { name: "佐藤弘和" },
        // { name: "R.ディアンス" },
        // { name: "L.ブローウェル" },
    ];

    // const artists = [
    //     { name: "福田進一", birthYear: 1955, deathYear: null, isAlive: true, isFloruit: false },
    //     { name: "村治佳織", birthYear: 1978, deathYear: null, isAlive: true, isFloruit: false },
    //     { name: "村治奏一", birthYear: 1981, deathYear: null, isAlive: true, isFloruit: false },
    //     { name: "J.ウィリアムス", birthYear: 1934, deathYear: null, isAlive: true, isFloruit: false },
    //     { name: "J.ブリーム", birthYear: 1933, deathYear: 2019, isAlive: false, isFloruit: false },
    //     { name: "朴葵姫", birthYear: 1982, deathYear: null, isAlive: true, isFloruit: false },
    // ];

    const artists = [
        { name: "福田進一" },
        { name: "村治佳織" },
        { name: "村治奏一" },
        { name: "J.ウィリアムス" },
        { name: "J.ブリーム" },
        { name: "朴葵姫" }
    ];

    const tags = [
        { name: "クラシック音楽", category: "genre" },
        { name: "ポピュラー音楽", category: "genre" },
        { name: "ルネサンス", category: "genre" },
        { name: "バロック", category: "genre" },
        { name: "古典派", category: "genre" },
        { name: "ロマン派", category: "genre" },
        { name: "国民楽派", category: "genre" },
        { name: "現代音楽", category: "genre" },
        { name: "ピアノ音楽", category: "genre" },
        { name: "管弦楽", category: "genre" },
        { name: "オペラ音楽", category: "genre" },
        { name: "唱歌", category: "genre" },
        { name: "映画音楽", category: "genre" },
        { name: "民謡", category: "genre" },
        { name: "タンゴ", category: "genre" },
        { name: "変奏曲", category: "genre" },
        { name: "ジャズ", category: "genre" },
        { name: "ラテン音楽", category: "genre" },
        { name: "邦楽", category: "genre" },
    ]

    const pieces = [
        { title: "魔笛の主題による変奏曲", composer: { name: "F.ソル", birthYear: 1778, deathYear: 1839 }, tagName: ["クラシック音楽", "古典派"] },
        { title: "アストゥリアス", composer: { name: "I.アルベニス", birthYear: 1860, deathYear: 1909 }, tagName: ["クラシック音楽", "ピアノ音楽", "国民楽派"] },
        { title: "ラグリマ", composer: { name: "F.タレガ", birthYear: 1852, deathYear: 1909 }, tagName: ["クラシック音楽", "古典派"] },
        { title: "月光", composer: { name: "F.ソル", birthYear: 1778, deathYear: 1839 }, tagName: ["クラシック音楽", "古典派"] },
        { title: "アルハンブラの思い出", composer: { name: "F.タレガ", birthYear: 1852, deathYear: 1909 }, tagName: ["クラシック音楽", "古典派"] },
        { title: "聖母の御子", composer: { name: "M.リョベート", birthYear: 1878, deathYear: 1938 }, tagName: ["クラシック音楽", "民謡"] },
        { title: "フリア・フロリダ", composer: { name: "A.バリオス（Agustin）", birthYear: 1885, deathYear: 1944 }, tagName: ["クラシック音楽", "ロマン派"] },
        { title: "大序曲", composer: { name: "M.ジュリアーニ", birthYear: 1781, deathYear: 1829 }, tagName: ["クラシック音楽", "古典派"] },
        { title: "劇的幻想曲『旅立ち』", composer: { name: "N.コスト", birthYear: 1805, deathYear: 1883 }, tagName: ["クラシック音楽", "ロマン派"] },
        { title: "グラン・ソロ", composer: { name: "F.ソル", birthYear: 1778, deathYear: 1839 }, tagName: ["クラシック音楽", "古典派"] },
        { title: "主よ，人の望みの喜びよ", composer: { name: "J.S.バッハ", birthYear: 1685, deathYear: 1750 }, tagName: ["クラシック音楽", "ピアノ音楽", "バロック"] },
        { title: "ハンガリー幻想曲", composer: { name: "J.K.メルツ", birthYear: 1806, deathYear: 1856 }, tagName: ["クラシック音楽", "ロマン派"] },
        { title: "11月のある日", composer: { name: "L.ブローウェル", birthYear: 1939, deathYearInfo: "ALIVE" }, tagName: ["クラシック音楽", "ラテン音楽"], youtubeAudioSources: [{ url: "https://news.google.com/home?hl=ja&gl=JP&ceid=JP:ja", playstyle: { connect: { id: 1 } }, artists: { connect: { id: 1 } } }], audioCDSoueces: [{ title: "Latin American Music vol.1", url: "https://news.google.com/home?hl=ja&gl=JP&ceid=JP:ja", playstyle: { connect: { id: 1 } }, artists: { connect: { id: 2 } }, isYoutubeAudioAvailable: true, youtubeAudioUrl: "https://www.youtube.com/watch?v=xLrIq9SOBLM" }] },
        { title: "朱色の塔", composer: { name: "I.アルベニス", birthYear: 1860, deathYear: 1909 }, tagName: ["クラシック音楽", "ピアノ音楽", "国民楽派"] },
        { title: "入り江のざわめき", composer: { name: "I.アルベニス", birthYear: 1860, deathYear: 1909 }, tagName: ["クラシック音楽", "ピアノ音楽", "国民楽派"] },
        { title: "特徴的舞曲", composer: { name: "L.ブローウェル", birthYear: 1939, isAlive: true, deathYearInfo: "ALIVE" }, tagName: ["ラテン音楽"] },
        { title: "前奏曲第1番", composer: { name: "H.ヴィラ＝ロボス", birthYear: 1887, deathYear: 1959 }, tagName: ["ラテン音楽"] },
        { title: "練習曲第1番", composer: { name: "H.ヴィラ＝ロボス", birthYear: 1887, deathYear: 1959 }, tagName: ["ラテン音楽"] },
        { title: "戦場のメリー・クリスマス", composer: { name: "坂本龍一", birthYear: 1952, deathYear: 2023 }, tagName: ["映画音楽"] },
        { title: "トッカータ・イン・ブルー", composer: { name: "C.ドメニコーニ", birthYear: 1947, deathYearInfo: "ALIVE" }, tagName: ["現代音楽"] },
        { title: "鐘の響き", composer: { name: "J.ペルナンブコ", birthYear: 1883, deathYear: 1947 }, tagName: ["ポピュラー音楽"] },
        { title: "スペイン舞曲第1番", composer: { name: "M.ファリャ", birthYear: 1876, deathYear: 1946 }, tagName: ["クラシック音楽", "オペラ音楽", "管弦楽", "国民楽派"] },
        { title: "スタンザ I", composer: { name: "武満徹", birthYear: 1930, deathYear: 1996 }, tagName: ["現代音楽", "邦楽"] },
        { title: "皇帝の歌", composer: { name: "L.ナルバエス", birthYear: 1500, birthYearInfo: "APPROXIMATE", deathYear: 1555, deathYearInfo: "APPROXIMATE", isFloruit: false }, tagName: ["クラシック音楽", "ルネサンス"] },
    ];


    // for (const option of users) {
    //     await prisma.user.create({
    //         data: {
    //             username: option.username,
    //             password: option.password
    //         },
    //     });
    // }

    // for (const option of publishedAt) {
    //     await prisma.publishedAt.create({
    //         data: {
    //             era: option.era,
    //             label: option.label,
    //         },
    //     });
    // }

    for (const option of playstyles) {
        await prisma.playstyle.create({
            data: {
                name: option.playstyle,
                label: option.label
            },
        });
    }

    for (const option of tags) {
        await prisma.tag.create({
            data: {
                name: option.name,
            },
        });
    }

    for (const option of artists) {
        await prisma.artist.create({
            data: {
                name: option.name,
                // birthYear: option.birthYear,
                // deathYear: option.deathYear,
                // birthYearInfo: option.birthYearInfo,
                // deathYearInfo: option.deathYearInfo,
                // isFloruit: option.isFloruit,
                // isAlive: option.isAlive
            },
        });
    }


    for (const option of composers) {
        await prisma.composer.create({
            data: {
                name: option.name,
            },
        });
    }

    for (const piece of pieces) {
        const { title, playstyleId, composer, tagName, youtubeAudioSources, audioCDSoueces } = piece;

        // Composerを検索または作成
        let composerRecord = await prisma.composer.findFirst({
            where: { name: composer.name },
        });

        if (!composerRecord) {
            composerRecord = await prisma.composer.create({
                data: {
                    name: composer.name,
                    birthYear: composer.birthYear,
                    deathYear: composer.deathYear,
                    birthYearInfo: composer.birthYearInfo,
                    deathYearInfo: composer.deathYearInfo,
                    isFloruit: composer.isFloruit,
                },
            });
        }

        // Tagを検索または作成
        const tagRecords = [];
        for (const tag of tagName) {
            let tagRecord = await prisma.tag.findFirst({
                where: { name: tag },
            });

            if (!tagRecord) {
                tagRecord = await prisma.tag.create({
                    data: { name: tag },
                });
            }

            tagRecords.push(tagRecord);
        }

        // 新しいPieceを作成
        await prisma.piece.create({
            data: {
                title,
                playstyleId,
                composers: {
                    connect: { id: composerRecord.id },
                },
                tags: {
                    connect: tagRecords.map((tag) => ({ id: tag.id })),
                },
                youtubeAudioSources: {
                    create: youtubeAudioSources
                },
                audioCDSources: {
                    create: audioCDSoueces
                }
            },
        });
    }






    console.log('Data inserted successfully.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
