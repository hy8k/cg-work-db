import { getYoutubeMovieIdFromUrl } from "~/utils/getYoutubeMovieIdFromUrl";
import { prisma } from "./prisma";


export async function getNumOfPieces(
    query: {
        title?: string,
        composerId?: number,
        tagIdList?: number[],
    }
) {
    const title = query.title;
    const composerId = query.composerId;
    const tagIdList = query.tagIdList;

    return await prisma.piece.count({
        where: {
            AND: [
                {
                    title: {
                        contains: title
                    },
                },
                {
                    composers: {
                        some: {
                            id: composerId
                        }
                    }
                },
                {
                    tags: tagIdList?.length !== 0 ? {
                        some: {
                            id: {
                                in: tagIdList
                            }
                        }
                    } : {},
                }
            ]
        },
    })
}

export async function getPiecesList(
    query: {
        title?: string,
        composerId?: number,
        tagIdList?: number[],
        page: number
    }
) {
    const title = query.title;
    const composerId = query.composerId;
    const tagIdList = query.tagIdList;
    const page = query.page;

    return await prisma.piece.findMany({
        where: {
            AND: [
                {
                    title: {
                        contains: title
                    },
                },
                {
                    composers: {
                        some: {
                            id: composerId
                        }
                    },
                },
                {
                    tags: tagIdList?.length !== 0 ? {
                        some: {
                            id: {
                                in: tagIdList
                            }
                        }
                    } : {},
                }
            ]
        },
        include: {
            composers: true,
            tags: true,
            scoreSources: {
                include: {
                    playstyle: true
                }
            },
            audioCDSources: {
                include: {
                    playstyle: true
                }
            },
            youtubeAudioSources: {
                include: {
                    playstyle: true
                }
            }
        },
        orderBy: {
            updatedAt: "desc"
        },
        skip: (page - 1) * 10,
        take: 10
    });;
}

export async function getComposersList() {
    return await prisma.composer.findMany();
}

// export async function getArrangersList() {
//     return await prisma.arranger.findMany();
// }

export async function getPlayStyleList() {
    return await prisma.playstyle.findMany();
}

export async function getTagsList() {
    return await prisma.tag.findMany();
}

export async function getPieceDetails(pieceId: number) {
    return await prisma.piece.findUnique({
        where: {
            id: pieceId
        },
        include: {
            composers: true,
            tags: true,
            scoreSources: {
                include: {
                    playstyle: true
                }
            },
            audioCDSources: {
                include: {
                    playstyle: true,
                    artists: true
                }
            },
            youtubeAudioSources: {
                include: {
                    playstyle: true,
                    artists: true
                }
            }
        }

    })
}

export function validatePiece(
    userId: number,
    title: string,
    composerId: number[] | null,
    newComposerNameArray: string[] | null,
    arrangerIdArray: number[] | null,
    newArrangerNameArray: string[] | null,
    publishedAtId: number | null,
    playstyleId: number,
    movieUrlArray: string[] | null,
    explanation: string | null,
) {

}

export async function createPiece(
    userId: number,
    title: string,
    composerInputMode: "SEARCH" | "CREATE",
    composerId: number | null,
    newComposerName: string,
    newComposerBirthYear: number | null,
    newComposerBirthYearInfo: "EXACT" | "APPROXIMATE" | "UNKNOWN",
    newComposerDeathYear: number | null,
    newComposerDeathYearInfo: "EXACT" | "APPROXIMATE" | "UNKNOWN" | "ALIVE",
    isFloruit: boolean,
    floruitStart: number | null,
    floruitEnd: number | null,
    // newArrangerNameArray: string[] | null,
    tagIdList: number[],
    explanation: string | null,
) {
    const createPieceResult = {
        "error": false,
        "pieceId": -1,
        "formMessages": [] as Array<string>,
    }

    // const arrangersConnect: { id: number }[] = [];
    // const arrangersCreate: { userId: number, name: string }[] = [];
    // if (arrangerIdArray !== null) {
    //     arrangerIdArray.forEach(arrangerId => {
    //         arrangersConnect.push({
    //             id: arrangerId
    //         })
    //     });
    // }
    // if (newArrangerNameArray !== null) {
    //     newArrangerNameArray.forEach(newArrangerName => {
    //         arrangersCreate.push({
    //             userId: userId,
    //             name: newArrangerName
    //         })
    //     })
    // }

    const tagsConnect: { id: number }[] = []
    if (tagIdList !== null) {
        tagIdList.forEach(tagId => {
            tagsConnect.push({
                id: tagId
            })
        })
    }


    const newPiece = await prisma.piece.create({
        data: {
            userId: userId,
            title: title,
            composers: composerInputMode === "SEARCH" ? {
                connect: [{
                    id: composerId!
                }]
            } : {
                create: [{
                    name: newComposerName,
                    birthYear: newComposerBirthYear,
                    birthYearInfo: newComposerBirthYearInfo,
                    deathYear: newComposerDeathYear,
                    deathYearInfo: newComposerDeathYearInfo,
                    isFloruit: isFloruit,
                    floruitStart: floruitStart,
                    floruitEnd: floruitEnd,
                }]
            },
            // arrangers: {
            //     connect: arrangersConnect,
            //     create: arrangersCreate
            // },
            // playstyleId: playstyleId,
            // movies: {
            //     create: moviesCreate
            // },
            tags: tagIdList !== null ? {
                connect: tagsConnect
            } : {},
            explanation: explanation
        },
        include: {
            tags: true
        }
    }).catch((err) => {
        createPieceResult.error = true;
        createPieceResult.formMessages.push(String(err));
        return undefined;
    })

    if (newPiece !== undefined) {
        createPieceResult.pieceId = newPiece.id;
    }

    return createPieceResult;
}