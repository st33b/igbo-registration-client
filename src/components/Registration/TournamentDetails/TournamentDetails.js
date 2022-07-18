import {useRouter} from "next/router";
import {Card, Col, ListGroup, ProgressBar, Row} from "react-bootstrap";
import LoadingMessage from "../../ui/LoadingMessage/LoadingMessage";

import classes from './TournamentDetails.module.scss';
import ProgressBarLegend from "./ProgressBarLegend";

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
        {!!tournament.registration_fee && (
          <div className={'row pb-2'}>
            <dt className={dtClass}>
              Registration fee:
            </dt>
            <dd className={ddClass}>
              ${tournament.registration_fee}
            </dd>
          </div>
        )}
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

  let registrationSection = '';
  if (tournament.state === 'testing' || tournament.state === 'active' || tournament.state === 'demo') {
    const shift = tournament.shifts[0];
    const optionTypes = [
      {
        name: 'solo',
        path: 'solo-bowler',
        linkText: 'Register as a Solo Bowler',
      },
      {
        name: 'join_team',
        path: 'join-a-team',
        linkText: 'Join an Existing Team',
      },
      {
        name: 'new_team',
        path: 'new-team',
        linkText: 'Register a New Team',
      },
      {
        name: 'partner',
        path: 'partner-up',
        linkText: 'Partner Up With Someone',
      },
      {
        name: 'new_pair',
        path: 'new-pair',
        linkText: 'Register a Pair of Bowlers',
      },
    ]
    const eventSelectionEnabled = tournament.config_items.some(item => item.key === 'event_selection' && item.value);
    let registrationOptions = '';
    if (eventSelectionEnabled) {
      // only show what's enabled
      registrationOptions = optionTypes.map(({name, path, linkText}) => {
        if (!shift.registration_types[name]) {
          return '';
        }
        return (
          <ListGroup.Item key={name}
                          className={'text-primary'}
                          href={`${router.asPath}/${path}`}
                          action>
            {linkText}
          </ListGroup.Item>
        );
      });
    } else {
      // show the standard ways, striking them out if disabled
      registrationOptions = optionTypes.map(({name, path, linkText}) => {
        // partnering and a new pair aren't part of a standard tournament
        if (name === 'partner' || name === 'new_pair') {
          return '';
        }
        const className = shift.registration_types[name] ? 'link-primary' : 'text-decoration-line-through';
        const enableLink = shift.registration_types[name];
        return (
          <ListGroup.Item key={name}
                          className={className}
                          href={enableLink ? `${router.asPath}/${path}` : undefined}
                          disabled={!enableLink}
                          action={enableLink}>
            {linkText}
          </ListGroup.Item>
        );
      });
    }
    registrationSection = (
      <Col md={6}>
        <Card>
          <Card.Header as={'h6'}>
            Registration Options
          </Card.Header>
          <ListGroup variant={'flush'}>
            {registrationOptions}
          </ListGroup>
        </Card>
      </Col>
    );
  }

  const payFeeLink = (
    <a href={`${router.asPath}/bowlers`}
       className={''}>
      Choose Events &amp; Pay
    </a>
  );

  let testingEnvironment = '';
  if (tournament.state === 'testing' || tournament.state === 'demo') {
    testingEnvironment = (
      <div className={classes.TestingEnvironment}>
        <h3>Current environment setup</h3>
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
      <div className={'border rounded-sm p-3'}>
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

  const percent = (num, outOf) => {
    return Math.round(num / outOf * 100);
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

              {displayCapacity && (
                <div className={`${classes.ProgressBar} d-flex align-items-center my-2`} key={i}>
                  <div className={'flex-grow-1'}>
                    <div className={`d-flex justify-content-between`}>
                      <div className={classes.EndLabel}>0%</div>
                      <div className={classes.EndLabel}>100%</div>
                    </div>
                    <div>
                      <ProgressBar style={{height: '2rem'}}>
                        <ProgressBar now={percent(shift.confirmed_count, shift.capacity)}
                                     label={`${percent(shift.confirmed_count, shift.capacity)}%`}
                                     variant={'success'}/>
                        <ProgressBar now={percent(requestedCount, shift.capacity)}
                                     label={`${percent(requestedCount, shift.capacity)}%`}
                                     variant={'primary'}/>
                      </ProgressBar>
                    </div>
                  </div>
                </div>
              )}
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
            The tournament can accommodate up to {shift.capacity} bowlers.
          </p>

          <div className={`${classes.ProgressBar} d-flex align-items-center my-2`}>
            <div className={'flex-grow-1'}>
              <div className={`d-flex justify-content-between`}>
                <div className={classes.EndLabel}>0%</div>
                <div className={classes.EndLabel}>100%</div>
              </div>
              <div>
                <ProgressBar style={{height: '2rem'}}>
                  <ProgressBar now={percent(shift.confirmed_count, shift.capacity)}
                               label={`${percent(shift.confirmed_count, shift.capacity)}%`}
                               variant={'success'}/>
                  <ProgressBar now={percent(requestedCount, shift.capacity)}
                               label={`${percent(requestedCount, shift.capacity)}%`}
                               variant={'primary'}/>
                </ProgressBar>
              </div>
            </div>
          </div>
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
        {registrationSection}
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