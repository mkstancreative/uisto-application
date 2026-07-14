import React, { useMemo } from "react";
import { FileText } from "lucide-react";
import StudentInvoiceTable from "../StudentTable/StudentInvoiceTable";
import SearchInput from "../../ui/SearchInput/SearchInput";
import SelectFilters from "../../ui/SelectFilters/SelectFilters";

/**
 * StudentInvoice (reusable view component)
 *
 * Props:
 *  - invoices : array — each item has the shape from /students/apiStudentInvoices
 *  - loading  : boolean
 *
 * Shape:
 * { id, invoiceid, amount, paystatus, payday, createdate,
 *   session: {name}, fee: {name, feetype}, student: {fname, lname, regno} }
 */
function StudentInvoice({ invoices = [], loading }) {
    const [search, setSearch] = React.useState("");
    const [filters, setFilters] = React.useState({
        session: "",
        paystatus: "",
    });

    const setFilter = (key) => (value) =>
        setFilters((prev) => ({ ...prev, [key]: value }));

    /* Unique session options derived from data */
    const sessionOptions = useMemo(() => {
        const unique = [
            ...new Set(invoices.map((i) => i.session?.name).filter(Boolean)),
        ];
        return [
            { value: "", label: "All Sessions" },
            ...unique.map((s) => ({ value: s, label: s })),
        ];
    }, [invoices]);

    /* Filtered list */
    const filtered = useMemo(() => {
        return invoices.filter((inv) => {
            const q = search.toLowerCase();

            const matchSearch =
                !q ||
                inv.fee?.name?.toLowerCase().includes(q) ||
                inv.invoiceid?.toLowerCase().includes(q);

            const matchSession =
                !filters.session || (inv.session?.name ?? "") === filters.session;

            const matchStatus =
                !filters.paystatus ||
                (inv.paystatus ?? "").toLowerCase() ===
                filters.paystatus.toLowerCase();

            return matchSearch && matchSession && matchStatus;
        });
    }, [invoices, search, filters]);

    const handleView = (invoice) => {
        console.log("View/print invoice:", invoice);
    };

    const handleDelete = (invoice) => {
        console.log("Delete invoice:", invoice);
    };

    return (
        <>
            <div className="page-header">
                <div className="page-header-left">
                    <div className="page-icon orange">
                        <FileText size={20} />
                    </div>
                    <div>
                        <h2 className="page-title">My Invoices</h2>
                        <p className="page-sub">View and manage your fee invoices</p>
                    </div>
                </div>
                <div className="page-header-right" />
            </div>

            <div className="filter-wrapper">
                <SearchInput
                    value={search}
                    onChange={setSearch}
                    placeholder="Search by fee name or invoice ID..."
                />
            </div>

            <div className="filter-selects-block">
                <SelectFilters
                    label="Session"
                    value={filters.session}
                    onChange={setFilter("session")}
                    options={sessionOptions}
                />
                <SelectFilters
                    label="Pay Status"
                    value={filters.paystatus}
                    onChange={setFilter("paystatus")}
                    options={[
                        { value: "", label: "All Status" },
                        { value: "success", label: "Paid" },
                        { value: "Unpaid", label: "Unpaid" },
                    ]}
                />
            </div>

            <div className="table-wrapper">
                <StudentInvoiceTable
                    data={filtered}
                    loading={loading}
                    onView={handleView}
                    onDelete={handleDelete}
                />
            </div>
        </>
    );
}

export default StudentInvoice;