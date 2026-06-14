"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Loader2, MessageCircle, Phone, Send, User } from "lucide-react";
import { createBlogComment } from "@/app/actions/blog";

export type CommentItem = {
  id: string;
  name: string;
  message: string;
  createdAt: Date | string;
};

const formatDateTime = (d: Date | string) => {
  const date = new Date(d);
  return date.toLocaleString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("") || "?";

export function BlogComments({
  postId,
  initialComments,
}: {
  postId: string;
  initialComments: CommentItem[];
}) {
  const [comments, setComments] = React.useState<CommentItem[]>(initialComments);
  const [submitting, setSubmitting] = React.useState(false);
  const [form, setForm] = React.useState({
    name: "",
    phone: "",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const result = await createBlogComment({
        postId,
        name: form.name,
        phone: form.phone,
        message: form.message,
      });
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      setComments((prev) => [
        {
          id: result.comment.id,
          name: result.comment.name,
          message: result.comment.message,
          createdAt: result.comment.createdAt,
        },
        ...prev,
      ]);
      setForm({ name: "", phone: "", message: "" });
      toast.success("Comment posted. Thank you for sharing!");
    } catch (err) {
      console.error(err);
      toast.error("Could not post your comment. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const commentCount = comments.length;

  return (
    <div className="comment-area mt-5">
      <h4 className="black mb-4 d-flex align-items-center gap-2">
        <MessageCircle size={22} style={{ color: "var(--p1-clr)" }} />
        {commentCount === 0
          ? "Be the first to comment"
          : `${commentCount} comment${commentCount === 1 ? "" : "s"}`}
      </h4>

      {commentCount === 0 ? (
        <div className="blog-comment-empty rounded-4 p-4 mb-4">
          <p className="pra mb-0">
            No comments yet — share your thoughts below and we&apos;ll reach
            out to you directly if you have a follow-up question.
          </p>
        </div>
      ) : (
        <div className="d-flex flex-column gap-3 mb-5">
          {comments.map((c) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="blog-comment-card d-flex gap-3 rounded-4 p-3 p-md-4"
            >
              <div
                className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                style={{
                  width: 52,
                  height: 52,
                  background:
                    "linear-gradient(135deg, var(--p1-clr), var(--p2-clr))",
                  color: "#fff",
                  fontWeight: 800,
                  fontSize: "0.95rem",
                }}
              >
                {initials(c.name)}
              </div>
              <div className="flex-grow-1 min-w-0">
                <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-1">
                  <h5 className="black fw_800 mb-0">{c.name}</h5>
                  <span className="blog-comment-date pra">
                    {formatDateTime(c.createdAt)}
                  </span>
                </div>
                <p className="pra mb-0" style={{ lineHeight: 1.6 }}>
                  {c.message}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="contact-forms blog-form blog-comment-form rounded-4 p-4 p-md-5"
      >
        <h4 className="black mb-2">Leave a comment</h4>
        <p className="pra mb-4" style={{ fontSize: "0.88rem" }}>
          Share your thoughts or a follow-up question. We use your phone number
          to reach out if our pharmacist needs to follow up — we never publish
          it.
        </p>

        <div className="row g-3">
          <div className="col-lg-6">
            <label
              className="d-flex align-items-center gap-2 mb-1 fw_700 black"
              style={{ fontSize: "0.85rem" }}
            >
              <User size={14} style={{ color: "var(--p1-clr)" }} /> Your name
            </label>
            <input
              type="text"
              required
              minLength={2}
              value={form.name}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder="Full name"
              className="form-control blog-comment-input"
            />
          </div>
          <div className="col-lg-6">
            <label
              className="d-flex align-items-center gap-2 mb-1 fw_700 black"
              style={{ fontSize: "0.85rem" }}
            >
              <Phone size={14} style={{ color: "var(--p1-clr)" }} /> Phone
              number
            </label>
            <input
              type="tel"
              required
              value={form.phone}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, phone: e.target.value }))
              }
              placeholder="e.g. 024 123 4567"
              inputMode="tel"
              className="form-control blog-comment-input"
            />
          </div>
          <div className="col-lg-12">
            <label
              className="d-flex align-items-center gap-2 mb-1 fw_700 black"
              style={{ fontSize: "0.85rem" }}
            >
              <MessageCircle size={14} style={{ color: "var(--p1-clr)" }} />{" "}
              Your message
            </label>
            <textarea
              name="message"
              required
              minLength={4}
              value={form.message}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, message: e.target.value }))
              }
              placeholder="Write something kind, ask a question, or share what helped you…"
              rows={5}
              className="form-control blog-comment-input"
            />
          </div>
          <div className="col-lg-12 mt-4">
            <button
              type="submit"
              disabled={submitting}
              className="common-btn box-style first-box p2-bg text-white rounded-5 px-5 d-inline-flex align-items-center gap-2"
              style={{ opacity: submitting ? 0.7 : 1 }}
            >
              {submitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Posting…
                </>
              ) : (
                <>
                  <Send size={16} /> Post comment
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
