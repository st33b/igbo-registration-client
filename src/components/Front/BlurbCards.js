import {Card, Col, Row} from "react-bootstrap";

const BlurbCards = ({mode='light'}) => {
  return (
    <Row className={'gx-lg-5'}>
      <Col sm={6} md={4}>
        <Card className={'mb-3'} bg={mode}>
          <Card.Header>
            <Card.Title>
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
        <Card className={'mb-3'} bg={mode}>
          <Card.Header>
            <Card.Title>
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
        <Card className={'mb-3'} bg={mode}>
          <Card.Header>
            <Card.Title>
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
  );
}

export default BlurbCards;