"use client";
import { useForm, SubmitHandler } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface RegisterFormInputs {
  username: string;
  email: string;
  password: string;
  retypePassword: string;
}

export default function Register() {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormInputs>();
  const router = useRouter();
  const [registrationError, setRegistrationError] = useState<string | null>(
    null
  );

  const onSubmit: SubmitHandler<RegisterFormInputs> = async (data) => {
    setRegistrationError(null); 

    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: data.username,
        email: data.email,
        password: data.password,
        retype_password: data.retypePassword,
      }),
    });

    if (response.ok) {
      router.push("/login"); 
    } else {
      const errorData = await response.json();
      setRegistrationError(
        errorData.error || "Registration failed. Please try again."
      );
    }
  };

  // Password match validation
  const password = watch("password");

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="max-w-md w-full bg-white p-8 shadow-lg rounded-lg space-y-6"
      >
        <h2 className="text-2xl font-bold text-gray-700 text-center">
          Register
        </h2>

        {registrationError && (
          <p className="text-red-500 text-sm text-center">
            {registrationError}
          </p>
        )}

        <div>
          <label
            htmlFor="username"
            className="block text-sm font-medium text-gray-700"
          >
            Username
          </label>
          <input
            id="username"
            type="text"
            {...register("username", { required: "Username is required" })}
            className={`mt-1 block w-full border p-2 ${
              errors.username ? "border-red-500" : "border-gray-300"
            } rounded-md shadow-sm focus:outline-none focus:ring-2 ${
              errors.username ? "focus:ring-red-500" : "focus:ring-blue-500"
            }`}
          />
          {errors.username && (
            <p className="text-red-500 text-sm mt-1">
              {errors.username.message}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            {...register("email", { required: "Email is required" })}
            className={`mt-1 block w-full border p-2 ${
              errors.email ? "border-red-500" : "border-gray-300"
            } rounded-md shadow-sm focus:outline-none focus:ring-2 ${
              errors.email ? "focus:ring-red-500" : "focus:ring-blue-500"
            }`}
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700"
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            {...register("password", { required: "Password is required" })}
            className={`mt-1 block w-full border p-2 ${
              errors.password ? "border-red-500" : "border-gray-300"
            } rounded-md shadow-sm focus:outline-none focus:ring-2 ${
              errors.password ? "focus:ring-red-500" : "focus:ring-blue-500"
            }`}
          />
          {errors.password && (
            <p className="text-red-500 text-sm mt-1">
              {errors.password.message}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="retypePassword"
            className="block text-sm font-medium text-gray-700"
          >
            Retype Password
          </label>
          <input
            id="retypePassword"
            type="password"
            {...register("retypePassword", {
              required: "Please confirm your password",
              validate: (value) =>
                value === password || "Passwords do not match",
            })}
            className={`mt-1 block w-full border p-2 ${
              errors.retypePassword ? "border-red-500" : "border-gray-300"
            } rounded-md shadow-sm focus:outline-none focus:ring-2 ${
              errors.retypePassword
                ? "focus:ring-red-500"
                : "focus:ring-blue-500"
            }`}
          />
          {errors.retypePassword && (
            <p className="text-red-500 text-sm mt-1">
              {errors.retypePassword.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          className="w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Register
        </button>
      </form>
    </div>
  );
}
