import React from 'react'
import { Container, Nav, Navbar } from 'react-bootstrap'
import Link from 'next/link'
import logo from '../public/logo.svg'
import Image from 'next/image'

const NavbarComp = () => {
  return (
    <Navbar collapseOnSelect variant="light" expand="lg" bg="light" >
      <Container>
        <Link href="/" passHref>
           <Navbar.Brand>
             <Image src = {logo} alt ="" width ="40px" height = "40px"/>{''}
             {/* Dao App*/}
           </Navbar.Brand>
        </Link>

        <Navbar.Toggle aria-controls="responsive-navbar-nav" />
        <Navbar.Collapse id="responsive-navbar-nav">
          <Nav className="me-auto">
            <Link href="/whitelist" passHref>
              <Nav.Link>Whitelist</Nav.Link>
            </Link>
            <Link href="/nft" passHref>
              <Nav.Link>NFT</Nav.Link>
            </Link>
            <Link href="/ico" passHref>
              <Nav.Link>ICO</Nav.Link>
            </Link>
          </Nav>
          <Nav>
            <Link href="/" passHref>
              <Nav.Link>DAO</Nav.Link>
            </Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  )
}


export default NavbarComp