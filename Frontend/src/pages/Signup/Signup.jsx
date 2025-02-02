import React from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { toast } from "react-hot-toast";
import Logo from "../../assets/logo.png";
import axios from "axios";

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
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(validationSchema),
  });

  const onSubmit = async (data) => {
    try {
      const response = await axios.post('http://localhost:4000/api/auth/signup', data);
      toast.success(response.data.message);
      console.log("User registered:", response.data);

      // Optionally, you can store the token in localStorage or cookies for authentication
      localStorage.setItem("token", response.data.token);
      // Redirect to login or home page
      window.location.href = '/login';
    } catch (error) {
      toast.error(error.response?.data?.message || "Registration failed");
      console.error("Error during registration:", error);
    }
  };

  return (
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
              { label: "Full Name", id: "fullName", type: "text" },
              { label: "Email Address", id: "email", type: "email" },
              { label: "Password", id: "password", type: "password" },
              { label: "Confirm Password", id: "confirmPassword", type: "password" },
              { label: "Company (Optional)", id: "company", type: "text" },
            ].map(({ label, id, type }) => (
              <div key={id}>
                <label
                  htmlFor={id}
                  className="block text-lg font-medium text-[#2067a5]"
                >
                  {label}
                </label>
                <div className="mt-2">
                  <input
                    type={type}
                    id={id}
                    name={id}
                    {...register(id)}
                    className={`block w-full rounded-lg bg-white px-4 py-3 text-lg text-gray-900 border border-[#58a9f8] placeholder-[#58a9f8] focus:border-[#2067a5] focus:ring-2 focus:ring-[#2067a5] ${
                      errors[id] ? "border-red-500" : ""
                    }`}
                  />
                  {errors[id] && (
                    <p className="text-red-500 text-sm mt-2">{errors[id]?.message}</p>
                  )}
                </div>
              </div>
            ))}

            <div>
              <button
                type="submit"
                className="w-full rounded-lg bg-[#2067a5] px-6 py-3 text-xl font-semibold text-white shadow-md hover:bg-[#58a9f8] focus:outline-none focus:ring-2 focus:ring-[#2067a5]"
              >
                Sign Up
              </button>
            </div>
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
  );
};

export default SignUp;
