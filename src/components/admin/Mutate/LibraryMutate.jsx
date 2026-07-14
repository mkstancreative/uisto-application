import React, { useEffect, useState } from "react";
import CustomModal from "../../ui/CustomModal/CustomModal";
import Spinner from "../../ui/Spinner/Spinner";
import {
  useCreateLibraryBook,
  useUpdateLibraryBook,
  useLoanBook,
} from "../../../hooks/useLibrary";
import { useDepartments } from "../../../hooks/useDepartments";
import { toast } from "react-toastify";
import { useStudents } from "../../../hooks/useStudents";

function LibraryMutate({ data, mode = "book", closeModal }) {
  const isEdit = Boolean(data?.id) && mode === "book";
  const [studentSearch, setStudentSearch] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  /* ── Book form state ── */
  const [book, setBook] = useState({
    title: data?.title ?? "",
    author: data?.author ?? "",
    isbn: data?.isbn ?? "",
    pubdate: data?.pubdate ? String(new Date(data.pubdate).getFullYear()) : "",
    department_id: String(data?.department_id ?? ""),
    copies: data?.copies ?? "",
    isavailable: data?.isavailable ?? "",
    section: data?.section ?? "",
    callno: data?.callno ?? "",
  });

  /* ── Loan form state ── */
  const [loan, setLoan] = useState({
    book_id: String(data?.id ?? ""),
    student_id: "",
    toreturn: "",
    penalty: "0",
    status: "in good shape",
  });

  const setB = (k) => (e) => setBook((p) => ({ ...p, [k]: e.target.value }));
  const setL = (k) => (e) => setLoan((p) => ({ ...p, [k]: e.target.value }));

  /* ── Hooks ── */
  const { data: deptRes } = useDepartments({ limit: 1000 });
  const departments = deptRes?.data ?? [];

  const { data: studentRes } = useStudents({ page: 1, limit: 5000 });
  const students = studentRes?.data ?? [];

  const { mutate: createBook, isPending: creating } = useCreateLibraryBook();
  const { mutate: updateBook, isPending: updating } = useUpdateLibraryBook();
  const { mutate: loanOut, isPending: loaning } = useLoanBook();
  const isPending = creating || updating || loaning;

  const dropdownRef = React.useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /* ── Submit ── */
  const onSubmit = (e) => {
    e.preventDefault();

    if (mode === "loan") {
      if (!loan.student_id || !loan.toreturn) {
        toast.error("Student ID and return date are required.");
        return;
      }
      loanOut(loan, {
        onSuccess: (res) => {
          toast.success(res?.message ?? "Book loaned out successfully");
          closeModal();
        },
        onError: (err) => {
          toast.error(err?.message ?? "Failed to loan book");
          closeModal();
        },
      });
      return;
    }

    const payload = isEdit ? { ...book, id: data.id } : book;
    const mutate = isEdit ? updateBook : createBook;

    mutate(payload, {
      onSuccess: (res) => {
        toast.success(res?.message ?? (isEdit ? "Book updated" : "Book added"));
        closeModal();
      },
      onError: (err) => {
        toast.error(err?.message ?? "Operation failed");
        closeModal();
      },
    });
  };

  /* ── Title helpers ── */
  const title =
    mode === "loan"
      ? `Loan Out — ${data?.title ?? "Book"}`
      : isEdit
        ? "Edit Book"
        : "Add Book";
  const subtitle =
    mode === "loan"
      ? "Assign this book to a student"
      : "Fill in the book details below";

  return (
    <CustomModal
      isOpen
      title={title}
      subtitle={subtitle}
      size="wide"
      onClose={closeModal}
      footer={
        <>
          <button type="button" className="modal-cancel" onClick={closeModal}>
            Cancel
          </button>
          <button
            type="submit"
            form="library-form"
            className="modal-submit"
            disabled={isPending}
          >
            {isPending ? (
              <Spinner />
            ) : mode === "loan" ? (
              "Loan Out"
            ) : isEdit ? (
              "Save Changes"
            ) : (
              "Add Book"
            )}
          </button>
        </>
      }
    >
      <form id="library-form" className="form-grid" onSubmit={onSubmit}>
        {/* ═══ BOOK FORM ═══ */}
        {mode === "book" && (
          <>
            <div className="form-group col-2">
              <label className="modal-label">Title *</label>
              <input
                className="modal-input"
                placeholder="e.g. Introduction to Algorithms"
                value={book.title}
                onChange={setB("title")}
                required
              />
            </div>
            <div className="form-group col-2">
              <label className="modal-label">Author *</label>
              <input
                className="modal-input"
                placeholder="e.g. Thomas H. Cormen"
                value={book.author}
                onChange={setB("author")}
                required
              />
            </div>

            <div className="form-group col-2">
              <label className="modal-label">ISBN</label>
              <input
                className="modal-input"
                placeholder="e.g. 978-3-16-148410-0"
                value={book.isbn}
                onChange={setB("isbn")}
              />
            </div>
            <div className="form-group col-2">
              <label className="modal-label">Publication Year</label>
              <input
                type="number"
                className="modal-input"
                placeholder="e.g. 2011"
                min={1900}
                max={2100}
                value={book.pubdate}
                onChange={setB("pubdate")}
              />
            </div>

            <div className="form-group col-2">
              <label className="modal-label">Department</label>
              <select
                className="modal-input"
                value={book.department_id}
                onChange={setB("department_id")}
              >
                <option value="">Select Department</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group col-2">
              <label className="modal-label">Section</label>
              <input
                className="modal-input"
                placeholder="e.g. CSC Section"
                value={book.section}
                onChange={setB("section")}
              />
            </div>

            <div className="form-group col-3">
              <label className="modal-label">Call No.</label>
              <input
                className="modal-input"
                placeholder="e.g. 45"
                value={book.callno}
                onChange={setB("callno")}
              />
            </div>
            <div className="form-group col-3">
              <label className="modal-label">Total Copies *</label>
              <input
                type="number"
                className="modal-input"
                placeholder="e.g. 20"
                min={0}
                value={book.copies}
                onChange={setB("copies")}
                required
              />
            </div>
            <div className="form-group col-3">
              <label className="modal-label">Available Copies</label>
              <input
                type="number"
                className="modal-input"
                placeholder="e.g. 14"
                min={0}
                value={book.isavailable}
                onChange={setB("isavailable")}
              />
            </div>
          </>
        )}

        {/* ═══ LOAN FORM ═══ */}
        {mode === "loan" && (
          <>
            <div className="form-group col-2">
              <label className="modal-label">Book</label>
              <input
                className="modal-input"
                value={data?.title ?? ""}
                readOnly
                style={{
                  background: "rgba(0,0,0,0.04)",
                  cursor: "not-allowed",
                }}
              />
            </div>
            <div
              className="form-group col-2"
              ref={dropdownRef}
              style={{ position: "relative" }}
            >
              <label className="modal-label">Student *</label>
              <input
                className="modal-input"
                placeholder="Search by name or reg no..."
                value={studentSearch}
                onChange={(e) => {
                  setStudentSearch(e.target.value);
                  setShowDropdown(true);
                  setLoan((p) => ({ ...p, student_id: "" }));
                }}
                onFocus={() => setShowDropdown(true)}
                autoComplete="off"
                required={!loan.student_id}
              />

              {showDropdown && studentSearch.trim() && !loan.student_id && (
                <ul
                  style={{
                    position: "absolute",
                    top: "100%",
                    left: 0,
                    right: 0,
                    zIndex: 999,
                    background: "#fff",
                    border: "1px solid #e0e0e0",
                    borderRadius: "6px",
                    maxHeight: "200px",
                    overflowY: "auto",
                    margin: 0,
                    color: "#000",
                    padding: 0,
                    listStyle: "none",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  }}
                >
                  {(() => {
                    const filtered = students
                      .filter((s) => {
                        const q = studentSearch.toLowerCase();
                        return (
                          s.fname?.toLowerCase().includes(q) ||
                          s.lname?.toLowerCase().includes(q) ||
                          s.regno?.toLowerCase().includes(q)
                        );
                      })
                      .slice(0, 20);

                    return filtered.length > 0 ? (
                      filtered.map((s) => (
                        <li
                          key={s.id}
                          onMouseDown={() => {
                            setLoan((p) => ({
                              ...p,
                              student_id: String(s.id),
                            }));
                            setStudentSearch(
                              `${s.fname} ${s.lname} (${s.regno})`,
                            );
                            setShowDropdown(false);
                          }}
                          style={{
                            padding: "8px 12px",
                            cursor: "pointer",
                            fontSize: "0.875rem",
                            borderBottom:
                              "1px solid var(--border-color, #f0f0f0)",
                          }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.background =
                              "var(--hover-bg, #f7f7f7)")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.background = "transparent")
                          }
                        >
                          {s.fname} {s.lname}{" "}
                          <span style={{ color: "var(--text-muted, #888)" }}>
                            ({s.regno})
                          </span>
                        </li>
                      ))
                    ) : (
                      <li
                        style={{
                          padding: "10px 12px",
                          color: "var(--text-muted, #999)",
                          fontSize: "0.875rem",
                        }}
                      >
                        No students found
                      </li>
                    );
                  })()}
                </ul>
              )}
            </div>

            <div className="form-group col-2">
              <label className="modal-label">Return Date *</label>
              <input
                type="date"
                className="modal-input"
                value={loan.toreturn}
                onChange={setL("toreturn")}
                required
              />
            </div>
            <div className="form-group col-2">
              <label className="modal-label" style={{ display: "none" }}>Penalty (₦)</label>
              <input
                type="number"
                className="modal-input"
                placeholder="0"
                hidden
                min={0}
                value={loan.penalty}
                onChange={setL("penalty")}
              />
            </div>

            <div className="form-group col-1">
              <label className="modal-label">Book Condition</label>
              <select
                className="modal-input"
                value={loan.status}
                onChange={setL("status")}
              >
                <option value="in good shape">In Good Shape</option>
                <option value="slightly worn">Slightly Worn</option>
                <option value="damaged">Damaged</option>
                <option value="missing pages">Missing Pages</option>
              </select>
            </div>
          </>
        )}
      </form>
    </CustomModal>
  );
}

export default LibraryMutate;
