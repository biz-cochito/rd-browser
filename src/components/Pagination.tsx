import { CaretLeftIcon, CaretRightIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";

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
    if (totalPages <= 1) return null;

    return (
        <div className="flex items-center justify-between gap-4 py-3 my-2 text-xs">
            <span className="text-muted-foreground font-medium">
                Page <span className="text-foreground">{currentPage}</span> of{" "}
                <span className="text-foreground">{totalPages}</span>
            </span>

            <div className="flex items-center gap-1.5">
                <Button
                    variant="outline"
                    size="xs"
                    onClick={onPrevious}
                    disabled={currentPage <= 1 || loading}
                    className="gap-1 h-8 px-2.5"
                >
                    <CaretLeftIcon size={14} />
                    <span>Previous</span>
                </Button>

                <Button
                    variant="outline"
                    size="xs"
                    onClick={onNext}
                    disabled={currentPage >= totalPages || loading}
                    className="gap-1 h-8 px-2.5"
                >
                    <span>Next</span>
                    <CaretRightIcon size={14} />
                </Button>
            </div>
        </div>
    );
}
