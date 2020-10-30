// returns an object
const getNotifyProps = (
  text,
  isError,
) => {
  return {
    title: isError ? 'Error' : 'Success!',
    text,
    icon: isError ? 'error' : 'check_box',
    color: isError ? 'danger' : 'success',
    time: 5000
  }
}

export {
  getNotifyProps
}