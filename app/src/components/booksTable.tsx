import { FC, useMemo } from 'react';
import { Code, Table, Grid, Collapse } from '@geist-ui/react';
import { BookType, UserType } from '../types';

interface BooksTableProps {
  users: UserType[];
  books: BookType[];
}

const BooksTable: FC<BooksTableProps> = ({ users, books }) => {
  const booksData = useMemo(
    () =>
      books
        .sort((a, b) => a.id - b.id)
        .map(({ id, name, pages }) => ({
          name: <Code>{name}</Code>,
          id,
          pages,
          finished: (
            <>x{users.filter((x) => x.finishedBookIds.includes(id)).length}</>
          ),
        })),
    [users, books]
  );
  return (
    <Grid xs={24} sm={14}>
      <Collapse title="Books">
        <Table data={booksData}>
          <Table.Column prop="id" label="#" width={50} />
          <Table.Column prop="name" label="name" width={300} />
          <Table.Column prop="pages" label="pages" width={50} />
          <Table.Column prop="finished" label="# finished" />
        </Table>
      </Collapse>
    </Grid>
  );
};

export default BooksTable;
