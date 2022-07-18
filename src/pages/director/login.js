import DirectorLayout from '../../components/Layout/DirectorLayout/DirectorLayout';
import LoginForm from '../../components/Director/LoginForm/LoginForm';
import {Card, Col, Row} from "react-bootstrap";
import {useRouter} from "next/router";
import {useEffect, useState} from "react";

const Login = () => {
  const router = useRouter();

  const [successMessage, setSuccessMessage] = useState(null);

  useEffect(() => {
    const {password_reset_success} = router.query;
    if (password_reset_success) {
      setSuccessMessage('Your password was successfully changed. You may now use it to log in.');
      router.replace(router.pathname, null, {shallow: true});
    }
  }, [router]);

  let successAlert = '';
  if (successMessage) {
    successAlert = (
      <div className={'alert alert-success alert-dismissible fade show mt-3 mb-0 d-flex align-items-center'} role={'alert'}>
        <i className={'bi-check-square pe-3'} aria-hidden={true}/>
        <span>
          {successMessage}
        </span>
        <button type={'button'}
                className={'btn-close'}
                data-bs-dismiss={'alert'}
                aria-label={'Close'}/>
      </div>
    );
  }

  return (
    <div>
      <Row>
        <Col xs={12} sm={{span: 8, offset: 2}} md={{span: 6, offset: 3}}>
          {successAlert}
          <LoginForm />
        </Col>
      </Row>
      <Row>
        <Col xs={12} sm={{span: 8, offset: 2}} md={{span: 6, offset: 3}}>
          <Card className={'border-0 text-center mb-3'}>
            <Card.Body>
              <Card.Link href={'/'}>
                Tournio Home
              </Card.Link>
              <Card.Link href={'/director/forgot-password'}>
                Password Reset
              </Card.Link>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

Login.getLayout = function getLayout(page) {
  return (
    <DirectorLayout>
      {page}
    </DirectorLayout>
  );
}

export default Login;