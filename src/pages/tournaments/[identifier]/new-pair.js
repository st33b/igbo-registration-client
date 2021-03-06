import {useEffect} from "react";
import {useRouter} from "next/router";

import RegistrationLayout from "../../../components/Layout/RegistrationLayout/RegistrationLayout";
import {useRegistrationContext} from "../../../store/RegistrationContext";
import {newPairRegistrationInitiated} from "../../../store/actions/registrationActions";

const Page = () => {
  const {entry, dispatch} = useRegistrationContext();
  const router = useRouter();

  useEffect(() => {
    if (!entry || !entry.tournament) {
      return;
    }
    const shift = entry.tournament.shifts[0];
    if (shift && !shift.registration_types.new_pair) {
      router.push(`/tournaments/${entry.tournament.identifier}`);
    }
  }, [entry]);

  useEffect(() => {
    dispatch(newPairRegistrationInitiated());
    router.push(`/tournaments/${entry.tournament.identifier}/new-pair-bowler`);
  }, [dispatch]);

  return <div>
    <h6 className={'pt-3 text-center'}>Initiating new pair registration...</h6>
  </div>;
}

Page.getLayout = function getLayout(page) {
  return (
    <RegistrationLayout>
      {page}
    </RegistrationLayout>
  );
}

export default Page;