import { FC, useMemo } from 'react';
import { Code, Table, Grid, Badge, Collapse } from '@geist-ui/react';

import { UserType } from '../types';
import { MIN_PAGES_PER_DAY } from './totalReadTable';

import sameDay from '../utils/sameDay';

interface TodayReadTableProps {
  users: UserType[];
  daysFromStart: number;
}

const TodayReadTable: FC<TodayReadTableProps> = ({ users, daysFromStart }) => {
  const todayData = useMemo(
    () =>
      users.map(({ name, history }, idx) => {
        const todayHistory = history.find((x) =>
          sameDay(new Date(x.date), new Date())
        );
        return {
          idx: idx + 1,
          name: <Code>{name}</Code>,
          read: todayHistory && (
            <Badge
              type={
                todayHistory.pages >= MIN_PAGES_PER_DAY ? 'success' : 'warning'
              }
            >
              {todayHistory.pages}
            </Badge>
          ),
        };
      }),
    [users]
  );
  return (
    <Grid xs={24} sm={12}>
      <Collapse title={`Today, Day #${daysFromStart}`}>
        <Table data={todayData}>
          <Table.Column prop="idx" label="#" width={50} />
          <Table.Column prop="name" label="Name" width={200} />
          <Table.Column prop="read" label="read" />
        </Table>
      </Collapse>
    </Grid>
  );
};

export default TodayReadTable;
