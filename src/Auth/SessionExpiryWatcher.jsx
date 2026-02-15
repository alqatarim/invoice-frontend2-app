"use client";

import { useEffect, useRef } from "react";
import { signOut, useSession } from "next-auth/react";
import { sessionConfig } from "@/data/dataSets";

const isTokenExpired = (token) => {
  if (!token) return true;

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const currentTime = Date.now() / 1000;

    return !payload?.exp || payload.exp <= currentTime;
  } catch (error) {
    return true;
  }
};

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

    const interval = setInterval(
      checkExpiry,
      sessionConfig.checkIntervals.frequent
    );

    return () => clearInterval(interval);
  }, [session?.user?.token, status]);

  return null;
};

export default SessionExpiryWatcher;
