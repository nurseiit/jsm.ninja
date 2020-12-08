import { FC } from 'react';
import { Code, Table, Badge, Grid } from '@geist-ui/react';
import { UserType } from '../types';

const MIN_PAGES_PER_DAY = 25;

interface TotalReadTableProps {
  users: UserType[];
  daysFromStart: number;
}

const TotalReadTable: FC<TotalReadTableProps> = ({ users, daysFromStart }) => (
  <Grid xs={24} sm={12}>
    <h2>
      Total for <code>{daysFromStart}</code> days
    </h2>
    <Table
      data={users.map(({ name, totalReadPages }, idx) => ({
        name: <Code>{name}</Code>,
        idx: idx + 1,
        total: (
          <Badge
            type={
              totalReadPages >= MIN_PAGES_PER_DAY * daysFromStart
                ? 'success'
                : 'warning'
            }
          >
            {totalReadPages}
          </Badge>
        ),
      }))}
    >
      <Table.Column prop="idx" label="#" width={50} />
      <Table.Column prop="name" label="Name" width={200} />
      <Table.Column
        prop="total"
        label={`25 * ${daysFromStart} = ${
          MIN_PAGES_PER_DAY * daysFromStart
        } pages`}
      />
    </Table>
  </Grid>
);

export default TotalReadTable;
