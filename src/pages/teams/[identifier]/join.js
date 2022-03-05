import {useEffect, useState} from "react";
import axios from "axios";
import {useRouter} from "next/router";
import {Col, Row} from "react-bootstrap";

import {useRegistrationContext} from "../../../store/RegistrationContext";
import RegistrationLayout from "../../../components/Layout/RegistrationLayout/RegistrationLayout";
import BowlerForm from "../../../components/Registration/BowlerForm/BowlerForm";
import Summary from "../../../components/Registration/Summary/Summary";
import {existingTeamBowlerInfoAdded} from "../../../store/actions/registrationActions";

const page = () => {
  const router = useRouter();
  const { entry, dispatch } = useRegistrationContext();

  if (!entry.tournament) {
    return '';
  }

  if (!entry.team) {
    return '';
  }

  const onNewBowlerAdded = (bowlerInfo) => {
    dispatch(existingTeamBowlerInfoAdded(bowlerInfo));
    router.push(`/teams/${entry.team.identifier}/review-joining-bowler`);
  }

  return (
    <Row>
      <Col lg={8}>
        <BowlerForm bowlerInfoSaved={onNewBowlerAdded} />
      </Col>
      <Col>
        <Summary />
      </Col>
    </Row>
  );
}

page.getLayout = function getLayout(page) {
  return (
    <RegistrationLayout>
      {page}
    </RegistrationLayout>
  );
}

export default page;