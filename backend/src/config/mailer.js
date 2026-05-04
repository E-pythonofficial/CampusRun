import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM = 'CampusRun <onboarding@resend.dev>';

// ── Shared layout helpers ─────────────────────────────────────────────────────
const header = (accent = '#FF6B00') => `
  <div style="background:${accent};padding:24px 32px;">
    <h1 style="color:white;margin:0;font-size:20px;font-family:Arial,sans-serif;">CampusRun</h1>
  </div>`;

const footer = `
  <div style="padding:20px 32px;background:#f9f9f9;border-top:1px solid #eee;">
    <p style="color:#aaa;font-size:12px;margin:0;font-family:Arial,sans-serif;">
      Sent by CampusRun. Do not reply directly to this email.
    </p>
  </div>`;

const wrap = (content, accent = '#FF6B00') => `
  <!DOCTYPE html><html>
  <body style="margin:0;padding:40px 0;background:#f0f0f0;font-family:Arial,sans-serif;">
    <div style="max-width:540px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;">
      ${header(accent)}
      <div style="padding:32px;">${content}</div>
      ${footer}
    </div>
  </body></html>`;

const h2 = (t) => `<h2 style="color:#111;margin-top:0;">${t}</h2>`;
const p  = (t) => `<p style="color:#444;line-height:1.7;font-size:15px;">${t}</p>`;
const box = (label, value, color = '#FF6B00') => `
  <div style="border-left:4px solid ${color};background:#fafafa;border-radius:6px;padding:14px 18px;margin:18px 0;">
    <p style="margin:0 0 4px;font-weight:bold;font-size:12px;color:#888;text-transform:uppercase;">${label}</p>
    <p style="margin:0;color:#111;font-size:15px;">${value}</p>
  </div>`;

const send = async (to, subject, html) => {
  const { error } = await resend.emails.send({ from: FROM, to, subject, html });
  if (error) throw new Error(error.message);
};

// ── 1. Application received ───────────────────────────────────────────────────
export const sendApplicationReceivedEmail = async (email, fullName) => {
  await send(email, 'We received your CampusRun application!', wrap(`
    ${h2(`Hi ${fullName},`)}
    ${p('Thank you for applying to become a <strong>Campus Runner</strong>. We\'ve received your application and our team will review it carefully.')}
    ${p('You\'ll hear from us within <strong>2–3 business days</strong>. If shortlisted, we\'ll reach out with next steps.')}
    ${p('Sit tight! 🙌')}
  `));
};

// ── 2. Interview invite ───────────────────────────────────────────────────────
export const sendInterviewInviteEmail = async (email, fullName, meetLink, scheduledAt) => {
  const formatted = new Date(scheduledAt).toLocaleString('en-NG', {
    weekday: 'long', year: 'numeric', month: 'long',
    day: 'numeric', hour: '2-digit', minute: '2-digit',
  });
  await send(email, "You're invited to a CampusRun interview! 🎯", wrap(`
    ${h2(`Great news, ${fullName}! 🎉`)}
    ${p('After reviewing your application, we\'d love to meet you briefly online.')}
    ${box('📅 Interview Time', formatted)}
    ${box('🎥 Google Meet', `<a href="${meetLink}" style="color:#FF6B00;">${meetLink}</a>`)}
    ${p('Please be on time and in a <strong>quiet space</strong>. We look forward to speaking with you!')}
  `));
};

// ── 3. Approval ───────────────────────────────────────────────────────────────
export const sendApprovalEmail = async (email, fullName) => {
  await send(email, "You're approved — Welcome to CampusRun! 🎉", wrap(`
    ${h2(`Congratulations, ${fullName}! 🚀`)}
    ${p('You\'ve been officially approved as a <strong>Campus Runner</strong>.')}
    ${p('Open your app right now — your <strong>runner dashboard</strong> is live. Start accepting deliveries and earning immediately.')}
    <div style="text-align:center;margin:28px 0;">
      <span style="background:#FF6B00;color:white;padding:12px 32px;border-radius:50px;font-weight:bold;font-size:15px;display:inline-block;">
        Let's get moving! 🏃
      </span>
    </div>
  `));
};

// ── 4. Rejection ──────────────────────────────────────────────────────────────
export const sendRejectionEmail = async (email, fullName, postInterview = false, reason = null) => {
  await send(email, 'Your CampusRun Application Update', wrap(`
    ${h2(`Hi ${fullName},`)}
    ${p(`Thank you for your interest in CampusRun${postInterview ? ' and for your time during the interview' : ''}.`)}
    ${p('After careful consideration, we\'re unable to move forward with your application at this time.')}
    ${reason ? box('Reason', reason, '#e53e3e') : ''}
    ${p('We appreciate your effort and wish you all the best.')}
  `, '#1a1a1a'));
};

// ── 5. Suspension ─────────────────────────────────────────────────────────────
export const sendSuspensionEmail = async (email, fullName, reason, suspendedUntil) => {
  const formatted = new Date(suspendedUntil).toLocaleDateString('en-NG', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });
  await send(email, 'Important: Your CampusRun account has been suspended', wrap(`
    ${h2(`Hi ${fullName},`)}
    ${p('Your CampusRun runner account has been <strong>temporarily suspended</strong>.')}
    ${reason ? box('Reason', reason, '#e53e3e') : ''}
    ${box('Suspended Until', formatted, '#e53e3e')}
    ${p('Your account reinstates automatically after this date. If you believe this is an error, contact us.')}
  `, '#e53e3e'));
};

// ── 6. Payout notification ────────────────────────────────────────────────────
export const sendPayoutEmail = async (email, fullName, amount) => {
  await send(email, '💸 Your CampusRun earnings have been sent!', wrap(`
    ${h2(`Payment sent, ${fullName}! 💸`)}
    ${p('Your weekly CampusRun earnings have been processed and sent to your account.')}
    ${box('Amount Paid', `<strong style="font-size:22px;color:#22c55e;">₦${Number(amount).toLocaleString()}</strong>`, '#22c55e')}
    ${p('Your in-app balance has been reset and you\'re ready for your next 7-day cycle. Keep running! 🚀')}
  `, '#22c55e'));
};

// ── 7. Nudge (inactive runner) ────────────────────────────────────────────────
export const sendNudgeEmail = async (email, fullName, customMessage = null) => {
  const msg = customMessage ||
    `We noticed you haven't been active on CampusRun recently. Students are waiting for deliveries and there are earnings to be made! Log in and check what's available.`;
  await send(email, "We miss you on CampusRun! 👋", wrap(`
    ${h2(`Hey ${fullName}, we miss you! 👋`)}
    ${p(msg)}
    <div style="text-align:center;margin:28px 0;">
      <span style="background:#FF6B00;color:white;padding:12px 28px;border-radius:50px;font-weight:bold;display:inline-block;">
        Open CampusRun App
      </span>
    </div>
  `));
};