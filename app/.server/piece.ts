import { getYoutubeMovieIdFromUrl } from "~/utils/getYoutubeMovieIdFromUrl";
import { prisma } from "./prisma";


export async function getNumOfPieces(
    query: {
        title?: string,
        composerId?: number,
    }
) {
    const title = query.title;
    const composerId = query.composerId;

    return await prisma.piece.count({
        where: {
            AND: [
                {
                    title: {
                        contains: title
                    },
                },
                {
                    composers: composerId ? {
                        some: {
                            id: composerId
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
        page: number
    }
) {
    const title = query.title;
    const composerId = query.composerId;
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
                    composers: composerId ? {
                        some: {
                            id: composerId
                        }
                    } : {},
                }
            ]
        },
        include: {
            composers: {
                select: {
                    name: true
                }
            },
            arrangers: {
                select: {
                    name: true
                }
            },
            publishedAt: {
                select: {
                    label: true
                }
            },
            playstyle: {
                select: {
                    name: true
                }
            },
            tags: {
                select: {
                    name: true
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

export async function getArrangersList() {
    return await prisma.arranger.findMany();
}

export async function getPublishedAtList() {
    return await prisma.publishedAt.findMany();
}

export async function getPlayStyleList() {
    return await prisma.playstyle.findMany();
}

export async function getTagsList() {
    return await prisma.tag.findMany({
        include: {
            tagCategory: true
        }
    });
}

export async function getPieceDetails(pieceId: number) {
    return await prisma.piece.findUnique({
        where: {
            id: pieceId
        },
        include: {
            composers: true,
            arrangers: true,
            playstyle: true,
            publishedAt: true,
            tags: true,
        }

    })
}

export function validatePirce(
    userId: number,
    title: string,
    composerIdArray: number[] | null,
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
    composerIdArray: number[] | null,
    newComposerNameArray: string[] | null,
    arrangerIdArray: number[] | null,
    newArrangerNameArray: string[] | null,
    publishedAtId: number | null,
    playstyleId: number,
    movieUrlArray: string[] | null,
    explanation: string | null,
) {
    const createPieceResult = {
        "error": false,
        "pieceId": -1,
        "formMessages": [] as Array<string>,
    }

    const composersConnect: { id: number }[] = [];
    const composersCreate: { userId: number, name: string }[] = [];
    if (composerIdArray !== null) {
        composerIdArray.forEach(composerId => {
            composersConnect.push({
                id: composerId
            })
        });
    }
    if (newComposerNameArray !== null) {
        newComposerNameArray.forEach(newComposerName => {
            composersCreate.push({
                userId: userId,
                name: newComposerName
            })
        })
    }

    const arrangersConnect: { id: number }[] = [];
    const arrangersCreate: { userId: number, name: string }[] = [];
    if (arrangerIdArray !== null) {
        arrangerIdArray.forEach(arrangerId => {
            arrangersConnect.push({
                id: arrangerId
            })
        });
    }
    if (newArrangerNameArray !== null) {
        newArrangerNameArray.forEach(newArrangerName => {
            arrangersCreate.push({
                userId: userId,
                name: newArrangerName
            })
        })
    }

    const moviesCreate: { id: string, createdBy: { connect: { id: number } } }[] = [];
    if (movieUrlArray !== null) {
        movieUrlArray.forEach(movieUrl => {
            moviesCreate.push({
                id: getYoutubeMovieIdFromUrl(movieUrl),
                createdBy: {
                    connect: {
                        id: userId
                    }
                }
            })
        })
    }

    const newPiece = await prisma.piece.create({
        data: {
            userId: userId,
            title: title,
            composers: {
                connect: composersConnect,
                create: composersCreate
            },
            arrangers: {
                connect: arrangersConnect,
                create: arrangersCreate
            },
            playstyleId: playstyleId,
            publishedAtId: publishedAtId,
            movies: {
                create: moviesCreate
            },
            explanations: explanation !== null ? {
                create: {
                    userId: userId,
                    content: explanation!
                }
            } : {}
        },
        include: {
            movies: true,
            explanations: true
        }
    }).catch(() => {
        createPieceResult.error = true;
        return undefined;
    })

    if (newPiece !== undefined) {
        createPieceResult.pieceId = newPiece.id;
    }

    return createPieceResult;
}