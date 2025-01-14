import type {
    ActionFunctionArgs,
    MetaFunction
} from "@remix-run/node";
import { Form } from "@remix-run/react";

export const action = async ({
}: ActionFunctionArgs) => {
    throw new Error("something wrong", {})
}


export const meta: MetaFunction = () => {
    return [
        { title: "演奏者のための曲紹介サイト - test" },
    ];
};

export default function Index() {
    return (
        <div className="pt-20 p-4">
            <div className="bg-white p-8 shadow rounded">
                <Form method="POST">
                    <button type="submit">
                        500エラー発生
                    </button>
                </Form>
            </div>
        </div>
    );
}
