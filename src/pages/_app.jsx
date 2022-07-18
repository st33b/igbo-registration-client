import '../scss/tournio-bs.scss';
import 'bootstrap-icons/font/bootstrap-icons.css';
import '../scss/styles.scss';

import {useEffect} from "react";

import {DirectorContextProvider} from "../store/DirectorContext";
import {RegistrationContextProvider} from "../store/RegistrationContext";

const APP_VERSION = 'app_version';

function MyApp({Component, pageProps})  {
  useEffect(() => {
    import('bootstrap');

    const myVersion = localStorage.getItem(APP_VERSION);
    if (myVersion === null || myVersion !== process.env.NEXT_PUBLIC_IGBO_REGISTRATION_CLIENT_VERSION) {
      // console.log("env version doesn't match mine");
      // console.log("Mine:", myVersion);
      // console.log("Env:", process.env.NEXT_PUBLIC_IGBO_REGISTRATION_CLIENT_VERSION);
      localStorage.clear();
      localStorage.setItem(APP_VERSION, process.env.NEXT_PUBLIC_IGBO_REGISTRATION_CLIENT_VERSION);
    }
  }, []);

  const getLayout = Component.getLayout || ((page) => page);

  return (
    <DirectorContextProvider>
      <RegistrationContextProvider>
        {getLayout(<Component {...pageProps} />)}
      </RegistrationContextProvider>
    </DirectorContextProvider>
  );
}

export default MyApp;