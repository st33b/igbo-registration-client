import {useState, useEffect, useMemo} from "react";
import {useTable} from "react-table";
import {Button} from "react-bootstrap";

import {useDirectorContext} from "../../../store/DirectorContext";
import PartnerSelectionRow from "./PartnerSelectionRow";

import classes from './TeamDetails.module.scss';
import ErrorBoundary from "../../common/ErrorBoundary";

const TeamDetails = ({team, teamUpdateSubmitted}) => {
  const directorContext = useDirectorContext();

  let initialFormData = {
    valid: true,
    touched: false,
    fields: {
      name: {
        value: '',
        valid: true,
      },
      shift: {
        value: '',
        valid: true,
      },
      bowlers_attributes: {
        value: [],
        valid: true,
      },
    }
  }

  const [data, setData] = useState([]);
  const [teamForm, setTeamForm] = useState(initialFormData);
  const [tournament, setTournament] = useState();

  let identifier;
  useEffect(() => {
    if (!directorContext || !directorContext.tournament) {
      return;
    }
    setTournament(directorContext.tournament);
    identifier = directorContext.tournament.identifier;
  }, [directorContext]);

  useEffect(() => {
    if (!team || !tournament) {
      return;
    }
    const newFormData = {...teamForm}
    newFormData.fields.name.value = team.name;
    if (tournament.shifts.length > 1) {
      newFormData.fields.shift = {
        value: team.shift.identifier,
        valid: true,
      };
    }
    newFormData.fields.bowlers_attributes.value = team.bowlers.map((b) => {
      return {
        id: b.id,
        position: b.position,
        doubles_partner_id: b.doubles_partner_id,
      }
    }, [team]);
    setData(team.bowlers);
    setTeamForm(newFormData);
  }, [team, tournament]);

  // columns
  const columns = useMemo(() => [
    {
      Header: 'Position',
      accessor: 'position',
      Cell: ({row}) => {
        const index = row.index;
        return (
          <>
            <input type={'number'}
                   min={1}
                   max={4}
                   value={teamForm.fields.bowlers_attributes.value[index].position}
                   className={[classes.PositionInput, 'form-control'].join(' ')}
                   name={'team[bowlers_attributes][' + index + '][position]'}
                   id={'team_bowlers_attributes_' + index + '_position'}
                   onChange={(event) => inputChangedHandler(event, 'position', index)}
            />
            <input type={'hidden'}
                   value={row.original.id}
                   name={'team[bowlers_attributes][' + index + '][id]'}
                   id={'team_bowlers_attributes_' + index + '_id'}
            />
          </>
        );
      }
    },
    {
      Header: 'Name',
      accessor: 'name',
      Cell: ({row, value}) => (
        <a href={`/director/bowlers/${row.original.identifier}`}>
          {value}
        </a>
      )
    },
    {
      Header: 'Amount Due',
      accessor: 'amount_due',
      Cell: ({value}) => `$${value}`,
    },
    {
      id: 'free_entry',
      Header: 'Free Entry',
      accessor: freeEntryDeets,
    }
  ], [teamForm]);

  // tell react-table which things we want to use
  // and retrieve properties/functions they let us hook into
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
  } = useTable(
    {columns, data},
  );

  if (!tournament || !team) {
    return '';
  }

  const inputChangedHandler = (event, inputName, index = -1) => {
    const updatedTeamForm = {...teamForm};
    updatedTeamForm.touched = true;

    switch (inputName) {
      case 'name':
      case 'shift':
        updatedTeamForm.fields[inputName].value = event.target.value;
        updatedTeamForm.fields[inputName].valid = updatedTeamForm.fields[inputName].value.length > 0;
        break;
      case 'position':
        updatedTeamForm.fields.bowlers_attributes.value[index].position = parseInt(event.target.value);
        const positions = updatedTeamForm.fields.bowlers_attributes.value.map((attrs) => attrs.position).sort();
        updatedTeamForm.fields.bowlers_attributes.valid = positions.reduce((result, value, index, array) => result && array[index - 1] < value);
        break;
    }

    // Do we need to Handle validity of partner assignments?
    let formIsValid = true;
    for (let fieldName in updatedTeamForm.fields) {
      formIsValid = formIsValid && updatedTeamForm.fields[fieldName].valid;
    }
    updatedTeamForm.valid = formIsValid;

    setTeamForm(updatedTeamForm);
  }

  const updateSubmitHandler = () => {
    const formData = {};
    for (let key in teamForm.fields) {
      formData[key] = teamForm.fields[key].value;
    }
    teamUpdateSubmitted(formData);
  }

  const freeEntryDeets = (row, rowIndex) => {
    if (row.free_entry === null) {
      return '--'
    }
    return row.free_entry.unique_code;
  }

  // When a doubles partner is clicked, what needs to happen:
  // - update the double partner assignments in state. (One click is enough to know everyone.)
  //  - Ex: Bowler A clicked on Bowler B
  //  - set A's partner to be B
  //  - set B's partner to be A (reciprocal)
  //  - set C and D to be partners (the remaining two)
  const gimmeNewDoublesPartners = (bowlerId, partnerId) => {
    // create a copy of the bowlers_attributes value array
    const newBowlers = teamForm.fields.bowlers_attributes.value.slice(0);

    let bowlersLeftToUpdate = [...newBowlers.keys()];
    const bowlerIndex = newBowlers.findIndex(b => b.id === bowlerId);
    const partnerIndex = newBowlers.findIndex(b => b.id === partnerId);

    newBowlers[bowlerIndex].doubles_partner_id = partnerId;
    newBowlers[partnerIndex].doubles_partner_id = bowlerId;

    // Remove those two from the list of bowlers who need to be updated
    bowlersLeftToUpdate = bowlersLeftToUpdate.filter((value) => {
      return newBowlers[value].id !== bowlerId && newBowlers[value].id !== partnerId;
    });

    // Update the other two (if there are two) to be partners with each other
    if (bowlersLeftToUpdate.length > 1) {
      const left = bowlersLeftToUpdate[0];
      const right = bowlersLeftToUpdate[1];
      newBowlers[left].doubles_partner_id = newBowlers[right].id;
      newBowlers[right].doubles_partner_id = newBowlers[left].id;
    } else if (bowlersLeftToUpdate.length === 1) {
      // If there's just one left, then nullify their doubles partner selection
      newBowlers[bowlersLeftToUpdate[0]].doubles_partner_id = null;
    }

    const updatedTeamForm = {...teamForm}
    updatedTeamForm.fields.bowlers_attributes.value = newBowlers;
    updatedTeamForm.touched = true;
    setTeamForm(updatedTeamForm);
  }

  const doublesPartnerSelection = (
    <div className={'table-responsive'}>
      <table className={'table table-hover caption-top align-middle'}>
        <caption className={classes.Caption}>
          Doubles Partner Assignment
        </caption>
        <thead className={'table-light'}>
        <tr>
          <th scope={'col'}>
            Bowler
          </th>
          <th colSpan={3} scope={'col'}>
            Partner options
          </th>
        </tr>
        </thead>
        <tbody>
        {team.bowlers.map(bowler => {
          return <PartnerSelectionRow key={bowler.id}
                                      bowler={bowler}
                                      allBowlers={team.bowlers}
                                      onPartnerSelected={gimmeNewDoublesPartners}
                                      values={teamForm.fields.bowlers_attributes.value}
          />
        })}
        </tbody>
      </table>
    </div>
  );

  const maxTeamSize = parseInt(tournament.config_items.find(({key}) => key === 'team_size').value);

  return (
    <ErrorBoundary>
      <div className={classes.TeamDetails}>
        <div className={'row mb-2'}>
          <label htmlFor={'team_name'} className={'col-form-label fw-bold text-sm-end col-12 col-sm-4'}>
            Team Name
          </label>
          <div className={'col'}>
            <input type={'text'}
                   className={'form-control'}
                   name={'name'}
                   id={'name'}
                   value={teamForm.fields.name.value}
                   onChange={(event) => inputChangedHandler(event, 'name')}
            />
          </div>
        </div>
        {tournament.shifts.length > 1 &&
          <div className={'row mb-2'}>
            <label htmlFor={'shift'}
                   className={'col-form-label fw-bold text-sm-end col-12 col-sm-4'}>
              Requested Shift
            </label>
            <div className={'col'}>
              <select className={'form-select'}
                      name={'shift'}
                      id={'shift'}
                      onChange={(event) => inputChangedHandler(event, 'shift')}
                      value={teamForm.fields.shift.value}>
                {tournament.shifts.map(shift => (
                  <option key={shift.identifier} value={shift.identifier}>
                    {shift.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        }
        {tournament.shifts.length > 0 &&
          <div className={'row mb-2'}>
            <label htmlFor={'shift_confirmed'}
                   className={'col-form-label fw-bold text-sm-end col-12 col-sm-4'}>
              Place Confirmed?
            </label>
            <div className={'col'}>
              <input type={'text'}
                     readOnly={true}
                     className={'form-control-plaintext'}
                     id={'shift_confirmed'}
                     value={team.shift_confirmed ? 'Yes' : 'No'}
              />
            </div>
          </div>
        }
        {team.size < maxTeamSize &&
          <div className={'row mb-2'}>
            <label htmlFor={'place_with_others'}
                   className={'col-form-label fw-bold text-sm-end col-12 col-sm-4'}>
              Place With Others?
            </label>
            <div className={'col'}>
              <input type={'text'}
                     readOnly={true}
                     className={'form-control-plaintext'}
                     id={'place_with_others'}
                     value={team.place_with_others === 'n/a' ? 'no response' : (team.place_with_others ? 'Yes' : 'No')}
              />
            </div>
          </div>
        }
        <div className={'table-responsive'}>
          <table className={'table table-striped caption-top align-middle'} {...getTableProps}>
            <caption className={classes.Caption}>
              Roster
            </caption>
            <thead className={'table-light'}>
            {headerGroups.map((headerGroup, i) => (
              <tr key={i} {...headerGroup.getHeaderGroupProps()}>
                {headerGroup.headers.map((column, j) => (
                  <th key={j} {...column.getHeaderProps()}>
                    {column.render('Header')}
                  </th>
                ))}
              </tr>
            ))}
            </thead>
            <tbody {...getTableBodyProps()}>
            {rows.map((row, i) => {
              prepareRow(row);
              return (
                <tr key={i} {...row.getRowProps()}>
                  {row.cells.map((cell, j) => (
                    <td key={j} {...cell.getCellProps()}>
                      {cell.render('Cell')}
                    </td>
                  ))}
                </tr>
              )
            })}
            </tbody>
          </table>
        </div>
        {doublesPartnerSelection}
        <div className={'text-center mt-4'}>
          <Button variant={'primary'}
                  disabled={!teamForm.touched || !teamForm.valid}
                  onClick={updateSubmitHandler}
          >
            Update Details
          </Button>
        </div>
      </div>
    </ErrorBoundary>

  );
}

export default TeamDetails;