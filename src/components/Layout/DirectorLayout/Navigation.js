import {useState, useEffect} from 'react';
import {Container, Nav, Navbar} from "react-bootstrap";

import {useDirectorContext} from "../../../store/DirectorContext";

import classes from './Navigation.module.scss';

const Navigation = () => {
  const directorContext = useDirectorContext();

  const [loggedIn, setLoggedIn] = useState(false);
  const [isSuperuser, setIsSuperuser] = useState(false);

  useEffect(() => {
    setLoggedIn(directorContext.isLoggedIn);
    setIsSuperuser(directorContext.user && directorContext.user.role === 'superuser');
  }, [directorContext.isLoggedIn, directorContext.user]);

  return (
    <div className={classes.Navigation}>
      <nav className={'navbar navbar-expand-md navbar-dark bg-dark'}>
      {/*<Navbar collapseOnSelect expand={'md'} variant={'dark'}>*/}
        <div className={classes.BrandWrapper}>
          <a href={'/director'} className={`navbar-brand ${classes.Brand}`}>
            {/* This is a bit of a hack to make the image clickable. It will resize to however long the text is. */}
            <span className={'invisible'}>
              Tournio-oh-oh
            </span>
            {/* For assistive technologies */}
            <span className={`visually-hidden`}>
              Tournio
            </span>
          </a>
        </div>
        {loggedIn && (
          <>
            {/*<Navbar.Toggle aria-controls="basic-navbar-nav" />*/}
            <button className="navbar-toggler"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#basic-navbar-nav"
                    aria-controls="basic-navbar-nav"
                    aria-expanded="false"
                    aria-label="Toggle navigation">
              <span className="navbar-toggler-icon"></span>
            </button>

            {/*<Navbar.Collapse id={'basic-navbar-nav'}>*/}
            <div className={'collapse navbar-collapse'} id={'basic-navbar-nav'}>
              <div className={'navbar-nav ms-4 me-auto'}>
                {isSuperuser && (
                  <a href={'/director/users'} className={'nav-link'}>
                    User Accounts
                  </a>
                )}
                {directorContext.user && (
                  <a href={'/director/users/' + directorContext.user.identifier}
                     className={'nav-link'}>
                    My Profile
                  </a>
                )}
              </div>
              <div className={'navbar-nav ms-2 ms-md-auto pe-2'}>
                <a href={'/director/logout'} className={'nav-link'}>
                  Log Out
                </a>
              </div>
            </div>
          </>
        )}
      {/*</Navbar>*/}
      </nav>
    </div>
  );
};

export default Navigation;