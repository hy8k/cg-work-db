import {
    ActionFunctionArgs,
    LoaderFunctionArgs,
    MetaFunction,
    json,
    redirect
} from "@remix-run/node";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import { getSessionList, deleteSession } from "~/.server/admin";

export const meta: MetaFunction = () => {
    return [
        { title: "セッションリスト" },
    ];
};

export const loader = async ({
    request,
}: LoaderFunctionArgs) => {
    const userList = await getSessionList();
    return json({ userList });
};

export const action = async ({
    request
}: ActionFunctionArgs) => {
    const formData = await request.formData();
    const sessionId = formData.get("sessionId")?.toString()!;
    const deletedSession = await deleteSession(sessionId);
    return redirect("/sessionlist");
}

export default function Register() {
    const { userList } = useLoaderData<typeof loader>();

    return (
            <div className="bg-white p-8 shadow rounded">
                <h1 className="text-2xl font-bold mb-4">セッションリスト</h1>
                <div className="overflow-auto">
                    <table className="table-auto w-full border-collapse border-y-2">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="px-4 py-2 border-y-2">ID</th>
                                <th className="px-4 py-2 border-y-2">CreatedAt</th>
                                <th className="px-4 py-2 border-y-2">UpdatedAt</th>
                                <th className="px-4 py-2 border-y-2">UserId</th>
                                <th className="px-4 py-2 border-y-2"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {userList !== null ? userList.map((session) => (
                                <tr key={session.id}>
                                    <td className="px-4 py-2 border-y">{session.id}</td>
                                    <td className="px-4 py-2 border-y">{session.createdAt}</td>
                                    <td className="px-4 py-2 border-y">{session.updatedAt}</td>
                                    <td className="px-4 py-2 border-y">{session.userId}</td>
                                    <td className="px-4 py-2 border-y">
                                        <Form method="POST">
                                            <input name="sessionId" type="text" value={session.id} hidden readOnly />
                                            <button className="mx-2 bg-red-600 hover:bg-red-800 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" type="submit">
                                                削除
                                            </button>
                                        </Form>
                                    </td>
                                </tr>
                            )) : <p>データベース接続確立エラー</p>}
                        </tbody>
                    </table>
                </div>

            </div>
    );
}
