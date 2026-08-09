import { useState } from "react";
import { createWorker } from "../services/workerService";

export default function AddWorker() {
  const [form, setForm] = useState({
    fullName: "",
    idNumber: "",
    phone: "",
    password: "",
    confirmPassword: "",
    role: "Technician",
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async () => {
    if (form.password !== form.confirmPassword) {
      return alert("Passwords do not match");
    }

    try {
      await createWorker({
        fullName: form.fullName,
        idNumber: form.idNumber,
        phone: form.phone,
        password: form.password,
        role: form.role,
      });

      alert("Worker created successfully");

      setForm({
        fullName: "",
        idNumber: "",
        phone: "",
        password: "",
        confirmPassword: "",
        role: "Technician",
      });
    } catch (err) {
      alert(
        err.response?.data?.message ||
          "Failed to create worker"
      );
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">

      <div className="max-w-xl mx-auto bg-slate-900 p-6 rounded-xl border border-white/10">

        <h1 className="text-3xl font-bold mb-6">
          Add New Worker
        </h1>

        <input
          className="w-full p-3 rounded bg-slate-800 mb-4"
          placeholder="Full Name"
          name="fullName"
          value={form.fullName}
          onChange={handleChange}
        />

        <input
          className="w-full p-3 rounded bg-slate-800 mb-4"
          placeholder="National ID"
          name="idNumber"
          value={form.idNumber}
          onChange={handleChange}
        />

        <input
          className="w-full p-3 rounded bg-slate-800 mb-4"
          placeholder="Phone Number"
          name="phone"
          value={form.phone}
          onChange={handleChange}
        />

        <input
          type="password"
          className="w-full p-3 rounded bg-slate-800 mb-4"
          placeholder="Password"
          name="password"
          value={form.password}
          onChange={handleChange}
        />

        <input
          type="password"
          className="w-full p-3 rounded bg-slate-800 mb-4"
          placeholder="Confirm Password"
          name="confirmPassword"
          value={form.confirmPassword}
          onChange={handleChange}
        />

        <select
          className="w-full p-3 rounded bg-slate-800 mb-6"
          name="role"
          value={form.role}
          onChange={handleChange}
        >
          <option>Administrator</option>
          <option>Production Manager</option>
          <option>Technician</option>
          <option>Veterinarian</option>
          <option>Customer Support</option>
          <option>Sales</option>
        </select>

        <button
          onClick={handleSubmit}
          className="w-full bg-blue-600 hover:bg-blue-700 p-3 rounded-lg font-semibold"
        >
          Create Worker
        </button>

      </div>

    </div>
  );
}