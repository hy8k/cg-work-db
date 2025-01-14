import { Link } from '@remix-run/react';
import { RiArrowRightSLine, RiArrowLeftSLine } from 'react-icons/ri';

type PaginationProps = {
    urlString: string,
    itemsPerPage: number;
    currentPage: number;
    totalItems: number;
};

export default function Pagination({ urlString, itemsPerPage, currentPage, totalItems }: PaginationProps) {
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    const renderPageNumbers = () => {
        const pages = [];
        for (let i = 1; i <= totalPages; i++) {
            pages.push(
                <Link
                    to={urlString.replace(/page=\d+/g, `page=${String(i)}`).concat(!urlString.includes("page=") ? (urlString.includes("?") ? `&page=${String(i)}` : `?page=${String(i)}`) : "")}
                    key={i}
                    className={`px-3 py-1 mx-1 h-8 flex items-center rounded-md ${i === currentPage ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                >
                    {i}
                </Link>
            );
        }
        return pages;
    };

    return (
        <div className="flex items-center justify-center space-x-2 mb-4">
            {currentPage !== 1 ?
                <Link
                    to={urlString.replace(/page=\d+/g, `page=${String(currentPage - 1)}`).concat(!urlString.includes("page=") ? (urlString.includes("?") ? `&page=${String(currentPage - 1)}` : `?page=${String(currentPage - 1)}`) : "")}
                    className="px-3 py-1 h-8 flex items-center rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300"
                >
                    <RiArrowLeftSLine />
                </Link>
                :
                <div className="px-3 py-1 h-8 flex items-center rounded-md bg-gray-300 text-gray-700 hover:bg-gray-300 opacity-50 cursor-not-allowed">
                    <RiArrowLeftSLine />
                </div>
            }
            <div className="flex space-x-2">{renderPageNumbers()}</div>
            {totalPages !== 0 && currentPage !== totalPages ?
                <Link
                    to={urlString.replace(/page=\d+/g, `page=${String(currentPage + 1)}`).concat(!urlString.includes("page=") ? (urlString.includes("?") ? `&page=${String(currentPage + 1)}` : `?page=${String(currentPage + 1)}`) : "")}
                    className="px-3 py-1 h-8 flex items-center rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300"
                >
                    <RiArrowRightSLine />
                </Link> :
                <div className="px-3 py-1 h-8 flex items-center rounded-md bg-gray-300 text-gray-700 hover:bg-gray-300 opacity-50 cursor-not-allowed">
                    <RiArrowRightSLine />
                </div>
            }
        </div >
    );
}
