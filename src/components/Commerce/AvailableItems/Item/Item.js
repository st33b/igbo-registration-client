

import classes from "./Item.module.scss";

const item = ({item, added, preview}) => {
  const addClickedHandler = (event) => {
    event.preventDefault();
    added(item);
  }

  let addLink = '';
  if (!preview && !item.addedToCart) {
    addLink = (
      <div className={'ms-auto align-self-center'}>
        <a href={'#'}
           onClick={addClickedHandler}
           className={`${classes.AddLink} pe-3 text-success`}>
          <i className={`bi-plus-square-fill`} />
          <span className={'visually-hidden'}>Add</span>
        </a>
      </div>
    )
  }

  let secondaryText = '';
  let note = '';
  if (item.configuration.note) {
    note = `(${item.configuration.note})`;
    secondaryText = (
      <p className={classes.Note}>
        {note}
      </p>
    );
  }
  if (item.configuration.division) {
    secondaryText = (
      <p className={classes.Note}>
        Division: {item.configuration.division} {note}
      </p>
    );
  } else if (item.configuration.input_label) {
    secondaryText = (
      <form>
        <label>
          {item.configuration.input_label}
        </label>
        <input type={'text'} />
      </form>
    );
  } else if (item.configuration.denomination) {
    secondaryText = (
      <p className={classes.Note}>
        {item.configuration.denomination} {note}
      </p>
    );
  }

  let attachedClasses = [classes.Item, 'rounded', 'border', 'mb-3', 'mx-0', 'd-flex'];
  if (item.determination === 'event') {
    attachedClasses.push('border-primary', 'border-3');
  } else {
    attachedClasses.push('border-secondary');
  }
  let tooltipText = 'Click the + to select this item';
  if (item.addedToCart) {
    attachedClasses.push(classes.Selected);
    tooltipText = 'This item has been chosen';
  } else {
    attachedClasses.push(classes.NotSelected);
  }

  return (
    <div className={attachedClasses.join(' ')} title={tooltipText}>
      <div className={'ps-2'}>
        <p className={classes.Name}>
          {item.name}
        </p>
        {secondaryText}
        <p>
          ${item.value}
        </p>
      </div>
      {addLink}
    </div>
  );
}

export default item;