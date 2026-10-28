# Confirming payments — staff guide

Admins and moderators confirm payments in the dashboard: **Payments → To check**.

## How it works

1. **The participant registers** on the website. They get a registration ID
   (`MWF-2026-00042`) by email and on screen, with the mobile-money numbers and
   bank accounts. Their payment shows as **Pending** in the dashboard.
2. **They pay** by mobile money or bank transfer, ideally using their
   registration ID as the reference.
3. **You check the money arrived.** Open the pending payment (oldest first),
   find the matching M-Pesa / Tigo Pesa / Airtel Money message or bank
   statement line, and check that:
   - the sender name or phone matches the participant (shown at the top), and
   - the amount matches the fee shown in the panel.
4. **Confirm.** Choose how they paid, type the transaction ID (e.g. the M-Pesa
   code `QJK3H2L9XP`) and the amount received, then press **Confirm payment**.
   The participant gets a confirmation email, and a printable **Receipt** is
   available.

## Entry fees (2026)

The fee depends on who is taking part, not on the race (organiser's letter of
15 October 2026):

| Participant | Fee |
|---|---|
| Adults and youth (11–64) | TZS 40,000 |
| Jogging & running club members | TZS 35,000 |
| Students (school, college, university) | TZS 25,000 |
| Children (5–10) and elders (65+) | TZS 15,000 |
| From outside East Africa and SADC (except children and elders) | USD 30 |

Children and elders are set automatically from the date of birth. Club
members and students choose their type themselves — check the club card or
student ID when they collect their kit. The payment panel always shows the
fee for that person.

## Special cases

- **Reference already used.** If the same transaction ID was already used for
  another registration, the dashboard warns you and shows who. Continue with
  **Confirm anyway** only when one payment really covers several people (e.g. a
  parent paying for two children) — say so in the note.
- **Less than the fee.** The dashboard warns you. Confirm only if the
  difference was agreed, and write why in the note.
- **No payment found.** After a reminder, use **Mark as not paid** with a short
  reason. If they pay later, open it under **Not paid → Reopen payment**.
- **Confirmed by mistake.** Only an **admin** can undo a confirmed payment
  (**Undo confirmation**, with a reason). Moderators can't — the database
  refuses it too.

## Payment history

Every change (confirmed, not paid, reopened, undone) is saved automatically
with who did it, when, the reference, amount and note. It shows at the
bottom of the payment panel and can't be edited or deleted from the
dashboard.

## Who can do what

| | Moderator | Admin |
|---|---|---|
| See registrations, export CSV | ✓ | ✓ |
| Confirm a payment, mark as not paid, reopen a "not paid" | ✓ | ✓ |
| Undo a confirmed payment | — | ✓ |
| Answer messages (contact & partnership forms) | ✓ | ✓ |
| Edit events, schedule and banners | — | ✓ |
| Create or remove staff accounts | — | ✓ |
