import { prisma } from "./prisma";

export async function getUserList() {
    return await prisma.user.findMany().catch(() => {
        return null;
    });
}

export async function deleteUser(userId: number) {
    return await prisma.user.delete({
        where: {
            id: userId
        }
    }).catch(() => {
        return null;
    })
}

export async function getSessionList() {
    return await prisma.session.findMany().catch(() => {
        return null;
    });
}

export async function deleteSession(sessionId: string) {
    return await prisma.session.delete({
        where: {
            id: sessionId
        }
    }).catch(() => {
        return null;
    })
}