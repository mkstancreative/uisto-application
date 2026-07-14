import React, { useState } from 'react'
import CustomModal from '../../ui/CustomModal/CustomModal'
import { useCheckAndRemoveEmail } from '../../../hooks/useStudents';
import { toast } from 'react-toastify';
function CheckAndRemoveEmail({ closeModal }) {
    const [email, setEmail] = useState("");

    const { mutate: checkAndRemoveEmail, isPending } = useCheckAndRemoveEmail();

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!email) return;

        checkAndRemoveEmail(
            { email },
            {
                onSuccess: (res) => {
                    closeModal();
                    toast.success(res?.data?.message || "Email checked and removed successfully");
                },
                onError: (error) => {
                    toast.error(error?.response?.data?.message || error?.message);
                }
            }
        );
    };
    return (
        <CustomModal
            isOpen
            title="Check and Remove Email"
            subtitle="Enter the email to check and remove"
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
                        disabled={isPending}
                        onClick={handleSubmit}
                    >
                        {isPending ? "Checking..." : "Check"}
                    </button>

                </>
            }
        >
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label className="modal-label">Enter Email</label>
                    <input
                        type="email"
                        className="modal-input"
                        placeholder="Enter Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>
            </form>
        </CustomModal>
    )
}

export default CheckAndRemoveEmail