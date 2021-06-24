const Logout = (): JSX.Element => {
    // NOTE: Keycloak's default logout handler does NOTsupport a trailing slash
    window.location.href = "/logout";
    return (
        <div className='container'>
        </div>
    )
}
export default Logout;