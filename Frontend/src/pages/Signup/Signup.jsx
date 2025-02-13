import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { toast } from "react-hot-toast";
import Logo from "../../assets/logo.png";
import axios from "axios";
import Loader from "../../Components/Loading";
import { api } from "../../api/api";
import { useNavigate } from 'react-router-dom';

// Validation schema using Yup
const validationSchema = Yup.object({
  fullName: Yup.string().required("Full Name is required"),
  email: Yup.string().email("Invalid email address").required("Email is required"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password"), null], "Passwords must match")
    .required("Confirm Password is required"),
  company: Yup.string(),
});

const SignUp = () => {
  // Setup React Hook Form
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(validationSchema),
  });
const [loading, setLoading] = useState(false)
  const onSubmit = async (data) => {
    setLoading(true)
    try {
      const response = await api.post('/auth/signup', data);
      toast.success(response.data.message);
      console.log("User registered:", response.data);

      // Optionally, you can store the token in localStorage or cookies for authentication
      localStorage.setItem("token", response.data.token);
      // Redirect to login or home page
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || "Registration failed");
      console.error("Error during registration:", error);
    }finally{
      setLoading(false)
    }
  };

  return (
    <>  
    {loading && <Loader loading={loading}/>}
    <div className="flex min-h-full items-center justify-center bg-gray-100 p-6">
      
      <div className="w-full max-w-2xl mt-20 bg-white p-12 rounded-lg shadow-lg">
        <div className="text-center">
          <img className="mx-auto h-44 w-auto" src={Logo} alt="Your Company" />
          <h2 className="mt-1 text-4xl font-bold text-[#2067a5]">
            Create Your Account
          </h2>
        </div>

        <div className="mt-10">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
  {[
    { label: "First Name", name: "firstName", type: "text" },
    { label: "Last Name", name: "lastName", type: "text" },
    { label: "Phone Number", name: "phoneNumber", type: "text" },
    { label: "Sector", name: "sector", type: "text" },
    { label: "Industry", name: "industry", type: "text" },
    { label: "Company Size", name: "companySize", type: "number" },
    { label: "Company Address", name: "companyAddress", type: "text" },
    { label: "Email", name: "email", type: "email" },
    { label: "Password", name: "password", type: "password" },
  ].map(({ label, name, type }) => (
    <div key={name}>
      <label htmlFor={name} className="block text-lg font-medium text-gray-900">
        {label}
      </label>
      <div className="mt-2">
        <input
          type={type}
          id={name}
          {...register(name)}
          className={`block w-full rounded-lg bg-white px-4 py-3 text-lg text-gray-900 border 
            ${errors[name] ? "border-red-500" : "border-gray-300"} 
            placeholder-gray-400 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600`}
        />
        {errors[name] && (
          <p className="text-red-500 text-sm mt-2">{errors[name].message}</p>
        )}
      </div>
    </div>
  ))}

  <button
    type="submit"
    className="w-full mt-4 bg-indigo-600 text-white py-3 px-6 rounded-lg text-lg font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-600"
  >
    Sign In
  </button>
</form>


          <p className="mt-10 text-center text-lg text-gray-500">
            Already have an account?{" "}
            <a href="#" className="font-semibold text-[#58a9f8] hover:text-[#2067a5]">
              Sign in
            </a>
          </p>
        </div>
      </div>
    </div>
    </>
  );
};

export default SignUp;
