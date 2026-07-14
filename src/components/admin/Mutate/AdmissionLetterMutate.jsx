import React, { useState } from "react";
import CustomModal from "../../ui/CustomModal/CustomModal";
import Spinner from "../../ui/Spinner/Spinner";
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { toast } from "react-toastify";
import { useCreateAdmissionLetter, useUpdateAdmissionLetter, useAdmissionModes } from "../../../hooks/useAdmissionMode";

const MenuBar = ({ editor }) => {
    if (!editor) return null;
    return (
        <div style={{ display: "flex", gap: "5px", padding: "8px", borderBottom: "1px solid var(--border-color, #e2e8f0)", background: "var(--bg-muted, #f8fafc)" }}>
            <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} style={{ padding: "4px 8px", color: "var(--text-primary, #0f172a)", background: editor.isActive('bold') ? 'var(--border-color, rgba(0,0,0,0.1))' : 'transparent', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>B</button>
            <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} style={{ padding: "4px 8px", color: "var(--text-primary, #0f172a)", background: editor.isActive('italic') ? 'var(--border-color, rgba(0,0,0,0.1))' : 'transparent', border: 'none', borderRadius: '4px', cursor: 'pointer', fontStyle: 'italic' }}>I</button>
            <button type="button" onClick={() => editor.chain().focus().toggleStrike().run()} style={{ padding: "4px 8px", color: "var(--text-primary, #0f172a)", background: editor.isActive('strike') ? 'var(--border-color, rgba(0,0,0,0.1))' : 'transparent', border: 'none', borderRadius: '4px', cursor: 'pointer', textDecoration: 'line-through' }}>S</button>
            <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} style={{ padding: "4px 8px", color: "var(--text-primary, #0f172a)", background: editor.isActive('heading', { level: 2 }) ? 'var(--border-color, rgba(0,0,0,0.1))' : 'transparent', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>H2</button>
            <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} style={{ padding: "4px 8px", color: "var(--text-primary, #0f172a)", background: editor.isActive('bulletList') ? 'var(--border-color, rgba(0,0,0,0.1))' : 'transparent', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>List</button>
        </div>
    );
};

function AdmissionLetterMutate({ letter, closeModal }) {
    const isEdit = Boolean(letter?.id);

    // Provide default fallback value if editing but mode_id isn't explicitly defined in response
    const { data: modesRes } = useAdmissionModes();
    const modes = modesRes?.data || [];

    // Attempt to match mode_id from mode string if mode_id doesn't exist
    const defaultModeId = isEdit
        ? (letter?.mode_id || modes.find((m) => m.name === letter?.mode)?.id || "")
        : "";

    const [formData, setFormData] = useState({
        title: letter?.title || "",
        mode_id: defaultModeId,
        letterbody: letter?.body || "",
    });

    const setForm = (key) => (e) =>
        setFormData((prev) => ({ ...prev, [key]: e.target.value }));

    const handleBodyChange = (value) =>
        setFormData((prev) => ({ ...prev, letterbody: value }));

    const editor = useEditor({
        extensions: [StarterKit],
        content: formData.letterbody,
        onUpdate: ({ editor }) => {
            handleBodyChange(editor.getHTML());
        },
    });

    const { mutate: createLetter, isPending: creating } = useCreateAdmissionLetter();
    const { mutate: updateLetter, isPending: updating } = useUpdateAdmissionLetter();
    const isPending = creating || updating;

    const onSubmit = (e) => {
        e.preventDefault();

        // If the mode_id wasn't ready on first load, try parsing again in case it populated late
        const mode_id = formData.mode_id || defaultModeId;

        if (!mode_id) {
            toast.error("Please select an admission mode");
            return;
        }

        const payload = {
            title: formData.title,
            mode_id: mode_id,
            letterbody: formData.letterbody,
        };

        if (isEdit) {
            payload.id = letter.id;
            updateLetter(payload, {
                onSuccess: () => {
                    toast.success("Admission letter updated successfully");
                    closeModal();
                },
                onError: (err) => toast.error(err?.message || "Failed to update letter"),
            });
        } else {
            createLetter(payload, {
                onSuccess: () => {
                    toast.success("Admission letter created successfully");
                    closeModal();
                },
                onError: (err) => toast.error(err?.message || "Failed to create letter"),
            });
        }
    };

    return (
        <CustomModal
            isOpen={true}
            title={isEdit ? "Edit Admission Letter" : "Create Admission Letter"}
            subtitle="Compose the official admission text that students will see."
            size="wide"
            onClose={closeModal}
            footer={
                <>
                    <button type="button" className="modal-cancel" onClick={closeModal}>
                        Cancel
                    </button>
                    <button
                        type="submit"
                        form="letter-form"
                        className="modal-submit"
                        disabled={isPending}
                    >
                        {isPending ? <Spinner /> : isEdit ? "Update Letter" : "Save Letter"}
                    </button>
                </>
            }
        >
            <form id="letter-form" onSubmit={onSubmit}>
                <div className="form-grid">
                    <div className="form-group col-2">
                        <label className="modal-label">Letter Title <span className="req">*</span></label>
                        <input
                            type="text"
                            className="modal-input"
                            value={formData.title}
                            onChange={setForm("title")}
                            placeholder="e.g. Admission Letter for Distance Learning"
                            required
                        />
                    </div>
                </div>

                <div className="form-grid" style={{ marginBottom: 15 }}>
                    <div className="form-group col-2">
                        <label className="modal-label">Admission Mode <span className="req">*</span></label>
                        <select
                            className="modal-input"
                            value={formData.mode_id || defaultModeId}
                            onChange={setForm("mode_id")}
                            required
                        >
                            <option value="">— Select Admission Mode —</option>
                            {modes.map((m) => (
                                <option key={m.id} value={m.id}>{m.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="form-group">
                    <label className="modal-label">Letter Content <span className="req">*</span></label>
                    <div style={{ background: "var(--bg-white, #fff)", border: "1px solid var(--border-color, #e2e8f0)", borderRadius: 8, overflow: "hidden" }}>
                        <MenuBar editor={editor} />
                        <EditorContent editor={editor} className="tiptap-editor-wrap" />
                        <style>{`
                            .tiptap-editor-wrap .ProseMirror {
                                min-height: 220px;
                                padding: 12px;
                                outline: none;
                                color: var(--text-primary, #0f172a);
                            }
                            .tiptap-editor-wrap .ProseMirror p { margin: 0 0 1em; }
                        `}</style>
                    </div>
                </div>
            </form>
        </CustomModal>
    );
}

export default AdmissionLetterMutate;