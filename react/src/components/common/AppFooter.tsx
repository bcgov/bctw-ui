import 'styles/AppFooter.scss';
// import { Link } from 'react-router-dom';

const AppFooter = (): JSX.Element => {
  return (
    <footer className={'app-footer'}>
      <nav className={'app-nav'}>
        <ul className={'ul-right'}>
          <li>Disclaimer</li>
          <li>Privacy</li>
          <li>Accessibility</li>
          <li>Copyright</li>
          {/* <li><Link to='/data' color={'inherit'}>Manage</Link></li> */}
        </ul>
      </nav>
    </footer>
  )
}
  
export default AppFooter;