import Form from "../components/Form"
import '../src/index.css'

function Login() {
  return (
    <Form route="/api/token/" method="login"/>
  )
}

export default Login