import React from 'react';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import IconButton from '@material-ui/core/IconButton';
import FirstPageIcon from '@material-ui/icons/FirstPage';
import KeyboardArrowLeft from '@material-ui/icons/KeyboardArrowLeft';
import KeyboardArrowRight from '@material-ui/icons/KeyboardArrowRight';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      float: 'right',
      flexShrink: 0,
      marginLeft: theme.spacing(2.5),
    },
  }),
);

interface TablePaginationActionsProps {
  count: number;
  page: number;
  rowsPerPage: number;
  onChangePage: (event: React.MouseEvent<HTMLButtonElement>, newPage: number) => void;
}

export default function PaginationActions(props: TablePaginationActionsProps): JSX.Element {
  const classes = useStyles();
  const { count, page, rowsPerPage, onChangePage } = props;

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
    <div className={classes.root}>
      <IconButton
        onClick={handleFirstPageButtonClick}
        disabled={page === 1}
        aria-label="first page"
      ><FirstPageIcon /></IconButton>

      <IconButton
        onClick={handleBackButtonClick}
        disabled={page === 1} 
        aria-label="previous page"
      ><KeyboardArrowLeft /></IconButton>

      <span><strong>Page: {page}</strong></span>

      <IconButton
        onClick={handleNextButtonClick}
        disabled={count < rowsPerPage} //{page >= Math.ceil(count / rowsPerPage) - 1}
        aria-label="next page"
      ><KeyboardArrowRight /></IconButton>

      {/* <IconButton
        onClick={handleLastPageButtonClick}
        disabled={page >= Math.ceil(count / rowsPerPage) - 1}
        aria-label="last page"
      ><LastPageIcon /></IconButton> */}
    </div>
  );
}