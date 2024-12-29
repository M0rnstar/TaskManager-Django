import Form from "../components/Form"
import '../src/index.css'

function Register() {
  return (
    <Form route="/api/user/register/" method="register"/>
  )
}

export default Register