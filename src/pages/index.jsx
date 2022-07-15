import FrontLayout from '../components/Layout/FrontLayout/FrontLayout';
import CallsToAction from "../components/Front/CallsToAction";
import BlurbCards from "../components/Front/BlurbCards";
import Hero from "../components/Front/Hero";
import {useEffect, useState} from "react";

const Page = () => {
  const [scheme, setScheme] = useState('dark');
  useEffect(() => {
    if (window === undefined) {
      console.log("No window yet");
      return;
    }
    const prefersDarkScheme = window.matchMedia("(prefers-color-scheme: dark)");
    console.log("I have a window! Setting the scheme");
    console.log("Setting scheme to", prefersDarkScheme.matches ? 'dark' : 'light');
    setScheme(prefersDarkScheme.matches ? 'dark' : 'light');
  });

  return (
    <div>
      <Hero mode={scheme}/>

      <BlurbCards mode={scheme} />

      <CallsToAction mode={scheme} />
    </div>
  );
}

Page.getLayout = function getLayout(page) {
  return (
    <FrontLayout>
      {page}
    </FrontLayout>
  );
}

export default Page;