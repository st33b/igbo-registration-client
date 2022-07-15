import logoImage from '../../images/tournio-logo.png';
import darkLogoImage from '../../images/tournio-logo-inverted.png';
import screenshot from '../../images/demo-screenshot.jpg';
import Image from "next/image";

const Hero = ({mode='light'}) => {
  console.log('Hero mode:', mode);
  return (
    <div className="container col-xxl-10 px-4 pt-2 pb-md-3">
      <div className="row d-flex align-items-center g-2 g-md-4 g-lg-5 py-0 py-md-3">

        <div className="col-lg-6 pb-2 pb-md-0">
          <div className="mb-3">
            {mode === 'dark' && <Image src={darkLogoImage}/>}
            {mode !== 'dark' && <Image src={logoImage}/>}
          </div>
          <p className="lead mb-1">
            A registration system for IGBO bowling tournaments that is easy to use for both bowlers and
            committee members alike. With easy setup, testing, registration, administration, and reporting.
            Plus a reliable payments integration, courtesy of Stripe.
          </p>
        </div>

        <div className="d-none d-sm-block col-10 offset-1 col-lg-6 offset-lg-0">
          <Image src={screenshot}
                 className="d-block mx-lg-auto img-fluid"
                 alt="Demo Tournament sample image"
          />
        </div>

      </div>
    </div>
  );
}

export default Hero;