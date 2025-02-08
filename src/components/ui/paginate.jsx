// components/Pagination.js
import { usePaginationStore } from "../../../store/store";
import { Button } from "./button";

const Pagination = ({ currentPage, totalPages }) => {
  const { setCurrentPage } = usePaginationStore();
  const pageNumbersToShow = 5; // Adjust the number of page numbers you want to display around the current page
  // Function to generate page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    const half = Math.floor(pageNumbersToShow / 2);
    let start = Math.max(currentPage - half, 1);
    let end = Math.min(currentPage + half, totalPages);

    if (currentPage <= half) {
      end = Math.min(pageNumbersToShow, totalPages);
    } else if (currentPage > totalPages - half) {
      start = Math.max(totalPages - pageNumbersToShow + 1, 1);
    }

    // Add the first page and ellipsis if needed
    if (start > 1) {
      pages.push(1);
      if (start > 2) pages.push("...");
    }

    // Add the middle pages
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    // Add the last page and ellipsis if needed
    if (end < totalPages) {
      if (end < totalPages - 1) pages.push("...");
      pages.push(totalPages);
    }

    return pages;
  };

  const handlePrevious = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  return (
    <div className="flex sm:flex-row flex-col-reverse items-center mt-3 justify-between px-4">
      <span className="text-black text-xs sm:text-sm px-3 font-normal">
        Page {currentPage} of {totalPages}
      </span>
      <div>
        {getPageNumbers().map((page, index) => (
          <button
            key={index}
            className={` rounded-lg px-3 py-1 text-xs my-2 sm:my-0 sm:text-sm ${
              currentPage === page
                ? "text-[#344054] bg-[#D1FAE0]"
                : " text-black"
            }`}
            onClick={() => {
              typeof page === "number" && setCurrentPage(page)
            }}
            disabled={typeof page !== "number"}
          >
            {page}
          </button>
        ))}
      </div>
      <div className="flex items-center mx-2 gap-3">
        <Button
          onClick={handlePrevious}
          disabled={currentPage === 1}
          className="border-[#D0D5DD] border h-4  sm:h-9 text-white disabled:text-black font-nunito_sans"
          // outline
        >
          ← <span className="sm:inline hidden">Previous</span>
        </Button>

        <Button
          onClick={handleNext}
          disabled={currentPage === totalPages}
          className="border-[#D0D5DD] border h-4 sm:h-9 text-white disabled:text-black font-nunito_sans"
          // outline
        >
          <span className="sm:inline hidden">Next</span> →
        </Button>
      </div>
    </div>
  );
};

export default Pagination;
