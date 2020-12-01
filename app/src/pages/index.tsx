import { FC } from 'react';
import firebase from '../utils/firebase';
import { GetStaticProps } from 'next';
import styled, { keyframes } from 'styled-components';

const ANIMATION_DURATION = '3s';

const Centered = styled.h1`
  ${({ theme }) => `
    background: ${theme.background};
    color: ${theme.color};
  `}
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 90px;
`;

const Moon = styled.span`
  ${({ theme }) => `
    background: ${theme.color};
  `}
  height: 50px;
  width: 50px;
  margin-bottom: -7px;
  border-radius: 50%;
`;

const moveAnimation = keyframes`
  0%, 25% { transform: translateX(-50%); }
  75%, 100% { transform: translateX(50%); }
`;

const shrinkAnimationOne = keyframes`
  0%, 25% { transform: scale(0.8); }
  75%, 100% { transform: scale(1); }
`;

const shrinkAnimationTwo = keyframes`
  0%, 25% { transform: scale(1); }
  75%, 100% { transform: scale(0.8); }
`;

const MoonOne = styled(Moon)`
  animation: ${shrinkAnimationOne} ${ANIMATION_DURATION} linear infinite
    alternate;
`;

const MoonTwo = styled(Moon)`
  animation: ${shrinkAnimationTwo} ${ANIMATION_DURATION} linear infinite
    alternate;
`;

const MovingMoon = styled.span`
  ${({ theme }) => `
    background: ${theme.background};
  `}

  height: 40px;
  width: 40px;
  border-radius: 50%;

  animation: ${moveAnimation} ${ANIMATION_DURATION} linear infinite alternate;
  z-index: 69;

  margin: auto -15px;
`;

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
    <Centered>
      <MoonOne />
      <MovingMoon />
      <MoonTwo />
    </Centered>
    <div>
      {users.map(({ name, totalReadPages }, idx) => (
        <span key={name}>
          {idx + 1}. {name} – {totalReadPages} pages.
        </span>
      ))}
    </div>
  </>
);

export const getStaticProps: GetStaticProps = async () => {
  const db = firebase.firestore();
  const usersRef = db.collection('users');

  const snapshot = await usersRef.get();
  const users = snapshot.docs.map((doc) => doc.data());

  return {
    props: {
      users,
    },
    revalidate: 1, // seconds
  };
};

export default Home;
