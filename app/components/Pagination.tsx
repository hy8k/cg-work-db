import { Link, useNavigate, useSearchParams } from '@remix-run/react';
import { RiArrowRightSLine, RiArrowLeftSLine } from 'react-icons/ri';

type PaginationProps = {
    itemsPerPage: number;
    currentPage: number;
    totalItems: number;
};

export default function Pagination({ itemsPerPage, currentPage, totalItems }: PaginationProps) {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();

    const renderPageNumbers = () => {
        const pages = [];
        for (let i = 1; i <= totalPages; i++) {
            pages.push(
                <button
                    onClick={() => {
                        setSearchParams((prev) => {
                            prev.set("page", String(i));
                            return prev;
                        });
                    }}
                    className={`px-3 py-1 mx-1 h-8 flex items-center rounded-md ${i === currentPage ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                    key={i}
                >{i}</button>
            );
        }
        return pages;
    };

    return (
        <div className="flex items-center justify-center space-x-2 mb-4">
            {currentPage !== 1 ?
                <button
                    onClick={() => {
                        setSearchParams((prev) => {
                            prev.set("page", String(currentPage - 1));
                            return prev;
                        });
                    }}
                    className="px-3 py-1 h-8 flex items-center rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300"
                >
                    <RiArrowLeftSLine />
                </button>
                :
                <div className="px-3 py-1 h-8 flex items-center rounded-md bg-gray-300 text-gray-700 hover:bg-gray-300 opacity-50 cursor-not-allowed">
                    <RiArrowLeftSLine />
                </div>
            }
            <div className="flex space-x-2">{renderPageNumbers()}</div>
            {totalPages !== 0 && currentPage !== totalPages ?
                <button
                onClick={() => {
                    setSearchParams((prev) => {
                        prev.set("page", String(currentPage + 1));
                        return prev;
                    });
                }}
                className="px-3 py-1 h-8 flex items-center rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300"
            >
                <RiArrowRightSLine />
            </button> :
                <div className="px-3 py-1 h-8 flex items-center rounded-md bg-gray-300 text-gray-700 hover:bg-gray-300 opacity-50 cursor-not-allowed">
                    <RiArrowRightSLine />
                </div>
            }
        </div >
    );
}
