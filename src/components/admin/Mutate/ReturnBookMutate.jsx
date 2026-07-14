import { Loader2, RotateCcw } from "lucide-react";
import { useState } from "react";
import CustomModal from "../../ui/CustomModal/CustomModal";
import Spinner from "@/components/ui/Spinner/Spinner";

function ReturnBookMutate({ target, returning, onConfirm, onCancel }) {
  console.log("target", target);
  const [status, setStatus] = useState("");

  if (!target) return null;

  return (
    <CustomModal
      isOpen={Boolean(target)}
      onClose={onCancel}
      title="Mark Book as Returned"
      subtitle={`${target.book?.title} · ${target.student?.fname} ${target.student?.lname}`}
      icon={<RotateCcw size={16} color="#22c55e" />}
      size="default"
      footer={
        <>
          <button
            className="modal-cancel"
            onClick={onCancel}
            disabled={returning}
          >
            Cancel
          </button>
          <button
            className="modal-submit"
            disabled={returning}
            onClick={() =>
              onConfirm({
                book_id: target.book_id,
                student_id: target.student_id,
                status,
              })
            }
          >
            {returning ? <Spinner /> : "Mark as Returned"}
          </button>
        </>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {/* Info rows */}
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}
        >
          {[{ label: "Book ID", value: `#${target.book_id}` }].map(
            ({ label, value }) => (
              <div
                key={label}
                style={{
                  background: "rgba(34,197,94,0.06)",
                  border: "1px solid rgba(34,197,94,0.15)",
                  borderRadius: 8,
                  display: "none",
                  padding: "10px 14px",
                }}
              >
                <p
                  style={{
                    margin: 0,
                    fontSize: 10,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    color: "#94a3b8",
                  }}
                >
                  {label}
                </p>
                <p
                  style={{
                    margin: "4px 0 0",
                    fontSize: 15,
                    fontWeight: 700,
                    color: "var(--text-primary, #f1f5f9)",
                  }}
                >
                  {value}
                </p>
              </div>
            ),
          )}
        </div>

        {/* Status field */}
        <div>
          <label
            className="modal-label"
            style={{ marginBottom: 6, display: "block" }}
          >
            Book Condition / Status
          </label>
          <select
            className="modal-input"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            required
          >
            <option hidden>Select Status</option>
            <option value="Good">Good</option>
            <option value="Damaged">Damaged</option>
            <option value="Lost">Lost</option>
          </select>
          <p className="modal-hint">
            Describe the physical condition of the book upon return.
          </p>
        </div>
      </div>
    </CustomModal>
  );
}

export default ReturnBookMutate;
