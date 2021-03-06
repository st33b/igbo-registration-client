import {useState} from "react";
import {useRouter} from "next/router";

import {useDirectorContext} from "../../../store/DirectorContext";
import {directorApiRequest} from "../../../utils";
import ErrorBoundary from "../../common/ErrorBoundary";

import classes from './EventForm.module.scss';

const EventForm = ({onCancel, onComplete}) => {
  const context = useDirectorContext();
  const router = useRouter();

  const initialState = {
    category: 'bowling',
    determination: 'event',
    name: '',
    value: '',
    order: '',

    valid: false,
  }

  const [formData, setFormData] = useState(initialState);

  const inputChanged = (event) => {
    let newValue = '';
    newValue = event.target.value;
    const inputName = event.target.name;
    if (inputName === 'value' || inputName === 'order') {
      if (newValue.length > 0) {
        newValue = parseInt(newValue);
      }
    }
    const newFormData = {...formData};
    newFormData[inputName] = newValue;

    newFormData.valid = newFormData.name.length > 0 && newFormData.value > 0 && newFormData.order > 0;

    setFormData(newFormData);
  }

  const submissionSuccess = (data) => {
    setFormData({...initialState});
    const tournament = {...context.tournament}
    tournament.purchasable_items = tournament.purchasable_items.concat(data);
    context.setTournament(tournament);
    onComplete(`Item ${data[0].name} created.`);
  }

  const formSubmitted = (event) => {
    event.preventDefault();
    const uri = `/director/tournaments/${context.tournament.identifier}/purchasable_items`;
    const requestConfig = {
      method: 'post',
      data: {
        purchasable_items: [
          {
            category: formData.category,
            determination: formData.determination,
            name: formData.name,
            value: formData.value,
            configuration: {
              order: formData.order,
            },
          },
        ],
      },
    };
    directorApiRequest({
      uri: uri,
      requestConfig: requestConfig,
      context: context,
      router: router,
      onSuccess: submissionSuccess,
      onFailure: (_) => {
        console.log("Failed to save new item.")
      },
    });
  }

  return (
    <ErrorBoundary>
      <div className={classes.EventForm}>
        <form onSubmit={formSubmitted} className={`mx-4 py-2`}>
          <div className={`${classes.HeaderRow} row mb-2`}>
            <h6>
              New Event Item
            </h6>
          </div>
          <div className={'row mb-3'}>
            <label htmlFor={'name'} className={'form-label ps-0 mb-1'}>
              Name
            </label>
            <input type={'text'}
                   className={`form-control`}
                   name={'name'}
                   id={'name'}
                   required={true}
                   onChange={(event) => inputChanged(event)}
                   value={formData.name}
            />
          </div>
          <div className={'row mb-3'}>
            <div className={'col-6 ps-0'}>
              <label htmlFor={'value'} className={'form-label ps-0 mb-1'}>
                Price
              </label>
              <input type={'number'}
                     className={`form-control`}
                     name={'value'}
                     id={'value'}
                     required={true}
                     onChange={(event) => inputChanged(event)}
                     value={formData.value}
              />
            </div>
            <div className={'col-6 pe-0'}>
              <label htmlFor={'order'} className={'form-label ps-0 mb-1'}>
                Display order
              </label>
              <input type={'number'}
                     className={`form-control`}
                     name={'order'}
                     id={'order'}
                     required={true}
                     onChange={(event) => inputChanged(event)}
                     value={formData.order}
              />
            </div>
          </div>
          <div className={'row'}>
            <div className={'d-flex justify-content-between p-0'}>
              <button type={'button'}
                      title={'Cancel'}
                      onClick={onCancel}
                      className={'btn btn-outline-danger'}>
                <i className={'bi-x-lg pe-2'} aria-hidden={true}/>
                Cancel
              </button>
              <button type={'submit'}
                      title={'Save'}
                      disabled={!formData.valid}
                      className={'btn btn-success'}>
                Save
                <i className={'bi-chevron-right ps-2'} aria-hidden={true}/>
              </button>
            </div>
          </div>
        </form>
      </div>
    </ErrorBoundary>
  );
}

export default EventForm;