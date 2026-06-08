"use client";

import { useEffect, useRef } from "react";

import { signOut, useSession } from "@/Auth/SessionContext";
import { isTokenExpired } from "@/Auth/jwt";
import { sessionConfig } from "@/data/dataSets";

const SessionExpiryWatcher = () => {
  const { data: session, status } = useSession();
  const signOutTriggered = useRef(false);

  useEffect(() => {
    signOutTriggered.current = false;

    if (status === "loading") return;

    const token = session?.user?.token;
    if (!token) return;

    const checkExpiry = () => {
      if (signOutTriggered.current) return;

      if (isTokenExpired(token)) {
        signOutTriggered.current = true;
        signOut({ callbackUrl: "/login?expired=true" });
      }
    };

    checkExpiry();

    const interval = setInterval(checkExpiry, sessionConfig.checkIntervals.frequent);

    return () => clearInterval(interval);
  }, [session?.user?.token, status]);

  return null;
};

export default SessionExpiryWatcher;
