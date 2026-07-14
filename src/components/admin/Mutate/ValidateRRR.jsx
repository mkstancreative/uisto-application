import React, { useState } from "react";
import CustomModal from "../../ui/CustomModal/CustomModal";
import { useVerifyRRR } from "../../../hooks/useTransactions";
import { toast } from "react-toastify";
import Spinner from "../../ui/Spinner/Spinner";
function ValidateRRR({ closeModal }) {
    const [rrr, setRrr] = useState("");

    const { mutate: validateRrr, isPending } = useVerifyRRR();

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!rrr) return;

        validateRrr(
            { rrr },
            {
                onSuccess: () => {
                    toast.success("RRR validated successfully");
                    closeModal();
                },
                onError: (error) => {
                    toast.error(error?.message);
                    closeModal();
                }
            }
        );
    };

    return (
        <CustomModal
            isOpen
            title="Validate RRR"
            subtitle="Enter the RRR to validate"
            size="sm"
            onClose={closeModal}
            footer={
                <>
                    <button
                        type="button"
                        className="modal-cancel"
                        onClick={closeModal}
                    >
                        Cancel
                    </button>

                    <button
                        type="submit"
                        className="modal-submit"
                        form="validate-rrr-form"
                        disabled={isPending}
                    >
                        {isPending ? <Spinner /> : "Validate"}
                    </button>

                </>
            }
        >
            <form onSubmit={handleSubmit} id="validate-rrr-form">
                <div className="form-group">
                    <label className="modal-label">Enter RRR</label>
                    <input
                        type="number"
                        className="modal-input"
                        placeholder="Enter RRR"
                        value={rrr}
                        onChange={(e) => setRrr(e.target.value)}
                    />
                </div>
            </form>
        </CustomModal>
    );
}

export default ValidateRRR;