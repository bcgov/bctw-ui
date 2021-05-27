# Onboarding of BCTW

The onboarding page is accessible when the user's IDIR has been validated yet has not been added to the application as an accepted account. All associate logic must be a completely separate from the main application code for security reasons. For simplicity, it is made of vanilla CSS, HTML & JS. They get compiled with [PUG](https://pugjs.org) along with the appropriate user variables.

Variables the user supplies get sent to the configured user email. The email survice is called the [Common Hosted Email Service](https://getok.nrs.gov.bc.ca/app/about). It is currently configured under the _BCTW_ acronym. The following environment variables must be configured:
- BCTW_CHES_API_URL (The CHES API)
- BCTW_CHES_AUTH_URL (The oAuth token request URL)
- BCTW_CHES_TO_EMAIL (Array of emails to send to)
- BCTW_CHES_FROM_EMAIL (Single email from address)
- BCTW_CHES_USERNAME (API username)
- BCTW_CHES_PASSWORD (API password)