import { FC } from 'react';
import { GetStaticProps } from 'next';

import firebase from '../utils/firebase';
import daysBetweenDates from '../utils/daysBetweenDates';

import { Code, Page, Table, Badge } from '@geist-ui/react';
import AnimatedMoon from '../components/animatedMoon';

import { HomeProps, UserType } from '../types';

const MIN_PAGES_PER_DAY = 25;

const Home: FC<HomeProps> = ({ users, daysFromStart, books }) => (
  <Page>
    <AnimatedMoon />
    <pre>{JSON.stringify(books, null, 2)}</pre>
    <h1>Day #{daysFromStart}</h1>
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
      <Table.Column prop="name" label="Name" width={250} />
      <Table.Column
        prop="total"
        label={`25 * ${daysFromStart} = ${
          MIN_PAGES_PER_DAY * daysFromStart
        } pages`}
      />
    </Table>
  </Page>
);

export const getStaticProps: GetStaticProps = async () => {
  const db = firebase.firestore();
  const usersRef = db.collection('users');
  const booksRef = db.collection('books');

  const usersSnapshot = await usersRef.get();

  const allUsers = await Promise.all(
    usersSnapshot.docs.map(async (doc) => {
      const { id } = doc;
      const user = doc.data();

      const historyRef = usersRef.doc(id).collection('history');
      const historySnapshot = await historyRef.get();
      const history = historySnapshot.docs
        .map((item) => item.data())
        .map((item) => ({
          ...item,
          date: item.date.toDate(),
        }));

      return { ...user, history };
    })
  );

  const users = (allUsers as UserType[])
    .filter((user) => !user.isHidden)
    .sort((a, b) => b.totalReadPages - a.totalReadPages);

  const booksSnapshot = await booksRef.get();
  const books = booksSnapshot.docs.map((book) => book.data());

  const daysFromStart =
    daysBetweenDates(new Date('2020-12-01'), new Date()) + 1; // inclusive

  return {
    props: {
      books,
      daysFromStart,
      users: JSON.parse(JSON.stringify(users)), // https://github.com/vercel/next.js/issues/11993#issuecomment-617375501
    },
    revalidate: 1, // seconds
  };
};

export default Home;
