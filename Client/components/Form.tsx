import { useState } from "react";
import api from "../src/api";
import { useNavigate } from "react-router-dom";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../src/constants";
import React from "react";
import "../src/index.css"

interface FormProps {
    route: string;
    method: "login" | "register";
  }
  
  function Form({ route, method }: FormProps): JSX.Element {
    const [username, setUsername] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const navigate = useNavigate();
  
    const name = method === "login" ? "Login" : "Register";
  
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
      setLoading(true);
      e.preventDefault();
  
      try {
        const res = await api.post(route, { username, password });
        if (method === "login") {
          localStorage.setItem(ACCESS_TOKEN, res.data.access);
          localStorage.setItem(REFRESH_TOKEN, res.data.refresh);
          navigate("/");
        } else {
          navigate("/login");
        }
      } catch (error) {
        alert(error);
      } finally {
        setLoading(false);
      }
    };
  
    return (
        <form
          onSubmit={handleSubmit}
          className="flex flex-col items-center justify-center mx-auto my-12 p-5 rounded-lg shadow-md max-w-sm"
        >
          <h1 className='text-xl font-bold mb-4'>{name}</h1>
          <input
            className="w-11/12 p-2 my-2 border border-gray-300 rounded-md box-border"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
          />
          <input
            className="w-11/12 p-2 my-2 border border-gray-300 rounded-md box-border"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
          />
          {loading}
          <button
            className="w-11/12 p-2 my-5 bg-blue-500 text-white rounded-md transition-colors hover:bg-blue-700"
            type="submit"
          >
            {name}
          </button>
        </form>
      );
  }
  
  export default Form;