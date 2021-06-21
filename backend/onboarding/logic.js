const clicked = async () => {
  const input = document.getElementById('icon_prefix')
  const msg = input.value;
  const re = /^[^\s@]+@[^\s@]+$/; // Match a valid email

  // Grab the keycloak data from the url
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  const user = urlParams.get('user');
  const domain = urlParams.get('domain');
  const email = urlParams.get('email');
  const firstName = urlParams.get('given');
  const lastName = urlParams.get('family');

  // Form the payload to our POST /onboarding email end point
  const payload = {
    user,
    domain,
    email,
    firstName,
    lastName,
    msg
  }

  /**
   * If valid email...
   * 1. Send authorization request
   * 2. Display message according to success/failure
   * 3. Blank the input field
   */
  if (re.test(email)) {
    const request = new Request('/onboarding',{
      method: 'POST',
      body: JSON.stringify(payload),
      headers: {'content-Type': 'application/json'}
    });

    fetch(request)
      .then((res) => {
        M.toast({html: 'Your request was sent successfully'});
        input.value = '';
      })
      .catch((err) => {
        M.toast({html: 'Your request was not successfully'});
      });
  }
}