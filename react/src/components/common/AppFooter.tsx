import 'styles/AppFooter.scss';

const AppFooter = (): JSX.Element => {
  return (
    <footer className={'app-footer'}>
      <nav className={'app-nav'}>
        <ul className={'ul-right'}>
          <li><a href='https://www2.gov.bc.ca/gov/content/home/disclaimer' target='_blank'>Disclaimer</a></li>
          <li><a href='https://www2.gov.bc.ca/gov/content/home/privacy' target='_blank'>Privacy</a></li>
          <li><a href='https://www2.gov.bc.ca/gov/content/home/accessibility' target='_blank'>Accessibility</a></li>
          <li><a href='https://www2.gov.bc.ca/gov/content/home/copyright' target='_blank'>Copyright</a></li>
        </ul>
      </nav>
    </footer>
  )
}

export default AppFooter;