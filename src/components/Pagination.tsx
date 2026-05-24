interface PaginationProps {
    currentPage: number;
    totalPages: number;
    loading: boolean;
    onPrevious: () => void;
    onNext: () => void;
}

export function Pagination({
    currentPage,
    totalPages,
    loading,
    onPrevious,
    onNext,
}: PaginationProps) {
    return (
        <div class="pagination">
            <button
                onClick={onPrevious}
                disabled={currentPage === 1 || loading}
            >
                Previous
            </button>
            <span>
                {currentPage} of {totalPages}
            </span>
            <button
                onClick={onNext}
                disabled={currentPage === totalPages || loading}
            >
                Next
            </button>
        </div>
    );
}
