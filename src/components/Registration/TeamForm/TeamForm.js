import {useEffect, useState} from "react";
import {Form, Row, Col, Button} from "react-bootstrap";
import {Map} from "immutable";

import classes from './TeamForm.module.scss';
import {useRegistrationContext} from "../../../store/RegistrationContext";
import ErrorBoundary from "../../common/ErrorBoundary";

const TeamForm = ({teamFormCompleted}) => {
  const {entry} = useRegistrationContext();

  const initialFormState = {
    teamName: '',
    shift: '',
    valid: false,
  }
  const [teamForm, setTeamForm] = useState(Map(initialFormState));

  useEffect(() => {
    if (!entry || !entry.tournament) {
      return;
    }
    if (entry.tournament.available_shifts.length === 1) {
      const newTeamForm = teamForm.set('shift', entry.tournament.available_shifts[0].identifier);
      setTeamForm(newTeamForm);
    }
  }, [entry]);

  if (!entry || !entry.tournament) {
    return '';
  }

  const formHandler = (event) => {
    event.preventDefault();

    if (!teamForm.get('valid')) {
      return;
    }

    teamFormCompleted(teamForm.get('teamName'), teamForm.get('shift'));
  }

  const isValid = (formData) => {
    return formData.get('teamName').trim().length > 0;
  }

  const inputChangedHandler = (event) => {
    const inputName = event.target.name;
    const newValue = event.target.value;

    const changedForm = teamForm.set(inputName, newValue);
    setTeamForm(changedForm.set('valid', isValid(changedForm)));
  }

  let shiftSelection = '';
  if (entry.tournament.available_shifts.length > 1) {
    shiftSelection = (
      <Form.Group as={Row}
                  className={'mb-3'}
                  controlId={'shift'}>
        <Form.Label column={true}
                    className={classes.Label}
                    md={4}>
          Requested Shift
        </Form.Label>
        <Col md={4}>
          <Form.Select name={'shift'}
                       required
                       onChange={inputChangedHandler}
                       value={teamForm.get('shift')}
          >
            <option>-- Choose a shift</option>
            {entry.tournament.available_shifts.map(shift => (
              <option key={shift.identifier} value={shift.identifier}>{shift.name}</option>
            ))}
          </Form.Select>
        </Col>
      </Form.Group>
    )
  } else if (entry.tournament.shifts.length > 1) {
    const shiftName = entry.tournament.available_shifts[0].name;
    shiftSelection = (
      <Form.Group as={Row}
                  className={'mb-3'}
                  controlId={'shift'}>
        <Form.Label column={true}
                    className={classes.Label}
                    md={4}>
          Requested Shift
        </Form.Label>
        <Col>
          <span className={`${classes.OneShift} align-middle`}>
            The only remaining available shift is <strong>{shiftName}</strong>.
          </span>
        </Col>
      </Form.Group>
    )
  }

  return (
    <ErrorBoundary>
      <div className={classes.TeamForm}>
        <Form onSubmit={formHandler} noValidate>
          <Form.Group as={Row}
                      className={'mb-3'}
                      controlId={'teamName'}>
            <Form.Label column={'lg'}
                        className={classes.Label}
                        md={4}>
              Team Name
            </Form.Label>
            <Col md={8}>
              <Form.Control type={'text'}
                            placeholder={'Name your team!'}
                            maxLength={100}
                            size={'lg'}
                            name={'teamName'}
                            required
                            onChange={inputChangedHandler}
                            value={teamForm.get('teamName')}/>
              <Form.Control.Feedback type={'invalid'}>
                Every team needs a good name!
              </Form.Control.Feedback>
            </Col>
          </Form.Group>
          {shiftSelection}
          <Row>
            <Col className={classes.Submit}>
              <Button type={'submit'}
                      variant={'success'}
                      size={'lg'}
                      disabled={!teamForm.get('valid')}>
                Next: Bowler Details
                <i className={'bi-chevron-right'} aria-hidden={true}/>
              </Button>
            </Col>
          </Row>
        </Form>
      </div>
    </ErrorBoundary>
  )
};

export default TeamForm;