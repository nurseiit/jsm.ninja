import { createGlobalStyle } from 'styled-components';
import { Theme } from './types';

interface GlobalStyleProps {
  theme: Theme;
}

export default createGlobalStyle<GlobalStyleProps>`${({ theme }) => `body {
    background: ${theme.background};
    color: ${theme.color};
    font-family: 'Baloo 2', cursive;
  }`}
`;
