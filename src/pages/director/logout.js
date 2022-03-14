import DirectorLayout from '../../components/Layout/DirectorLayout/DirectorLayout';
import {useEffect} from "react";
import {useRouter} from "next/router";
import {useDirectorContext} from "../../store/DirectorContext";
import {directorApiLogoutRequest} from "../../utils";

const logout = () => {
  const router = useRouter();
  const directorContext = useDirectorContext();

  const onLogoutSuccess = () => {
    router.push('/director/login');
  }

  useEffect(() => {
    if (!router || !directorContext) {
      return;
    }
    directorApiLogoutRequest({
      context: directorContext,
      onSuccess: onLogoutSuccess,
      onFailure: (_) => {},
    })
  }, []);

  return (
    <div>
      <h5>Log Out</h5>
    </div>
  );
}

logout.getLayout = function getLayout(page) {
  return (
    <DirectorLayout>
      {page}
    </DirectorLayout>
  );
}

export default logout;