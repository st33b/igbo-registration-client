import {useEffect, useState} from "react";
import Image from "next/image";
import {Card, Col, Row} from "react-bootstrap";

import FrontLayout from '../components/Layout/FrontLayout/FrontLayout';
import logoImage from '../images/tournio-logo.png';
import logoImageDark from '../images/tournio-logo-inverted.png';
import screenshot from '../images/demo-screenshot.jpg';

const Page = () => {
  const [scheme, setScheme] = useState('light');
  useEffect(() => {
    if (!window) {
      return;
    }
    if (window.matchMedia &&
      window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setScheme('dark');

      window.matchMedia('(prefers-color-scheme: dark)').addEventListener(
        'change', event => {
          if (event.matches) {
            setScheme('dark');
          } else {
            setScheme('light');
          }
        }
      );
    }
  });

  return (
    <div>
      <div className="container col-xxl-10 px-4 pt-2 pb-md-3">
        <div className="row d-flex align-items-center g-2 g-md-4 g-lg-5 py-0 py-md-3">

          <div className="col-lg-6 pb-2 pb-md-0">
            <div className="mb-3">
              {scheme === 'light' && <Image src={logoImage}/>}
              {scheme === 'dark' && <Image src={logoImageDark}/>}
            </div>
            <p className="lead mb-1">
              A registration system for IGBO bowling tournaments that is easy to use for both bowlers and
              committee members alike. With easy setup, testing, registration, administration, and reporting.
              Plus a reliable payments integration, courtesy of Stripe.
            </p>
          </div>

          <div className="d-none d-sm-block col-10 offset-1 col-lg-6 offset-lg-0">
            <Image src={screenshot}
                   className="d-block mx-lg-auto img-fluid"
                   alt="Demo Tournament sample image"
            />
          </div>

        </div>
      </div>

      <Row className={'gx-lg-5'}>
        <Col sm={6} md={4}>
          <Card className={'mb-3'}>
            <Card.Header>
              <Card.Title className={'mb-0'}>
                Flexible Registration
              </Card.Title>
            </Card.Header>
            <Card.Body>
              <Card.Text>
                Allow your bowlers to register full or partial teams, join existing partial teams, or even register
                individually.
              </Card.Text>
              <Card.Text>
                There's even support for tournaments with non-traditional formats.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>

        <Col sm={6} md={4}>
          <Card className={'mb-3'}>
            <Card.Header>
              <Card.Title className={'mb-0'}>
                Powerful Administration
              </Card.Title>
            </Card.Header>
            <Card.Body>
              <Card.Text>
                Test registration before opening, and simulate early or late registration periods.
              </Card.Text>
              <Card.Text>
                Fix bowler details, merge partial teams, and get email notifications of registrations and payments.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>

        <Col sm={6} md={4}>
          <Card className={'mb-3'}>
            <Card.Header>
              <Card.Title className={'mb-0'}>
                Go Beyond...
              </Card.Title>
            </Card.Header>
            <Card.Body>
              <Card.Text>
                Let your bowlers sign up for additional events and buy extra stuff: Division-based events, optional
                events,
                banquet tickets for non-bowlers, raffle ticket bundles, and more.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <div className="d-grid gap-3 d-sm-flex justify-content-sm-center pt-sm-3">
        <a href="mailto:info@tourn.io?subject=Using%20Tournio"
           className="btn btn-outline-primary btn-lg px-4 gap-3">
          Get In Touch
        </a>
        <a href={'/tournaments'}
           title={'See the list of current tournaments'}
           className="btn btn-outline-secondary btn-lg px-4">
          Current Tournaments
        </a>
      </div>
    </div>
  );
}

Page.getLayout = function getLayout(page) {
  return (
    <FrontLayout>
      {page}
    </FrontLayout>
  );
}

export default Page;