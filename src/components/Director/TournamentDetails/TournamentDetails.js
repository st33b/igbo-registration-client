import Breadcrumbs from "../Breadcrumbs/Breadcrumbs";

import classes from './TournamentDetails.module.scss';
import Basics from "./Basics";
import Configuration from "./Configuration";
import AdditionalQuestions from "./AdditionalQuestions";
import TournamentLogo from "./TournamentLogo";
import StatusAndCounts from "./StatusAndCounts";
import PurchasableItems from "./PurchasableItems";
import Contacts from "./Contacts";
import StateChangeButton from "./StateChangeButton";
import {useDirectorContext} from "../../../store/DirectorContext";

const tournamentDetails = ({stateChangeInitiated}) => {
  const context = useDirectorContext();
  if (!context || !context.tournament) {
    return <div className={classes.TournamentDetails}>
      <h3 className={'display-6 text-center pt-2'}>Loading, sit tight...</h3>
    </div>;
  }

  const ladder = [{ text: 'Tournaments', path: '/director' }];
  return (
    <div className={classes.TournamentDetails}>
      <Breadcrumbs ladder={ladder} activeText={context.tournament.name} className={classes.Breadcrumbs} />

      <div className={'row'}>
        <div className={'col-12 col-md-6 col-lg-4'}>
          <Basics />
          <Configuration />
          <AdditionalQuestions />
        </div>

        <div className={'col-12 col-md-6 col-lg-4'}>
          <StatusAndCounts />
          <PurchasableItems />
        </div>

        <div className={'col-12 col-md-6 col-lg-4'}>
          <TournamentLogo />
          <StateChangeButton stateChangeInitiated={stateChangeInitiated} />
          <Contacts />
        </div>
      </div>
    </div>
  );
}

export default tournamentDetails;