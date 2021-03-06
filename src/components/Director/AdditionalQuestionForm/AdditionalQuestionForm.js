import {useState} from "react";
import {useRouter} from "next/router";
import {Card} from "react-bootstrap";

import {useDirectorContext} from "../../../store/DirectorContext";
import {directorApiRequest} from "../../../utils";

import classes from './AdditionalQuestionForm.module.scss';

const AdditionalQuestionForm = () => {
  const context = useDirectorContext();
  const router = useRouter();

  const initialFormData = {
    extended_form_field_id: '',
    required: false,
    valid: false,
  }
  const [formData, setFormData] = useState(initialFormData);
  const [formDisplayed, setFormDisplayed] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  if (!context || !context.tournament) {
    return '';
  }

  const availableQuestions = context.tournament.available_questions;
  const roomForMore = availableQuestions.length > 0;
  const tooLate = context.tournament.state === 'active' || context.tournament.state === 'closed';

  const addClicked = (event) => {
    event.preventDefault();
    setFormDisplayed(true);
  }

  const inputChanged = (event) => {
    const inputName = event.target.name;
    const newValue = inputName === 'required' ? event.target.checked : event.target.value;
    const newFormData = { ...formData }
    newFormData[inputName] = newValue;

    newFormData.valid = !!newFormData.extended_form_field_id;

    setFormData(newFormData);
  }

  const submissionSuccess = (data) => {
    setSuccessMessage(
      <div className={'alert alert-success alert-dismissible fade show d-flex align-items-center mt-3 mb-0'} role={'alert'}>
        <i className={'bi-check2-circle pe-2'} aria-hidden={true} />
        <div className={'me-auto'}>
          Question saved.
          <button type="button"
                  className={"btn-close"}
                  data-bs-dismiss="alert"
                  onClick={() => setSuccessMessage(null)}
                  aria-label="Close" />
        </div>
      </div>
    );
    context.setTournament(data);
  }

  const submissionFailure = (data) => {
    setErrorMessage(
      <div className={'alert alert-danger alert-dismissible fade show d-flex align-items-center mt-3 mb-0'} role={'alert'}>
        <i className={'bi-check2-circle pe-2'} aria-hidden={true} />
        <div className={'me-auto'}>
          Failed to save the question: {data.error}
          <button type="button"
                  className={"btn-close"}
                  data-bs-dismiss="alert"
                  onClick={() => setErrorMessage(null)}
                  aria-label="Close" />
        </div>
      </div>
    );
  }

  const formSubmitted = (event) => {
    event.preventDefault();

    if (!formData.valid) {
      return;
    }

    // send over the new question
    const uri = `/director/tournaments/${context.tournament.identifier}`;
    const requestConfig = {
      method: 'patch',
      data: {
        tournament: {
          additional_questions_attributes: [
            {
              extended_form_field_id: formData.extended_form_field_id,
              validation_rules: {
                required: formData.required,
              },
              order: context.tournament.additional_questions.length + 1,
            },
          ],
        },
      },
    };
    directorApiRequest({
      uri: uri,
      requestConfig: requestConfig,
      context: context,
      router: router,
      onSuccess: submissionSuccess,
      onFailure: submissionFailure,
    });

    setFormDisplayed(false);
  }

  return (
    <div className={classes.AdditionalQuestionForm}>
      <Card.Body>
        {formDisplayed &&
          <form onSubmit={formSubmitted}>
            <select className={'form-select'}
                    onChange={inputChanged}
                    name={'extended_form_field_id'}>
              <option value={''}>
                -- Choose a question
              </option>
              {availableQuestions.map(q => <option key={q.id} value={q.id}>{q.label}</option>)}
            </select>
            <div className={'form-check form-switch my-3'}>
              <input className={'form-check-input'}
                     type={'checkbox'}
                     role={'switch'}
                     name={'required'}
                     onChange={inputChanged}
                     id={'response_required'}/>
              <label className={'form-check-label'}
                     htmlFor={'response_required'}>
                A response is required
              </label>
            </div>
            <div className={'text-center'}>
              <button type={'submit'}
                      className={'btn btn-primary'}
                      disabled={!formData.valid}>
                Save
              </button>
            </div>
            {errorMessage}
          </form>
        }
        {!formDisplayed && roomForMore &&
          <div className={'text-center'}>
            <button type={'button'}
                    className={'btn btn-outline-primary'}
                    role={'button'}
                    onClick={addClicked}>
              <i className={'bi-plus-lg'} aria-hidden={true}/>{' '}
              Add
            </button>
          </div>
        }
        {!roomForMore && !tooLate &&
          <div className={'text-center'}>
            <button type={'button'}
                    className={'btn btn-outline-secondary'}
                    disabled
                    role={'button'}>
              <i className={'bi-slash-circle'} aria-hidden={true}/>{' '}
              No more questions available
            </button>
          </div>
        }
        {tooLate &&
          <div className={'text-center'}
               title={'Cannot add questions once registration is open'}>
            <button type={'button'}
                    className={'btn btn-outline-secondary'}
                    disabled
                    role={'button'}>
              <i className={'bi-plus-lg'} aria-hidden={true}/>{' '}
              Add
            </button>
          </div>
        }
        {successMessage}
      </Card.Body>
    </div>
  );
}

export default AdditionalQuestionForm;