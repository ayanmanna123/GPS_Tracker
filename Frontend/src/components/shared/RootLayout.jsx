import { Outlet } from 'react-router-dom';
import ScrollToTop from './ScrollToTop.jsx';
import BackToTop from './BackToTop.jsx';

const RootLayout = ({ darktheme }) => {
  return (
    <>
      <ScrollToTop />
      <Outlet />
      <BackToTop darktheme={darktheme} />
    </>
  );
};

export default RootLayout;
