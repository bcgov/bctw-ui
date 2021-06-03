const clicked = async () => {
  const input = document.getElementById('icon_prefix')
  const email = input.value;
  const re = /^[^\s@]+@[^\s@]+$/; // Match a valid email

  /**
   * If valid email...
   * 1. Send authorization request
   * 2. Display message according to success/failure
   * 3. Blank the input field
   */
  if (re.test(email)) {
    const request = new Request('/onboarding',{
      method: 'POST',
      body: `{"email":"${email}"}`,
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