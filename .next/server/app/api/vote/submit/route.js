/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(() => {
var exports = {};
exports.id = "app/api/vote/submit/route";
exports.ids = ["app/api/vote/submit/route"];
exports.modules = {

/***/ "(rsc)/./app/api/lib/mesomb.ts":
/*!*******************************!*\
  !*** ./app/api/lib/mesomb.ts ***!
  \*******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   checkPaymentStatus: () => (/* binding */ checkPaymentStatus),\n/* harmony export */   collectPayment: () => (/* binding */ collectPayment),\n/* harmony export */   dynamic: () => (/* binding */ dynamic),\n/* harmony export */   getMesombClient: () => (/* binding */ getMesombClient),\n/* harmony export */   makeWithdrawal: () => (/* binding */ makeWithdrawal),\n/* harmony export */   runtime: () => (/* binding */ runtime)\n/* harmony export */ });\n/* harmony import */ var _hachther_mesomb__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @hachther/mesomb */ \"(rsc)/./node_modules/@hachther/mesomb/dist/index.js\");\n/**\n * Mesomb Payment Service for Vercel\n * Direct SDK integration without fetch wrapper\n */ const runtime = 'nodejs';\nconst dynamic = 'force-dynamic';\n\n// Initialize Mesomb client with hardcoded credentials\nfunction getMesombClient() {\n    // Hardcoded Mesomb API credentials\n    const applicationKey = 'a4120748a7093365013b04a8f42bdd24f299936b';\n    const accessKey = 'f6c26b42-24de-4ec6-8b1b-7a808052e335';\n    const secretKey = 'e45b1545-1b5a-49c4-aadf-ba4cf700a8dc';\n    // Create PaymentOperation instance with object parameter\n    return new _hachther_mesomb__WEBPACK_IMPORTED_MODULE_0__.PaymentOperation({\n        applicationKey,\n        accessKey,\n        secretKey\n    });\n}\nasync function collectPayment(params) {\n    try {\n        const payment = getMesombClient();\n        const response = await payment.makeCollect({\n            amount: params.amount,\n            service: params.service,\n            payer: params.payer,\n            nonce: params.nonce,\n            country: 'CM',\n            currency: 'XAF',\n            customer: {\n                email: 'vote@nbdanceaward.com',\n                firstName: 'Voter',\n                lastName: 'NBDance',\n                town: 'Douala',\n                region: 'Littoral',\n                country: 'CM',\n                address: 'Cameroon'\n            },\n            location: {\n                town: 'Douala',\n                region: 'Littoral',\n                country: 'CM'\n            },\n            products: [\n                {\n                    name: 'Vote NBDance Award',\n                    category: 'Voting',\n                    quantity: Math.floor(params.amount / 105),\n                    amount: params.amount\n                }\n            ]\n        });\n        if (true) {\n            console.log('Mesomb response:', {\n                success: response.success,\n                status: response.status,\n                message: response.message,\n                reference: response.reference\n            });\n        }\n        if (typeof response.isOperationSuccess === 'function' && !response.isOperationSuccess()) {\n            return {\n                success: false,\n                error: response.message || 'Payment operation failed'\n            };\n        }\n        if (typeof response.isTransactionSuccess === 'function' && !response.isTransactionSuccess()) {\n            return {\n                success: true,\n                reference: response.reference || response.transaction?.pk,\n                message: 'Payment initiated. Please complete on your phone.'\n            };\n        }\n        return {\n            success: true,\n            reference: response.reference || response.transaction?.pk,\n            message: 'Payment initiated successfully'\n        };\n    } catch (error) {\n        console.error('Mesomb payment error:', error);\n        if (error.message?.includes('credentials are not configured')) {\n            return {\n                success: false,\n                error: 'Payment system is not configured. Please contact support.'\n            };\n        }\n        return {\n            success: false,\n            error: error.message || 'Payment initiation failed'\n        };\n    }\n}\nasync function checkPaymentStatus(reference) {\n    try {\n        const payment = getMesombClient();\n        const transactions = await payment.getTransactions([\n            reference\n        ], 'MESOMB');\n        if (!transactions || transactions.length === 0) {\n            return {\n                success: false,\n                error: 'Payment is still processing'\n            };\n        }\n        const transaction = transactions[0];\n        const isSuccess = transaction.status === 'SUCCESS';\n        return {\n            success: isSuccess,\n            reference: reference,\n            message: isSuccess ? 'Payment confirmed' : `Payment status: ${transaction.status}`\n        };\n    } catch (error) {\n        console.error('Mesomb status check error:', error);\n        return {\n            success: false,\n            error: 'Payment is still processing. Please wait...'\n        };\n    }\n}\nasync function makeWithdrawal(params) {\n    try {\n        const payment = getMesombClient();\n        const response = await payment.makeDeposit({\n            amount: params.amount,\n            service: params.service,\n            receiver: params.receiver,\n            nonce: params.nonce,\n            country: 'CM',\n            currency: 'XAF',\n            customer: {\n                email: 'admin@nbdanceaward.com',\n                firstName: 'Admin',\n                lastName: 'NBDance',\n                town: 'Douala',\n                region: 'Littoral',\n                country: 'CM',\n                address: 'Cameroon'\n            },\n            location: {\n                town: 'Douala',\n                region: 'Littoral',\n                country: 'CM'\n            },\n            products: [\n                {\n                    name: 'Withdrawal NBDance Award',\n                    category: 'Withdrawal',\n                    quantity: 1,\n                    amount: params.amount\n                }\n            ]\n        });\n        if (typeof response.isOperationSuccess === 'function' && !response.isOperationSuccess()) {\n            return {\n                success: false,\n                error: response.message || 'Withdrawal operation failed'\n            };\n        }\n        if (typeof response.isTransactionSuccess === 'function' && !response.isTransactionSuccess()) {\n            return {\n                success: true,\n                reference: response.reference || response.transaction?.pk,\n                message: 'Withdrawal initiated. Processing...'\n            };\n        }\n        return {\n            success: true,\n            reference: response.reference || response.transaction?.pk,\n            message: 'Withdrawal completed successfully'\n        };\n    } catch (error) {\n        console.error('Mesomb withdrawal error:', error);\n        return {\n            success: false,\n            error: error.message || 'Withdrawal failed'\n        };\n    }\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,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O2dCQUNURyxXQUFXNUIsU0FBUzRCLFNBQVMsSUFBSTVCLFNBQVNnQyxXQUFXLEVBQUVDO2dCQUN2RE4sU0FBUztZQUNiO1FBQ0o7UUFFQSxPQUFPO1lBQ0hGLFNBQVM7WUFDVEcsV0FBVzVCLFNBQVM0QixTQUFTLElBQUk1QixTQUFTZ0MsV0FBVyxFQUFFQztZQUN2RE4sU0FBUztRQUNiO0lBQ0osRUFBRSxPQUFPRyxPQUFZO1FBQ2pCUCxRQUFRTyxLQUFLLENBQUMsNEJBQTRCQTtRQUMxQyxPQUFPO1lBQ0hMLFNBQVM7WUFDVEssT0FBT0EsTUFBTUgsT0FBTyxJQUFJO1FBQzVCO0lBQ0o7QUFDSiIsInNvdXJjZXMiOlsiL2hvbWUvYWxtaWdodC9Eb2N1bWVudHMvTkJEYW5jZUF3YXJkL2FwcC9hcGkvbGliL21lc29tYi50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIE1lc29tYiBQYXltZW50IFNlcnZpY2UgZm9yIFZlcmNlbFxuICogRGlyZWN0IFNESyBpbnRlZ3JhdGlvbiB3aXRob3V0IGZldGNoIHdyYXBwZXJcbiAqL1xuXG5leHBvcnQgY29uc3QgcnVudGltZSA9ICdub2RlanMnO1xuZXhwb3J0IGNvbnN0IGR5bmFtaWMgPSAnZm9yY2UtZHluYW1pYyc7XG5cbmltcG9ydCB7IFBheW1lbnRPcGVyYXRpb24gfSBmcm9tICdAaGFjaHRoZXIvbWVzb21iJztcblxuLy8gSW5pdGlhbGl6ZSBNZXNvbWIgY2xpZW50IHdpdGggaGFyZGNvZGVkIGNyZWRlbnRpYWxzXG5leHBvcnQgZnVuY3Rpb24gZ2V0TWVzb21iQ2xpZW50KCkge1xuICAgIC8vIEhhcmRjb2RlZCBNZXNvbWIgQVBJIGNyZWRlbnRpYWxzXG4gICAgY29uc3QgYXBwbGljYXRpb25LZXkgPSAnYTQxMjA3NDhhNzA5MzM2NTAxM2IwNGE4ZjQyYmRkMjRmMjk5OTM2Yic7XG4gICAgY29uc3QgYWNjZXNzS2V5ID0gJ2Y2YzI2YjQyLTI0ZGUtNGVjNi04YjFiLTdhODA4MDUyZTMzNSc7XG4gICAgY29uc3Qgc2VjcmV0S2V5ID0gJ2U0NWIxNTQ1LTFiNWEtNDljNC1hYWRmLWJhNGNmNzAwYThkYyc7XG5cbiAgICAvLyBDcmVhdGUgUGF5bWVudE9wZXJhdGlvbiBpbnN0YW5jZSB3aXRoIG9iamVjdCBwYXJhbWV0ZXJcbiAgICByZXR1cm4gbmV3IFBheW1lbnRPcGVyYXRpb24oe1xuICAgICAgICBhcHBsaWNhdGlvbktleSxcbiAgICAgICAgYWNjZXNzS2V5LFxuICAgICAgICBzZWNyZXRLZXksXG4gICAgfSk7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgQ29sbGVjdFBheW1lbnRQYXJhbXMge1xuICAgIGFtb3VudDogbnVtYmVyO1xuICAgIHNlcnZpY2U6ICdNVE4nIHwgJ09SQU5HRSc7XG4gICAgcGF5ZXI6IHN0cmluZztcbiAgICBub25jZTogc3RyaW5nO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIFdpdGhkcmF3YWxQYXJhbXMge1xuICAgIGFtb3VudDogbnVtYmVyO1xuICAgIHNlcnZpY2U6ICdNVE4nIHwgJ09SQU5HRSc7XG4gICAgcmVjZWl2ZXI6IHN0cmluZztcbiAgICBub25jZTogc3RyaW5nO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIFBheW1lbnRSZXN1bHQge1xuICAgIHN1Y2Nlc3M6IGJvb2xlYW47XG4gICAgcmVmZXJlbmNlPzogc3RyaW5nO1xuICAgIG1lc3NhZ2U/OiBzdHJpbmc7XG4gICAgZXJyb3I/OiBzdHJpbmc7XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBjb2xsZWN0UGF5bWVudChwYXJhbXM6IENvbGxlY3RQYXltZW50UGFyYW1zKTogUHJvbWlzZTxQYXltZW50UmVzdWx0PiB7XG4gICAgdHJ5IHtcbiAgICAgICAgY29uc3QgcGF5bWVudCA9IGdldE1lc29tYkNsaWVudCgpO1xuXG4gICAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgcGF5bWVudC5tYWtlQ29sbGVjdCh7XG4gICAgICAgICAgICBhbW91bnQ6IHBhcmFtcy5hbW91bnQsXG4gICAgICAgICAgICBzZXJ2aWNlOiBwYXJhbXMuc2VydmljZSxcbiAgICAgICAgICAgIHBheWVyOiBwYXJhbXMucGF5ZXIsXG4gICAgICAgICAgICBub25jZTogcGFyYW1zLm5vbmNlLFxuICAgICAgICAgICAgY291bnRyeTogJ0NNJyxcbiAgICAgICAgICAgIGN1cnJlbmN5OiAnWEFGJyxcbiAgICAgICAgICAgIGN1c3RvbWVyOiB7XG4gICAgICAgICAgICAgICAgZW1haWw6ICd2b3RlQG5iZGFuY2Vhd2FyZC5jb20nLFxuICAgICAgICAgICAgICAgIGZpcnN0TmFtZTogJ1ZvdGVyJyxcbiAgICAgICAgICAgICAgICBsYXN0TmFtZTogJ05CRGFuY2UnLFxuICAgICAgICAgICAgICAgIHRvd246ICdEb3VhbGEnLFxuICAgICAgICAgICAgICAgIHJlZ2lvbjogJ0xpdHRvcmFsJyxcbiAgICAgICAgICAgICAgICBjb3VudHJ5OiAnQ00nLFxuICAgICAgICAgICAgICAgIGFkZHJlc3M6ICdDYW1lcm9vbicsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgbG9jYXRpb246IHtcbiAgICAgICAgICAgICAgICB0b3duOiAnRG91YWxhJyxcbiAgICAgICAgICAgICAgICByZWdpb246ICdMaXR0b3JhbCcsXG4gICAgICAgICAgICAgICAgY291bnRyeTogJ0NNJyxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBwcm9kdWN0czogW1xuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgbmFtZTogJ1ZvdGUgTkJEYW5jZSBBd2FyZCcsXG4gICAgICAgICAgICAgICAgICAgIGNhdGVnb3J5OiAnVm90aW5nJyxcbiAgICAgICAgICAgICAgICAgICAgcXVhbnRpdHk6IE1hdGguZmxvb3IocGFyYW1zLmFtb3VudCAvIDEwNSksXG4gICAgICAgICAgICAgICAgICAgIGFtb3VudDogcGFyYW1zLmFtb3VudCxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgXSxcbiAgICAgICAgfSk7XG5cbiAgICAgICAgaWYgKHByb2Nlc3MuZW52Lk5PREVfRU5WID09PSAnZGV2ZWxvcG1lbnQnKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnTWVzb21iIHJlc3BvbnNlOicsIHtcbiAgICAgICAgICAgICAgICBzdWNjZXNzOiByZXNwb25zZS5zdWNjZXNzLFxuICAgICAgICAgICAgICAgIHN0YXR1czogcmVzcG9uc2Uuc3RhdHVzLFxuICAgICAgICAgICAgICAgIG1lc3NhZ2U6IHJlc3BvbnNlLm1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgcmVmZXJlbmNlOiByZXNwb25zZS5yZWZlcmVuY2UsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0eXBlb2YgcmVzcG9uc2UuaXNPcGVyYXRpb25TdWNjZXNzID09PSAnZnVuY3Rpb24nICYmICFyZXNwb25zZS5pc09wZXJhdGlvblN1Y2Nlc3MoKSkge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBzdWNjZXNzOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBlcnJvcjogcmVzcG9uc2UubWVzc2FnZSB8fCAnUGF5bWVudCBvcGVyYXRpb24gZmFpbGVkJyxcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodHlwZW9mIHJlc3BvbnNlLmlzVHJhbnNhY3Rpb25TdWNjZXNzID09PSAnZnVuY3Rpb24nICYmICFyZXNwb25zZS5pc1RyYW5zYWN0aW9uU3VjY2VzcygpKSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IHRydWUsXG4gICAgICAgICAgICAgICAgcmVmZXJlbmNlOiByZXNwb25zZS5yZWZlcmVuY2UgfHwgcmVzcG9uc2UudHJhbnNhY3Rpb24/LnBrLFxuICAgICAgICAgICAgICAgIG1lc3NhZ2U6ICdQYXltZW50IGluaXRpYXRlZC4gUGxlYXNlIGNvbXBsZXRlIG9uIHlvdXIgcGhvbmUuJyxcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgc3VjY2VzczogdHJ1ZSxcbiAgICAgICAgICAgIHJlZmVyZW5jZTogcmVzcG9uc2UucmVmZXJlbmNlIHx8IHJlc3BvbnNlLnRyYW5zYWN0aW9uPy5wayxcbiAgICAgICAgICAgIG1lc3NhZ2U6ICdQYXltZW50IGluaXRpYXRlZCBzdWNjZXNzZnVsbHknLFxuICAgICAgICB9O1xuICAgIH0gY2F0Y2ggKGVycm9yOiBhbnkpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcignTWVzb21iIHBheW1lbnQgZXJyb3I6JywgZXJyb3IpO1xuXG4gICAgICAgIGlmIChlcnJvci5tZXNzYWdlPy5pbmNsdWRlcygnY3JlZGVudGlhbHMgYXJlIG5vdCBjb25maWd1cmVkJykpIHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgc3VjY2VzczogZmFsc2UsXG4gICAgICAgICAgICAgICAgZXJyb3I6ICdQYXltZW50IHN5c3RlbSBpcyBub3QgY29uZmlndXJlZC4gUGxlYXNlIGNvbnRhY3Qgc3VwcG9ydC4nLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBzdWNjZXNzOiBmYWxzZSxcbiAgICAgICAgICAgIGVycm9yOiBlcnJvci5tZXNzYWdlIHx8ICdQYXltZW50IGluaXRpYXRpb24gZmFpbGVkJyxcbiAgICAgICAgfTtcbiAgICB9XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBjaGVja1BheW1lbnRTdGF0dXMocmVmZXJlbmNlOiBzdHJpbmcpOiBQcm9taXNlPFBheW1lbnRSZXN1bHQ+IHtcbiAgICB0cnkge1xuICAgICAgICBjb25zdCBwYXltZW50ID0gZ2V0TWVzb21iQ2xpZW50KCk7XG4gICAgICAgIGNvbnN0IHRyYW5zYWN0aW9ucyA9IGF3YWl0IHBheW1lbnQuZ2V0VHJhbnNhY3Rpb25zKFtyZWZlcmVuY2VdLCAnTUVTT01CJyk7XG5cbiAgICAgICAgaWYgKCF0cmFuc2FjdGlvbnMgfHwgdHJhbnNhY3Rpb25zLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBzdWNjZXNzOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBlcnJvcjogJ1BheW1lbnQgaXMgc3RpbGwgcHJvY2Vzc2luZycsXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgdHJhbnNhY3Rpb24gPSB0cmFuc2FjdGlvbnNbMF07XG4gICAgICAgIGNvbnN0IGlzU3VjY2VzcyA9IHRyYW5zYWN0aW9uLnN0YXR1cyA9PT0gJ1NVQ0NFU1MnO1xuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBzdWNjZXNzOiBpc1N1Y2Nlc3MsXG4gICAgICAgICAgICByZWZlcmVuY2U6IHJlZmVyZW5jZSxcbiAgICAgICAgICAgIG1lc3NhZ2U6IGlzU3VjY2VzcyA/ICdQYXltZW50IGNvbmZpcm1lZCcgOiBgUGF5bWVudCBzdGF0dXM6ICR7dHJhbnNhY3Rpb24uc3RhdHVzfWAsXG4gICAgICAgIH07XG4gICAgfSBjYXRjaCAoZXJyb3I6IGFueSkge1xuICAgICAgICBjb25zb2xlLmVycm9yKCdNZXNvbWIgc3RhdHVzIGNoZWNrIGVycm9yOicsIGVycm9yKTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHN1Y2Nlc3M6IGZhbHNlLFxuICAgICAgICAgICAgZXJyb3I6ICdQYXltZW50IGlzIHN0aWxsIHByb2Nlc3NpbmcuIFBsZWFzZSB3YWl0Li4uJyxcbiAgICAgICAgfTtcbiAgICB9XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBtYWtlV2l0aGRyYXdhbChwYXJhbXM6IFdpdGhkcmF3YWxQYXJhbXMpOiBQcm9taXNlPFBheW1lbnRSZXN1bHQ+IHtcbiAgICB0cnkge1xuICAgICAgICBjb25zdCBwYXltZW50ID0gZ2V0TWVzb21iQ2xpZW50KCk7XG5cbiAgICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBwYXltZW50Lm1ha2VEZXBvc2l0KHtcbiAgICAgICAgICAgIGFtb3VudDogcGFyYW1zLmFtb3VudCxcbiAgICAgICAgICAgIHNlcnZpY2U6IHBhcmFtcy5zZXJ2aWNlLFxuICAgICAgICAgICAgcmVjZWl2ZXI6IHBhcmFtcy5yZWNlaXZlcixcbiAgICAgICAgICAgIG5vbmNlOiBwYXJhbXMubm9uY2UsXG4gICAgICAgICAgICBjb3VudHJ5OiAnQ00nLFxuICAgICAgICAgICAgY3VycmVuY3k6ICdYQUYnLFxuICAgICAgICAgICAgY3VzdG9tZXI6IHtcbiAgICAgICAgICAgICAgICBlbWFpbDogJ2FkbWluQG5iZGFuY2Vhd2FyZC5jb20nLFxuICAgICAgICAgICAgICAgIGZpcnN0TmFtZTogJ0FkbWluJyxcbiAgICAgICAgICAgICAgICBsYXN0TmFtZTogJ05CRGFuY2UnLFxuICAgICAgICAgICAgICAgIHRvd246ICdEb3VhbGEnLFxuICAgICAgICAgICAgICAgIHJlZ2lvbjogJ0xpdHRvcmFsJyxcbiAgICAgICAgICAgICAgICBjb3VudHJ5OiAnQ00nLFxuICAgICAgICAgICAgICAgIGFkZHJlc3M6ICdDYW1lcm9vbicsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgbG9jYXRpb246IHtcbiAgICAgICAgICAgICAgICB0b3duOiAnRG91YWxhJyxcbiAgICAgICAgICAgICAgICByZWdpb246ICdMaXR0b3JhbCcsXG4gICAgICAgICAgICAgICAgY291bnRyeTogJ0NNJyxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBwcm9kdWN0czogW1xuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgbmFtZTogJ1dpdGhkcmF3YWwgTkJEYW5jZSBBd2FyZCcsXG4gICAgICAgICAgICAgICAgICAgIGNhdGVnb3J5OiAnV2l0aGRyYXdhbCcsXG4gICAgICAgICAgICAgICAgICAgIHF1YW50aXR5OiAxLFxuICAgICAgICAgICAgICAgICAgICBhbW91bnQ6IHBhcmFtcy5hbW91bnQsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIF0sXG4gICAgICAgIH0pO1xuXG4gICAgICAgIGlmICh0eXBlb2YgcmVzcG9uc2UuaXNPcGVyYXRpb25TdWNjZXNzID09PSAnZnVuY3Rpb24nICYmICFyZXNwb25zZS5pc09wZXJhdGlvblN1Y2Nlc3MoKSkge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBzdWNjZXNzOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBlcnJvcjogcmVzcG9uc2UubWVzc2FnZSB8fCAnV2l0aGRyYXdhbCBvcGVyYXRpb24gZmFpbGVkJyxcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodHlwZW9mIHJlc3BvbnNlLmlzVHJhbnNhY3Rpb25TdWNjZXNzID09PSAnZnVuY3Rpb24nICYmICFyZXNwb25zZS5pc1RyYW5zYWN0aW9uU3VjY2VzcygpKSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IHRydWUsXG4gICAgICAgICAgICAgICAgcmVmZXJlbmNlOiByZXNwb25zZS5yZWZlcmVuY2UgfHwgcmVzcG9uc2UudHJhbnNhY3Rpb24/LnBrLFxuICAgICAgICAgICAgICAgIG1lc3NhZ2U6ICdXaXRoZHJhd2FsIGluaXRpYXRlZC4gUHJvY2Vzc2luZy4uLicsXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHN1Y2Nlc3M6IHRydWUsXG4gICAgICAgICAgICByZWZlcmVuY2U6IHJlc3BvbnNlLnJlZmVyZW5jZSB8fCByZXNwb25zZS50cmFuc2FjdGlvbj8ucGssXG4gICAgICAgICAgICBtZXNzYWdlOiAnV2l0aGRyYXdhbCBjb21wbGV0ZWQgc3VjY2Vzc2Z1bGx5JyxcbiAgICAgICAgfTtcbiAgICB9IGNhdGNoIChlcnJvcjogYW55KSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ01lc29tYiB3aXRoZHJhd2FsIGVycm9yOicsIGVycm9yKTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHN1Y2Nlc3M6IGZhbHNlLFxuICAgICAgICAgICAgZXJyb3I6IGVycm9yLm1lc3NhZ2UgfHwgJ1dpdGhkcmF3YWwgZmFpbGVkJyxcbiAgICAgICAgfTtcbiAgICB9XG59XG4iXSwibmFtZXMiOlsicnVudGltZSIsImR5bmFtaWMiLCJQYXltZW50T3BlcmF0aW9uIiwiZ2V0TWVzb21iQ2xpZW50IiwiYXBwbGljYXRpb25LZXkiLCJhY2Nlc3NLZXkiLCJzZWNyZXRLZXkiLCJjb2xsZWN0UGF5bWVudCIsInBhcmFtcyIsInBheW1lbnQiLCJyZXNwb25zZSIsIm1ha2VDb2xsZWN0IiwiYW1vdW50Iiwic2VydmljZSIsInBheWVyIiwibm9uY2UiLCJjb3VudHJ5IiwiY3VycmVuY3kiLCJjdXN0b21lciIsImVtYWlsIiwiZmlyc3ROYW1lIiwibGFzdE5hbWUiLCJ0b3duIiwicmVnaW9uIiwiYWRkcmVzcyIsImxvY2F0aW9uIiwicHJvZHVjdHMiLCJuYW1lIiwiY2F0ZWdvcnkiLCJxdWFudGl0eSIsIk1hdGgiLCJmbG9vciIsInByb2Nlc3MiLCJjb25zb2xlIiwibG9nIiwic3VjY2VzcyIsInN0YXR1cyIsIm1lc3NhZ2UiLCJyZWZlcmVuY2UiLCJpc09wZXJhdGlvblN1Y2Nlc3MiLCJlcnJvciIsImlzVHJhbnNhY3Rpb25TdWNjZXNzIiwidHJhbnNhY3Rpb24iLCJwayIsImluY2x1ZGVzIiwiY2hlY2tQYXltZW50U3RhdHVzIiwidHJhbnNhY3Rpb25zIiwiZ2V0VHJhbnNhY3Rpb25zIiwibGVuZ3RoIiwiaXNTdWNjZXNzIiwibWFrZVdpdGhkcmF3YWwiLCJtYWtlRGVwb3NpdCIsInJlY2VpdmVyIl0sImlnbm9yZUxpc3QiOltdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(rsc)/./app/api/lib/mesomb.ts\n");

/***/ }),

/***/ "(rsc)/./app/api/lib/validation.ts":
/*!***********************************!*\
  !*** ./app/api/lib/validation.ts ***!
  \***********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   detectOperator: () => (/* binding */ detectOperator),\n/* harmony export */   validateCandidateExists: () => (/* binding */ validateCandidateExists),\n/* harmony export */   validatePaymentMethod: () => (/* binding */ validatePaymentMethod),\n/* harmony export */   validatePhoneNumber: () => (/* binding */ validatePhoneNumber),\n/* harmony export */   validateVoteCount: () => (/* binding */ validateVoteCount)\n/* harmony export */ });\n/* harmony import */ var _lib_firebase__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @/lib/firebase */ \"(rsc)/./lib/firebase.ts\");\n/* harmony import */ var firebase_database__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! firebase/database */ \"(rsc)/./node_modules/firebase/database/dist/index.mjs\");\n/**\n * Vote Validation Service for Vercel\n * Server-side validation for vote submissions\n */ \n\n/**\n * Validate Cameroon phone number\n */ function validatePhoneNumber(phoneNumber) {\n    // Remove spaces and country code\n    const cleaned = phoneNumber.replace(/\\s/g, '').replace(/^\\+237/, '');\n    // Cameroon numbers: 6xx xxx xxx (9 digits starting with 6)\n    const phoneRegex = /^6\\d{8}$/;\n    if (!phoneRegex.test(cleaned)) {\n        return {\n            valid: false,\n            error: 'Invalid phone number format. Must be a Cameroon number (6xx xxx xxx)'\n        };\n    }\n    return {\n        valid: true\n    };\n}\n/**\n * Detect mobile operator from phone number\n */ function detectOperator(phoneNumber) {\n    const cleaned = phoneNumber.replace(/\\s/g, '').replace(/^\\+237/, '');\n    // MTN prefixes: 650-654, 670-679, 680-689\n    const mtnPrefixes = [\n        '650',\n        '651',\n        '652',\n        '653',\n        '654',\n        '670',\n        '671',\n        '672',\n        '673',\n        '674',\n        '675',\n        '676',\n        '677',\n        '678',\n        '679',\n        '680',\n        '681',\n        '682',\n        '683',\n        '684',\n        '685',\n        '686',\n        '687',\n        '688',\n        '689'\n    ];\n    // Orange prefixes: 655-659, 690-699\n    const orangePrefixes = [\n        '655',\n        '656',\n        '657',\n        '658',\n        '659',\n        '690',\n        '691',\n        '692',\n        '693',\n        '694',\n        '695',\n        '696',\n        '697',\n        '698',\n        '699'\n    ];\n    const prefix = cleaned.substring(0, 3);\n    if (mtnPrefixes.includes(prefix)) {\n        return 'MTN';\n    } else if (orangePrefixes.includes(prefix)) {\n        return 'ORANGE';\n    }\n    return 'UNKNOWN';\n}\n/**\n * Validate payment method matches phone operator\n */ function validatePaymentMethod(phoneNumber, paymentMethod) {\n    const operator = detectOperator(phoneNumber);\n    if (operator === 'UNKNOWN') {\n        return {\n            valid: false,\n            error: 'Unsupported operator. Only MTN and Orange Money are accepted.'\n        };\n    }\n    const expectedMethod = operator === 'MTN' ? 'mobile' : 'orange';\n    if (paymentMethod !== expectedMethod) {\n        return {\n            valid: false,\n            error: `Phone number is ${operator} but payment method is ${paymentMethod.toUpperCase()}. Please select the correct payment method.`\n        };\n    }\n    return {\n        valid: true\n    };\n}\n/**\n * Validate vote count\n */ function validateVoteCount(voteCount) {\n    if (!Number.isInteger(voteCount) || voteCount < 1 || voteCount > 100) {\n        return {\n            valid: false,\n            error: 'Vote count must be between 1 and 100'\n        };\n    }\n    return {\n        valid: true\n    };\n}\n/**\n * Validate candidate ID exists\n */ async function validateCandidateExists(candidateId) {\n    try {\n        const candidateRef = (0,firebase_database__WEBPACK_IMPORTED_MODULE_1__.ref)(_lib_firebase__WEBPACK_IMPORTED_MODULE_0__.database, `candidates/${candidateId}`);\n        const snapshot = await (0,firebase_database__WEBPACK_IMPORTED_MODULE_1__.get)(candidateRef);\n        if (!snapshot.exists()) {\n            return {\n                valid: false,\n                error: 'Candidate not found'\n            };\n        }\n        return {\n            valid: true\n        };\n    } catch (error) {\n        return {\n            valid: false,\n            error: 'Error validating candidate'\n        };\n    }\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9hcHAvYXBpL2xpYi92YWxpZGF0aW9uLnRzIiwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7QUFBQTs7O0NBR0MsR0FFeUM7QUFDRztBQU83Qzs7Q0FFQyxHQUNNLFNBQVNHLG9CQUFvQkMsV0FBbUI7SUFDbkQsaUNBQWlDO0lBQ2pDLE1BQU1DLFVBQVVELFlBQVlFLE9BQU8sQ0FBQyxPQUFPLElBQUlBLE9BQU8sQ0FBQyxVQUFVO0lBRWpFLDJEQUEyRDtJQUMzRCxNQUFNQyxhQUFhO0lBRW5CLElBQUksQ0FBQ0EsV0FBV0MsSUFBSSxDQUFDSCxVQUFVO1FBQzNCLE9BQU87WUFDSEksT0FBTztZQUNQQyxPQUFPO1FBQ1g7SUFDSjtJQUVBLE9BQU87UUFBRUQsT0FBTztJQUFLO0FBQ3pCO0FBRUE7O0NBRUMsR0FDTSxTQUFTRSxlQUFlUCxXQUFtQjtJQUM5QyxNQUFNQyxVQUFVRCxZQUFZRSxPQUFPLENBQUMsT0FBTyxJQUFJQSxPQUFPLENBQUMsVUFBVTtJQUVqRSwwQ0FBMEM7SUFDMUMsTUFBTU0sY0FBYztRQUFDO1FBQU87UUFBTztRQUFPO1FBQU87UUFBTztRQUFPO1FBQU87UUFBTztRQUFPO1FBQU87UUFBTztRQUFPO1FBQU87UUFBTztRQUFPO1FBQU87UUFBTztRQUFPO1FBQU87UUFBTztRQUFPO1FBQU87UUFBTztRQUFPO0tBQU07SUFFbk0sb0NBQW9DO0lBQ3BDLE1BQU1DLGlCQUFpQjtRQUFDO1FBQU87UUFBTztRQUFPO1FBQU87UUFBTztRQUFPO1FBQU87UUFBTztRQUFPO1FBQU87UUFBTztRQUFPO1FBQU87UUFBTztLQUFNO0lBRWhJLE1BQU1DLFNBQVNULFFBQVFVLFNBQVMsQ0FBQyxHQUFHO0lBRXBDLElBQUlILFlBQVlJLFFBQVEsQ0FBQ0YsU0FBUztRQUM5QixPQUFPO0lBQ1gsT0FBTyxJQUFJRCxlQUFlRyxRQUFRLENBQUNGLFNBQVM7UUFDeEMsT0FBTztJQUNYO0lBRUEsT0FBTztBQUNYO0FBRUE7O0NBRUMsR0FDTSxTQUFTRyxzQkFBc0JiLFdBQW1CLEVBQUVjLGFBQXFCO0lBQzVFLE1BQU1DLFdBQVdSLGVBQWVQO0lBRWhDLElBQUllLGFBQWEsV0FBVztRQUN4QixPQUFPO1lBQ0hWLE9BQU87WUFDUEMsT0FBTztRQUNYO0lBQ0o7SUFFQSxNQUFNVSxpQkFBaUJELGFBQWEsUUFBUSxXQUFXO0lBRXZELElBQUlELGtCQUFrQkUsZ0JBQWdCO1FBQ2xDLE9BQU87WUFDSFgsT0FBTztZQUNQQyxPQUFPLENBQUMsZ0JBQWdCLEVBQUVTLFNBQVMsdUJBQXVCLEVBQUVELGNBQWNHLFdBQVcsR0FBRywyQ0FBMkMsQ0FBQztRQUN4STtJQUNKO0lBRUEsT0FBTztRQUFFWixPQUFPO0lBQUs7QUFDekI7QUFFQTs7Q0FFQyxHQUNNLFNBQVNhLGtCQUFrQkMsU0FBaUI7SUFDL0MsSUFBSSxDQUFDQyxPQUFPQyxTQUFTLENBQUNGLGNBQWNBLFlBQVksS0FBS0EsWUFBWSxLQUFLO1FBQ2xFLE9BQU87WUFDSGQsT0FBTztZQUNQQyxPQUFPO1FBQ1g7SUFDSjtJQUVBLE9BQU87UUFBRUQsT0FBTztJQUFLO0FBQ3pCO0FBRUE7O0NBRUMsR0FDTSxlQUFlaUIsd0JBQXdCQyxXQUFtQjtJQUM3RCxJQUFJO1FBQ0EsTUFBTUMsZUFBZTNCLHNEQUFHQSxDQUFDRCxtREFBUUEsRUFBRSxDQUFDLFdBQVcsRUFBRTJCLGFBQWE7UUFDOUQsTUFBTUUsV0FBVyxNQUFNM0Isc0RBQUdBLENBQUMwQjtRQUUzQixJQUFJLENBQUNDLFNBQVNDLE1BQU0sSUFBSTtZQUNwQixPQUFPO2dCQUNIckIsT0FBTztnQkFDUEMsT0FBTztZQUNYO1FBQ0o7UUFFQSxPQUFPO1lBQUVELE9BQU87UUFBSztJQUN6QixFQUFFLE9BQU9DLE9BQU87UUFDWixPQUFPO1lBQ0hELE9BQU87WUFDUEMsT0FBTztRQUNYO0lBQ0o7QUFDSiIsInNvdXJjZXMiOlsiL2hvbWUvYWxtaWdodC9Eb2N1bWVudHMvTkJEYW5jZUF3YXJkL2FwcC9hcGkvbGliL3ZhbGlkYXRpb24udHMiXSwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBWb3RlIFZhbGlkYXRpb24gU2VydmljZSBmb3IgVmVyY2VsXG4gKiBTZXJ2ZXItc2lkZSB2YWxpZGF0aW9uIGZvciB2b3RlIHN1Ym1pc3Npb25zXG4gKi9cblxuaW1wb3J0IHsgZGF0YWJhc2UgfSBmcm9tICdAL2xpYi9maXJlYmFzZSc7XG5pbXBvcnQgeyByZWYsIGdldCB9IGZyb20gJ2ZpcmViYXNlL2RhdGFiYXNlJztcblxuZXhwb3J0IGludGVyZmFjZSBWYWxpZGF0aW9uUmVzdWx0IHtcbiAgICB2YWxpZDogYm9vbGVhbjtcbiAgICBlcnJvcj86IHN0cmluZztcbn1cblxuLyoqXG4gKiBWYWxpZGF0ZSBDYW1lcm9vbiBwaG9uZSBudW1iZXJcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHZhbGlkYXRlUGhvbmVOdW1iZXIocGhvbmVOdW1iZXI6IHN0cmluZyk6IFZhbGlkYXRpb25SZXN1bHQge1xuICAgIC8vIFJlbW92ZSBzcGFjZXMgYW5kIGNvdW50cnkgY29kZVxuICAgIGNvbnN0IGNsZWFuZWQgPSBwaG9uZU51bWJlci5yZXBsYWNlKC9cXHMvZywgJycpLnJlcGxhY2UoL15cXCsyMzcvLCAnJyk7XG5cbiAgICAvLyBDYW1lcm9vbiBudW1iZXJzOiA2eHggeHh4IHh4eCAoOSBkaWdpdHMgc3RhcnRpbmcgd2l0aCA2KVxuICAgIGNvbnN0IHBob25lUmVnZXggPSAvXjZcXGR7OH0kLztcblxuICAgIGlmICghcGhvbmVSZWdleC50ZXN0KGNsZWFuZWQpKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICB2YWxpZDogZmFsc2UsXG4gICAgICAgICAgICBlcnJvcjogJ0ludmFsaWQgcGhvbmUgbnVtYmVyIGZvcm1hdC4gTXVzdCBiZSBhIENhbWVyb29uIG51bWJlciAoNnh4IHh4eCB4eHgpJyxcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICByZXR1cm4geyB2YWxpZDogdHJ1ZSB9O1xufVxuXG4vKipcbiAqIERldGVjdCBtb2JpbGUgb3BlcmF0b3IgZnJvbSBwaG9uZSBudW1iZXJcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGRldGVjdE9wZXJhdG9yKHBob25lTnVtYmVyOiBzdHJpbmcpOiAnTVROJyB8ICdPUkFOR0UnIHwgJ1VOS05PV04nIHtcbiAgICBjb25zdCBjbGVhbmVkID0gcGhvbmVOdW1iZXIucmVwbGFjZSgvXFxzL2csICcnKS5yZXBsYWNlKC9eXFwrMjM3LywgJycpO1xuXG4gICAgLy8gTVROIHByZWZpeGVzOiA2NTAtNjU0LCA2NzAtNjc5LCA2ODAtNjg5XG4gICAgY29uc3QgbXRuUHJlZml4ZXMgPSBbJzY1MCcsICc2NTEnLCAnNjUyJywgJzY1MycsICc2NTQnLCAnNjcwJywgJzY3MScsICc2NzInLCAnNjczJywgJzY3NCcsICc2NzUnLCAnNjc2JywgJzY3NycsICc2NzgnLCAnNjc5JywgJzY4MCcsICc2ODEnLCAnNjgyJywgJzY4MycsICc2ODQnLCAnNjg1JywgJzY4NicsICc2ODcnLCAnNjg4JywgJzY4OSddO1xuXG4gICAgLy8gT3JhbmdlIHByZWZpeGVzOiA2NTUtNjU5LCA2OTAtNjk5XG4gICAgY29uc3Qgb3JhbmdlUHJlZml4ZXMgPSBbJzY1NScsICc2NTYnLCAnNjU3JywgJzY1OCcsICc2NTknLCAnNjkwJywgJzY5MScsICc2OTInLCAnNjkzJywgJzY5NCcsICc2OTUnLCAnNjk2JywgJzY5NycsICc2OTgnLCAnNjk5J107XG5cbiAgICBjb25zdCBwcmVmaXggPSBjbGVhbmVkLnN1YnN0cmluZygwLCAzKTtcblxuICAgIGlmIChtdG5QcmVmaXhlcy5pbmNsdWRlcyhwcmVmaXgpKSB7XG4gICAgICAgIHJldHVybiAnTVROJztcbiAgICB9IGVsc2UgaWYgKG9yYW5nZVByZWZpeGVzLmluY2x1ZGVzKHByZWZpeCkpIHtcbiAgICAgICAgcmV0dXJuICdPUkFOR0UnO1xuICAgIH1cblxuICAgIHJldHVybiAnVU5LTk9XTic7XG59XG5cbi8qKlxuICogVmFsaWRhdGUgcGF5bWVudCBtZXRob2QgbWF0Y2hlcyBwaG9uZSBvcGVyYXRvclxuICovXG5leHBvcnQgZnVuY3Rpb24gdmFsaWRhdGVQYXltZW50TWV0aG9kKHBob25lTnVtYmVyOiBzdHJpbmcsIHBheW1lbnRNZXRob2Q6IHN0cmluZyk6IFZhbGlkYXRpb25SZXN1bHQge1xuICAgIGNvbnN0IG9wZXJhdG9yID0gZGV0ZWN0T3BlcmF0b3IocGhvbmVOdW1iZXIpO1xuXG4gICAgaWYgKG9wZXJhdG9yID09PSAnVU5LTk9XTicpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHZhbGlkOiBmYWxzZSxcbiAgICAgICAgICAgIGVycm9yOiAnVW5zdXBwb3J0ZWQgb3BlcmF0b3IuIE9ubHkgTVROIGFuZCBPcmFuZ2UgTW9uZXkgYXJlIGFjY2VwdGVkLicsXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgY29uc3QgZXhwZWN0ZWRNZXRob2QgPSBvcGVyYXRvciA9PT0gJ01UTicgPyAnbW9iaWxlJyA6ICdvcmFuZ2UnO1xuXG4gICAgaWYgKHBheW1lbnRNZXRob2QgIT09IGV4cGVjdGVkTWV0aG9kKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICB2YWxpZDogZmFsc2UsXG4gICAgICAgICAgICBlcnJvcjogYFBob25lIG51bWJlciBpcyAke29wZXJhdG9yfSBidXQgcGF5bWVudCBtZXRob2QgaXMgJHtwYXltZW50TWV0aG9kLnRvVXBwZXJDYXNlKCl9LiBQbGVhc2Ugc2VsZWN0IHRoZSBjb3JyZWN0IHBheW1lbnQgbWV0aG9kLmAsXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgcmV0dXJuIHsgdmFsaWQ6IHRydWUgfTtcbn1cblxuLyoqXG4gKiBWYWxpZGF0ZSB2b3RlIGNvdW50XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB2YWxpZGF0ZVZvdGVDb3VudCh2b3RlQ291bnQ6IG51bWJlcik6IFZhbGlkYXRpb25SZXN1bHQge1xuICAgIGlmICghTnVtYmVyLmlzSW50ZWdlcih2b3RlQ291bnQpIHx8IHZvdGVDb3VudCA8IDEgfHwgdm90ZUNvdW50ID4gMTAwKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICB2YWxpZDogZmFsc2UsXG4gICAgICAgICAgICBlcnJvcjogJ1ZvdGUgY291bnQgbXVzdCBiZSBiZXR3ZWVuIDEgYW5kIDEwMCcsXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgcmV0dXJuIHsgdmFsaWQ6IHRydWUgfTtcbn1cblxuLyoqXG4gKiBWYWxpZGF0ZSBjYW5kaWRhdGUgSUQgZXhpc3RzXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiB2YWxpZGF0ZUNhbmRpZGF0ZUV4aXN0cyhjYW5kaWRhdGVJZDogc3RyaW5nKTogUHJvbWlzZTxWYWxpZGF0aW9uUmVzdWx0PiB7XG4gICAgdHJ5IHtcbiAgICAgICAgY29uc3QgY2FuZGlkYXRlUmVmID0gcmVmKGRhdGFiYXNlLCBgY2FuZGlkYXRlcy8ke2NhbmRpZGF0ZUlkfWApO1xuICAgICAgICBjb25zdCBzbmFwc2hvdCA9IGF3YWl0IGdldChjYW5kaWRhdGVSZWYpO1xuXG4gICAgICAgIGlmICghc25hcHNob3QuZXhpc3RzKCkpIHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgdmFsaWQ6IGZhbHNlLFxuICAgICAgICAgICAgICAgIGVycm9yOiAnQ2FuZGlkYXRlIG5vdCBmb3VuZCcsXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHsgdmFsaWQ6IHRydWUgfTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgdmFsaWQ6IGZhbHNlLFxuICAgICAgICAgICAgZXJyb3I6ICdFcnJvciB2YWxpZGF0aW5nIGNhbmRpZGF0ZScsXG4gICAgICAgIH07XG4gICAgfVxufVxuIl0sIm5hbWVzIjpbImRhdGFiYXNlIiwicmVmIiwiZ2V0IiwidmFsaWRhdGVQaG9uZU51bWJlciIsInBob25lTnVtYmVyIiwiY2xlYW5lZCIsInJlcGxhY2UiLCJwaG9uZVJlZ2V4IiwidGVzdCIsInZhbGlkIiwiZXJyb3IiLCJkZXRlY3RPcGVyYXRvciIsIm10blByZWZpeGVzIiwib3JhbmdlUHJlZml4ZXMiLCJwcmVmaXgiLCJzdWJzdHJpbmciLCJpbmNsdWRlcyIsInZhbGlkYXRlUGF5bWVudE1ldGhvZCIsInBheW1lbnRNZXRob2QiLCJvcGVyYXRvciIsImV4cGVjdGVkTWV0aG9kIiwidG9VcHBlckNhc2UiLCJ2YWxpZGF0ZVZvdGVDb3VudCIsInZvdGVDb3VudCIsIk51bWJlciIsImlzSW50ZWdlciIsInZhbGlkYXRlQ2FuZGlkYXRlRXhpc3RzIiwiY2FuZGlkYXRlSWQiLCJjYW5kaWRhdGVSZWYiLCJzbmFwc2hvdCIsImV4aXN0cyJdLCJpZ25vcmVMaXN0IjpbXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(rsc)/./app/api/lib/validation.ts\n");

/***/ }),

/***/ "(rsc)/./app/api/vote/submit/route.ts":
/*!**************************************!*\
  !*** ./app/api/vote/submit/route.ts ***!
  \**************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   POST: () => (/* binding */ POST),\n/* harmony export */   dynamic: () => (/* binding */ dynamic),\n/* harmony export */   runtime: () => (/* binding */ runtime)\n/* harmony export */ });\n/* harmony import */ var next_server__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/server */ \"(rsc)/./node_modules/next/dist/api/server.js\");\n/* harmony import */ var _lib_firebase__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @/lib/firebase */ \"(rsc)/./lib/firebase.ts\");\n/* harmony import */ var firebase_database__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! firebase/database */ \"(rsc)/./node_modules/firebase/database/dist/index.mjs\");\n/* harmony import */ var _lib_mesomb__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../lib/mesomb */ \"(rsc)/./app/api/lib/mesomb.ts\");\n/* harmony import */ var _lib_validation__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../lib/validation */ \"(rsc)/./app/api/lib/validation.ts\");\n/**\n * Submit Vote API Route\n * POST /api/vote/submit\n */ // Force Node.js runtime to avoid Edge Runtime header restrictions\nconst runtime = 'nodejs';\nconst dynamic = 'force-dynamic';\n\n\n\n\n\nasync function POST(request) {\n    try {\n        const body = await request.json();\n        const { candidateId, voteCount, phoneNumber, paymentMethod } = body;\n        // Validate inputs\n        const phoneValidation = (0,_lib_validation__WEBPACK_IMPORTED_MODULE_4__.validatePhoneNumber)(phoneNumber);\n        if (!phoneValidation.valid) {\n            return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n                success: false,\n                error: phoneValidation.error\n            }, {\n                status: 400\n            });\n        }\n        const voteValidation = (0,_lib_validation__WEBPACK_IMPORTED_MODULE_4__.validateVoteCount)(voteCount);\n        if (!voteValidation.valid) {\n            return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n                success: false,\n                error: voteValidation.error\n            }, {\n                status: 400\n            });\n        }\n        const paymentValidation = (0,_lib_validation__WEBPACK_IMPORTED_MODULE_4__.validatePaymentMethod)(phoneNumber, paymentMethod);\n        if (!paymentValidation.valid) {\n            return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n                success: false,\n                error: paymentValidation.error\n            }, {\n                status: 400\n            });\n        }\n        const candidateValidation = await (0,_lib_validation__WEBPACK_IMPORTED_MODULE_4__.validateCandidateExists)(candidateId);\n        if (!candidateValidation.valid) {\n            return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n                success: false,\n                error: candidateValidation.error\n            }, {\n                status: 404\n            });\n        }\n        // Calculate payment amount\n        const votePrice = parseInt(process.env.NEXT_PUBLIC_VOTE_PRICE || '100');\n        const totalAmount = voteCount * votePrice;\n        // Detect operator and map to Mesomb service\n        const operator = (0,_lib_validation__WEBPACK_IMPORTED_MODULE_4__.detectOperator)(phoneNumber);\n        const mesombService = operator === 'MTN' ? 'MTN' : 'ORANGE';\n        // Generate unique transaction ID\n        const transactionId = `vote_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;\n        // Initiate payment with Mesomb\n        const paymentResult = await (0,_lib_mesomb__WEBPACK_IMPORTED_MODULE_3__.collectPayment)({\n            amount: totalAmount,\n            service: mesombService,\n            payer: phoneNumber.replace(/\\s/g, '').replace(/^\\+237/, ''),\n            nonce: transactionId\n        });\n        if (!paymentResult.success) {\n            return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n                success: false,\n                error: paymentResult.error || 'Payment initiation failed'\n            }, {\n                status: 500\n            });\n        }\n        // Create transaction record in Firebase\n        const transactionData = {\n            id: transactionId,\n            candidateId,\n            voteCount,\n            phoneNumber,\n            paymentMethod,\n            operator: mesombService,\n            amount: totalAmount,\n            mesombReference: paymentResult.reference,\n            status: 'pending',\n            createdAt: (0,firebase_database__WEBPACK_IMPORTED_MODULE_2__.serverTimestamp)()\n        };\n        const transactionRef = (0,firebase_database__WEBPACK_IMPORTED_MODULE_2__.ref)(_lib_firebase__WEBPACK_IMPORTED_MODULE_1__.database, `transactions/${transactionId}`);\n        await (0,firebase_database__WEBPACK_IMPORTED_MODULE_2__.set)(transactionRef, transactionData);\n        return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n            success: true,\n            transactionId,\n            reference: paymentResult.reference,\n            amount: totalAmount,\n            message: 'Payment initiated. Please complete payment on your phone.'\n        });\n    } catch (error) {\n        console.error('Submit vote error:', error);\n        return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n            success: false,\n            error: error.message || 'An error occurred while submitting vote'\n        }, {\n            status: 500\n        });\n    }\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,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OUI7UUFFQSxNQUFNaUQsaUJBQWlCbkQsc0RBQUdBLENBQUNELG1EQUFRQSxFQUFFLENBQUMsYUFBYSxFQUFFa0MsZUFBZTtRQUNwRSxNQUFNaEMsc0RBQUdBLENBQUNrRCxnQkFBZ0JMO1FBRTFCLE9BQU9oRCxxREFBWUEsQ0FBQ2MsSUFBSSxDQUFDO1lBQ3JCTyxTQUFTO1lBQ1RjO1lBQ0FnQixXQUFXVCxjQUFjUyxTQUFTO1lBQ2xDUixRQUFRWDtZQUNSc0IsU0FBUztRQUNiO0lBQ0osRUFBRSxPQUFPaEMsT0FBWTtRQUNqQmlDLFFBQVFqQyxLQUFLLENBQUMsc0JBQXNCQTtRQUNwQyxPQUFPdEIscURBQVlBLENBQUNjLElBQUksQ0FDcEI7WUFDSU8sU0FBUztZQUNUQyxPQUFPQSxNQUFNZ0MsT0FBTyxJQUFJO1FBQzVCLEdBQ0E7WUFBRS9CLFFBQVE7UUFBSTtJQUV0QjtBQUNKIiwic291cmNlcyI6WyIvaG9tZS9hbG1pZ2h0L0RvY3VtZW50cy9OQkRhbmNlQXdhcmQvYXBwL2FwaS92b3RlL3N1Ym1pdC9yb3V0ZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIFN1Ym1pdCBWb3RlIEFQSSBSb3V0ZVxuICogUE9TVCAvYXBpL3ZvdGUvc3VibWl0XG4gKi9cblxuLy8gRm9yY2UgTm9kZS5qcyBydW50aW1lIHRvIGF2b2lkIEVkZ2UgUnVudGltZSBoZWFkZXIgcmVzdHJpY3Rpb25zXG5leHBvcnQgY29uc3QgcnVudGltZSA9ICdub2RlanMnO1xuZXhwb3J0IGNvbnN0IGR5bmFtaWMgPSAnZm9yY2UtZHluYW1pYyc7XG5cbmltcG9ydCB7IE5leHRSZXF1ZXN0LCBOZXh0UmVzcG9uc2UgfSBmcm9tICduZXh0L3NlcnZlcic7XG5pbXBvcnQgeyBkYXRhYmFzZSB9IGZyb20gJ0AvbGliL2ZpcmViYXNlJztcbmltcG9ydCB7IHJlZiwgc2V0LCBzZXJ2ZXJUaW1lc3RhbXAgfSBmcm9tICdmaXJlYmFzZS9kYXRhYmFzZSc7XG5pbXBvcnQgeyBjb2xsZWN0UGF5bWVudCB9IGZyb20gJy4uLy4uL2xpYi9tZXNvbWInO1xuaW1wb3J0IHtcbiAgICB2YWxpZGF0ZVBob25lTnVtYmVyLFxuICAgIHZhbGlkYXRlUGF5bWVudE1ldGhvZCxcbiAgICB2YWxpZGF0ZVZvdGVDb3VudCxcbiAgICB2YWxpZGF0ZUNhbmRpZGF0ZUV4aXN0cyxcbiAgICBkZXRlY3RPcGVyYXRvcixcbn0gZnJvbSAnLi4vLi4vbGliL3ZhbGlkYXRpb24nO1xuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gUE9TVChyZXF1ZXN0OiBOZXh0UmVxdWVzdCkge1xuICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IGJvZHkgPSBhd2FpdCByZXF1ZXN0Lmpzb24oKTtcbiAgICAgICAgY29uc3QgeyBjYW5kaWRhdGVJZCwgdm90ZUNvdW50LCBwaG9uZU51bWJlciwgcGF5bWVudE1ldGhvZCB9ID0gYm9keTtcblxuICAgICAgICAvLyBWYWxpZGF0ZSBpbnB1dHNcbiAgICAgICAgY29uc3QgcGhvbmVWYWxpZGF0aW9uID0gdmFsaWRhdGVQaG9uZU51bWJlcihwaG9uZU51bWJlcik7XG4gICAgICAgIGlmICghcGhvbmVWYWxpZGF0aW9uLnZhbGlkKSB7XG4gICAgICAgICAgICByZXR1cm4gTmV4dFJlc3BvbnNlLmpzb24oXG4gICAgICAgICAgICAgICAgeyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IHBob25lVmFsaWRhdGlvbi5lcnJvciB9LFxuICAgICAgICAgICAgICAgIHsgc3RhdHVzOiA0MDAgfVxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHZvdGVWYWxpZGF0aW9uID0gdmFsaWRhdGVWb3RlQ291bnQodm90ZUNvdW50KTtcbiAgICAgICAgaWYgKCF2b3RlVmFsaWRhdGlvbi52YWxpZCkge1xuICAgICAgICAgICAgcmV0dXJuIE5leHRSZXNwb25zZS5qc29uKFxuICAgICAgICAgICAgICAgIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiB2b3RlVmFsaWRhdGlvbi5lcnJvciB9LFxuICAgICAgICAgICAgICAgIHsgc3RhdHVzOiA0MDAgfVxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHBheW1lbnRWYWxpZGF0aW9uID0gdmFsaWRhdGVQYXltZW50TWV0aG9kKHBob25lTnVtYmVyLCBwYXltZW50TWV0aG9kKTtcbiAgICAgICAgaWYgKCFwYXltZW50VmFsaWRhdGlvbi52YWxpZCkge1xuICAgICAgICAgICAgcmV0dXJuIE5leHRSZXNwb25zZS5qc29uKFxuICAgICAgICAgICAgICAgIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBwYXltZW50VmFsaWRhdGlvbi5lcnJvciB9LFxuICAgICAgICAgICAgICAgIHsgc3RhdHVzOiA0MDAgfVxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGNhbmRpZGF0ZVZhbGlkYXRpb24gPSBhd2FpdCB2YWxpZGF0ZUNhbmRpZGF0ZUV4aXN0cyhjYW5kaWRhdGVJZCk7XG4gICAgICAgIGlmICghY2FuZGlkYXRlVmFsaWRhdGlvbi52YWxpZCkge1xuICAgICAgICAgICAgcmV0dXJuIE5leHRSZXNwb25zZS5qc29uKFxuICAgICAgICAgICAgICAgIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBjYW5kaWRhdGVWYWxpZGF0aW9uLmVycm9yIH0sXG4gICAgICAgICAgICAgICAgeyBzdGF0dXM6IDQwNCB9XG4gICAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gQ2FsY3VsYXRlIHBheW1lbnQgYW1vdW50XG4gICAgICAgIGNvbnN0IHZvdGVQcmljZSA9IHBhcnNlSW50KHByb2Nlc3MuZW52Lk5FWFRfUFVCTElDX1ZPVEVfUFJJQ0UgfHwgJzEwMCcpO1xuICAgICAgICBjb25zdCB0b3RhbEFtb3VudCA9IHZvdGVDb3VudCAqIHZvdGVQcmljZTtcblxuICAgICAgICAvLyBEZXRlY3Qgb3BlcmF0b3IgYW5kIG1hcCB0byBNZXNvbWIgc2VydmljZVxuICAgICAgICBjb25zdCBvcGVyYXRvciA9IGRldGVjdE9wZXJhdG9yKHBob25lTnVtYmVyKTtcbiAgICAgICAgY29uc3QgbWVzb21iU2VydmljZSA9IG9wZXJhdG9yID09PSAnTVROJyA/ICdNVE4nIDogJ09SQU5HRSc7XG5cbiAgICAgICAgLy8gR2VuZXJhdGUgdW5pcXVlIHRyYW5zYWN0aW9uIElEXG4gICAgICAgIGNvbnN0IHRyYW5zYWN0aW9uSWQgPSBgdm90ZV8ke0RhdGUubm93KCl9XyR7TWF0aC5yYW5kb20oKS50b1N0cmluZygzNikuc3Vic3RyKDIsIDkpfWA7XG5cbiAgICAgICAgLy8gSW5pdGlhdGUgcGF5bWVudCB3aXRoIE1lc29tYlxuICAgICAgICBjb25zdCBwYXltZW50UmVzdWx0ID0gYXdhaXQgY29sbGVjdFBheW1lbnQoe1xuICAgICAgICAgICAgYW1vdW50OiB0b3RhbEFtb3VudCxcbiAgICAgICAgICAgIHNlcnZpY2U6IG1lc29tYlNlcnZpY2UsXG4gICAgICAgICAgICBwYXllcjogcGhvbmVOdW1iZXIucmVwbGFjZSgvXFxzL2csICcnKS5yZXBsYWNlKC9eXFwrMjM3LywgJycpLFxuICAgICAgICAgICAgbm9uY2U6IHRyYW5zYWN0aW9uSWQsXG4gICAgICAgIH0pO1xuXG4gICAgICAgIGlmICghcGF5bWVudFJlc3VsdC5zdWNjZXNzKSB7XG4gICAgICAgICAgICByZXR1cm4gTmV4dFJlc3BvbnNlLmpzb24oXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBzdWNjZXNzOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgZXJyb3I6IHBheW1lbnRSZXN1bHQuZXJyb3IgfHwgJ1BheW1lbnQgaW5pdGlhdGlvbiBmYWlsZWQnLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgeyBzdGF0dXM6IDUwMCB9XG4gICAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gQ3JlYXRlIHRyYW5zYWN0aW9uIHJlY29yZCBpbiBGaXJlYmFzZVxuICAgICAgICBjb25zdCB0cmFuc2FjdGlvbkRhdGEgPSB7XG4gICAgICAgICAgICBpZDogdHJhbnNhY3Rpb25JZCxcbiAgICAgICAgICAgIGNhbmRpZGF0ZUlkLFxuICAgICAgICAgICAgdm90ZUNvdW50LFxuICAgICAgICAgICAgcGhvbmVOdW1iZXIsXG4gICAgICAgICAgICBwYXltZW50TWV0aG9kLFxuICAgICAgICAgICAgb3BlcmF0b3I6IG1lc29tYlNlcnZpY2UsXG4gICAgICAgICAgICBhbW91bnQ6IHRvdGFsQW1vdW50LFxuICAgICAgICAgICAgbWVzb21iUmVmZXJlbmNlOiBwYXltZW50UmVzdWx0LnJlZmVyZW5jZSxcbiAgICAgICAgICAgIHN0YXR1czogJ3BlbmRpbmcnLFxuICAgICAgICAgICAgY3JlYXRlZEF0OiBzZXJ2ZXJUaW1lc3RhbXAoKSxcbiAgICAgICAgfTtcblxuICAgICAgICBjb25zdCB0cmFuc2FjdGlvblJlZiA9IHJlZihkYXRhYmFzZSwgYHRyYW5zYWN0aW9ucy8ke3RyYW5zYWN0aW9uSWR9YCk7XG4gICAgICAgIGF3YWl0IHNldCh0cmFuc2FjdGlvblJlZiwgdHJhbnNhY3Rpb25EYXRhKTtcblxuICAgICAgICByZXR1cm4gTmV4dFJlc3BvbnNlLmpzb24oe1xuICAgICAgICAgICAgc3VjY2VzczogdHJ1ZSxcbiAgICAgICAgICAgIHRyYW5zYWN0aW9uSWQsXG4gICAgICAgICAgICByZWZlcmVuY2U6IHBheW1lbnRSZXN1bHQucmVmZXJlbmNlLFxuICAgICAgICAgICAgYW1vdW50OiB0b3RhbEFtb3VudCxcbiAgICAgICAgICAgIG1lc3NhZ2U6ICdQYXltZW50IGluaXRpYXRlZC4gUGxlYXNlIGNvbXBsZXRlIHBheW1lbnQgb24geW91ciBwaG9uZS4nLFxuICAgICAgICB9KTtcbiAgICB9IGNhdGNoIChlcnJvcjogYW55KSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ1N1Ym1pdCB2b3RlIGVycm9yOicsIGVycm9yKTtcbiAgICAgICAgcmV0dXJuIE5leHRSZXNwb25zZS5qc29uKFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IGZhbHNlLFxuICAgICAgICAgICAgICAgIGVycm9yOiBlcnJvci5tZXNzYWdlIHx8ICdBbiBlcnJvciBvY2N1cnJlZCB3aGlsZSBzdWJtaXR0aW5nIHZvdGUnLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHsgc3RhdHVzOiA1MDAgfVxuICAgICAgICApO1xuICAgIH1cbn1cbiJdLCJuYW1lcyI6WyJydW50aW1lIiwiZHluYW1pYyIsIk5leHRSZXNwb25zZSIsImRhdGFiYXNlIiwicmVmIiwic2V0Iiwic2VydmVyVGltZXN0YW1wIiwiY29sbGVjdFBheW1lbnQiLCJ2YWxpZGF0ZVBob25lTnVtYmVyIiwidmFsaWRhdGVQYXltZW50TWV0aG9kIiwidmFsaWRhdGVWb3RlQ291bnQiLCJ2YWxpZGF0ZUNhbmRpZGF0ZUV4aXN0cyIsImRldGVjdE9wZXJhdG9yIiwiUE9TVCIsInJlcXVlc3QiLCJib2R5IiwianNvbiIsImNhbmRpZGF0ZUlkIiwidm90ZUNvdW50IiwicGhvbmVOdW1iZXIiLCJwYXltZW50TWV0aG9kIiwicGhvbmVWYWxpZGF0aW9uIiwidmFsaWQiLCJzdWNjZXNzIiwiZXJyb3IiLCJzdGF0dXMiLCJ2b3RlVmFsaWRhdGlvbiIsInBheW1lbnRWYWxpZGF0aW9uIiwiY2FuZGlkYXRlVmFsaWRhdGlvbiIsInZvdGVQcmljZSIsInBhcnNlSW50IiwicHJvY2VzcyIsImVudiIsIk5FWFRfUFVCTElDX1ZPVEVfUFJJQ0UiLCJ0b3RhbEFtb3VudCIsIm9wZXJhdG9yIiwibWVzb21iU2VydmljZSIsInRyYW5zYWN0aW9uSWQiLCJEYXRlIiwibm93IiwiTWF0aCIsInJhbmRvbSIsInRvU3RyaW5nIiwic3Vic3RyIiwicGF5bWVudFJlc3VsdCIsImFtb3VudCIsInNlcnZpY2UiLCJwYXllciIsInJlcGxhY2UiLCJub25jZSIsInRyYW5zYWN0aW9uRGF0YSIsImlkIiwibWVzb21iUmVmZXJlbmNlIiwicmVmZXJlbmNlIiwiY3JlYXRlZEF0IiwidHJhbnNhY3Rpb25SZWYiLCJtZXNzYWdlIiwiY29uc29sZSJdLCJpZ25vcmVMaXN0IjpbXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(rsc)/./app/api/vote/submit/route.ts\n");

/***/ }),

/***/ "(rsc)/./lib/firebase.ts":
/*!*************************!*\
  !*** ./lib/firebase.ts ***!
  \*************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   auth: () => (/* binding */ auth),\n/* harmony export */   database: () => (/* binding */ database),\n/* harmony export */   functions: () => (/* binding */ functions)\n/* harmony export */ });\n/* harmony import */ var firebase_app__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! firebase/app */ \"(rsc)/./node_modules/firebase/app/dist/index.mjs\");\n/* harmony import */ var firebase_auth__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! firebase/auth */ \"(rsc)/./node_modules/firebase/auth/dist/index.mjs\");\n/* harmony import */ var firebase_database__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! firebase/database */ \"(rsc)/./node_modules/firebase/database/dist/index.mjs\");\n/* harmony import */ var firebase_analytics__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! firebase/analytics */ \"(rsc)/./node_modules/firebase/analytics/dist/index.mjs\");\n/* harmony import */ var firebase_functions__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! firebase/functions */ \"(rsc)/./node_modules/firebase/functions/dist/index.mjs\");\n\n\n\n\n\nconst firebaseConfig = {\n    apiKey: \"AIzaSyDW7wbUtGivk_uosXs_gZ_fKAAozVXEk7c\",\n    authDomain: \"project-5583295336911612869.firebaseapp.com\",\n    databaseURL: \"https://project-5583295336911612869-default-rtdb.europe-west1.firebasedatabase.app\",\n    projectId: \"project-5583295336911612869\",\n    storageBucket: \"project-5583295336911612869.firebasestorage.app\",\n    messagingSenderId: \"816715936754\",\n    appId: \"1:816715936754:web:28d23b835fad9e6b33b16b\",\n    measurementId: \"G-95FMJ6SP7W\"\n};\nconst app = (0,firebase_app__WEBPACK_IMPORTED_MODULE_0__.initializeApp)(firebaseConfig);\nconst auth = (0,firebase_auth__WEBPACK_IMPORTED_MODULE_1__.getAuth)(app);\nconst database = (0,firebase_database__WEBPACK_IMPORTED_MODULE_2__.getDatabase)(app);\nconst functions = (0,firebase_functions__WEBPACK_IMPORTED_MODULE_4__.getFunctions)(app, 'europe-west1') // Use same region as database\n;\n// Connect to emulator in development\nif (false) {}\n// Initialize Analytics (optional)\nif (false) {}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9saWIvZmlyZWJhc2UudHMiLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFBNEM7QUFDTDtBQUNRO0FBQ0U7QUFDMEI7QUFFM0UsTUFBTUssaUJBQWlCO0lBQ3JCQyxRQUFRO0lBQ1JDLFlBQVk7SUFDWkMsYUFBYTtJQUNiQyxXQUFXO0lBQ1hDLGVBQWU7SUFDZkMsbUJBQW1CO0lBQ25CQyxPQUFPO0lBQ1BDLGVBQWU7QUFDakI7QUFFQSxNQUFNQyxNQUFNZCwyREFBYUEsQ0FBQ0s7QUFDbkIsTUFBTVUsT0FBT2Qsc0RBQU9BLENBQUNhLEtBQUk7QUFDekIsTUFBTUUsV0FBV2QsOERBQVdBLENBQUNZLEtBQUk7QUFDakMsTUFBTUcsWUFBWWIsZ0VBQVlBLENBQUNVLEtBQUssZ0JBQWdCLDhCQUE4QjtDQUEvQjtBQUUxRCxxQ0FBcUM7QUFDckMsSUFBSUksS0FBdUUsRUFBRSxFQUc1RTtBQUVELGtDQUFrQztBQUNsQyxJQUFJLEtBQTZCLEVBQUUsRUFFbEMiLCJzb3VyY2VzIjpbIi9ob21lL2FsbWlnaHQvRG9jdW1lbnRzL05CRGFuY2VBd2FyZC9saWIvZmlyZWJhc2UudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgaW5pdGlhbGl6ZUFwcCB9IGZyb20gJ2ZpcmViYXNlL2FwcCdcbmltcG9ydCB7IGdldEF1dGggfSBmcm9tICdmaXJlYmFzZS9hdXRoJ1xuaW1wb3J0IHsgZ2V0RGF0YWJhc2UgfSBmcm9tICdmaXJlYmFzZS9kYXRhYmFzZSdcbmltcG9ydCB7IGdldEFuYWx5dGljcyB9IGZyb20gJ2ZpcmViYXNlL2FuYWx5dGljcydcbmltcG9ydCB7IGdldEZ1bmN0aW9ucywgY29ubmVjdEZ1bmN0aW9uc0VtdWxhdG9yIH0gZnJvbSAnZmlyZWJhc2UvZnVuY3Rpb25zJ1xuXG5jb25zdCBmaXJlYmFzZUNvbmZpZyA9IHtcbiAgYXBpS2V5OiBcIkFJemFTeURXN3diVXRHaXZrX3Vvc1hzX2daX2ZLQUFvelZYRWs3Y1wiLFxuICBhdXRoRG9tYWluOiBcInByb2plY3QtNTU4MzI5NTMzNjkxMTYxMjg2OS5maXJlYmFzZWFwcC5jb21cIixcbiAgZGF0YWJhc2VVUkw6IFwiaHR0cHM6Ly9wcm9qZWN0LTU1ODMyOTUzMzY5MTE2MTI4NjktZGVmYXVsdC1ydGRiLmV1cm9wZS13ZXN0MS5maXJlYmFzZWRhdGFiYXNlLmFwcFwiLFxuICBwcm9qZWN0SWQ6IFwicHJvamVjdC01NTgzMjk1MzM2OTExNjEyODY5XCIsXG4gIHN0b3JhZ2VCdWNrZXQ6IFwicHJvamVjdC01NTgzMjk1MzM2OTExNjEyODY5LmZpcmViYXNlc3RvcmFnZS5hcHBcIixcbiAgbWVzc2FnaW5nU2VuZGVySWQ6IFwiODE2NzE1OTM2NzU0XCIsXG4gIGFwcElkOiBcIjE6ODE2NzE1OTM2NzU0OndlYjoyOGQyM2I4MzVmYWQ5ZTZiMzNiMTZiXCIsXG4gIG1lYXN1cmVtZW50SWQ6IFwiRy05NUZNSjZTUDdXXCJcbn1cblxuY29uc3QgYXBwID0gaW5pdGlhbGl6ZUFwcChmaXJlYmFzZUNvbmZpZylcbmV4cG9ydCBjb25zdCBhdXRoID0gZ2V0QXV0aChhcHApXG5leHBvcnQgY29uc3QgZGF0YWJhc2UgPSBnZXREYXRhYmFzZShhcHApXG5leHBvcnQgY29uc3QgZnVuY3Rpb25zID0gZ2V0RnVuY3Rpb25zKGFwcCwgJ2V1cm9wZS13ZXN0MScpIC8vIFVzZSBzYW1lIHJlZ2lvbiBhcyBkYXRhYmFzZVxuXG4vLyBDb25uZWN0IHRvIGVtdWxhdG9yIGluIGRldmVsb3BtZW50XG5pZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgPT09ICdkZXZlbG9wbWVudCcgJiYgdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgLy8gVW5jb21tZW50IHRvIHVzZSBlbXVsYXRvcjpcbiAgLy8gY29ubmVjdEZ1bmN0aW9uc0VtdWxhdG9yKGZ1bmN0aW9ucywgJ2xvY2FsaG9zdCcsIDUwMDEpXG59XG5cbi8vIEluaXRpYWxpemUgQW5hbHl0aWNzIChvcHRpb25hbClcbmlmICh0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJykge1xuICBnZXRBbmFseXRpY3MoYXBwKVxufVxuIl0sIm5hbWVzIjpbImluaXRpYWxpemVBcHAiLCJnZXRBdXRoIiwiZ2V0RGF0YWJhc2UiLCJnZXRBbmFseXRpY3MiLCJnZXRGdW5jdGlvbnMiLCJmaXJlYmFzZUNvbmZpZyIsImFwaUtleSIsImF1dGhEb21haW4iLCJkYXRhYmFzZVVSTCIsInByb2plY3RJZCIsInN0b3JhZ2VCdWNrZXQiLCJtZXNzYWdpbmdTZW5kZXJJZCIsImFwcElkIiwibWVhc3VyZW1lbnRJZCIsImFwcCIsImF1dGgiLCJkYXRhYmFzZSIsImZ1bmN0aW9ucyIsInByb2Nlc3MiXSwiaWdub3JlTGlzdCI6W10sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(rsc)/./lib/firebase.ts\n");

/***/ }),

/***/ "(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fvote%2Fsubmit%2Froute&page=%2Fapi%2Fvote%2Fsubmit%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fvote%2Fsubmit%2Froute.ts&appDir=%2Fhome%2Falmight%2FDocuments%2FNBDanceAward%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2Fhome%2Falmight%2FDocuments%2FNBDanceAward&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!":
/*!*****************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fvote%2Fsubmit%2Froute&page=%2Fapi%2Fvote%2Fsubmit%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fvote%2Fsubmit%2Froute.ts&appDir=%2Fhome%2Falmight%2FDocuments%2FNBDanceAward%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2Fhome%2Falmight%2FDocuments%2FNBDanceAward&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D! ***!
  \*****************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   patchFetch: () => (/* binding */ patchFetch),\n/* harmony export */   routeModule: () => (/* binding */ routeModule),\n/* harmony export */   serverHooks: () => (/* binding */ serverHooks),\n/* harmony export */   workAsyncStorage: () => (/* binding */ workAsyncStorage),\n/* harmony export */   workUnitAsyncStorage: () => (/* binding */ workUnitAsyncStorage)\n/* harmony export */ });\n/* harmony import */ var next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/dist/server/route-modules/app-route/module.compiled */ \"(rsc)/./node_modules/next/dist/server/route-modules/app-route/module.compiled.js\");\n/* harmony import */ var next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var next_dist_server_route_kind__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next/dist/server/route-kind */ \"(rsc)/./node_modules/next/dist/server/route-kind.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! next/dist/server/lib/patch-fetch */ \"(rsc)/./node_modules/next/dist/server/lib/patch-fetch.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var _home_almight_Documents_NBDanceAward_app_api_vote_submit_route_ts__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./app/api/vote/submit/route.ts */ \"(rsc)/./app/api/vote/submit/route.ts\");\n\n\n\n\n// We inject the nextConfigOutput here so that we can use them in the route\n// module.\nconst nextConfigOutput = \"\"\nconst routeModule = new next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__.AppRouteRouteModule({\n    definition: {\n        kind: next_dist_server_route_kind__WEBPACK_IMPORTED_MODULE_1__.RouteKind.APP_ROUTE,\n        page: \"/api/vote/submit/route\",\n        pathname: \"/api/vote/submit\",\n        filename: \"route\",\n        bundlePath: \"app/api/vote/submit/route\"\n    },\n    resolvedPagePath: \"/home/almight/Documents/NBDanceAward/app/api/vote/submit/route.ts\",\n    nextConfigOutput,\n    userland: _home_almight_Documents_NBDanceAward_app_api_vote_submit_route_ts__WEBPACK_IMPORTED_MODULE_3__\n});\n// Pull out the exports that we need to expose from the module. This should\n// be eliminated when we've moved the other routes to the new format. These\n// are used to hook into the route.\nconst { workAsyncStorage, workUnitAsyncStorage, serverHooks } = routeModule;\nfunction patchFetch() {\n    return (0,next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__.patchFetch)({\n        workAsyncStorage,\n        workUnitAsyncStorage\n    });\n}\n\n\n//# sourceMappingURL=app-route.js.map//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9ub2RlX21vZHVsZXMvbmV4dC9kaXN0L2J1aWxkL3dlYnBhY2svbG9hZGVycy9uZXh0LWFwcC1sb2FkZXIvaW5kZXguanM/bmFtZT1hcHAlMkZhcGklMkZ2b3RlJTJGc3VibWl0JTJGcm91dGUmcGFnZT0lMkZhcGklMkZ2b3RlJTJGc3VibWl0JTJGcm91dGUmYXBwUGF0aHM9JnBhZ2VQYXRoPXByaXZhdGUtbmV4dC1hcHAtZGlyJTJGYXBpJTJGdm90ZSUyRnN1Ym1pdCUyRnJvdXRlLnRzJmFwcERpcj0lMkZob21lJTJGYWxtaWdodCUyRkRvY3VtZW50cyUyRk5CRGFuY2VBd2FyZCUyRmFwcCZwYWdlRXh0ZW5zaW9ucz10c3gmcGFnZUV4dGVuc2lvbnM9dHMmcGFnZUV4dGVuc2lvbnM9anN4JnBhZ2VFeHRlbnNpb25zPWpzJnJvb3REaXI9JTJGaG9tZSUyRmFsbWlnaHQlMkZEb2N1bWVudHMlMkZOQkRhbmNlQXdhcmQmaXNEZXY9dHJ1ZSZ0c2NvbmZpZ1BhdGg9dHNjb25maWcuanNvbiZiYXNlUGF0aD0mYXNzZXRQcmVmaXg9Jm5leHRDb25maWdPdXRwdXQ9JnByZWZlcnJlZFJlZ2lvbj0mbWlkZGxld2FyZUNvbmZpZz1lMzAlM0QhIiwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7O0FBQStGO0FBQ3ZDO0FBQ3FCO0FBQ2lCO0FBQzlGO0FBQ0E7QUFDQTtBQUNBLHdCQUF3Qix5R0FBbUI7QUFDM0M7QUFDQSxjQUFjLGtFQUFTO0FBQ3ZCO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQSxZQUFZO0FBQ1osQ0FBQztBQUNEO0FBQ0E7QUFDQTtBQUNBLFFBQVEsc0RBQXNEO0FBQzlEO0FBQ0EsV0FBVyw0RUFBVztBQUN0QjtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQzBGOztBQUUxRiIsInNvdXJjZXMiOlsiIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEFwcFJvdXRlUm91dGVNb2R1bGUgfSBmcm9tIFwibmV4dC9kaXN0L3NlcnZlci9yb3V0ZS1tb2R1bGVzL2FwcC1yb3V0ZS9tb2R1bGUuY29tcGlsZWRcIjtcbmltcG9ydCB7IFJvdXRlS2luZCB9IGZyb20gXCJuZXh0L2Rpc3Qvc2VydmVyL3JvdXRlLWtpbmRcIjtcbmltcG9ydCB7IHBhdGNoRmV0Y2ggYXMgX3BhdGNoRmV0Y2ggfSBmcm9tIFwibmV4dC9kaXN0L3NlcnZlci9saWIvcGF0Y2gtZmV0Y2hcIjtcbmltcG9ydCAqIGFzIHVzZXJsYW5kIGZyb20gXCIvaG9tZS9hbG1pZ2h0L0RvY3VtZW50cy9OQkRhbmNlQXdhcmQvYXBwL2FwaS92b3RlL3N1Ym1pdC9yb3V0ZS50c1wiO1xuLy8gV2UgaW5qZWN0IHRoZSBuZXh0Q29uZmlnT3V0cHV0IGhlcmUgc28gdGhhdCB3ZSBjYW4gdXNlIHRoZW0gaW4gdGhlIHJvdXRlXG4vLyBtb2R1bGUuXG5jb25zdCBuZXh0Q29uZmlnT3V0cHV0ID0gXCJcIlxuY29uc3Qgcm91dGVNb2R1bGUgPSBuZXcgQXBwUm91dGVSb3V0ZU1vZHVsZSh7XG4gICAgZGVmaW5pdGlvbjoge1xuICAgICAgICBraW5kOiBSb3V0ZUtpbmQuQVBQX1JPVVRFLFxuICAgICAgICBwYWdlOiBcIi9hcGkvdm90ZS9zdWJtaXQvcm91dGVcIixcbiAgICAgICAgcGF0aG5hbWU6IFwiL2FwaS92b3RlL3N1Ym1pdFwiLFxuICAgICAgICBmaWxlbmFtZTogXCJyb3V0ZVwiLFxuICAgICAgICBidW5kbGVQYXRoOiBcImFwcC9hcGkvdm90ZS9zdWJtaXQvcm91dGVcIlxuICAgIH0sXG4gICAgcmVzb2x2ZWRQYWdlUGF0aDogXCIvaG9tZS9hbG1pZ2h0L0RvY3VtZW50cy9OQkRhbmNlQXdhcmQvYXBwL2FwaS92b3RlL3N1Ym1pdC9yb3V0ZS50c1wiLFxuICAgIG5leHRDb25maWdPdXRwdXQsXG4gICAgdXNlcmxhbmRcbn0pO1xuLy8gUHVsbCBvdXQgdGhlIGV4cG9ydHMgdGhhdCB3ZSBuZWVkIHRvIGV4cG9zZSBmcm9tIHRoZSBtb2R1bGUuIFRoaXMgc2hvdWxkXG4vLyBiZSBlbGltaW5hdGVkIHdoZW4gd2UndmUgbW92ZWQgdGhlIG90aGVyIHJvdXRlcyB0byB0aGUgbmV3IGZvcm1hdC4gVGhlc2Vcbi8vIGFyZSB1c2VkIHRvIGhvb2sgaW50byB0aGUgcm91dGUuXG5jb25zdCB7IHdvcmtBc3luY1N0b3JhZ2UsIHdvcmtVbml0QXN5bmNTdG9yYWdlLCBzZXJ2ZXJIb29rcyB9ID0gcm91dGVNb2R1bGU7XG5mdW5jdGlvbiBwYXRjaEZldGNoKCkge1xuICAgIHJldHVybiBfcGF0Y2hGZXRjaCh7XG4gICAgICAgIHdvcmtBc3luY1N0b3JhZ2UsXG4gICAgICAgIHdvcmtVbml0QXN5bmNTdG9yYWdlXG4gICAgfSk7XG59XG5leHBvcnQgeyByb3V0ZU1vZHVsZSwgd29ya0FzeW5jU3RvcmFnZSwgd29ya1VuaXRBc3luY1N0b3JhZ2UsIHNlcnZlckhvb2tzLCBwYXRjaEZldGNoLCAgfTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9YXBwLXJvdXRlLmpzLm1hcCJdLCJuYW1lcyI6W10sImlnbm9yZUxpc3QiOltdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fvote%2Fsubmit%2Froute&page=%2Fapi%2Fvote%2Fsubmit%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fvote%2Fsubmit%2Froute.ts&appDir=%2Fhome%2Falmight%2FDocuments%2FNBDanceAward%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2Fhome%2Falmight%2FDocuments%2FNBDanceAward&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!\n");

/***/ }),

/***/ "(rsc)/./node_modules/next/dist/build/webpack/loaders/next-flight-client-entry-loader.js?server=true!":
/*!******************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-flight-client-entry-loader.js?server=true! ***!
  \******************************************************************************************************/
/***/ (() => {



/***/ }),

/***/ "(ssr)/./node_modules/next/dist/build/webpack/loaders/next-flight-client-entry-loader.js?server=true!":
/*!******************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-flight-client-entry-loader.js?server=true! ***!
  \******************************************************************************************************/
/***/ (() => {



/***/ }),

/***/ "../app-render/after-task-async-storage.external":
/*!***********************************************************************************!*\
  !*** external "next/dist/server/app-render/after-task-async-storage.external.js" ***!
  \***********************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/server/app-render/after-task-async-storage.external.js");

/***/ }),

/***/ "../app-render/work-async-storage.external":
/*!*****************************************************************************!*\
  !*** external "next/dist/server/app-render/work-async-storage.external.js" ***!
  \*****************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/server/app-render/work-async-storage.external.js");

/***/ }),

/***/ "./work-unit-async-storage.external":
/*!**********************************************************************************!*\
  !*** external "next/dist/server/app-render/work-unit-async-storage.external.js" ***!
  \**********************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/server/app-render/work-unit-async-storage.external.js");

/***/ }),

/***/ "buffer":
/*!*************************!*\
  !*** external "buffer" ***!
  \*************************/
/***/ ((module) => {

"use strict";
module.exports = require("buffer");

/***/ }),

/***/ "crypto":
/*!*************************!*\
  !*** external "crypto" ***!
  \*************************/
/***/ ((module) => {

"use strict";
module.exports = require("crypto");

/***/ }),

/***/ "events":
/*!*************************!*\
  !*** external "events" ***!
  \*************************/
/***/ ((module) => {

"use strict";
module.exports = require("events");

/***/ }),

/***/ "http":
/*!***********************!*\
  !*** external "http" ***!
  \***********************/
/***/ ((module) => {

"use strict";
module.exports = require("http");

/***/ }),

/***/ "https":
/*!************************!*\
  !*** external "https" ***!
  \************************/
/***/ ((module) => {

"use strict";
module.exports = require("https");

/***/ }),

/***/ "net":
/*!**********************!*\
  !*** external "net" ***!
  \**********************/
/***/ ((module) => {

"use strict";
module.exports = require("net");

/***/ }),

/***/ "next/dist/compiled/next-server/app-page.runtime.dev.js":
/*!*************************************************************************!*\
  !*** external "next/dist/compiled/next-server/app-page.runtime.dev.js" ***!
  \*************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/compiled/next-server/app-page.runtime.dev.js");

/***/ }),

/***/ "next/dist/compiled/next-server/app-route.runtime.dev.js":
/*!**************************************************************************!*\
  !*** external "next/dist/compiled/next-server/app-route.runtime.dev.js" ***!
  \**************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/compiled/next-server/app-route.runtime.dev.js");

/***/ }),

/***/ "node:assert":
/*!******************************!*\
  !*** external "node:assert" ***!
  \******************************/
/***/ ((module) => {

"use strict";
module.exports = require("node:assert");

/***/ }),

/***/ "node:async_hooks":
/*!***********************************!*\
  !*** external "node:async_hooks" ***!
  \***********************************/
/***/ ((module) => {

"use strict";
module.exports = require("node:async_hooks");

/***/ }),

/***/ "node:buffer":
/*!******************************!*\
  !*** external "node:buffer" ***!
  \******************************/
/***/ ((module) => {

"use strict";
module.exports = require("node:buffer");

/***/ }),

/***/ "node:console":
/*!*******************************!*\
  !*** external "node:console" ***!
  \*******************************/
/***/ ((module) => {

"use strict";
module.exports = require("node:console");

/***/ }),

/***/ "node:crypto":
/*!******************************!*\
  !*** external "node:crypto" ***!
  \******************************/
/***/ ((module) => {

"use strict";
module.exports = require("node:crypto");

/***/ }),

/***/ "node:diagnostics_channel":
/*!*******************************************!*\
  !*** external "node:diagnostics_channel" ***!
  \*******************************************/
/***/ ((module) => {

"use strict";
module.exports = require("node:diagnostics_channel");

/***/ }),

/***/ "node:events":
/*!******************************!*\
  !*** external "node:events" ***!
  \******************************/
/***/ ((module) => {

"use strict";
module.exports = require("node:events");

/***/ }),

/***/ "node:http":
/*!****************************!*\
  !*** external "node:http" ***!
  \****************************/
/***/ ((module) => {

"use strict";
module.exports = require("node:http");

/***/ }),

/***/ "node:http2":
/*!*****************************!*\
  !*** external "node:http2" ***!
  \*****************************/
/***/ ((module) => {

"use strict";
module.exports = require("node:http2");

/***/ }),

/***/ "node:net":
/*!***************************!*\
  !*** external "node:net" ***!
  \***************************/
/***/ ((module) => {

"use strict";
module.exports = require("node:net");

/***/ }),

/***/ "node:perf_hooks":
/*!**********************************!*\
  !*** external "node:perf_hooks" ***!
  \**********************************/
/***/ ((module) => {

"use strict";
module.exports = require("node:perf_hooks");

/***/ }),

/***/ "node:querystring":
/*!***********************************!*\
  !*** external "node:querystring" ***!
  \***********************************/
/***/ ((module) => {

"use strict";
module.exports = require("node:querystring");

/***/ }),

/***/ "node:stream":
/*!******************************!*\
  !*** external "node:stream" ***!
  \******************************/
/***/ ((module) => {

"use strict";
module.exports = require("node:stream");

/***/ }),

/***/ "node:tls":
/*!***************************!*\
  !*** external "node:tls" ***!
  \***************************/
/***/ ((module) => {

"use strict";
module.exports = require("node:tls");

/***/ }),

/***/ "node:url":
/*!***************************!*\
  !*** external "node:url" ***!
  \***************************/
/***/ ((module) => {

"use strict";
module.exports = require("node:url");

/***/ }),

/***/ "node:util":
/*!****************************!*\
  !*** external "node:util" ***!
  \****************************/
/***/ ((module) => {

"use strict";
module.exports = require("node:util");

/***/ }),

/***/ "node:util/types":
/*!**********************************!*\
  !*** external "node:util/types" ***!
  \**********************************/
/***/ ((module) => {

"use strict";
module.exports = require("node:util/types");

/***/ }),

/***/ "node:worker_threads":
/*!**************************************!*\
  !*** external "node:worker_threads" ***!
  \**************************************/
/***/ ((module) => {

"use strict";
module.exports = require("node:worker_threads");

/***/ }),

/***/ "node:zlib":
/*!****************************!*\
  !*** external "node:zlib" ***!
  \****************************/
/***/ ((module) => {

"use strict";
module.exports = require("node:zlib");

/***/ }),

/***/ "punycode":
/*!***************************!*\
  !*** external "punycode" ***!
  \***************************/
/***/ ((module) => {

"use strict";
module.exports = require("punycode");

/***/ }),

/***/ "stream":
/*!*************************!*\
  !*** external "stream" ***!
  \*************************/
/***/ ((module) => {

"use strict";
module.exports = require("stream");

/***/ }),

/***/ "string_decoder":
/*!*********************************!*\
  !*** external "string_decoder" ***!
  \*********************************/
/***/ ((module) => {

"use strict";
module.exports = require("string_decoder");

/***/ }),

/***/ "tls":
/*!**********************!*\
  !*** external "tls" ***!
  \**********************/
/***/ ((module) => {

"use strict";
module.exports = require("tls");

/***/ }),

/***/ "url":
/*!**********************!*\
  !*** external "url" ***!
  \**********************/
/***/ ((module) => {

"use strict";
module.exports = require("url");

/***/ }),

/***/ "util":
/*!***********************!*\
  !*** external "util" ***!
  \***********************/
/***/ ((module) => {

"use strict";
module.exports = require("util");

/***/ }),

/***/ "zlib":
/*!***********************!*\
  !*** external "zlib" ***!
  \***********************/
/***/ ((module) => {

"use strict";
module.exports = require("zlib");

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../../../../webpack-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = __webpack_require__.X(0, ["vendor-chunks/undici","vendor-chunks/next","vendor-chunks/crypto-js","vendor-chunks/@hachther","vendor-chunks/websocket-driver","vendor-chunks/@firebase","vendor-chunks/websocket-extensions","vendor-chunks/faye-websocket","vendor-chunks/firebase","vendor-chunks/whatwg-url","vendor-chunks/idb","vendor-chunks/tr46","vendor-chunks/tslib","vendor-chunks/node-fetch","vendor-chunks/webidl-conversions","vendor-chunks/url-parse","vendor-chunks/safe-buffer","vendor-chunks/requires-port","vendor-chunks/querystringify","vendor-chunks/isomorphic-fetch","vendor-chunks/http-parser-js"], () => (__webpack_exec__("(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fvote%2Fsubmit%2Froute&page=%2Fapi%2Fvote%2Fsubmit%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fvote%2Fsubmit%2Froute.ts&appDir=%2Fhome%2Falmight%2FDocuments%2FNBDanceAward%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2Fhome%2Falmight%2FDocuments%2FNBDanceAward&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!")));
module.exports = __webpack_exports__;

})();