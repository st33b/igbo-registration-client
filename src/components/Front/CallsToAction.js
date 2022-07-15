
const CallsToAction = ({mode = 'light'}) => {
  console.log("CTAs mode:", mode);
  return (
    <div className="d-grid gap-3 d-sm-flex justify-content-sm-center pt-sm-3">
      <a href="mailto:info@tourn.io?subject=Using%20Tournio"
         className="btn btn-outline-primary btn-lg px-4 gap-3">
        Get In Touch
      </a>
      <a href={'/tournaments'}
         title={'See the list of current tournaments'}
         className="btn btn-outline-secondary btn-lg px-4">
        Current Tournaments
      </a>
    </div>
  );
}

export default CallsToAction;