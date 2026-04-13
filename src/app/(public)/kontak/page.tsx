"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { MapPin, Phone, Mail, Send, Loader2 } from "lucide-react";

export default function KontakPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus("idle");

    try {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "";
      const res = await fetch(`${baseUrl}/api/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setSubmitStatus("success");
        setFormData({ name: "", email: "", subject: "", message: "" });
      } else {
        setSubmitStatus("error");
      }
    } catch {
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      {/* Hero Banner */}
      <section className="bg-gradient-to-br from-primary-500 to-primary-700 text-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Hubungi Kami
          </h1>
          <p className="text-lg text-white/90 max-w-2xl mx-auto">
            Punya pertanyaan atau ingin bergabung? Jangan ragu untuk menghubungi
            kami. Tim kami siap membantu Anda.
          </p>
        </div>
      </section>

      {/* Contact Form & Info */}
      <section className="py-16 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Contact Form - Left Column */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl text-gray-900">
                    Kirim Pesan
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Name */}
                    <div>
                      <label
                        htmlFor="name"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Nama Lengkap
                      </label>
                      <input
                        id="name"
                        name="name"
                        type="text"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                        placeholder="Masukkan nama lengkap Anda"
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <label
                        htmlFor="email"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Alamat Email
                      </label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                        placeholder="contoh@email.com"
                      />
                    </div>

                    {/* Subject */}
                    <div>
                      <label
                        htmlFor="subject"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Subjek
                      </label>
                      <input
                        id="subject"
                        name="subject"
                        type="text"
                        required
                        value={formData.subject}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                        placeholder="Subjek pesan Anda"
                      />
                    </div>

                    {/* Message */}
                    <div>
                      <label
                        htmlFor="message"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Pesan
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        required
                        rows={5}
                        value={formData.message}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors resize-none"
                        placeholder="Tulis pesan Anda di sini..."
                      />
                    </div>

                    {/* Submit Status */}
                    {submitStatus === "success" && (
                      <div className="p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg">
                        Pesan Anda berhasil terkirim! Kami akan segera
                        menghubungi Anda.
                      </div>
                    )}
                    {submitStatus === "error" && (
                      <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                        Terjadi kesalahan saat mengirim pesan. Silakan coba
                        lagi.
                      </div>
                    )}

                    {/* Submit Button */}
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full sm:w-auto"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Mengirim...
                        </>
                      ) : (
                        <>
                          <Send className="mr-2 h-4 w-4" />
                          Kirim Pesan
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Contact Info - Right Column */}
            <div className="space-y-6">
              {/* Contact Info Cards */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg text-gray-900">
                    Informasi Kontak
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-lg bg-primary-100 flex items-center justify-center flex-shrink-0">
                      <MapPin className="h-5 w-5 text-primary-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Alamat</p>
                      <p className="text-sm text-gray-600">
                        Jl. Merdeka No. 45, Kecamatan Contoh
                        <br />
                        Kota Bandung, Jawa Barat 40123
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-lg bg-secondary-100 flex items-center justify-center flex-shrink-0">
                      <Phone className="h-5 w-5 text-secondary-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Telepon</p>
                      <p className="text-sm text-gray-600">
                        +62 812-3456-7890
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-lg bg-accent-100 flex items-center justify-center flex-shrink-0">
                      <Mail className="h-5 w-5 text-accent-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Email</p>
                      <p className="text-sm text-gray-600">
                        info@sahabatabk.org
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Google Maps Placeholder */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg text-gray-900">
                    Peta Lokasi
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-48 bg-gray-200 rounded-lg flex items-center justify-center">
                    <div className="text-center text-gray-400">
                      <MapPin className="h-8 w-8 mx-auto mb-2" />
                      <p className="text-sm font-medium">Peta Lokasi</p>
                      <p className="text-xs mt-1">Google Maps Embed</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
