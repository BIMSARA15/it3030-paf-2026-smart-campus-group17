import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import InputField from "../components/auth/InputField";
import SelectField from "../components/auth/SelectField";
import { User, Phone, Building2, BookOpen, Calendar } from "lucide-react";

export default function CompleteProfile() {
  const { user } = useAuth();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [faculty, setFaculty] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [currentSemester, setCurrentSemester] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:8080/api/auth/complete-profile", {
        phoneNumber,
        faculty,
        specialization,
        currentSemester
      });
      // Force a hard reload to update the session and clear the 'incomplete' flag
      window.location.href = "/";
    } catch (error) {
      console.error("Failed to update profile", error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-6">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Complete Your Profile</h2>
        <p className="text-slate-500 mb-6 text-sm">
          Welcome, {user?.name}! We just need a few more details to set up your university account.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <InputField
            id="phoneNumber" label="Phone Number" type="tel"
            value={phoneNumber} onChange={setPhoneNumber}
            placeholder="e.g. +94 77 123 4567" icon={Phone}
          />
          
          <SelectField
            id="faculty" label="Faculty"
            value={faculty} onChange={setFaculty} icon={Building2}
            options={[
              { value: "Computing", label: "Faculty of Computing" },
              { value: "Business", label: "Faculty of Business" },
              { value: "Engineering", label: "Faculty of Engineering" }
            ]}
          />
          <InputField
            id="specialization" label="Specialization" type="text"
            value={specialization} onChange={setSpecialization}
            placeholder="e.g. Software Engineering" icon={BookOpen}
          />

          <SelectField
            id="currentSemester" label="Current Semester"
            value={currentSemester} onChange={setCurrentSemester} icon={Calendar}
            options={[
              { value: "Y1S1", label: "Year 1 Semester 1" },
              { value: "Y3S2", label: "Year 3 Semester 2" }
              // Add remaining semesters...
            ]}
          />

          <button
            type="submit"
            className="w-full mt-6 bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-colors"
          >
            Save and Continue
          </button>
        </form>
      </div>
    </div>
  );
}