"use client";

import Link from "next/link";
import PalmaraIcon from "./PalmaraIcon";
import { useLang } from "./LangProvider";

export default function SiteHeader() {
  const { lang, setLang, tr } = useLang();
  return (
    <header className="header wrap">
      <Link href="/" className="wordmark">
        <PalmaraIcon size={30} />
        {tr("brand")}
      </Link>
      <div className="header-right">
        <a href="mailto:hello@palmara.in">{tr("nav_contact")}</a>
        <div className="lang-toggle">
          <button
            className={lang === "en" ? "active" : ""}
            onClick={() => setLang("en")}
          >
            English
          </button>
          <button
            className={lang === "hi" ? "active" : ""}
            onClick={() => setLang("hi")}
          >
            हिंदी
          </button>
        </div>
      </div>
    </header>
  );
}
