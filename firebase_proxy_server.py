#!/usr/bin/env python3
"""
Firebase Proxy Server for Orange Network Compatibility
This Flask server proxies Firebase Realtime Database requests
to bypass network restrictions on Orange and similar networks.

Usage:
    python firebase_proxy_server.py

The server will run on http://localhost:5000
Configure your app to use: http://localhost:5000/api/firebase
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import firebase_admin
from firebase_admin import credentials, db
import os
import json
from datetime import datetime
import logging

# ============================================================================
# CONFIGURATION
# ============================================================================

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Firebase Configuration
FIREBASE_DB_URL = "https://project-5583295336911612869-default-rtdb.europe-west1.firebasedatabase.app"

# Initialize Firebase (expects serviceAccount.json in project root)
try:
    if not firebase_admin._apps:
        cred = credentials.Certificate("serviceAccount.json")
        firebase_admin.initialize_app(cred, {
            "databaseURL": FIREBASE_DB_URL
        })
    logger.info("✅ Firebase initialized successfully")
except Exception as e:
    logger.error(f"❌ Firebase initialization failed: {e}")
    logger.warning("⚠️  Running in demo mode - Firebase not available")

# ============================================================================
# ROUTES
# ============================================================================

@app.route("/health", methods=["GET"])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "ok",
        "service": "Firebase Proxy Server",
        "timestamp": datetime.now().isoformat()
    }), 200


@app.route("/api/firebase/candidates", methods=["GET"])
def get_candidates():
    """Get all candidates from Firebase"""
    try:
        ref = db.reference("/candidates")
        data = ref.get()
        
        if not data:
            return jsonify({
                "success": True,
                "candidates": {},
                "message": "No candidates found"
            }), 200
        
        logger.info(f"✅ Retrieved {len(data)} candidates")
        return jsonify({
            "success": True,
            "candidates": data,
            "count": len(data)
        }), 200
        
    except Exception as e:
        logger.error(f"❌ Error fetching candidates: {e}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


@app.route("/api/firebase/categories", methods=["GET"])
def get_categories():
    """Get all categories from Firebase"""
    try:
        ref = db.reference("/categories")
        data = ref.get()
        
        if not data:
            return jsonify({
                "success": True,
                "categories": {},
                "message": "No categories found"
            }), 200
        
        logger.info(f"✅ Retrieved {len(data)} categories")
        return jsonify({
            "success": True,
            "categories": data,
            "count": len(data)
        }), 200
        
    except Exception as e:
        logger.error(f"❌ Error fetching categories: {e}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


@app.route("/api/firebase/votes", methods=["GET"])
def get_votes():
    """Get all votes from Firebase"""
    try:
        ref = db.reference("/votes")
        data = ref.get()
        
        if not data:
            return jsonify({
                "success": True,
                "votes": {},
                "message": "No votes found"
            }), 200
        
        logger.info(f"✅ Retrieved {len(data)} votes")
        return jsonify({
            "success": True,
            "votes": data,
            "count": len(data)
        }), 200
        
    except Exception as e:
        logger.error(f"❌ Error fetching votes: {e}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


@app.route("/api/firebase/users", methods=["GET"])
def get_users():
    """Get all users from Firebase"""
    try:
        ref = db.reference("/users")
        data = ref.get()
        
        if not data:
            return jsonify({
                "success": True,
                "users": {},
                "message": "No users found"
            }), 200
        
        logger.info(f"✅ Retrieved {len(data)} users")
        return jsonify({
            "success": True,
            "users": data,
            "count": len(data)
        }), 200
        
    except Exception as e:
        logger.error(f"❌ Error fetching users: {e}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


@app.route("/api/firebase/candidates/<candidate_id>", methods=["GET"])
def get_candidate(candidate_id):
    """Get a specific candidate"""
    try:
        ref = db.reference(f"/candidates/{candidate_id}")
        data = ref.get()
        
        if not data:
            return jsonify({
                "success": False,
                "error": "Candidate not found"
            }), 404
        
        logger.info(f"✅ Retrieved candidate: {candidate_id}")
        return jsonify({
            "success": True,
            "candidate": data
        }), 200
        
    except Exception as e:
        logger.error(f"❌ Error fetching candidate: {e}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


@app.route("/api/firebase/votes", methods=["POST"])
def submit_vote():
    """Submit a new vote"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['userId', 'candidateId', 'voteCount']
        if not all(field in data for field in required_fields):
            return jsonify({
                "success": False,
                "error": "Missing required fields: userId, candidateId, voteCount"
            }), 400
        
        # Create vote record
        vote_id = f"{data['userId']}_{int(datetime.now().timestamp() * 1000)}"
        vote_data = {
            **data,
            "status": "completed",
            "createdAt": datetime.now().isoformat()
        }
        
        # Write to Firebase
        ref = db.reference(f"/votes/{vote_id}")
        ref.set(vote_data)
        
        # Update candidate vote count
        candidate_ref = db.reference(f"/candidates/{data['candidateId']}/votes")
        current_votes = candidate_ref.get() or 0
        candidate_ref.set(current_votes + data['voteCount'])
        
        # Update user vote count
        user_ref = db.reference(f"/users/{data['userId']}/totalVotes")
        current_user_votes = user_ref.get() or 0
        user_ref.set(current_user_votes + data['voteCount'])
        
        logger.info(f"✅ Vote submitted: {vote_id}")
        return jsonify({
            "success": True,
            "voteId": vote_id,
            "message": "Vote submitted successfully"
        }), 201
        
    except Exception as e:
        logger.error(f"❌ Error submitting vote: {e}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


@app.route("/api/firebase/users", methods=["POST"])
def create_user():
    """Create a new user"""
    try:
        data = request.get_json()
        user_id = data.get('userId')
        
        if not user_id:
            return jsonify({
                "success": False,
                "error": "userId is required"
            }), 400
        
        user_data = {
            **data,
            "createdAt": datetime.now().isoformat(),
            "totalVotes": 0
        }
        
        ref = db.reference(f"/users/{user_id}")
        ref.set(user_data)
        
        logger.info(f"✅ User created: {user_id}")
        return jsonify({
            "success": True,
            "userId": user_id,
            "message": "User created successfully"
        }), 201
        
    except Exception as e:
        logger.error(f"❌ Error creating user: {e}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


@app.route("/api/firebase/users/<user_id>", methods=["GET"])
def get_user(user_id):
    """Get a specific user"""
    try:
        ref = db.reference(f"/users/{user_id}")
        data = ref.get()
        
        if not data:
            return jsonify({
                "success": False,
                "error": "User not found"
            }), 404
        
        logger.info(f"✅ Retrieved user: {user_id}")
        return jsonify({
            "success": True,
            "user": data
        }), 200
        
    except Exception as e:
        logger.error(f"❌ Error fetching user: {e}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


@app.route("/api/firebase/users/<user_id>", methods=["PUT"])
def update_user(user_id):
    """Update a user"""
    try:
        data = request.get_json()
        
        ref = db.reference(f"/users/{user_id}")
        ref.update({
            **data,
            "updatedAt": datetime.now().isoformat()
        })
        
        logger.info(f"✅ User updated: {user_id}")
        return jsonify({
            "success": True,
            "userId": user_id,
            "message": "User updated successfully"
        }), 200
        
    except Exception as e:
        logger.error(f"❌ Error updating user: {e}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


@app.route("/api/firebase/leaderboard", methods=["GET"])
def get_leaderboard():
    """Get leaderboard (top candidates by votes)"""
    try:
        limit = request.args.get('limit', default=10, type=int)
        
        ref = db.reference("/candidates")
        candidates = ref.get()
        
        if not candidates:
            return jsonify({
                "success": True,
                "leaderboard": [],
                "message": "No candidates found"
            }), 200
        
        # Sort by votes descending and limit
        leaderboard = sorted(
            candidates.items(),
            key=lambda x: x[1].get('votes', 0),
            reverse=True
        )[:limit]
        
        result = [
            {**data, 'id': cid}
            for cid, data in leaderboard
        ]
        
        logger.info(f"✅ Retrieved leaderboard (top {limit})")
        return jsonify({
            "success": True,
            "leaderboard": result,
            "count": len(result)
        }), 200
        
    except Exception as e:
        logger.error(f"❌ Error fetching leaderboard: {e}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


@app.errorhandler(404)
def not_found(error):
    """Handle 404 errors"""
    return jsonify({
        "success": False,
        "error": "Endpoint not found"
    }), 404


@app.errorhandler(500)
def internal_error(error):
    """Handle 500 errors"""
    return jsonify({
        "success": False,
        "error": "Internal server error"
    }), 500


# ============================================================================
# MAIN
# ============================================================================

if __name__ == "__main__":
    print("""
╔════════════════════════════════════════════════════════════════╗
║          Firebase Proxy Server for Orange Network             ║
╚════════════════════════════════════════════════════════════════╝

📍 Server running on: http://localhost:5000

🔗 Available Endpoints:
   GET  /health                          - Health check
   GET  /api/firebase/candidates         - Get all candidates
   GET  /api/firebase/categories         - Get all categories
   GET  /api/firebase/votes              - Get all votes
   GET  /api/firebase/users              - Get all users
   GET  /api/firebase/candidates/<id>    - Get specific candidate
   GET  /api/firebase/users/<id>         - Get specific user
   GET  /api/firebase/leaderboard        - Get leaderboard
   POST /api/firebase/votes              - Submit vote
   POST /api/firebase/users              - Create user
   PUT  /api/firebase/users/<id>         - Update user

⚙️  Configuration:
   Firebase URL: {FIREBASE_DB_URL}
   CORS: Enabled
   
🚀 To use in your app:
   Set NEXT_PUBLIC_FIREBASE_PROXY_URL=http://localhost:5000
   
📝 Logs will appear below:
""".format(FIREBASE_DB_URL=FIREBASE_DB_URL))
    
    app.run(host="0.0.0.0", port=5000, debug=True)
