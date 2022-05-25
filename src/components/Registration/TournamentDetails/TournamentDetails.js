import {useRouter} from "next/router";
import {Card, Col, ListGroup, Row, ProgressBar} from "react-bootstrap";
import LoadingMessage from "../../ui/LoadingMessage/LoadingMessage";

import classes from './TournamentDetails.module.scss';
import ShiftCapacity from "../../common/ShiftCapacity/ShiftCapacity";
import ProgressBarLegend from "../../common/ShiftCapacity/ProgressBarLegend";

const USBC_ID_LOOKUP_URL = 'https://webapps.bowl.com/USBCFindA/Home/Member';
const IGBO_ID_LOOKUP_URL = 'http://igbo.org/tournaments/igbots-id-lookup/';

const TournamentDetails = ({tournament}) => {
  const router = useRouter();

  if (!tournament) {
    return <LoadingMessage message={'Retrieving tournament details...'}/>;
  }

  /////////////////////////////////////////////////////
  // State banner, to indicate states other than active

  let stateHeader = '';
  let stateText = '';
  let stateIcon = '';
  let stateClasses = ['alert'];
  switch (tournament.state) {
    case 'setup':
      stateHeader = 'This tournament is in setup mode.';
      stateText = 'Creating registrations in this state is not permitted.';
      stateIcon = <i className={'bi-bricks pe-3'} aria-hidden={true}/>
      stateClasses.push('alert-warning');
      break;
    case 'testing':
      stateHeader = 'This tournament is in testing mode.';
      stateText = 'You may create registrations and test the payment flow, but data is subject to deletion at any time.';
      stateIcon = <i className={'bi-tools pe-3'} aria-hidden={true}/>
      stateClasses.push('alert-info');
      break;
    case 'demo':
      stateHeader = 'This is a demonstration tournament.'
      stateText = 'You may create registrations and test the payment flow, but data is subject to deletion at any time.';
      stateClasses.push('alert-primary');
      stateIcon = <i className={'bi-clipboard2-check pe-3'} aria-hidden={true}/>
      break;
    case 'closed':
      stateHeader = 'Registration for this tournament has closed.';
      stateIcon = <i className={'bi-door-closed pe-3'} aria-hidden={true}/>
      stateClasses.push('alert-dark');
      break;
    default:
      stateText = '';
      stateClasses = ['d-none'];
  }
  const stateBanner = (
    <div className={stateClasses.join(' ')}>
      <h2 className={'alert-heading'}>
        {stateIcon}
        {stateHeader}
      </h2>
      <p className={'mb-0'}>
        {stateText}
      </p>
    </div>
  );

  ////////////////////////////////////////////////////

  const dtClass = 'col-6 col-lg-5 col-xl-4 pe-1';
  const ddClass = 'col-6 col-lg-7 col-xl-8 ps-1';

  let early_registration = '';
  if (tournament.early_registration_ends) {
    early_registration = (
      <div className={'row pb-2'}>
        <dt className={dtClass}>
          Early registration deadline:
        </dt>
        <dd className={ddClass}>
          {tournament.early_registration_ends}
        </dd>
        <dt className={dtClass}>
          Early registration discount:
        </dt>
        <dd className={ddClass}>
          ${tournament.early_registration_discount}
        </dd>
      </div>
    )
  }

  let late_fee_date = '';
  if (tournament.late_fee_applies_at) {
    late_fee_date = (
      <div className={'row pb-2'}>
        <dt className={dtClass}>
          Late fee applies:
        </dt>
        <dd className={ddClass}>
          {tournament.late_fee_applies_at}
        </dd>
        <dt className={dtClass}>
          Late registration fee:
        </dt>
        <dd className={ddClass}>
          ${tournament.late_registration_fee}
        </dd>
      </div>
    )
  }

  const dates = (
    <div className={''}>
      <h6>
        Important details:
      </h6>
      <dl>
        <div className={'row pb-2'}>
          <dt className={dtClass}>
            Registration fee:
          </dt>
          <dd className={ddClass}>
            ${tournament.registration_fee}
          </dd>
        </div>
        {early_registration}
        {late_fee_date}
        <div className={'row pb-2'}>
          <dt className={dtClass}>
            Registration deadline:
          </dt>
          <dd className={ddClass}>
            {tournament.registration_deadline}
          </dd>
        </div>
        <div className={'row'}>
          <dt className={dtClass}>
            Start date:
          </dt>
          <dd className={ddClass}>
            {tournament.start_date}
          </dd>
        </div>
      </dl>
    </div>
  );

  //////////////////////////////////////////////////////////

  let website = '';
  if (tournament.website) {
    website = (
      <p className={classes.WebsiteLink}>
        <a href={tournament.website}>
          Tournament website
          <i className={`${classes.ExternalLink} bi-box-arrow-up-right`} aria-hidden="true"/>
        </a>
      </p>
    )
  }

  let registrationOptions = '';
  const shift = tournament.shifts[0];
  if (tournament.state === 'testing' || tournament.state === 'active' || tournament.state === 'demo') {
    registrationOptions = (
      <Col md={6}>
        <Card>
          <Card.Header as={'h6'}>
            Registration Options
          </Card.Header>
          <ListGroup variant={'flush'}>
            {(!shift || shift && shift.permit_solo) && (
              <ListGroup.Item className={'text-primary'}
                              href={`${router.asPath}/solo-bowler`}
                              action>
                Register as a Solo Bowler
              </ListGroup.Item>
            )}
            {shift && !shift.permit_solo && (
              <ListGroup.Item className={'text-muted text-decoration-line-through'}>
                Register as a Solo Bowler
              </ListGroup.Item>
            )}
            {(!shift || shift && shift.permit_joins) && (
              <ListGroup.Item className={'text-primary'}
                              href={`${router.asPath}/join-a-team`}
                              action>
                Join an Existing Team
              </ListGroup.Item>
            )}
            {shift && !shift.permit_joins && (
              <ListGroup.Item className={'text-muted text-decoration-line-through'}>
                Join an Existing Team
              </ListGroup.Item>
            )}
            {(!shift || shift && shift.permit_new_teams) && (
              <ListGroup.Item className={'text-primary'}
                              href={`${router.asPath}/new-team`}
                              action>
                Register a New Team
              </ListGroup.Item>
            )}
            {shift && !shift.permit_new_teams && (
              <ListGroup.Item className={'text-muted text-decoration-line-through'}>
                Register a New Team
              </ListGroup.Item>
            )}
          </ListGroup>
        </Card>
      </Col>
    );
  }

  const payFeeLink = (
    <a href={`${router.asPath}/teams`}
       className={''}>
      Choose Events &amp; Pay
    </a>
  );

  let testingEnvironment = '';
  if (tournament.state === 'testing') {
    testingEnvironment = (
      <div className={classes.TestingEnvironment}>
        <h3>Current test setup</h3>
        <dl>
          {Object.values(tournament.testing_environment.settings).map(setting => {
            return (
              <div key={setting.name} className="row">
                <dt className="col-4 text-end pe-1">
                  {setting.display_name}
                </dt>
                <dd className="col ps-1">
                  {setting.display_value}
                </dd>
              </div>
            );
          })}
        </dl>
      </div>
    );
  }

  let youWillNeed = <hr/>;
  if (tournament.state === 'testing' || tournament.state === 'active' || tournament.state === 'demo') {
    youWillNeed = (
      <div className={'border rounded-sm bg-light p-3'}>
        <h6>
          You will need the following information for each registered bowler:
        </h6>
        <ul className={'mb-1'}>
          <li>
            Names and contact information (email, phone, address)
          </li>
          <li>
            Birth dates (required for IGBO)
          </li>
          <li>
            {/*USBC and IGBO identifiers*/}
            USBC ID
            {' '}&ndash;{' '}
            <a href={USBC_ID_LOOKUP_URL} target="_new">
              find a USBC identifier
              <i className={`${classes.ExternalLink} bi-box-arrow-up-right`} aria-hidden="true"/>
            </a>
            {/*<ul>*/}
            {/*  <li>*/}
            {/*    <a href={USBC_ID_LOOKUP_URL} target="_new">*/}
            {/*      Find a USBC identifier*/}
            {/*      <i className={`${classes.ExternalLink} bi-box-arrow-up-right`} aria-hidden="true"/>*/}
            {/*    </a>*/}
            {/*  </li>*/}
            {/*  <li>*/}
            {/*    <a href={IGBO_ID_LOOKUP_URL} target="_new">*/}
            {/*      Find an IGBO identifier*/}
            {/*      <i className={`${classes.ExternalLink} bi-box-arrow-up-right`} aria-hidden="true"/>*/}
            {/*    </a>*/}
            {/*  </li>*/}
            {/*</ul>*/}
          </li>
        </ul>
      </div>
    );
  }

  let shiftContent = '';
  const displayCapacity = !!tournament.config_items.find(ci => ci.key === 'display_capacity' && ci.value)
  if (tournament.shifts.length > 1) {
    shiftContent = (
      <div className={`${classes.Shifts} my-3 border rounded-sm bg-light p-2 p-sm-3`}>
        <h4 className={'fw-light'}>
          Shift Days/Times
        </h4>
        {tournament.shifts.map((shift, i) => {
          const requestedCount = Math.min(shift.requested_count, shift.capacity - shift.confirmed_count);
          return (
            <div key={i} className={`${classes.ShiftInfo} border rounded-sm p-2 p-sm-3 mb-2 mb-sm-3`}>
              <div className={'row'}>
                <div className={'col-12 col-sm-4'}>
                  <h5>
                    {shift.name}
                  </h5>
                  <p>
                    Capacity: {shift.capacity} bowlers / {shift.capacity / 4} teams
                  </p>
                </div>
                <div className={'col'}>
                  <table className={'table table-sm table-bordered mb-0'}>
                    <thead>
                    <tr>
                      <th>
                        Event
                      </th>
                      <th>
                        Day
                      </th>
                      <th>
                        Time
                      </th>
                    </tr>
                    </thead>
                    <tbody>
                    {shift.events.map((event, j) => (
                      <tr key={j}>
                        <td>
                          {event.event}
                        </td>
                        <td>
                          {event.day}
                        </td>
                        <td>
                          {event.time}
                        </td>
                      </tr>
                    ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {displayCapacity && <ShiftCapacity shift={shift} key={i} />}
            </div>
          )
        })}

        {displayCapacity && <ProgressBarLegend/>}
      </div>
    );
  } else if (tournament.shifts.length === 1) {
    const shift = tournament.shifts[0];
    const requestedCount = Math.min(shift.requested_count, shift.capacity - shift.confirmed_count);
    shiftContent = displayCapacity && (
      <div className={`${classes.ShiftInfo} my-3 border rounded-sm p-2 p-sm-3`}>
        <div>
          <h5 className={'fw-light'}>
            Capacity
          </h5>
          <p>
            The tournament is limited to {shift.capacity} bowlers / {shift.capacity / 4} teams
          </p>

          <ShiftCapacity shift={shift} />
        </div>
        <ProgressBarLegend/>
      </div>
    );
  }

  return (
    <div className={classes.TournamentDetails}>
      <h2>
        {tournament.name} ({tournament.year})
      </h2>
      {website}
      {stateBanner}
      {testingEnvironment}

      {dates}

      {shiftContent}

      {youWillNeed}

      <Row className={'mt-3'}>
        {registrationOptions}
        <Col>
          <h6 className="my-2">
            Already registered?
          </h6>
          <ul>
            <li className={'my-2'}>
              {payFeeLink}
            </li>
          </ul>

          <h6 className="mt-4">
            Not an IGBO member yet?
          </h6>
          <ul>
            <li>
              <a href='https://reg.sportlomo.com/club/igbo/igboassociates'
                 target='_new'>
                Apply for Associate Membership
                <i className={classes.ExternalLink + " bi-box-arrow-up-right"} aria-hidden="true"/>
              </a>
            </li>
          </ul>

        </Col>
      </Row>
    </div>
  );
}

export default TournamentDetails;