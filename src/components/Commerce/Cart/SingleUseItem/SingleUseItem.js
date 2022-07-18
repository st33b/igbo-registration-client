import {useRegistrationContext} from "../../../../store/RegistrationContext";

import classes from './SingleUseItem.module.scss';

const SingleUseItem = ({item, removed}) => {
  const {commerce} = useRegistrationContext();

  const removeClickedHandler = (event) => {
    event.preventDefault();
    removed(item);
  }

  if (!commerce) {
    return '';
  }

  let removeLink = '';
  if (item.category !== 'ledger') {
    removeLink = (
      <div className={'ms-auto align-self-center'}>
        <a href={'#'}
           onClick={removeClickedHandler}
           className={`${classes.RemoveLink} pe-3 text-danger`}>
          <i className={'bi-x-circle-fill'} />
          <span className={'visually-hidden'}>Remove</span>
        </a>
      </div>
    );
  }

  let note = '';
  if (item.configuration.division) {
    note = (
      <p className={classes.Note}>
        Division: {item.configuration.division}
      </p>
    );
  }

  const outerClasses = [
    classes.SingleUseItem,
    'rounded',
    'border',
    'border-secondary',
    'mb-3',
    'mx-0',
    'd-flex',
  ];

  if (item.category === 'ledger') {
    outerClasses.push(classes.Sticky);
    if (item.configuration.event) {
      note = (
        <p className={classes.Note}>
          Event: {commerce.availableItems[item.configuration.event].name}
        </p>
      );
    }
    if (item.configuration.events) {
      const matchingEvents = item.configuration.events.map(identifier => commerce.availableItems[identifier]);
      note = (
        <p className={classes.Note}>
          Events: {matchingEvents.map(event => commerce.availableItems[event.identifier].name).join(', ')}
        </p>
      );
    }
  }

  return (
    <div className={outerClasses.join(' ')}>
      <div className={'ps-2'}>
        <p>
          {item.name}
        </p>
        {note}
        <p>
          ${item.value}
        </p>
      </div>
      {removeLink}
    </div>
  );
}

export default SingleUseItem;