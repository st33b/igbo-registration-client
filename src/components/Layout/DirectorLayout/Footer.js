import classes from './Footer.module.scss';

const footer = () => (
  <div className={classes.Footer}>
    <p className={'text-muted text-center py-2 my-2'}>
      Problems? Feedback? Drop an email to&nbsp;
      <a href={'mailto:info@igbo-reg.com?subject=Feedback'}>
        info@igbo-reg.com
      </a>
    </p>
  </div>
);

export default footer;