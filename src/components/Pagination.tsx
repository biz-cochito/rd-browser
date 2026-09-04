import { CaretDownIcon, CaretLeftIcon, CaretRightIcon, CaretUpIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    loading: boolean;
    onPageChange: (page: number) => void;
    onPrevious: () => void;
    onNext: () => void;
}

export function Pagination({
    currentPage,
    totalPages,
    loading,
    onPageChange,
    onPrevious,
    onNext,
}: PaginationProps) {
    if (totalPages <= 1) return null;

    const handlePageChange = (value: string, input: HTMLInputElement) => {
        const page = Number.parseInt(value, 10);
        if (Number.isNaN(page)) {
            input.value = String(currentPage);
            return;
        }

        onPageChange(Math.min(totalPages, Math.max(1, page)));
    };

    return (
        <div className="flex items-center justify-between gap-4 py-3 my-2 text-xs">
            <label className="text-muted-foreground font-medium flex items-center gap-1">
                Page
                <div className="flex items-stretch">
                    <Input
                        key={currentPage}
                        type="text"
                        inputMode="numeric"
                        min={1}
                        max={totalPages}
                        defaultValue={currentPage}
                        disabled={loading}
                        onBlur={(event) => handlePageChange(event.currentTarget.value, event.currentTarget)}
                        onKeyDown={(event) => {
                            if (event.key === "Enter") event.currentTarget.blur();
                        }}
                        aria-label="Current page"
                        className="w-10 h-7 px-1 text-center text-foreground rounded-r-none border-border bg-background"
                    />
                    <div className="flex flex-col">
                        <Button
                            variant="outline"
                            size="icon-xs"
                            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                            disabled={currentPage >= totalPages || loading}
                            aria-label="Next page"
                            className="h-3.5 min-h-0 w-5 rounded-l-none rounded-b-none border-l-0 border-b-0"
                        >
                            <CaretUpIcon size={10} />
                        </Button>
                        <Button
                            variant="outline"
                            size="icon-xs"
                            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                            disabled={currentPage <= 1 || loading}
                            aria-label="Previous page"
                            className="h-3.5 min-h-0 w-5 rounded-l-none rounded-t-none border-l-0"
                        >
                            <CaretDownIcon size={10} />
                        </Button>
                    </div>
                </div>
                of{" "}
                <span className="text-foreground">{totalPages}</span>
            </label>

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
