import TechnicianTopBar from "../../components/layout/TechnicianTopBar";

/**
 * Generic "coming soon" page used for the Facilities & Notifications tabs
 * — keeps the layout intact while the other modules are under construction.
 */
export default function StaffPlaceholder({ title, subtitle = "Facilities Management", message }) {
  return (
    <>
      <TechnicianTopBar title={title} subtitle={subtitle} />
      <div className="p-6">
        <div className="rounded-2xl bg-white border border-dashed border-slate-200 p-12 text-center">
          <h3 className="text-base font-bold text-slate-700">{title}</h3>
          <p className="text-sm text-slate-500 mt-1">{message}</p>
        </div>
      </div>
    </>
  );
}
