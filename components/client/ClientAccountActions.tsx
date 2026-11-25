"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "@/lib/auth/service";
import { errorMessage } from "@/lib/shared/error-messages";
export function ClientAccountActions() {
  const router=useRouter();
  const [busy,setBusy]=useState(false),[error,setError]=useState("");
  async function leave(){
    if(busy)return;setBusy(true);setError("");
    try{const result=await signOut("client");if(!result.ok)throw new Error("unconfirmed");router.replace("/client/login");router.refresh();}
    catch(e){setError(errorMessage(e,"We couldn't confirm sign-out. Please try again."));setBusy(false);}
  }
  return <div className="space-y-2"><button type="button" className="ap-btn ap-btn-s ap-btn-sm" disabled={busy} onClick={()=>void leave()}>{busy?"Signing out…":"Sign out"}</button>{error?<p role="alert" className="text-sm">{error}</p>:null}</div>;
}
