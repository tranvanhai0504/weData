import styled from "styled-components";
import React from "react"
import { SignInButton } from "./SignInButton";
import { Link, useLocation } from "react-router-dom";
import { UserDropdown } from "./desktop/UserDropdown";

const Header = styled.div`
    position: absolute;
    width: 100vw;
    height: 13vh;
    color: white;
    display: flex;
    padding: 20px 120px; 
    justify-content: space-between;
    align-items: center;
    z-index: 4
`;

const Logo = styled(Link)`
    font-size: 30px;
    background: linear-gradient(180deg, #fff 0%, rgba(255, 255, 255, 0) 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    text-fill-color: transparent;

    :hover{
        text-decoration: none
    }
`;

const ButtonGroup = styled.div`
    display: flex,
    flex-direction: row
`;

const HeaderButton = styled(Link)`
    margin-right: 40px;
    cursor: pointer;
    text-decoration: none;
    color: white;

    :hover{
        color: white;
        text-decoration: none
    }
`;

const listBtn = [
  {
    name: "Discover",
    numberID: 0,
    href: "/"
  },
  {
    name: "Data Storage",
    numberID: 1,
    href: "/dataStorage"
  },
  {
    name: "Data Marketplace",
    numberID: 2,
    href: "/marketplace"
  },
];

function Navigation(props) {

    const location = useLocation()

    return (
        <Header>
            <Logo className="fw-bold" to={"/"}>WeData</Logo>
            <ButtonGroup className="d-flex flex-row align-items-center">
                {listBtn.map((btn) => {
                    return (
                    <HeaderButton
                        key={btn.numberID}
                        to={btn.href}
                        id={btn.numberID}
                        className={location.pathname === btn.href && "text-decoration-underline"}
                    >
                        {btn.name}
                    </HeaderButton>
                    );
                })}
                {!props.signedIn && (
                    <SignInButton onSignIn={() => props.requestSignIn()} />
                )}
                {props.signedIn && (
                    <UserDropdown {...props} />
                )}
            </ButtonGroup>
        </Header>
    );
}

export default React.memo(Navigation)