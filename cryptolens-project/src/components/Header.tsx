function Header() {
    return (
        <>
            <img src="./src/assets/cryptolens-logo.png" alt="Cryptolens Logo" />
            <h1 className="text-yellow-500">Cryptolens</h1>
            <nav >
                <ul >
                    <li ><a href="/">Home</a></li>
                    <li ><a href="/about">About</a></li>
                    <li ><a href="/contact">Contact</a></li>
                </ul>
            </nav>
        </>
    );
}

export default Header;