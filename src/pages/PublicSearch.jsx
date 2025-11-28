import React, { useState } from "react";
import { db } from "../firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { MagnifyingGlassIcon } from "@heroicons/react/24/solid";
import { Link } from "react-router-dom";

export default function PublicSearch() {
  const [mobile, setMobile] = useState("");
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSearch(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setCustomer(null);

    try {
      const q = query(collection(db, "customers"), where("mobile", "==", mobile));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setError("ग्राहक सापडला नाही. कृपया मोबाईल नंबर तपासा.");
      } else {
        // Assuming mobile is unique or taking the first match
        const doc = querySnapshot.docs[0];
        setCustomer({ id: doc.id, ...doc.data() });
      }
    } catch (err) {
      console.error(err);
      setError("काहीतरी चूक झाली. कृपया पुन्हा प्रयत्न करा.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
          मेस सबस्क्रिप्शन तपासा
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          तुमचा मोबाईल नंबर टाकून तुमच्या मेसची माहिती मिळवा
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSearch}>
            <div>
              <label htmlFor="mobile" className="block text-sm font-medium text-gray-700">
                मोबाईल नंबर
              </label>
              <div className="mt-1">
                <input
                  id="mobile"
                  name="mobile"
                  type="tel"
                  required
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-rose-500 focus:outline-none focus:ring-rose-500 sm:text-sm"
                  placeholder="9876543210"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="flex w-full justify-center rounded-md border border-transparent bg-rose-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2"
              >
                {loading ? "शोधत आहे..." : "शोधा"}
              </button>
            </div>
          </form>

          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
              {error}
            </div>
          )}

          {customer && (
            <div className="mt-6 border-t border-gray-200 pt-6">
              <h3 className="text-lg font-medium leading-6 text-gray-900">ग्राहक माहिती</h3>
              <dl className="mt-4 grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">नाव</dt>
                  <dd className="mt-1 text-sm text-gray-900">{customer.name}</dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">स्थिती</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                      customer.status === 'active' ? 'bg-green-100 text-green-800' : 
                      customer.status === 'expiring' ? 'bg-yellow-100 text-yellow-800' : 
                      'bg-red-100 text-red-800'
                    }`}>
                      {customer.status === 'active' ? 'सक्रिय' : customer.status === 'expiring' ? 'संपत आले' : 'संपले'}
                    </span>
                  </dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">सुरुवात तारीख</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {customer.startDate.toDate().toLocaleDateString('mr-IN')}
                  </dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">शेवटची तारीख</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {customer.endDate.toDate().toLocaleDateString('mr-IN')}
                  </dd>
                </div>
              </dl>
            </div>
          )}
          
          <div className="mt-6 text-center">
             <Link to="/login" className="text-sm text-rose-600 hover:text-rose-500">
               मेस मालक आहात? येथे लॉगिन करा
             </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
