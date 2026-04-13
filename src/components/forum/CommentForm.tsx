"use client";

import React, { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

const commentSchema = z.object({
  content: z.string().min(1, "Komentar tidak boleh kosong"),
});

type CommentFormData = z.infer<typeof commentSchema>;

interface CommentFormProps {
  onSubmit: (content: string, parentId?: string) => Promise<void>;
  placeholder?: string;
  parentId?: string;
}

function insertText(
  textarea: HTMLTextAreaElement | null,
  before: string,
  after: string = ""
) {
  if (!textarea) return;
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const selected = textarea.value.substring(start, end);
  const replacement = before + selected + after;
  const newValue =
    textarea.value.substring(0, start) + replacement + textarea.value.substring(end);
  textarea.value = newValue;
  textarea.focus();
  textarea.selectionStart = start + before.length;
  textarea.selectionEnd = start + before.length + selected.length;
  textarea.dispatchEvent(new Event("input", { bubbles: true }));
}

export function CommentForm({ onSubmit, placeholder = "Tulis komentar...", parentId }: CommentFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<CommentFormData>({
    resolver: zodResolver(commentSchema),
    defaultValues: { content: "" },
  });

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleBold = () => insertText(textareaRef.current, "**", "**");
  const handleItalic = () => insertText(textareaRef.current, "_", "_");
  const handleBullet = () => insertText(textareaRef.current, "\n- ", "");
  const handleLink = () => {
    if (textareaRef.current) {
      const selected =
        textareaRef.current.value.substring(
          textareaRef.current.selectionStart,
          textareaRef.current.selectionEnd
        ) || "teks";
      insertText(textareaRef.current, `[${selected}](url)`);
    }
  };

  const onFormSubmit = async (data: CommentFormData) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data.content, parentId);
      reset();
    } catch (error) {
      // Error handled by parent
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-2">
      <div className="flex items-center gap-1 bg-gray-50 rounded-lg p-1 border border-gray-200">
        <button
          type="button"
          onClick={handleBold}
          className="p-1.5 rounded hover:bg-gray-200 text-gray-600 font-bold text-sm"
          title="Bold"
        >
          B
        </button>
        <button
          type="button"
          onClick={handleItalic}
          className="p-1.5 rounded hover:bg-gray-200 text-gray-600 italic text-sm"
          title="Italic"
        >
          I
        </button>
        <button
          type="button"
          onClick={handleBullet}
          className="p-1.5 rounded hover:bg-gray-200 text-gray-600 text-sm"
          title="Bullet List"
        >
          &#8226;
        </button>
        <button
          type="button"
          onClick={handleLink}
          className="p-1.5 rounded hover:bg-gray-200 text-gray-600 text-sm"
          title="Link"
        >
          🔗
        </button>
      </div>
      <textarea
        ref={textareaRef}
        onChange={(e) => {
          register("content").onChange(e);
        }}
        onBlur={register("content").onBlur}
        name={register("content").name}
        placeholder={placeholder}
        rows={3}
        className={cn(
          "w-full rounded-lg border px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-y",
          errors.content ? "border-red-300" : "border-gray-300"
        )}
      />
      {errors.content && (
        <p className="text-sm text-red-500">{errors.content.message}</p>
      )}
      <div className="flex justify-end">
        <Button type="submit" size="sm" disabled={isSubmitting}>
          {isSubmitting ? "Mengirim..." : parentId ? "Balas" : "Kirim Komentar"}
        </Button>
      </div>
    </form>
  );
}
