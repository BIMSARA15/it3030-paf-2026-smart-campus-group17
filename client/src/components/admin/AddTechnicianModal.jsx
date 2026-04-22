import { useState } from "react";
import axios from "axios";
import { UserPlus, Mail, User } from "lucide-react";
import InputField from "../../components/auth/InputField"; // Reusing your awesome auth inputs!

export default function AddTechnicianForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [statusMessage, setStatusMessage] = useState({ type: "", text: "" });

  const handleProvision = async (e) => {
    e.preventDefault();
    setStatusMessage({ type: "loading", text: "Provisioning..." });

    try {
      const response = await axios.post("http://localhost:8080/api/admin/provision-technician", {
        name: name,
        email: email
      });
      setStatusMessage({ type: "success", text: response.data });
      setName("");
      setEmail("");
    } catch (error) {
      setStatusMessage({ 
        type: "error", 
        text: error.response?.data || "Failed to provision technician." 
      });
    }
  };

  return (
    <div className="p-6 bg-white rounded-2xl shadow-sm border border-slate-100 max-w-md">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
          <UserPlus className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-800">Provision Technician</h2>
          <p className="text-xs text-slate-500">Add a staff member to the email pool</p>
        </div>
      </div>

      <form onSubmit={handleProvision} className="space-y-4">
        <InputField 
          id="techName" label="Staff Name" type="text" 
          value={name} onChange={setName} 
          placeholder="e.g. Jane Doe" icon={User} 
        />
        
        <InputField 
          id="techEmail" label="University Email" type="email" 
          value={email} onChange={setEmail} 
          placeholder="staff@university.edu" icon={Mail} 
        />

        {statusMessage.text && (
          <p className={`text-sm font-medium ${statusMessage.type === 'error' ? 'text-red-500' : 'text-emerald-500'}`}>
            {statusMessage.text}
          </p>
        )}

        <button 
          type="submit" 
          disabled={!email || statusMessage.type === 'loading'}
          className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          Add to Authorized Pool
        </button>
      </form>
    </div>
  );
}