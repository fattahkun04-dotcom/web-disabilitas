import { Resend } from "resend";

let _resend: Resend | null = null;

function getResend(): Resend {
  if (!_resend) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.warn("RESEND_API_KEY environment variable is not set - email functionality will not work");
      // Return a dummy instance to prevent build errors
      _resend = new Resend("re_dummy_key_for_build");
    } else {
      _resend = new Resend(apiKey);
    }
  }
  return _resend;
}

export { getResend };

export const sendVerificationEmail = async (
  email: string,
  name: string
) => {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.warn("Skipping verification email - RESEND_API_KEY not configured");
      return { success: true }; // Don't fail registration if email is not configured
    }

    const resend = getResend();
    await resend.emails.send({
      from:
        process.env.RESEND_FROM_EMAIL || "noreply@sahabatabk.com",
      to: email,
      subject: "Selamat Datang di SahabatABK!",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #4A90D9;">Selamat Datang, ${name}!</h1>
          <p>Terima kasih telah bergabung dengan SahabatABK Platform.</p>
          <p>Pendaftaran Anda sedang dalam proses verifikasi oleh pengurus. Anda akan menerima email konfirmasi setelah akun Anda diaktifkan.</p>
          <p>Jika ada pertanyaan, jangan ragu untuk menghubungi kami.</p>
          <hr style="margin: 24px 0; border: none; border-top: 1px solid #e5e7eb;" />
          <p style="color: #6b7280; font-size: 14px;">SahabatABK Platform - Bersama Lebih Kuat</p>
        </div>
      `,
    });
    return { success: true };
  } catch (error) {
    console.error("Failed to send verification email:", error);
    return { success: false, error };
  }
};

export const sendWelcomeEmail = async (
  email: string,
  name: string
) => {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.warn("Skipping welcome email - RESEND_API_KEY not configured");
      return { success: true };
    }

    const resend = getResend();
    await resend.emails.send({
      from:
        process.env.RESEND_FROM_EMAIL || "noreply@sahabatabk.com",
      to: email,
      subject: "Akun Anda Telah Diaktifkan - SahabatABK",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #7ED321;">Akun Anda Telah Aktif! 🎉</h1>
          <p>Halo ${name},</p>
          <p>Kabar baik! Akun Anda telah diverifikasi dan diaktifkan oleh pengurus.</p>
          <p>Anda sekarang dapat mengakses seluruh fitur platform:</p>
          <ul>
            <li>Melihat dan mendaftar event</li>
            <li>Mengikuti diskusi di forum</li>
            <li>Melihat transparansi anggaran</li>
            <li>Mengelola profil pribadi</li>
          </ul>
          <p style="margin-top: 24px;">
            <a href="${process.env.NEXTAUTH_URL}/dashboard" style="background: #4A90D9; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Buka Dashboard</a>
          </p>
          <hr style="margin: 24px 0; border: none; border-top: 1px solid #e5e7eb;" />
          <p style="color: #6b7280; font-size: 14px;">SahabatABK Platform - Bersama Lebih Kuat</p>
        </div>
      `,
    });
    return { success: true };
  } catch (error) {
    console.error("Failed to send welcome email:", error);
    return { success: false, error };
  }
};

export const sendRSVPConfirmationEmail = async (
  email: string,
  eventName: string,
  eventDate: string
) => {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.warn("Skipping RSVP email - RESEND_API_KEY not configured");
      return { success: true };
    }

    const resend = getResend();
    await resend.emails.send({
      from:
        process.env.RESEND_FROM_EMAIL || "noreply@sahabatabk.com",
      to: email,
      subject: `Konfirmasi RSVP - ${eventName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #4A90D9;">RSVP Terkonfirmasi ✅</h1>
          <p>Anda telah terdaftar untuk mengikuti event:</p>
          <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;">
            <strong>${eventName}</strong><br />
            📅 ${eventDate}
          </div>
          <p>Sampai jumpa di event!</p>
          <hr style="margin: 24px 0; border: none; border-top: 1px solid #e5e7eb;" />
          <p style="color: #6b7280; font-size: 14px;">SahabatABK Platform</p>
        </div>
      `,
    });
    return { success: true };
  } catch (error) {
    console.error("Failed to send RSVP email:", error);
    return { success: false, error };
  }
};
