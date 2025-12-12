#!/usr/bin/env python3
"""
Vote Reconciliation Script
==========================
This script verifies that all completed transactions have their votes properly added.
It checks for:
1. Transactions where payment succeeded but votes weren't added
2. Mismatches between expected and actual vote counts
3. Creates a report of any issues found

Run: python scripts/reconcile_votes.py
"""

import json
import requests
from datetime import datetime
from typing import Dict, List, Any

# Firebase REST API configuration
FIREBASE_DB_URL = "https://project-5583295336911612869-default-rtdb.europe-west1.firebasedatabase.app"

def fetch_all_transactions() -> Dict[str, Any]:
    """Fetch all transactions from Firebase"""
    url = f"{FIREBASE_DB_URL}/transactions.json"
    response = requests.get(url)
    
    if response.status_code != 200:
        print(f"❌ Failed to fetch transactions: {response.status_code}")
        return {}
    
    return response.json() or {}

def fetch_all_candidates() -> Dict[str, Any]:
    """Fetch all candidates from Firebase"""
    url = f"{FIREBASE_DB_URL}/candidates.json"
    response = requests.get(url)
    
    if response.status_code != 200:
        print(f"❌ Failed to fetch candidates: {response.status_code}")
        return {}
    
    return response.json() or {}

def verify_vote_updates(transactions: Dict[str, Any]) -> List[Dict]:
    """
    Verify that completed transactions have consistent vote updates.
    Returns list of issues found.
    """
    issues = []
    
    for tx_id, tx in transactions.items():
        if tx.get('status') != 'completed':
            continue
            
        votes_before = tx.get('votesBeforeUpdate')
        votes_after = tx.get('votesAfterUpdate')
        vote_count = tx.get('voteCount', 0)
        votes_processed = tx.get('votesProcessed', False)
        
        # Check 1: Votes should be marked as processed
        if not votes_processed:
            issues.append({
                'type': 'VOTES_NOT_PROCESSED',
                'transaction_id': tx_id,
                'candidate_id': tx.get('candidateId'),
                'vote_count': vote_count,
                'message': 'Transaction completed but votesProcessed is false'
            })
            continue
        
        # Check 2: Vote counts should be recorded
        if votes_before is None or votes_after is None:
            issues.append({
                'type': 'MISSING_VOTE_COUNTS',
                'transaction_id': tx_id,
                'candidate_id': tx.get('candidateId'),
                'vote_count': vote_count,
                'message': 'Missing votesBeforeUpdate or votesAfterUpdate'
            })
            continue
        
        # Check 3: Vote difference should match voteCount
        actual_diff = votes_after - votes_before
        if actual_diff != vote_count:
            issues.append({
                'type': 'VOTE_COUNT_MISMATCH',
                'transaction_id': tx_id,
                'candidate_id': tx.get('candidateId'),
                'expected': vote_count,
                'actual': actual_diff,
                'message': f'Expected {vote_count} votes added, but {actual_diff} were added'
            })
    
    return issues

def verify_candidate_totals(transactions: Dict[str, Any], candidates: Dict[str, Any]) -> List[Dict]:
    """
    Verify that candidate vote totals match the sum of all completed transactions.
    """
    issues = []
    
    # Calculate expected votes per candidate from transactions
    expected_votes = {}
    for tx_id, tx in transactions.items():
        if tx.get('status') == 'completed' and tx.get('votesProcessed', False):
            candidate_id = tx.get('candidateId')
            vote_count = tx.get('voteCount', 0)
            expected_votes[candidate_id] = expected_votes.get(candidate_id, 0) + vote_count
    
    # Compare with actual candidate votes
    for candidate_id, expected in expected_votes.items():
        if candidate_id not in candidates:
            issues.append({
                'type': 'CANDIDATE_NOT_FOUND',
                'candidate_id': candidate_id,
                'expected_votes': expected,
                'message': f'Candidate {candidate_id} not found but has {expected} expected votes'
            })
            continue
        
        actual = candidates[candidate_id].get('votes', 0)
        if actual < expected:
            issues.append({
                'type': 'VOTES_MISSING',
                'candidate_id': candidate_id,
                'candidate_name': candidates[candidate_id].get('name', 'Unknown'),
                'expected': expected,
                'actual': actual,
                'difference': expected - actual,
                'message': f'Candidate has {actual} votes but should have at least {expected}'
            })
    
    return issues

def find_stuck_transactions(transactions: Dict[str, Any]) -> List[Dict]:
    """
    Find transactions that are stuck in pending state for too long.
    """
    issues = []
    now = datetime.now().timestamp() * 1000  # milliseconds
    
    for tx_id, tx in transactions.items():
        status = tx.get('status')
        created_at = tx.get('createdAt', 0)
        
        if status in ['pending', 'creating']:
            age_minutes = (now - created_at) / (1000 * 60)
            
            if age_minutes > 10:
                issues.append({
                    'type': 'STUCK_PENDING',
                    'transaction_id': tx_id,
                    'candidate_id': tx.get('candidateId'),
                    'vote_count': tx.get('voteCount', 0),
                    'age_minutes': round(age_minutes, 1),
                    'mesomb_reference': tx.get('mesombReference'),
                    'message': f'Transaction stuck in {status} for {round(age_minutes, 1)} minutes'
                })
    
    return issues

def main():
    print("=" * 60)
    print("🔍 NB Dance Award - Vote Reconciliation Report")
    print(f"📅 Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 60)
    print()
    
    # Fetch data
    print("📊 Fetching data from Firebase...")
    transactions = fetch_all_transactions()
    candidates = fetch_all_candidates()
    
    print(f"   Found {len(transactions)} transactions")
    print(f"   Found {len(candidates)} candidates")
    print()
    
    # Run checks
    all_issues = []
    
    print("1️⃣ Checking vote update consistency...")
    vote_issues = verify_vote_updates(transactions)
    all_issues.extend(vote_issues)
    print(f"   Found {len(vote_issues)} issues")
    
    print("2️⃣ Checking candidate vote totals...")
    total_issues = verify_candidate_totals(transactions, candidates)
    all_issues.extend(total_issues)
    print(f"   Found {len(total_issues)} issues")
    
    print("3️⃣ Checking for stuck transactions...")
    stuck_issues = find_stuck_transactions(transactions)
    all_issues.extend(stuck_issues)
    print(f"   Found {len(stuck_issues)} issues")
    
    print()
    print("=" * 60)
    
    if not all_issues:
        print("✅ ALL CHECKS PASSED - No issues found!")
    else:
        print(f"⚠️  ISSUES FOUND: {len(all_issues)}")
        print()
        
        # Group by type
        by_type = {}
        for issue in all_issues:
            issue_type = issue['type']
            if issue_type not in by_type:
                by_type[issue_type] = []
            by_type[issue_type].append(issue)
        
        for issue_type, issues in by_type.items():
            print(f"\n### {issue_type} ({len(issues)} issues)")
            for issue in issues[:5]:  # Show first 5 of each type
                print(f"   - {issue['message']}")
                if 'transaction_id' in issue:
                    print(f"     Transaction: {issue['transaction_id']}")
                if 'candidate_id' in issue:
                    print(f"     Candidate: {issue['candidate_id']}")
            if len(issues) > 5:
                print(f"   ... and {len(issues) - 5} more")
    
    print()
    print("=" * 60)
    
    # Save report
    report = {
        'generated_at': datetime.now().isoformat(),
        'transaction_count': len(transactions),
        'candidate_count': len(candidates),
        'issues': all_issues,
        'summary': {
            'total_issues': len(all_issues),
            'by_type': {k: len(v) for k, v in by_type.items()} if all_issues else {}
        }
    }
    
    with open('reconciliation_report.json', 'w') as f:
        json.dump(report, f, indent=2)
    
    print(f"📄 Full report saved to: reconciliation_report.json")
    
    return len(all_issues) == 0

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)
