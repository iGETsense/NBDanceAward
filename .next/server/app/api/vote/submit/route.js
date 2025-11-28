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
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   checkPaymentStatus: () => (/* binding */ checkPaymentStatus),\n/* harmony export */   collectPayment: () => (/* binding */ collectPayment),\n/* harmony export */   getMesombClient: () => (/* binding */ getMesombClient)\n/* harmony export */ });\n/* harmony import */ var _hachther_mesomb__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @hachther/mesomb */ \"(rsc)/./node_modules/.pnpm/@hachther+mesomb@2.0.1/node_modules/@hachther/mesomb/dist/index.js\");\n/**\n * Mesomb Payment Service for Vercel\n * Handles all payment operations using Mesomb API\n */ \n// Initialize Mesomb client\nfunction getMesombClient() {\n    return new _hachther_mesomb__WEBPACK_IMPORTED_MODULE_0__.PaymentOperation({\n        applicationKey: process.env.MESOMB_APPLICATION_KEY,\n        accessKey: process.env.MESOMB_ACCESS_KEY,\n        secretKey: process.env.MESOMB_SECRET_KEY\n    });\n}\n/**\n * Initiate payment collection from user\n */ async function collectPayment(params) {\n    try {\n        const payment = getMesombClient();\n        const transaction = await payment.makeCollect({\n            amount: params.amount,\n            service: params.service,\n            payer: params.payer,\n            nonce: params.nonce,\n            country: 'CM',\n            currency: 'XAF'\n        });\n        return {\n            success: true,\n            reference: transaction.reference,\n            message: 'Payment initiated successfully'\n        };\n    } catch (error) {\n        console.error('Mesomb payment error:', error);\n        return {\n            success: false,\n            error: error.message || 'Payment initiation failed'\n        };\n    }\n}\n/**\n * Check payment status by fetching transaction details\n */ async function checkPaymentStatus(reference) {\n    try {\n        const payment = getMesombClient();\n        // Fetch transaction using Mesomb reference\n        const transactions = await payment.getTransactions([\n            reference\n        ], 'MESOMB');\n        if (!transactions || transactions.length === 0) {\n            return {\n                success: false,\n                error: 'Transaction not found'\n            };\n        }\n        const transaction = transactions[0];\n        const isSuccess = transaction.status === 'SUCCESS' || transaction.status === 'COMPLETED';\n        return {\n            success: isSuccess,\n            reference: reference,\n            message: isSuccess ? 'Payment confirmed' : 'Payment pending or failed'\n        };\n    } catch (error) {\n        console.error('Mesomb status check error:', error);\n        return {\n            success: false,\n            error: error.message || 'Status check failed'\n        };\n    }\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9hcHAvYXBpL2xpYi9tZXNvbWIudHMiLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQUFBOzs7Q0FHQyxHQUVtRDtBQUVwRCwyQkFBMkI7QUFDcEIsU0FBU0M7SUFDWixPQUFPLElBQUlELDhEQUFnQkEsQ0FBQztRQUN4QkUsZ0JBQWdCQyxRQUFRQyxHQUFHLENBQUNDLHNCQUFzQjtRQUNsREMsV0FBV0gsUUFBUUMsR0FBRyxDQUFDRyxpQkFBaUI7UUFDeENDLFdBQVdMLFFBQVFDLEdBQUcsQ0FBQ0ssaUJBQWlCO0lBQzVDO0FBQ0o7QUFnQkE7O0NBRUMsR0FDTSxlQUFlQyxlQUFlQyxNQUE0QjtJQUM3RCxJQUFJO1FBQ0EsTUFBTUMsVUFBVVg7UUFFaEIsTUFBTVksY0FBYyxNQUFNRCxRQUFRRSxXQUFXLENBQUM7WUFDMUNDLFFBQVFKLE9BQU9JLE1BQU07WUFDckJDLFNBQVNMLE9BQU9LLE9BQU87WUFDdkJDLE9BQU9OLE9BQU9NLEtBQUs7WUFDbkJDLE9BQU9QLE9BQU9PLEtBQUs7WUFDbkJDLFNBQVM7WUFDVEMsVUFBVTtRQUNkO1FBRUEsT0FBTztZQUNIQyxTQUFTO1lBQ1RDLFdBQVdULFlBQVlTLFNBQVM7WUFDaENDLFNBQVM7UUFDYjtJQUNKLEVBQUUsT0FBT0MsT0FBWTtRQUNqQkMsUUFBUUQsS0FBSyxDQUFDLHlCQUF5QkE7UUFDdkMsT0FBTztZQUNISCxTQUFTO1lBQ1RHLE9BQU9BLE1BQU1ELE9BQU8sSUFBSTtRQUM1QjtJQUNKO0FBQ0o7QUFFQTs7Q0FFQyxHQUNNLGVBQWVHLG1CQUFtQkosU0FBaUI7SUFDdEQsSUFBSTtRQUNBLE1BQU1WLFVBQVVYO1FBRWhCLDJDQUEyQztRQUMzQyxNQUFNMEIsZUFBZSxNQUFNZixRQUFRZ0IsZUFBZSxDQUFDO1lBQUNOO1NBQVUsRUFBRTtRQUVoRSxJQUFJLENBQUNLLGdCQUFnQkEsYUFBYUUsTUFBTSxLQUFLLEdBQUc7WUFDNUMsT0FBTztnQkFDSFIsU0FBUztnQkFDVEcsT0FBTztZQUNYO1FBQ0o7UUFFQSxNQUFNWCxjQUFjYyxZQUFZLENBQUMsRUFBRTtRQUNuQyxNQUFNRyxZQUFZakIsWUFBWWtCLE1BQU0sS0FBSyxhQUFhbEIsWUFBWWtCLE1BQU0sS0FBSztRQUU3RSxPQUFPO1lBQ0hWLFNBQVNTO1lBQ1RSLFdBQVdBO1lBQ1hDLFNBQVNPLFlBQVksc0JBQXNCO1FBQy9DO0lBQ0osRUFBRSxPQUFPTixPQUFZO1FBQ2pCQyxRQUFRRCxLQUFLLENBQUMsOEJBQThCQTtRQUM1QyxPQUFPO1lBQ0hILFNBQVM7WUFDVEcsT0FBT0EsTUFBTUQsT0FBTyxJQUFJO1FBQzVCO0lBQ0o7QUFDSiIsInNvdXJjZXMiOlsiL2hvbWUvYWxtaWdodC9Eb2N1bWVudHMvTkJEYW5jZUF3YXJkL2FwcC9hcGkvbGliL21lc29tYi50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIE1lc29tYiBQYXltZW50IFNlcnZpY2UgZm9yIFZlcmNlbFxuICogSGFuZGxlcyBhbGwgcGF5bWVudCBvcGVyYXRpb25zIHVzaW5nIE1lc29tYiBBUElcbiAqL1xuXG5pbXBvcnQgeyBQYXltZW50T3BlcmF0aW9uIH0gZnJvbSAnQGhhY2h0aGVyL21lc29tYic7XG5cbi8vIEluaXRpYWxpemUgTWVzb21iIGNsaWVudFxuZXhwb3J0IGZ1bmN0aW9uIGdldE1lc29tYkNsaWVudCgpIHtcbiAgICByZXR1cm4gbmV3IFBheW1lbnRPcGVyYXRpb24oe1xuICAgICAgICBhcHBsaWNhdGlvbktleTogcHJvY2Vzcy5lbnYuTUVTT01CX0FQUExJQ0FUSU9OX0tFWSEsXG4gICAgICAgIGFjY2Vzc0tleTogcHJvY2Vzcy5lbnYuTUVTT01CX0FDQ0VTU19LRVkhLFxuICAgICAgICBzZWNyZXRLZXk6IHByb2Nlc3MuZW52Lk1FU09NQl9TRUNSRVRfS0VZISxcbiAgICB9KTtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBDb2xsZWN0UGF5bWVudFBhcmFtcyB7XG4gICAgYW1vdW50OiBudW1iZXI7XG4gICAgc2VydmljZTogJ01UTicgfCAnT1JBTkdFJztcbiAgICBwYXllcjogc3RyaW5nOyAvLyBQaG9uZSBudW1iZXJcbiAgICBub25jZTogc3RyaW5nOyAvLyBVbmlxdWUgdHJhbnNhY3Rpb24gSURcbn1cblxuZXhwb3J0IGludGVyZmFjZSBQYXltZW50UmVzdWx0IHtcbiAgICBzdWNjZXNzOiBib29sZWFuO1xuICAgIHJlZmVyZW5jZT86IHN0cmluZztcbiAgICBtZXNzYWdlPzogc3RyaW5nO1xuICAgIGVycm9yPzogc3RyaW5nO1xufVxuXG4vKipcbiAqIEluaXRpYXRlIHBheW1lbnQgY29sbGVjdGlvbiBmcm9tIHVzZXJcbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGNvbGxlY3RQYXltZW50KHBhcmFtczogQ29sbGVjdFBheW1lbnRQYXJhbXMpOiBQcm9taXNlPFBheW1lbnRSZXN1bHQ+IHtcbiAgICB0cnkge1xuICAgICAgICBjb25zdCBwYXltZW50ID0gZ2V0TWVzb21iQ2xpZW50KCk7XG5cbiAgICAgICAgY29uc3QgdHJhbnNhY3Rpb24gPSBhd2FpdCBwYXltZW50Lm1ha2VDb2xsZWN0KHtcbiAgICAgICAgICAgIGFtb3VudDogcGFyYW1zLmFtb3VudCxcbiAgICAgICAgICAgIHNlcnZpY2U6IHBhcmFtcy5zZXJ2aWNlLFxuICAgICAgICAgICAgcGF5ZXI6IHBhcmFtcy5wYXllcixcbiAgICAgICAgICAgIG5vbmNlOiBwYXJhbXMubm9uY2UsXG4gICAgICAgICAgICBjb3VudHJ5OiAnQ00nLCAvLyBDYW1lcm9vblxuICAgICAgICAgICAgY3VycmVuY3k6ICdYQUYnLCAvLyBDZW50cmFsIEFmcmljYW4gRnJhbmNcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHN1Y2Nlc3M6IHRydWUsXG4gICAgICAgICAgICByZWZlcmVuY2U6IHRyYW5zYWN0aW9uLnJlZmVyZW5jZSxcbiAgICAgICAgICAgIG1lc3NhZ2U6ICdQYXltZW50IGluaXRpYXRlZCBzdWNjZXNzZnVsbHknLFxuICAgICAgICB9O1xuICAgIH0gY2F0Y2ggKGVycm9yOiBhbnkpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcignTWVzb21iIHBheW1lbnQgZXJyb3I6JywgZXJyb3IpO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgc3VjY2VzczogZmFsc2UsXG4gICAgICAgICAgICBlcnJvcjogZXJyb3IubWVzc2FnZSB8fCAnUGF5bWVudCBpbml0aWF0aW9uIGZhaWxlZCcsXG4gICAgICAgIH07XG4gICAgfVxufVxuXG4vKipcbiAqIENoZWNrIHBheW1lbnQgc3RhdHVzIGJ5IGZldGNoaW5nIHRyYW5zYWN0aW9uIGRldGFpbHNcbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGNoZWNrUGF5bWVudFN0YXR1cyhyZWZlcmVuY2U6IHN0cmluZyk6IFByb21pc2U8UGF5bWVudFJlc3VsdD4ge1xuICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHBheW1lbnQgPSBnZXRNZXNvbWJDbGllbnQoKTtcblxuICAgICAgICAvLyBGZXRjaCB0cmFuc2FjdGlvbiB1c2luZyBNZXNvbWIgcmVmZXJlbmNlXG4gICAgICAgIGNvbnN0IHRyYW5zYWN0aW9ucyA9IGF3YWl0IHBheW1lbnQuZ2V0VHJhbnNhY3Rpb25zKFtyZWZlcmVuY2VdLCAnTUVTT01CJyk7XG5cbiAgICAgICAgaWYgKCF0cmFuc2FjdGlvbnMgfHwgdHJhbnNhY3Rpb25zLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBzdWNjZXNzOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBlcnJvcjogJ1RyYW5zYWN0aW9uIG5vdCBmb3VuZCcsXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgdHJhbnNhY3Rpb24gPSB0cmFuc2FjdGlvbnNbMF07XG4gICAgICAgIGNvbnN0IGlzU3VjY2VzcyA9IHRyYW5zYWN0aW9uLnN0YXR1cyA9PT0gJ1NVQ0NFU1MnIHx8IHRyYW5zYWN0aW9uLnN0YXR1cyA9PT0gJ0NPTVBMRVRFRCc7XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHN1Y2Nlc3M6IGlzU3VjY2VzcyxcbiAgICAgICAgICAgIHJlZmVyZW5jZTogcmVmZXJlbmNlLFxuICAgICAgICAgICAgbWVzc2FnZTogaXNTdWNjZXNzID8gJ1BheW1lbnQgY29uZmlybWVkJyA6ICdQYXltZW50IHBlbmRpbmcgb3IgZmFpbGVkJyxcbiAgICAgICAgfTtcbiAgICB9IGNhdGNoIChlcnJvcjogYW55KSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ01lc29tYiBzdGF0dXMgY2hlY2sgZXJyb3I6JywgZXJyb3IpO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgc3VjY2VzczogZmFsc2UsXG4gICAgICAgICAgICBlcnJvcjogZXJyb3IubWVzc2FnZSB8fCAnU3RhdHVzIGNoZWNrIGZhaWxlZCcsXG4gICAgICAgIH07XG4gICAgfVxufVxuIl0sIm5hbWVzIjpbIlBheW1lbnRPcGVyYXRpb24iLCJnZXRNZXNvbWJDbGllbnQiLCJhcHBsaWNhdGlvbktleSIsInByb2Nlc3MiLCJlbnYiLCJNRVNPTUJfQVBQTElDQVRJT05fS0VZIiwiYWNjZXNzS2V5IiwiTUVTT01CX0FDQ0VTU19LRVkiLCJzZWNyZXRLZXkiLCJNRVNPTUJfU0VDUkVUX0tFWSIsImNvbGxlY3RQYXltZW50IiwicGFyYW1zIiwicGF5bWVudCIsInRyYW5zYWN0aW9uIiwibWFrZUNvbGxlY3QiLCJhbW91bnQiLCJzZXJ2aWNlIiwicGF5ZXIiLCJub25jZSIsImNvdW50cnkiLCJjdXJyZW5jeSIsInN1Y2Nlc3MiLCJyZWZlcmVuY2UiLCJtZXNzYWdlIiwiZXJyb3IiLCJjb25zb2xlIiwiY2hlY2tQYXltZW50U3RhdHVzIiwidHJhbnNhY3Rpb25zIiwiZ2V0VHJhbnNhY3Rpb25zIiwibGVuZ3RoIiwiaXNTdWNjZXNzIiwic3RhdHVzIl0sImlnbm9yZUxpc3QiOltdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(rsc)/./app/api/lib/mesomb.ts\n");

/***/ }),

/***/ "(rsc)/./app/api/lib/validation.ts":
/*!***********************************!*\
  !*** ./app/api/lib/validation.ts ***!
  \***********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   detectOperator: () => (/* binding */ detectOperator),\n/* harmony export */   validateCandidateExists: () => (/* binding */ validateCandidateExists),\n/* harmony export */   validatePaymentMethod: () => (/* binding */ validatePaymentMethod),\n/* harmony export */   validatePhoneNumber: () => (/* binding */ validatePhoneNumber),\n/* harmony export */   validateVoteCount: () => (/* binding */ validateVoteCount)\n/* harmony export */ });\n/* harmony import */ var _lib_firebase__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @/lib/firebase */ \"(rsc)/./lib/firebase.ts\");\n/* harmony import */ var firebase_database__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! firebase/database */ \"(rsc)/./node_modules/.pnpm/firebase@10.14.1/node_modules/firebase/database/dist/index.mjs\");\n/**\n * Vote Validation Service for Vercel\n * Server-side validation for vote submissions\n */ \n\n/**\n * Validate Cameroon phone number\n */ function validatePhoneNumber(phoneNumber) {\n    // Remove spaces and country code\n    const cleaned = phoneNumber.replace(/\\s/g, '').replace(/^\\+237/, '');\n    // Cameroon numbers: 6xx xxx xxx (9 digits starting with 6)\n    const phoneRegex = /^6\\d{8}$/;\n    if (!phoneRegex.test(cleaned)) {\n        return {\n            valid: false,\n            error: 'Invalid phone number format. Must be a Cameroon number (6xx xxx xxx)'\n        };\n    }\n    return {\n        valid: true\n    };\n}\n/**\n * Detect mobile operator from phone number\n */ function detectOperator(phoneNumber) {\n    const cleaned = phoneNumber.replace(/\\s/g, '').replace(/^\\+237/, '');\n    // MTN prefixes: 650-654, 670-679, 680-689\n    const mtnPrefixes = [\n        '650',\n        '651',\n        '652',\n        '653',\n        '654',\n        '670',\n        '671',\n        '672',\n        '673',\n        '674',\n        '675',\n        '676',\n        '677',\n        '678',\n        '679',\n        '680',\n        '681',\n        '682',\n        '683',\n        '684',\n        '685',\n        '686',\n        '687',\n        '688',\n        '689'\n    ];\n    // Orange prefixes: 655-659, 690-699\n    const orangePrefixes = [\n        '655',\n        '656',\n        '657',\n        '658',\n        '659',\n        '690',\n        '691',\n        '692',\n        '693',\n        '694',\n        '695',\n        '696',\n        '697',\n        '698',\n        '699'\n    ];\n    const prefix = cleaned.substring(0, 3);\n    if (mtnPrefixes.includes(prefix)) {\n        return 'MTN';\n    } else if (orangePrefixes.includes(prefix)) {\n        return 'ORANGE';\n    }\n    return 'UNKNOWN';\n}\n/**\n * Validate payment method matches phone operator\n */ function validatePaymentMethod(phoneNumber, paymentMethod) {\n    const operator = detectOperator(phoneNumber);\n    if (operator === 'UNKNOWN') {\n        return {\n            valid: false,\n            error: 'Unsupported operator. Only MTN and Orange Money are accepted.'\n        };\n    }\n    const expectedMethod = operator === 'MTN' ? 'mobile' : 'orange';\n    if (paymentMethod !== expectedMethod) {\n        return {\n            valid: false,\n            error: `Phone number is ${operator} but payment method is ${paymentMethod.toUpperCase()}. Please select the correct payment method.`\n        };\n    }\n    return {\n        valid: true\n    };\n}\n/**\n * Validate vote count\n */ function validateVoteCount(voteCount) {\n    if (!Number.isInteger(voteCount) || voteCount < 1 || voteCount > 100) {\n        return {\n            valid: false,\n            error: 'Vote count must be between 1 and 100'\n        };\n    }\n    return {\n        valid: true\n    };\n}\n/**\n * Validate candidate ID exists\n */ async function validateCandidateExists(candidateId) {\n    try {\n        const candidateRef = (0,firebase_database__WEBPACK_IMPORTED_MODULE_1__.ref)(_lib_firebase__WEBPACK_IMPORTED_MODULE_0__.database, `candidates/${candidateId}`);\n        const snapshot = await (0,firebase_database__WEBPACK_IMPORTED_MODULE_1__.get)(candidateRef);\n        if (!snapshot.exists()) {\n            return {\n                valid: false,\n                error: 'Candidate not found'\n            };\n        }\n        return {\n            valid: true\n        };\n    } catch (error) {\n        return {\n            valid: false,\n            error: 'Error validating candidate'\n        };\n    }\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9hcHAvYXBpL2xpYi92YWxpZGF0aW9uLnRzIiwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7QUFBQTs7O0NBR0MsR0FFeUM7QUFDRztBQU83Qzs7Q0FFQyxHQUNNLFNBQVNHLG9CQUFvQkMsV0FBbUI7SUFDbkQsaUNBQWlDO0lBQ2pDLE1BQU1DLFVBQVVELFlBQVlFLE9BQU8sQ0FBQyxPQUFPLElBQUlBLE9BQU8sQ0FBQyxVQUFVO0lBRWpFLDJEQUEyRDtJQUMzRCxNQUFNQyxhQUFhO0lBRW5CLElBQUksQ0FBQ0EsV0FBV0MsSUFBSSxDQUFDSCxVQUFVO1FBQzNCLE9BQU87WUFDSEksT0FBTztZQUNQQyxPQUFPO1FBQ1g7SUFDSjtJQUVBLE9BQU87UUFBRUQsT0FBTztJQUFLO0FBQ3pCO0FBRUE7O0NBRUMsR0FDTSxTQUFTRSxlQUFlUCxXQUFtQjtJQUM5QyxNQUFNQyxVQUFVRCxZQUFZRSxPQUFPLENBQUMsT0FBTyxJQUFJQSxPQUFPLENBQUMsVUFBVTtJQUVqRSwwQ0FBMEM7SUFDMUMsTUFBTU0sY0FBYztRQUFDO1FBQU87UUFBTztRQUFPO1FBQU87UUFBTztRQUFPO1FBQU87UUFBTztRQUFPO1FBQU87UUFBTztRQUFPO1FBQU87UUFBTztRQUFPO1FBQU87UUFBTztRQUFPO1FBQU87UUFBTztRQUFPO1FBQU87UUFBTztRQUFPO0tBQU07SUFFbk0sb0NBQW9DO0lBQ3BDLE1BQU1DLGlCQUFpQjtRQUFDO1FBQU87UUFBTztRQUFPO1FBQU87UUFBTztRQUFPO1FBQU87UUFBTztRQUFPO1FBQU87UUFBTztRQUFPO1FBQU87UUFBTztLQUFNO0lBRWhJLE1BQU1DLFNBQVNULFFBQVFVLFNBQVMsQ0FBQyxHQUFHO0lBRXBDLElBQUlILFlBQVlJLFFBQVEsQ0FBQ0YsU0FBUztRQUM5QixPQUFPO0lBQ1gsT0FBTyxJQUFJRCxlQUFlRyxRQUFRLENBQUNGLFNBQVM7UUFDeEMsT0FBTztJQUNYO0lBRUEsT0FBTztBQUNYO0FBRUE7O0NBRUMsR0FDTSxTQUFTRyxzQkFBc0JiLFdBQW1CLEVBQUVjLGFBQXFCO0lBQzVFLE1BQU1DLFdBQVdSLGVBQWVQO0lBRWhDLElBQUllLGFBQWEsV0FBVztRQUN4QixPQUFPO1lBQ0hWLE9BQU87WUFDUEMsT0FBTztRQUNYO0lBQ0o7SUFFQSxNQUFNVSxpQkFBaUJELGFBQWEsUUFBUSxXQUFXO0lBRXZELElBQUlELGtCQUFrQkUsZ0JBQWdCO1FBQ2xDLE9BQU87WUFDSFgsT0FBTztZQUNQQyxPQUFPLENBQUMsZ0JBQWdCLEVBQUVTLFNBQVMsdUJBQXVCLEVBQUVELGNBQWNHLFdBQVcsR0FBRywyQ0FBMkMsQ0FBQztRQUN4STtJQUNKO0lBRUEsT0FBTztRQUFFWixPQUFPO0lBQUs7QUFDekI7QUFFQTs7Q0FFQyxHQUNNLFNBQVNhLGtCQUFrQkMsU0FBaUI7SUFDL0MsSUFBSSxDQUFDQyxPQUFPQyxTQUFTLENBQUNGLGNBQWNBLFlBQVksS0FBS0EsWUFBWSxLQUFLO1FBQ2xFLE9BQU87WUFDSGQsT0FBTztZQUNQQyxPQUFPO1FBQ1g7SUFDSjtJQUVBLE9BQU87UUFBRUQsT0FBTztJQUFLO0FBQ3pCO0FBRUE7O0NBRUMsR0FDTSxlQUFlaUIsd0JBQXdCQyxXQUFtQjtJQUM3RCxJQUFJO1FBQ0EsTUFBTUMsZUFBZTNCLHNEQUFHQSxDQUFDRCxtREFBUUEsRUFBRSxDQUFDLFdBQVcsRUFBRTJCLGFBQWE7UUFDOUQsTUFBTUUsV0FBVyxNQUFNM0Isc0RBQUdBLENBQUMwQjtRQUUzQixJQUFJLENBQUNDLFNBQVNDLE1BQU0sSUFBSTtZQUNwQixPQUFPO2dCQUNIckIsT0FBTztnQkFDUEMsT0FBTztZQUNYO1FBQ0o7UUFFQSxPQUFPO1lBQUVELE9BQU87UUFBSztJQUN6QixFQUFFLE9BQU9DLE9BQU87UUFDWixPQUFPO1lBQ0hELE9BQU87WUFDUEMsT0FBTztRQUNYO0lBQ0o7QUFDSiIsInNvdXJjZXMiOlsiL2hvbWUvYWxtaWdodC9Eb2N1bWVudHMvTkJEYW5jZUF3YXJkL2FwcC9hcGkvbGliL3ZhbGlkYXRpb24udHMiXSwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBWb3RlIFZhbGlkYXRpb24gU2VydmljZSBmb3IgVmVyY2VsXG4gKiBTZXJ2ZXItc2lkZSB2YWxpZGF0aW9uIGZvciB2b3RlIHN1Ym1pc3Npb25zXG4gKi9cblxuaW1wb3J0IHsgZGF0YWJhc2UgfSBmcm9tICdAL2xpYi9maXJlYmFzZSc7XG5pbXBvcnQgeyByZWYsIGdldCB9IGZyb20gJ2ZpcmViYXNlL2RhdGFiYXNlJztcblxuZXhwb3J0IGludGVyZmFjZSBWYWxpZGF0aW9uUmVzdWx0IHtcbiAgICB2YWxpZDogYm9vbGVhbjtcbiAgICBlcnJvcj86IHN0cmluZztcbn1cblxuLyoqXG4gKiBWYWxpZGF0ZSBDYW1lcm9vbiBwaG9uZSBudW1iZXJcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHZhbGlkYXRlUGhvbmVOdW1iZXIocGhvbmVOdW1iZXI6IHN0cmluZyk6IFZhbGlkYXRpb25SZXN1bHQge1xuICAgIC8vIFJlbW92ZSBzcGFjZXMgYW5kIGNvdW50cnkgY29kZVxuICAgIGNvbnN0IGNsZWFuZWQgPSBwaG9uZU51bWJlci5yZXBsYWNlKC9cXHMvZywgJycpLnJlcGxhY2UoL15cXCsyMzcvLCAnJyk7XG5cbiAgICAvLyBDYW1lcm9vbiBudW1iZXJzOiA2eHggeHh4IHh4eCAoOSBkaWdpdHMgc3RhcnRpbmcgd2l0aCA2KVxuICAgIGNvbnN0IHBob25lUmVnZXggPSAvXjZcXGR7OH0kLztcblxuICAgIGlmICghcGhvbmVSZWdleC50ZXN0KGNsZWFuZWQpKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICB2YWxpZDogZmFsc2UsXG4gICAgICAgICAgICBlcnJvcjogJ0ludmFsaWQgcGhvbmUgbnVtYmVyIGZvcm1hdC4gTXVzdCBiZSBhIENhbWVyb29uIG51bWJlciAoNnh4IHh4eCB4eHgpJyxcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICByZXR1cm4geyB2YWxpZDogdHJ1ZSB9O1xufVxuXG4vKipcbiAqIERldGVjdCBtb2JpbGUgb3BlcmF0b3IgZnJvbSBwaG9uZSBudW1iZXJcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGRldGVjdE9wZXJhdG9yKHBob25lTnVtYmVyOiBzdHJpbmcpOiAnTVROJyB8ICdPUkFOR0UnIHwgJ1VOS05PV04nIHtcbiAgICBjb25zdCBjbGVhbmVkID0gcGhvbmVOdW1iZXIucmVwbGFjZSgvXFxzL2csICcnKS5yZXBsYWNlKC9eXFwrMjM3LywgJycpO1xuXG4gICAgLy8gTVROIHByZWZpeGVzOiA2NTAtNjU0LCA2NzAtNjc5LCA2ODAtNjg5XG4gICAgY29uc3QgbXRuUHJlZml4ZXMgPSBbJzY1MCcsICc2NTEnLCAnNjUyJywgJzY1MycsICc2NTQnLCAnNjcwJywgJzY3MScsICc2NzInLCAnNjczJywgJzY3NCcsICc2NzUnLCAnNjc2JywgJzY3NycsICc2NzgnLCAnNjc5JywgJzY4MCcsICc2ODEnLCAnNjgyJywgJzY4MycsICc2ODQnLCAnNjg1JywgJzY4NicsICc2ODcnLCAnNjg4JywgJzY4OSddO1xuXG4gICAgLy8gT3JhbmdlIHByZWZpeGVzOiA2NTUtNjU5LCA2OTAtNjk5XG4gICAgY29uc3Qgb3JhbmdlUHJlZml4ZXMgPSBbJzY1NScsICc2NTYnLCAnNjU3JywgJzY1OCcsICc2NTknLCAnNjkwJywgJzY5MScsICc2OTInLCAnNjkzJywgJzY5NCcsICc2OTUnLCAnNjk2JywgJzY5NycsICc2OTgnLCAnNjk5J107XG5cbiAgICBjb25zdCBwcmVmaXggPSBjbGVhbmVkLnN1YnN0cmluZygwLCAzKTtcblxuICAgIGlmIChtdG5QcmVmaXhlcy5pbmNsdWRlcyhwcmVmaXgpKSB7XG4gICAgICAgIHJldHVybiAnTVROJztcbiAgICB9IGVsc2UgaWYgKG9yYW5nZVByZWZpeGVzLmluY2x1ZGVzKHByZWZpeCkpIHtcbiAgICAgICAgcmV0dXJuICdPUkFOR0UnO1xuICAgIH1cblxuICAgIHJldHVybiAnVU5LTk9XTic7XG59XG5cbi8qKlxuICogVmFsaWRhdGUgcGF5bWVudCBtZXRob2QgbWF0Y2hlcyBwaG9uZSBvcGVyYXRvclxuICovXG5leHBvcnQgZnVuY3Rpb24gdmFsaWRhdGVQYXltZW50TWV0aG9kKHBob25lTnVtYmVyOiBzdHJpbmcsIHBheW1lbnRNZXRob2Q6IHN0cmluZyk6IFZhbGlkYXRpb25SZXN1bHQge1xuICAgIGNvbnN0IG9wZXJhdG9yID0gZGV0ZWN0T3BlcmF0b3IocGhvbmVOdW1iZXIpO1xuXG4gICAgaWYgKG9wZXJhdG9yID09PSAnVU5LTk9XTicpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHZhbGlkOiBmYWxzZSxcbiAgICAgICAgICAgIGVycm9yOiAnVW5zdXBwb3J0ZWQgb3BlcmF0b3IuIE9ubHkgTVROIGFuZCBPcmFuZ2UgTW9uZXkgYXJlIGFjY2VwdGVkLicsXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgY29uc3QgZXhwZWN0ZWRNZXRob2QgPSBvcGVyYXRvciA9PT0gJ01UTicgPyAnbW9iaWxlJyA6ICdvcmFuZ2UnO1xuXG4gICAgaWYgKHBheW1lbnRNZXRob2QgIT09IGV4cGVjdGVkTWV0aG9kKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICB2YWxpZDogZmFsc2UsXG4gICAgICAgICAgICBlcnJvcjogYFBob25lIG51bWJlciBpcyAke29wZXJhdG9yfSBidXQgcGF5bWVudCBtZXRob2QgaXMgJHtwYXltZW50TWV0aG9kLnRvVXBwZXJDYXNlKCl9LiBQbGVhc2Ugc2VsZWN0IHRoZSBjb3JyZWN0IHBheW1lbnQgbWV0aG9kLmAsXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgcmV0dXJuIHsgdmFsaWQ6IHRydWUgfTtcbn1cblxuLyoqXG4gKiBWYWxpZGF0ZSB2b3RlIGNvdW50XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB2YWxpZGF0ZVZvdGVDb3VudCh2b3RlQ291bnQ6IG51bWJlcik6IFZhbGlkYXRpb25SZXN1bHQge1xuICAgIGlmICghTnVtYmVyLmlzSW50ZWdlcih2b3RlQ291bnQpIHx8IHZvdGVDb3VudCA8IDEgfHwgdm90ZUNvdW50ID4gMTAwKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICB2YWxpZDogZmFsc2UsXG4gICAgICAgICAgICBlcnJvcjogJ1ZvdGUgY291bnQgbXVzdCBiZSBiZXR3ZWVuIDEgYW5kIDEwMCcsXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgcmV0dXJuIHsgdmFsaWQ6IHRydWUgfTtcbn1cblxuLyoqXG4gKiBWYWxpZGF0ZSBjYW5kaWRhdGUgSUQgZXhpc3RzXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiB2YWxpZGF0ZUNhbmRpZGF0ZUV4aXN0cyhjYW5kaWRhdGVJZDogc3RyaW5nKTogUHJvbWlzZTxWYWxpZGF0aW9uUmVzdWx0PiB7XG4gICAgdHJ5IHtcbiAgICAgICAgY29uc3QgY2FuZGlkYXRlUmVmID0gcmVmKGRhdGFiYXNlLCBgY2FuZGlkYXRlcy8ke2NhbmRpZGF0ZUlkfWApO1xuICAgICAgICBjb25zdCBzbmFwc2hvdCA9IGF3YWl0IGdldChjYW5kaWRhdGVSZWYpO1xuXG4gICAgICAgIGlmICghc25hcHNob3QuZXhpc3RzKCkpIHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgdmFsaWQ6IGZhbHNlLFxuICAgICAgICAgICAgICAgIGVycm9yOiAnQ2FuZGlkYXRlIG5vdCBmb3VuZCcsXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHsgdmFsaWQ6IHRydWUgfTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgdmFsaWQ6IGZhbHNlLFxuICAgICAgICAgICAgZXJyb3I6ICdFcnJvciB2YWxpZGF0aW5nIGNhbmRpZGF0ZScsXG4gICAgICAgIH07XG4gICAgfVxufVxuIl0sIm5hbWVzIjpbImRhdGFiYXNlIiwicmVmIiwiZ2V0IiwidmFsaWRhdGVQaG9uZU51bWJlciIsInBob25lTnVtYmVyIiwiY2xlYW5lZCIsInJlcGxhY2UiLCJwaG9uZVJlZ2V4IiwidGVzdCIsInZhbGlkIiwiZXJyb3IiLCJkZXRlY3RPcGVyYXRvciIsIm10blByZWZpeGVzIiwib3JhbmdlUHJlZml4ZXMiLCJwcmVmaXgiLCJzdWJzdHJpbmciLCJpbmNsdWRlcyIsInZhbGlkYXRlUGF5bWVudE1ldGhvZCIsInBheW1lbnRNZXRob2QiLCJvcGVyYXRvciIsImV4cGVjdGVkTWV0aG9kIiwidG9VcHBlckNhc2UiLCJ2YWxpZGF0ZVZvdGVDb3VudCIsInZvdGVDb3VudCIsIk51bWJlciIsImlzSW50ZWdlciIsInZhbGlkYXRlQ2FuZGlkYXRlRXhpc3RzIiwiY2FuZGlkYXRlSWQiLCJjYW5kaWRhdGVSZWYiLCJzbmFwc2hvdCIsImV4aXN0cyJdLCJpZ25vcmVMaXN0IjpbXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(rsc)/./app/api/lib/validation.ts\n");

/***/ }),

/***/ "(rsc)/./app/api/vote/submit/route.ts":
/*!**************************************!*\
  !*** ./app/api/vote/submit/route.ts ***!
  \**************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   POST: () => (/* binding */ POST)\n/* harmony export */ });\n/* harmony import */ var next_server__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/server */ \"(rsc)/./node_modules/.pnpm/next@15.2.4_react-dom@19.2.0_react@19.2.0__react@19.2.0/node_modules/next/dist/api/server.js\");\n/* harmony import */ var _lib_firebase__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @/lib/firebase */ \"(rsc)/./lib/firebase.ts\");\n/* harmony import */ var firebase_database__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! firebase/database */ \"(rsc)/./node_modules/.pnpm/firebase@10.14.1/node_modules/firebase/database/dist/index.mjs\");\n/* harmony import */ var _lib_mesomb__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../lib/mesomb */ \"(rsc)/./app/api/lib/mesomb.ts\");\n/* harmony import */ var _lib_validation__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../lib/validation */ \"(rsc)/./app/api/lib/validation.ts\");\n/**\n * Submit Vote API Route\n * POST /api/vote/submit\n */ \n\n\n\n\nasync function POST(request) {\n    try {\n        const body = await request.json();\n        const { candidateId, voteCount, phoneNumber, paymentMethod } = body;\n        // Validate inputs\n        const phoneValidation = (0,_lib_validation__WEBPACK_IMPORTED_MODULE_4__.validatePhoneNumber)(phoneNumber);\n        if (!phoneValidation.valid) {\n            return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n                success: false,\n                error: phoneValidation.error\n            }, {\n                status: 400\n            });\n        }\n        const voteValidation = (0,_lib_validation__WEBPACK_IMPORTED_MODULE_4__.validateVoteCount)(voteCount);\n        if (!voteValidation.valid) {\n            return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n                success: false,\n                error: voteValidation.error\n            }, {\n                status: 400\n            });\n        }\n        const paymentValidation = (0,_lib_validation__WEBPACK_IMPORTED_MODULE_4__.validatePaymentMethod)(phoneNumber, paymentMethod);\n        if (!paymentValidation.valid) {\n            return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n                success: false,\n                error: paymentValidation.error\n            }, {\n                status: 400\n            });\n        }\n        const candidateValidation = await (0,_lib_validation__WEBPACK_IMPORTED_MODULE_4__.validateCandidateExists)(candidateId);\n        if (!candidateValidation.valid) {\n            return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n                success: false,\n                error: candidateValidation.error\n            }, {\n                status: 404\n            });\n        }\n        // Calculate payment amount\n        const votePrice = parseInt(process.env.NEXT_PUBLIC_VOTE_PRICE || '100');\n        const totalAmount = voteCount * votePrice;\n        // Detect operator and map to Mesomb service\n        const operator = (0,_lib_validation__WEBPACK_IMPORTED_MODULE_4__.detectOperator)(phoneNumber);\n        const mesombService = operator === 'MTN' ? 'MTN' : 'ORANGE';\n        // Generate unique transaction ID\n        const transactionId = `vote_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;\n        // Initiate payment with Mesomb\n        const paymentResult = await (0,_lib_mesomb__WEBPACK_IMPORTED_MODULE_3__.collectPayment)({\n            amount: totalAmount,\n            service: mesombService,\n            payer: phoneNumber.replace(/\\s/g, '').replace(/^\\+237/, ''),\n            nonce: transactionId\n        });\n        if (!paymentResult.success) {\n            return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n                success: false,\n                error: paymentResult.error || 'Payment initiation failed'\n            }, {\n                status: 500\n            });\n        }\n        // Create transaction record in Firebase\n        const transactionData = {\n            id: transactionId,\n            candidateId,\n            voteCount,\n            phoneNumber,\n            paymentMethod,\n            operator: mesombService,\n            amount: totalAmount,\n            mesombReference: paymentResult.reference,\n            status: 'pending',\n            createdAt: (0,firebase_database__WEBPACK_IMPORTED_MODULE_2__.serverTimestamp)()\n        };\n        const transactionRef = (0,firebase_database__WEBPACK_IMPORTED_MODULE_2__.ref)(_lib_firebase__WEBPACK_IMPORTED_MODULE_1__.database, `transactions/${transactionId}`);\n        await (0,firebase_database__WEBPACK_IMPORTED_MODULE_2__.set)(transactionRef, transactionData);\n        return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n            success: true,\n            transactionId,\n            reference: paymentResult.reference,\n            amount: totalAmount,\n            message: 'Payment initiated. Please complete payment on your phone.'\n        });\n    } catch (error) {\n        console.error('Submit vote error:', error);\n        return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n            success: false,\n            error: error.message || 'An error occurred while submitting vote'\n        }, {\n            status: 500\n        });\n    }\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9hcHAvYXBpL3ZvdGUvc3VibWl0L3JvdXRlLnRzIiwibWFwcGluZ3MiOiI7Ozs7Ozs7OztBQUFBOzs7Q0FHQyxHQUV1RDtBQUNkO0FBQ29CO0FBQ1o7QUFPcEI7QUFFdkIsZUFBZVcsS0FBS0MsT0FBb0I7SUFDM0MsSUFBSTtRQUNBLE1BQU1DLE9BQU8sTUFBTUQsUUFBUUUsSUFBSTtRQUMvQixNQUFNLEVBQUVDLFdBQVcsRUFBRUMsU0FBUyxFQUFFQyxXQUFXLEVBQUVDLGFBQWEsRUFBRSxHQUFHTDtRQUUvRCxrQkFBa0I7UUFDbEIsTUFBTU0sa0JBQWtCYixvRUFBbUJBLENBQUNXO1FBQzVDLElBQUksQ0FBQ0UsZ0JBQWdCQyxLQUFLLEVBQUU7WUFDeEIsT0FBT3BCLHFEQUFZQSxDQUFDYyxJQUFJLENBQ3BCO2dCQUFFTyxTQUFTO2dCQUFPQyxPQUFPSCxnQkFBZ0JHLEtBQUs7WUFBQyxHQUMvQztnQkFBRUMsUUFBUTtZQUFJO1FBRXRCO1FBRUEsTUFBTUMsaUJBQWlCaEIsa0VBQWlCQSxDQUFDUTtRQUN6QyxJQUFJLENBQUNRLGVBQWVKLEtBQUssRUFBRTtZQUN2QixPQUFPcEIscURBQVlBLENBQUNjLElBQUksQ0FDcEI7Z0JBQUVPLFNBQVM7Z0JBQU9DLE9BQU9FLGVBQWVGLEtBQUs7WUFBQyxHQUM5QztnQkFBRUMsUUFBUTtZQUFJO1FBRXRCO1FBRUEsTUFBTUUsb0JBQW9CbEIsc0VBQXFCQSxDQUFDVSxhQUFhQztRQUM3RCxJQUFJLENBQUNPLGtCQUFrQkwsS0FBSyxFQUFFO1lBQzFCLE9BQU9wQixxREFBWUEsQ0FBQ2MsSUFBSSxDQUNwQjtnQkFBRU8sU0FBUztnQkFBT0MsT0FBT0csa0JBQWtCSCxLQUFLO1lBQUMsR0FDakQ7Z0JBQUVDLFFBQVE7WUFBSTtRQUV0QjtRQUVBLE1BQU1HLHNCQUFzQixNQUFNakIsd0VBQXVCQSxDQUFDTTtRQUMxRCxJQUFJLENBQUNXLG9CQUFvQk4sS0FBSyxFQUFFO1lBQzVCLE9BQU9wQixxREFBWUEsQ0FBQ2MsSUFBSSxDQUNwQjtnQkFBRU8sU0FBUztnQkFBT0MsT0FBT0ksb0JBQW9CSixLQUFLO1lBQUMsR0FDbkQ7Z0JBQUVDLFFBQVE7WUFBSTtRQUV0QjtRQUVBLDJCQUEyQjtRQUMzQixNQUFNSSxZQUFZQyxTQUFTQyxRQUFRQyxHQUFHLENBQUNDLHNCQUFzQixJQUFJO1FBQ2pFLE1BQU1DLGNBQWNoQixZQUFZVztRQUVoQyw0Q0FBNEM7UUFDNUMsTUFBTU0sV0FBV3ZCLCtEQUFjQSxDQUFDTztRQUNoQyxNQUFNaUIsZ0JBQWdCRCxhQUFhLFFBQVEsUUFBUTtRQUVuRCxpQ0FBaUM7UUFDakMsTUFBTUUsZ0JBQWdCLENBQUMsS0FBSyxFQUFFQyxLQUFLQyxHQUFHLEdBQUcsQ0FBQyxFQUFFQyxLQUFLQyxNQUFNLEdBQUdDLFFBQVEsQ0FBQyxJQUFJQyxNQUFNLENBQUMsR0FBRyxJQUFJO1FBRXJGLCtCQUErQjtRQUMvQixNQUFNQyxnQkFBZ0IsTUFBTXJDLDJEQUFjQSxDQUFDO1lBQ3ZDc0MsUUFBUVg7WUFDUlksU0FBU1Y7WUFDVFcsT0FBTzVCLFlBQVk2QixPQUFPLENBQUMsT0FBTyxJQUFJQSxPQUFPLENBQUMsVUFBVTtZQUN4REMsT0FBT1o7UUFDWDtRQUVBLElBQUksQ0FBQ08sY0FBY3JCLE9BQU8sRUFBRTtZQUN4QixPQUFPckIscURBQVlBLENBQUNjLElBQUksQ0FDcEI7Z0JBQ0lPLFNBQVM7Z0JBQ1RDLE9BQU9vQixjQUFjcEIsS0FBSyxJQUFJO1lBQ2xDLEdBQ0E7Z0JBQUVDLFFBQVE7WUFBSTtRQUV0QjtRQUVBLHdDQUF3QztRQUN4QyxNQUFNeUIsa0JBQWtCO1lBQ3BCQyxJQUFJZDtZQUNKcEI7WUFDQUM7WUFDQUM7WUFDQUM7WUFDQWUsVUFBVUM7WUFDVlMsUUFBUVg7WUFDUmtCLGlCQUFpQlIsY0FBY1MsU0FBUztZQUN4QzVCLFFBQVE7WUFDUjZCLFdBQVdoRCxrRUFBZUE7UUFDOUI7UUFFQSxNQUFNaUQsaUJBQWlCbkQsc0RBQUdBLENBQUNELG1EQUFRQSxFQUFFLENBQUMsYUFBYSxFQUFFa0MsZUFBZTtRQUNwRSxNQUFNaEMsc0RBQUdBLENBQUNrRCxnQkFBZ0JMO1FBRTFCLE9BQU9oRCxxREFBWUEsQ0FBQ2MsSUFBSSxDQUFDO1lBQ3JCTyxTQUFTO1lBQ1RjO1lBQ0FnQixXQUFXVCxjQUFjUyxTQUFTO1lBQ2xDUixRQUFRWDtZQUNSc0IsU0FBUztRQUNiO0lBQ0osRUFBRSxPQUFPaEMsT0FBWTtRQUNqQmlDLFFBQVFqQyxLQUFLLENBQUMsc0JBQXNCQTtRQUNwQyxPQUFPdEIscURBQVlBLENBQUNjLElBQUksQ0FDcEI7WUFDSU8sU0FBUztZQUNUQyxPQUFPQSxNQUFNZ0MsT0FBTyxJQUFJO1FBQzVCLEdBQ0E7WUFBRS9CLFFBQVE7UUFBSTtJQUV0QjtBQUNKIiwic291cmNlcyI6WyIvaG9tZS9hbG1pZ2h0L0RvY3VtZW50cy9OQkRhbmNlQXdhcmQvYXBwL2FwaS92b3RlL3N1Ym1pdC9yb3V0ZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIFN1Ym1pdCBWb3RlIEFQSSBSb3V0ZVxuICogUE9TVCAvYXBpL3ZvdGUvc3VibWl0XG4gKi9cblxuaW1wb3J0IHsgTmV4dFJlcXVlc3QsIE5leHRSZXNwb25zZSB9IGZyb20gJ25leHQvc2VydmVyJztcbmltcG9ydCB7IGRhdGFiYXNlIH0gZnJvbSAnQC9saWIvZmlyZWJhc2UnO1xuaW1wb3J0IHsgcmVmLCBzZXQsIHNlcnZlclRpbWVzdGFtcCB9IGZyb20gJ2ZpcmViYXNlL2RhdGFiYXNlJztcbmltcG9ydCB7IGNvbGxlY3RQYXltZW50IH0gZnJvbSAnLi4vLi4vbGliL21lc29tYic7XG5pbXBvcnQge1xuICAgIHZhbGlkYXRlUGhvbmVOdW1iZXIsXG4gICAgdmFsaWRhdGVQYXltZW50TWV0aG9kLFxuICAgIHZhbGlkYXRlVm90ZUNvdW50LFxuICAgIHZhbGlkYXRlQ2FuZGlkYXRlRXhpc3RzLFxuICAgIGRldGVjdE9wZXJhdG9yLFxufSBmcm9tICcuLi8uLi9saWIvdmFsaWRhdGlvbic7XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBQT1NUKHJlcXVlc3Q6IE5leHRSZXF1ZXN0KSB7XG4gICAgdHJ5IHtcbiAgICAgICAgY29uc3QgYm9keSA9IGF3YWl0IHJlcXVlc3QuanNvbigpO1xuICAgICAgICBjb25zdCB7IGNhbmRpZGF0ZUlkLCB2b3RlQ291bnQsIHBob25lTnVtYmVyLCBwYXltZW50TWV0aG9kIH0gPSBib2R5O1xuXG4gICAgICAgIC8vIFZhbGlkYXRlIGlucHV0c1xuICAgICAgICBjb25zdCBwaG9uZVZhbGlkYXRpb24gPSB2YWxpZGF0ZVBob25lTnVtYmVyKHBob25lTnVtYmVyKTtcbiAgICAgICAgaWYgKCFwaG9uZVZhbGlkYXRpb24udmFsaWQpIHtcbiAgICAgICAgICAgIHJldHVybiBOZXh0UmVzcG9uc2UuanNvbihcbiAgICAgICAgICAgICAgICB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogcGhvbmVWYWxpZGF0aW9uLmVycm9yIH0sXG4gICAgICAgICAgICAgICAgeyBzdGF0dXM6IDQwMCB9XG4gICAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3Qgdm90ZVZhbGlkYXRpb24gPSB2YWxpZGF0ZVZvdGVDb3VudCh2b3RlQ291bnQpO1xuICAgICAgICBpZiAoIXZvdGVWYWxpZGF0aW9uLnZhbGlkKSB7XG4gICAgICAgICAgICByZXR1cm4gTmV4dFJlc3BvbnNlLmpzb24oXG4gICAgICAgICAgICAgICAgeyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IHZvdGVWYWxpZGF0aW9uLmVycm9yIH0sXG4gICAgICAgICAgICAgICAgeyBzdGF0dXM6IDQwMCB9XG4gICAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgcGF5bWVudFZhbGlkYXRpb24gPSB2YWxpZGF0ZVBheW1lbnRNZXRob2QocGhvbmVOdW1iZXIsIHBheW1lbnRNZXRob2QpO1xuICAgICAgICBpZiAoIXBheW1lbnRWYWxpZGF0aW9uLnZhbGlkKSB7XG4gICAgICAgICAgICByZXR1cm4gTmV4dFJlc3BvbnNlLmpzb24oXG4gICAgICAgICAgICAgICAgeyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IHBheW1lbnRWYWxpZGF0aW9uLmVycm9yIH0sXG4gICAgICAgICAgICAgICAgeyBzdGF0dXM6IDQwMCB9XG4gICAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgY2FuZGlkYXRlVmFsaWRhdGlvbiA9IGF3YWl0IHZhbGlkYXRlQ2FuZGlkYXRlRXhpc3RzKGNhbmRpZGF0ZUlkKTtcbiAgICAgICAgaWYgKCFjYW5kaWRhdGVWYWxpZGF0aW9uLnZhbGlkKSB7XG4gICAgICAgICAgICByZXR1cm4gTmV4dFJlc3BvbnNlLmpzb24oXG4gICAgICAgICAgICAgICAgeyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGNhbmRpZGF0ZVZhbGlkYXRpb24uZXJyb3IgfSxcbiAgICAgICAgICAgICAgICB7IHN0YXR1czogNDA0IH1cbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBDYWxjdWxhdGUgcGF5bWVudCBhbW91bnRcbiAgICAgICAgY29uc3Qgdm90ZVByaWNlID0gcGFyc2VJbnQocHJvY2Vzcy5lbnYuTkVYVF9QVUJMSUNfVk9URV9QUklDRSB8fCAnMTAwJyk7XG4gICAgICAgIGNvbnN0IHRvdGFsQW1vdW50ID0gdm90ZUNvdW50ICogdm90ZVByaWNlO1xuXG4gICAgICAgIC8vIERldGVjdCBvcGVyYXRvciBhbmQgbWFwIHRvIE1lc29tYiBzZXJ2aWNlXG4gICAgICAgIGNvbnN0IG9wZXJhdG9yID0gZGV0ZWN0T3BlcmF0b3IocGhvbmVOdW1iZXIpO1xuICAgICAgICBjb25zdCBtZXNvbWJTZXJ2aWNlID0gb3BlcmF0b3IgPT09ICdNVE4nID8gJ01UTicgOiAnT1JBTkdFJztcblxuICAgICAgICAvLyBHZW5lcmF0ZSB1bmlxdWUgdHJhbnNhY3Rpb24gSURcbiAgICAgICAgY29uc3QgdHJhbnNhY3Rpb25JZCA9IGB2b3RlXyR7RGF0ZS5ub3coKX1fJHtNYXRoLnJhbmRvbSgpLnRvU3RyaW5nKDM2KS5zdWJzdHIoMiwgOSl9YDtcblxuICAgICAgICAvLyBJbml0aWF0ZSBwYXltZW50IHdpdGggTWVzb21iXG4gICAgICAgIGNvbnN0IHBheW1lbnRSZXN1bHQgPSBhd2FpdCBjb2xsZWN0UGF5bWVudCh7XG4gICAgICAgICAgICBhbW91bnQ6IHRvdGFsQW1vdW50LFxuICAgICAgICAgICAgc2VydmljZTogbWVzb21iU2VydmljZSxcbiAgICAgICAgICAgIHBheWVyOiBwaG9uZU51bWJlci5yZXBsYWNlKC9cXHMvZywgJycpLnJlcGxhY2UoL15cXCsyMzcvLCAnJyksXG4gICAgICAgICAgICBub25jZTogdHJhbnNhY3Rpb25JZCxcbiAgICAgICAgfSk7XG5cbiAgICAgICAgaWYgKCFwYXltZW50UmVzdWx0LnN1Y2Nlc3MpIHtcbiAgICAgICAgICAgIHJldHVybiBOZXh0UmVzcG9uc2UuanNvbihcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICBlcnJvcjogcGF5bWVudFJlc3VsdC5lcnJvciB8fCAnUGF5bWVudCBpbml0aWF0aW9uIGZhaWxlZCcsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB7IHN0YXR1czogNTAwIH1cbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBDcmVhdGUgdHJhbnNhY3Rpb24gcmVjb3JkIGluIEZpcmViYXNlXG4gICAgICAgIGNvbnN0IHRyYW5zYWN0aW9uRGF0YSA9IHtcbiAgICAgICAgICAgIGlkOiB0cmFuc2FjdGlvbklkLFxuICAgICAgICAgICAgY2FuZGlkYXRlSWQsXG4gICAgICAgICAgICB2b3RlQ291bnQsXG4gICAgICAgICAgICBwaG9uZU51bWJlcixcbiAgICAgICAgICAgIHBheW1lbnRNZXRob2QsXG4gICAgICAgICAgICBvcGVyYXRvcjogbWVzb21iU2VydmljZSxcbiAgICAgICAgICAgIGFtb3VudDogdG90YWxBbW91bnQsXG4gICAgICAgICAgICBtZXNvbWJSZWZlcmVuY2U6IHBheW1lbnRSZXN1bHQucmVmZXJlbmNlLFxuICAgICAgICAgICAgc3RhdHVzOiAncGVuZGluZycsXG4gICAgICAgICAgICBjcmVhdGVkQXQ6IHNlcnZlclRpbWVzdGFtcCgpLFxuICAgICAgICB9O1xuXG4gICAgICAgIGNvbnN0IHRyYW5zYWN0aW9uUmVmID0gcmVmKGRhdGFiYXNlLCBgdHJhbnNhY3Rpb25zLyR7dHJhbnNhY3Rpb25JZH1gKTtcbiAgICAgICAgYXdhaXQgc2V0KHRyYW5zYWN0aW9uUmVmLCB0cmFuc2FjdGlvbkRhdGEpO1xuXG4gICAgICAgIHJldHVybiBOZXh0UmVzcG9uc2UuanNvbih7XG4gICAgICAgICAgICBzdWNjZXNzOiB0cnVlLFxuICAgICAgICAgICAgdHJhbnNhY3Rpb25JZCxcbiAgICAgICAgICAgIHJlZmVyZW5jZTogcGF5bWVudFJlc3VsdC5yZWZlcmVuY2UsXG4gICAgICAgICAgICBhbW91bnQ6IHRvdGFsQW1vdW50LFxuICAgICAgICAgICAgbWVzc2FnZTogJ1BheW1lbnQgaW5pdGlhdGVkLiBQbGVhc2UgY29tcGxldGUgcGF5bWVudCBvbiB5b3VyIHBob25lLicsXG4gICAgICAgIH0pO1xuICAgIH0gY2F0Y2ggKGVycm9yOiBhbnkpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcignU3VibWl0IHZvdGUgZXJyb3I6JywgZXJyb3IpO1xuICAgICAgICByZXR1cm4gTmV4dFJlc3BvbnNlLmpzb24oXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgc3VjY2VzczogZmFsc2UsXG4gICAgICAgICAgICAgICAgZXJyb3I6IGVycm9yLm1lc3NhZ2UgfHwgJ0FuIGVycm9yIG9jY3VycmVkIHdoaWxlIHN1Ym1pdHRpbmcgdm90ZScsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgeyBzdGF0dXM6IDUwMCB9XG4gICAgICAgICk7XG4gICAgfVxufVxuIl0sIm5hbWVzIjpbIk5leHRSZXNwb25zZSIsImRhdGFiYXNlIiwicmVmIiwic2V0Iiwic2VydmVyVGltZXN0YW1wIiwiY29sbGVjdFBheW1lbnQiLCJ2YWxpZGF0ZVBob25lTnVtYmVyIiwidmFsaWRhdGVQYXltZW50TWV0aG9kIiwidmFsaWRhdGVWb3RlQ291bnQiLCJ2YWxpZGF0ZUNhbmRpZGF0ZUV4aXN0cyIsImRldGVjdE9wZXJhdG9yIiwiUE9TVCIsInJlcXVlc3QiLCJib2R5IiwianNvbiIsImNhbmRpZGF0ZUlkIiwidm90ZUNvdW50IiwicGhvbmVOdW1iZXIiLCJwYXltZW50TWV0aG9kIiwicGhvbmVWYWxpZGF0aW9uIiwidmFsaWQiLCJzdWNjZXNzIiwiZXJyb3IiLCJzdGF0dXMiLCJ2b3RlVmFsaWRhdGlvbiIsInBheW1lbnRWYWxpZGF0aW9uIiwiY2FuZGlkYXRlVmFsaWRhdGlvbiIsInZvdGVQcmljZSIsInBhcnNlSW50IiwicHJvY2VzcyIsImVudiIsIk5FWFRfUFVCTElDX1ZPVEVfUFJJQ0UiLCJ0b3RhbEFtb3VudCIsIm9wZXJhdG9yIiwibWVzb21iU2VydmljZSIsInRyYW5zYWN0aW9uSWQiLCJEYXRlIiwibm93IiwiTWF0aCIsInJhbmRvbSIsInRvU3RyaW5nIiwic3Vic3RyIiwicGF5bWVudFJlc3VsdCIsImFtb3VudCIsInNlcnZpY2UiLCJwYXllciIsInJlcGxhY2UiLCJub25jZSIsInRyYW5zYWN0aW9uRGF0YSIsImlkIiwibWVzb21iUmVmZXJlbmNlIiwicmVmZXJlbmNlIiwiY3JlYXRlZEF0IiwidHJhbnNhY3Rpb25SZWYiLCJtZXNzYWdlIiwiY29uc29sZSJdLCJpZ25vcmVMaXN0IjpbXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(rsc)/./app/api/vote/submit/route.ts\n");

/***/ }),

/***/ "(rsc)/./lib/firebase.ts":
/*!*************************!*\
  !*** ./lib/firebase.ts ***!
  \*************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   auth: () => (/* binding */ auth),\n/* harmony export */   database: () => (/* binding */ database),\n/* harmony export */   functions: () => (/* binding */ functions)\n/* harmony export */ });\n/* harmony import */ var firebase_app__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! firebase/app */ \"(rsc)/./node_modules/.pnpm/firebase@10.14.1/node_modules/firebase/app/dist/index.mjs\");\n/* harmony import */ var firebase_auth__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! firebase/auth */ \"(rsc)/./node_modules/.pnpm/firebase@10.14.1/node_modules/firebase/auth/dist/index.mjs\");\n/* harmony import */ var firebase_database__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! firebase/database */ \"(rsc)/./node_modules/.pnpm/firebase@10.14.1/node_modules/firebase/database/dist/index.mjs\");\n/* harmony import */ var firebase_analytics__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! firebase/analytics */ \"(rsc)/./node_modules/.pnpm/firebase@10.14.1/node_modules/firebase/analytics/dist/index.mjs\");\n/* harmony import */ var firebase_functions__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! firebase/functions */ \"(rsc)/./node_modules/.pnpm/firebase@10.14.1/node_modules/firebase/functions/dist/index.mjs\");\n\n\n\n\n\nconst firebaseConfig = {\n    apiKey: \"AIzaSyDW7wbUtGivk_uosXs_gZ_fKAAozVXEk7c\",\n    authDomain: \"project-5583295336911612869.firebaseapp.com\",\n    databaseURL: \"https://project-5583295336911612869-default-rtdb.europe-west1.firebasedatabase.app\",\n    projectId: \"project-5583295336911612869\",\n    storageBucket: \"project-5583295336911612869.firebasestorage.app\",\n    messagingSenderId: \"816715936754\",\n    appId: \"1:816715936754:web:28d23b835fad9e6b33b16b\",\n    measurementId: \"G-95FMJ6SP7W\"\n};\nconst app = (0,firebase_app__WEBPACK_IMPORTED_MODULE_0__.initializeApp)(firebaseConfig);\nconst auth = (0,firebase_auth__WEBPACK_IMPORTED_MODULE_1__.getAuth)(app);\nconst database = (0,firebase_database__WEBPACK_IMPORTED_MODULE_2__.getDatabase)(app);\nconst functions = (0,firebase_functions__WEBPACK_IMPORTED_MODULE_4__.getFunctions)(app, 'europe-west1') // Use same region as database\n;\n// Connect to emulator in development\nif (false) {}\n// Initialize Analytics (optional)\nif (false) {}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9saWIvZmlyZWJhc2UudHMiLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFBNEM7QUFDTDtBQUNRO0FBQ0U7QUFDMEI7QUFFM0UsTUFBTUssaUJBQWlCO0lBQ3JCQyxRQUFRO0lBQ1JDLFlBQVk7SUFDWkMsYUFBYTtJQUNiQyxXQUFXO0lBQ1hDLGVBQWU7SUFDZkMsbUJBQW1CO0lBQ25CQyxPQUFPO0lBQ1BDLGVBQWU7QUFDakI7QUFFQSxNQUFNQyxNQUFNZCwyREFBYUEsQ0FBQ0s7QUFDbkIsTUFBTVUsT0FBT2Qsc0RBQU9BLENBQUNhLEtBQUk7QUFDekIsTUFBTUUsV0FBV2QsOERBQVdBLENBQUNZLEtBQUk7QUFDakMsTUFBTUcsWUFBWWIsZ0VBQVlBLENBQUNVLEtBQUssZ0JBQWdCLDhCQUE4QjtDQUEvQjtBQUUxRCxxQ0FBcUM7QUFDckMsSUFBSUksS0FBdUUsRUFBRSxFQUc1RTtBQUVELGtDQUFrQztBQUNsQyxJQUFJLEtBQTZCLEVBQUUsRUFFbEMiLCJzb3VyY2VzIjpbIi9ob21lL2FsbWlnaHQvRG9jdW1lbnRzL05CRGFuY2VBd2FyZC9saWIvZmlyZWJhc2UudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgaW5pdGlhbGl6ZUFwcCB9IGZyb20gJ2ZpcmViYXNlL2FwcCdcbmltcG9ydCB7IGdldEF1dGggfSBmcm9tICdmaXJlYmFzZS9hdXRoJ1xuaW1wb3J0IHsgZ2V0RGF0YWJhc2UgfSBmcm9tICdmaXJlYmFzZS9kYXRhYmFzZSdcbmltcG9ydCB7IGdldEFuYWx5dGljcyB9IGZyb20gJ2ZpcmViYXNlL2FuYWx5dGljcydcbmltcG9ydCB7IGdldEZ1bmN0aW9ucywgY29ubmVjdEZ1bmN0aW9uc0VtdWxhdG9yIH0gZnJvbSAnZmlyZWJhc2UvZnVuY3Rpb25zJ1xuXG5jb25zdCBmaXJlYmFzZUNvbmZpZyA9IHtcbiAgYXBpS2V5OiBcIkFJemFTeURXN3diVXRHaXZrX3Vvc1hzX2daX2ZLQUFvelZYRWs3Y1wiLFxuICBhdXRoRG9tYWluOiBcInByb2plY3QtNTU4MzI5NTMzNjkxMTYxMjg2OS5maXJlYmFzZWFwcC5jb21cIixcbiAgZGF0YWJhc2VVUkw6IFwiaHR0cHM6Ly9wcm9qZWN0LTU1ODMyOTUzMzY5MTE2MTI4NjktZGVmYXVsdC1ydGRiLmV1cm9wZS13ZXN0MS5maXJlYmFzZWRhdGFiYXNlLmFwcFwiLFxuICBwcm9qZWN0SWQ6IFwicHJvamVjdC01NTgzMjk1MzM2OTExNjEyODY5XCIsXG4gIHN0b3JhZ2VCdWNrZXQ6IFwicHJvamVjdC01NTgzMjk1MzM2OTExNjEyODY5LmZpcmViYXNlc3RvcmFnZS5hcHBcIixcbiAgbWVzc2FnaW5nU2VuZGVySWQ6IFwiODE2NzE1OTM2NzU0XCIsXG4gIGFwcElkOiBcIjE6ODE2NzE1OTM2NzU0OndlYjoyOGQyM2I4MzVmYWQ5ZTZiMzNiMTZiXCIsXG4gIG1lYXN1cmVtZW50SWQ6IFwiRy05NUZNSjZTUDdXXCJcbn1cblxuY29uc3QgYXBwID0gaW5pdGlhbGl6ZUFwcChmaXJlYmFzZUNvbmZpZylcbmV4cG9ydCBjb25zdCBhdXRoID0gZ2V0QXV0aChhcHApXG5leHBvcnQgY29uc3QgZGF0YWJhc2UgPSBnZXREYXRhYmFzZShhcHApXG5leHBvcnQgY29uc3QgZnVuY3Rpb25zID0gZ2V0RnVuY3Rpb25zKGFwcCwgJ2V1cm9wZS13ZXN0MScpIC8vIFVzZSBzYW1lIHJlZ2lvbiBhcyBkYXRhYmFzZVxuXG4vLyBDb25uZWN0IHRvIGVtdWxhdG9yIGluIGRldmVsb3BtZW50XG5pZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgPT09ICdkZXZlbG9wbWVudCcgJiYgdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgLy8gVW5jb21tZW50IHRvIHVzZSBlbXVsYXRvcjpcbiAgLy8gY29ubmVjdEZ1bmN0aW9uc0VtdWxhdG9yKGZ1bmN0aW9ucywgJ2xvY2FsaG9zdCcsIDUwMDEpXG59XG5cbi8vIEluaXRpYWxpemUgQW5hbHl0aWNzIChvcHRpb25hbClcbmlmICh0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJykge1xuICBnZXRBbmFseXRpY3MoYXBwKVxufVxuIl0sIm5hbWVzIjpbImluaXRpYWxpemVBcHAiLCJnZXRBdXRoIiwiZ2V0RGF0YWJhc2UiLCJnZXRBbmFseXRpY3MiLCJnZXRGdW5jdGlvbnMiLCJmaXJlYmFzZUNvbmZpZyIsImFwaUtleSIsImF1dGhEb21haW4iLCJkYXRhYmFzZVVSTCIsInByb2plY3RJZCIsInN0b3JhZ2VCdWNrZXQiLCJtZXNzYWdpbmdTZW5kZXJJZCIsImFwcElkIiwibWVhc3VyZW1lbnRJZCIsImFwcCIsImF1dGgiLCJkYXRhYmFzZSIsImZ1bmN0aW9ucyIsInByb2Nlc3MiXSwiaWdub3JlTGlzdCI6W10sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(rsc)/./lib/firebase.ts\n");

/***/ }),

/***/ "(rsc)/./node_modules/.pnpm/next@15.2.4_react-dom@19.2.0_react@19.2.0__react@19.2.0/node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fvote%2Fsubmit%2Froute&page=%2Fapi%2Fvote%2Fsubmit%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fvote%2Fsubmit%2Froute.ts&appDir=%2Fhome%2Falmight%2FDocuments%2FNBDanceAward%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2Fhome%2Falmight%2FDocuments%2FNBDanceAward&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!":
/*!********************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/.pnpm/next@15.2.4_react-dom@19.2.0_react@19.2.0__react@19.2.0/node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fvote%2Fsubmit%2Froute&page=%2Fapi%2Fvote%2Fsubmit%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fvote%2Fsubmit%2Froute.ts&appDir=%2Fhome%2Falmight%2FDocuments%2FNBDanceAward%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2Fhome%2Falmight%2FDocuments%2FNBDanceAward&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D! ***!
  \********************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   patchFetch: () => (/* binding */ patchFetch),\n/* harmony export */   routeModule: () => (/* binding */ routeModule),\n/* harmony export */   serverHooks: () => (/* binding */ serverHooks),\n/* harmony export */   workAsyncStorage: () => (/* binding */ workAsyncStorage),\n/* harmony export */   workUnitAsyncStorage: () => (/* binding */ workUnitAsyncStorage)\n/* harmony export */ });\n/* harmony import */ var next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/dist/server/route-modules/app-route/module.compiled */ \"(rsc)/./node_modules/.pnpm/next@15.2.4_react-dom@19.2.0_react@19.2.0__react@19.2.0/node_modules/next/dist/server/route-modules/app-route/module.compiled.js\");\n/* harmony import */ var next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var next_dist_server_route_kind__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next/dist/server/route-kind */ \"(rsc)/./node_modules/.pnpm/next@15.2.4_react-dom@19.2.0_react@19.2.0__react@19.2.0/node_modules/next/dist/server/route-kind.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! next/dist/server/lib/patch-fetch */ \"(rsc)/./node_modules/.pnpm/next@15.2.4_react-dom@19.2.0_react@19.2.0__react@19.2.0/node_modules/next/dist/server/lib/patch-fetch.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var _home_almight_Documents_NBDanceAward_app_api_vote_submit_route_ts__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./app/api/vote/submit/route.ts */ \"(rsc)/./app/api/vote/submit/route.ts\");\n\n\n\n\n// We inject the nextConfigOutput here so that we can use them in the route\n// module.\nconst nextConfigOutput = \"\"\nconst routeModule = new next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__.AppRouteRouteModule({\n    definition: {\n        kind: next_dist_server_route_kind__WEBPACK_IMPORTED_MODULE_1__.RouteKind.APP_ROUTE,\n        page: \"/api/vote/submit/route\",\n        pathname: \"/api/vote/submit\",\n        filename: \"route\",\n        bundlePath: \"app/api/vote/submit/route\"\n    },\n    resolvedPagePath: \"/home/almight/Documents/NBDanceAward/app/api/vote/submit/route.ts\",\n    nextConfigOutput,\n    userland: _home_almight_Documents_NBDanceAward_app_api_vote_submit_route_ts__WEBPACK_IMPORTED_MODULE_3__\n});\n// Pull out the exports that we need to expose from the module. This should\n// be eliminated when we've moved the other routes to the new format. These\n// are used to hook into the route.\nconst { workAsyncStorage, workUnitAsyncStorage, serverHooks } = routeModule;\nfunction patchFetch() {\n    return (0,next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__.patchFetch)({\n        workAsyncStorage,\n        workUnitAsyncStorage\n    });\n}\n\n\n//# sourceMappingURL=app-route.js.map//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9ub2RlX21vZHVsZXMvLnBucG0vbmV4dEAxNS4yLjRfcmVhY3QtZG9tQDE5LjIuMF9yZWFjdEAxOS4yLjBfX3JlYWN0QDE5LjIuMC9ub2RlX21vZHVsZXMvbmV4dC9kaXN0L2J1aWxkL3dlYnBhY2svbG9hZGVycy9uZXh0LWFwcC1sb2FkZXIvaW5kZXguanM/bmFtZT1hcHAlMkZhcGklMkZ2b3RlJTJGc3VibWl0JTJGcm91dGUmcGFnZT0lMkZhcGklMkZ2b3RlJTJGc3VibWl0JTJGcm91dGUmYXBwUGF0aHM9JnBhZ2VQYXRoPXByaXZhdGUtbmV4dC1hcHAtZGlyJTJGYXBpJTJGdm90ZSUyRnN1Ym1pdCUyRnJvdXRlLnRzJmFwcERpcj0lMkZob21lJTJGYWxtaWdodCUyRkRvY3VtZW50cyUyRk5CRGFuY2VBd2FyZCUyRmFwcCZwYWdlRXh0ZW5zaW9ucz10c3gmcGFnZUV4dGVuc2lvbnM9dHMmcGFnZUV4dGVuc2lvbnM9anN4JnBhZ2VFeHRlbnNpb25zPWpzJnJvb3REaXI9JTJGaG9tZSUyRmFsbWlnaHQlMkZEb2N1bWVudHMlMkZOQkRhbmNlQXdhcmQmaXNEZXY9dHJ1ZSZ0c2NvbmZpZ1BhdGg9dHNjb25maWcuanNvbiZiYXNlUGF0aD0mYXNzZXRQcmVmaXg9Jm5leHRDb25maWdPdXRwdXQ9JnByZWZlcnJlZFJlZ2lvbj0mbWlkZGxld2FyZUNvbmZpZz1lMzAlM0QhIiwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7O0FBQStGO0FBQ3ZDO0FBQ3FCO0FBQ2lCO0FBQzlGO0FBQ0E7QUFDQTtBQUNBLHdCQUF3Qix5R0FBbUI7QUFDM0M7QUFDQSxjQUFjLGtFQUFTO0FBQ3ZCO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQSxZQUFZO0FBQ1osQ0FBQztBQUNEO0FBQ0E7QUFDQTtBQUNBLFFBQVEsc0RBQXNEO0FBQzlEO0FBQ0EsV0FBVyw0RUFBVztBQUN0QjtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQzBGOztBQUUxRiIsInNvdXJjZXMiOlsiIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEFwcFJvdXRlUm91dGVNb2R1bGUgfSBmcm9tIFwibmV4dC9kaXN0L3NlcnZlci9yb3V0ZS1tb2R1bGVzL2FwcC1yb3V0ZS9tb2R1bGUuY29tcGlsZWRcIjtcbmltcG9ydCB7IFJvdXRlS2luZCB9IGZyb20gXCJuZXh0L2Rpc3Qvc2VydmVyL3JvdXRlLWtpbmRcIjtcbmltcG9ydCB7IHBhdGNoRmV0Y2ggYXMgX3BhdGNoRmV0Y2ggfSBmcm9tIFwibmV4dC9kaXN0L3NlcnZlci9saWIvcGF0Y2gtZmV0Y2hcIjtcbmltcG9ydCAqIGFzIHVzZXJsYW5kIGZyb20gXCIvaG9tZS9hbG1pZ2h0L0RvY3VtZW50cy9OQkRhbmNlQXdhcmQvYXBwL2FwaS92b3RlL3N1Ym1pdC9yb3V0ZS50c1wiO1xuLy8gV2UgaW5qZWN0IHRoZSBuZXh0Q29uZmlnT3V0cHV0IGhlcmUgc28gdGhhdCB3ZSBjYW4gdXNlIHRoZW0gaW4gdGhlIHJvdXRlXG4vLyBtb2R1bGUuXG5jb25zdCBuZXh0Q29uZmlnT3V0cHV0ID0gXCJcIlxuY29uc3Qgcm91dGVNb2R1bGUgPSBuZXcgQXBwUm91dGVSb3V0ZU1vZHVsZSh7XG4gICAgZGVmaW5pdGlvbjoge1xuICAgICAgICBraW5kOiBSb3V0ZUtpbmQuQVBQX1JPVVRFLFxuICAgICAgICBwYWdlOiBcIi9hcGkvdm90ZS9zdWJtaXQvcm91dGVcIixcbiAgICAgICAgcGF0aG5hbWU6IFwiL2FwaS92b3RlL3N1Ym1pdFwiLFxuICAgICAgICBmaWxlbmFtZTogXCJyb3V0ZVwiLFxuICAgICAgICBidW5kbGVQYXRoOiBcImFwcC9hcGkvdm90ZS9zdWJtaXQvcm91dGVcIlxuICAgIH0sXG4gICAgcmVzb2x2ZWRQYWdlUGF0aDogXCIvaG9tZS9hbG1pZ2h0L0RvY3VtZW50cy9OQkRhbmNlQXdhcmQvYXBwL2FwaS92b3RlL3N1Ym1pdC9yb3V0ZS50c1wiLFxuICAgIG5leHRDb25maWdPdXRwdXQsXG4gICAgdXNlcmxhbmRcbn0pO1xuLy8gUHVsbCBvdXQgdGhlIGV4cG9ydHMgdGhhdCB3ZSBuZWVkIHRvIGV4cG9zZSBmcm9tIHRoZSBtb2R1bGUuIFRoaXMgc2hvdWxkXG4vLyBiZSBlbGltaW5hdGVkIHdoZW4gd2UndmUgbW92ZWQgdGhlIG90aGVyIHJvdXRlcyB0byB0aGUgbmV3IGZvcm1hdC4gVGhlc2Vcbi8vIGFyZSB1c2VkIHRvIGhvb2sgaW50byB0aGUgcm91dGUuXG5jb25zdCB7IHdvcmtBc3luY1N0b3JhZ2UsIHdvcmtVbml0QXN5bmNTdG9yYWdlLCBzZXJ2ZXJIb29rcyB9ID0gcm91dGVNb2R1bGU7XG5mdW5jdGlvbiBwYXRjaEZldGNoKCkge1xuICAgIHJldHVybiBfcGF0Y2hGZXRjaCh7XG4gICAgICAgIHdvcmtBc3luY1N0b3JhZ2UsXG4gICAgICAgIHdvcmtVbml0QXN5bmNTdG9yYWdlXG4gICAgfSk7XG59XG5leHBvcnQgeyByb3V0ZU1vZHVsZSwgd29ya0FzeW5jU3RvcmFnZSwgd29ya1VuaXRBc3luY1N0b3JhZ2UsIHNlcnZlckhvb2tzLCBwYXRjaEZldGNoLCAgfTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9YXBwLXJvdXRlLmpzLm1hcCJdLCJuYW1lcyI6W10sImlnbm9yZUxpc3QiOltdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(rsc)/./node_modules/.pnpm/next@15.2.4_react-dom@19.2.0_react@19.2.0__react@19.2.0/node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fvote%2Fsubmit%2Froute&page=%2Fapi%2Fvote%2Fsubmit%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fvote%2Fsubmit%2Froute.ts&appDir=%2Fhome%2Falmight%2FDocuments%2FNBDanceAward%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2Fhome%2Falmight%2FDocuments%2FNBDanceAward&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!\n");

/***/ }),

/***/ "(rsc)/./node_modules/.pnpm/next@15.2.4_react-dom@19.2.0_react@19.2.0__react@19.2.0/node_modules/next/dist/build/webpack/loaders/next-flight-client-entry-loader.js?server=true!":
/*!*********************************************************************************************************************************************************************************!*\
  !*** ./node_modules/.pnpm/next@15.2.4_react-dom@19.2.0_react@19.2.0__react@19.2.0/node_modules/next/dist/build/webpack/loaders/next-flight-client-entry-loader.js?server=true! ***!
  \*********************************************************************************************************************************************************************************/
/***/ (() => {



/***/ }),

/***/ "(ssr)/./node_modules/.pnpm/next@15.2.4_react-dom@19.2.0_react@19.2.0__react@19.2.0/node_modules/next/dist/build/webpack/loaders/next-flight-client-entry-loader.js?server=true!":
/*!*********************************************************************************************************************************************************************************!*\
  !*** ./node_modules/.pnpm/next@15.2.4_react-dom@19.2.0_react@19.2.0__react@19.2.0/node_modules/next/dist/build/webpack/loaders/next-flight-client-entry-loader.js?server=true! ***!
  \*********************************************************************************************************************************************************************************/
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
var __webpack_exports__ = __webpack_require__.X(0, ["vendor-chunks/next@15.2.4_react-dom@19.2.0_react@19.2.0__react@19.2.0","vendor-chunks/undici@6.19.7","vendor-chunks/@firebase+database@1.0.8","vendor-chunks/@firebase+auth@1.7.9_@firebase+app@0.10.13","vendor-chunks/@firebase+util@1.10.0","vendor-chunks/@firebase+analytics@0.10.8_@firebase+app@0.10.13","vendor-chunks/websocket-driver@0.7.4","vendor-chunks/@firebase+installations@0.6.9_@firebase+app@0.10.13","vendor-chunks/@firebase+app@0.10.13","vendor-chunks/@firebase+functions@0.11.8_@firebase+app@0.10.13","vendor-chunks/tslib@2.8.1","vendor-chunks/@firebase+component@0.6.9","vendor-chunks/websocket-extensions@0.1.4","vendor-chunks/faye-websocket@0.11.4","vendor-chunks/http-parser-js@0.5.10","vendor-chunks/idb@7.1.1","vendor-chunks/@firebase+logger@0.4.2","vendor-chunks/safe-buffer@5.2.1","vendor-chunks/firebase@10.14.1","vendor-chunks/crypto-js@4.2.0","vendor-chunks/@hachther+mesomb@2.0.1","vendor-chunks/whatwg-url@5.0.0","vendor-chunks/tr46@0.0.3","vendor-chunks/node-fetch@2.7.0","vendor-chunks/webidl-conversions@3.0.1","vendor-chunks/url-parse@1.5.10","vendor-chunks/requires-port@1.0.0","vendor-chunks/querystringify@2.2.0","vendor-chunks/isomorphic-fetch@3.0.0"], () => (__webpack_exec__("(rsc)/./node_modules/.pnpm/next@15.2.4_react-dom@19.2.0_react@19.2.0__react@19.2.0/node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fvote%2Fsubmit%2Froute&page=%2Fapi%2Fvote%2Fsubmit%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fvote%2Fsubmit%2Froute.ts&appDir=%2Fhome%2Falmight%2FDocuments%2FNBDanceAward%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2Fhome%2Falmight%2FDocuments%2FNBDanceAward&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!")));
module.exports = __webpack_exports__;

})();