import 'styles/AppFooter.scss';

const AppFooter = (): JSX.Element => {
  return (
    <footer className={'app-footer'}>
      <nav className={'app-nav'}>
        <ul className={'ul-right'}>
          <li>Disclaimer</li>
          <li>Privacy</li>
          <li>Accessibility</li>
          <li>Copyright</li>
        </ul>
      </nav>
    </footer>
  )
}
  
export default AppFooter;