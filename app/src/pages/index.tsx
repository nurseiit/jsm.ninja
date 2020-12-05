import { FC } from 'react';
import { GetStaticProps } from 'next';
import firebase from '../utils/firebase';

import { Code, Page, Table, Badge } from '@geist-ui/react';
import AnimatedMoon from '../components/animatedMoon';

type UserType = {
  isAdmin: boolean;
  isHidden: boolean;
  totalReadPages: number;
  finishedBookIds: number[];
  name: string;
};
interface HomeProps {
  users: UserType[];
}

const Home: FC<HomeProps> = ({ users }) => {
  return (
    <Page>
      <AnimatedMoon />
      <Table
        data={users.map(({ name, totalReadPages }, idx) => ({
          name: <Code>{name}</Code>,
          idx: idx + 1,
          total: <Badge type="success">{totalReadPages}</Badge>,
        }))}
      >
        <Table.Column prop="idx" label="#" width={50} />
        <Table.Column prop="name" label="Name" width={250} />
        <Table.Column prop="total" label="Total Pages" />
      </Table>
    </Page>
  );
};

export const getStaticProps: GetStaticProps = async () => {
  const db = firebase.firestore();
  const usersRef = db.collection('users');

  const snapshot = await usersRef.get();
  const users = snapshot.docs
    .map((doc) => doc.data())
    .filter((user) => !user.isHidden)
    .sort((a, b) => b.totalReadPages - a.totalReadPages);

  return {
    props: {
      users,
    },
    revalidate: 1, // seconds
  };
};

export default Home;
