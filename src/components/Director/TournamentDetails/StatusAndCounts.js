import {useEffect, useState} from "react";
import {useRouter} from "next/router";
import Card from 'react-bootstrap/Card';
import ListGroup from "react-bootstrap/ListGroup";
import Badge from "react-bootstrap/Badge";
import Button from "react-bootstrap/Button";

import {directorApiDownloadRequest, directorApiRequest} from "../../../utils";
import {useDirectorContext} from "../../../store/DirectorContext";

import classes from './TournamentDetails.module.scss';

const StatusAndCounts = ({testEnvironmentUpdated}) => {
  const context = useDirectorContext();
  const router = useRouter();

  const testEnvFormInitialData = {
    registration_period: 'regular',
  }

  const [downloadMessage, setDownloadMessage] = useState(null);
  const [clearTestDataSuccessMessage, setClearTestDataSuccessMessage] = useState();
  const [loading, setLoading] = useState(false);
  const [testEnvFormData, setTestEnvFormData] = useState(testEnvFormInitialData);
  const [testEnvSuccessMessage, setTestEnvSuccessMessage] = useState(null);
  const [paymentReminderMessage, setPaymentReminderMessage] = useState(null);

  // Update the state of testEnvFormData with what's in context
  useEffect(() => {
    if (!context) {
      return;
    }

    if (context.tournament.state === 'testing' || context.tournament.state === 'demo') {
      const formData = {...testEnvFormData};

      Object.keys(context.tournament.available_conditions).forEach(name => {
        formData[name] = context.tournament.testing_environment.settings[name].value;
      });

      setTestEnvFormData(formData);
    }
  }, [context]);

  if (!context || !context.tournament) {
    return '';
  }

  const downloadSuccess = (data, name) => {
    const url = URL.createObjectURL(data);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', name);
    document.body.append(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setDownloadMessage(
      <div className={'alert alert-success alert-dismissible fade show d-flex align-items-center mt-3 mb-0'} role={'alert'}>
        <i className={'bi-check2-circle pe-2'} aria-hidden={true} />
        <div className={'me-auto'}>
          Download completed.
          <button type="button"
                  className={"btn-close"}
                  data-bs-dismiss="alert"
                  onClick={() => setDownloadMessage(null)}
                  aria-label="Close" />
        </div>
      </div>
    );
  }
  const downloadFailure = (data) => {
    setDownloadMessage(
      <div className={'alert alert-danger alert-dismissible fade show d-flex align-items-center mt-3 mb-0'} role={'alert'}>
        <i className={'bi-check2-circle pe-2'} aria-hidden={true} />
        <div className={'me-auto'}>
          Download failed. {data.error}
          <button type="button"
                  className={"btn-close"}
                  data-bs-dismiss="alert"
                  onClick={() => setDownloadMessage(null)}
                  aria-label="Close" />
        </div>
      </div>
    );
  }
  const downloadClicked = (event, uri, saveAsName) => {
    event.preventDefault();
    directorApiDownloadRequest({
      uri: uri,
      context: context,
      router: router,
      onSuccess: (data) => downloadSuccess(data, saveAsName),
      onFailure: (data) => downloadFailure(data),
    });
  }

  const counts = (
    <ListGroup variant={'flush'}>
      <ListGroup.Item className={'d-flex'}
                      action
                      href={`/director/bowlers`}>
        Bowlers
        <Badge bg={'light'} text={'dark'} className={'ms-auto'}>
          {context.tournament.bowler_count}
        </Badge>
      </ListGroup.Item>
      <ListGroup.Item className={'d-flex'}
                      action
                      href={`/director/teams`}>
        Teams
        <Badge bg={'light'} text={'dark'} className={'ms-auto'}>
          {context.tournament.team_count}
        </Badge>
      </ListGroup.Item>
      <ListGroup.Item className={'d-flex'}
                      action
                      href={`/director/free_entries`}>
        Free Entries
        <Badge bg={'light'} text={'dark'} className={'ms-auto'}>
          {context.tournament.free_entry_count}
        </Badge>
      </ListGroup.Item>
    </ListGroup>
  );

  const downloads = (
    <Card.Body>
      <Card.Subtitle className={'mb-3'}>
        Downloads
      </Card.Subtitle>
      <Card.Link className={'btn btn-sm btn-outline-primary'}
                 href={'#'}
                 onClick ={(event) => downloadClicked(event, `/director/tournaments/${context.tournament.identifier}/csv_download`, 'bowlers.csv')}
      >
        CSV
      </Card.Link>
      <Card.Link className={'btn btn-sm btn-outline-primary'}
                 href={'#'}
                 onClick ={(event) => downloadClicked(event, `/director/tournaments/${context.tournament.identifier}/igbots_download`, 'bowlers.xml')}
      >
        IGBO-TS
      </Card.Link>
      {downloadMessage}
    </Card.Body>
  );

  const paymentRemindersKickedOff = (data) => {
    setPaymentReminderMessage(
      <div className={'alert alert-success alert-dismissible fade show d-flex align-items-center mt-3 mb-0'} role={'alert'}>
        <i className={'bi-check2-circle pe-2'} aria-hidden={true} />
        <div className={'me-auto'}>
          Sending payment reminders to bowlers with outstanding balances.
          <button type="button"
                  className={"btn-close"}
                  data-bs-dismiss="alert"
                  onClick={() => setPaymentReminderMessage(null)}
                  aria-label="Close" />
        </div>
      </div>
    );
  }

  const paymentRemindersFailed = (data) => {
    setPaymentReminderMessage(
      <div className={'alert alert-warning alert-dismissible fade show d-flex align-items-center mt-3 mb-0'} role={'alert'}>
        <i className={'bi-exclamation-triangle pe-2'} aria-hidden={true} />
        <div className={'me-auto'}>
          Failed to send payment reminders to bowlers with outstanding balances. Please let Scott know.
          <button type="button"
                  className={"btn-close"}
                  data-bs-dismiss="alert"
                  onClick={() => setPaymentReminderMessage(null)}
                  aria-label="Close" />
        </div>
      </div>
    );
  }

  const paymentReminderClickHandler = (event) => {
    event.preventDefault();
    if (!['active', 'closed'].includes(context.tournament.state)) {
      console.log('Cannot send payment reminders for a tournament in setup or test mode.');
      return;
    }

    if (!confirm('This will send potentially many emails. Are you sure?')) {
      return;
    }

    const uri = `/director/tournaments/${context.tournament.identifier}/email_payment_reminders`;
    const requestConfig = {
      data: {},
      method: 'post',
    }
    directorApiRequest({
      uri: uri,
      requestConfig: requestConfig,
      context: context,
      router: router,
      onSuccess: paymentRemindersKickedOff,
      onFailure: paymentRemindersFailed,
    });
  }

  const actions = ['active', 'closed'].includes(context.tournament.state) && (
    <Card.Body>
      <Card.Subtitle className={'mb-3'}>
        Actions
      </Card.Subtitle>
      <Card.Link className={'btn btn-sm btn-outline-dark'}
                 href={'#'}
                 onClick={paymentReminderClickHandler}>
        Send Payment Reminder Email
      </Card.Link>
      {paymentReminderMessage}
    </Card.Body>
  )

  const onClearTestDataSuccess = (_) => {
    setLoading(false);
    const updatedTournament = {...context.tournament}
    updatedTournament.bowler_count = 0;
    updatedTournament.team_count = 0;
    updatedTournament.free_entry_count = 0;
    context.setTournament(updatedTournament);
    setClearTestDataSuccessMessage('Test data cleared!');
  }

  const onClearTestDataFailure = (data) => {
    setLoading(false);
  }

  const clearDataSuccessAlertClosed = () => {
    setClearTestDataSuccessMessage(null);
  }

  const clearTestDataClickHandler = () => {
    if (context.tournament.state !== 'testing') {
      console.log('Cannot clear data for a tournament that is not in setup or testing.');
      return;
    }

    const uri = `/director/tournaments/${context.tournament.identifier}/clear_test_data`;
    const requestConfig = {
      data: {},
      method: 'post',
    }
    setLoading(true);
    directorApiRequest({
      uri: uri,
      requestConfig: requestConfig,
      context: context,
      router: router,
      onSuccess: onClearTestDataSuccess,
      onFailure: onClearTestDataFailure,
    });
  }

  const testSettingOptionClicked = (event) => {
    const settingName = event.target.name;
    const newValue = event.target.value;
    const newForm = {...testEnvFormData};
    newForm[settingName] = newValue;
    setTestEnvFormData(newForm);
  }

  const testEnvSaveSuccess = () => {
    setTestEnvSuccessMessage('Testing environment updated.');
  }

  const testEnvSaved = (event) => {
    event.preventDefault();
    testEnvironmentUpdated(testEnvFormData, testEnvSaveSuccess);
  }

  const testEnvAlertClosed = () => {
    setTestEnvSuccessMessage(null);
  }

  let clearTestData = '';
  let testingStatusContent = '';
  let bgColor = '';
  let textColor = 'white';
  switch (context.tournament.state) {
    case 'setup':
      bgColor = 'info';
      textColor = 'dark';
      break;
    case 'testing':
    case 'demo':
      bgColor = context.tournament.state === 'demo' ? 'primary' : 'warning';
      let success = '';
      if (clearTestDataSuccessMessage) {
        success = (
          <div className={'alert alert-success alert-dismissible fade show d-flex align-items-center mt-3 mb-0'} role={'alert'}>
            <i className={'bi-check2-circle pe-2'} aria-hidden={true} />
            <div className={'me-auto'}>
              {clearTestDataSuccessMessage}
              <button type="button"
                      className={"btn-close"}
                      data-bs-dismiss="alert"
                      onClick={clearDataSuccessAlertClosed}
                      aria-label="Close" />
            </div>
          </div>
        );
      }
      clearTestData = (
        <Card.Body>
          <Card.Text>
            {!loading && (
              <Button variant={'warning'} onClick={clearTestDataClickHandler}>
                Clear Registration Data
              </Button>
            )}
            {loading && (
              <Button variant={'secondary'} disabled>
                Clearing...
              </Button>
            )}
          </Card.Text>
          {success}
        </Card.Body>
      )
      success = '';
      if (testEnvSuccessMessage) {
        success = (
          <div className={'alert alert-success alert-dismissible fade show d-flex align-items-center mt-3 mb-0'} role={'alert'}>
            <i className={'bi-check2-circle pe-2'} aria-hidden={true} />
            <div className={'me-auto'}>
              {testEnvSuccessMessage}
              <button type="button"
                      className={"btn-close"}
                      data-bs-dismiss="alert"
                      onClick={testEnvAlertClosed}
                      aria-label="Close" />
            </div>
          </div>
        );
      }
      testingStatusContent = (
        <Card.Body className={'border-bottom border-top'}>
          <Card.Title as={'h6'} className={'fw-light mb-3'}>
            Environment Setup
          </Card.Title>

          <form onSubmit={testEnvSaved}>
            {Object.values(context.tournament.testing_environment.settings).map(setting => (
              <div className={'row text-start d-flex align-items-center py-3'} key={setting.name}>
                <label className={'col-6 text-end fst-italic'}>
                  {setting.display_name}
                </label>
                <div className={'col'}>
                  {context.tournament.available_conditions[setting.name].options.map(option => (
                    <div className={'form-check'} key={option.value}>
                      <input type={'radio'}
                             name={setting.name}
                             id={`${setting.name}-${setting.value}`}
                             className={'form-check-input'}
                             value={option.value}
                             checked={testEnvFormData[setting.name] === option.value}
                             onChange={(event) => testSettingOptionClicked(event)}
                      />
                      <label className={'form-check-label'}
                             htmlFor={`${setting.name}-${setting.value}`}>
                        {option.display_value}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            <div className={'row mt-3'}>
              <div className={'col-12'}>
                <button type={'submit'} className={'btn btn-primary'}>
                  Save
                </button>
                {success}
              </div>
            </div>
          </form>
        </Card.Body>
      )
      break;
    case 'active':
      bgColor = 'success';
      break;
    case 'closed':
      bgColor = 'secondary';
      break;
    default:
      bgColor = 'dark';
  }

  const frontPageLink = (
    <Card.Body>
      <a href={`/tournaments/${context.tournament.identifier}`} target={'_new'}>
        Front Page
        <i className={classes.ExternalLink + " bi-box-arrow-up-right"} aria-hidden="true"/>
      </a>
    </Card.Body>
  );

  return (
    <Card className={classes.Card + ' text-center'}>
      <Card.Header as={'h5'} className={`bg-${bgColor} text-${textColor}`}>
        {context.tournament.status}
      </Card.Header>
      {counts}
      {frontPageLink}
      {downloads}
      {actions}
      {testingStatusContent}
      {clearTestData}
    </Card>
  );
}

export default StatusAndCounts;