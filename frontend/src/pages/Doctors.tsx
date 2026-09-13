import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";
import { Search, MapPin, Phone, Clock, Star, Heart, Calendar, AlertCircle, Navigation, Shield, X, Check } from "lucide-react";
import { apiClient } from "../api/client";
import { Doctor } from "../types";
import { motion, AnimatePresence } from "framer-motion";

import { STATE_MAP_DATA } from "./india_map_constant";

const ACTIVE_STATES = [
  "Gujarat", "Maharashtra", "Delhi", "Karnataka", "Tamil Nadu", 
  "Chandigarh", "Haryana", "Telangana", "West Bengal", "Puducherry", 
  "Rajasthan", "Madhya Pradesh", "Uttar Pradesh", "Kerala"
];

const POPULAR_CITIES = [
  { name: "Ahmedabad", state: "Gujarat" },
  { name: "Mumbai", state: "Maharashtra" },
  { name: "Delhi", state: "Delhi" },
  { name: "Bengaluru", state: "Karnataka" },
  { name: "Pune", state: "Maharashtra" },
  { name: "Surat", state: "Gujarat" },
  { name: "Hyderabad", state: "Telangana" },
  { name: "Indore", state: "Madhya Pradesh" },
  { name: "Kochi", state: "Kerala" },
  { name: "Lucknow", state: "Uttar Pradesh" },
];

const SUGGESTED_CITIES = [
  "Ahmedabad", "Anand", "Bengaluru", "Bhopal", "Delhi", "Hyderabad", "Indore", "Junagadh", 
  "Karamsad", "Kochi", "Lucknow", "Mehsana", "Mumbai", "Navsari", "Patan", "Pune", 
  "Surat", "Thiruvananthapuram", "Vadnagar", "Valsad"
];

export default function Doctors() {
  const { t } = useTranslation();
  const locationState = useLocation().state as { city?: string } | null;

  const [activeTab, setActiveTab] = useState<"doctors" | "hospitals">("doctors");
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [hospitals, setHospitals] = useState<any[]>([]);
  const [city, setCity] = useState(locationState?.city || "");
  const [selectedState, setSelectedState] = useState<string>("");
  const [showCitySuggestions, setShowCitySuggestions] = useState(false);
  
  // Favorites and Appointments
  const [favorites, setFavorites] = useState<string[]>([]);
  const [showAppointmentModal, setShowAppointmentModal] = useState<any | null>(null);
  const [appointmentForm, setAppointmentForm] = useState({
    patientName: "",
    phone: "",
    date: "",
    time: "",
    notes: "",
  });
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setShowCitySuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    // Load favorites from localStorage
    const saved = localStorage.getItem("favorite_doctors");
    if (saved) setFavorites(JSON.parse(saved));
  }, []);

  useEffect(() => {
    // Fetch doctors
    const params: any = {};
    if (city) params.city = city;
    else if (selectedState) params.state = selectedState;

    apiClient.get<Doctor[]>("/doctors", { params }).then((res) => setDoctors(res.data))
      .catch(err => console.error("Error fetching doctors list:", err));
  }, [city, selectedState]);

  useEffect(() => {
    // Fetch hospitals
    const params: any = {};
    if (city) params.city = city;
    else if (selectedState) params.state = selectedState;

    apiClient.get<any[]>("/doctors/hospitals", { params }).then((res) => setHospitals(res.data))
      .catch(err => console.error("Error fetching hospitals list:", err));
  }, [city, selectedState]);

  function handleToggleFavorite(e: React.MouseEvent, docId: string) {
    e.preventDefault();
    e.stopPropagation();
    if (!docId) return;

    setFavorites((prev) => {
      const isFav = prev.includes(docId);
      const updated = isFav ? prev.filter((id) => id !== docId) : Array.from(new Set([...prev, docId]));
      localStorage.setItem("favorite_doctors", JSON.stringify(updated));

      if (isFav) {
        apiClient.delete(`/doctors/favorites/${docId}`).catch(err => console.error(err));
      } else {
        apiClient.post(`/doctors/favorites/${docId}`).catch(err => console.error(err));
      }
      return updated;
    });
  }

  function handleBookAppointment(e: React.FormEvent) {
    e.preventDefault();
    if (!showAppointmentModal) return;

    const newAppt = {
      id: `appt_${Date.now()}`,
      providerId: showAppointmentModal.id,
      providerName: showAppointmentModal.name,
      providerType: activeTab,
      clinic: showAppointmentModal.clinic_name || showAppointmentModal.address,
      city: showAppointmentModal.city,
      ...appointmentForm,
      status: "Confirmed",
      created_at: new Date().toISOString(),
    };

    // Save in localStorage
    const current = localStorage.getItem("appointments");
    const list = current ? JSON.parse(current) : [];
    list.push(newAppt);
    localStorage.setItem("appointments", JSON.stringify(list));

    setBookingSuccess(true);
    setTimeout(() => {
      setBookingSuccess(false);
      setShowAppointmentModal(null);
      setAppointmentForm({ patientName: "", phone: "", date: "", time: "", notes: "" });
    }, 2000);
  }

  return (
    <div className="relative z-10 mx-auto mt-6 max-w-6xl px-6 pb-20 font-body text-[var(--brand-text)] transition-colors duration-300">
      
      {/* Header */}
      <div className="border-b border-[var(--brand-border)] pb-6 mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] text-xs font-bold mb-3 border border-[var(--brand-primary)]/20">
          <Shield size={13} /> {t('dashboard.top_specialists') || "Clinical Directory"}
        </div>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-[var(--brand-text)]">Healthcare Directory</h1>
        <p className="mt-1.5 text-[var(--brand-text-muted)] text-sm max-w-2xl">
          Locate licensed dermatologists, specialized skin clinics, and clinical resources across Indian states.
        </p>
      </div>

      {/* Grid Layout */}
      <div className="grid gap-8 md:grid-cols-12">
        
        {/* Left column: Search and Interactive Map (span-4) */}
        <div className="md:col-span-4 space-y-6">
          
          {/* Search filters */}
          <div className="bg-[var(--brand-surface)] border-2 border-[var(--brand-border)] rounded-[2.5rem] p-5 shadow-sm space-y-4">
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-[var(--brand-text-muted)]">Location Filters</h3>
            
            <div className="space-y-4">
              <div className="relative" ref={suggestionsRef}>
                <div className="flex items-center bg-[var(--brand-surface-elevated)] border-2 border-[var(--brand-border)] rounded-2xl px-3.5 py-2.5 shadow-xs focus-within:border-[var(--brand-primary)] focus-within:ring-4 focus-within:ring-[var(--brand-primary)]/10 transition">
                  <Search className="text-[var(--brand-text-muted)] shrink-0 mr-2.5 pointer-events-none" size={16} />
                  <input
                    placeholder="Search by city (e.g. Mumbai)"
                    value={city}
                    onChange={(e) => {
                      setCity(e.target.value);
                      setSelectedState("");
                    }}
                    onFocus={() => setShowCitySuggestions(true)}
                    className="w-full bg-transparent text-xs outline-none text-[var(--brand-text)] placeholder-[var(--brand-text-muted)]"
                  />
                </div>

                {showCitySuggestions && (
                  <div className="absolute z-50 left-0 right-0 mt-2 p-3 bg-[var(--brand-surface)] border-2 border-[var(--brand-border)] rounded-2xl shadow-xl max-h-60 overflow-y-auto">
                    {city.trim() === "" ? (
                      <div>
                        <p className="text-[9px] font-bold text-[var(--brand-text-muted)] uppercase tracking-wider mb-2">Suggested Cities</p>
                        <div className="grid grid-cols-2 gap-1.5">
                          {POPULAR_CITIES.map((item) => (
                            <button
                              key={item.name}
                              type="button"
                              onClick={() => {
                                setCity(item.name);
                                setSelectedState(item.state);
                                setShowCitySuggestions(false);
                              }}
                              className="text-left px-2.5 py-1.5 text-[10px] rounded-xl bg-[var(--brand-surface-elevated)] hover:bg-[var(--brand-primary)]/10 text-[var(--brand-text)] border border-[var(--brand-border)] hover:border-[var(--brand-primary)]/30 transition-all font-medium"
                            >
                              {item.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : (
                      (() => {
                        const filteredCities = SUGGESTED_CITIES.filter(c => 
                          c.toLowerCase().includes(city.toLowerCase()) && c.toLowerCase() !== city.toLowerCase()
                        );
                        return filteredCities.length > 0 ? (
                          <div className="space-y-1">
                            <p className="text-[9px] font-bold text-[var(--brand-text-muted)] uppercase tracking-wider mb-2">Suggested Matches</p>
                            {filteredCities.map((cityName) => (
                              <button
                                key={cityName}
                                type="button"
                                onClick={() => {
                                  setCity(cityName);
                                  const stateObj = POPULAR_CITIES.find(pc => pc.name === cityName);
                                  if (stateObj) setSelectedState(stateObj.state);
                                  setShowCitySuggestions(false);
                                }}
                                className="w-full text-left px-2.5 py-2 text-xs rounded-xl hover:bg-[var(--brand-surface-elevated)] text-[var(--brand-text)] transition-colors"
                              >
                                {cityName}
                              </button>
                            ))}
                          </div>
                        ) : (
                          <p className="text-[10px] text-[var(--brand-text-muted)] text-center py-2">No suggested cities match</p>
                        );
                      })()
                    )}
                  </div>
                )}
              </div>
              
              <div>
                <label className="block text-[9px] font-bold text-[var(--brand-text-muted)] uppercase mb-1.5 ml-1">State Selection</label>
                <select
                  value={selectedState}
                  onChange={(e) => {
                    setSelectedState(e.target.value);
                    setCity("");
                  }}
                  className="w-full rounded-2xl border-2 border-[var(--brand-border)] p-2.5 text-xs outline-none focus:border-[var(--brand-primary)] bg-[var(--brand-surface-elevated)] text-[var(--brand-text)] transition cursor-pointer"
                >
                  <option value="">All States</option>
                  {ACTIVE_STATES.map((stateName) => (
                    <option key={stateName} value={stateName}>{stateName}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Interactive State Map */}
          <div className="bg-[var(--brand-surface)] border-2 border-[var(--brand-border)] rounded-[2.5rem] p-5 shadow-sm space-y-3">
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-[var(--brand-text-muted)]">Interactive States</h3>
            
            <div className="flex items-center justify-center bg-gradient-to-b from-[var(--brand-primary)]/5 to-[var(--brand-secondary)]/10 rounded-3xl border-2 border-[var(--brand-border)] p-4 h-64 shadow-inner overflow-hidden">
              <svg viewBox="0 0 612 696" className="w-full h-full max-h-56 filter drop-shadow-md">
                {STATE_MAP_DATA.map((state) => {
                  const isActive = ACTIVE_STATES.includes(state.id);
                  const isSelected = selectedState === state.id;
                  return (
                    <motion.path
                      key={state.id}
                      d={state.path}
                      stroke={isSelected ? "#0F766E" : isActive ? "#0D9488" : "#94A3B8"}
                      strokeWidth={isSelected ? "1.8" : "1"}
                      fill={
                        isSelected 
                          ? "#0D9488" 
                          : isActive 
                            ? "#CCFBF1" 
                            : "#F1F5F9"
                      }
                      className={`transition-colors duration-200 cursor-pointer ${
                        isSelected 
                          ? "dark:fill-[#14B8A6] dark:stroke-[#34D399]" 
                          : isActive 
                            ? "hover:fill-[#99F6E4] dark:fill-[#134E48] dark:stroke-[#2DD4BF] dark:hover:fill-[#115E59]" 
                            : "hover:fill-[#E2E8F0] dark:fill-[#1E293B] dark:stroke-[#475569] dark:hover:fill-[#334155]"
                      }`}
                      whileHover={{ scale: 1.015 }}
                      onClick={() => {
                        setSelectedState(isSelected ? "" : state.id);
                        setCity("");
                      }}
                    />
                  );
                })}
              </svg>
            </div>

            <div className="text-[10px] text-[var(--brand-text-muted)] font-medium leading-normal text-center border border-[var(--brand-border)] py-2 px-3 bg-[var(--brand-surface-elevated)] rounded-2xl">
              💡 Click any state to filter. Highlighted teal states have active clinics.
            </div>
          </div>
        </div>

        {/* Right Columns: Tab content listing (span-8) */}
        <div className="md:col-span-8 space-y-5">
          
          {/* Tab selector */}
          <div className="flex border-b-2 border-[var(--brand-border)] font-semibold gap-2">
            {[
              { id: "doctors", label: `Dermatologists (${doctors.length})` },
              { id: "hospitals", label: `Clinical Centers (${hospitals.length})` }
            ].map((tab) => {
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`border-b-2 -mb-[2px] px-5 py-3 transition-all text-xs font-bold ${
                    active 
                      ? "border-[var(--brand-primary)] text-[var(--brand-primary)]" 
                      : "border-transparent text-[var(--brand-text-muted)] hover:text-[var(--brand-text)]"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Cards listing */}
          <div className="grid gap-4 sm:grid-cols-2">
            <AnimatePresence mode="popLayout">
              {activeTab === "doctors" ? (
                doctors.length > 0 ? (
                  doctors.map((doc) => (
                    <motion.div
                      key={doc.id}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="relative rounded-[2.25rem] border-2 border-[var(--brand-border)] bg-[var(--brand-surface)] p-5 shadow-xs hover:shadow-md hover:border-[var(--brand-primary)] transition flex flex-col justify-between"
                    >
                      <button
                        type="button"
                        onClick={(e) => handleToggleFavorite(e, doc.id || (doc as any)._id)}
                        className="absolute right-4 top-4 text-slate-400 hover:text-rose-500 transition-colors p-1 cursor-pointer z-10"
                      >
                        <Heart size={18} fill={favorites.includes(doc.id || (doc as any)._id) ? "#F43F5E" : "none"} className={favorites.includes(doc.id || (doc as any)._id) ? "text-rose-500" : "text-slate-400"} />
                      </button>
                      
                      <div>
                        <span className="bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] border border-[var(--brand-primary)]/20 text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg inline-block">
                          {doc.specialization}
                        </span>
                        
                        <div className="flex items-center gap-1.5 mt-3">
                          <h3 className="font-bold text-[var(--brand-text)] text-base leading-none">{doc.name}</h3>
                          <span className="h-3.5 w-3.5 rounded-full bg-[var(--brand-primary)] text-white flex items-center justify-center text-[8px] font-bold">✓</span>
                        </div>
                        
                        <div className="flex items-center gap-1 mt-1.5 text-xs text-amber-500 font-semibold">
                          <span>★</span>
                          <span className="text-[var(--brand-text)] font-bold">{doc.rating}</span>
                          <span className="text-[var(--brand-text-muted)] text-[10px]">({doc.reviews_count} reviews)</span>
                        </div>
                        
                        <div className="space-y-2.5 mt-4 text-xs text-[var(--brand-text-muted)]">
                          <div className="flex items-start gap-2">
                            <MapPin size={14} className="shrink-0 text-[var(--brand-primary)] mt-0.5" />
                            <span><strong className="text-[var(--brand-text)]">{doc.clinic_name}</strong><br/>{doc.address}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone size={14} className="shrink-0 text-[var(--brand-primary)]" />
                            <span>{doc.phone}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock size={14} className="shrink-0 text-[var(--brand-primary)]" />
                            <span>{doc.timings}</span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-5 pt-3.5 border-t border-[var(--brand-border)] flex gap-2">
                        <button
                          onClick={() => setShowAppointmentModal(doc)}
                          className="flex-1 flex items-center justify-center gap-1.5 text-xs bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] text-white rounded-2xl py-2.5 font-bold shadow-xs transition"
                        >
                          <Calendar size={13} /> Book Appointment
                        </button>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <p className="col-span-2 text-center py-12 text-[var(--brand-text-muted)] text-xs">No dermatologists found matching criteria.</p>
                )
              ) : (
                hospitals.length > 0 ? (
                  hospitals.map((hos) => (
                    <motion.div
                      key={hos.id}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="rounded-[2.25rem] border-2 border-[var(--brand-border)] bg-[var(--brand-surface)] p-5 shadow-xs hover:shadow-md hover:border-[var(--brand-primary)] transition flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                            hos.type === "Government" ? "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20" : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                          }`}>
                            {hos.type} Center
                          </span>
                          {hos.emergency && (
                            <span className="bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 rounded flex items-center gap-0.5">
                              <AlertCircle size={9} /> 24/7 ER
                            </span>
                          )}
                        </div>
                        
                        <h3 className="font-bold text-[var(--brand-text)] text-base leading-snug mt-3">{hos.name}</h3>
                        
                        <div className="space-y-2.5 mt-4 text-xs text-[var(--brand-text-muted)]">
                          <div className="flex items-start gap-2">
                            <MapPin size={14} className="shrink-0 text-[var(--brand-primary)] mt-0.5" />
                            <span>{hos.address}, {hos.city}, {hos.state}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone size={14} className="shrink-0 text-[var(--brand-primary)]" />
                            <span>{hos.phone}</span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-5 pt-3.5 border-t border-[var(--brand-border)] flex gap-2">
                        <a
                          href={`https://www.google.com/maps/dir/?api=1&destination=${hos.latitude},${hos.longitude}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 flex items-center justify-center gap-1 text-xs border border-[var(--brand-border)] text-[var(--brand-text)] rounded-2xl py-2.5 font-bold hover:bg-[var(--brand-surface-elevated)] transition text-center"
                        >
                          <Navigation size={12} /> Directions
                        </a>
                        <button
                          onClick={() => setShowAppointmentModal(hos)}
                          className="flex-1 flex items-center justify-center gap-1 text-xs bg-[var(--brand-primary)] text-white rounded-2xl py-2.5 font-bold hover:bg-[var(--brand-primary-hover)] transition"
                        >
                          <Calendar size={13} /> Request Care
                        </button>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <p className="col-span-2 text-center py-12 text-[var(--brand-text-muted)] text-xs">No clinical centers found matching criteria.</p>
                )
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Appointment Booking Modal */}
      <AnimatePresence>
        {showAppointmentModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-6 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md rounded-[2.5rem] border-2 border-[var(--brand-border)] bg-[var(--brand-surface)] p-6 shadow-2xl relative"
            >
              {/* Close Button */}
              <button 
                onClick={() => setShowAppointmentModal(null)}
                className="absolute right-6 top-6 h-8 w-8 rounded-full border border-[var(--brand-border)] flex items-center justify-center text-[var(--brand-text-muted)] hover:text-[var(--brand-text)] transition hover:bg-[var(--brand-surface-elevated)]"
              >
                <X size={14} />
              </button>

              <h3 className="text-xl font-bold text-[var(--brand-text)] tracking-tight">
                {activeTab === "doctors" ? "Book Dermatologist" : "Request Clinic Visit"}
              </h3>
              <p className="text-[10px] text-[var(--brand-text-muted)] mt-1 uppercase font-bold tracking-wider">Provider: {showAppointmentModal.name}</p>

              {bookingSuccess ? (
                <div className="my-10 text-center text-[var(--brand-success)] font-semibold flex flex-col items-center gap-2">
                  <motion.div initial={{ scale: 0.8 }} animate={{ scale: [1, 1.2, 1] }} className="rounded-full bg-[var(--brand-success)]/10 p-3 text-[var(--brand-success)]">
                    <Check size={28} strokeWidth={3} />
                  </motion.div>
                  <span className="text-sm font-bold">Appointment Booked!</span>
                  <p className="text-xs text-[var(--brand-text-muted)] font-normal">Your schedule has been synchronized to the dashboard.</p>
                </div>
              ) : (
                <form onSubmit={handleBookAppointment} className="mt-5 space-y-4 text-xs">
                  <div>
                    <label className="block text-[9px] font-bold text-[var(--brand-text-muted)] uppercase mb-1 ml-1">Patient Full Name</label>
                    <input
                      required
                      type="text"
                      value={appointmentForm.patientName}
                      onChange={(e) => setAppointmentForm({ ...appointmentForm, patientName: e.target.value })}
                      className="w-full rounded-2xl border-2 border-[var(--brand-border)] p-3 outline-none focus:border-[var(--brand-primary)] bg-[var(--brand-surface-elevated)] text-[var(--brand-text)] transition"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-[var(--brand-text-muted)] uppercase mb-1 ml-1">Contact Phone</label>
                    <input
                      required
                      type="tel"
                      value={appointmentForm.phone}
                      onChange={(e) => setAppointmentForm({ ...appointmentForm, phone: e.target.value })}
                      className="w-full rounded-2xl border-2 border-[var(--brand-border)] p-3 outline-none focus:border-[var(--brand-primary)] bg-[var(--brand-surface-elevated)] text-[var(--brand-text)] transition"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[9px] font-bold text-[var(--brand-text-muted)] uppercase mb-1 ml-1">Date</label>
                      <input
                        required
                        type="date"
                        value={appointmentForm.date}
                        onChange={(e) => setAppointmentForm({ ...appointmentForm, date: e.target.value })}
                        className="w-full rounded-2xl border-2 border-[var(--brand-border)] p-3 outline-none focus:border-[var(--brand-primary)] bg-[var(--brand-surface-elevated)] text-[var(--brand-text)] transition"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-[var(--brand-text-muted)] uppercase mb-1 ml-1">Time</label>
                      <input
                        required
                        type="time"
                        value={appointmentForm.time}
                        onChange={(e) => setAppointmentForm({ ...appointmentForm, time: e.target.value })}
                        className="w-full rounded-2xl border-2 border-[var(--brand-border)] p-3 outline-none focus:border-[var(--brand-primary)] bg-[var(--brand-surface-elevated)] text-[var(--brand-text)] transition"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-[var(--brand-text-muted)] uppercase mb-1 ml-1">Clinical Notes</label>
                    <textarea
                      rows={2}
                      value={appointmentForm.notes}
                      onChange={(e) => setAppointmentForm({ ...appointmentForm, notes: e.target.value })}
                      placeholder="Symptoms description, history notes..."
                      className="w-full rounded-2xl border-2 border-[var(--brand-border)] p-3 outline-none focus:border-[var(--brand-primary)] bg-[var(--brand-surface-elevated)] text-[var(--brand-text)] placeholder-[var(--brand-text-muted)] transition resize-none"
                    />
                  </div>
                  
                  <div className="flex gap-2.5 pt-4">
                    <button
                      type="submit"
                      className="flex-1 py-3.5 bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] text-white rounded-2xl font-bold shadow-md transition"
                    >
                      Confirm Booking
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Disclaimer */}
      <div className="mx-auto mt-16 max-w-lg border-t border-[var(--brand-border)] pt-5 text-[10px] text-[var(--brand-text-muted)] leading-relaxed text-center">
        <p className="flex items-center justify-center gap-1 font-semibold text-[var(--brand-text-muted)] mb-1">
          <Shield size={12} /> Medical Referral Disclaimer
        </p>
        Doctor information lists represent educational registries. Directory mappings do not constitute endorsed diagnostic recommendations.
      </div>

    </div>
  );
}
