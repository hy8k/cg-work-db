import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const users = [
        { username: "admin", password: "$2a$10$iGzJp8aKFXltJITzTJCnDuqwjordv8.hEL.CRs.y0Zc2vSuquGm0O" }
    ]

    const publishedAt = [
        { era: 2020, label: "2020年代" },
        { era: 2010, label: "2010年代" },
        { era: 2000, label: "2000年代" },
        { era: 1990, label: "1990年代" },
        { era: 1980, label: "1980年代" },
        { era: 1970, label: "1970年代" },
        { era: 1960, label: "1960年代" },
        { era: 1950, label: "1950年代" },
        { era: 1940, label: "1940年代" },
        { era: 1930, label: "1930年代" },
        { era: 1920, label: "1920年代" },
        { era: 1910, label: "1910年代" },
        { era: 1900, label: "1900年代" },
        { era: 1801, label: "19世紀" },
        { era: 1751, label: "18世紀" },
        { era: 1601, label: "17世紀" },
        { era: 1501, label: "16世紀" },
    ];

    const playstyles = [
        { playstyle: "独奏", label: "独奏" },
        { playstyle: "2重奏", label: "2重奏" },
        { playstyle: "3重奏", label: "3重奏" },
        { playstyle: "4重奏", label: "4重奏" },
        { playstyle: "合奏", label: "合奏" },
        { playstyle: "その他", label: "その他の演奏形式" },
    ]

    const composers = [
        { name: "D.スカルラッティ" },
        { name: "J.S.バッハ" },
        { name: "S.L.ヴァイス" },
        { name: "F.カルリ" },
        { name: "M.ジュリアーニ" },
        { name: "F.ソル" },
        { name: "F.タレガ" },
        { name: "J.G.メルツ" },
        { name: "J.K.メルツ" },
        { name: "N.コスト" },
        { name: "I.アルベニス" },
        { name: "E.グラナドス" },
        { name: "M.ファリャ" },
        { name: "J.トゥリーナ" },
        { name: "M.リョベート" },
        { name: "M.M.ポンセ" },
        { name: "A.バリオス (Agustin)" },
        { name: "A.バリオス (Angel)" },
        { name: "H.ヴィラ＝ロボス" },
        { name: "F.モレノ･トローバ" },
        { name: "M.C＝テデスコ" },
        { name: "R.S.デ・ラ・マーサ" },
        { name: "J.ロドリーゴ" },
        { name: "A.ラウロ" },
        { name: "A.ピアソラ" },
        { name: "武満徹" },
        { name: "佐藤弘和" },
        { name: "R.ディアンス" },
        { name: "L.ブローウェル" },
    ];

    const tags = [
        { name: "クラシック", category: "genre" },
        { name: "ポップス", category: "genre" },
        { name: "映画音楽", category: "genre" },
        { name: "唱歌", category: "genre" },
        { name: "洋楽", category: "genre" },
        { name: "現代音楽", category: "genre" },
        { name: "ジャズ", category: "genre" },
        { name: "初心者向け", category: "difficulty" },
    ]

    const pieces = [
        { title: "箜篌歌", playstyleId: 1 },
        { title: "箜篌歌", playstyleId: 2 },
        { title: "箜篌歌", playstyleId: 3 },
        { title: "箜篌歌", playstyleId: 4 },
        { title: "箜篌歌", playstyleId: 5 },
        { title: "箜篌歌", playstyleId: 6 },
        { title: "箜篌歌", playstyleId: 6 },
        { title: "箜篌歌", playstyleId: 6 },
        { title: "箜篌歌", playstyleId: 6 },
        { title: "箜篌歌", playstyleId: 6 },
        { title: "箜篌歌", playstyleId: 6 },
        { title: "箜篌歌", playstyleId: 6 },
        { title: "箜篌歌", playstyleId: 6 },
    ]

    for (const option of users) {
        await prisma.user.create({
            data: {
                username: option.username,
                password: option.password
            },
        });
    }

    for (const option of publishedAt) {
        await prisma.publishedAt.create({
            data: {
                era: option.era,
                label: option.label,
            },
        });
    }

    for (const option of playstyles) {
        await prisma.playstyle.create({
            data: {
                name: option.playstyle,
                label: option.label
            },
        });
    }

    for (const option of pieces) {
        await prisma.piece.create({
            data: {
                title: option.title,
                playstyleId: option.playstyleId,
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

    for (const option of tags) {
        await prisma.tag.create({
            data: {
                name: option.name,
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
