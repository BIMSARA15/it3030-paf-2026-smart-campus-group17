import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { UserPlus, Mail, Phone, User, Wrench, ShieldAlert } from 'lucide-react';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import InputField from '../../components/auth/InputField';

export default function AdminTechnicians() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [technicians, setTechnicians] = useState([]);
  const [showModal, setShowModal] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [statusMessage, setStatusMessage] = useState({ type: "", text: "" });


 // Fetch the pool on load (Best Practice: Define inside the effect)
  useEffect(() => {
    let isMounted = true; // Safety check to prevent updates if user navigates away

    const loadTechnicians = async () => {
      try {
        const response = await axios.get("http://localhost:8080/api/admin/technicians");
        if (isMounted) {
          setTechnicians(response.data);
        }
      } catch (error) {
        console.error("Failed to load technicians:", error);
      }
    };

    loadTechnicians();

    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, []);

  const handleProvision = async (e) => {
    e.preventDefault();
    setStatusMessage({ type: "loading", text: "Provisioning..." });

    try {
      // 1. Add the new technician
      await axios.post("http://localhost:8080/api/admin/provision-technician", {
        name, email, phoneNumber
      });
      
      setStatusMessage({ type: "success", text: "Technician added successfully!" });
      setName(""); setEmail(""); setPhoneNumber("");
      
      // 2. Refresh the table (Directly re-fetch the data here!)
      const response = await axios.get("http://localhost:8080/api/admin/technicians");
      setTechnicians(response.data);
      
      // Close modal after success
      setTimeout(() => {
        setShowModal(false);
        setStatusMessage({ type: "", text: "" });
      }, 1500);
    } catch (error) {
      setStatusMessage({ 
        type: "error", 
        text: error.response?.data || "Failed to provision technician." 
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
        <Header />

        <div className="p-4 lg:p-6 space-y-6">
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="text-gray-900 text-2xl font-semibold">Technician Management</h1>
              <p className="text-gray-500 text-sm mt-0.5">Manage the authorized staff pool</p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white hover:bg-blue-700 shadow-sm rounded-xl transition-all text-sm font-medium"
            >
              <UserPlus className="w-4 h-4" />
              Add Technician
            </button>
          </div>

          {/* Technicians Table */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="p-5 border-b border-gray-100 flex items-center gap-2">
              <Wrench className="w-5 h-5 text-slate-400" />
              <h3 className="text-gray-900 font-medium">Authorized Technician Pool</h3>
            </div>
            
            {technicians.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <ShieldAlert className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p>No technicians found. Add a technician to grant them Microsoft Login access.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50 border-b border-gray-100">
                      <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Email Address</th>
                      <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Phone Number</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {technicians.map((tech) => (
                      <tr key={tech.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">
                              {tech.name.charAt(0).toUpperCase()}
                            </div>
                            <span className="font-medium text-gray-900">{tech.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">{tech.email}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{tech.phoneNumber || "N/A"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Technician Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
            <div className="p-6">
              <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700">✕</button>
              
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-800">Provision Technician</h2>
                  <p className="text-xs text-slate-500">Grant Microsoft login access</p>
                </div>
              </div>

              <form onSubmit={handleProvision} className="space-y-4">
                <InputField id="techName" label="Staff Name" type="text" value={name} onChange={setName} placeholder="e.g. Jane Doe" icon={User} />
                <InputField id="techEmail" label="University Email" type="email" value={email} onChange={setEmail} placeholder="staff@university.edu" icon={Mail} />
                <InputField id="techPhone" label="Phone Number" type="tel" value={phoneNumber} onChange={setPhoneNumber} placeholder="+94 77 123 4567" icon={Phone} />

                {statusMessage.text && (
                  <p className={`text-sm font-medium ${statusMessage.type === 'error' ? 'text-red-500' : 'text-emerald-500'}`}>
                    {statusMessage.text}
                  </p>
                )}

                <button type="submit" disabled={!email || statusMessage.type === 'loading'} className="w-full py-3 mt-2 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50">
                  Add to Authorized Pool
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}