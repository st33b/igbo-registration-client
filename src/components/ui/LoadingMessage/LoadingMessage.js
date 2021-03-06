import classes from './LoadingMessage.module.scss';

const LoadingMessage = ({message}) => (
    <div className={classes.LoadingMessage}>
      <div className={'d-flex align-items-top justify-content-center pt-3'}>
        <span className={`spinner-border ${classes.LoadingSpinner}`}
          aria-hidden={true}
          role={'status'}>
        </span>
        <h3 className={'display-6 text-center pt-2'}>
          {message}
        </h3>
      </div>
    </div>
  )
;

export default LoadingMessage;