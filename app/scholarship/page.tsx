import { redirect } from "next/navigation";

/** Scholarship Tips live on the Publications page. */
export default function ScholarshipRedirect() {
  redirect("/publications#scholarship-tips");
}
