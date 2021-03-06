import {useEffect, useState} from "react";
import {Col, Row} from "react-bootstrap";

import {fetchTeamList} from "../../../utils";
import {useRegistrationContext} from "../../../store/RegistrationContext";
import RegistrationLayout from "../../../components/Layout/RegistrationLayout/RegistrationLayout";
import TournamentLogo from "../../../components/Registration/TournamentLogo/TournamentLogo";
import TeamListing from "../../../components/Registration/TeamListing/TeamListing";
import {joinTeamRegistrationInitiated} from "../../../store/actions/registrationActions";
import Contacts from "../../../components/Registration/Contacts/Contacts";
import LoadingMessage from "../../../components/ui/LoadingMessage/LoadingMessage";
import {useRouter} from "next/router";

const Page = () => {
  const { entry, dispatch } = useRegistrationContext();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [teams, setTeams] = useState(null);

  const onTeamListRetrieved = (data) => {
    setTeams(data);
    setLoading(false);
  }

  const onTeamListFailed = (data) => {
    setLoading(false);
    // error!
  }

  useEffect(() => {
    if (!entry || !entry.tournament) {
      return;
    }
    const shift = entry.tournament.shifts[0];
    if (shift && !shift.registration_types.join_team) {
      router.push(`/tournaments/${entry.tournament.identifier}`);
    }
  }, [entry]);

  // fetch the team details
  useEffect(() => {
    if (!entry || !entry.tournament) {
      return;
    }

    fetchTeamList({
      tournamentIdentifier: entry.tournament.identifier,
      dispatch: dispatch,
      onSuccess: onTeamListRetrieved,
      onFailure: onTeamListFailed,
      incomplete: true,
    })
  }, []);

  if (!entry || !entry.tournament || !teams) {
    return <LoadingMessage message={'Retrieving list of available teams...'} />
  }

  if (loading) {
    return <LoadingMessage message={'Retrieving list of available teams...'} />
  }

  const includeShift = entry.tournament.shifts && entry.tournament.shifts.length > 1;

  return (
    <div>
      <Row>
        <Col md={4} className={'d-none d-md-block'}>
          <a href={`/tournaments/${entry.tournament.identifier}`} title={'To tournament page'}>
            <TournamentLogo tournament={entry.tournament}/>
            <h4 className={'text-center py-3'}>{entry.tournament.name}</h4>
          </a>
          <Contacts tournament={entry.tournament}/>
        </Col>
        <Col>
          <TeamListing caption={'Teams Available to Join'} teams={teams} includeShift={includeShift} />
        </Col>
      </Row>
    </div>
  );
}

Page.getLayout = function getLayout(page) {
  return (
    <RegistrationLayout>
      {page}
    </RegistrationLayout>
  );
}

export default Page;