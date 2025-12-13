# Fix Admin Transactions and Verification

## Goal Description
Fix the admin dashboard to display the most recent 2000 transactions (currently showing 0 or limited).
Update the vote verification logic to check directly against the Database and Mesomb, removing any potential double-counting or reliance on external "python" logic (though none found, the fix addresses the "verify from db" request).

## Proposed Changes

### Backend API (`app/api/admin-7f8a9b/transactions/route.ts`)
- [MODIFY] Increase `MAX_LIMIT` from 500 to 2000.
- [MODIFY] Increase `DEFAULT_LIMIT` from 100 to 2000 (to "read all the must recent 2000").

### Verification Logic (`app/api/admin-7f8a9b/transactions/verify/route.ts`)
- [MODIFY] Add a check at the beginning: if `transaction.status === 'completed'`, return success immediately. This satisfies "verify ... directly from the db" and prevents double-counting votes if the button is clicked twice.
- [KEEP] Continue to check Mesomb if status is not completed.

## Verification Plan

### Manual Verification
- Deploy/Build and check the Admin Dashboard.
- Verify "Transactions" count shows more transactions.
- Test the "Verify" button on a pending transaction (should work as before).
- Test validation on an already completed transaction (should return "already verified" or success without adding votes).
