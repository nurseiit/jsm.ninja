import { FC } from 'react';
import { GetStaticProps } from 'next';

import firebase from '../utils/firebase';
import daysBetweenDates from '../utils/daysBetweenDates';

import { Page, Grid } from '@geist-ui/react';

import AnimatedMoon from '../components/animatedMoon';
import TotalReadTable from '../components/totalReadTable';
import BooksTable from '../components/booksTable';
import TodayReadTable from '../components/todayReadTable';

import { HomeProps, UserType } from '../types';

const Home: FC<HomeProps> = ({ users, daysFromStart, books }) => (
  <Page>
    <AnimatedMoon />
    <Grid.Container gap={2} alignContent="center">
      <TodayReadTable users={users} daysFromStart={daysFromStart} />
      <TotalReadTable users={users} daysFromStart={daysFromStart} />
      <BooksTable users={users} books={books} />
    </Grid.Container>
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
