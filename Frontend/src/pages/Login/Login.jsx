import React, { useState } from "react";
import Loader from "../../Components/Loading.jsx";  // Ensure this is the correct path for the loader component
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { Link } from "react-router-dom";
import Logo from "../../assets/logo.png";
import { toast } from "react-hot-toast";
import { api } from "../../api/api.js";
import { useNavigate } from 'react-router-dom';


// Validation schema using Yup
const validationSchema = Yup.object({
  email: Yup.string().email("Invalid email address").required("Email is required"),
  password: Yup.string().required("Password is required"),
});

const SignIn = () => {
  const [loading, setLoading] = useState(false);  // Track loading state
  useState(false);  // Track loading state
  const navigate = useNavigate()
  // Setup React Hook Form with Yup resolver
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(validationSchema),
  });

  // Handle form submission
  const onSubmit = async (data) => {
    setLoading(true); // Set loading to true when the form is submitted
    try {
      // Send the login data to the API using the axios instance
      const response = await api.post("/auth/login", data);
      toast.success(response.data.message);
      console.log("User logged in:", response.data);

      // Optionally, store the token in localStorage for future requests
      localStorage.setItem("token", response.data.token);

      // Redirect to the homepage or dashboard
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed");
      console.error("Error during login:", error);
    } finally {
      setLoading(false); // Set loading to false once the request is complete
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-6">
        {loading && <Loader loading={loading}/>}
      <div className="w-full max-w-2xl mt-20 bg-white p-12 rounded-lg shadow-lg">
        <div className="text-center">
          <img
            className="mx-auto h-44 w-auto"
            src={Logo}
            alt="Your Company"
          />
          <h2 className="mt-1 text-4xl font-bold text-gray-900">
            Sign in to your account
          </h2>
        </div>

        <div className="mt-10">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            <div>
              <label htmlFor="email" className="block text-lg font-medium text-gray-900">
                Email address
              </label>
              <div className="mt-2">
                <input
                  type="email"
                  name="email"
                  id="email"
                  autoComplete="email"
                  {...register("email")}
                  className={`block w-full rounded-lg bg-white px-4 py-3 text-lg text-gray-900 border ${errors.email ? "border-red-500" : "border-gray-300"} placeholder-gray-400 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600`}
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-2">{errors.email.message}</p>
                )}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-lg font-medium text-gray-900">
                  Password
                </label>
                <div className="text-md">
                  <a href="#" className="font-semibold text-indigo-600 hover:text-indigo-500">
                    Forgot password?
                  </a>
                </div>
              </div>
              <div className="mt-2">
                <input
                  type="password"
                  name="password"
                  id="password"
                  autoComplete="current-password"
                  {...register("password")}
                  className={`block w-full rounded-lg bg-white px-4 py-3 text-lg text-gray-900 border ${errors.password ? "border-red-500" : "border-gray-300"} placeholder-gray-400 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600`}
                />
                {errors.password && (
                  <p className="text-red-500 text-sm mt-2">{errors.password.message}</p>
                )}
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}  // Disable button while loading
                className={`w-full rounded-lg ${loading ? 'bg-gray-400' : 'bg-indigo-600'} px-6 py-3 text-xl font-semibold text-white shadow-md hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-600`}
              >         
                  Sign in   
              </button>
            </div>
          </form>

          <p className="mt-10 text-center text-lg text-gray-500">
            Not a member?{" "}
            <Link to="/signup" className="font-semibold text-indigo-600 hover:text-indigo-500">
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
