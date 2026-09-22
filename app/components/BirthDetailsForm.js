"use client";

import { useState } from "react";
import { useLang } from "./LangProvider";

const hours = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0"));
const minutes = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0"));

export default function BirthDetailsForm({ onSubmit }) {
  const { tr } = useLang();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [dob, setDob] = useState("");
  const [hour, setHour] = useState("12");
  const [minute, setMinute] = useState("00");
  const [ampm, setAmpm] = useState("AM");
  const [timeUnknown, setTimeUnknown] = useState(false);
  const [place, setPlace] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    onSubmit({
      name,
      email,
      dob,
      birthTime: timeUnknown ? null : `${hour}:${minute} ${ampm}`,
      birthTimeUnknown: timeUnknown,
      birthPlace: place,
    });
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-field">
        <label>{tr("form_name")}</label>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
      </div>

      <div className="form-field">
        <label>{tr("form_email")}</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={tr("form_email_hint")}
          required
        />
      </div>

      <div className="form-field">
        <label>{tr("form_dob")}</label>
        <input type="date" value={dob} onChange={(e) => setDob(e.target.value)} required />
      </div>

      <div className="form-field">
        <label>{tr("form_time")}</label>
        <div className="time-row">
          <select
            value={hour}
            disabled={timeUnknown}
            onChange={(e) => setHour(e.target.value)}
          >
            {hours.map((h) => (
              <option key={h} value={h}>
                {h}
              </option>
            ))}
          </select>
          <select
            value={minute}
            disabled={timeUnknown}
            onChange={(e) => setMinute(e.target.value)}
          >
            {minutes.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
          <select
            value={ampm}
            disabled={timeUnknown}
            onChange={(e) => setAmpm(e.target.value)}
          >
            <option value="AM">AM</option>
            <option value="PM">PM</option>
          </select>
        </div>
        <label style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 10, fontWeight: 400 }}>
          <input
            type="checkbox"
            checked={timeUnknown}
            onChange={(e) => setTimeUnknown(e.target.checked)}
          />
          {tr("form_time_unknown")}
        </label>
      </div>

      <div className="form-field">
        <label>{tr("form_place")}</label>
        <input type="text" value={place} onChange={(e) => setPlace(e.target.value)} required />
      </div>

      <button type="submit" className="btn-primary" style={{ width: "100%" }}>
        {tr("form_submit")}
      </button>
    </form>
  );
}
