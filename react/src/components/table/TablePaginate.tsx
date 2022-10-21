import React from 'react';
import IconButton from '@mui/material/IconButton';
import { Icon } from 'components/common';

interface TablePaginationActionsProps {
  count: number;
  page: number;
  rowsPerPage: number;
  onChangePage: (event: React.MouseEvent<HTMLButtonElement>, newPage: number) => void;
  totalPages: number;
}

export default function PaginationActions(props: TablePaginationActionsProps): JSX.Element {
  const { count, rowsPerPage, onChangePage, totalPages } = props;
  const { page } = props;

  const handleFirstPageButtonClick = (event: React.MouseEvent<HTMLButtonElement>): void => {
    onChangePage(event, +1);
  };

  const handleBackButtonClick = (event: React.MouseEvent<HTMLButtonElement>): void => {
    onChangePage(event, page - 1);
  };

  const handleNextButtonClick = (event: React.MouseEvent<HTMLButtonElement>): void => {
    onChangePage(event, page + 1);
  };

  return (
    <>
      <IconButton
        onClick={handleFirstPageButtonClick}
        disabled={page === 1}
        aria-label="first page"
        size="large"><Icon icon='first' /></IconButton>

      <IconButton
        onClick={handleBackButtonClick}
        disabled={page === 1}
        aria-label="previous page"
        size="large"><Icon icon='back'/></IconButton>

      <span><strong>{`Page: ${page} / ${totalPages}`}</strong></span>

      <IconButton
        onClick={handleNextButtonClick}
        //{page >= Math.ceil(count / rowsPerPage) - 1}
        disabled={count < rowsPerPage}
        aria-label="next page"
        size="large"><Icon icon='next'/></IconButton>
    </>

  );
}