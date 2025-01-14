import { Link, Form, useNavigation } from "@remix-run/react";
import { useState, useEffect, useRef } from 'react';
import { RiAccountCircleLine, RiMenuFill } from 'react-icons/ri';

export default function Navbar(
    { currentUserId = 0, currentUsername = "Guest" }
) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };
    const navigation = useNavigation();

    // const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    // const userMenuRef = useRef<HTMLDivElement>(null);

    // const toggleUserMenu = () => {
    //     setIsUserMenuOpen(!isUserMenuOpen);
    // };


    // const handleClickOutside = (event: MouseEvent) => {
    //     if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
    //         setIsUserMenuOpen(false);
    //     }
    // };

    // useEffect(() => {
    //     document.addEventListener('mousedown', handleClickOutside);
    //     return () => {
    //         document.removeEventListener('mousedown', handleClickOutside);
    //     };
    // }, []);

    return (
        <nav className="fixed bg-white shadow px-3 py-2 w-full flex justify-between items-center z-20 h-14">
            <div className="hidden md:flex items-center">
                <button onClick={toggleMenu} className="text-gray-700 focus:outline-none hover:bg-slate-100 p-3 mr-2 rounded-full transition-colors">
                    <RiMenuFill size={18} />
                </button>
                <Link to="/">
                    <h1 className="text-xl font-bold mr-3">クラシックギター作品データベース</h1>
                </Link>
            </div>
            <div className="hidden md:flex">
                {currentUserId === 0 ?
                    <>
                        <div className="md:flex mr-2">
                            <Link to="/register" className=" border border-black hover:bg-slate-100 py-2 px-3 rounded transition-colors mr-2">ユーザー登録</Link>
                            <Link to="/login" className="bg-blue-600 hover:bg-blue-800 text-white py-2 px-3 rounded transition-colors">ログイン</Link>
                        </div>
                    </>
                    :
                    <>
                        <div className="md:flex mr-2">
                            <Link to="/mypage" className=" border border-black hover:bg-slate-100 py-2 px-3 rounded transition-colors mr-2">マイページ</Link>
                            <Form method="POST" action="/">
                                <button type="submit" className={`text-white bg-red-600 w-24 py-2 px-3 rounded transition-colors mr-2  
                                    ${navigation.state === "submitting" || navigation.state === "loading" ? "" : "hover:bg-red-800 "}`} disabled={navigation.state === "submitting" || navigation.state === "loading"}>
                                    {navigation.state === "submitting" ?
                                        <div className="h-full flex justify-center items-center">
                                            <div className="animate-spin h-6 w-6 border-4 rounded-full border-t-transparent"></div>
                                        </div>
                                        :
                                        <p>ログアウト</p>
                                    }
                                </button>
                            </Form>
                        </div>
                    </>

                }
                <div className="border-l-2 px-1 w-36 flex items-center justify-end">
                    <div className="flex flex-col flex-grow items-end mr-1">
                        <p className="text-xs text-gray-500">{currentUserId === -1 ? "ログインエラー" : (currentUserId === 0 ? "ログインしていません" : "ログインしています")}</p>
                        <p className="text-xs text-gray-700 font-medium">{currentUsername}</p>
                    </div>
                    <RiAccountCircleLine size="35" />
                </div>

            </div>
            <div className="md:hidden flex items-center">
                <button onClick={toggleMenu} className="text-gray-700 focus:outline-none hover:bg-slate-100 p-3 mr-2 rounded-full transition-colors">
                    <RiMenuFill size={18} />
                </button>
                <Link to="/">
                    <h1 className="text-xl font-bold">クラシックギター作品DB</h1>
                </Link>
            </div>
            {/* Overlay */}
            <div
                className={`fixed inset-0 bg-black ${isMenuOpen ? 'opacity-50' : 'opacity-0 pointer-events-none'} transition-opacity duration-300 z-10`}
                onClick={() => { if (isMenuOpen) toggleMenu() }}
            ></div>
            <div className={`fixed top-0 left-0 w-64 h-full bg-white shadow transform ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out z-20`}>
                <div className="p-4 flex flex-col h-full">
                    <div className="flex-grow">
                        <Link to={"/userlist"} className="block hover:bg-slate-100 py-1 px-2 transition-colors rounded" onClick={toggleMenu}>ユーザーリスト</Link>
                        <Link to={"/sessionlist"} className="block hover:bg-slate-100 py-1 px-2 transition-colors rounded" onClick={toggleMenu}>セッションリスト</Link>
                        <Link to={"/pieces"} className="block hover:bg-slate-100 py-1 px-2 transition-colors rounded" onClick={toggleMenu}>作品一覧</Link>
                        <Link to={"/post"} className="block hover:bg-slate-100 py-1 px-2 transition-colors rounded" onClick={toggleMenu}>作品投稿</Link>
                    </div>
                    <div className="px-1 w-full rounded flex flex-col md:hidden">
                        <div className="items-center justify-end flex mb-2">
                            <RiAccountCircleLine size="35" className="f" />
                            <div className="flex flex-col flex-grow px-1">
                                <p className="text-xs text-gray-500">{currentUserId === -1 ? "ログインエラー" : (currentUserId === 0 ? "ログインしていません" : "ログインしています")}</p>
                                <p className="text-sm text-gray-700 font-medium">{currentUsername}</p>
                            </div>
                        </div>
                        <div className="flex mr-2">
                            {currentUserId === 0 ?
                                <>
                                    <div className="flex mr-2">
                                        <Link to="/register" className="text-xs border border-black hover:bg-slate-100 py-2 px-3 rounded transition-colors mr-2" onClick={toggleMenu}>ユーザー登録</Link>
                                        <Link to="/login" className="text-xs bg-blue-600 hover:bg-blue-800 text-white py-2 px-3 rounded transition-colors" onClick={toggleMenu}>ログイン</Link>
                                    </div>
                                </>
                                :
                                <>
                                    <div className="flex mr-2">
                                        <Link to="/mypage" className="text-xs border border-black hover:bg-slate-100 py-2 px-3 rounded transition-colors mr-2" onClick={toggleMenu}>マイページ</Link>
                                        <Form method="POST" action="/">
                                            <button type="submit" className="text-xs text-white bg-red-600 hover:bg-red-800 py-2 px-3 rounded transition-colors mr-2" onClick={toggleMenu}>ログアウト</button>
                                        </Form>
                                    </div>
                                </>
                            }
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
}
