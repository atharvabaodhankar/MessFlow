import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";
import { db } from "../firebase";
import { 
  collection, 
  addDoc, 
  getDocs, 
  deleteDoc, 
  doc, 
  query, 
  where,
  Timestamp 
} from "firebase/firestore";
import { useAuth } from "../contexts/AuthContext";
import { PlusIcon, TrashIcon, CurrencyRupeeIcon } from "@heroicons/react/24/outline";

export default function Plans() {
  const { currentUser } = useAuth();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form State
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (currentUser) {
      fetchPlans();
    }
  }, [currentUser]);

  async function fetchPlans() {
    try {
      const q = query(collection(db, "plans"), where("messId", "==", currentUser.uid));
      const querySnapshot = await getDocs(q);
      const plansList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setPlans(plansList);
    } catch (error) {
      console.error("Error fetching plans:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      await addDoc(collection(db, "plans"), {
        messId: currentUser.uid,
        name,
        price: Number(price),
        description,
        createdAt: Timestamp.now()
      });

      closeModal();
      fetchPlans();
    } catch (error) {
      console.error("Error saving plan:", error);
    }
  }

  async function handleDelete(id) {
    if (window.confirm("तुम्हाला खात्री आहे की तुम्ही हा प्लॅन काढू इच्छिता?")) {
      try {
        await deleteDoc(doc(db, "plans", id));
        fetchPlans();
      } catch (error) {
        console.error("Error deleting plan:", error);
      }
    }
  }

  function closeModal() {
    setIsModalOpen(false);
    setName("");
    setPrice("");
    setDescription("");
  }

  return (
    <Layout>
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">मेस प्लॅन्स (Meal Plans)</h1>
          <p className="mt-2 text-sm text-gray-700">
            तुमचे जेवणाचे प्लॅन आणि त्यांच्या किंमती व्यवस्थापित करा.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-rose-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 sm:w-auto"
          >
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
            नवीन प्लॅन जोडा
          </button>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {plans.map((plan) => (
          <div key={plan.id} className="relative flex items-center space-x-3 rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm focus-within:ring-2 focus-within:ring-rose-500 focus-within:ring-offset-2 hover:border-gray-400">
            <div className="flex-shrink-0">
              <div className="h-10 w-10 rounded-full bg-rose-100 flex items-center justify-center text-rose-600">
                <CurrencyRupeeIcon className="h-6 w-6" />
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <a href="#" className="focus:outline-none">
                <span className="absolute inset-0" aria-hidden="true" />
                <p className="text-sm font-medium text-gray-900">{plan.name}</p>
                <p className="truncate text-sm text-gray-500">₹{plan.price} / महिना</p>
                {plan.description && <p className="truncate text-xs text-gray-400">{plan.description}</p>}
              </a>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation(); // Prevent card click
                handleDelete(plan.id);
              }}
              className="z-10 text-gray-400 hover:text-red-500"
            >
              <TrashIcon className="h-5 w-5" />
            </button>
          </div>
        ))}
        {plans.length === 0 && !loading && (
          <div className="col-span-full text-center py-10 text-gray-500">
            अद्याप कोणतेही प्लॅन जोडलेले नाहीत.
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={closeModal}></div>

            <div className="relative transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
              <div>
                <h3 className="text-lg font-medium leading-6 text-gray-900">
                  नवीन मेस प्लॅन जोडा
                </h3>
                <form onSubmit={handleSubmit} className="mt-5 space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                      प्लॅनचे नाव (उदा. 1 टाइम जेवण)
                    </label>
                    <input
                      type="text"
                      name="name"
                      id="name"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-rose-500 focus:ring-rose-500 sm:text-sm border p-2"
                    />
                  </div>
                  <div>
                    <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                      किंमत (महिन्यासाठी)
                    </label>
                    <div className="relative mt-1 rounded-md shadow-sm">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <span className="text-gray-500 sm:text-sm">₹</span>
                      </div>
                      <input
                        type="number"
                        name="price"
                        id="price"
                        required
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        className="block w-full rounded-md border-gray-300 pl-7 pr-12 focus:border-rose-500 focus:ring-rose-500 sm:text-sm border p-2"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                      वर्णन (ऐच्छिक)
                    </label>
                    <textarea
                      name="description"
                      id="description"
                      rows={3}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-rose-500 focus:ring-rose-500 sm:text-sm border p-2"
                    />
                  </div>
                  <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
                    <button
                      type="submit"
                      className="inline-flex w-full justify-center rounded-md border border-transparent bg-rose-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 sm:col-start-2 sm:text-sm"
                    >
                      जतन करा
                    </button>
                    <button
                      type="button"
                      onClick={closeModal}
                      className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 sm:col-start-1 sm:mt-0 sm:text-sm"
                    >
                      रद्द करा
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
