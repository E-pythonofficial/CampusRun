// controllers/bankController.js
import axios  from 'axios';
import prisma from '../lib/prisma.js';

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY;
const PAYSTACK_BASE   = 'https://api.paystack.co';

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/banks/list
// Returns all Nigerian banks from Paystack with their codes
// The frontend uses this to populate the bank dropdown
// ─────────────────────────────────────────────────────────────────────────────
export const getBankList = async (req, res) => {
  try {
    const response = await axios.get(`${PAYSTACK_BASE}/bank?currency=NGN&perPage=100`, {
      headers: { Authorization: `Bearer ${PAYSTACK_SECRET}` },
    });

    const banks = response.data.data.map(bank => ({
      name: bank.name,
      code: bank.code,        // e.g. "058" for GTBank — needed for transfers
      id:   bank.id,
    }));

    return res.status(200).json(banks);
  } catch (error) {
    console.error('getBankList error:', error.message);
    return res.status(500).json({ message: 'Failed to fetch bank list from Paystack' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/banks/verify?bankCode=058&accountNumber=0123456789
// Verifies an account number and returns the account name from Paystack
// This is how you confirm "Adebayo Oluwaseun" actually owns account 0123456789
// ─────────────────────────────────────────────────────────────────────────────
export const verifyAccountNumber = async (req, res) => {
  try {
    const { bankCode, accountNumber } = req.query;

    if (!bankCode || !accountNumber) {
      return res.status(400).json({ message: 'bankCode and accountNumber are required' });
    }

    if (accountNumber.length !== 10) {
      return res.status(400).json({ message: 'Account number must be exactly 10 digits' });
    }

    const response = await axios.get(
      `${PAYSTACK_BASE}/bank/resolve?account_number=${accountNumber}&bank_code=${bankCode}`,
      {
        headers: { Authorization: `Bearer ${PAYSTACK_SECRET}` },
      }
    );

    if (!response.data.status) {
      return res.status(400).json({ message: 'Could not verify account. Please check the details.' });
    }

    const { account_name, account_number } = response.data.data;

    return res.status(200).json({
      accountName:   account_name,   // e.g. "ADEBAYO OLUWASEUN"
      accountNumber: account_number,
    });
  } catch (error) {
    console.error('verifyAccountNumber error:', error.response?.data || error.message);

    // Paystack returns 422 if account not found
    if (error.response?.status === 422) {
      return res.status(400).json({
        message: 'Account not found. Please check your account number and bank.',
      });
    }

    return res.status(500).json({ message: 'Account verification failed. Try again.' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/banks/save
// Saves verified bank details to the runner's profile
// Must be called AFTER verifyAccountNumber confirms the account name
// ─────────────────────────────────────────────────────────────────────────────
export const saveBankDetails = async (req, res) => {
  try {
    const userId = req.user.id;
    const { bankName, bankCode, accountNumber, accountName } = req.body;

    if (!bankName || !bankCode || !accountNumber || !accountName) {
      return res.status(400).json({
        message: 'bankName, bankCode, accountNumber, and accountName are all required',
      });
    }

    if (accountNumber.length !== 10 || !/^\d+$/.test(accountNumber)) {
      return res.status(400).json({ message: 'Account number must be exactly 10 digits' });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        bankName,
        bankCode,
        accountNumber,
        accountName,
        bankDetailsSubmitted: true,
      },
      select: {
        id:                  true,
        bankName:            true,
        bankCode:            true,
        accountNumber:       true,
        accountName:         true,
        bankDetailsSubmitted: true,
      },
    });

    return res.status(200).json({
      message: 'Bank details saved successfully',
      bank:    updatedUser,
    });
  } catch (error) {
    console.error('saveBankDetails error:', error);
    return res.status(500).json({ message: 'Failed to save bank details' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/banks/my-details
// Returns the runner's saved bank details (masked for display)
// ─────────────────────────────────────────────────────────────────────────────
export const getMyBankDetails = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await prisma.user.findUnique({
      where:  { id: userId },
      select: {
        bankName:            true,
        bankCode:            true,
        accountNumber:       true,
        accountName:         true,
        bankDetailsSubmitted: true,
      },
    });

    if (!user) return res.status(404).json({ message: 'User not found' });

    return res.status(200).json({
      ...user,
      // Mask the account number for display: show only last 4 digits
      accountNumberMasked: user.accountNumber
        ? `**** **** ${user.accountNumber.slice(-4)}`
        : null,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch bank details' });
  }
};