import {
    ActionFunctionArgs,
    LoaderFunctionArgs,
    MetaFunction,
    json,
    redirect
} from "@remix-run/node";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import { deleteUser, getUserList } from "~/.server/admin";


export const meta: MetaFunction = () => {
    return [
        { title: "ユーザーリスト" },
    ];
};

export const loader = async ({
    request,
}: LoaderFunctionArgs) => {
    const userList = await getUserList();
    return json({ userList });
};

export const action = async ({
    request
}: ActionFunctionArgs) => {
    const formData = await request.formData();
    const userId = Number(formData.get("userId"));
    deleteUser(userId);
    return redirect("/userlist");
}

export default function Register() {
    const { userList } = useLoaderData<typeof loader>();

    return (
        <div className="bg-white p-8 shadow rounded">
            <h1 className="text-2xl font-bold mb-4">ユーザーリスト</h1>
            <div className="overflow-auto">
                <table className="table-auto w-full border-collapse border-y-2">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="px-4 py-2 border-y-2">ID</th>
                            <th className="px-4 py-2 border-y-2">Username</th>
                            <th className="px-4 py-2 border-y-2">Password</th>
                            <th className="px-4 py-2 border-y-2">CreatedAt</th>
                            <th className="px-4 py-2 border-y-2">UpdatedAt</th>
                            <th className="px-4 py-2 border-y-2"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {userList !== null ? userList.map((user) => (
                            <tr key={user.id}>
                                <td className="px-4 py-2 border-y">{user.id}</td>
                                <td className="px-4 py-2 border-y">{user.username}</td>
                                <td className="px-4 py-2 border-y">{user.password}</td>
                                <td className="px-4 py-2 border-y">{user.createdAt}</td>
                                <td className="px-4 py-2 border-y">{user.updatedAt}</td>
                                <td className="px-4 py-2 border-y">
                                    <Form method="POST">
                                        <input name="userId" type="number" value={user.id} hidden readOnly />
                                        <button className="mx-2 bg-red-600 hover:bg-red-800 text-white font-bold py-2 px-4   rounded focus:outline-none focus:shadow-outline text-nowrap" type="submit">
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
