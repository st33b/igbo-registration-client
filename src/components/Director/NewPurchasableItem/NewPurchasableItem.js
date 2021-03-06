import {useState, useEffect} from "react";

import ErrorBoundary from "../../common/ErrorBoundary";
import LedgerForm from "./LedgerForm";
import DivisionForm from './DivisionForm';
import SingleUseForm from "./SingleUseForm";
import MultiUseForm from "./MultiUseForm";
import {useDirectorContext} from "../../../store/DirectorContext";

import classes from './NewPurchasableItem.module.scss';
import EventForm from "./EventForm";

const NewPurchasableItem = () => {
  const context = useDirectorContext();

  const [formDisplayed, setFormDisplayed] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [availableLedgerTypes, setAvailableLedgerTypes] = useState([]);
  const [eventSelection, setEventSelection] = useState(false);

  // Determine which types of ledger items can still be created
  useEffect(() => {
    if (!context) {
      return;
    }
    const eventSelectionEnabled = context.tournament.config_items.some(item => item.key === 'event_selection' && item.value);

    const allLedgerTypes = ['entry_fee', 'late_fee', 'early_discount'];
    const usedTypes = context.tournament.purchasable_items.filter(item => item.category === 'ledger').map(item => item.determination);
    const typesAvailable = [];
    allLedgerTypes.forEach(type => {
      if (eventSelectionEnabled || !usedTypes.includes(type)) {
        typesAvailable.push(type);
      }
    });

    if (eventSelectionEnabled) {
      typesAvailable.push('bundle_discount');
    }
    setEventSelection(eventSelectionEnabled);

    setAvailableLedgerTypes(typesAvailable);
  }, [context])

  const allowCreate = context.tournament.state !== 'active';

  const addClicked = (event, formType) => {
    event.preventDefault();
    // Just in case
    if (formType === 'ledger' && availableLedgerTypes.length === 0) {
      return;
    }
    setFormDisplayed(formType);
  }

  const cancelClicked = () => {
    setFormDisplayed(null);
  }

  const itemSaved = (message) => {
    setSuccessMessage(message);
    setFormDisplayed(null);
  }

  const outerClass = formDisplayed ? classes.FormDisplayed : '';
  return (
    <ErrorBoundary>
      <div className={`${classes.NewPurchasableItem} ${outerClass}`}>
        {successMessage && (
          <div className={'alert alert-success alert-dismissible fade show d-flex align-items-center m-3'}
               role={'alert'}>
            <i className={'bi-check2-circle pe-2'} aria-hidden={true}/>
            <div className={'me-auto'}>
              {successMessage}
              <button type="button"
                      className={"btn-close"}
                      data-bs-dismiss="alert"
                      onClick={() => setSuccessMessage(null)}
                      aria-label="Close"/>
            </div>
          </div>
        )}

        {!formDisplayed && allowCreate &&
          <>
            <div className={'text-center my-3'}>
              <button type={'button'}
                      className={`btn ${availableLedgerTypes.length === 0 ? 'btn-outline-secondary' : 'btn-outline-primary'}`}
                      role={'button'}
                      disabled={availableLedgerTypes.length === 0}
                      onClick={(event) => addClicked(event, 'ledger')}>
                <i className={'bi-plus-lg pe-2'} aria-hidden={true}/>
                New Ledger Item
              </button>
            </div>
            {eventSelection && (<div className={'text-center my-3'}>
              <button type={'button'}
                      className={'btn btn-outline-primary'}
                      role={'button'}
                      onClick={(event) => addClicked(event, 'event')}>
                <i className={'bi-plus-lg pe-2'} aria-hidden={true}/>
                New Event
              </button>
            </div>)}
            <div className={'text-center my-3'}>
              <button type={'button'}
                      className={'btn btn-outline-primary'}
                      role={'button'}
                      onClick={(event) => addClicked(event, 'division')}>
                <i className={'bi-plus-lg pe-2'} aria-hidden={true}/>
                New Division Item
              </button>
            </div>
            <div className={'text-center my-3'}>
              <button type={'button'}
                      className={'btn btn-outline-primary'}
                      role={'button'}
                      onClick={(event) => addClicked(event, 'single_use')}>
                <i className={'bi-plus-lg pe-2'} aria-hidden={true}/>
                New Single-use Item
              </button>
            </div>
            <div className={'text-center my-3'}>
              <button type={'button'}
                      className={'btn btn-outline-primary'}
                      role={'button'}
                      onClick={(event) => addClicked(event, 'multi_use')}>
                <i className={'bi-plus-lg pe-2'} aria-hidden={true}/>
                New Multi-use Item
              </button>
            </div>
          </>
        }

        {formDisplayed === 'ledger' && <LedgerForm availableTypes={availableLedgerTypes} onCancel={cancelClicked} onComplete={itemSaved} />}
        {formDisplayed === 'event' && <EventForm onCancel={cancelClicked} onComplete={itemSaved} /> }
        {formDisplayed === 'division' && <DivisionForm onCancel={cancelClicked} onComplete={itemSaved} />}
        {formDisplayed === 'single_use' && <SingleUseForm onCancel={cancelClicked} onComplete={itemSaved} />}
        {formDisplayed === 'multi_use' && <MultiUseForm onCancel={cancelClicked} onComplete={itemSaved} />}

      </div>
    </ErrorBoundary>
  )
}

export default NewPurchasableItem;