import React, {useEffect, useState} from "react";
import {useRouter} from "next/router";
import {Card} from "react-bootstrap";

import {useDirectorContext} from "../../../store/DirectorContext";
import DirectorLayout from "../../../components/Layout/DirectorLayout/DirectorLayout";
import TeamListing from "../../../components/Director/TeamListing/TeamListing";
import Breadcrumbs from "../../../components/Director/Breadcrumbs/Breadcrumbs";
import NewTeamForm from "../../../components/Director/NewTeamForm/NewTeamForm";
import {directorApiRequest} from "../../../utils";
import LoadingMessage from "../../../components/ui/LoadingMessage/LoadingMessage";

const Page = () => {
  const router = useRouter();
  const directorContext = useDirectorContext();
  const [successMessage, setSuccessMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [teams, setTeams] = useState(null);
  const [loading, setLoading] = useState(true);

  let identifier;
  if (directorContext && directorContext.tournament) {
    identifier = directorContext.tournament.identifier;
  }

  // This effect ensures we're logged in with appropriate permissions
  useEffect(() => {
    if (!identifier) {
      return;
    }
    if (!directorContext) {
      return;
    }
    if (!directorContext.isLoggedIn) {
      router.push('/director/login');
    }
    if (directorContext.user.role !== 'superuser' && !directorContext.user.tournaments.some(t => t.identifier === identifier)) {
      router.push('/director');
    }
  }, [identifier, router, directorContext]);

  const onFetchTeamsSuccess = (data) => {
    setTeams(data);
    setLoading(false);
  }

  const onFetchTeamsFailure = (data) => {
    setErrorMessage(data.error);
    setLoading(false);
  }

  // This effect fetches the teams from the backend
  useEffect(() => {
    if (!identifier) {
      return;
    }

    const uri = `/director/tournaments/${identifier}/teams`;
    const requestConfig = {
      method: 'get',
    }
    directorApiRequest({
      uri: uri,
      requestConfig: requestConfig,
      context: directorContext,
      router: router,
      onSuccess: onFetchTeamsSuccess,
      onFailure: onFetchTeamsFailure,
    });
  }, [identifier, router, directorContext]);

  // Do we have a success query parameter?
  useEffect(() => {
    const {success} = router.query;
    if (success === 'deleted') {
      setSuccessMessage('The team has been removed.');
      router.replace(router.pathname, null, { shallow: true });
    }
  }, [router]);

  const newTeamSubmitSuccess = (data) => {
    setSuccessMessage('New team created!');
    const newData = teams.splice(0);
    newData.push(data);
    setTeams(newData);
  }

  const newTeamSubmitFailure = (data) => {
    setErrorMessage('Failed to create a new team. Why? ' + data.error);
  }

  const newTeamSubmitted = (teamName) => {
    const uri = `/director/tournaments/${identifier}/teams`;
    const requestConfig = {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
      },
      data: {
        team: {
          name: teamName,
        }
      }
    }
    directorApiRequest({
      uri: uri,
      requestConfig: requestConfig,
      context: directorContext,
      router: router,
      onSuccess: newTeamSubmitSuccess,
      onFailure: newTeamSubmitFailure,
    });
  }

  let success = '';
  let error = '';
  if (successMessage) {
    success = (
      <div className={'alert alert-success alert-dismissible fade show d-flex align-items-center mt-3 mb-0'} role={'alert'}>
        <i className={'bi-check-circle-fill pe-2'} aria-hidden={true} />
        <div className={'me-auto'}>
          <strong>
            Success!
          </strong>
          {' '}{successMessage}
        </div>
        <button type={"button"} className={"btn-close"} data-bs-dismiss={"alert"} aria-label={"Close"} />
      </div>
    );
  }
  if (errorMessage) {
    error = (
      <div className={'alert alert-danger alert-dismissible fade show d-flex align-items-center mt-3 mb-0'} role={'alert'}>
        <i className={'bi-exclamation-circle-fill pe-2'} aria-hidden={true} />
        <div className={'me-auto'}>
          <strong>
            Oh no!
          </strong>
          {' '}{errorMessage}
        </div>
        <button type={"button"} className={"btn-close"} data-bs-dismiss={"alert"} aria-label={"Close"} />
      </div>
    );
  }

  const newTeam = (
    <Card>
      <Card.Header as={'h5'} className={'fw-light'}>
        New Team
      </Card.Header>
      <Card.Body>
        <NewTeamForm submitted={newTeamSubmitted} />
      </Card.Body>
    </Card>
  );

  const ladder = [{text: 'Tournaments', path: '/director'}];
  if (directorContext.tournament) {
    ladder.push({text: directorContext.tournament.name, path: `/director/tournaments/${identifier}`});
  }

  if (loading) {
    return <LoadingMessage message={'Retrieving team data...'} />
  }

  return (
    <div>
      <Breadcrumbs ladder={ladder} activeText={'Teams'}/>
      <div className={'row'}>
        <div className={'order-2 order-md-1 col'}>
          {success}
          {error}
          <TeamListing teams={teams} />
        </div>
        <div className={'order-1 order-md-2 col-12 col-md-4'}>
          {newTeam}
        </div>
      </div>
    </div>
  );
}

Page.getLayout = function getLayout(page) {
  return (
    <DirectorLayout>
      {page}
    </DirectorLayout>
  );
}

export default Page;