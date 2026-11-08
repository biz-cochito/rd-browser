import {
  CaretDownIcon,
  CaretLeftIcon,
  CaretRightIcon,
  CaretUpIcon,
} from "@phosphor-icons/react";
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
    <div className="flex items-center justify-between gap-4 py-2 text-[13px]">
      <label className="flex items-center gap-2 text-body">
        <span className="typo-caption-uppercase text-muted-text">Page</span>
        <div className="inline-flex items-stretch rounded-[8px] border border-hairline bg-surface-card overflow-hidden">
          <Input
            key={currentPage}
            type="text"
            inputMode="numeric"
            min={1}
            max={totalPages}
            defaultValue={currentPage}
            disabled={loading}
            onBlur={(event) =>
              handlePageChange(event.currentTarget.value, event.currentTarget)
            }
            onKeyDown={(event) => {
              if (event.key === "Enter") event.currentTarget.blur();
            }}
            aria-label="Current page"
            className="h-8 w-11 rounded-none border-0 bg-transparent px-1.5 py-0 text-center font-mono text-[13px] font-medium text-ink focus-visible:ring-0"
          />
          <div className="flex flex-col border-l border-hairline">
            <button
              type="button"
              onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage >= totalPages || loading}
              aria-label="Next page"
              className="flex h-4 w-5 items-center justify-center bg-canvas-soft text-body hover:bg-surface-strong hover:text-ink disabled:opacity-40 cursor-pointer"
            >
              <CaretUpIcon size={10} weight="bold" />
            </button>
            <button
              type="button"
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage <= 1 || loading}
              aria-label="Previous page"
              className="flex h-4 w-5 items-center justify-center border-t border-hairline bg-canvas-soft text-body hover:bg-surface-strong hover:text-ink disabled:opacity-40 cursor-pointer"
            >
              <CaretDownIcon size={10} weight="bold" />
            </button>
          </div>
        </div>
        <span className="text-muted-text">of</span>
        <span className="font-mono font-medium text-ink">{totalPages}</span>
      </label>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onPrevious}
          disabled={currentPage <= 1 || loading}
          className="h-8 gap-1.5 px-3"
        >
          <CaretLeftIcon size={13} weight="bold" />
          <span>Previous</span>
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={onNext}
          disabled={currentPage >= totalPages || loading}
          className="h-8 gap-1.5 px-3"
        >
          <span>Next</span>
          <CaretRightIcon size={13} weight="bold" />
        </Button>
      </div>
    </div>
  );
}
