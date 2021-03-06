import {useEffect, useState} from "react";
import PartnerSelectionRow from "./PartnerSelectionRow";
import {useRegistrationContext} from "../../../store/RegistrationContext";

import classes from './DoublesPartners.module.scss';

const DoublesPartners = ({partnersChosen}) => {
  const {entry} = useRegistrationContext();

  if (!entry.team) {
    return '';
  }

  return (
    <div className={`${classes.DoublesPartners} table-responsive`}>
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
        {entry.team.bowlers.map(bowler => {
          const teammates = entry.team.bowlers.filter((value) => { return value.position !== bowler.position });
          return <PartnerSelectionRow key={bowler.position}
                                      bowler={bowler}
                                      teammates={teammates}
                                      onPartnerSelected={partnersChosen}
          />
        })}
        </tbody>
      </table>
    </div>
  );
}

export default DoublesPartners;