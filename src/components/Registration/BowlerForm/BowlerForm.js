import React, {useEffect, useState} from "react";
import {CountryDropdown} from "react-country-region-selector";

import Input from "../../ui/Input/Input";
import {useRegistrationContext} from "../../../store/RegistrationContext";

import classes from './BowlerForm.module.scss';
import ErrorBoundary from "../../common/ErrorBoundary";

const BowlerForm = ({bowlerInfoSaved, includeShift, bowlerData, cancelHref}) => {
  const {entry} = useRegistrationContext();

  const initialFormState = {
    formFields: {
      first_name: {
        elementType: 'input',
        elementConfig: {
          type: 'text',
          value: '',
        },
        label: 'First name',
        validation: {
          required: true,
        },
        valid: false,
        touched: false,
      },
      last_name: {
        elementType: 'input',
        elementConfig: {
          type: 'text',
          value: '',
        },
        label: 'Last name',
        validation: {
          required: true,
        },
        valid: false,
        touched: false,
      },
      nickname: {
        elementType: 'input',
        elementConfig: {
          type: 'text',
          value: '',
        },
        label: 'Preferred Name',
        validation: {
          required: false,
        },
        helper: {
          url: null,
          text: '(if different from first name)',
        },
        valid: true,
        touched: false,
      },
      usbc_id: {
        elementType: 'input',
        elementConfig: {
          type: 'text',
          value: '',
        },
        label: 'USBC ID',
        validation: {
          required: true,
        },
        helper: {
          url: 'https://webapps.bowl.com/USBCFindA/Home/Member',
          text: 'Look up your USBC ID',
        },
        valid: false,
        touched: false,
      },
      // igbo_id: {
      //   elementType: 'input',
      //   elementConfig: {
      //     type: 'text',
      //     value: '',
      //   },
      //   label: 'IGBO ID',
      //   validation: {
      //     required: true,
      //   },
      //   helper: {
      //     url: 'http://www.igbo.org/igbots-id-lookup/',
      //     text: 'Look up your IGBO ID; enter "n/a" if you don\'t have one',
      //   },
      //   valid: true,
      //   touched: false,
      // },
      birth_month: {
        elementType: 'input',
        elementConfig: {
          type: 'number',
          value: '',
        },
        label: 'Birth month',
        validation: {
          required: true,
          min: 1,
          max: 12,
        },
        valid: false,
        touched: false,
      },
      birth_day: {
        elementType: 'input',
        elementConfig: {
          type: 'number',
          value: '',
        },
        label: 'Birth day',
        validation: {
          required: true,
          min: 1,
          max: 31,
          date: true,
        },
        valid: false,
        touched: false,
      },
      email: {
        elementType: 'input',
        elementConfig: {
          type: 'email',
          value: '',
        },
        label: 'Email address',
        validation: {
          required: true,
        },
        valid: false,
        touched: false,
      },
      phone: {
        elementType: 'input',
        elementConfig: {
          type: 'tel',
          value: '',
        },
        label: 'Phone number',
        validation: {
          required: true,
        },
        valid: false,
        touched: false,
      },
      address1: {
        elementType: 'input',
        elementConfig: {
          type: 'text',
          value: '',
        },
        label: 'Address 1',
        validation: {
          required: true,
        },
        valid: false,
        touched: false,
      },
      address2: {
        elementType: 'input',
        elementConfig: {
          type: 'text',
          value: '',
        },
        label: 'Address 2',
        validation: {
          required: false,
        },
        valid: true,
        touched: false,
      },
      city: {
        elementType: 'input',
        elementConfig: {
          type: 'text',
          value: '',
        },
        label: 'City',
        validation: {
          required: true,
        },
        valid: false,
        touched: false,
      },
      state: {
        elementType: 'input',
        elementConfig: {
          type: 'text',
          value: '',
        },
        label: 'State/Province',
        validation: {
          required: true,
        },
        touched: false,
      },
      country: {
        elementType: 'component',
        elementConfig: {
          component: CountryDropdown,
          value: '',
          props: {
            name: 'country',
            valueType: 'short',
            priorityOptions: ['US', 'CA', 'NZ'],
            defaultOptionLabel: '-- Choose your country',
            classes: 'form-select',
          },
        },
        label: 'Country',
        validation: {
          required: true,
        },
        touched: false,
      },
      postal_code: {
        elementType: 'input',
        elementConfig: {
          type: 'text',
          value: '',
        },
        label: 'ZIP/Postal Code',
        validation: {
          required: true,
        },
        valid: false,
        touched: false,
      },
    },
    valid: false,
    touched: false,
    soloBowlerFields: {
      shift: {
        elementType: 'select',
        elementConfig: {
          value: '',
          options: [],
        },
        label: 'Preferred Shift',
        validation: {
          required: true,
        },
        valid: false,
        touched: false,
      }
    }
  }
  const [bowlerForm, setBowlerForm] = useState(initialFormState);
  const [showShiftSelection, setShowShiftSelection] = useState(false);
  const [buttonText, setButtonText] = useState('Save Bowler');
  const [showCancelButton, setShowCancelButton] = useState(false);

  const additionalFormFields = () => {
    const formFields = {};
    for (let key in entry.tournament.additional_questions) {
      formFields[key] = { ...entry.tournament.additional_questions[key] }
      formFields[key].valid = !entry.tournament.additional_questions[key].validation.required
      formFields[key].touched = false;
      formFields[key].elementConfig = { ...entry.tournament.additional_questions[key].elementConfig }
    }
    return formFields;
  }

  const resetFormData = () => {
    const formData = {...initialFormState};

    // get the additional questions
    formData.formFields = {...formData.formFields, ...additionalFormFields()};

    // put shift info in there, if needed
    if (includeShift) {
      if (entry.tournament.available_shifts.length > 1) {
        formData.soloBowlerFields.shift.elementConfig.options = [{value: '', label: '-- Choose a shift'}];
        entry.tournament.available_shifts.map(shift => {
          formData.soloBowlerFields.shift.elementConfig.options.push(
            { value: shift.identifier, label: shift.name }
          );
        });
        setShowShiftSelection(true);
      } else {
        formData.soloBowlerFields.shift.elementConfig.value = entry.tournament.available_shifts[0].identifier;
        formData.soloBowlerFields.shift.valid = true;
      }
    }

    setBowlerForm(formData);
  }

  // get the additional questions into the bowler form, along with shift info if needed
  useEffect(() => {
    if (!entry) {
      return;
    }

    resetFormData();
  }, [entry]);

  // We're editing a bowler. Put their data into the form.
  useEffect(() => {
    if (!bowlerData) {
      return;
    }
    const updatedBowlerForm = {...bowlerForm};
    updatedBowlerForm.formFields = {...updatedBowlerForm.formFields, ...additionalFormFields()};

    // First, all the standard fields and additional questions
    // for (const inputIdentifier in initialFormState.formFields) {
    for (const inputIdentifier in bowlerData) {
      if (updatedBowlerForm.formFields[inputIdentifier] === undefined) {
        continue;
      }
      updatedBowlerForm.formFields[inputIdentifier].elementConfig.value = bowlerData[inputIdentifier];
      updatedBowlerForm.formFields[inputIdentifier].valid = checkValidity(
        bowlerData[inputIdentifier],
        updatedBowlerForm.formFields[inputIdentifier].validation
      );
    }

    // Now, shift information, if there is any
    if (includeShift) {
      updatedBowlerForm.soloBowlerFields.shift.elementConfig.value = bowlerData.shift.identifier;
      updatedBowlerForm.soloBowlerFields.shift.valid = true;
    }

    setBowlerForm(updatedBowlerForm);
    setButtonText('Save Changes');
    setShowCancelButton(true);
  }, []);

  if (!entry || !entry.tournament) {
    return '';
  }

  //. If we aren't editing a bowler, then set the position if it's needs to be something other than 1.
  // if (!bowlerData) {
  //   if (entry.team) {
  //     setPosition (entry.team.bowlers.length + 1);
  //   } else if (entry.bowlers) {
  //     setPosition(entry.bowlers.length + 1);
  //   }
  // }

  const checkValidity = (value, rules) => {
    let isValid = true;

    if (rules.required) {
      isValid = isValid && value.trim().length > 0;
    }

    // Add other validity handling here. Min/max length, formatting, etc.
    if (rules.min) {
      isValid = isValid && value >= rules.min;
    }
    if (rules.max) {
      isValid = isValid && value <= rules.max;
    }

    return isValid;
  }

  const formHandler = (event) => {
    event.preventDefault();

    if (!bowlerForm.valid) {
      return;
    }

    // Grab all the values from the form so they can be stored
    const bowlerData = {};
    for (let formElementIdentifier in bowlerForm.formFields) {
      bowlerData[formElementIdentifier] = bowlerForm.formFields[formElementIdentifier].elementConfig.value;
    }
    bowlerData.position = position;

    if (includeShift) {
      bowlerData.shift = bowlerForm.soloBowlerFields.shift.elementConfig.value;
    }

    // Reset the form to take in the next bowler's info
    resetFormData(initialFormState);

    bowlerInfoSaved(bowlerData);
  }

  const inputChangedHandler = (event, inputIdentifier) => {
    // Create a copy of the bowler form; this is where we'll make updates
    const updatedBowlerForm = {
      ...bowlerForm
    };

    if (inputIdentifier === 'shift') {
      updatedBowlerForm.soloBowlerFields.shift.elementConfig.value = event.target.value;
      updatedBowlerForm.touched = true;
    } else {
      // This is the part of the form concerning the input that's changed
      const updatedFormElement = {
        ...bowlerForm.formFields[inputIdentifier]
      }
      // Deep-copy the element config, since that has the part that gets changed...
      updatedFormElement.elementConfig = { ...bowlerForm.formFields[inputIdentifier].elementConfig }

      // The country is a special snowflake...
      let newValue = null;
      if (inputIdentifier === 'country')
        newValue = event;
      else if (updatedFormElement.elementType === 'checkbox') {
        newValue = event.target.checked ? 'yes' : 'no';
      }
      else
        newValue = event.target.value;

      // Update the relevant parts of the changed field (the new value, whether it's valid, and the fact that it was changed at all)
      updatedFormElement.elementConfig.value = newValue;
      updatedFormElement.valid = checkValidity(newValue, updatedFormElement.validation);
      updatedFormElement.touched = true;

      // Deep-copy the formFields property, because it's complex
      updatedBowlerForm.formFields = {
        ...bowlerForm.formFields
      }
      // Put the changed field in the copy of the bowler form structure
      updatedBowlerForm.formFields[inputIdentifier] = updatedFormElement;
    }

    // Now, determine whether the whole form is valid
    let formIsValid = includeShift
      ? updatedBowlerForm.soloBowlerFields.shift.elementConfig.value.length > 0
      : true;
    for (let inputIdentifier in updatedBowlerForm.formFields) {
      formIsValid = formIsValid && updatedBowlerForm.formFields[inputIdentifier].valid;
    }
    updatedBowlerForm.valid = formIsValid;

    updatedBowlerForm.touched = true;

    // Replace the form in state, to reflect changes based on the value that changed, and resulting validity
    setBowlerForm(updatedBowlerForm);
  }

  const formElements = [];
  for (let key in bowlerForm.formFields) {
    formElements.push({
      id: key,
      setup: bowlerForm.formFields[key],
    })
  }

  let form = (
    <form onSubmit={formHandler} noValidate>
      {showShiftSelection && (
        <div>
          <Input
            key={'shift'}
            identifier={'shift'}
            elementType={bowlerForm.soloBowlerFields.shift.elementType}
            elementConfig={bowlerForm.soloBowlerFields.shift.elementConfig}
            changed={(event) => inputChangedHandler(event, 'shift')}
            label={bowlerForm.soloBowlerFields.shift.label}
            shouldValidate={true}
            touched={bowlerForm.soloBowlerFields.shift.touched}
            invalid={!bowlerForm.soloBowlerFields.shift.valid}
            validationRules={bowlerForm.soloBowlerFields.shift.validation}
          />
          <hr />
        </div>
      )}
      {formElements.map(formElement => (
        <Input
          key={formElement.id}
          identifier={formElement.id}
          elementType={formElement.setup.elementType}
          elementConfig={formElement.setup.elementConfig}
          changed={(event) => inputChangedHandler(event, formElement.id)}
          label={formElement.setup.label}
          shouldValidate={true}
          touched={formElement.setup.touched}
          invalid={!formElement.setup.valid}
          helper={formElement.setup.helper}
          validationRules={formElement.setup.validation}
        />
      ))}

      <div className="d-flex flex-row-reverse justify-content-between pt-2">
        {/*<div className="invalid-form-warning alert alert-warning" role="alert">*/}
        {/*  There are some errors in your form. Please correct them and try again.*/}
        {/*</div>*/}
        <button className="btn btn-primary btn-lg" type="submit" disabled={!bowlerForm.valid || !bowlerForm.touched}>
          {buttonText}{' '}
          <i className="bi-chevron-double-right ps-1" aria-hidden="true"/>
        </button>

        {showCancelButton && (
          <a className={'btn btn-secondary btn-lg'}
             href={cancelHref}>
            <i className={'bi-chevron-double-left pe-1'} aria-hidden={true} />
            Cancel Changes
          </a>
        )}
      </div>
    </form>
  );

  let position = 1;
  if (bowlerData) {
    position = bowlerData.position;
  } else if (entry.team) {
    position = entry.team.bowlers.length + 1;
  } else if (entry.bowlers) {
    position = entry.bowlers.length + 1;
  }

  let headerText = 'Bowler #' + position;

  return (
    <ErrorBoundary>
      <div className={classes.BowlerForm}>

        <h3>
          {headerText}
        </h3>

        <p>
          <i className={`${classes.RequiredLabel} align-top bi-asterisk`} />
          {' '}indicates a required field
        </p>

        {form}
      </div>
    </ErrorBoundary>
  );
}

export default BowlerForm;