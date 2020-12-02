import { FC } from 'react';
import firebase from '../utils/firebase';
import { GetStaticProps } from 'next';
import AnimatedMoon from '../components/animatedMoon';

type UserType = {
  isAdmin: boolean;
  totalReadPages: number;
  finishedBookIds: number[];
  name: string;
};
interface HomeProps {
  users: UserType[];
}

const Home: FC<HomeProps> = ({ users }) => (
  <>
    <AnimatedMoon />
    <div>
      {users.map(({ name, totalReadPages }, idx) => (
        <div key={name}>
          {idx + 1}. {name} – {totalReadPages} pages.
        </div>
      ))}
    </div>
  </>
);

export const getStaticProps: GetStaticProps = async () => {
  const db = firebase.firestore();
  const usersRef = db.collection('users');

  const snapshot = await usersRef.get();
  const users = snapshot.docs
    .map((doc) => doc.data())
    .sort((a, b) => b.totalReadPages - a.totalReadPages);

  return {
    props: {
      users,
    },
    revalidate: 1, // seconds
  };
};

export default Home;
