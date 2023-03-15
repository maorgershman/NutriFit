
export const Pagination = (props: {
  page: number,
  totalResults: number,
  resultsPerPage: number,
  onPageClicked?: (page: number) => Promise<void> | void,
}) => {
  const { page, totalResults, resultsPerPage, onPageClicked } = props;
  // When printing, show [] range instead of [), and start at 1 instead of 0
  const from = (page - 1) * resultsPerPage + 1;
  const to = Math.min(page * resultsPerPage, totalResults);
  const totalPages = Math.ceil(totalResults / resultsPerPage);
  const maxPagesToShow = 5;

  const noResults = 'No results';
  const showingResultsXYZ = `Showing results ${from}-${to} from ${totalResults}`;
  const description = totalResults ? showingResultsXYZ : noResults;

  const firstPageString = '«';
  const lastPageString = '»';

  // try to show the current page in the middle
  const half = Math.floor(maxPagesToShow / 2);

  const pagesToShow = [] as string[];
  pagesToShow.push(firstPageString);
  if (totalPages <= maxPagesToShow || page <= half) {
    for (let i = 1; i <= Math.min(totalPages, maxPagesToShow); i++) {
      pagesToShow.push(`${i}`);
    }
  } else {
    // you're approaching the end
    // Ex. totalPages = 46, page = 45, maxPagesToShow = 5
    // [42][43][44][_45_][46]
    if (page + half > totalPages) {
      // push [42][43][44][_45_][46]
      for (let i = totalPages - maxPagesToShow + 1; i <= totalPages; i++) {
        pagesToShow.push(`${i}`);
      }
    }

    // you're in between
    // Ex. totalPages = 46, page = 37, maxPagesToShow = 5
    // [36][37][_38_][39][40]
    else {
      for (let i = page - half; i < page - half + maxPagesToShow; i++) {
        pagesToShow.push(`${i}`);
      }
    }
  }
  pagesToShow.push(lastPageString);

  return (
    <div className='row' style={{ justifyContent: 'flex-end', marginTop: '1rem', marginBottom: '0.5rem' }}>
      <div className='col-auto d-table' style={{ marginBottom: '1rem' }}>
        <span className='d-table-cell align-middle'>{description}</span>
      </div>
      <div className='col' />
      {
        totalPages > 1 &&
        <nav className='col-auto' dir='ltr' style={{ userSelect: 'none' }}>
          <ul className='pagination' style={{ marginBottom: 0, overflowX: 'auto' }}>
            {
              pagesToShow.map((pageString, index) => {
                const isToFirstPage = pageString === firstPageString;
                const isToLastPage = pageString === lastPageString;

                const isFirstPage = page === 1;
                const isLastPage = page === totalPages;
                const isSamePage = pageString === `${page}`;

                let className = 'page-item';
                if (isSamePage) {
                  className += ' active';
                } else if ((isToFirstPage && isFirstPage) || (isToLastPage && isLastPage)) {
                  className += ' disabled';
                }

                return (
                  <li className={className} key={index}>
                    <button
                      className='page-link'
                      disabled={isSamePage}
                      onClick={
                        async () => {
                          const page = isToFirstPage ? 1 : isToLastPage ? totalPages : parseInt(pageString);
                          if (onPageClicked) {
                            await onPageClicked(page);
                          }
                          (document.activeElement as HTMLButtonElement).blur();
                          document.body.focus();
                        }
                      }>
                      {pageString}
                    </button>
                  </li>
                );
              })
            }
          </ul>
        </nav>
      }
    </div>
  );
}